const CATALOG = {
  governance:{name:"Governance Health",group:"Governance",defaultSize:"large"},
  reviews:{name:"Open Reviews",group:"Compliance",defaultSize:"small"},
  actions:{name:"Open Actions",group:"Productivity",defaultSize:"small"},
  amendments:{name:"Amendments",group:"Governance",defaultSize:"small"},
  annual:{name:"Annual Tasks",group:"Governance",defaultSize:"small"},
  quick:{name:"Quick Actions",group:"Productivity",defaultSize:"wide"},
  priorities:{name:"Today's Priorities",group:"Governance",defaultSize:"medium"},
  committees:{name:"Committee Snapshot",group:"Committees",defaultSize:"medium"},
  meetings:{name:"Meeting Readiness",group:"Meetings",defaultSize:"medium"},
  activity:{name:"Recent Activity",group:"Records",defaultSize:"medium"},
  documents:{name:"Document Control",group:"Records",defaultSize:"wide"}
};
const DEFAULT_WIDGETS=["governance","reviews","actions","amendments","annual","quick","priorities","committees","meetings","activity","documents"];

export default function register(ctx){
  const {router,state,renderShell,events,storage,toast}=ctx;
  const key="WORKSPACE_CONFIG";
  const getConfig=()=>{
    const saved=storage.get(key,null);
    if(saved?.widgets?.length) return saved;
    return {name:"My Workspace",role:"By-Law Officer",widgets:DEFAULT_WIDGETS.map((id,order)=>({id,size:CATALOG[id].defaultSize,order}))};
  };
  const saveConfig=config=>storage.set(key,config);
  let editMode=false;

  router.register("dashboard",()=>render());

  function metrics(){
    const m=state.metrics(), actions=state.actionSummary(), annual=state.annualTaskSummary();
    const score=m.total?Math.round(((m.complete+m.discussion*.55+m.amendment*.35)/m.total)*100):0;
    return {m,actions,annual,score,openReviews:Math.max(0,m.total-m.reviewed),amendments:state.amendmentItems(),attention:state.attentionItems().slice(0,4)};
  }

  function widget(id,data){
    const {m,actions,annual,score,openReviews,amendments,attention}=data;
    if(id==="governance") return `<article class="workspace-widget glass-card governance-card" data-widget-id="governance"><div class="widget-edit-chrome"><button data-remove-widget aria-label="Remove widget">−</button><button data-cycle-size aria-label="Resize widget">↔</button></div><div class="governance-copy"><span class="card-kicker">Governance Health</span><strong data-count-to="${score}" data-count-suffix="%">${score}%</strong><p>Overall review completion and governance score.</p><button class="text-action" data-route="review">Open review <b>→</b></button></div><div class="hero-ring" data-progress-value="${score}" style="--score:${score}"><div><strong>${m.reviewed}</strong><small>of ${m.total}<br>reviewed</small></div></div></article>`;
    if(id==="reviews") return metric(id,"Open Reviews",openReviews,`${m.percent}% complete`,"review");
    if(id==="actions") return metric(id,"Open Actions",actions.open,`${actions.overdue} overdue`,"actions");
    if(id==="amendments") return metric(id,"Amendments",amendments.length,"Tracked workflows","amendments");
    if(id==="annual") return metric(id,"Annual Tasks",annual.upcoming,"Upcoming obligations","annual");
    if(id==="quick") return `<article class="workspace-widget glass-card dashboard-panel" data-widget-id="quick"><div class="widget-edit-chrome"><button data-remove-widget>−</button><button data-cycle-size>↔</button></div><div class="panel-title"><div><span>Work faster</span><h2>Quick Actions</h2></div></div><div class="quick-actions-grid compact"><button class="quick-action" data-route="committees"><i>♙</i><span><strong>Committees</strong><small>Open manager</small></span></button><button class="quick-action" data-route="meetings"><i>▦</i><span><strong>Meetings</strong><small>Agenda & live mode</small></span></button><button class="quick-action" data-route="review"><i>✓</i><span><strong>Start Review</strong><small>Assess a section</small></span></button><button class="quick-action" data-route="actions"><i>＋</i><span><strong>Add Action</strong><small>Assign work</small></span></button></div></article>`;
    if(id==="priorities") return `<article class="workspace-widget glass-card dashboard-panel" data-widget-id="priorities"><div class="widget-edit-chrome"><button data-remove-widget>−</button><button data-cycle-size>↔</button></div><div class="panel-title"><div><span>Attention Required</span><h2>Today's Priorities</h2></div></div><div class="priority-list">${attention.length?attention.map(item=>`<button class="priority-item" data-open-direct="${item.articleIndex}:${item.sectionIndex}"><span class="priority-dot ${item.review.status}"></span><span><strong>Section ${item.section.number}</strong><small>${item.section.title}</small></span><b>Review</b></button>`).join(""):'<div class="dashboard-empty">No urgent items.</div>'}</div></article>`;
    if(id==="committees") return `<article class="workspace-widget glass-card dashboard-panel" data-widget-id="committees"><div class="widget-edit-chrome"><button data-remove-widget>−</button><button data-cycle-size>↔</button></div><div class="panel-title"><div><span>Committee Manager</span><h2>Committee Snapshot</h2></div><button data-route="committees">View all</button></div><div class="snapshot-list"><div><b>By-Law Committee</b><span class="good">48% · Active</span></div><div><b>Building Committee</b><span class="warn">20% · Setup required</span></div><div><b>Test Committee</b><span>0% · Not started</span></div></div></article>`;
    if(id==="meetings") return `<article class="workspace-widget glass-card dashboard-panel" data-widget-id="meetings"><div class="widget-edit-chrome"><button data-remove-widget>−</button><button data-cycle-size>↔</button></div><div class="panel-title"><div><span>Meeting Manager</span><h2>Next Meeting</h2></div><button data-route="meetings">Open</button></div><div class="meeting-readiness"><strong>Temple Board Meeting</strong><small>Tuesday, July 29 · 7:00 PM</small><div class="readiness-row"><span class="good">3 reports ready</span><span class="warn">2 missing</span></div><button class="btn secondary" data-route="meetings">Build agenda</button></div></article>`;
    if(id==="activity") return `<article class="workspace-widget glass-card dashboard-panel" data-widget-id="activity"><div class="widget-edit-chrome"><button data-remove-widget>−</button><button data-cycle-size>↔</button></div><div class="panel-title"><div><span>Records</span><h2>Recent Activity</h2></div></div><div class="snapshot-list"><div><b>Review updated</b><span>Article VI · Today</span></div><div><b>Committee member added</b><span>Greg Forsyth · Today</span></div><div><b>Meeting scheduled</b><span>July 29</span></div></div></article>`;
    if(id==="documents") return `<article class="workspace-widget glass-card dashboard-panel" data-widget-id="documents"><div class="widget-edit-chrome"><button data-remove-widget>−</button><button data-cycle-size>↔</button></div><div class="panel-title"><div><span>Document Control</span><h2>Current Edition</h2></div></div><div class="document-strip"><div><small>Edition</small><b>6.0</b></div><div><small>Version</small><b>6.0.0</b></div><div><small>Adopted</small><b>May 24, 2025</b></div><div><small>Next Review</small><b>Jul 24, 2026</b></div></div></article>`;
    return "";
  }

  function metric(id,label,value,sub,route){return `<button class="workspace-widget glass-card metric-card" data-widget-id="${id}" data-route="${route}"><span class="widget-edit-chrome"><button type="button" data-remove-widget>−</button><button type="button" data-cycle-size>↔</button></span><span>${label}</span><strong data-count-to="${value}">${value}</strong><small>${sub}</small></button>`;}

  function render(){
    const config=getConfig();
    const data=metrics();
    const cards=config.widgets.slice().sort((a,b)=>a.order-b.order).map(item=>`<div class="workspace-slot size-${item.size||CATALOG[item.id]?.defaultSize||'medium'}" draggable="${editMode}" data-slot-id="${item.id}">${widget(item.id,data)}</div>`).join("");
    const addable=Object.entries(CATALOG).filter(([id])=>!config.widgets.some(w=>w.id===id));
    renderShell(`<section class="hero cinematic-hero dashboard-intro"><div class="eyebrow">${escape(config.name)} · Temple Board Governance Centre</div><h1>Good ${state.greeting()}, Ryan.</h1><p>Your governance work, arranged around how you work.</p><div class="workspace-toolbar"><button class="btn secondary" type="button" data-route="workspace">Manage Workspaces in Settings</button></div></section><section class="live-workspace ${editMode?'is-editing':''}" id="live-workspace">${cards}</section>${editMode?`<div class="edit-help">Press and drag cards to move them. Use ↔ to resize. Changes save automatically.</div>`:''}<dialog id="widget-library-dialog" class="widget-sheet"><div class="widget-sheet-head"><div><span>Add to workspace</span><h2>Widget Library</h2></div><button type="button" data-close-widget-library>×</button></div><div class="widget-library-grid">${addable.length?addable.map(([id,meta])=>`<button type="button" data-add-widget="${id}"><strong>${meta.name}</strong><small>${meta.group}</small></button>`).join(''):'<p>All widgets are already on this workspace.</p>'}</div></dialog>`,`dashboard`);
    bindDrag();
  }

  function updateOrder(ids){const config=getConfig();config.widgets=ids.map((id,order)=>({...config.widgets.find(x=>x.id===id),id,order}));saveConfig(config);}
  function bindDrag(){
    if(!editMode)return;
    const grid=document.querySelector('#live-workspace'); if(!grid)return;
    let dragged=null;
    grid.querySelectorAll('[data-slot-id]').forEach(slot=>{
      slot.addEventListener('dragstart',()=>{dragged=slot;slot.classList.add('is-dragging')});
      slot.addEventListener('dragend',()=>{slot.classList.remove('is-dragging');dragged=null;persist()});
      slot.addEventListener('dragover',e=>{e.preventDefault();if(!dragged||dragged===slot)return;const rect=slot.getBoundingClientRect();const before=e.clientY<rect.top+rect.height/2;grid.insertBefore(dragged,before?slot:slot.nextSibling)});
    });
    // touch / pointer drag
    let active=null,ghost=null,startY=0;
    grid.addEventListener('pointerdown',e=>{const slot=e.target.closest('[data-slot-id]');if(!slot||e.target.closest('button'))return;active=slot;startY=e.clientY;slot.setPointerCapture?.(e.pointerId);setTimeout(()=>{if(active&&Math.abs((active._lastY||startY)-startY)<8){active.classList.add('is-dragging');ghost=active}},180)});
    grid.addEventListener('pointermove',e=>{if(!active)return;active._lastY=e.clientY;if(!ghost)return;e.preventDefault();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot-id]');if(target&&target!==active){const r=target.getBoundingClientRect();grid.insertBefore(active,e.clientY<r.top+r.height/2?target:target.nextSibling)}});
    const end=()=>{if(active){active.classList.remove('is-dragging');active._lastY=null;persist()}active=null;ghost=null};
    grid.addEventListener('pointerup',end);grid.addEventListener('pointercancel',end);
    function persist(){updateOrder([...grid.querySelectorAll('[data-slot-id]')].map(x=>x.dataset.slotId));toast('Workspace layout saved.');}
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-toggle-edit]')){editMode=!editMode;render();return;}
    if(e.target.closest('[data-open-widget-library]')){document.querySelector('#widget-library-dialog')?.showModal();return;}
    if(e.target.closest('[data-close-widget-library]')){document.querySelector('#widget-library-dialog')?.close();return;}
    const add=e.target.closest('[data-add-widget]');if(add){const config=getConfig(),id=add.dataset.addWidget;config.widgets.push({id,size:CATALOG[id].defaultSize,order:config.widgets.length});saveConfig(config);document.querySelector('#widget-library-dialog')?.close();render();toast(`${CATALOG[id].name} added.`);return;}
    const remove=e.target.closest('[data-remove-widget]');if(remove){e.preventDefault();e.stopPropagation();const id=remove.closest('[data-slot-id]')?.dataset.slotId;const config=getConfig();config.widgets=config.widgets.filter(x=>x.id!==id).map((x,order)=>({...x,order}));saveConfig(config);render();return;}
    const resize=e.target.closest('[data-cycle-size]');if(resize){e.preventDefault();e.stopPropagation();const id=resize.closest('[data-slot-id]')?.dataset.slotId;const config=getConfig(),item=config.widgets.find(x=>x.id===id);const sizes=['small','medium','wide','large'];item.size=sizes[(sizes.indexOf(item.size)+1)%sizes.length];saveConfig(config);render();toast(`${CATALOG[id].name}: ${item.size}`);return;}
    if(e.target.closest('[data-reset-workspace]')){saveConfig({name:'My Workspace',role:'By-Law Officer',widgets:DEFAULT_WIDGETS.map((id,order)=>({id,size:CATALOG[id].defaultSize,order}))});render();toast('Workspace template restored.');return;}
    const direct=e.target.closest('[data-open-direct]');if(direct){const [articleIndex,sectionIndex]=direct.dataset.openDirect.split(':').map(Number);events.emit('review:open-direct',{articleIndex,sectionIndex});}
  });
}
function escape(v){return String(v||'').replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
