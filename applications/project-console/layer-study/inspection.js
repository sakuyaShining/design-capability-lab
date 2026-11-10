// Presentation for I. Navigation and dependency truth stay in the shared study.
window.renderInspection = function renderInspection({
  current, path, warning, hideDone, task, deps, project, badge, esc, hasCycle,
}) {
  const prerequisites = deps(current);
  const pending = prerequisites.filter(item => item.status !== '已完成');
  const complete = prerequisites.filter(item => item.status === '已完成');
  const electronic = ['ic', 'soc'].includes(current.project);

  const breadcrumb = path.map((id, index) => {
    const item = task(id);
    if (index === path.length - 1) {
      return `<span aria-current="location">${esc(item.code)}</span>`;
    }
    const label = index === 0 ? `原任务 ${item.code}` : item.code;
    const action = index === 0 ? 'return' : 'ancestor';
    return `<button data-act="${action}" data-id="${esc(id)}" aria-label="返回${esc(item.title)}">${esc(label)}</button><span class="inspection-arrow">需要 →</span>`;
  }).join('');

  let summary = '<p>无直接前置</p>';
  if (prerequisites.length) {
    summary = `<div class="inspection-count"><strong>${pending.length}</strong><span>项未满足</span></div>
      <div class="inspection-meter" aria-hidden="true"><span style="--satisfied: ${complete.length / prerequisites.length * 100}%"></span></div>
      <p>已满足 ${complete.length} / 直接前置 ${prerequisites.length}</p>`;
  }

  let cycleNotice = '';
  if (warning) {
    cycleNotice = `<p class="inspection-warning" role="alert" tabindex="-1"><strong>已停止循环下钻。</strong> ${esc(warning)}</p>`;
  } else if (hasCycle(current.id)) {
    cycleNotice = '<p class="inspection-warning">这条依赖链存在循环，请核对关系。</p>';
  }

  const actionAttrs = item => `data-act="follow" data-parent="${esc(current.id)}" data-id="${esc(item.id)}"`;
  const pendingCards = pending.map(item => {
    const remaining = deps(item).filter(dep => dep.status !== '已完成').length;
    let explanation = item.reason || '等待该任务完成。';
    if (item.missing) explanation = '引用无法解析。请核对来源记录。';
    else if (!item.reason && remaining) explanation = `还有 ${remaining} 项直接前置未满足。`;
    const control = item.missing
      ? '<span class="inspection-unavailable">无法打开</span>'
      : `<button ${actionAttrs(item)} aria-label="查看前置 ${esc(item.title)}">查看前置 <span aria-hidden="true">↗</span></button>`;
    return `<article class="inspection-item">
      <div class="inspection-item-meta"><span>${esc(item.code)} / ${esc(project(item.project))}</span>${badge(item)}</div>
      <h3>${esc(item.title)}</h3><p>${esc(explanation)}</p>${control}
    </article>`;
  }).join('');

  let pendingSection = '';
  if (pending.length) {
    pendingSection = `<section aria-labelledby="pending-title"><div class="inspection-section-head">
      <h2 id="pending-title">未满足的前置</h2><span>${pending.length} 项</span></div>
      <div class="inspection-grid">${pendingCards}</div></section>`;
  } else if (!current.reason && current.status !== '阻塞中') {
    pendingSection = `<p class="inspection-clear">${prerequisites.length ? '直接前置已全部满足。' : '这项任务没有直接前置。'}</p>`;
  }

  let completedSection = '';
  if (complete.length && hideDone) {
    completedSection = `<p class="inspection-muted">已隐藏 ${complete.length} 项已满足前置。</p>`;
  } else if (complete.length) {
    completedSection = `<section class="inspection-complete" aria-labelledby="satisfied-title">
      <div class="inspection-section-head"><h2 id="satisfied-title">已满足</h2><span>${complete.length} 项</span></div>
      <ul>${complete.map(item => `<li><span><span aria-hidden="true">✓</span> ${esc(item.title)}</span>
        <button ${actionAttrs(item)} aria-label="回看已满足前置 ${esc(item.title)}">回看 ↗</button></li>`).join('')}</ul></section>`;
  }

  const reason = current.reason || (current.status === '阻塞中' ? '任务标记为阻塞中，尚未填写原因。' : '');
  return `<div class="inspection">
    ${path.length > 1 ? `<nav class="inspection-path" aria-label="依赖路径">${breadcrumb}</nav>` : ''}
    <header class="inspection-stage${electronic ? ' has-photo' : ''}">
      <div class="inspection-heading">
        <div class="inspection-meta"><span>${esc(project(current.project))} / ${esc(current.code)}</span>${badge(current)}</div>
        <h1 id="current-title" tabindex="-1">${esc(current.title)}</h1>
      </div>
      <div class="inspection-summary" aria-label="当前任务的直接前置概况">${summary}</div>
    </header>
    <div class="inspection-work">
      <div class="inspection-main">
        ${cycleNotice}
        ${reason ? `<section class="inspection-reason"><h2>人工阻塞原因</h2><p>${esc(reason)}</p></section>` : ''}
        ${pendingSection}${completedSection}
      </div>
      <aside class="inspection-output"><h2>预期产出</h2><p>${esc(current.output || '尚未填写。')}</p></aside>
    </div>
  </div>`;
};
