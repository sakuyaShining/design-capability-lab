import fs from 'node:fs';import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL('C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const out=process.argv[2]||'runs/review-02';fs.mkdirSync(out,{recursive:true});const results=[];
try{
 const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 async function verify(name){const r=await p.evaluate(()=>{const path=[...Lab.state.history,Lab.state.focus];return{path,origin:Lab.state.origin,valid:path.every((id,i)=>!i||Lab.task(path[i-1]).deps.includes(id))};});if(!r.valid)throw Error(name+' false dependency');results.push({name,...r});}
 await p.goto('http://127.0.0.1:5197/?v=B');await p.locator('.graph [data-id="rules"]').click();await verify('B click second-depth leaf');
 await p.goto('http://127.0.0.1:5197/?v=C');await p.locator('[data-id="direction"][data-act="focus"]').first().click();await p.locator('[data-id="mentor"][data-act="focus"]').first().click();await p.locator('.drill-column').first().locator('[data-id="reuse"]').click();await verify('C revisit earlier branch');if(results.at(-1).path.join()!=='scheme,reuse')throw Error('C does not truncate');
 await p.goto('http://127.0.0.1:5197/?v=F');await p.locator('.matrix [data-from="reuse"][data-id="rules"]').click();await verify('F unrelated current row cell');if(results.at(-1).path.join()!=='scheme,reuse,rules')throw Error('F row meaning lost');
 await p.locator('.matrix thead [data-id="mentor"]').click();await verify('F column changes origin');if(results.at(-1).origin!=='mentor')throw Error('F header does not reset origin');
 await p.evaluate(()=>Lab.focus('archive'));await verify('unrelated object switches origin');if(results.at(-1).origin!=='archive')throw Error('Unrelated origin');
 if(errors.length)throw Error(errors.join(';'));fs.writeFileSync(out+'/path-regression.json',JSON.stringify({date:'2026-11-11',results,page_errors:errors},null,2));console.log(`PASS ${results.length} path semantics regressions`);
}finally{await browser.close();}
