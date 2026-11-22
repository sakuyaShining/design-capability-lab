globalThis.DeckModel = (() => {
  const PHASES = { todo: '待开始', active: '进行中', done: '已完成', unknown: '进度待确认' };
  const COMMITTED = '已承诺任务';
  const ACTION_LABELS = { commit: '承诺任务', start: '开始任务', finish: '记录完成', block: '登记阻塞', release: '解除阻塞', reopen: '重新打开' };
  const TODAY = '11-22';

  function phaseOf(record) {
    if (record.status === '阻塞中') return ['todo', 'active'].includes(record.previousPhase) ? record.previousPhase : 'unknown';
    return { 待开始: 'todo', 进行中: 'active', 已完成: 'done' }[record.status] || 'todo';
  }

  function normalize(records) {
    return records.map(record => {
      const blocked = record.status === '阻塞中';
      return {
        id: record.id, code: record.code, title: record.title, project: record.project,
        kind: record.kind, deps: [...record.deps], output: record.output, date: record.date,
        evidence: record.evidence || '', note: record.note || '',
        phase: phaseOf(record),
        blocker: blocked ? { reason: record.reason || '旧记录未填写原因。', stage: phaseOf(record) } : null,
        completion: record.completion || '',
        history: Array.isArray(record.history) ? record.history.map(entry => ({ ...entry })) : [],
      };
    });
  }

  function indexOf(tasks) {
    return new Map(tasks.map(task => [task.id, task]));
  }

  function dependencyIssues(tasks, id) {
    const byId = indexOf(tasks);
    const visited = new Set();
    const visiting = new Set();
    const missing = new Set();
    let cycle = false;
    function visit(key) {
      if (visiting.has(key)) { cycle = true; return; }
      if (visited.has(key)) return;
      const task = byId.get(key);
      if (!task) { missing.add(key); return; }
      visiting.add(key);
      for (const parent of task.deps) visit(parent);
      visiting.delete(key);
      visited.add(key);
    }
    visit(id);
    return { cycle, missing: [...missing] };
  }

  function completionTrust(tasks) {
    const byId = indexOf(tasks);
    const memo = new Map();
    const visiting = new Set();
    function trusted(id) {
      if (memo.has(id)) return memo.get(id);
      const task = byId.get(id);
      if (!task || task.phase !== 'done' || visiting.has(id)) return false;
      visiting.add(id);
      const usable = task.deps.every(dep => trusted(dep));
      visiting.delete(id);
      memo.set(id, usable);
      return usable;
    }
    return { byId, trusted };
  }

  function unmetCauses(byId, id, seen = new Set()) {
    const task = byId.get(id);
    if (!task) return [id];
    if (task.phase !== 'done') return [task.code];
    if (seen.has(id)) return [task.code];
    seen.add(id);
    return task.deps.flatMap(dep => unmetCauses(byId, dep, seen));
  }

  function inspect(tasks, task) {
    const byId = indexOf(tasks);
    const { trusted } = completionTrust(tasks);
    const direct = task.deps.map(id => {
      const dep = byId.get(id);
      return { id, task: dep, conflict: Boolean(dep && dep.phase === 'done' && !trusted(dep.id)) };
    });
    const pending = direct.filter(entry => !entry.task || entry.task.phase !== 'done');
    const conflicts = direct.filter(entry => entry.conflict)
      .map(entry => ({ ...entry, causes: unmetCauses(byId, entry.id) }));
    const { cycle, missing } = dependencyIssues(tasks, task.id);
    const selfConflict = task.phase === 'done' && !trusted(task.id);
    const causes = selfConflict ? unmetCauses(byId, task.id) : [];
    const committed = task.kind === COMMITTED;
    const depsSatisfied = pending.length === 0 && !cycle && !missing.length && !conflicts.length && !selfConflict;
    const ready = committed && !task.blocker && depsSatisfied;
    const reasons = [];
    if (!committed) reasons.push('尚未承诺：先确认这项是否进入本周执行。');
    if (task.phase === 'unknown') reasons.push('需要补记阻塞前的执行阶段。');
    if (cycle) reasons.push('依赖链存在循环。');
    if (missing.length) reasons.push(`依赖记录缺失：${missing.join('、')}。`);
    if (task.blocker) reasons.push(task.blocker.reason);
    if (pending.length) reasons.push(`等待 ${pending.filter(entry => entry.task).map(entry => entry.task.code).join('、')} 完成。`);
    if (conflicts.length) reasons.push(`上游完成记录与前置冲突：${conflicts.map(entry => entry.task.code).join('、')}。`);
    if (selfConflict) reasons.push(`完成记录与前置冲突：${causes.join('、')} 尚未完成。`);
    let actions = [];
    if (task.phase === 'done') actions = ['reopen'];
    else if (task.blocker) actions = ['release'];
    else if (!committed) actions = ['commit'];
    else if (ready && task.phase === 'todo') actions = ['start', 'block'];
    else if (ready && task.phase === 'active') actions = ['finish', 'block'];
    else actions = ['block'];
    return {
      direct, pending, conflicts, selfConflict, causes, cycle, missing,
      committed, depsSatisfied, ready, reasons, actions,
    };
  }

  function apply(tasks, id, action, input, validate) {
    const before = tasks.find(task => task.id === id);
    if (!before) return { error: '任务已不可用。' };
    const info = inspect(tasks, before);
    if (!info.actions.includes(action)) {
      return { error: info.reasons[0] || '当前状态不能进行这项操作。' };
    }
    const note = String(input.note ?? '').trim();
    const after = { ...before, history: [...before.history] };
    if (action === 'commit') {
      after.kind = COMMITTED;
      after.history.push({ action: 'commit', at: TODAY, note });
    }
    if (action === 'start') {
      after.phase = 'active';
      after.history.push({ action: 'start', at: TODAY });
    }
    if (action === 'block' || action === 'finish') {
      if (validate && (!note || note.length > 500)) {
        return { error: action === 'block' ? '请填写阻塞原因（1–500 字）。' : '请填写实际结果或产物位置（1–500 字）。' };
      }
      const text = note || '（预览）';
      if (action === 'block') {
        after.blocker = { reason: text, stage: before.phase };
        after.history.push({ action: 'block', at: TODAY, note: text, stage: before.phase });
      } else {
        after.phase = 'done';
        after.completion = text;
        after.history.push({ action: 'finish', at: TODAY, note: text });
      }
    }
    if (action === 'release') {
      if (before.phase === 'unknown') {
        if (!['todo', 'active'].includes(input.phase)) return { error: '请选择阻塞前的执行阶段。' };
        after.phase = input.phase;
      }
      after.blocker = null;
      after.history.push({
        action: 'release', at: TODAY, note: before.blocker?.reason || '', basis: note, stage: after.phase,
      });
    }
    if (action === 'reopen') {
      const completed = tasks.filter(task => task.deps.includes(id) && task.phase === 'done');
      if (completed.length) {
        return { error: `已完成的 ${completed.map(task => task.code).join('、')} 依赖此项，不能重开。` };
      }
      after.phase = 'todo';
      after.completion = '';
      after.history.push({ action: 'reopen', at: TODAY, note, result: before.completion });
    }
    return { before, after, tasks: tasks.map(task => task.id === id ? after : task) };
  }

  function transition(tasks, id, action, input = {}) {
    return apply(tasks, id, action, input, true);
  }

  function eligible(tasks) {
    return new Set(tasks.filter(task => {
      if (task.phase === 'done') return false;
      const info = inspect(tasks, task);
      return info.ready;
    }).map(task => task.id));
  }

  function impact(tasks, id, action, input = {}) {
    const before = tasks.find(task => task.id === id);
    if (!before) return { error: '任务已不可用。' };
    const beforeEligible = eligible(tasks);
    const simulated = apply(tasks, id, action, { ...input, note: input.note || '（预览）' }, false);
    if (simulated.error) return { error: simulated.error };
    const afterEligible = eligible(simulated.tasks);
    const byId = indexOf(simulated.tasks);
    return {
      after: byId.get(id),
      gained: [...afterEligible].filter(key => !beforeEligible.has(key) && key !== id).map(key => byId.get(key)),
      lost: [...beforeEligible].filter(key => !afterEligible.has(key) && key !== id).map(key => byId.get(key)),
      tasks: simulated.tasks,
    };
  }

  return { PHASES, COMMITTED, ACTION_LABELS, TODAY, normalize, inspect, transition, impact, eligible };
})();
