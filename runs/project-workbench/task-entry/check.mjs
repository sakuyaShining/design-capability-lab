import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const stage = process.argv[2];
assert.ok(['begin', 'resume', 'inspect'].includes(stage), 'Use begin, resume or inspect.');
const port = process.env.DCL_TASK_ENTRY_PORT || 5187;
const origin = `http://127.0.0.1:${port}`;
const base = origin + '/applications/project-console/workbench/';
const task = base + 'task-entry.html?task=';
const run = process.env.DCL_TASK_ENTRY_RUN
  ? pathToFileURL(resolve(process.env.DCL_TASK_ENTRY_RUN) + sep)
  : new URL('.', import.meta.url);
const observationFile = new URL('observed.json', run);
const recordFile = new URL('record.json', run);
const evidenceFile = new URL('browser-evidence.json', run);
const probeFile = new URL('guard-probe.json', run);
const draft = '已从任务入口核对 app/page.tsx 的任务行。「已完成」分支会把目标任务改回「待开始」，只在完成未完成项时检查其前置。下次核对 app/api/state/route.ts、app/validate.ts 与 app/agent.ts，并用一对已完成的前置和下游对照实际守卫。';
const playwright = process.env.DCL_PLAYWRIGHT || 'C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(playwright));
const server = spawn(process.execPath, [fileURLToPath(new URL('../../../scripts/serve-task-entry.mjs', import.meta.url))], {
  windowsHide: true, stdio: ['ignore', 'pipe', 'inherit'],
});
const serverClosed = once(server, 'exit');
let browser;

try {
  const ready = await Promise.race([
    once(server.stdout, 'data').then(([line]) => String(line)),
    serverClosed.then(([code]) => { throw Error('Preview process exited with code ' + code); }),
  ]);
  assert.match(ready, /Task entry:/);
  const executablePath = process.env.DCL_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const id = name => page.locator(`#${name}`);
  const phase = () => id('entry-phase').innerText();
  const disk = () => JSON.parse(readFileSync(recordFile, 'utf8'));
  const report = stage === 'begin'
    ? { browser: browser.version(), runs: [] }
    : JSON.parse(readFileSync(evidenceFile, 'utf8'));
  const observed = stage === 'begin'
    ? { resume: [] } : JSON.parse(readFileSync(observationFile, 'utf8'));
  const entryEvidence = { stage, serverPid: server.pid, startedAt: new Date().toISOString() };
  const note = (state, facts) => observed.resume.push({ state, facts });
  const saveJson = (url, value) => writeFileSync(url, JSON.stringify(value, null, 2) + '\n');
  const screen = name => page.screenshot({ path: fileURLToPath(new URL(name, run)) });
  const open = async (code, anchor = '') => {
    await page.goto(task + code + anchor);
    await id('entry').waitFor();
    assert.equal(await id('entry-id').innerText(), code);
  };
  const visitSource = async (from, path, pattern) => {
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      id(from).getByRole('link', { name: path, exact: true }).click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    assert.match(await popup.locator('body').innerText(), pattern);
    const url = popup.url();
    await popup.close();
    return url;
  };

  if (stage === 'begin') {
    await page.goto(base + 'index.html');
    await page.getByRole('link', { name: '续做试点' }).click();
    await id('entry').waitFor();
    assert.equal(page.url(), task + 'PC-01');
    assert.equal(await phase(), '待开始');
    entryEvidence.stableUrl = page.url();
    entryEvidence.input = await visitSource('entry-sources', 'app/page.tsx', /切换完成状态/);
    note('todo', { phase: await phase(), sourceOpened: true });
    await open('PC-02');
    assert.match(await id('entry-wait').innerText(), /等 PC-01 提交核对结论/);
    assert.ok(await id('entry-result').isHidden());
    note('todo', { downstreamWaiting: true, resultCount: 0 });
    await open('PC-01');
    await id('start-entry').click();
    await id('entry-form').waitFor();
    assert.equal(await phase(), '进行中');
    note('active', { phase: await phase() });
    await id('entry-draft').fill(draft);
    await id('save-entry').click();
    await page.getByText('进展已保存。关闭后可从同一地址接续。').waitFor();
    assert.equal(disk().draft, draft);
    assert.equal(disk().result, null);
    note('active', { phase: await phase(), draftPersisted: true, resultCount: 0 });
    await screen('01-saved.png');
    await page.close();
    entryEvidence.pageClosed = page.isClosed();
    entryEvidence.savedVersion = disk().version;
  }

  if (stage === 'resume') {
    assert.ok(report.runs.at(-1).pageClosed);
    assert.notEqual(server.pid, report.runs.at(-1).serverPid);
    await open('PC-01');
    assert.equal(page.url(), report.runs.at(-1).stableUrl);
    assert.equal(await phase(), '进行中');
    assert.equal(await id('entry-draft').inputValue(), draft);
    await screen('02-resumed.png');
    note('active', { phase: await phase(), draftRestored: true, sameTask: true });
    entryEvidence.resumedVersion = disk().version;
    entryEvidence.inputs = [
      await visitSource('entry-sources', 'app/api/state/route.ts', /dataSchema.safeParse/),
      await visitSource('entry-sources', 'app/validate.ts', /依赖不能形成循环/),
      await visitSource('entry-sources', 'app/agent.ts', /所有前置任务已完成/),
    ];
    const probe = JSON.parse(execFileSync(process.execPath, [
      fileURLToPath(new URL('probe-reopen.mjs', import.meta.url)),
    ], { encoding: 'utf8' }));
    saveJson(probeFile, probe);
    assert.match(await id('source-revision').innerText(), new RegExp(probe.revision.slice(0, 7)));
    const finding = `Web 与 Agent 的重开规则不一致。产品源码 ${probe.revision.slice(0, 7)} 的隔离测试中，有已完成下游时，Web PUT 仍返回 ${probe.results[0].web.http} 并保存「前置待开始、下游已完成」。Agent upsert_task 拒绝重开，写入 ${probe.results[0].agent.writes} 次。把下游改为「进行中」后，两条路径都允许重开前置。源码依据为 Web 任务行的状态切换、Web PUT 的结构校验及 Agent 的全局完成约束。运行使用内存数据库替身。`;
    await id('entry-finding').fill(finding);
    await id('entry-form').getByRole('button', { name: '提交结论并完成' }).click();
    await page.getByText('请填写核对结论，并选择实际用到的源码。').waitFor();
    assert.equal(await id('entry-finding').inputValue(), finding);
    note('active', { phase: await phase(), inputPreserved: true, resultCount: Number(!!disk().result) });
    for (const input of await id('entry-evidence').getByRole('checkbox').all()) await input.check();
    await id('entry-form').getByRole('button', { name: '提交结论并完成' }).click();
    await id('entry-result').waitFor();
    assert.equal(await phase(), '已完成');
    assert.equal(disk().result.finding, finding);
    const resultId = await id('entry-result').getAttribute('data-result-id');
    note('done', { phase: await phase(), resultId, resultCount: Number(!!disk().result) });
    entryEvidence.resultId = resultId;
    await id('downstream').click();
    await id('entry-result').waitFor();
    assert.equal(await id('entry-id').innerText(), 'PC-02');
    assert.equal(await phase(), '待开始');
    assert.equal(await id('entry-result-title').innerText(), 'PC-01 的核对结论');
    assert.equal(await id('result-text').innerText(), finding);
    assert.equal(await id('entry-result').getAttribute('data-result-id'), resultId);
    entryEvidence.downstreamSource = await visitSource('result-sources', 'app/agent.ts', /所有前置任务已完成/);
    await screen('03-downstream.png');
    await id('upstream').click();
    await id('entry-result').waitFor();
    assert.equal(await id('entry-id').innerText(), 'PC-01');
    assert.equal(await id('result-text').innerText(), finding);
    note('done', { resultId, downstreamSourceOpened: true, roundTrip: true });
  }

  if (stage === 'inspect') {
    const saved = disk();
    assert.equal(saved.phase, 'done');
    await open('PC-02');
    assert.equal(await id('result-text').innerText(), saved.result.finding);
    assert.equal(await id('entry-result-title').innerText(), 'PC-01 的核对结论');
    assert.equal(await id('result-sources').getByRole('link').count(), 4);
    await screen('03-downstream.png');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    entryEvidence.mobile = { viewport: page.viewportSize(), resultId: saved.result.id, overflow: false };
    await screen('04-mobile.png');
  }

  assert.deepEqual(errors, []);
  entryEvidence.endedAt = new Date().toISOString();
  report.runs = report.runs.filter(run => run.stage !== stage);
  report.runs.push(entryEvidence);
  saveJson(evidenceFile, report);
  saveJson(observationFile, observed);
  console.log(`Task entry ${stage} verified.`);
} finally {
  await browser?.close();
  server.kill();
  await serverClosed;
}
