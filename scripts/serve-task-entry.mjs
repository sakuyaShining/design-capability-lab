import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const product = new URL('../project-console/.sites-checkout/', root);
const run = process.env.DCL_TASK_ENTRY_RUN
  ? pathToFileURL(resolve(process.env.DCL_TASK_ENTRY_RUN) + sep)
  : new URL('../runs/project-workbench/task-entry/', import.meta.url);
const record = new URL('record.json', run);
const base = '/applications/project-console/workbench/';
const entry = base + 'task-entry.html?task=PC-01';
const port = Number(process.env.DCL_TASK_ENTRY_PORT || 5187);
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fileURLToPath(product), encoding: 'utf8' }).trim();
const assets = new Map();

function asset(route, file, type) {
  assets.set(route, { body: readFileSync(file), type });
}

for (const [file, type] of Object.entries({
  'index.html': 'text/html', 'task-entry.html': 'text/html', 'app.js': 'text/javascript',
  'task-entry.js': 'text/javascript', 'style.css': 'text/css', 'task-entry.css': 'text/css',
  'task-docs.css': 'text/css', 'task-entry.md': 'text/plain', 'tasks/index.html': 'text/html',
})) asset(base + file, new URL(base.slice(1) + file, root), type + '; charset=utf-8');
for (const task of readdirSync(new URL(base.slice(1) + 'tasks/', root), { withFileTypes: true })) {
  if (!task.isDirectory()) continue;
  const directory = base + 'tasks/' + task.name + '/';
  asset(directory + 'index.html', new URL(directory.slice(1) + 'index.html', root), 'text/html; charset=utf-8');
  asset(directory + 'README.md', new URL(directory.slice(1) + 'README.md', root), 'text/plain; charset=utf-8');
  const diagram = new URL(directory.slice(1) + 'archify.html', root);
  if (existsSync(diagram)) asset(directory + 'archify.html', diagram, 'text/html; charset=utf-8');
}
for (const file of ['record.json', 'guard-probe.json']) {
  const path = '/runs/project-workbench/task-entry/' + file;
  const snapshot = new URL(path.slice(1), root);
  if (existsSync(snapshot)) asset(path, snapshot, 'application/json; charset=utf-8');
}
for (const [file, type] of Object.entries({
  'prototypes/data.js': 'text/javascript; charset=utf-8',
  'state-study/model.js': 'text/javascript; charset=utf-8',
  'prototypes/assets/Saira.ttf': 'font/ttf',
})) {
  const path = '/applications/project-console/' + file;
  asset(path, new URL(path.slice(1), root), type);
}

const sources = ['app/page.tsx', 'app/agent.ts', 'app/api/state/route.ts', 'app/validate.ts'].map(path => {
  const href = '/source/' + path;
  asset(href, new URL(path, product), 'text/plain; charset=utf-8');
  const sha256 = createHash('sha256').update(assets.get(href).body).digest('hex');
  return { path, href: `${href}?sha256=${sha256}`, sha256 };
});
const sourceVersion = { revision, sources };

function read() {
  try {
    return JSON.parse(readFileSync(record, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { version: 0, phase: 'todo', draft: '', result: null };
  }
}

function write(next) {
  mkdirSync(run, { recursive: true });
  const pending = new URL('record.pending.json', run);
  writeFileSync(pending, JSON.stringify(next, null, 2) + '\n');
  renameSync(pending, record);
}

function respond(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

function json(res, status, value) {
  respond(res, status, 'application/json; charset=utf-8', JSON.stringify(value));
}

async function change(req, res) {
  if (req.headers.origin !== `http://127.0.0.1:${port}` || req.headers['content-type'] !== 'application/json') {
    return json(res, 403, { error: '请从本机试用页面提交。' });
  }
  let body = '';
  req.setEncoding('utf8');
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > 32_000) return json(res, 413, { error: '输入过长。' });
  }
  let input;
  try {
    input = JSON.parse(body);
  } catch {
    return json(res, 400, { error: '提交格式有误。' });
  }
  const current = read();
  if (input?.version !== current.version) return json(res, 409, { error: '记录已在另一处更新。请先抄存本页内容，再刷新核对。' });
  const at = new Date().toISOString();
  const next = { ...current, version: current.version + 1, updatedAt: at };
  if (current.phase === 'todo' && input.action === 'start') {
    next.phase = 'active';
  } else if (current.phase === 'active' && input.action === 'save' && typeof input.draft === 'string' && input.draft.length <= 3000) {
    next.draft = input.draft;
  } else if (current.phase === 'active' && input.action === 'submit') {
    const finding = typeof input.finding === 'string' ? input.finding.trim() : '';
    const evidence = Array.isArray(input.evidence) ? sources.filter(source => input.evidence.includes(source.path)) : [];
    if (!finding || finding.length > 3000 || !evidence.length) {
      return json(res, 422, { error: '请填写核对结论，并选择实际用到的源码。' });
    }
    next.phase = 'done';
    next.result = { id: 'PC-01-result', finding, evidence, revision, submittedAt: at };
  } else {
    return json(res, 422, { error: '当前阶段无法提交这项操作。' });
  }
  write(next);
  return json(res, 200, next);
}

const server = createServer(async (req, res) => {
  if (req.headers.host !== `127.0.0.1:${port}`) return respond(res, 403, 'text/plain', 'Local preview only.');
  const { pathname, searchParams } = new URL(req.url, `http://127.0.0.1:${port}`);
  try {
    if (req.method === 'GET' && pathname === '/') {
      res.writeHead(302, { Location: entry });
      return res.end();
    }
    if (req.method === 'GET' && pathname === '/api/task-entry') {
      return json(res, 200, { record: read(), sourceVersion });
    }
    if (req.method === 'POST' && pathname === '/api/task-entry') return await change(req, res);
    const file = assets.get(pathname);
    const hash = searchParams.get('sha256');
    if (file && pathname.startsWith('/source/') && hash && createHash('sha256').update(file.body).digest('hex') !== hash) {
      return respond(res, 409, 'text/plain; charset=utf-8', '本机源码已变化。请按成果记录中的 Git 版本取回当时的源码。');
    }
    if (req.method === 'GET' && file) return respond(res, 200, file.type, file.body);
    return respond(res, 404, 'text/plain', 'Not found.');
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: '试用记录暂时无法读取或保存。输入仍留在本页。' });
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Task entry: http://127.0.0.1:${port}${entry}`));
