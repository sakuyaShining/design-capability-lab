import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const app = 'applications/industrial-terminal';
const output = process.argv[2] || 'runs/industrial-terminal/visual-revision';
const url = pathToFileURL(path.resolve(app, 'index.html')).href;
const playwright = process.env.DCL_PLAYWRIGHT || 'C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const edge = process.env.DCL_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const { chromium } = await import(pathToFileURL(playwright));
const browser = await chromium.launch({headless: true, executablePath: edge});
fs.mkdirSync(output, {recursive: true});

const report = {
  reviewDate: '2026-11-15',
  browser: `Edge ${browser.version()}`,
  node: process.version,
  implementation: Object.fromEntries(['index.html', 'style.css', 'app.js', 'fixture.js', 'behavior.json'].map(file =>
    [file, createHash('sha256').update(fs.readFileSync(path.join(app, file))).digest('hex')])),
  checks: [], layouts: [], comparisons: [], network: [], pageErrors: [],
};
const observed = {register: [], cancel: [], 'stale-recovery': []};

try {
  const page = await browser.newPage({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce', offline: true});
  const $ = id => page.locator(`#${id}`);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('request', request => {
    if (!request.url().startsWith('file:')) report.network.push(request.url());
  });
  const open = async (search = '') => {
    await page.goto(url + search);
    await page.evaluate(() => document.fonts.ready);
    await $('current').waitFor();
  };
  const screenshot = name => page.screenshot({path: path.join(output, name)});
  const metric = async name => Number(await page.locator(`[data-metric="${name}"]`).innerText());
  const lastReadout = () => $('detail').locator('.readout dd').first().innerText();
  const active = () => page.evaluate(() => document.activeElement.id);
  const primary = () => $('create-order');
  const select = name => page.locator(`[data-device="${name}"]`);
  const filter = name => page.locator(`[data-filter="${name}"]`);

  async function capture(scenario) {
    const openDialog = await $('dialog').isVisible();
    const order = page.locator('#log [data-source="P-204"]');
    const orderExists = await order.count() > 0;
    const state = openDialog ? await $('rejection').isVisible() ? 'stale' : 'draft' : orderExists ? 'registered' : 'idle';
    const facts = {
      source: (await $('detail').locator('.detail-header .field').innerText()).split(' / ')[0],
      orders: await page.locator('#log [data-source]').count(),
      limitAlerts: await metric('读数越限'),
      focusedControl: await active(),
      focusedResult: await active(),
      latest: (await lastReadout()).replace(/\s+/g, ' '),
    };
    if (openDialog) facts.note = await $('note').inputValue();
    if (orderExists) {
      facts.created = await order.getAttribute('id');
      facts.linkedSource = await order.getAttribute('data-source');
      facts.revision = Number(await order.getAttribute('data-revision'));
    }
    observed[scenario].push({state, facts});
  }

  await open();
  assert.equal(await page.locator('tbody tr').count(), 12);
  assert.equal(await metric('待巡检'), 2);
  assert.equal(await page.locator('.series [data-crossed]').count(), 6);
  assert.equal(await page.locator('.series').getAttribute('data-limit'), 'below');
  const latestSize = await page.locator('.readout .value').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  const thresholdSize = await page.locator('.readout .value').nth(1).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  assert.ok(latestSize >= 1.5 * thresholdSize);
  assert.equal(await page.evaluate(() => document.fonts.check('700 16px Saira')), true);
  await screenshot('desktop.png');
  await filter('pending').click();
  await primary().click();
  await capture('register');
  await $('note').fill('复核循环压力');
  await $('confirm').click();
  await capture('register');
  assert.equal(await active(), 'view-order');
  assert.equal(await metric('待巡检'), 1);
  assert.equal(await metric('读数越限'), 3);
  assert.match(await $('outside').innerText(), /P-204/);
  assert.equal(await select('P-204').count(), 0);
  await $('view-order').click();
  await capture('register');
  assert.match(await $('WO-015').innerText(), /复核循环压力/);
  await filter('ticket').click();
  await select('P-204').click();
  assert.equal(await primary().count(), 0);
  assert.equal(await page.locator('#log [data-source="P-204"]').count(), 1);
  await screenshot('registered.png');
  report.checks.push('Confirm creates one linked order. Pending filter is preserved, alert remains, and receipt opens the correct record.');

  await open();
  await primary().focus();
  await page.keyboard.press('Enter');
  await capture('cancel');
  assert.equal(await active(), 'note');
  await $('note').fill('此草案取消');
  await page.keyboard.press('Escape');
  await capture('cancel');
  assert.equal(await active(), 'create-order');
  assert.doesNotMatch(await $('log').innerText(), /此草案取消/);
  report.checks.push('Keyboard enters preview. Escape writes nothing and returns focus to the initiating control.');

  await open('?scenario=stale');
  await primary().click();
  await capture('stale-recovery');
  await $('note').fill('复核回路压力');
  await $('confirm').click();
  await capture('stale-recovery');
  assert.equal(await active(), 'refresh');
  await screenshot('stale.png');
  await $('refresh').click();
  await capture('stale-recovery');
  assert.equal(await active(), 'confirm');
  assert.match(await $('preview').innerText(), /r18.*0\.34 MPa/);
  await $('confirm').click();
  await capture('stale-recovery');
  assert.match(await $('WO-015').innerText(), /复核回路压力/);
  report.checks.push('Stale snapshot is refused. The typed note survives refresh, and only explicit confirmation registers against r18.');

  await open();
  await select('M-117').click();
  assert.equal(await $('current').innerText(), '二级输送驱动');
  assert.equal(await page.locator('.series [data-crossed]').count(), 4);
  assert.equal(await page.locator('.series').getAttribute('data-limit'), 'above');
  const zoneGeometry = async () => page.locator('.limit-zone').evaluate(zone => {
    const panel = zone.parentElement.getBoundingClientRect();
    const area = zone.getBoundingClientRect();
    const line = zone.parentElement.querySelector('.threshold').getBoundingClientRect();
    return {top: area.top - panel.top, bottom: panel.bottom - area.bottom, line: line.top - panel.top, height: area.height};
  });
  const upperZone = await zoneGeometry();
  assert.ok(upperZone.top < 2 && Math.abs(upperZone.height - upperZone.line) < 3);
  await screenshot('upper-limit.png');
  await page.locator('.chart summary').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.chart details[open] li').count(), 12);
  await select('P-204').click();
  const lowerZone = await zoneGeometry();
  assert.ok(lowerZone.bottom < 2 && Math.abs(lowerZone.top - lowerZone.line) < 2);
  await select('V-311').click();
  assert.equal(await page.locator('.axis span').nth(1).textContent(), '12.5');
  await select('M-117').click();
  assert.match(await $('detail').innerText(), /高于上限/);
  await filter('offline').click();
  assert.match(await $('outside').innerText(), /M-117/);
  await select('T-092').click();
  assert.match(await $('detail').innerText(), /暂无当前读数/);
  assert.equal(await primary().count(), 0);
  await filter('all').click();
  await select('HX-203').click();
  assert.match(await $('detail').innerText(), /无需登记巡检/);
  assert.equal(await metric('待巡检'), 2);
  assert.equal(await primary().count(), 0);
  report.checks.push('Upper limit, missing telemetry and normal device render different conditions. Filtering does not mutate the global counts.');
  report.checks.push('Latest reading has stronger type hierarchy. Shading follows the upper and lower limits, and all 12 exact values are keyboard-accessible.');

  for (const width of [360, 390, 768, 1024, 1440]) {
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({width, height: 844});
      await open(`?theme=${theme}&cut=wide`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const clippedButtons = await page.locator('button').evaluateAll(buttons =>
        buttons.filter(button => button.offsetWidth > 0 && button.scrollWidth > button.clientWidth).map(button => button.textContent));
      assert.ok(overflow <= 0, `Horizontal overflow at ${width}, ${theme}: ${overflow}px`);
      assert.deepEqual(clippedButtons, []);
      await primary().click();
      assert.equal(await $('dialog').isVisible(), true);
      const dialog = await $('dialog').boundingBox();
      assert.ok(dialog.x >= 0 && dialog.x + dialog.width <= width);
      await page.keyboard.press('Escape');
      report.layouts.push({width, height: 844, theme, cut: 'wide', overflow, clippedButtons});
    }
  }
  await page.setViewportSize({width: 390, height: 844});
  await open();
  const mobileButton = await primary().boundingBox();
  const mobileButtonBottom = Math.round(mobileButton.y + mobileButton.height);
  assert.ok(mobileButton.height >= 44 && mobileButtonBottom <= 844);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#theme')).transitionDuration), '0s');
  await screenshot('mobile.png');
  await $('open-queue').click();
  assert.equal(await active(), 'fleet-title');
  await select('M-117').focus();
  await page.keyboard.press('Enter');
  assert.equal(await active(), 'current');
  await open('?layout=queue');
  const queueButton = await primary().boundingBox();
  const queueButtonBottom = Math.round(queueButton.y + queueButton.height);
  assert.ok(queueButtonBottom > 844);
  await screenshot('queue-mobile.png');
  await select('M-117').focus();
  await page.keyboard.press('Enter');
  assert.equal(await active(), 'current');
  report.comparisons.push({width: 390, height: 844, mobileButtonBottom, queueButtonBottom});
  report.checks.push('Narrow-screen target is 44px or taller, detail heading receives keyboard focus, and reduced motion disables transition.');

  await page.setViewportSize({width: 1440, height: 900});
  await open('?theme=dark');
  await screenshot('dark.png');
  await $('theme').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  const normalize = value => value.replace(/^\/\/ .+$/gm, '').replace(/\s+/g, ' ').trim();
  const mainText = normalize(await page.locator('main').innerText());
  await open('?highlight=off&skin=plain');
  const plainText = normalize(await page.locator('main').innerText());
  assert.equal(plainText, mainText);
  await screenshot('plain.png');
  report.checks.push('Theme toggle works. Removing the yellow fills, English headers and brand motif preserves the business text.');

  await page.setViewportSize({width: 360, height: 800});
  await open();
  // Change fixture inputs after loading the frozen implementation.
  const heldOutName = '北区闭式循环冷却水增压与旁路调节联合泵组';
  await page.evaluate(name => {
    const current = assets.get('P-204');
    assets.set(current.id, {...current, name, samples: [...current.samples.slice(0, -1), current.limit]});
    render();
  }, heldOutName);
  assert.equal(await $('current').innerText(), heldOutName);
  assert.equal(await metric('待巡检'), 1);
  assert.equal(await primary().count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await filter('pending').click();
  await select('M-117').click();
  await primary().click();
  await $('confirm').click();
  assert.equal(await metric('待巡检'), 0);
  assert.equal(await metric('读数越限'), 2);
  assert.match(await $('rows').innerText(), /此筛选下暂无设备/);
  assert.match(await $('outside').innerText(), /M-117/);
  report.checks.push('Held-out fixture: long asset name at 360px, sample exactly at limit, and empty pending filter with two remaining alerts.');

  const pairs = [
    ['light', '#5c5c5c', '#f3f1ea'], ['light', '#5c5c5c', '#fffefa'],
    ['dark', '#b6b2a8', '#1b1a17'], ['dark', '#b6b2a8', '#24221e'],
    ['signal', '#161616', '#fffa00'],
    ['instrument-secondary', '#bbb7ac', '#1e1e1b'],
    ['instrument-primary', '#f4f1e8', '#1e1e1b'],
  ];
  const luminance = hex => hex.slice(1).match(/../g).map(part => parseInt(part, 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  report.contrast = pairs.map(([role, foreground, background]) => {
    const values = [luminance(foreground), luminance(background)];
    const ratio = (Math.max(...values) + .05) / (Math.min(...values) + .05);
    assert.ok(ratio >= 4.5);
    return {role, foreground, background, ratio: Number(ratio.toFixed(2))};
  });
  assert.deepEqual(report.pageErrors, []);
  assert.deepEqual(report.network, []);
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'observed.json'), JSON.stringify(observed, null, 2) + '\n');
  console.log(`PASS: ${report.checks.length} browser check groups, ${report.layouts.length} layout combinations.`);
} finally {
  await browser.close();
}
