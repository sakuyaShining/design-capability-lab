window.Lab=(()=>{
 const modes={};const params=new URLSearchParams(location.search);
 const state={variant:params.get('v')||'A',origin:'scheme',focus:'scheme',history:[],scope:'all',query:'',hideDone:false,broken:false,step:0,originScroll:0};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tasks=()=>DEMO_TASKS.map(t=>({...t,deps:t.id==='scheme'&&state.broken?[...t.deps,'missing']:t.deps}));
 const task=id=>tasks().find(t=>t.id===id)||{id,code:'未知',title:'缺失的前置记录',project:'unknown',status:'引用缺失',deps:[],output:'无法进入该对象，请先核对原始引用。',missing:true};
 const deps=t=>(t||task(state.focus)).deps.map(task);
 const open=t=>deps(t).filter(d=>d.status!=='已完成');
 const visible=()=>tasks().filter(t=>(state.scope==='all'||t.project===state.scope)&&(!state.query||(t.title+t.code).toLowerCase().includes(state.query.toLowerCase())));
 const project=id=>({ic:'集创赛',soc:'SoC / 系统',unknown:'未知项目'}[id]||id);
 const badge=t=>`<span class="badge ${t.status==='已完成'?'done':t.status==='阻塞中'?'blocked':''}">${t.status==='已完成'?'✓':t.status==='阻塞中'?'!':'□'} ${esc(t.status)}</span>`;
 const button=(id,extra='')=>{const t=task(id);return `<button class="task-button ${state.focus===id?'selected':''} ${extra}" data-act="focus" data-id="${esc(id)}" ${t.missing?'disabled':''}><span class="code">${esc(t.code)} / ${project(t.project)}</span><strong>${esc(t.title)}</strong>${badge(t)}${t.project!==task(state.origin).project?'<span class="cross">跨项目</span>':''}</button>`;};
 const dependencies=t=>{const all=deps(t),shown=all.filter(d=>!state.hideDone||d.status!=='已完成');return `<div class="section-title"><h3>需要哪些前置</h3><span>${shown.length} / 共 ${all.length} 项</span></div>${all.length?shown.map(d=>button(d.id)).join(''):'<p class="quiet">没有前置依赖。</p>'}${all.length&&!shown.length?'<p class="quiet">前置已全部完成；当前筛选将其隐藏。</p>':''}`;};
 const details=(t,includeDeps=true)=>`<article class="detail"><div class="meta">${esc(t.code)} / ${project(t.project)} ${badge(t)}</div><h2>${esc(t.title)}</h2><div class="statusline"><span>执行状态：${esc(t.status)}</span><span>未完成前置：<b>${open(t).length}</b> / ${deps(t).length}</span></div>${t.reason?`<div class="reason"><b>人工标记的阻塞原因</b><p>${esc(t.reason)}</p></div>`:''}${t.missing?`<p class="reason">${esc(t.output)}</p>`:`<p class="output"><small>预期产出</small>${esc(t.output)}</p>`}${includeDeps?dependencies(t):''}</article>`;
 function route(from,to,seen=new Set()){
  if(from===to)return[from];if(seen.has(from))return null;seen.add(from);
  for(const next of task(from).deps){if(task(next).missing)continue;const tail=route(next,to,new Set(seen));if(tail)return[from,...tail];}return null;
 }
 function focus(id,from){
  const t=task(id);if(t.missing)return;
  if(!state.history.length&&state.focus===state.origin)state.originScroll=scrollY;
  const current=[...state.history,state.focus];let next;
  if(from&&task(from).deps.includes(id)){
   const index=current.indexOf(from);const prefix=index>=0?current.slice(0,index+1):route(state.origin,from);
   if(prefix)next=[...prefix,id];else{state.origin=from;state.originScroll=0;next=[from,id];}
  }else if(current.includes(id))next=current.slice(0,current.indexOf(id)+1);
  else{const tail=route(state.focus,id);next=tail?[...current,...tail.slice(1)]:route(state.origin,id);}
  if(!next){origin(id);document.getElementById('announce').textContent=`已切换原任务为${t.title}`;return;}
  state.history=next.slice(0,-1);state.focus=id;state.step=0;render();
  const headings=document.querySelectorAll('#surface .detail h2,#surface .drill-column h2,#surface .dossier-main>h2,#surface .question h2');const heading=headings[headings.length-1];
  if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'nearest'});}
  document.getElementById('announce').textContent=`正在查看${t.title}；原任务保持为${task(state.origin).title}`;
 }
 function origin(id){if(id&&id!==state.origin)state.originScroll=0;state.origin=id||state.origin;state.focus=state.origin;state.history=[];state.step=0;render();scrollTo(0,state.originScroll);const h=document.querySelector('#surface h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
 function render(){
  if(!modes[state.variant])state.variant=Object.keys(modes)[0];
  document.documentElement.dataset.variant=state.variant;
  document.querySelector('h1').innerHTML=modes[state.variant].headline?esc(modes[state.variant].headline):'让下一步，<br>有据可循。';
  document.getElementById('versions').innerHTML=Object.entries(modes).map(([id,v])=>`<button data-act="variant" data-id="${id}" aria-current="${id===state.variant?'page':'false'}">${id} ${v.name}</button>`).join('');
  document.getElementById('variant-purpose').textContent=modes[state.variant].purpose;
  const t=task(state.origin);document.getElementById('origin-summary').innerHTML=`<span class="eyebrow">原任务 / ${t.code}</span><strong>${esc(t.title)}</strong><div class="numbers"><b>${open(t).length}<small>未完成前置</small></b><b>${deps(t).length}<small>直接前置</small></b></div>`;
  const trail=[...state.history,state.focus];document.getElementById('trail').innerHTML=trail.map((id,i)=>`<button data-act="focus" data-id="${esc(id)}" aria-label="${esc(task(id).code+' '+task(id).title)}" ${i===trail.length-1?'aria-current="location"':''}>${esc(task(id).code)}</button>${i<trail.length-1?'<span>需要 →</span>':''}`).join('');
  document.getElementById('back').disabled=!state.history.length;
  document.getElementById('surface').innerHTML=modes[state.variant].render();
  document.querySelectorAll('[data-count]').forEach(el=>el.textContent=visible().length);
 }
 function start(){
  document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act,id=b.dataset.id;
   if(a==='focus')focus(id,b.dataset.from);if(a==='origin')origin(id);if(a==='back'){state.focus=state.history.pop()||state.origin;render();}if(a==='variant'){state.variant=id;state.focus=state.origin;state.history=[];state.step=0;history.replaceState(null,'',`?v=${id}`);render();}if(a==='step'){state.step=Number(id);render();}if(a==='all'){state.hideDone=false;document.getElementById('hideDone').checked=false;render();}
  });
  for(const [id,key] of [['scope','scope'],['search','query'],['hideDone','hideDone'],['broken','broken']])document.getElementById(id).addEventListener(id==='search'?'input':'change',e=>{state[key]=e.target.type==='checkbox'?e.target.checked:e.target.value;render();});
  document.getElementById('theme').onclick=()=>document.documentElement.classList.toggle('dark');render();
 }
 return{route,modes,state,esc,tasks,task,deps,open,visible,project,badge,button,dependencies,details,focus,origin,render,start};
})();
