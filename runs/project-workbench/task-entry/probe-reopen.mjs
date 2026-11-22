import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const product = new URL('../../../../project-console/.sites-checkout/', import.meta.url);
const requireProduct = createRequire(new URL('package.json', product));
const ts = requireProduct('typescript');
let row;
let writes = 0;
const env = {
  DB: {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            first: async () => ({ ...row }),
            async run() {
              if (sql.startsWith('INSERT OR IGNORE')) return { meta: { changes: 0 } };
              assert.match(sql, /^UPDATE workspace SET data=/);
              const [data, id, version] = args;
              assert.equal(id, 'main');
              if (row.revision !== version) return { meta: { changes: 0 } };
              row = { data, revision: version + 1 };
              writes++;
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    },
  },
};
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  const require = name => name === 'cloudflare:workers' ? { env }
    : name.startsWith('.') ? load(resolve(dirname(file), name + '.ts')) : requireProduct(name);
  new Function('require', 'module', 'exports', outputText)(require, module, module.exports);
  modules.set(file, module.exports);
  return module.exports;
}

const fromProduct = path => load(fileURLToPath(new URL(path, product)));
const { seed } = fromProduct('app/model.ts');
const { PUT } = fromProduct('app/api/state/route.ts');
const { POST } = fromProduct('app/mcp/route.ts');
const results = [];

for (const downstreamPhase of ['已完成', '进行中']) {
  const template = { ...seed.tasks[0], kind: '已承诺任务', status: '已完成', output: '隔离样例结果' };
  const upstream = { ...template, id: 'probe-upstream', deps: [] };
  const downstream = { ...template, id: 'probe-downstream', status: downstreamPhase, deps: [upstream.id] };
  const data = { ...seed, tasks: [upstream, downstream], notes: [] };
  const reopened = { ...upstream, status: '待开始' };
  const reset = () => { row = { data: JSON.stringify(data), revision: 4 }; writes = 0; };
  const persisted = () => ({ writes, revision: row.revision, phases: JSON.parse(row.data).tasks.map(task => task.status) });

  reset();
  const webResponse = await PUT(new Request('http://fixture/api/state', {
    method: 'PUT', body: JSON.stringify({ data: { ...data, tasks: [reopened, downstream] }, revision: 4 }),
  }));
  const web = { http: webResponse.status, response: await webResponse.json(), ...persisted() };

  reset();
  const agentResponse = await POST(new Request('http://fixture/mcp', {
    method: 'POST',
    headers: { 'oai-authenticated-user-id': 'local-guard-probe' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: 'upsert_task', arguments: { record: reopened, expected_revision: 4, reason: '隔离验证重开守卫' } },
    }),
  }));
  const { result } = await agentResponse.json();
  const agent = { toolError: result.isError, message: result.content[0].text, ...persisted() };
  const rejected = downstreamPhase === '已完成';
  assert.equal(web.http, 200);
  assert.deepEqual(web.phases, ['待开始', downstreamPhase]);
  assert.equal(web.writes, 1);
  assert.equal(agent.toolError, rejected);
  assert.equal(agent.writes, rejected ? 0 : 1);
  assert.deepEqual(agent.phases, [rejected ? '已完成' : '待开始', downstreamPhase]);
  results.push({ downstreamPhase, web, agent });
}

const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fileURLToPath(product), encoding: 'utf8' }).trim();
console.log(JSON.stringify({ revision, database: 'in-memory D1 replacement', results }, null, 2));
