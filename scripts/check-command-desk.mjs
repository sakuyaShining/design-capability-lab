import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const app = 'applications/project-console/command-desk';
const output = process.argv[2] || 'runs/project-console-command-desk';
const url = pathToFileURL(path.resolve(app, 'index.html')).href;
const playwright = process.env.DCL_PLAYWRIGHT || 'C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const edge = process.env.DCL_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const { chromium } = await import(pathToFileURL(playwright));
const browser = await chromium.launch({ headless: true, executablePath: edge });
fs.mkdirSync(output, { recursive: true });

const sources = Object.fromEntries(['index.html', 'style.css', 'app.js', 'model.js', 'data.js', 'behavior.json']
  .map(file => [file, createHash('sha256').update(fs.readFileSync(path.join(app, file))).digest('hex')]));
const report = { run: '2026-11-22', revision: 'command-desk-0.1', browser: browser.version(), node: process.version, sources, checks: [], layouts: [], pageErrors: [], network: [] };
const observed = { 'finish-unlocks': [], 'waiting-to-start': [], 'commit-idea': [], 'release-block': [] };

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, offline: true, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('file:')) report.network.push(request.url()); });
  const $ = id => page.locator('#' + id);
  const tab = id => page.locator('[data-open="' + id + '"]').first();
  const open = async (search = '') => {
    await page.goto(url + search);
    await $('task-title').waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  const fresh = () => open();
  const shot = name => page.screenshot({ path: path.join(output, name) });
  const primary = () => $('primary-action').click();
  const submit = () => page.locator('#transaction-form [type=submit]').click();
  const capture = async scenario => {
    const dossier = $('dossier');
    const raw = await dossier.getAttribute('data-state');
    const state = raw === 'idea' ? 'uncommitted' : raw === 'held' ? 'blocked' : raw;
    const code = await dossier.getAttribute('data-code');
    const phase = { todo: '待开始', active: '进行中', done: '已完成' }[await dossier.getAttribute('data-phase')];
    const pending = Number(await dossier.getAttribute('data-pending'));
    observed[scenario].push({ state, facts: { code, phase, pending } });
  };

  // Contract: finish unlocks the downstream task, then it can run.
  await fresh();
  await capture('finish-unlocks');
  const before = await $('console').innerText();
  assert.match(before, /记录完成/);
  assert.match(before, /T-09 前置满足，可推进/);
  await shot('desktop.png');
  await primary();
  assert.match(await page.locator('.state-change').innerText(), /进行中.*已完成/s);
  assert.equal(await page.locator('.dialog-conditions').innerText(), '当前条件：已承诺 · 前置 2/2 · 无人工阻塞');
  await page.locator('#transaction-form textarea').fill('样例：可复用模块与不适用部分已写入对照表。');
  await shot('dialog.png');
  await submit();
  await capture('finish-unlocks');
  assert.match(await $('receipt').innerText(), /T-04：已完成。\s*T-09 现在可推进/);
  await shot('done.png');
  await tab('assets').click();
  await capture('finish-unlocks');
  assert.match(await $('console').innerText(), /确认开始/);
  await primary();
  await submit();
  await capture('finish-unlocks');
  await primary();
  await page.locator('#transaction-form textarea').fill('样例：模块清单与来源边界已整理。');
  await submit();
  await capture('finish-unlocks');
  report.checks.push('Finishing T-04 exposes and unlocks T-09; the downstream task can start and finish through the same guidance.');

  // Contract: waiting resolves through a real prerequisite.
  await fresh();
  await tab('demo').click();
  await capture('waiting-to-start');
  const waiting = await $('console').innerText();
  assert.match(waiting, /不可推进/);
  assert.equal(await $('primary-action').count(), 0);
  assert.match(waiting, /等待 T-02 完成/);
  await shot('waiting.png');
  await page.locator('.gate-list [data-follow="scheme"]').click();
  await capture('waiting-to-start');
  assert.equal(await $('task-title').innerText(), '写下最小方案与可检验的验收标准');
  await page.locator('.path-back').click();
  assert.equal(await $('task-title').innerText(), '复核最小方案并准备一次演示');
  await page.locator('.gate-list [data-follow="scheme"]').click();
  await primary();
  await submit();
  await capture('waiting-to-start');
  report.checks.push('A waiting task names its blocking prerequisite, cannot start, follows the real dependency and returns with context.');

  // Contract: an uncommitted idea stays out of execution until committed.
  await fresh();
  await tab('ai').click();
  await capture('commit-idea');
  assert.match(await $('console').innerText(), /承诺任务/);
  assert.match(await $('console').innerText(), /尚未进入本周承诺/);
  await shot('idea.png');
  await primary();
  await submit();
  await capture('commit-idea');
  assert.match(await $('console').innerText(), /确认开始/);
  await primary();
  await submit();
  await capture('commit-idea');
  report.checks.push('An uncommitted idea is visibly separated from execution; committing it enables the start action.');

  // Contract: manual block keeps its stage and history.
  await fresh();
  await tab('fpga').click();
  await capture('release-block');
  const blocked = await $('console').innerText();
  assert.match(blocked, /解除阻塞/);
  assert.match(blocked, /恢复进行中/);
  assert.match(blocked, /人工阻塞未解除/);
  await shot('blocked.png');
  await primary();
  await page.locator('#transaction-form textarea').fill('负责人已确认费用上限。');
  await submit();
  await capture('release-block');
  assert.match(await $('record-list').innerText(), /原阻塞.*费用上限/s);
  assert.match(await $('record-list').innerText(), /负责人已确认费用上限/);
  report.checks.push('A manual block states its stage, releases back to it, and keeps the reason plus release basis in the record.');

  // Queue scope, filters and project filtering.
  await fresh();
  assert.equal(await $('queue-count').innerText(), '8 / 8');
  assert.equal(await page.locator('.tab').count(), 8);
  await page.locator('[data-scope="all"]').click();
  assert.equal(await $('queue-count').innerText(), '9 / 9');
  await tab('op').click();
  assert.match(await $('task-kicker').innerText(), /2027-01-10/);
  await page.locator('[data-scope="week"]').click();
  assert.match(await $('queue-note').innerText(), /不在筛选范围/);
  await page.locator('[data-filter="all"]').click();
  await page.locator('[data-project="soc"]').click();
  assert.deepEqual(await page.locator('.tab .tab-code').allTextContents(), ['T-03', 'T-04', 'T-09']);
  await page.locator('[data-project="soc"]').click();
  await page.locator('[data-filter="ready"]').click();
  assert.deepEqual(await page.locator('.tab .tab-code').allTextContents(), ['T-02', 'T-04']);
  await page.locator('[data-filter="all"]').click();
  report.checks.push('This-week scope, state filters and project selection constrain the queue without losing the open task.');

  // Keyboard: open the transaction with Enter and return focus on Escape.
  await tab('scheme').click();
  await $('primary-action').focus();
  await page.keyboard.press('Enter');
  assert.equal(await $('transaction').evaluate(dialog => dialog.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await $('transaction').evaluate(dialog => dialog.open), false);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'primary-action');
  report.checks.push('The primary transition opens with Enter, closes with Escape and restores focus to its trigger.');

  // Ten layout and theme combinations, including the action dock.
  const sizes = [[1440, 900], [1280, 800], [1024, 800], [768, 900], [390, 844], [360, 800]];
  for (const theme of ['dark', 'light']) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(60);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
      const dock = await $('mobile-dock').isVisible();
      assert.ok(overflow, 'horizontal overflow at ' + width);
      assert.equal(dock, width <= 1080, 'dock visibility at ' + width);
      report.layouts.push({ width, height, theme, overflow, dock });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await fresh();
  await page.locator('#theme').click();
  await page.waitForTimeout(120);
  await shot('light.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await fresh();
  const visibleTab = await page.evaluate(() => {
    const list = document.getElementById('queue-list');
    const active = list.querySelector('[aria-current="true"]');
    return active.offsetLeft >= list.scrollLeft && active.offsetLeft + active.clientWidth <= list.scrollLeft + list.clientWidth + 1;
  });
  assert.ok(visibleTab);
  await shot('mobile.png');
  report.checks.push('Ten viewport and theme combinations avoid horizontal overflow; the dock appears from 1080px down and the current tab is scrolled into view.');

  assert.deepEqual(report.pageErrors, []);
  assert.deepEqual(report.network, []);
  const eol = String.fromCharCode(10);
  fs.writeFileSync(path.join(output, 'observed.json'), JSON.stringify(observed, null, 2) + eol);
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + eol);
  console.log('PASS: ' + report.checks.length + ' checks, ' + report.layouts.length + ' layouts.');
} finally {
  await browser.close();
}
