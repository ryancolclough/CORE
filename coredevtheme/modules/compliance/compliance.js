let DATA=null;
export default function register(ctx){
  const {router,state,storage,renderShell,toast}=ctx;
  let filter='all';
  router.register('compliance',()=>render());

  async function load(){
    if(DATA)return DATA;
    DATA=await fetch('data/onca-compliance.json?v=20260718.401',{cache:'no-store'}).then(r=>r.json());
    seedTasks();
    return DATA;
  }
  function seedTasks(){
    const current=state.actionItems();
    let changed=false;
    DATA.items.forEach(item=>{
      if(current.some(a=>a.complianceId===item.id))return;
      current.push({id:state.nextActionId(),title:item.task,description:`${item.title}\n\nNeeds work: ${item.needsWork}`,sourceType:'ONCA Compliance Review',sourceReference:`${item.id} · ${item.article}`,assignedCommittee:'By-Laws Committee',assignedOfficer:'',priority:item.risk==='high'?'high':'medium',status:'open',dueDate:'',createdDate:new Date().toISOString().slice(0,10),completedDate:'',complianceId:item.id,evidenceRequired:item.evidenceRequired,history:[{date:new Date().toISOString(),event:'Compliance task created',note:`Created automatically from ${item.id}`} ]});changed=true;
    });
    if(changed)state.saveActionItems(current);
  }
  document.addEventListener('click',e=>{
    const f=e.target.closest('[data-compliance-filter]');if(f){filter=f.dataset.complianceFilter;render();return;}
    const action=e.target.closest('[data-compliance-action]');if(action){router.go('actions');return;}
    const copy=e.target.closest('[data-copy-wording]');if(copy){const item=DATA?.items.find(x=>x.id===copy.dataset.copyWording);if(item)navigator.clipboard?.writeText(item.suggestedWording).then(()=>toast('Suggested wording copied.'));}
  });
  async function render(){
    await load();
    const items=DATA.items.filter(i=>filter==='all'||i.status===filter||i.risk===filter);
    const counts={total:DATA.items.length,missing:DATA.items.filter(i=>i.status==='missing_article').length,high:DATA.items.filter(i=>i.risk==='high').length,tasks:state.actionItems().filter(a=>a.complianceId).length};
    const content=`<div class="backline"><button data-route="dashboard">‹ Dashboard</button></div>
    <section class="hero"><div class="eyebrow">Governance Intelligence · 2023 Signed Bylaws</div><h1>ONCA Compliance Blueprint</h1><p>Every identified amendment, missing article, evidence requirement, suggested wording and By-Law Committee task in one controlled workspace.</p><div class="rule"></div></section>
    <section class="compliance-summary"><div class="compliance-stat"><span>Findings</span><strong>${counts.total}</strong></div><div class="compliance-stat"><span>Missing Articles</span><strong>${counts.missing}</strong></div><div class="compliance-stat"><span>High Priority</span><strong>${counts.high}</strong></div><div class="compliance-stat"><span>Tasks Created</span><strong>${counts.tasks}</strong></div></section>
    <section class="panel"><div class="panel-head"><div><h2>Compliance Register</h2><p>Working governance analysis — final legal wording should be confirmed before adoption.</p></div><button class="btn" data-compliance-action>Open By-Law Committee Tasks</button></div><div class="panel-body">
    <div class="compliance-toolbar">${button('all','All')} ${button('missing_article','Missing Articles')} ${button('amendment_required','Amendments')} ${button('policy_and_amendment','Policy + Amendment')} ${button('high','High Priority')} ${button('medium','Medium Priority')}</div>
    ${items.length?items.map(card).join(''):'<div class="compliance-empty">No findings match this filter.</div>'}</div></section>`;
    renderShell(content,'compliance');
  }
  function button(value,label){return `<button class="btn secondary compliance-filter ${filter===value?'active':''}" data-compliance-filter="${value}">${label}</button>`}
  function card(i){const task=state.actionItems().find(a=>a.complianceId===i.id);return `<article class="compliance-card ${i.risk}"><div class="compliance-meta"><span class="compliance-pill">${esc(i.id)}</span><span class="compliance-pill">${esc(i.article)}</span><span class="compliance-pill">${label(i.status)}</span><span class="compliance-pill">${i.risk.toUpperCase()} RISK</span></div><h3>${esc(i.title)}</h3><p><strong>Current state:</strong> ${esc(i.current)}</p><p><strong>What needs work:</strong> ${esc(i.needsWork)}</p><div class="compliance-grid"><div class="compliance-box"><h4>What it complies with</h4><ul>${i.compliesWith.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="compliance-box"><h4>Evidence required</h4><ul>${i.evidenceRequired.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="compliance-box" style="grid-column:1/-1"><h4>Suggested wording</h4><div class="suggested-wording">${esc(i.suggestedWording)}</div></div></div><div class="compliance-actions"><button class="btn secondary" data-copy-wording="${i.id}">Copy Suggested Wording</button><button class="btn" data-compliance-action>${task?`Open Task ${esc(task.id)}`:'Create Task'}</button></div></article>`}
  function label(s){return ({missing_article:'Missing Article',amendment_required:'Amendment Required',policy_and_amendment:'Policy + Amendment',review_required:'Review Required',remove_or_revalidate:'Remove / Revalidate'})[s]||s}
  function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
}
