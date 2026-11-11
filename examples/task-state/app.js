(() => {
  const workflow = TaskWorkflow;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  const names = { exhibit: '社区展览', print: '展品印刷' };
  const dialog = $('change-dialog');
  const form = $('change-form');
  let tasks, path, draft, lastChange, opener;

  function loadScenario(scenario) {
    const records = DEMO_TASKS.map(task => ({ ...task, kind: '已承诺任务' }));
    const find = id => records.find(task => task.id === id);
    if (['ready', 'completed', 'downstream'].includes(scenario)) {
      for (const task of records) {
        if (task.id !== 'plan' && task.id !== 'review') {
          Object.assign(task, { status: '已完成', completion: task.output });
        }
      }
    }
    if (['completed', 'downstream'].includes(scenario)) Object.assign(find('plan'), { status: '已完成', completion: find('plan').output });
    if (scenario === 'downstream') Object.assign(find('review'), { status: '已完成', completion: find('review').output });
    if (scenario === 'blocked') Object.assign(find('plan'), { status: '阻塞中', previousPhase: 'active', reason: '展厅布置时段尚未确认。' });
    if (scenario === 'idea') find('plan').kind = '暂定方向';
    if (scenario === 'missing') find('plan').deps = [...find('plan').deps, 'missing-record'];
    if (scenario === 'cycle') find('layout').deps = [...find('layout').deps, 'plan'];
    const root = scenario === 'legacy' ? 'venue' : 'plan';
    tasks = workflow.fromRecords(records);
    path = [root];
    lastChange = null;
    render();
    announce('');
  }

  function announce(message) {
    $('notice').textContent = message;
    $('undo').hidden = !lastChange;
  }

  function selectTask(id, nextPath) {
    if (!tasks.some(task => task.id === id)) return;
    path = nextPath;
    render();
    $('current-task').focus();
  }

  function taskButton(task, selected) {
    return `<button type="button" data-open="${escape(task.id)}" ${selected ? 'aria-current="true"' : ''}><span>${escape(task.code)}</span>${escape(task.title)}</button>`;
  }

  function actionButton(action, className = 'button') {
    return `<button type="button" class="${className}" data-change="${action}">${workflow.actionLabels[action]}</button>`;
  }

  function guidance(task, info, available) {
    const labels = workflow.actionLabels;
    if (info.cycle || info.missing.length) {
      const details = [info.cycle && '依赖链有循环。', info.missing.length && `缺失记录：${info.missing.join('、')}。`].filter(Boolean).join(' ');
      return { tone: 'warn', title: '核对依赖记录', details, control: '<a class="button" href="#dependencies">查看依赖</a>' };
    }
    if (task.blocker) return { tone: 'warn', title: '人工阻塞', details: task.blocker.reason, control: actionButton('release', 'button primary') };
    if (task.phase === 'done') {
      const impact = workflow.reopenImpact(tasks, task.id);
      if (impact.completed.length) {
        const links = impact.completed.map(item => `<li><button type="button" class="text-button" data-open="${escape(item.id)}">${escape(item.title)}</button></li>`).join('');
        return { tone: 'warn', title: '先检查已完成的依赖方', details: '重新打开此项会让这些任务的前置失效。', extra: `<ul class="affected">${links}</ul>`, control: '' };
      }
      return { tone: 'done', title: '已记录完成', details: task.completion || '旧记录没有单独的完成说明。', control: actionButton('reopen') };
    }
    if (task.kind !== '已承诺任务') return { tone: 'neutral', title: task.kind, details: '确认承诺后可进入执行。', control: '' };
    if (task.phase === 'unknown') return { tone: 'warn', title: '请核对原进度', details: '现有记录无法确认执行阶段。', control: '' };
    if (info.pending.length) return { tone: 'wait', title: `等待 ${info.pending.length} 项前置`, details: task.phase === 'active' ? '执行进度保留。前置满足后可以记录完成。' : '前置全部完成后可以开始。', control: '<a class="button primary" href="#dependencies">查看前置</a>' };
    const next = task.phase === 'todo' ? 'start' : 'finish';
    return { tone: 'ready', title: task.phase === 'todo' ? '可以开始' : '正在执行', details: task.phase === 'todo' ? '当前前置条件已满足。' : '实际产出就绪后可记录完成。', control: available.includes(next) ? actionButton(next, 'button primary') : labels[next] };
  }

  function dependencyRow(entry, satisfied) {
    if (!entry.task) return `<li class="dependency"><div><strong>缺失记录</strong><small>${escape(entry.id)}</small></div><span class="tag warn">不可查看</span></li>`;
    const task = entry.task;
    const revisit = path.includes(task.id);
    const phase = task.blocker ? '人工阻塞' : workflow.phases[task.phase];
    return `<li class="dependency"><div><small>${escape(task.code)} · ${escape(names[task.project] || task.project)}</small><strong>${escape(task.title)}</strong></div>
      <span class="tag ${task.blocker ? 'warn' : ''}">${escape(phase)}</span>
      ${revisit ? '<span class="tag warn">循环回边</span>' : `<button type="button" class="text-button" data-follow="${escape(task.id)}" aria-label="${satisfied ? '回看' : '查看'} ${escape(task.title)}">${satisfied ? '回看' : '查看'} <span aria-hidden="true">›</span></button>`}</li>`;
  }

  function render() {
    const task = tasks.find(item => item.id === path.at(-1));
    const info = workflow.inspect(tasks, task);
    const available = workflow.actions(task, info);
    const guide = guidance(task, info, available);
    const satisfied = info.direct.filter(entry => entry.task?.phase === 'done');
    const phases = ['todo', 'active', 'done'];
    const phaseIndicator = task.phase === 'unknown'
      ? '<p class="phase-unknown">原执行阶段待确认</p>'
      : `<ol class="phase-indicator" aria-label="执行阶段">${phases.map(phase => `<li ${phase === task.phase ? 'aria-current="step"' : ''}>${workflow.phases[phase]}</li>`).join('')}</ol>`;
    const route = path.length > 1 ? `<nav class="path" aria-label="前置依赖路径">${path.slice(0, -1).map((id, index) => {
      const ancestor = tasks.find(item => item.id === id);
      return `<button type="button" class="text-button" data-ancestor="${index}" aria-label="返回 ${escape(ancestor.title)}">${index === 0 ? '原任务 ' : ''}${escape(ancestor.code)}</button><span>需要 ›</span>`;
    }).join('')}<span aria-current="location">${escape(task.code)}</span></nav>` : '';

    $('task-list').innerHTML = tasks.map(item => taskButton(item, item.id === task.id)).join('');
    $('task-content').innerHTML = `${route}<header class="task-heading">
      <div class="identity"><span>${escape(names[task.project] || task.project)} / ${escape(task.code)}</span></div>
      <h1 id="current-task" tabindex="-1">${escape(task.title)}</h1>
      ${phaseIndicator}
    </header>
    <section class="guide ${guide.tone}" aria-labelledby="next-heading">
      <div><h2 id="next-heading">${escape(guide.title)}</h2><p>${escape(guide.details)}</p>${guide.extra || ''}</div>${guide.control}
    </section>
    <div class="task-details">
      <section id="dependencies" tabindex="-1" aria-labelledby="dependencies-heading">
        <header class="section-head"><h2 id="dependencies-heading">直接前置</h2><span>${satisfied.length} / ${info.direct.length} 项已满足</span></header>
        ${info.pending.length ? `<ul class="dependency-list pending">${info.pending.map(item => dependencyRow(item, false)).join('')}</ul>` : `<p class="empty">${info.direct.length ? '直接前置已全部满足。' : '没有直接前置。'}</p>`}
        ${satisfied.length ? `<details class="satisfied"><summary>已满足 ${satisfied.length} 项</summary><ul class="dependency-list">${satisfied.map(item => dependencyRow(item, true)).join('')}</ul></details>` : ''}
      </section>
      <aside class="task-meta"><h2>预期产出</h2><p>${escape(task.output || '尚未填写。')}</p><h2>承诺程度</h2><p>${escape(task.kind)}</p>${available.includes('block') ? actionButton('block') : ''}</aside>
    </div>`;
  }

  function openChange(action, button) {
    const task = tasks.find(item => item.id === path.at(-1));
    draft = { id: task.id, action };
    opener = button;
    const impact = action === 'reopen' ? workflow.reopenImpact(tasks, task.id) : null;
    const pendingCount = action === 'release' ? workflow.inspect(tasks, task).pending.length : 0;
    const remaining = pendingCount ? `。仍有 ${pendingCount} 项前置待满足` : '';
    const fields = {
      block: '<label>阻塞原因<textarea name="note" maxlength="500" required></textarea></label>',
      finish: '<label>实际结果或产物位置<textarea name="note" maxlength="500" required></textarea></label>',
      release: task.phase === 'unknown' ? '<label>阻塞前的执行阶段<select name="phase" required><option value="">选择执行阶段</option><option value="todo">待开始</option><option value="active">进行中</option></select></label>' : '',
    };
    const changes = {
      start: '待开始 → 进行中', finish: '进行中 → 已完成', block: '添加人工阻塞，保留执行阶段',
      release: task.phase === 'unknown' ? `解除人工阻塞并补记原阶段${remaining}` : `解除人工阻塞，保留「${workflow.phases[task.phase]}」${remaining}`,
      reopen: `已完成 → 待开始。${impact?.open.length || 0} 项未完成任务将重新等待此前置。`,
    };
    form.innerHTML = `<h2 id="dialog-title">${workflow.actionLabels[action]}</h2><p>${escape(task.title)}</p>
      <p class="change-summary">${escape(changes[action])}</p>${fields[action] || ''}
      <p class="field-error" role="alert" id="form-error"></p><div class="dialog-buttons">
      <button type="button" class="button" id="cancel-change">取消</button><button type="submit" class="button primary">确认${workflow.actionLabels[action]}</button></div>`;
    dialog.showModal();
    (form.querySelector('textarea, select') || $('cancel-change')).focus();
    $('cancel-change').onclick = () => dialog.close();
  }

  $('task-rail').open = matchMedia('(min-width: 820px)').matches;
  $('scenario').addEventListener('change', event => loadScenario(event.target.value));
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.open) {
      if (matchMedia('(max-width: 819px)').matches) $('task-rail').open = false;
      selectTask(button.dataset.open, [button.dataset.open]);
    }
    if (button.dataset.follow) selectTask(button.dataset.follow, [...path, button.dataset.follow]);
    if (button.dataset.ancestor !== undefined) {
      const index = Number(button.dataset.ancestor);
      selectTask(path[index], path.slice(0, index + 1));
    }
    if (button.dataset.change) openChange(button.dataset.change, button);
  });
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus();
    draft = null;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!draft) return;
    const result = workflow.transition(tasks, draft.id, draft.action, Object.fromEntries(new FormData(form)));
    if (result.error) {
      const error = $('form-error');
      error.textContent = result.error;
      const field = form.querySelector('textarea, select');
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', 'form-error');
        field.focus();
      }
      return;
    }
    const label = workflow.actionLabels[draft.action];
    lastChange = { tasks, title: result.before.title };
    tasks = result.tasks;
    opener = null;
    dialog.close();
    render();
    announce(`已确认「${result.before.title}」的${label}操作。`);
    $('current-task').focus();
  });
  $('undo').addEventListener('click', () => {
    if (!lastChange) return;
    tasks = lastChange.tasks;
    const title = lastChange.title;
    lastChange = null;
    render();
    announce(`已撤销「${title}」的上次修改。`);
    $('current-task').focus();
  });
  loadScenario($('scenario').value);
})();
