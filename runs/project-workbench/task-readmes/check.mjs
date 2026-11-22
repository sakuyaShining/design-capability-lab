import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const workbench = new URL('../../../applications/project-console/workbench/', import.meta.url);
const catalog = new URL('tasks/index.html', workbench);
const pilot = JSON.parse(readFileSync(new URL('../task-entry/record.json', import.meta.url), 'utf8'));
const playwright = process.env.DCL_PLAYWRIGHT || 'C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const executablePath = process.env.DCL_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const { chromium } = await import(pathToFileURL(playwright));
const browser = await chromium.launch({ headless: true, executablePath });
const network = [];
const errors = [];
const report = { browser: browser.version(), mode: 'offline file://', tasks: [], checks: [] };

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, offline: true, reducedMotion: 'reduce' });
  context.on('request', request => { if (!request.url().startsWith('file:')) network.push(request.url()); });
  context.on('page', tab => tab.on('pageerror', error => errors.push(error.message)));
  const page = await context.newPage();
  const capture = name => page.screenshot({ path: fileURLToPath(new URL(name, import.meta.url)), fullPage: true });
  await page.goto(catalog.href);
  const hrefs = await page.locator('.doc-catalog a').evaluateAll(links => links.map(link => link.href));
  assert.equal(hrefs.length, 10);
  assert.equal(new Set(hrefs).size, 10);
  for (const href of hrefs) {
    await page.goto(href);
    const code = await page.locator('.doc-title .code').innerText();
    const task = await page.locator('h1').innerText();
    const stageCount = await page.locator('.doc-stage').count();
    const stepCount = await page.locator('.stage-nodes > li').count();
    assert.ok(stageCount >= 4 && stepCount >= stageCount, code);
    assert.ok(await page.locator('h2', { hasText: '交付标准' }).isVisible(), code);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, code);
    const readme = await page.getByRole('link', { name: '查看 README 原件' }).getAttribute('href');
    assert.match(readFileSync(new URL(readme, href), 'utf8'), new RegExp('^# ' + code));
    const dependencies = await page.locator('.doc-links .code').allTextContents();
    report.tasks.push({ code, task, stages: stageCount, steps: stepCount, dependencies });
  }
  report.checks.push('All ten offline pages have the task title, step diagram, completion criteria and original README.');

  await page.goto(new URL('index.html', workbench).href);
  assert.equal(await page.locator('#task-diagram').isHidden(), true);
  await page.locator('#project-filter').selectOption('ic');
  await page.locator('[data-filter="waiting"]').click();
  await page.locator('[data-open="direction"]').click();
  const workbenchUrl = page.url();
  const title = page.locator('#task-diagram-title');
  const diagram = page.frameLocator('#task-diagram-view');
  await page.getByRole('button', { name: '流程图' }).click();
  assert.equal(await title.evaluate(node => node === document.activeElement), true);
  await diagram.getByText('两项核对完成', { exact: true }).first().waitFor();
  const join = diagram.locator('[data-node-id="join"][tabindex]');
  await join.click();
  assert.equal(await join.getAttribute('aria-pressed'), 'true');
  await page.locator('#theme').click();
  await diagram.locator('html[data-theme="dark"]').waitFor();
  assert.equal(await diagram.locator('html').getAttribute('data-theme'), 'dark');
  await page.locator('#theme').click();
  await diagram.locator('html[data-theme="light"]').waitFor();
  assert.equal(page.url(), workbenchUrl);
  assert.equal(await page.locator('#project-filter').inputValue(), 'ic');
  assert.equal(await page.locator('[data-filter="waiting"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('#execution-phase').innerText(), '待开始');
  await page.locator('#task-diagram').screenshot({ path: fileURLToPath(new URL('embedded-workbench.png', import.meta.url)) });
  await page.getByRole('button', { name: '回到任务' }).click();
  assert.equal(await page.locator('#current-task').evaluate(node => node === document.activeElement), true);
  await page.locator('[data-open="scheme"]').click();
  assert.equal(await page.locator('#task-diagram').isHidden(), true);
  await page.locator('[data-open="direction"]').click();
  report.checks.push('The live Archify frame is shown for T-12. A node click highlights its path, the frame follows the workbench theme, and jump and return preserve filters, phase and URL.');

  const [readme] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: '任务 README' }).click(),
  ]);
  await readme.waitForLoadState();
  await readme.locator('.doc-title .code', { hasText: 'T-12' }).waitFor();
  assert.equal(await page.locator('.task-meta .code').innerText(), 'T-12');
  await readme.close();
  await page.getByRole('link', { name: '续做试点' }).click();
  await page.waitForURL('**/tasks/PC-01/index.html');
  assert.equal(await page.locator('.doc-snapshot > p').first().innerText(), pilot.result.finding);
  await capture('pilot-pc-01.png');
  await page.locator('.doc-snapshot').getByRole('link', { name: /PC-02/ }).click();
  await page.waitForURL('**/tasks/PC-02/index.html');
  assert.equal(await page.locator('.doc-snapshot > p').first().innerText(), pilot.result.finding);
  await page.locator('.doc-links').getByRole('link', { name: /PC-01/ }).click();
  await page.waitForURL('**/tasks/PC-01/index.html');
  report.checks.push('Selected task opens its README while preserving the original tab. The pilot entry resolves offline and the downstream shows the persisted PC-01 conclusion.');

  await page.goto(new URL('tasks/T-12/index.html', workbench).href);
  const docDiagram = page.frameLocator('.diagram-frame');
  await docDiagram.getByText('两项核对完成', { exact: true }).first().waitFor();
  const branches = await page.locator('.stage-nodes.branch > li').allTextContents();
  assert.equal(branches.length, 2);
  assert.deepEqual(await page.locator('.doc-links .code').allTextContents(), ['T-10', 'T-11']);
  await capture('task-t-12-embedded.png');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await docDiagram.locator('body').evaluate(body => body.scrollHeight <= innerHeight + 2), true);
  await capture('task-t-12-embedded-mobile.png');
  await page.getByText('查看简图', { exact: true }).click();
  assert.equal(await page.locator('.stage-nodes.branch').isVisible(), true);
  await page.locator('.doc-links').getByRole('link', { name: /T-10/ }).click();
  await page.waitForURL('**/tasks/T-10/index.html');
  report.checks.push('T-12 branch and two cross-task links verified, with narrow layout and successful navigation.');
  assert.deepEqual(network, []);
  assert.deepEqual(errors, []);
  report.network = network;
  report.errors = errors;
  writeFileSync(new URL('verification.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(`PASS: ${report.tasks.length} tasks, ${report.checks.length} offline check groups.`);
} finally {
  await browser.close();
}
