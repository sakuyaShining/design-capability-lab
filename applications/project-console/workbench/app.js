(() => {
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const projects = [
    { id: 'ic', priority: 1, name: '集创赛', status: '当前重点' },
    { id: 'soc', priority: 2, name: '个人 SoC / 计算机系统', status: '长期建设' },
    { id: 'ai', priority: 3, name: 'AI 自动化与表征学习', status: '长期建设' },
    { id: 'fpga', priority: 4, name: 'FPGA 电子乐器', status: '已弃赛 / 整理复盘' },
    { id: 'op', priority: 5, name: '2027 算子赛', status: '暂定方向' },
  ];
  const query = new URLSearchParams(location.search);
  const scenarios = {
    clear: record => ['rules', 'mentor', 'direction', 'reuse', 'socbase'].includes(record.id) ? { ...record, status: '已完成' } : record,
    conflict: record => ['direction', 'reuse'].includes(record.id) ? { ...record, status: '已完成' } : record,
    missing: record => record.id === 'scheme' ? { ...record, deps: [...record.deps, 'missing-record'] } : record,
    cycle: record => record.id === 'direction' ? { ...record, deps: [...record.deps, 'scheme'] } : record,
    blocked: record => record.id === 'direction' ? { ...record, status: '阻塞中', previousPhase: 'active', reason: '等待补齐方向对照材料。' } : record,
    downstream: record => ({ ...record, status: '已完成' }),
  };
  const variant = Object.hasOwn(scenarios, query.get('scenario')) ? scenarios[query.get('scenario')] : record => record;
  const directionText = { title: '确定竞赛主选与备选方向', output: '各列一项主选和备选，附选择依据与暂缓条件。' };
  let tasks = TaskWorkflow.fromRecords(DEMO_TASKS.map(task => task.id === 'direction' ? { ...task, ...directionText } : task)
    .map(variant).map(task => ({ ...task, kind: '已承诺任务' })));
  let byId;
  let info;
  function indexTasks() {
    byId = new Map(tasks.map(task => [task.id, task]));
    info = new Map(tasks.map(task => [task.id, TaskWorkflow.inspect(tasks, task)]));
  }
  indexTasks();
  const byProject = new Map(projects.map(project => [project.id, project]));
  const view = { path: [{ id: 'scheme' }], filter: 'all', project: 'all' };
  const dialog = $('task-dialog');
  const form = $('task-change');
  const diagram = $('task-diagram');
  const diagramView = $('task-diagram-view');
  let draft;
  const root = document.documentElement;
  if (query.get('theme') === 'dark') root.dataset.theme = 'dark';
  if (query.get('look') === 'flat') root.dataset.look = 'flat';
  if (query.get('cut') === 'wide') root.dataset.efCut = 'wide';

  const pad = count => String(count).padStart(2, '0');
  const current = () => byId.get(view.path.at(-1).id);
  const projectName = task => byProject.get(task.project)?.name || task.project;
  const group = task => task.phase === 'done' ? 'done' : info.get(task.id).ready ? 'ready' : 'waiting';
  const phase = task => TaskWorkflow.phases[task.phase];

  function condition(task) {
    const data = info.get(task.id);
    if (task.blocker) return '人工阻塞';
    if (data.selfConflict) return '完成记录冲突';
    if (data.cycle || data.missing.length) return '依赖需核对';
    if (data.conflicts.length) return `待核对 ${data.conflicts.length} 项完成记录`;
    if (data.pending.length) return `待满足 ${data.pending.length} 项`;
    if (group(task) === 'ready') return task.phase === 'active' ? '可继续' : '可开始';
    return '';
  }

  function taskCodes(items) {
    return items.map(item => item.code).join('、');
  }

  function nextStep(task, detail) {
    const pending = detail.pending.filter(entry => entry.task).map(entry => entry.task);
    const needs = [];
    if (pending.length) needs.push(`等待 ${taskCodes(pending)} 完成。`);
    if (detail.cycle || detail.missing.length) needs.push('请先核对依赖记录。');
    if (task.blocker) {
      return {
        title: '先解除人工阻塞',
        text: `${task.blocker.reason} ${task.phase === 'unknown' ? '解除时须补记阻塞前的阶段。' : '解除后执行阶段保留。'} ${needs.join(' ')}`,
        primary: 'release',
      };
    }
    if (task.phase === 'done') {
      const impact = TaskWorkflow.reopenImpact(tasks, task.id);
      if (impact.completed.length) {
        return { title: '当前不能重开', text: `已完成的 ${taskCodes(impact.completed)} 依赖此任务。请先核对这些任务。${detail.selfConflict ? ` 该任务的完成记录还与 ${detail.causes.join('、')} 冲突。` : ''}` };
      }
      if (detail.selfConflict) {
        return {
          title: '完成记录与前置冲突',
          text: `${task.code} 标记为已完成，但 ${detail.causes.join('、')} 尚未完成。核对后可重开；此前结果保留在任务记录。`,
          primary: 'reopen',
        };
      }
      return { title: '已记录完成', text: task.completion || '这条样例没有单独的实际结果。', primary: 'reopen' };
    }
    if (detail.conflicts.length) {
      const list = detail.conflicts.map(entry => `${entry.task.code}（${entry.causes.join('、')}）`).join('、');
      return { title: '上游完成记录有冲突', text: `这些任务标为已完成，但前置尚未完成：${list}。核对前不能开始，也不会使用这些完成记录。`, jump: true };
    }
    if (!detail.ready) {
      const available = pending.filter(item => group(item) === 'ready');
      return { title: task.phase === 'active' ? '暂不能记录完成' : '当前不能开始',
        text: needs.length ? needs.join(' ') : detail.reasons.join(' '),
        suggestion: available.length === 1 ? available[0] : null, jump: true };
    }
    return task.phase === 'todo'
      ? { title: '可以开始', text: '前置已就绪。确认开始后进入进行中。', primary: 'start' }
      : { title: '可以记录完成', text: '实际结果就绪后，填写完成说明或产物位置。', primary: 'finish' };
  }

  function operation(action, primary = false) {
    return `<button type="button" class="cut focus-action${primary ? '' : ' secondary'}" data-change="${action}">${TaskWorkflow.actionLabels[action]}</button>`;
  }

  $('project-filter').replaceChildren(new Option('全部项目', 'all'),
    ...projects.map(project => new Option(project.name, project.id)));

  function setTheme(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    $('theme').textContent = dark ? '浅色模式' : '深色模式';
    if (!diagram.hidden) renderDiagram(current());
  }
  $('theme').addEventListener('click', () => setTheme(root.dataset.theme !== 'dark'));
  setTheme(root.dataset.theme === 'dark');

  function renderTotals() {
    const ready = tasks.filter(task => group(task) === 'ready').length;
    const waiting = tasks.filter(task => group(task) === 'waiting').length;
    $('totals').innerHTML = `
      <div class="metric"><strong>${pad(tasks.length)}</strong><span>本周任务</span></div>
      <button class="cut metric" data-quick="ready" type="button" aria-label="查看可推进任务，共 ${ready} 项"><strong>${pad(ready)}</strong><span>可推进 ↗</span></button>
      <div class="metric"><strong>${pad(waiting)}</strong><span>待处理</span></div>`;
  }

  function updateQueueContext() {
    const origin = byId.get(view.path[0].id);
    $('scope-name').textContent = byProject.get(view.project)?.name || '全部项目';
    $('origin-name').textContent = `${origin.code} / ${projectName(origin)}`;
    const id = current().id;
    let visible = false;
    for (const button of $('queue-list').querySelectorAll('[data-open]')) {
      if (button.dataset.open === id) {
        button.setAttribute('aria-current', 'true');
        visible = true;
      } else {
        button.removeAttribute('aria-current');
      }
    }
    $('outside').hidden = visible;
    $('outside').textContent = `当前查看的 ${current().code} 不在筛选范围。`;
  }

  function renderQueue() {
    const visible = tasks.filter(task => (view.project === 'all' || task.project === view.project)
      && (view.filter === 'all' || group(task) === view.filter));
    $('queue-count').textContent = `显示 ${visible.length} / ${tasks.length}`;
    $('project-filter').value = view.project;
    $('filters').querySelectorAll('button').forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.filter === view.filter)));
    const open = visible.filter(task => task.phase !== 'done');
    const done = visible.filter(task => task.phase === 'done');
    const row = task => {
      const status = condition(task);
      const rowPhase = task.phase === 'unknown' ? '进度待确认' : phase(task);
      return `<li class="queue-row">
        <button type="button" class="cut task-button" data-open="${escape(task.id)}">
          <span class="code">${escape(task.code)}</span>
          <span class="task-text"><strong>${escape(task.title)}</strong><small>${escape(projectName(task))}</small></span>
          <span class="row-state">${task.phase === 'done' ? '<span aria-hidden="true">✓ </span>' : ''}${escape(rowPhase)}${status ? `<small>${escape(status)}</small>` : ''}</span>
        </button>
      </li>`;
    };
    $('queue-list').innerHTML = visible.length ? `
      ${open.length ? `<ul class="open-tasks" aria-label="未完成任务">${open.map(row).join('')}</ul>` : ''}
      ${done.length ? `<section class="done-tasks" aria-labelledby="done-title">
        <h3 id="done-title">已完成 <span class="meta">/ ${pad(done.length)}</span></h3>
        <ul>${done.map(row).join('')}</ul>
      </section>` : ''}`
      : '<p class="empty">此筛选下没有样例任务。<button class="cut" type="button" data-clear>清除筛选</button></p>';
    updateQueueContext();
  }

  function renderFocus(task, detail, motion) {
    const count = detail.pending.length;
    const met = detail.direct.filter(entry => entry.task?.phase === 'done' && !entry.conflict).length;
    const parent = byId.get(view.path.at(-2)?.id);
    const route = parent ? `<nav class="path" aria-label="前置依赖路径">${view.path.slice(0, -1).map((entry, index) => {
      const item = byId.get(entry.id);
      return `<button type="button" class="cut" data-return="${index}" aria-label="返回 ${escape(item.code)} ${escape(item.title)}">${index === 0 ? '原任务 ' : ''}${escape(item.code)}</button><span>依赖 →</span>`;
    }).join('')}<span aria-current="location">${escape(task.code)}</span></nav>` : '';
    const step = nextStep(task, detail);
    const action = step.primary ? operation(step.primary, true) : step.suggestion
      ? `<button class="cut focus-action" type="button" data-suggest="${escape(step.suggestion.id)}">查看可推进的 ${escape(step.suggestion.code)} <span aria-hidden="true">↗</span></button>` : step.jump
      ? '<button class="cut focus-action" type="button" data-jump="dependency-title">核对待办条件 <span aria-hidden="true">↓</span></button>' : '';
    const secondary = TaskWorkflow.actions(task, detail).includes('block') ? operation('block') : '';
    const diagramJump = task.id === diagram.dataset.task
      ? '<button class="task-readme diagram-jump" type="button" data-jump="task-diagram-title" aria-controls="task-diagram">流程图 ↓</button>'
      : '';
    $('focus').innerHTML = `${route}<div class="focus-inner"${motion ? ` data-motion="${motion}"` : ''}>
      <div class="focus-task">
        <p class="eyebrow">// CURRENT TASK</p>
        <div class="task-meta"><span class="code">${escape(task.code)}</span><span>${escape(projectName(task))}</span><span class="phase">执行阶段 / <strong id="execution-phase">${escape(phase(task))}</strong></span><a class="task-readme" href="tasks/${escape(task.code)}/index.html" target="_blank" rel="noopener">任务 README ↗</a>${diagramJump}</div>
        <h2 id="current-task" tabindex="-1">${escape(task.title)}</h2>
        ${parent ? `<p class="relation">这是 ${escape(parent.code)}「${escape(parent.title)}」的直接前置。</p>` : ''}
        <p class="expected"><span>预期产出</span> ${escape(task.output || '尚未填写。')}</p>
      </div>
      <div class="dependency-meter">
        <p>直接前置</p>
        ${detail.direct.length ? `<p class="meter-count"><strong>${pad(count)}</strong><span>项待满足</span></p>
        <div class="segments" aria-hidden="true" style="--total: ${detail.direct.length}">${detail.direct.map(entry =>
          `<i class="${entry.conflict ? 'conflict' : entry.task?.phase === 'done' ? 'met' : 'unmet'}"></i>`).join('')}</div>
        <p class="meter-legend">${detail.conflicts.length ? `已满足 ${met}/${detail.direct.length} · ${detail.conflicts.length} 项冲突` : `已满足 ${met} / 共 ${detail.direct.length} 项`}</p>`
        : '<p class="meter-empty">没有直接前置</p>'}
      </div>
    </div>
    <section class="next-step" aria-labelledby="next-title">
      <div><h3 id="next-title">${escape(step.title)}</h3><p>${escape(step.text)}</p></div>
      <div class="focus-actions">${action}${secondary}<button class="cut focus-action secondary" type="button" data-jump="queue-title">任务队列 <span aria-hidden="true">↓</span></button></div>
    </section>`;
  }

  function dependencyRow(entry, task) {
    if (!entry.task) return `<li class="dependency-row"><div><span class="code">${escape(entry.id)}</span>
      <strong>前置记录缺失</strong></div><span class="dependency-state">无法查看</span></li>`;
    const item = entry.task;
    const onPath = view.path.some(step => step.id === item.id);
    const status = condition(item);
    return `<li class="dependency-row"><div>
      <span class="meta"><span class="code">${escape(item.code)}</span> / ${escape(projectName(item))}${item.project === task.project ? '' : ' / 跨项目'}</span>
      <strong>${escape(item.title)}</strong><small>${escape(phase(item))}${status ? ` / ${escape(status)}` : ''}</small></div>
      ${onPath ? '<span class="dependency-state">循环指回路径</span>' : `<button class="cut" type="button" data-follow="${escape(item.id)}"
        aria-label="${item.phase === 'done' ? '回看' : '查看前置'} ${escape(item.code)} ${escape(item.title)}">${item.phase === 'done' ? '回看' : '查看前置'} <span aria-hidden="true">↗</span></button>`}</li>`;
  }

  function renderDependencies(task, detail) {
    const conflicts = detail.conflicts;
    const done = detail.direct.filter(entry => entry.task?.phase === 'done' && !entry.conflict);
    $('dependencies').innerHTML = `
      <header class="section-head"><div><p class="eyebrow">// DEPENDENCIES</p><h2 id="dependency-title" tabindex="-1">前置与阻塞</h2></div><span class="meta">${escape(task.code)} / ${detail.pending.length} 项待满足${conflicts.length ? ` · ${conflicts.length} 项冲突` : ''}</span></header>
      ${conflicts.length ? `<div class="conflict-block"><p class="blocker">上游完成记录与前置冲突：${conflicts.map(entry => `${entry.task.code} 等待 ${entry.causes.join('、')}`).join('；')}。核对前不使用这些完成记录。</p><ul class="dependency-list conflict-list">${conflicts.map(entry => dependencyRow(entry, task)).join('')}</ul></div>` : ''}
      ${detail.cycle || detail.missing.length ? `<p class="blocker">${detail.cycle ? '依赖链存在循环。' : ''}${detail.missing.length ? `缺失记录：${escape(detail.missing.join('、'))}。` : ''}</p>` : ''}
      ${detail.pending.length ? `<ul class="dependency-list">${detail.pending.map(entry => dependencyRow(entry, task)).join('')}</ul>`
      : conflicts.length ? '' : `<p class="empty">${detail.direct.length ? '直接前置已全部满足。' : '本任务没有直接前置。'}</p>`}
      ${done.length ? `<details id="completed-deps"><summary>已满足 ${done.length} 项</summary><ul class="dependency-list">${done.map(entry => dependencyRow(entry, task)).join('')}</ul></details>` : ''}`;
  }

  function renderProjects() {
    $('project-list').innerHTML = projects.map(project => {
      const count = tasks.filter(task => task.project === project.id).length;
      return `<li><span class="project-priority" aria-label="优先级 ${project.priority}">${pad(project.priority)}</span>
        <div><strong>${escape(project.name)}</strong><small>${escape(project.status)}</small></div>
        <span class="meta">${count ? `本周 ${count} 项` : '本周无样例任务'}</span>
        ${count ? `<button class="cut" type="button" data-project="${project.id}">查看任务 <span aria-hidden="true">↗</span></button>` : ''}</li>`;
    }).join('');
  }

  function renderDiagram(task) {
    diagram.hidden = task.id !== diagram.dataset.task;
    if (diagram.hidden) return;
    const src = `${diagramView.dataset.src}?embed=1&theme=${root.dataset.theme}`;
    if (diagramView.getAttribute('src') !== src) diagramView.src = src;
  }

  function renderHistory(task) {
    const section = $('history');
    const entries = (task.history || []).slice().reverse();
    section.hidden = !entries.length;
    if (!entries.length) return;
    const labels = { finish: '记录完成', reopen: '重新打开', block: '登记阻塞', release: '解除阻塞' };
    const body = entry => {
      if (entry.action === 'finish') return `<p>${escape(entry.note)}</p>`;
      if (entry.action === 'block') return `<p>原因：${escape(entry.note)}</p>`;
      if (entry.action === 'release') {
        return `<p>原阻塞：${escape(entry.note)}${entry.basis ? ` · 解除依据：${escape(entry.basis)}` : ''} · 恢复阶段：${escape(TaskWorkflow.phases[entry.stage])}</p>`;
      }
      return `<p>${entry.note ? `原因：${escape(entry.note)} · ` : ''}保留此前结果：${escape(entry.result || '未填写。')}</p>`;
    };
    section.innerHTML = `<header class="section-head"><div><p class="eyebrow">// RECORD</p><h2 id="history-title" tabindex="-1">任务记录</h2></div><span class="meta">${escape(task.code)} / ${pad(entries.length)} 项</span></header>
      <ol class="history-list">${entries.map(entry => `<li><span class="history-action">${labels[entry.action] || entry.action}</span>${body(entry)}</li>`).join('')}</ol>`;
  }

  function render(motion) {
    const task = current();
    renderFocus(task, info.get(task.id), motion);
    renderDependencies(task, info.get(task.id));
    renderHistory(task);
    renderDiagram(task);
    updateQueueContext();
    if (motion) $('task-receipt').hidden = true;
  }

  function openChange(action, opener) {
    const task = current();
    const detail = info.get(task.id);
    if (!TaskWorkflow.actions(task, detail).includes(action)) return;
    draft = { id: task.id, action, opener };
    const dependents = tasks.filter(item => item.deps.includes(task.id));
    const effects = {
      start: '待开始 → 进行中。',
      finish: '进行中 → 已完成。记录实际结果后会重新计算依赖方是否可以推进，结果同时写入任务记录。',
      block: `当前执行阶段「${phase(task)}」保留，登记后暂缓推进；原因写入任务记录。`,
      release: task.phase === 'unknown' ? '解除人工阻塞，同时补记阻塞前的执行阶段；原阻塞原因保留在任务记录。' : `解除人工阻塞，保留「${phase(task)}」；原阻塞原因保留在任务记录。`,
      reopen: '已完成 → 待开始。此前完成结果保留在任务记录，依赖方将重新等待此前置。',
    };
    const fields = {
      block: '<label>人工阻塞原因<textarea name="note" maxlength="500" rows="3" aria-describedby="change-error"></textarea></label>',
      finish: '<label>实际结果或产物位置<textarea name="note" maxlength="500" rows="3" aria-describedby="change-error"></textarea></label>',
      reopen: '<label>重开原因（可选）<textarea name="note" maxlength="500" rows="2" aria-describedby="change-error"></textarea></label>',
      release: (task.phase === 'unknown' ? '<label>阻塞前的执行阶段<select name="phase" aria-describedby="change-error"><option value="">选择原阶段</option><option value="todo">待开始</option><option value="active">进行中</option></select></label>' : '')
        + '<label>解除依据（可选）<textarea name="note" maxlength="500" rows="2" aria-describedby="change-error"></textarea></label>',
    };
    const label = TaskWorkflow.actionLabels[action];
    const followup = (action === 'finish' || action === 'reopen') && dependents.length
      ? `<p>直接依赖方：${escape(taskCodes(dependents))}。</p>` : '';
    const remaining = action === 'release' && detail.pending.length
      ? `<p>解除后仍有 ${detail.pending.length} 项直接前置待满足。</p>` : '';
    form.innerHTML = `<h2 id="change-title">${label}</h2><p>${escape(task.code)} / ${escape(task.title)}</p>
      <div class="change-effect"><p>${escape(effects[action])}</p>${followup}${remaining}</div>
      ${fields[action] || ''}<p id="change-error" class="change-error" role="alert" hidden></p>
      <div class="dialog-actions"><button id="cancel-task-change" class="cut" type="button">取消</button>
      <button class="cut focus-action" type="submit">确认${label}</button></div>`;
    dialog.showModal();
    (form.querySelector('textarea, select') || $('cancel-task-change')).focus();
  }

  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    draft?.opener.focus();
    draft = null;
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!draft) return;
    const { id, action } = draft;
    const readyBefore = new Set(tasks.filter(task => group(task) === 'ready').map(task => task.id));
    const result = TaskWorkflow.transition(tasks, id, action, Object.fromEntries(new FormData(form)));
    if (result.error) {
      $('change-error').textContent = result.error;
      $('change-error').hidden = false;
      form.querySelector('textarea, select')?.focus();
      return;
    }
    tasks = result.tasks;
    indexTasks();
    const unlocked = tasks.filter(task => task.id !== id && !readyBefore.has(task.id) && group(task) === 'ready');
    const next = nextStep(result.after, info.get(id));
    draft = null;
    dialog.close();
    renderTotals();
    renderQueue();
    render();
    const status = action === 'release' ? '人工阻塞已解除'
      : action === 'block' ? '已登记人工阻塞'
      : action === 'reopen' ? '已重开，此前结果保留在任务记录'
      : action === 'finish' ? '已完成' : phase(result.after);
    const updates = unlocked.length ? ` ${taskCodes(unlocked)} 现在可推进，执行阶段保持原样。` : '';
    const receipt = $('task-receipt');
    receipt.textContent = `${result.after.code}：${status}。 ${next.text}${updates}`;
    receipt.hidden = false;
    receipt.focus();
  });

  $('project-filter').addEventListener('change', event => {
    view.project = event.target.value;
    renderQueue();
  });
  $('filters').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    view.filter = button.dataset.filter;
    renderQueue();
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const { open, follow, suggest, jump, project, quick, return: ancestor, clear, change } = button.dataset;
    if (change) openChange(change, button);
    if (button.id === 'cancel-task-change') dialog.close();
    if (jump) $(jump).focus();
    if (project || quick || clear !== undefined) {
      view.project = project || 'all';
      view.filter = quick || 'all';
      renderQueue();
      $('queue-title').focus();
    }
    if (open) {
      view.path = [{ id: open }];
      render('select');
      $('current-task').focus();
    }
    const target = follow || suggest;
    if (target && current().deps.includes(target) && byId.has(target) && !view.path.some(entry => entry.id === target)) {
      view.path.push({ id: target, scroll: scrollY, expanded: $('completed-deps')?.open, suggested: Boolean(suggest) });
      render('forward');
      $('current-task').focus();
    }
    if (ancestor !== undefined) {
      const firstRemoved = view.path[Number(ancestor) + 1];
      view.path.splice(Number(ancestor) + 1);
      render('back');
      if (firstRemoved.expanded && $('completed-deps')) $('completed-deps').open = true;
      const key = CSS.escape(firstRemoved.id);
      const source = (firstRemoved.suggested && $('focus').querySelector(`[data-suggest="${key}"]`))
        || $('dependencies').querySelector(`[data-follow="${key}"]`);
      (source || $('current-task')).focus({ preventScroll: true });
      window.scrollTo(0, firstRemoved.scroll);
    }
  });

  renderTotals();
  renderProjects();
  renderQueue();
  render();
})();
