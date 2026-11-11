globalThis.TaskWorkflow = (() => {
  const phases = { todo: '待开始', active: '进行中', done: '已完成', unknown: '原进度待确认' };
  const phaseByStatus = { 待开始: 'todo', 进行中: 'active', 已完成: 'done' };
  const actionLabels = { start: '开始任务', finish: '记录完成', block: '登记阻塞', release: '解除阻塞', reopen: '重新打开' };

  function fromRecords(records) {
    return records.map(record => {
      const blocked = record.status === '阻塞中';
      const previous = ['todo', 'active'].includes(record.previousPhase) ? record.previousPhase : 'unknown';
      return {
        id: record.id, code: record.code, title: record.title, project: record.project,
        kind: record.kind, deps: [...record.deps], output: record.output,
        phase: blocked ? previous : phaseByStatus[record.status] ?? 'unknown',
        blocker: blocked ? { reason: record.reason || '旧记录未填写阻塞原因。' } : null,
        completion: record.completion || '',
      };
    });
  }

  function dependencyIssues(tasks, id) {
    const byId = new Map(tasks.map(task => [task.id, task]));
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
      for (const parentId of task.deps) visit(parentId);
      visiting.delete(key);
      visited.add(key);
    }

    visit(id);
    return { cycle, missing: [...missing] };
  }

  function inspect(tasks, task) {
    const direct = task.deps.map(id => ({ id, task: tasks.find(candidate => candidate.id === id) }));
    const pending = direct.filter(entry => entry.task?.phase !== 'done');
    const { cycle, missing } = dependencyIssues(tasks, task.id);
    const reasons = [];
    if (task.kind !== '已承诺任务') reasons.push('先确认任务承诺。');
    if (task.phase === 'unknown') reasons.push('请确认阻塞前的进度。');
    if (cycle) reasons.push('依赖链存在循环。');
    if (missing.length) reasons.push(`依赖记录缺失：${missing.join('、')}。`);
    if (task.blocker) reasons.push(task.blocker.reason);
    if (pending.length) reasons.push(`还有 ${pending.length} 项直接前置待满足。`);
    return { direct, pending, cycle, missing, reasons, ready: reasons.length === 0 };
  }

  function actions(task, conditions) {
    if (task.phase === 'done') return ['reopen'];
    if (task.blocker) return ['release'];
    if (task.kind !== '已承诺任务') return [];
    if (task.phase === 'unknown') return [];
    if (!conditions.ready) return ['block'];
    return [task.phase === 'todo' ? 'start' : 'finish', 'block'];
  }

  function reopenImpact(tasks, id) {
    const direct = tasks.filter(task => task.deps.includes(id));
    return { open: direct.filter(task => task.phase !== 'done'), completed: direct.filter(task => task.phase === 'done') };
  }

  function transition(tasks, id, action, input = {}) {
    const before = tasks.find(task => task.id === id);
    if (!before) return { error: '任务已不可用。' };
    const conditions = inspect(tasks, before);
    if (!actions(before, conditions).includes(action)) {
      return { error: conditions.reasons[0] || '当前执行阶段无法进行这项操作。' };
    }
    const after = { ...before };
    const note = String(input.note ?? '').trim();
    if (action === 'start') after.phase = 'active';
    if (action === 'block' || action === 'finish') {
      if (!note || note.length > 500) return { error: action === 'block' ? '请填写阻塞原因（1–500 字）。' : '请填写实际结果或产物位置（1–500 字）。' };
      if (action === 'block') after.blocker = { reason: note };
      if (action === 'finish') { after.phase = 'done'; after.completion = note; }
    }
    if (action === 'release') {
      if (before.phase === 'unknown') {
        if (!['todo', 'active'].includes(input.phase)) return { error: '请选择阻塞前的执行阶段。' };
        after.phase = input.phase;
      }
      after.blocker = null;
    }
    if (action === 'reopen') {
      if (reopenImpact(tasks, id).completed.length) {
        return { error: '仍有已完成的任务依赖此项。请先处理这些任务。' };
      }
      after.phase = 'todo';
      after.completion = '';
    }
    return { before, after, tasks: tasks.map(task => task.id === id ? after : task) };
  }

  return { phases, actionLabels, fromRecords, inspect, actions, reopenImpact, transition };
})();
