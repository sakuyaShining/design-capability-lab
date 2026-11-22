const byId = id => document.getElementById(id);
const query = new URLSearchParams(location.search);
const root = document.documentElement;
const staleScenario = query.get('scenario') === 'stale';
const queueFirst = query.get('layout') === 'queue';
const narrow = matchMedia('(max-width: 800px)');
const dialog = byId('dialog');
const assets = new Map(fixture.assets.map(asset => [asset.id, asset]));
const orders = new Map(fixture.orders.map(order => [order.assetId, order]));
const view = { selected: 'P-204', filter: 'all', draft: null };
const statusLabels = {alert: '越限', offline: '遥测中断', normal: '正常'};

if (queueFirst) root.dataset.layout = 'queue';
if (query.get('highlight') === 'off') root.dataset.highlight = 'off';
if (query.get('skin') === 'plain') root.dataset.skin = 'plain';
if (query.get('cut') === 'wide') root.dataset.efCut = 'wide';
if (query.get('theme') === 'dark') root.dataset.theme = 'dark';

const format = (asset, value) => value.toFixed(asset.digits);
const latest = asset => asset.samples ? format(asset, asset.samples.at(-1)) : asset.value;
const display = asset => latest(asset) == null ? '—' : `${latest(asset)} ${asset.unit}`;
const isCrossed = (asset, value) => asset.direction === 'below' ? value < asset.limit : value > asset.limit;
const deviceStatus = asset => asset.samples
  ? (isCrossed(asset, asset.samples.at(-1)) ? 'alert' : 'normal')
  : asset.status;
const isPending = asset => deviceStatus(asset) === 'alert' && !orders.has(asset.id);
const filters = {
  all: () => true,
  pending: isPending,
  ticket: asset => orders.has(asset.id),
  offline: asset => deviceStatus(asset) === 'offline',
};

function syncLayout() {
  const fleet = byId('fleet');
  const detail = byId('detail');
  if (narrow.matches && !queueFirst) fleet.before(detail);
  else fleet.after(detail);
}
narrow.addEventListener('change', syncLayout);
syncLayout();

function setTheme() {
  byId('theme').textContent = root.dataset.theme === 'dark' ? '浅色模式' : '深色模式';
}
byId('theme').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme();
});
setTheme();
byId('open-queue').addEventListener('click', () => byId('fleet-title').focus());

function renderFleet() {
  const all = Array.from(assets.values());
  const visible = all.filter(filters[view.filter]);
  const now = all.reduce((last, asset) => asset.time > last ? asset.time : last, '');
  byId('snapshot').textContent = `快照 ${fixture.date} / ${now}`;
  const summary = [
    ['纳管设备', all.length],
    ['读数越限', all.filter(asset => deviceStatus(asset) === 'alert').length],
    ['待巡检', all.filter(isPending).length],
    ['已登记工单', orders.size],
  ];
  byId('metrics').innerHTML = summary.map(([label, count]) => `
    <div class="metric${label === '待巡检' ? ' priority' : ''}${label === '待巡检' && count ? ' attention' : ''}">
      <span>${label}</span><strong data-metric="${label}">${String(count).padStart(2, '0')}</strong>
    </div>`).join('');
  document.querySelectorAll('[data-filter]').forEach(button => {
    const filter = button.dataset.filter;
    button.setAttribute('aria-pressed', String(filter === view.filter));
    button.querySelector('b').textContent = all.filter(filters[filter]).length;
  });
  byId('visible-count').textContent = `显示 ${visible.length} / ${all.length}`;
  const outside = byId('outside');
  outside.hidden = visible.some(asset => asset.id === view.selected);
  outside.textContent = outside.hidden ? '' : `当前诊断 ${view.selected} 不在此筛选范围内。`;
  byId('rows').innerHTML = visible.length ? `
    <table aria-label="设备及最新读数"><thead><tr>
      <th scope="col">编号</th><th scope="col">设备</th><th scope="col" class="cell-zone">工段</th>
      <th scope="col" class="reading">最新读数</th><th scope="col">状态</th><th scope="col" class="cell-time">采样</th>
    </tr></thead><tbody>${visible.map(asset => {
      const selected = asset.id === view.selected;
      const status = deviceStatus(asset);
      return `<tr ${selected ? 'data-selected' : ''}>
        <td><button type="button" class="cut device-id" data-device="${asset.id}" aria-label="查看 ${asset.id} ${asset.name}" ${selected ? 'aria-current="true"' : ''}>${asset.id}</button></td>
        <th scope="row">${asset.name}<span class="row-sub">${asset.zone}</span></th>
        <td class="cell-zone">${asset.zone}</td><td class="reading">${display(asset)}</td>
        <td><span class="status ${status}">${statusLabels[status]}</span>${status === 'alert' || orders.has(asset.id) ? `<span class="row-progress">${orders.has(asset.id) ? '已登记' : '待巡检'}</span>` : ''}</td>
        <td class="cell-time"><time>${asset.time}</time></td>
      </tr>`;
    }).join('')}</tbody></table>` : '<p class="outside">此筛选下暂无设备。</p>';
}

function sampleTime(last, minutesBack) {
  const [hour, minute] = last.split(':').map(Number);
  const absolute = hour * 60 + minute - minutesBack;
  return [Math.floor(absolute / 60), absolute % 60].map(value => String(value).padStart(2, '0')).join(':');
}

function renderChart(asset) {
  const [min, max] = asset.scale;
  const percentage = value => (value - min) / (max - min) * 100;
  const from = sampleTime(asset.time, asset.samples.length - 1);
  const crossed = asset.samples.filter(value => isCrossed(asset, value)).length;
  const threshold = percentage(asset.limit);
  const midpoint = (max + min) / 2;
  const midpointLabel = Number(format(asset, midpoint)) === midpoint ? format(asset, midpoint) : midpoint.toFixed(asset.digits + 1);
  return `<figure class="chart">
    <figcaption><strong>${asset.metric}趋势</strong><span class="field">${asset.samples.length} 个样本 / 每分钟 1 次</span></figcaption>
    <div class="plot" aria-hidden="true">
      <div class="axis"><span>${format(asset, max)}</span><span>${midpointLabel}</span><span>${format(asset, min)}</span></div>
      <div class="series" data-limit="${asset.direction}" style="--threshold:${threshold}%">
        <span class="limit-zone"></span><span class="gridline"></span>
        ${asset.samples.map(value => `<i style="--height:${percentage(value)}%" ${isCrossed(asset, value) ? 'data-crossed' : ''}></i>`).join('')}
        <span class="threshold"></span>
      </div>
    </div>
    <div class="timeline" aria-hidden="true"><span>${from}</span><span>${asset.time}</span></div>
    <div class="chart-footer">
      <p class="chart-summary"><strong>${crossed} 次越限</strong> / 阴影为越限区</p>
      <details><summary>查看采样值（${asset.unit}）</summary><ol>${asset.samples.map((value, index) => `<li><time>${sampleTime(asset.time, asset.samples.length - 1 - index)}</time> ${format(asset, value)}</li>`).join('')}</ol></details>
    </div>
  </figure>`;
}

function renderDetail() {
  const asset = assets.get(view.selected);
  const order = orders.get(asset.id);
  const readout = (label, value, unit = '') => `<div><dt>${label}</dt><dd><strong class="value">${value}</strong>${unit ? `<span class="unit">${unit}</span>` : ''}</dd></div>`;
  const status = deviceStatus(asset);
  const isAlert = status === 'alert';
  const difference = isAlert ? format(asset, Math.abs(asset.samples.at(-1) - asset.limit)) : '';
  const limitLabel = asset.direction === 'below' ? '监测下限' : '监测上限';
  const deltaLabel = asset.direction === 'below' ? '低于下限' : '高于上限';
  byId('detail').innerHTML = `
    <div class="instrument">
      <header class="detail-header">
        <div><p class="label">// ASSET DIAGNOSIS</p><h2 id="current" tabindex="-1">${asset.name}</h2><p class="field">${asset.id} / ${asset.zone} / ${asset.time}</p></div>
        <span class="detail-status status ${status}">${statusLabels[status]}</span>
      </header>
      <dl class="readout">
        ${readout(asset.metric, latest(asset) ?? '—', asset.unit)}
        ${asset.samples ? readout(limitLabel, format(asset, asset.limit), asset.unit) : readout('最后采样', asset.time)}
        ${isAlert ? readout(deltaLabel, difference, asset.unit) : ''}
      </dl>
      ${asset.samples ? renderChart(asset) : ''}
    </div>
    <div class="decision">
      <div><h3>${order ? '巡检工单已登记' : isAlert ? '待巡检' : status === 'offline' ? '暂无当前读数' : '无需登记巡检'}</h3>
      <p>${order ? `${order.id} / ${order.group}` : isAlert ? asset.effect : status === 'offline' ? '遥测已中断，当前读数不可用于判定设备状态。' : '当前样本未出现登记条件。'}</p></div>
      ${order ? `<button type="button" class="cut" id="view-order" data-order="${order.id}">查看工单 <span aria-hidden="true">↘</span></button>` :
        isAlert ? '<button type="button" class="cut primary" id="create-order">登记巡检工单 <span aria-hidden="true">↗</span></button>' : ''}
    </div>`;
}

function renderJournal() {
  const orderEvents = [...orders.values()].map(order => ({...order, text: `巡检工单 ${order.id} / ${order.group}`}));
  const log = [...orderEvents, ...fixture.events].sort((a, b) => b.time.localeCompare(a.time));
  byId('log-count').textContent = `${log.length} 条记录`;
  byId('log').innerHTML = log.map(event => `
    <li ${event.id ? `id="${event.id}" tabindex="-1" data-source="${event.assetId}" data-revision="${event.revision}"` : ''}>
      <time>${event.time}</time><span class="field">${event.assetId}</span><p>${event.text}</p>
    </li>`).join('');
  orderEvents.forEach(event => {
    if (event.note) byId(event.id).querySelector('p').append(document.createElement('br'), document.createTextNode(event.note));
  });
}

function render() {
  renderFleet();
  renderDetail();
  renderJournal();
}
render();

byId('fleet').addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    view.filter = filter.dataset.filter;
    renderFleet();
    return;
  }
  const device = event.target.closest('[data-device]');
  if (!device) return;
  view.selected = device.dataset.device;
  renderFleet();
  renderDetail();
  if (narrow.matches || queueFirst) byId('current').focus();
  else document.querySelector(`[data-device="${view.selected}"]`).focus();
});

byId('detail').addEventListener('click', event => {
  const result = event.target.closest('[data-order]');
  if (result) byId(result.dataset.order).focus();
  if (!event.target.closest('#create-order')) return;
  const asset = assets.get(view.selected);
  if (!isPending(asset)) return;
  view.draft = { assetId: asset.id, revision: asset.revision, conflict: false };
  byId('note').value = '';
  updatePreview(asset);
  dialog.showModal();
});

function updatePreview(asset) {
  byId('target').textContent = `${asset.id} / ${asset.name} → ${asset.group}`;
  byId('preview').textContent = `快照 r${asset.revision} / ${asset.metric} ${display(asset)}。确认后新增一张关联工单，设备状态继续由遥测决定。`;
  byId('rejection').hidden = !view.draft.conflict;
  byId('refresh').hidden = !view.draft.conflict;
  byId('confirm').hidden = view.draft.conflict;
}

byId('cancel').addEventListener('click', () => dialog.close('cancel'));
dialog.addEventListener('close', () => {
  view.draft = null;
  const target = dialog.returnValue === 'registered' ? byId('view-order') : byId('create-order');
  target?.focus();
});
dialog.addEventListener('cancel', () => { dialog.returnValue = 'cancel'; });

byId('refresh').addEventListener('click', () => {
  const asset = fixture.changedPressure;
  assets.set(asset.id, asset);
  view.draft.revision = asset.revision;
  view.draft.conflict = false;
  render();
  updatePreview(asset);
  byId('confirm').focus();
});

byId('dispatch').addEventListener('submit', event => {
  event.preventDefault();
  const draft = view.draft;
  if (!draft || draft.conflict) return;
  const asset = assets.get(draft.assetId);
  if (!isPending(asset)) return;
  const available = staleScenario && asset.id === fixture.changedPressure.id ? fixture.changedPressure : asset;
  if (draft.revision !== available.revision) {
    draft.conflict = true;
    byId('rejection').textContent = `快照已更新到 r${available.revision}，工单尚未登记。载入最新读数后再确认，备注会保留。`;
    updatePreview(asset);
    byId('refresh').focus();
    return;
  }
  const number = Math.max(...Array.from(orders.values(), order => Number(order.id.slice(3)))) + 1;
  const order = {
    id: `WO-${String(number).padStart(3, '0')}`, assetId: asset.id, group: asset.group,
    revision: asset.revision, time: asset.time, note: byId('note').value.trim(),
  };
  orders.set(asset.id, order);
  dialog.close('registered');
  render();
});
