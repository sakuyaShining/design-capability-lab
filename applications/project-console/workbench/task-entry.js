(() => {
  const $ = id => document.getElementById(id);
  const task = new URLSearchParams(location.search).get('task') || 'PC-01';
  const downstream = task === 'PC-02';
  const route = '/api/task-entry';
  let record;

  function sourceLink(source) {
    const link = document.createElement('a');
    link.href = source.href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.path;
    return link;
  }

  function populate(container, values, create) {
    container.replaceChildren(...values.map(create));
  }

  function listSource(source) {
    const item = document.createElement('li');
    item.append(sourceLink(source));
    return item;
  }

  function evidenceOption(source) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = source.path;
    label.append(checkbox, ' ' + source.path);
    return label;
  }

  function render() {
    const phases = { todo: '待开始', active: '进行中', done: '已完成' };
    $('entry-phase').textContent = phases[downstream ? 'todo' : record.phase];
    $('entry-start').hidden = downstream || record.phase !== 'todo';
    $('entry-form').hidden = downstream || record.phase !== 'active';
    $('entry-wait').hidden = !downstream || !!record.result;
    $('entry-result').hidden = !record.result;
    $('entry-saved').textContent = record.draft ? '已保存，可从同一地址继续。' : '';
    if (!record.result) return;
    const { id, finding, evidence, revision } = record.result;
    $('entry-result').dataset.resultId = id;
    $('entry-result-title').textContent = downstream ? 'PC-01 的核对结论' : '已提交的核对结论';
    $('result-text').textContent = finding;
    $('result-version').textContent = `PC-01 · Git ${revision.slice(0, 7)}`;
    populate($('result-sources'), evidence, listSource);
    $('downstream').hidden = downstream;
    $('upstream').hidden = !downstream;
  }

  function message(value, error = false) {
    const notice = $('entry-message');
    notice.textContent = value;
    notice.toggleAttribute('data-error', error);
    notice.hidden = false;
    notice.focus();
  }

  async function change(action, fields = {}) {
    const buttons = [...document.querySelectorAll('#start-entry, #entry-form button')];
    buttons.forEach(button => { button.disabled = true; });
    try {
      const response = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, version: record.version, ...fields }),
      });
      const value = await response.json();
      if (!response.ok) {
        message(value.error, true);
        return;
      }
      record = value;
      render();
      const notices = {
        start: '已开始核对。',
        save: '进展已保存。关闭后可从同一地址接续。',
        submit: '核对结论已提交。PC-02 现可查看这份依据。',
      };
      message(notices[action]);
    } catch {
      message('未收到保存结果。请先保留本页输入，再从另一个标签核对记录。', true);
    } finally {
      buttons.forEach(button => { button.disabled = false; });
    }
  }

  async function load() {
    if (!['PC-01', 'PC-02'].includes(task)) {
      $('entry-status').textContent = '试点没有这个任务。请从工作台进入。';
      return;
    }
    const readme = `tasks/${task}/index.html`;
    if (location.protocol === 'file:') {
      location.replace(readme);
      return;
    }
    try {
      const response = await fetch(route);
      if (!response.ok) throw Error('load');
      const data = await response.json();
      record = data.record;
      $('entry-id').textContent = task;
      $('entry-readme').href = readme;
      $('current-task').textContent = downstream ? '评估是否统一 Web 与 Agent 的重开规则' : '核对 Web 与 Agent 的任务重开规则';
      $('entry-goal').textContent = downstream
        ? '根据 PC-01 的核对结论，判断是否需要让两种写入入口采用同一守卫。'
        : '核对仍有已完成下游时能否重开前置。交付简短结论，并注明实际核对的源码。';
      document.querySelector(`.entry-queue a[href="?task=${task}"]`).setAttribute('aria-current', 'page');
      $('entry-input').hidden = downstream;
      $('source-revision').textContent = `产品仓库 · Git ${data.sourceVersion.revision.slice(0, 7)}`;
      populate($('entry-sources'), data.sourceVersion.sources, listSource);
      populate($('entry-evidence'), data.sourceVersion.sources, evidenceOption);
      $('entry-draft').value = record.draft;
      render();
      $('entry-status').hidden = true;
      $('entry').hidden = false;
      if (location.hash === '#entry-result') $('entry-result').scrollIntoView();
    } catch {
      $('entry-status').textContent = '读取任务失败。确认本机服务已启动后刷新。';
    }
  }

  $('start-entry').addEventListener('click', () => change('start'));
  $('save-entry').addEventListener('click', () => change('save', { draft: $('entry-draft').value }));
  $('entry-form').addEventListener('submit', event => {
    event.preventDefault();
    const evidence = [...$('entry-evidence').querySelectorAll(':checked')].map(input => input.value);
    change('submit', { finding: $('entry-finding').value, evidence });
  });
  load();
})();
