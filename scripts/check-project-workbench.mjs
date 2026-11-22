import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const output = process.argv[2] || 'runs/project-workbench/state-clarity';
const entry = 'applications/project-console/workbench/index.html';
const url = pathToFileURL(path.resolve(entry)).href;
const playwright = process.env.DCL_PLAYWRIGHT || 'C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const executablePath = process.env.DCL_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const { chromium } = await import(pathToFileURL(playwright));
const browser = await chromium.launch({ headless: true, executablePath });
fs.mkdirSync(output, { recursive: true });
const report = {
  run: '2026-11-15',
  revision: 'state-clarity',
  engine: browser.version(),
  checks: [], layouts: [], pageErrors: [], network: [],
  sources: Object.fromEntries([
    entry,
    'applications/project-console/workbench/app.js',
    'applications/project-console/workbench/style.css',
    'applications/project-console/workbench/behavior.json',
    'applications/project-console/prototypes/data.js',
    'applications/project-console/state-study/model.js',
  ].map(file => [file, createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),
};
const observed = { 'unlock-direction': [], 'release-with-pending': [] };

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, offline: true, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('file:')) report.network.push(request.url()); });
  const $ = id => page.locator(`#${id}`);
  const data = (key, val) => page.locator(`[data-${key}="${val}"]`);
  const open = async (search = '') => {
    await page.goto(url + search);
    await $('current-task').waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  const screenshot = name => page.screenshot({ path: path.join(output, name) });
  const active = () => page.evaluate(() => document.activeElement.id);

  await open();
  assert.match(await $('current-task').textContent(), /写下最小方案/);
  assert.equal(await page.locator('.segments .unmet').count(), 2);
  assert.equal(await page.locator('.segments .met').count(), 1);
  assert.deepEqual(await $('totals').locator('strong').allTextContents(), ['08', '01', '05']);
  assert.equal(await $('queue-list').locator('li').count(), 8);
  const queueArea = await $('queue').boundingBox();
  const inspection = await page.locator('.inspection').boundingBox();
  const overlap = queueArea.x + queueArea.width - inspection.x;
  assert.ok(overlap > 0 && inspection.y < queueArea.y);
  await assert.doesNotReject(() => data('open', 'rules').click({ trial: true }));
  await page.mouse.move(0, 0);
  assert.equal(await $('scope-name').textContent(), '全部项目');
  assert.match(await $('origin-name').textContent(), /^T-15/);
  report.desktopOverlap = Math.round(overlap);
  assert.equal(await page.evaluate(() => document.fonts.check('750 16px Saira')), true);
  await screenshot('desktop.png');
  await $('queue').screenshot({ path: path.join(output, 'queue.png') });
  assert.deepEqual(await page.locator('.done-tasks [data-open]').evaluateAll(rows =>
    rows.map(row => row.dataset.open)), ['socbase', 'archive']);
  const background = locator => locator.evaluate(row => getComputedStyle(row).backgroundColor);
  assert.equal(await background(data('open', 'rules')), 'rgba(0, 0, 0, 0)');
  assert.equal(await background(data('open', 'archive')), 'rgba(0, 0, 0, 0)');
  assert.notEqual(await background(data('open', 'scheme')), 'rgba(0, 0, 0, 0)');
  await data('filter', 'done').click();
  assert.equal(await page.locator('.open-tasks').count(), 0);
  assert.equal(await $('queue-count').textContent(), '显示 2 / 8');
  await data('open', 'archive').focus();
  await page.keyboard.press('Enter');
  assert.match(await $('current-task').textContent(), /整理旧工程/);
  assert.equal(await data('open', 'archive').getAttribute('aria-current'), 'true');
  assert.notEqual(await background(data('open', 'archive')), 'rgba(0, 0, 0, 0)');
  await open();
  report.checks.push('Open rows use the page surface, selection uses a solid surface, and compact completed rows stay selectable by keyboard.');
  await data('quick', 'ready').click();
  assert.equal(await active(), 'queue-title');
  assert.equal(await $('queue-list').locator('[data-open]').count(), 1);
  assert.equal(await $('queue-list').locator('[data-open]').getAttribute('data-open'), 'rules');
  await data('filter', 'all').click();
  report.checks.push('Initial queue and real 1/3 prerequisite meter. Global ready count opens its actual queue while preserving the selected task.');

  await data('jump', 'dependency-title').click();
  assert.equal(await active(), 'dependency-title');
  await $('project-filter').selectOption('ic');
  await data('filter', 'waiting').click();
  const queueRow = await data('open', 'scheme').elementHandle();
  const originalRowBox = await queueRow.boundingBox();
  await data('follow', 'reuse').click();
  assert.match(await $('current-task').textContent(), /共享成果/);
  assert.equal(await $('scope-name').textContent(), '集创赛');
  assert.match(await $('origin-name').textContent(), /^T-15/);
  assert.equal(await page.locator('.focus-inner').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.match(await $('outside').textContent(), /T-14/);
  assert.match(await page.locator('.path').innerText(), /原任务 T-15.*依赖.*T-14/s);
  assert.equal(await active(), 'current-task');
  await data('return', 0).click();
  assert.equal(await queueRow.evaluate(row => row.isConnected), true);
  assert.deepEqual(await queueRow.boundingBox(), originalRowBox);
  assert.equal(await $('project-filter').inputValue(), 'ic');
  assert.equal(await data('filter', 'waiting').getAttribute('aria-pressed'), 'true');
  assert.equal(await $('outside').isHidden(), true);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.follow), 'reuse');
  report.checks.push('Cross-project drill-down and return preserve original filters and restore source focus.');

  await data('follow', 'direction').focus();
  await page.keyboard.press('Enter');
  await data('follow', 'mentor').click();
  assert.match(await page.locator('.path').innerText(), /T-15.*依赖.*T-12.*依赖.*T-11/s);
  assert.match(await page.locator('.next-step').textContent(), /等待校内负责人/);
  assert.match(await $('dependencies').textContent(), /没有直接前置/);
  await screenshot('blocked.png');
  await data('return', 0).click();
  await page.locator('#completed-deps summary').click();
  await data('follow', 'socbase').click();
  assert.match(await $('current-task').textContent(), /SoC 最小计算闭环/);
  await data('return', 0).click();
  assert.equal(await $('completed-deps').getAttribute('open'), '');
  report.checks.push('Multi-level edges and manual blocker; returning from a completed prerequisite reopens its source group.');

  assert.deepEqual(await page.locator('.project-priority').allTextContents(), ['01', '02', '03', '04', '05']);
  await data('project', 'soc').click();
  assert.equal(await $('project-filter').inputValue(), 'soc');
  assert.equal(await active(), 'queue-title');
  assert.equal(await $('queue-list').locator('[data-open]').count(), 3);
  await $('project-filter').selectOption('ai');
  await page.locator('[data-clear]').click();
  assert.equal(await $('project-filter').inputValue(), 'all');
  assert.equal(await $('queue-list').locator('[data-open]').count(), 8);
  assert.match(await $('current-task').textContent(), /写下最小方案/);
  report.checks.push('Portfolio sorts by priority, project jump filters the queue, and empty results can be cleared.');

  await open('?scenario=clear');
  assert.equal(await page.locator('.segments .met').count(), 3);
  assert.equal(await $('execution-phase').innerText(), '待开始');
  assert.equal(await $('next-title').innerText(), '可以开始');
  await open('?scenario=missing');
  assert.match(await $('dependencies').innerText(), /缺失记录：missing-record/);
  assert.equal(await data('follow', 'missing-record').count(), 0);
  await open('?scenario=cycle');
  assert.match(await $('dependencies').innerText(), /依赖链存在循环/);
  await data('follow', 'direction').click();
  assert.match(await $('dependencies').innerText(), /循环指回路径/);
  assert.equal(await data('follow', 'scheme').count(), 0);
  report.checks.push('All prerequisites met does not mark the task done. Missing records and cyclic back-edges cannot be opened.');

  async function capture(scenario) {
    const phase = await $('execution-phase').innerText();
    const next = await $('next-title').innerText();
    const state = {
      '当前不能开始': 'waiting', '可以开始': 'ready', '可以记录完成': 'active',
      '已记录完成': 'done', '先解除人工阻塞': 'blocked', '暂不能记录完成': 'active-waiting',
    }[next];
    assert.ok(state, next);
    const code = await page.locator('.task-meta .code').innerText();
    const pending = await page.locator('.segments .unmet').count();
    observed[scenario].push({ state, facts: { phase, code, pending } });
  }
  const submit = () => $('task-change').locator('[type=submit]').click();
  const change = name => data('change', name).click();
  const finish = async note => {
    await change('finish');
    await $('task-change').locator('textarea').fill(note);
    await submit();
  };
  const start = async () => { await change('start'); await submit(); };
  await open();
  await capture('unlock-direction');
  await data('follow', 'direction').click();
  assert.equal(await $('current-task').innerText(), '确定竞赛主选与备选方向');
  assert.match(await page.locator('.relation').innerText(), /T-15.*直接前置/);
  assert.match(await page.locator('.next-step').innerText(), /等待 T-10、T-11 完成/);
  await screenshot('direction.png');
  await capture('unlock-direction');
  await data('suggest', 'rules').click();
  await capture('unlock-direction');
  await change('start');
  await page.keyboard.press('Escape');
  assert.equal(await $('task-dialog').isHidden(), true);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.change), 'start');
  await capture('unlock-direction');
  await start();
  await capture('unlock-direction');
  await change('finish');
  await submit();
  assert.match(await $('change-error').innerText(), /实际结果/);
  await screenshot('finish-validation.png');
  await capture('unlock-direction');
  await $('task-change').locator('textarea').fill('已核对样例规则与资格清单。');
  await submit();
  await capture('unlock-direction');
  await data('return', 1).click();
  await capture('unlock-direction');
  await data('follow', 'mentor').click();
  await capture('unlock-direction');
  await change('release');
  await submit();
  assert.match(await $('change-error').innerText(), /阻塞前的执行阶段/);
  await capture('unlock-direction');
  await $('task-change').locator('select').selectOption('todo');
  await submit();
  await capture('unlock-direction');
  await start();
  await capture('unlock-direction');
  await finish('已核对负责人及办理条件。');
  await capture('unlock-direction');
  assert.match(await $('task-receipt').innerText(), /T-12 现在可推进/);
  await data('return', 1).click();
  await capture('unlock-direction');
  await screenshot('direction-ready.png');
  await start();
  await capture('unlock-direction');
  await finish('样例：主选方向 A，备选方向 B。');
  await capture('unlock-direction');
  await data('return', 0).click();
  await capture('unlock-direction');
  await data('follow', 'reuse').click();
  await capture('unlock-direction');
  await finish('样例：已核对共享模块及适用边界。');
  await capture('unlock-direction');
  assert.match(await $('task-receipt').innerText(), /T-15 现在可推进/);
  await data('return', 0).click();
  await capture('unlock-direction');
  await start();
  await capture('unlock-direction');
  report.checks.push('End-to-end: T-10 and T-11 enable T-12; T-12 and T-14 enable T-15. Viewing, cancellation and validation do not advance execution.');

  await open('?scenario=blocked');
  await capture('release-with-pending');
  await data('follow', 'direction').click();
  await capture('release-with-pending');
  await change('release');
  await submit();
  await capture('release-with-pending');
  assert.match(await $('task-receipt').innerText(), /人工阻塞已解除.*T-10、T-11/s);
  assert.equal(await data('change', 'finish').count(), 0);
  await screenshot('released-waiting.png');
  await change('block');
  await $('task-change').locator('textarea').fill('仍待补齐材料');
  await submit();
  assert.equal(await $('execution-phase').innerText(), '进行中');
  assert.equal(await $('next-title').innerText(), '先解除人工阻塞');
  await open('?scenario=downstream');
  await data('open', 'direction').click();
  assert.match(await page.locator('.next-step').innerText(), /已完成的 T-15 依赖此任务/);
  assert.equal(await data('change', 'reopen').count(), 0);
  await data('open', 'archive').click();
  await change('reopen');
  await submit();
  assert.equal(await $('execution-phase').innerText(), '待开始');
  report.checks.push('Releasing preserves the original phase and remaining prerequisites. Reopening is constrained by completed dependents.');

  for (const width of [360, 390, 768, 1024, 1440]) {
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 844 });
      await open(`?theme=${theme}&cut=wide`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 0, `Overflow at ${width} ${theme}`);
      const clipped = await page.locator('button').evaluateAll(buttons => buttons.filter(button => button.scrollWidth > button.clientWidth).map(button => button.innerText));
      assert.deepEqual(clipped, []);
      report.layouts.push({ width, theme, cut: 'wide', overflow, clipped });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await open();
  const firstFollow = await data('follow', 'direction').boundingBox();
  assert.ok(firstFollow.height >= 44 && firstFollow.y + firstFollow.height <= 844);
  await screenshot('mobile.png');
  await $('queue').screenshot({ path: path.join(output, 'queue-mobile.png') });
  const originalScroll = await page.evaluate(() => { window.scrollTo(0, 260); return window.scrollY; });
  await data('follow', 'direction').click();
  await data('return', 0).click();
  assert.equal(await page.evaluate(() => window.scrollY), originalScroll);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#theme')).transitionDuration), '0s');
  const queueJump = await data('jump', 'queue-title').boundingBox();
  report.mobile = { width: 390, height: 844, firstFollowBottom: Math.round(firstFollow.y + firstFollow.height), jumpHeight: queueJump.height };
  await page.setViewportSize({ width: 360, height: 844 });
  await data('open', 'review').click();
  assert.match(await $('current-task').innerText(), /跨项目共享.*约束是否都已明确记录/);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  report.checks.push('Ten layouts, full long task title at 360px, first dependency action in the viewport, and exact mobile scroll restoration.');

  await page.setViewportSize({ width: 1440, height: 900 });
  await open('?theme=dark');
  await screenshot('dark.png');
  await $('queue').screenshot({ path: path.join(output, 'queue-dark.png') });
  await $('theme').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  const business = await page.locator('main').innerText();
  await open('?look=flat');
  assert.equal(await page.locator('main').innerText(), business);
  const flatQueue = await $('queue').boundingBox();
  const flatInspection = await page.locator('.inspection').boundingBox();
  assert.equal(Math.round(flatQueue.x + flatQueue.width - flatInspection.x), 0);
  await screenshot('flat.png');
  report.checks.push('Theme toggle and same-content flat comparison remove the overlap and backdrop while preserving readable task context.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open();
  await data('follow', 'direction').click();
  assert.equal(await page.locator('.focus-inner').getAttribute('data-motion'), 'forward');
  assert.equal(await page.locator('.focus-inner').evaluate(el => getComputedStyle(el).animationName), 'inspect-in');
  await data('return', 0).click();
  assert.equal(await page.locator('.focus-inner').getAttribute('data-motion'), 'back');
  await data('open', 'rules').click();
  assert.equal(await page.locator('.focus-inner').getAttribute('data-motion'), 'select');
  assert.match(await $('origin-name').textContent(), /^T-10/);
  report.checks.push('The task view overlaps the queue surface without covering controls; context stays fixed on follow, with reversible motion and reduced-motion support.');
  assert.deepEqual(report.pageErrors, []);
  assert.deepEqual(report.network, []);
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'observed.json'), JSON.stringify(observed, null, 2) + '\n');
  console.log(`PASS: ${report.checks.length} browser check groups, ${report.layouts.length} layouts.`);
} finally {
  await browser.close();
}
