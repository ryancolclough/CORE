const CATALOG={
  governance:{name:"Governance Health",group:"Governance",description:"Overall review completion and governance score.",defaultSize:"large"},
  reviews:{name:"Open Reviews",group:"Compliance",description:"By-law sections awaiting review.",defaultSize:"small"},
  actions:{name:"Open Actions",group:"Productivity",description:"Assigned and overdue follow-up work.",defaultSize:"small"},
  amendments:{name:"Amendment Centre",group:"Governance",description:"Amendment workflow and approval status.",defaultSize:"small"},
  annual:{name:"Annual Tasks",group:"Governance",description:"Recurring annual obligations and filings.",defaultSize:"small"},
  quick:{name:"Quick Actions",group:"Productivity",description:"Common governance shortcuts.",defaultSize:"wide"},
  priorities:{name:"Today's Priorities",group:"Governance",description:"Items needing attention now.",defaultSize:"medium"},
  committees:{name:"Committee Snapshot",group:"Committees",description:"Committee health, tasks, vacancies and meetings.",defaultSize:"medium"},
  meetings:{name:"Meeting Readiness",group:"Meetings",description:"Reports, countdown and meeting preparation.",defaultSize:"medium"},
  activity:{name:"Recent Activity",group:"Records",description:"Recent changes and completed work.",defaultSize:"medium"},
  documents:{name:"Document Control",group:"Records",description:"Edition, version and review information.",defaultSize:"wide"},
  calendar:{name:"Governance Calendar",group:"Meetings",description:"Upcoming meetings, deadlines and renewals.",defaultSize:"wide"},
  notifications:{name:"Notifications",group:"Productivity",description:"Assignments, reminders and escalations.",defaultSize:"medium"},
  assets:{name:"Inventory & Assets",group:"Operations",description:"Insurable assets, reviews and condition status.",defaultSize:"medium"},
  operations:{name:"Building Operations",group:"Operations",description:"Inspections, keys, alarms and maintenance.",defaultSize:"medium"},
  strategy:{name:"Strategic Planning",group:"Planning",description:"Long-range initiatives, milestones and risk.",defaultSize:"medium"},
  development:{name:"CORE Mission Control",group:"Administration",description:"Roadmap, releases and current development focus.",defaultSize:"wide"}
};
const TEMPLATES={
  "By-Law Committee":["governance","reviews","amendments","priorities","actions","committees","meetings","documents","activity"],
  "Building Committee":["operations","actions","meetings","priorities","assets","calendar","documents","activity"],
  "Finance Committee":["governance","actions","annual","meetings","assets","calendar","documents","activity"],
  "Temple Board Executive":["governance","priorities","committees","meetings","actions","notifications","calendar","documents","activity"],
  "CORE Administrator":["governance","development","committees","actions","meetings","notifications","calendar","documents","activity"]
};
const SIZES=["small","medium","wide","large"];
export default function register(ctx){
 const {router,renderShell,storage,toast}=ctx;
 const key="WORKSPACE_CONFIG", templateKey="WORKSPACE_TEMPLATES";
 let draft=null, draggingId="";
 router.register("workspace",()=>render());
 function savedTemplates(){return storage.get(templateKey,{});}
 function allTemplates(){return {...TEMPLATES,...savedTemplates()};}
 function current(){return storage.get(key,{name:"By-Law Committee",role:"By-Law Committee",widgets:TEMPLATES["By-Law Committee"].map((id,order)=>({id,size:CATALOG[id].defaultSize,order}))});}
 function normalize(config){return {...config,widgets:(config.widgets||[]).filter(x=>CATALOG[x.id]).map((x,i)=>({...x,size:SIZES.includes(x.size)?x.size:CATALOG[x.id].defaultSize,order:i}))};}
 function openBuilder(name=""){
   const templates=allTemplates();
   const source=name&&templates[name]?{name,role:name,widgets:templates[name].map((id,order)=>({id,size:CATALOG[id].defaultSize,order}))}:current();
   draft=normalize(JSON.parse(JSON.stringify(source)));
   renderBuilder();
 }
 function render(){const active=current(),templates=allTemplates();renderShell(`
   <div class="backline"><button data-route="settings">‹ Settings</button></div>
   <section class="hero workspace-hero"><div class="eyebrow">Administrator Workspace Studio</div><h1>Build the experience each role needs.</h1><p>Create visual workspace templates from every available CORE card, arrange them on a consistent grid, preview the result, and publish the selected layout.</p><div class="workspace-hero-actions"><button class="btn" type="button" data-new-template>+ New Template</button><button class="btn secondary" type="button" data-edit-active>Edit Active Workspace</button></div></section>
   <section class="workspace-active glass-card"><div><span>Active workspace</span><h2>${esc(active.name||'My Workspace')}</h2><p>${active.widgets.length} cards currently control the dashboard.</p></div><button class="btn secondary" data-route="dashboard">Open Dashboard</button></section>
   <section class="section-heading"><div><span>Template Library</span><h2>Choose, edit, duplicate or publish.</h2></div></section>
   <section class="template-grid">${Object.entries(templates).map(([name,ids])=>templateCard(name,ids,active.name===name)).join('')}</section>
 `,'workspace')}
 function templateCard(name,ids,isActive){return `<article class="glass-card template-card ${isActive?'is-active':''}"><div class="template-badge">${isActive?'Active':'Workspace Template'}</div><h2>${esc(name)}</h2><p>${ids.length} cards · ${describe(ids)}</p><div class="template-actions"><button class="btn secondary" type="button" data-edit-template="${esc(name)}">Open Builder</button><button type="button" class="text-action" data-apply-workspace-template="${esc(name)}">Apply</button><button type="button" class="text-action" data-duplicate-template="${esc(name)}">Duplicate</button></div></article>`}
 function describe(ids){const groups=[...new Set(ids.map(id=>CATALOG[id]?.group).filter(Boolean))];return groups.slice(0,3).join(' · ')||'Custom layout';}
 function renderBuilder(){
  const used=new Set(draft.widgets.map(x=>x.id));
  renderShell(`<div class="workspace-builder-shell">
    <header class="builder-toolbar glass-card"><div><span>Admin Layout Builder</span><input id="builder-template-name" value="${esc(draft.name||'Untitled Workspace')}" aria-label="Template name"></div><div class="builder-toolbar-actions"><button class="btn secondary" type="button" data-builder-preview>Preview</button><button class="btn secondary" type="button" data-builder-discard>Discard</button><button class="btn" type="button" data-builder-save>Save Template</button><button class="btn" type="button" data-builder-publish>Publish to Dashboard</button></div></header>
    <section class="builder-layout">
      <aside class="widget-catalog glass-card"><div class="catalog-head"><span>Card Library</span><h2>Available cards</h2><p>Select any card to add it to the template.</p></div><div class="widget-library-grid">${Object.entries(CATALOG).map(([id,item])=>`<button type="button" class="widget-library-card ${used.has(id)?'is-used':''}" data-add-widget="${id}" ${used.has(id)?'disabled':''}><span>${item.group}</span><strong>${item.name}</strong><small>${item.description}</small><b>${used.has(id)?'Added':'Add +'}</b></button>`).join('')}</div></aside>
      <main class="builder-stage-wrap"><div class="builder-stage-head"><div><span>Visual Grid</span><h2>Drag, resize and arrange.</h2></div><div class="device-toggle"><button class="active" data-builder-device="desktop">Desktop</button><button data-builder-device="mobile">Mobile</button></div></div><div class="builder-stage desktop" id="builder-stage">${draft.widgets.sort((a,b)=>a.order-b.order).map(builderCard).join('')||'<div class="builder-empty">Add cards from the library to begin.</div>'}</div></main>
    </section>
  </div>`,'workspace');
 }
 function builderCard(item){const c=CATALOG[item.id];return `<article class="builder-card size-${item.size}" draggable="true" data-builder-card="${item.id}"><div class="builder-card-top"><button class="drag-handle" type="button" aria-label="Drag ${esc(c.name)}">⠿</button><div><span>${c.group}</span><strong>${c.name}</strong></div><button class="remove-card" type="button" data-remove-widget="${item.id}" aria-label="Remove">×</button></div><p>${c.description}</p><div class="builder-card-controls"><label>Size<select data-widget-size="${item.id}">${SIZES.map(s=>`<option value="${s}" ${s===item.size?'selected':''}>${s}</option>`).join('')}</select></label><small>${sizeLabel(item.size)}</small></div></article>`}
 function sizeLabel(size){return ({small:'3 columns',medium:'4 columns',wide:'6 columns',large:'8 columns'})[size]||size;}
 function refreshOrders(){draft.widgets.forEach((x,i)=>x.order=i)}
 document.addEventListener('click',e=>{
   const apply=e.target.closest('[data-apply-workspace-template]');if(apply){const name=apply.dataset.applyWorkspaceTemplate,ids=allTemplates()[name];storage.set(key,{name,role:name,widgets:ids.map((id,order)=>({id,size:CATALOG[id].defaultSize,order}))});toast(`${name} applied to the dashboard.`);render();return}
   const edit=e.target.closest('[data-edit-template]');if(edit){openBuilder(edit.dataset.editTemplate);return}
   if(e.target.closest('[data-edit-active]')){draft=normalize(JSON.parse(JSON.stringify(current())));renderBuilder();return}
   if(e.target.closest('[data-new-template]')){draft={name:'New Workspace Template',role:'Custom',widgets:[]};renderBuilder();return}
   const dup=e.target.closest('[data-duplicate-template]');if(dup){const name=dup.dataset.duplicateTemplate,ids=allTemplates()[name],copy=`${name} Copy`;const custom=savedTemplates();custom[copy]=[...ids];storage.set(templateKey,custom);toast(`${copy} created.`);render();return}
   const add=e.target.closest('[data-add-widget]');if(add&&draft){const id=add.dataset.addWidget;if(!draft.widgets.some(x=>x.id===id)){draft.widgets.push({id,size:CATALOG[id].defaultSize,order:draft.widgets.length});renderBuilder()}return}
   const rem=e.target.closest('[data-remove-widget]');if(rem&&draft){draft.widgets=draft.widgets.filter(x=>x.id!==rem.dataset.removeWidget);refreshOrders();renderBuilder();return}
   const device=e.target.closest('[data-builder-device]');if(device){document.querySelectorAll('[data-builder-device]').forEach(x=>x.classList.toggle('active',x===device));const stage=document.querySelector('#builder-stage');stage.className=`builder-stage ${device.dataset.builderDevice}`;return}
   if(e.target.closest('[data-builder-discard]')){draft=null;render();return}
   if(e.target.closest('[data-builder-preview]')){saveDraftName();storage.set('WORKSPACE_PREVIEW',draft);toast('Preview prepared. Publish when the layout is ready.');return}
   if(e.target.closest('[data-builder-save]')){saveDraftName();const custom=savedTemplates();custom[draft.name]=draft.widgets.map(x=>x.id);storage.set(templateKey,custom);toast(`${draft.name} saved as a reusable template.`);render();return}
   if(e.target.closest('[data-builder-publish]')){saveDraftName();storage.set(key,normalize(draft));const custom=savedTemplates();custom[draft.name]=draft.widgets.map(x=>x.id);storage.set(templateKey,custom);toast(`${draft.name} published to the dashboard.`);router.go('dashboard');return}
 });
 document.addEventListener('change',e=>{const size=e.target.closest('[data-widget-size]');if(size&&draft){const item=draft.widgets.find(x=>x.id===size.dataset.widgetSize);if(item){item.size=size.value;renderBuilder()}}});
 document.addEventListener('dragstart',e=>{const card=e.target.closest('[data-builder-card]');if(card){draggingId=card.dataset.builderCard;card.classList.add('dragging');e.dataTransfer.effectAllowed='move'}});
 document.addEventListener('dragend',e=>{e.target.closest('[data-builder-card]')?.classList.remove('dragging');draggingId=''});
 document.addEventListener('dragover',e=>{const card=e.target.closest('[data-builder-card]');if(card&&draggingId&&card.dataset.builderCard!==draggingId){e.preventDefault();card.classList.add('drag-over')}});
 document.addEventListener('dragleave',e=>e.target.closest('[data-builder-card]')?.classList.remove('drag-over'));
 document.addEventListener('drop',e=>{const card=e.target.closest('[data-builder-card]');if(card&&draggingId){e.preventDefault();card.classList.remove('drag-over');const from=draft.widgets.findIndex(x=>x.id===draggingId),to=draft.widgets.findIndex(x=>x.id===card.dataset.builderCard);if(from>-1&&to>-1){const [m]=draft.widgets.splice(from,1);draft.widgets.splice(to,0,m);refreshOrders();renderBuilder()}}});
 function saveDraftName(){const input=document.querySelector('#builder-template-name');if(input?.value.trim())draft.name=input.value.trim();refreshOrders()}
}
function esc(v){return String(v||'').replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
