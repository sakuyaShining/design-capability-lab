(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const data = window.DECK_DATA;
  const projects = data.projects;
  const projectById = new Map(projects.map(project => [project.id, project]));
  const notes = data.notes;
  const query = new URLSearchParams(location.search);
  let tasks = DeckModel.normalize(data.tasks);
  let byId;
  let info;
  const initial = query.get('task');
  const view = {
    path: [{ id: initial && tasks.some(task => task.id === initial) ? initial : 'reuse' }],
    project: 'all',
    filter: 'all',
    scope: 'week',
  };
  const dialog = $('transaction');
  const form = $('transaction-form');
  let draft = null;
  let receiptTimer = 0;

  function reindex() {
    byId = new Map(tasks.map(task => [task.id, task]));
    info = new Map(tasks.map(task => [task.id, DeckModel.inspect(tasks, task)]));
  }
  reindex();

  const current = () => byId.get(view.path[view.path.length - 1].id);
  const projectName = task => projectById.get(task.project)?.name || task.project;
  const shorten = text => text.length > 14 ? text.slice(0, 14) + '…' : text;

  const STATE_LABEL = { done: '已完成', conflict: '记录冲突', held: '人工阻塞', idea: '未承诺', ready: '可推进', active: '进行中', waiting: '等待' };

  function stateOf(task) {
    const detail = info.get(task.id);
    if (task.phase === 'done') return detail.selfConflict ? 'conflict' : 'done';
    if (task.blocker) return 'held';
    if (!detail.committed) return 'idea';
    if (task.phase === 'active') return 'active';
    return detail.ready ? 'ready' : 'waiting';
  }

  function phaseLabel(task) {
    return task.blocker ? '人工阻塞' : DeckModel.PHASES[task.phase];
  }

  function restingPhase(task) {
    return DeckModel.PHASES[task.phase] || '进度待确认';
  }

  function conditionText(task) {
    const detail = info.get(task.id);
    if (task.phase === 'done') return detail.selfConflict ? '记录冲突' : '已完成';
    if (task.blocker) return '人工阻塞';
    if (!detail.committed) return '未承诺';
    if (detail.conflicts.length) return '记录冲突';
    if (detail.pending.length) return '等待 ' + detail.pending.map(entry => entry.task?.code || entry.id).join('、');
    if (detail.ready) return task.phase === 'active' ? '可记录完成' : '可开始';
    return '待核对';
  }

  function markOf(state) {
    return { done: '✓', conflict: '!', held: '!', idea: '·', ready: '▶', active: '▶', waiting: '—' }[state];
  }

  const inWeek = task => !task.date.startsWith('2027');

  function renderTotals() {
    const week = tasks.filter(inWeek);
    const ready = week.filter(task => info.get(task.id).ready && task.phase !== 'done').length;
    const held = week.filter(task => task.blocker).length;
    const done = week.filter(task => task.phase === 'done').length;
    $('totals').innerHTML = [
      ['本周', week.length], ['可推进', ready], ['阻塞', held], ['已完成', done],
    ].map(([label, value]) => `<div class="metric"><b>${String(value).padStart(2, '0')}</b><span>${label}</span></div>`).join('');
  }

  function renderProjects() {
    $('project-list').innerHTML = projects.map(project => {
      const all = tasks.filter(task => task.project === project.id);
      const open = all.filter(task => task.phase !== 'done').length;
      const selected = view.project === project.id;
      const here = current().project === project.id;
      const progress = all.length ? Math.round(((all.length - open) / all.length) * 100) : 0;
      return `<li class="${here ? 'is-current' : ''}"><button class="sector${selected ? ' is-on' : ''}" type="button" data-project="${project.id}" aria-pressed="${selected}" style="--tint:${project.color}">
        <span class="sector-num">${project.code}</span>
        <span class="sector-name"><b>${esc(project.name)}</b><small>${esc(project.status)}</small></span>
        <span class="sector-count"><b>${open}</b><small>未完成</small></span>
        <span class="sector-bar" style="--w:${progress}%"></span>
        ${here ? '<span class="sector-flag">当前</span>' : ''}
      </button></li>`;
    }).join('');
    const briefProject = view.project === 'all' ? projectById.get(current().project) : projectById.get(view.project);
    $('project-brief').innerHTML = `<span class="micro">${view.project === 'all' ? '当前任务所属' : '筛选范围'}</span><b>${esc(briefProject.full)}</b><p>${esc(briefProject.desc)}</p>`;
  }

  function renderQueue() {
    const scoped = tasks.filter(task => view.scope === 'all' || inWeek(task));
    const visible = scoped.filter(task => (view.project === 'all' || task.project === view.project)
      && (view.filter === 'all'
        || (view.filter === 'ready' && info.get(task.id).ready && task.phase !== 'done')
        || (view.filter === 'waiting' && ['waiting', 'held', 'idea'].includes(stateOf(task)))
        || (view.filter === 'done' && ['done', 'conflict'].includes(stateOf(task)))));
    $('queue-count').textContent = `${visible.length} / ${scoped.length}`;
    $('filters').querySelectorAll('[data-filter]').forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.filter === view.filter)));
    $('scope').querySelectorAll('[data-scope]').forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.scope === view.scope)));
    const active = current().id;
    $('queue-list').innerHTML = visible.length ? visible.map(task => {
      const state = stateOf(task);
      return `<li><button class="tab" type="button" data-open="${task.id}" aria-current="${task.id === active}" style="--tint:${projectById.get(task.project).color}">
        <span class="tab-code">${task.code}</span>
        <span class="tab-main"><b>${esc(task.title)}</b><small>${esc(projectName(task))} · ${esc(conditionText(task))}</small></span>
        <span class="tab-mark ${state}" aria-hidden="true">${markOf(state)}</span>
      </button></li>`;
    }).join('') : '<li class="queue-empty">此筛选下没有任务。<button class="ghost" type="button" data-filter="all">清除筛选</button></li>';
    if (window.matchMedia('(max-width: 1080px)').matches) {
      const list = $('queue-list');
      const tab = list.querySelector('[aria-current="true"]');
      if (tab) list.scrollLeft = Math.max(0, tab.offsetLeft - (list.clientWidth - tab.clientWidth) / 2);
    }
    const note = $('queue-note');
    note.hidden = visible.some(task => task.id === active);
    if (!note.hidden) {
      note.innerHTML = `当前 ${current().code} 不在筛选范围。<button class="ghost" type="button" data-open="${active}">回到当前</button>`;
    }
  }

  function gateRow(gate) {
    return `<li class="gate-row ${gate.state}">
      <span class="gate-mark" aria-hidden="true"></span>
      <div class="gate-main"><span class="mono">${gate.code}</span><b>${esc(gate.title)}</b><small>${esc(gate.detail)}</small></div>
      <span class="gate-state">${gate.stateText}</span>
      ${gate.action || ''}
    </li>`;
  }

  function renderDossier() {
    const task = current();
    const detail = info.get(task.id);
    const project = projectById.get(task.project);
    const dossier = $('dossier');
    dossier.dataset.code = task.code;
    dossier.dataset.state = stateOf(task);
    dossier.dataset.phase = task.phase;
    dossier.dataset.pending = String(detail.pending.length);
    dossier.dataset.committed = String(detail.committed);
    $('spine-code').textContent = task.code;
    $('path').innerHTML = view.path.length > 1
      ? view.path.slice(0, -1).map((entry, index) => {
        const ancestor = byId.get(entry.id);
        return `<button class="path-back" type="button" data-return="${index}">← ${ancestor.code} ${esc(shorten(ancestor.title))}</button><span class="path-arrow">依赖 →</span>`;
      }).join('') + `<span class="path-current">${task.code}</span>`
      : `<span class="path-root">当前任务</span><span class="path-arrow">/</span><span class="path-current">${task.code}</span>`;
    $('task-kicker').textContent = `${project.code} / ${project.name} · ${task.kind} · 计划 ${task.date}`;
    $('task-title').textContent = task.title;
    $('task-output').innerHTML = `<span>预期产出</span>${esc(task.output || '未填写')}`;
    const stamp = $('task-stamp');
    stamp.className = 'stamp ' + stateOf(task);
    stamp.textContent = task.phase === 'done' ? '已 完 成' : task.blocker ? '阻 塞' : phaseLabel(task);

    const gates = [];
    gates.push({
      code: 'KIND', title: '承诺层级',
      detail: detail.committed ? '已承诺任务' : `${task.kind} · 尚未进入本周承诺`,
      state: detail.committed ? 'pass' : 'hold', stateText: detail.committed ? '通过' : '未承诺',
    });
    task.deps.forEach(id => {
      const dep = byId.get(id);
      if (!dep) {
        gates.push({ code: id, title: '前置记录缺失', detail: '无法查看', state: 'hold', stateText: '缺失' });
        return;
      }
      const conflict = detail.direct.find(entry => entry.id === id)?.conflict;
      gates.push({
        code: dep.code, title: dep.title,
        detail: conflict ? `${dep.code} 的完成记录与前置冲突` : conditionText(dep),
        state: conflict ? 'conflict' : dep.phase === 'done' ? 'pass' : 'hold',
        stateText: conflict ? '冲突' : dep.phase === 'done' ? '完成' : '未完成',
        action: `<button class="gate-open" type="button" data-follow="${dep.id}" aria-label="查看 ${dep.code} ${esc(dep.title)}">查看 ↗</button>`,
      });
    });
    gates.push({
      code: 'HOLD', title: '人工阻塞',
      detail: task.blocker ? task.blocker.reason : '无',
      state: task.blocker ? 'hold' : 'pass', stateText: task.blocker ? '阻塞' : '无',
    });
    $('gate-list').innerHTML = gates.map(gateRow).join('');
    const open = gates.filter(gate => gate.state === 'pass').length;
    $('gates-meta').textContent = `${open} / ${gates.length} 通过`;

    const result = task.completion || lastFinish(task);
    $('output-meta').textContent = result ? '结果已形成' : '结果未形成';
    $('output-body').innerHTML = `
      <div class="yield-cell"><span class="micro">预期产出</span><p>${esc(task.output || '未填写')}</p></div>
      <div class="yield-cell ${result ? 'is-formed' : 'is-empty'}"><span class="micro">当前结果</span><p>${esc(result || '未形成')}</p></div>
      <div class="yield-cell ${task.evidence ? 'is-formed' : 'is-empty'}"><span class="micro">证据索引</span><p>${esc(task.evidence || '未建立索引')}</p></div>
      ${task.note && notes[task.note] ? `<div class="note-strip"><span class="micro">关联判断</span><b>${esc(notes[task.note].title)}</b><p>${esc(notes[task.note].result)}</p></div>` : ''}`;

    const entries = [...task.history].reverse();
    $('records-meta').textContent = entries.length ? `${entries.length} 条` : '空';
    $('record-list').innerHTML = entries.length ? entries.map(entry => {
      const label = DeckModel.ACTION_LABELS[entry.action] || entry.action;
      return `<li><span class="record-action">${label}</span><span class="record-at">${entry.at || ''}</span><p>${esc(recordText(entry))}</p></li>`;
    }).join('') : '<li class="record-empty">尚无操作记录。开始或完成这项任务后会写在这里。</li>';
  }

  function recordText(entry) {
    if (entry.action === 'start') return '进入进行中。';
    if (entry.action === 'finish') return entry.note;
    if (entry.action === 'block') return '原因：' + entry.note;
    if (entry.action === 'release') {
      return `原阻塞：${entry.note}${entry.basis ? ' · 依据：' + entry.basis : ''} · 恢复阶段：${DeckModel.PHASES[entry.stage]}`;
    }
    if (entry.action === 'commit') return entry.note ? '承诺依据：' + entry.note : '进入已承诺任务。';
    return `${entry.note ? '原因：' + entry.note + ' · ' : ''}保留此前结果：${entry.result || '未填写'}`;
  }

  function lastFinish(task) {
    const finishes = task.history.filter(entry => entry.action === 'finish');
    return finishes.length ? finishes[finishes.length - 1].note : '';
  }

  function primaryAction(task, detail) {
    if (task.phase === 'done') {
      if (detail.selfConflict) return { action: 'reopen', label: '撤销完成并重开', target: '待开始', tone: 'warn' };
      if (tasks.some(other => other.deps.includes(task.id) && other.phase === 'done')) return null;
      return { action: 'reopen', label: '重新打开', target: '待开始', tone: 'ghost' };
    }
    if (task.blocker) return { action: 'release', label: '解除阻塞', target: task.phase === 'unknown' ? '恢复阶段' : restingPhase(task), tone: 'warn' };
    if (!detail.committed) return { action: 'commit', label: '承诺任务', target: '进入待开始', tone: 'primary' };
    if (!detail.ready) return null;
    if (task.phase === 'todo') return { action: 'start', label: '确认开始', target: '进行中', tone: 'primary' };
    return { action: 'finish', label: '记录完成', target: '已完成', tone: 'primary' };
  }

  function guidance(task, detail, primary) {
    if (task.phase === 'done') {
      if (detail.selfConflict) return `完成记录与前置冲突：${detail.causes.join('、')} 尚未完成。重开会撤销完成资格，此前结果保留。`;
      if (!primary) return `已完成，但已有下游任务建立在它之上。先核对依赖方，再决定是否重开。`;
      return '已完成。重开会撤销完成资格，此前结果与原因保留在记录。';
    }
    if (task.blocker) return `人工阻塞：${task.blocker.reason} 解除后恢复${restingPhase(task)}。`;
    if (!detail.committed) return `${task.kind}，尚未进入本周承诺。承诺后才检查前置与执行条件。`;
    if (detail.conflicts.length) return `上游完成记录与前置冲突：${detail.conflicts.map(entry => entry.task.code).join('、')}。核对前不推进。`;
    if (detail.pending.length) return `等待 ${detail.pending.filter(entry => entry.task).map(entry => entry.task.code).join('、')} 完成。`;
    if (task.phase === 'todo') return '前置已满足。确认后进入进行中，届时才能记录实际结果。';
    return '正在执行，前置仍满足。填写实际结果后进入已完成，并重算下游资格。';
  }

  function renderConsole() {
    const task = current();
    const detail = info.get(task.id);
    const primary = primaryAction(task, detail);
    const index = !detail.committed ? 0 : task.phase === 'todo' ? 1 : task.phase === 'active' ? 2 : 3;
    const stations = [
      { num: '00', label: '承诺', sub: detail.committed ? '已承诺' : '未承诺' },
      { num: '01', label: '待开始', sub: !detail.committed ? '—' : task.phase === 'todo' ? (detail.ready ? '可开始' : '等待前置') : '—' },
      { num: '02', label: '进行中', sub: task.phase === 'active' ? (task.blocker ? '人工阻塞' : '执行中') : '—' },
      { num: '03', label: '已完成', sub: task.phase === 'done' ? (detail.selfConflict ? '记录冲突' : '已完成') : '—' },
    ];
    const gateTexts = [
      detail.committed ? (detail.depsSatisfied ? '前置已满足' : `前置 ${detail.pending.length} 项未满足`) : '需先承诺',
      !detail.committed ? '—' : task.phase === 'todo' ? (detail.ready ? '确认开始' : '未满足') : (task.phase === 'active' || task.phase === 'done' ? '已开始' : '—'),
      task.phase === 'active' ? (task.blocker ? '人工阻塞未解除' : detail.ready ? '需填写实际结果' : '前置未满足') : (task.phase === 'done' ? '结果已记录' : '—'),
    ];
    const gateOpen = [
      Boolean(detail.committed && detail.depsSatisfied),
      ['active', 'done'].includes(task.phase),
      task.phase === 'done',
    ];
    const ladder = stations.map((station, position) => {
      const state = position < index ? 'complete' : position === index ? 'current' : 'future';
      const flags = [
        state === 'current' && task.blocker ? ' held' : '',
        state === 'current' && task.phase === 'done' && detail.selfConflict ? ' conflict' : '',
      ].join('');
      const gate = position < stations.length - 1
        ? `<li class="ladder-gate ${gateOpen[position] ? 'open' : ''}"><span aria-hidden="true"></span><p>${gateTexts[position]}</p></li>`
        : '';
      return `<li class="station ${state}${flags}">
        <span class="station-node">${station.num}</span>
        <div class="station-copy"><b>${station.label}</b><small>${station.sub}</small></div>
      </li>${gate}`;
    }).join('');

    const secondary = detail.actions.includes('block') && primary?.action !== 'block'
      ? '<button class="ghost wide" type="button" data-action="block">登记人工阻塞</button>'
      : '';

    const actionBlock = primary
      ? `<button id="primary-action" class="primary ${primary.tone}" type="button" data-action="${primary.action}">
          <span>${primary.label}</span><small>→ ${primary.target}</small>
        </button>${secondary}`
      : `<div class="blocked-action">
          <span class="micro">不可推进</span>
          <p>${esc(guidance(task, detail, primary))}</p>
          <button class="ghost" type="button" data-jump="gates">查看进入条件 ↓</button>
        </div>`;

    $('console').innerHTML = `
      <header class="console-head">
        <p class="micro">TRANSITION / 状态转换</p>
        <div><h2>推进路径</h2><span class="console-code">${task.code}</span></div>
      </header>
      <ol class="ladder">${ladder}</ol>
      <section class="now">
        <p class="micro">现在可以</p>
        ${actionBlock}
        ${primary ? `<p class="why">${esc(guidance(task, detail, primary))}</p>` : ''}
      </section>
      <section class="impact">
        <p class="micro">提交后</p>
        <ul>${impactList(task, detail, primary)}</ul>
      </section>`;

    $('mobile-dock').innerHTML = `
      <button class="dock-state" type="button" data-jump="console"><span class="micro">${task.code} · ${esc(projectName(task))} / 状态↓</span><b>${esc(STATE_LABEL[stateOf(task)])}</b></button>
      ${primary
        ? `<button class="primary ${primary.tone}" type="button" data-action="${primary.action}"><span>${primary.label}</span><small>→ ${primary.target}</small></button>`
        : '<button class="ghost" type="button" data-jump="gates">查看进入条件</button>'}`;
  }

  function impactList(task, detail, primary) {
    if (!primary) {
      const items = detail.pending.filter(entry => entry.task).slice(0, 3).map(entry =>
        `<li><span class="arrow">·</span><button class="link" type="button" data-follow="${entry.task.id}">${entry.task.code}</button> 尚未完成</li>`);
      if (!items.length) items.push('<li><span class="arrow">·</span>先核对任务记录与依赖。</li>');
      return items.join('');
    }
    const input = { phase: task.phase === 'unknown' ? 'todo' : undefined };
    const result = DeckModel.impact(tasks, task.id, primary.action, input);
    if (result.error) return `<li><span class="arrow">!</span>${esc(result.error)}</li>`;
    const lines = [];
    const before = task.phase === 'done' ? '已完成' : task.blocker ? '人工阻塞' : primary.action === 'commit' ? task.kind : phaseLabel(task);
    const after = primary.action === 'commit' ? '已承诺' : primary.action === 'block' ? '人工阻塞' : primary.action === 'start' ? '进行中' : primary.action === 'finish' ? '已完成' : primary.action === 'reopen' ? '待开始' : phaseLabel(result.after);
    lines.push(`<li><span class="arrow">→</span><span><b>${task.code}</b> ${before} → ${after}</span></li>`);
    result.gained.slice(0, 3).forEach(item => {
      lines.push(`<li><span class="arrow gained">+</span><span><button class="link" type="button" data-open="${item.id}">${item.code}</button> 前置满足，可推进</span></li>`);
    });
    result.lost.slice(0, 3).forEach(item => {
      lines.push(`<li><span class="arrow lost">−</span><span><button class="link" type="button" data-open="${item.id}">${item.code}</button> 重新等待前置</span></li>`);
    });
    if (primary.action === 'commit') {
      lines.push(`<li><span class="arrow">·</span>${detail.depsSatisfied ? '承诺后可立即开始。' : `承诺后仍等待 ${detail.pending.map(entry => entry.task?.code || entry.id).join('、')}。`}</li>`);
    }
    return lines.join('');
  }

  function renderAll() {
    renderTotals();
    renderProjects();
    renderQueue();
    renderDossier();
    renderConsole();
  }

  function openTask(id) {
    if (!byId.has(id)) return;
    view.path = [{ id }];
    renderAll();
    $('task-title').focus();
  }

  function follow(id, opener) {
    if (!current().deps.includes(id) || !byId.has(id) || view.path.some(entry => entry.id === id)) return;
    view.path.push({ id, scroll: window.scrollY, from: id });
    renderAll();
    $('task-title').focus();
  }

  function goBack(index) {
    const removed = view.path[index + 1];
    view.path.splice(index + 1);
    renderAll();
    window.scrollTo(0, removed.scroll || 0);
    const source = document.querySelector(`[data-follow="${removed.id}"]`) || $('task-title');
    source.focus({ preventScroll: true });
  }

  function stateChangeText(task, action, after) {
    const before = task.phase === 'done' ? '已完成' : task.blocker ? '人工阻塞' : phaseLabel(task);
    if (action === 'commit') return [task.kind, '已承诺'];
    if (action === 'start') return ['待开始', '进行中'];
    if (action === 'finish') return ['进行中', '已完成'];
    if (action === 'block') return [before, '人工阻塞'];
    if (action === 'release') return ['人工阻塞', after ? phaseLabel(after) : (task.phase === 'unknown' ? '待开始' : phaseLabel(task))];
    return ['已完成', '待开始'];
  }

  function fieldFor(task, action) {
    if (action === 'commit') return '<label>承诺依据（可选）<textarea name="note" maxlength="500" rows="2" aria-describedby="transaction-error"></textarea></label>';
    if (action === 'finish') return '<label>实际结果或产物位置<textarea name="note" maxlength="500" rows="3" aria-describedby="transaction-error"></textarea></label>';
    if (action === 'block') return '<label>阻塞原因<textarea name="note" maxlength="500" rows="3" aria-describedby="transaction-error"></textarea></label>';
    if (action === 'reopen') return '<label>重开原因（可选）<textarea name="note" maxlength="500" rows="2" aria-describedby="transaction-error"></textarea></label>';
    if (action === 'release') {
      const select = task.phase === 'unknown'
        ? '<label>阻塞前的执行阶段<select name="phase" aria-describedby="transaction-error"><option value="">选择原阶段</option><option value="todo">待开始</option><option value="active">进行中</option></select></label>'
        : '';
      return select + '<label>解除依据（可选）<textarea name="note" maxlength="500" rows="2" aria-describedby="transaction-error"></textarea></label>';
    }
    return '';
  }

  function confirmLabel(action) {
    return { commit: '确认承诺', start: '确认开始', finish: '确认完成', block: '确认登记', release: '确认解除', reopen: '确认重开' }[action] || ('确认' + DeckModel.ACTION_LABELS[action]);
  }

  function openTransaction(action, opener) {
    const task = current();
    const detail = info.get(task.id);
    if (!detail.actions.includes(action)) return;
    draft = { id: task.id, action, opener };
    const input = { phase: task.phase === 'unknown' ? 'todo' : undefined };
    const result = DeckModel.impact(tasks, task.id, action, input);
    const [before, after] = stateChangeText(task, action, result.after);
    const label = DeckModel.ACTION_LABELS[action];
    const impacts = result.error ? `<li>${esc(result.error)}</li>` : [
      `<li><b>${task.code}</b> ${before} → ${after}</li>`,
      ...result.gained.slice(0, 3).map(item => `<li>${item.code} 前置满足，可推进</li>`),
      ...result.lost.slice(0, 3).map(item => `<li>${item.code} 将重新等待</li>`),
    ].join('');
    const note = action === 'reopen' && task.completion ? `<p class="dialog-note">此前结果会保留在任务记录：${esc(shorten(task.completion))}</p>` : '';
    const conditions = [detail.committed ? '已承诺' : '未承诺', task.deps.length ? `前置 ${task.deps.length - detail.pending.length}/${task.deps.length}` : '无前置', task.blocker ? '人工阻塞' : '无人工阻塞'].join(' · ');
    form.innerHTML = `
      <div class="dialog-head">
        <p class="micro">TRANSACTION / 提交预览</p>
        <h2 id="transaction-title">${label}</h2>
        <p>${task.code} · ${esc(task.title)}</p>
      </div>
      <div class="state-change"><span>${before}</span><i aria-hidden="true">→</i><span>${after}</span></div>
      <p class="dialog-conditions">当前条件：${conditions}</p>
      <div class="dialog-impact"><p class="micro">影响</p><ul>${impacts}</ul></div>
      ${note}
      ${fieldFor(task, action)}
      <p id="transaction-error" class="error" role="alert" hidden></p>
      <div class="dialog-actions">
        <button id="cancel-transaction" class="ghost" type="button">取消</button>
        <button class="primary" type="submit">${confirmLabel(action)}</button>
      </div>`;
    dialog.showModal();
    (form.querySelector('textarea, select') || form.querySelector('[type=submit]')).focus();
  }

  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    draft?.opener.focus();
    draft = null;
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!draft) return;
    const values = Object.fromEntries(new FormData(form));
    const action = draft.action;
    const before = tasks;
    const receiptLabel = { commit: '已承诺', start: '进行中', finish: '已完成', block: '人工阻塞', release: '已解除阻塞', reopen: '已重开，此前结果保留' }[action];
    const preview = DeckModel.impact(before, draft.id, draft.action, { ...values, phase: values.phase || undefined });
    const result = DeckModel.transition(before, draft.id, draft.action, values);
    if (result.error) {
      const error = $('transaction-error');
      error.textContent = result.error;
      error.hidden = false;
      form.querySelector('textarea, select')?.focus();
      return;
    }
    tasks = result.tasks;
    reindex();
    const changed = result.after;
    draft = null;
    dialog.close();
    renderAll();
    const gained = preview.gained || [];
    const lost = preview.lost || [];
    const tail = gained.length ? ` ${gained.map(item => item.code).join('、')} 现在可推进。`
      : lost.length ? ` ${lost.map(item => item.code).join('、')} 重新等待前置。` : '';
    const receipt = $('receipt');
    receipt.textContent = `${changed.code}：${receiptLabel}。${tail}`;
    receipt.hidden = false;
    clearTimeout(receiptTimer);
    receiptTimer = setTimeout(() => { receipt.hidden = true; }, 9000);
    receipt.focus({ preventScroll: true });
  });

  $('receipt').addEventListener('click', () => { $('receipt').hidden = true; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('receipt').hidden && !dialog.open) $('receipt').hidden = true;
  });

  $('theme').addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    $('theme').textContent = light ? '深色' : '浅色';
    $('theme').setAttribute('aria-pressed', String(light));
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const { open, project, filter, scope, follow: followId, return: backIndex, action, jump } = button.dataset;
    if (button.id === 'cancel-transaction') { dialog.close(); return; }
    if (open) { openTask(open); return; }
    if (project) {
      view.project = view.project === project ? 'all' : project;
      renderAll();
      $('queue-title').focus();
      return;
    }
    if (filter) { view.filter = filter; renderQueue(); return; }
    if (scope) { view.scope = scope; renderAll(); $('queue-title').focus(); return; }
    if (followId) { follow(followId, button); return; }
    if (backIndex !== undefined) { goBack(Number(backIndex)); return; }
    if (action) { openTransaction(action, button); return; }
    if (jump) { $(jump).focus(); }
  });

  $('week-label').textContent = data.week.label;
  $('week-range').textContent = data.week.range;
  renderAll();
})();
