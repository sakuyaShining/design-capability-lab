import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const entry = new URL('../../../applications/project-console/workbench/index.html', import.meta.url);
const app = new URL('app.js', entry);
const model = new URL('../state-study/model.js', entry);
const data = new URL('../prototypes/data.js', entry);
const sources = Object.fromEntries([entry, app, model, data].map(url => [
  url.pathname.split('/applications/')[1],
  createHash('sha256').update(readFileSync(url)).digest('hex'),
]));
// Historical reproduction of the 2026-11-15 faults. Builds with the completion guard skip it.
if (readFileSync(model, 'utf8').includes('completionTrust')) {
  console.log('SKIP: pre-fix reproduction; see runs/project-workbench/p1-fixes/ for the fixed build.');
  process.exit(0);
}
const playwright = process.env.DCL_PLAYWRIGHT || 'C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const executablePath = process.env.DCL_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const { chromium } = await import(pathToFileURL(playwright));
const browser = await chromium.launch({ headless: true, executablePath });
const report = { browser: browser.version(), sources, observations: {}, pageErrors: [], network: [] };

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, offline: true, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('request', request => {
    if (!request.url().startsWith('file:')) report.network.push(request.url());
  });
  const id = name => page.locator(`#${name}`);
  const attr = (name, value) => page.locator(`[data-${name}="${value}"]`);
  const goto = search => page.goto(new URL(search, entry).href);
  const open = task => attr('open', task).click();
  const change = action => attr('change', action).click();
  const confirm = () => id('task-change').locator('[type=submit]').click();
  const finish = async note => {
    await change('finish');
    await id('task-change').locator('textarea').fill(note);
    await confirm();
  };
  const snapshot = async () => ({
    task: await page.locator('.task-meta .code').innerText(),
    phase: await id('execution-phase').innerText(),
    pending: await page.locator('.segments .unmet').count(),
    guidance: await id('next-title').innerText(),
    explanation: await page.locator('.next-step p').innerText(),
    operations: await page.locator('.next-step [data-change]').evaluateAll(buttons =>
      buttons.map(button => button.dataset.change)),
    suggestedTask: await page.locator('.next-step [data-suggest]').evaluateAll(buttons =>
      buttons.map(button => button.dataset.suggest)),
  });
  const screenshot = name => page.screenshot({ path: fileURLToPath(new URL(name, import.meta.url)) });

  // These assertions document current behavior, including the reproduced faults.
  await goto('?scenario=clear');
  const propagated = { schemeBefore: await snapshot() };
  assert.equal(propagated.schemeBefore.pending, 0);
  assert.ok(propagated.schemeBefore.operations.includes('start'));
  await open('direction');
  propagated.direction = await snapshot();
  assert.equal(propagated.direction.phase, '已完成');
  assert.equal(propagated.direction.pending, 2);
  await screenshot('completed-with-pending.png');
  await open('reuse');
  propagated.reuse = await snapshot();
  assert.equal(propagated.reuse.phase, '已完成');
  assert.equal(propagated.reuse.pending, 1);
  await open('scheme');
  await change('start');
  await confirm();
  assert.equal((await snapshot()).phase, '进行中');
  await finish('。');
  propagated.schemeAfter = await snapshot();
  assert.equal(propagated.schemeAfter.phase, '已完成');
  assert.equal(propagated.schemeAfter.explanation, '。');
  report.observations.completedPrerequisitePropagation = propagated;

  await goto('');
  const flow = { scheme: await snapshot() };
  assert.match(flow.scheme.explanation, /等待 T-12、T-14 完成/);
  assert.deepEqual(flow.scheme.suggestedTask, []);
  assert.equal(await attr('jump', 'dependency-title').count(), 1);
  await attr('follow', 'direction').click();
  flow.direction = await snapshot();
  assert.deepEqual(flow.direction.suggestedTask, ['rules']);
  await attr('follow', 'mentor').click();
  flow.blockedMentor = await snapshot();
  assert.match(flow.blockedMentor.explanation, /等待校内负责人的确认/);
  await change('release');
  flow.releaseFields = await id('task-change').locator('[name]').evaluateAll(fields => fields.map(field => field.name));
  assert.deepEqual(flow.releaseFields, ['phase']);
  await id('task-change').locator('select').selectOption('todo');
  await confirm();
  flow.releasedMentor = await snapshot();
  assert.doesNotMatch(flow.releasedMentor.explanation, /等待校内负责人/);
  await goto('');
  await attr('follow', 'reuse').click();
  flow.activeWithPending = await snapshot();
  assert.equal(flow.activeWithPending.phase, '进行中');
  assert.equal(flow.activeWithPending.pending, 1);
  assert.deepEqual(flow.activeWithPending.suggestedTask, ['rules']);
  assert.deepEqual(flow.activeWithPending.operations, ['block']);
  report.observations.guidance = flow;

  await attr('suggest', 'rules').click();
  await change('start');
  await confirm();
  const note = '评审留痕：已核对规则版本和资格清单。';
  await finish(note);
  const history = { recorded: await snapshot(), finishReceipt: await id('task-receipt').innerText() };
  assert.equal(history.recorded.explanation, note);
  assert.match(history.finishReceipt, /T-14 现在可推进/);
  assert.equal(await id('task-receipt').locator('a, button').count(), 0);
  await change('reopen');
  history.reopenPreview = await id('task-change').locator('.change-effect').innerText();
  assert.match(history.reopenPreview, /T-12、T-14/);
  assert.ok(!history.reopenPreview.includes(note));
  await screenshot('reopen-preview.png');
  await confirm();
  history.afterReopen = await snapshot();
  history.reopenReceipt = await id('task-receipt').innerText();
  assert.equal(history.afterReopen.phase, '待开始');
  assert.doesNotMatch(history.reopenReceipt, /T-14/);
  assert.ok(!(await page.locator('body').innerText()).includes(note));
  await attr('return', '1').click();
  history.reuseAfterReopen = await snapshot();
  assert.equal(history.reuseAfterReopen.phase, '进行中');
  assert.equal(history.reuseAfterReopen.pending, 1);
  assert.ok(!history.reuseAfterReopen.operations.includes('finish'));
  report.observations.reopenAndReceipt = history;

  await goto('?scenario=downstream');
  await open('direction');
  await id('project-filter').selectOption('soc');
  const refusal = {
    ...await snapshot(),
    focusLinks: await page.locator('.next-step a, .next-step button').allTextContents(),
    schemeInQueue: await attr('open', 'scheme').count(),
  };
  assert.match(refusal.explanation, /已完成的 T-15 依赖此任务/);
  assert.deepEqual(refusal.operations, []);
  assert.equal(refusal.schemeInQueue, 0);
  assert.equal(refusal.focusLinks.length, 1);
  assert.match(refusal.focusLinks[0], /任务队列/);
  await screenshot('reopen-refusal.png');
  report.observations.filteredReopenRefusal = refusal;

  assert.deepEqual(report.pageErrors, []);
  assert.deepEqual(report.network, []);
  writeFileSync(new URL('observations.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(`Recorded ${Object.keys(report.observations).length} findings in Edge ${report.browser}.`);
} finally {
  await browser.close();
}
