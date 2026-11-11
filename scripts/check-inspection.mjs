import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL('C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const out = process.argv[2] ?? 'runs/visual-inspection';
const entry = pathToFileURL(path.resolve('applications/project-console/layer-study/index.html')).href;
const results = { date: '2026-11-11', method: 'Headless Edge, offline entry, synthetic fixtures', mobile: [], viewports: [], scenarios: {} };
fs.mkdirSync(out, { recursive: true });

async function open(page, query = '') {
  await page.goto(entry + query);
  await page.locator('#current-title').waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function snapshot(page, name, fullPage = false) {
  await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
  await page.screenshot({ path: path.join(out, name), fullPage });
}

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const view of ['G', 'H', 'I']) {
    await open(page, `?view=${view}`);
    const selector = view === 'I' ? '.inspection-item button' : '.cause button';
    const bounds = await page.locator(selector).first().boundingBox();
    results.mobile.push({ view, firstActionTop: Math.round(bounds.y), firstActionBottom: Math.round(bounds.y + bounds.height) });
    if (view === 'I') assert.ok(bounds.y + bounds.height <= 844, 'First pending action must fit inside the default mobile viewport');
  }
  await snapshot(page, 'I-mobile.png');
  await page.locator('#task-tools summary').click();
  await page.locator('#scope').selectOption('ic');
  await page.locator('#query').fill('方案');
  assert.equal(await page.locator('#inspection-picker option').count(), 3);
  assert.equal(await page.locator('.inspection-item').count(), 2);
  await page.locator('#task-tools summary').click();
  await page.locator('.inspection-item [data-id="direction"]').focus();
  await page.keyboard.press('Enter');
  assert.deepEqual(await page.evaluate(() => Study.state.path), ['scheme', 'direction']);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'current-title');
  assert.equal(await page.locator('.inspection-count strong').innerText(), '2');
  await page.locator('.inspection-item [data-id="mentor"]').click();
  assert.match(await page.locator('.inspection-reason').innerText(), /等待校内负责人/);
  assert.equal(await page.locator('.inspection-item').count(), 0);
  assert.equal(await page.locator('.inspection-count').count(), 0);
  await snapshot(page, 'I-blocked-mobile.png');
  await page.locator('.inspection-path [data-id="scheme"]').click();
  assert.deepEqual(await page.evaluate(() => ({ path: Study.state.path, scope: Study.state.scope, query: Study.state.query })), {
    path: ['scheme'], scope: 'ic', query: '方案',
  });
  results.navigation = 'Keyboard, focus, true dependency path, manual reason and return with filters passed';

  await page.locator('#task-tools summary').click();
  await page.locator('#done').check();
  await page.locator('#query').fill('zz-no-task-zz');
  assert.match(await page.locator('#inspection-filter-result').innerText(), /没有匹配任务/);
  assert.equal(await page.locator('#inspection-picker').isDisabled(), true);
  assert.equal(await page.locator('#inspection-picker').isVisible(), false);
  await snapshot(page, 'I-no-matches-mobile.png');
  await page.locator('#inspection-clear-filters').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#scope').inputValue(), 'all');
  assert.equal(await page.locator('#query').inputValue(), '');
  assert.equal(await page.locator('#inspection-picker').isEnabled(), true);
  assert.equal(await page.locator('#inspection-clear-filters').isVisible(), false);
  assert.equal(await page.locator('#done').isChecked(), true);
  assert.deepEqual(await page.evaluate(() => Study.state.path), ['scheme']);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'query');
  results.emptyFilterRecovery = 'Keyboard reset restored task matches and preserved current task and completed filter';

  await open(page, '?view=I');
  await page.locator('#task-tools summary').click();
  await page.locator('#done').check();
  assert.equal(await page.locator('.inspection-complete li').count(), 0);
  assert.match(await page.locator('.inspection-summary').innerText(), /直接前置 3/);
  await page.locator('#done').uncheck();
  await page.locator('#inspection-picker').selectOption('reuse');
  assert.equal(await page.evaluate(() => Study.state.origin), 'reuse');
  assert.equal(await page.locator('#task-tools').evaluate(details => details.open), false);

  for (const scenario of ['clear', 'manual', 'missing', 'cycle', 'dense', 'holdout']) {
    await open(page, `?view=I&scenario=${scenario}`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), scenario);
    if (scenario === 'clear') {
      assert.match(await page.locator('.inspection-clear').innerText(), /全部满足/);
      assert.equal(await page.locator('.inspection-complete li').count(), 3);
      assert.match(await page.locator('.inspection-meta').innerText(), /待开始/);
    }
    if (scenario === 'manual') assert.equal(await page.locator('.inspection-reason').count(), 1);
    if (scenario === 'missing') {
      assert.equal(await page.locator('.inspection-unavailable').count(), 1);
      assert.equal(await page.locator('.inspection-count strong').innerText(), '3');
    }
    if (scenario === 'cycle') {
      for (const id of ['b', 'c', 'a']) await page.locator(`.inspection-item [data-id="${id}"]`).click();
      assert.deepEqual(await page.evaluate(() => Study.state.path), ['a', 'b', 'c']);
      assert.match(await page.locator('[role="alert"]').innerText(), /已停止循环/);
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('role')), 'alert');
    }
    if (scenario === 'dense') {
      assert.equal(await page.locator('.inspection-item').count(), 10);
      assert.equal(await page.locator('.inspection-complete li').count(), 4);
    }
    if (scenario === 'holdout') {
      assert.equal(await page.locator('.inspection-stage.has-photo').count(), 0);
      await page.locator('#task-tools summary').click();
      await page.locator('#scope').selectOption('publishing');
      assert.equal(await page.evaluate(() => Study.state.scope), 'publishing');
      await page.locator('.inspection-item [data-id="rights"]').click();
      await page.locator('.inspection-item [data-id="font"]').click();
      assert.equal(await page.locator('#surface script').count(), 0);
    }
    results.scenarios[scenario] = 'passed';
  }

  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await open(page, '?view=I');
    for (const theme of ['light', 'dark']) {
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${theme}`);
      results.viewports.push({ width, theme });
      await page.locator('#theme').click();
    }
  }
  await snapshot(page, 'I-desktop.png', true);
  const withPhoto = await page.locator('.inspection-stage').evaluate(stage => getComputedStyle(stage).backgroundImage);
  assert.match(withPhoto, /electronics-workbench\.png/);
  const before = await page.locator('#surface').innerText();
  await page.locator('#texture').uncheck();
  assert.equal(await page.locator('.inspection-stage').evaluate(stage => getComputedStyle(stage).backgroundImage), 'none');
  assert.equal(await page.locator('#surface').innerText(), before);
  await snapshot(page, 'I-no-photo.png', true);
  await page.locator('#texture').check();
  await page.locator('#theme').click();
  await snapshot(page, 'I-dark.png', true);
  await open(page, '?view=I&scenario=manual');
  await snapshot(page, 'I-blocked-desktop.png', true);
  for (const view of ['G', 'H']) {
    await page.locator(`[data-view="${view}"]`).click();
    assert.equal(await page.locator('#scope').isVisible(), true);
    assert.equal(await page.locator('#current-title').count(), 1);
  }
  assert.deepEqual(errors, []);
  results.pageErrors = errors;
  fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
