const CATALOG = [
  {id:"governance",name:"Governance Health",group:"Governance",size:"large",description:"Overall review completion and governance score."},
  {id:"quick",name:"Quick Actions",group:"Productivity",size:"large",description:"Pinned actions for common governance work."},
  {id:"committees",name:"Committee Snapshot",group:"Committees",size:"medium",description:"Committee status, tasks, vacancies, and next meetings."},
  {id:"priorities",name:"Today's Priorities",group:"Governance",size:"medium",description:"Items that require attention now."},
  {id:"reviews",name:"Open Reviews",group:"Compliance",size:"small",description:"By-law sections still awaiting review."},
  {id:"actions",name:"Open Actions",group:"Productivity",size:"small",description:"Assigned and overdue action items."},
  {id:"annual",name:"Annual Tasks",group:"Governance",size:"small",description:"Upcoming recurring governance obligations."},
  {id:"activity",name:"Recent Activity",group:"Records",size:"medium",description:"Latest reviews, approvals, and committee changes."},
  {id:"documents",name:"Recent Documents",group:"Records",size:"medium",description:"Recently published or reviewed records."},
  {id:"ore",name:"ORE Publication",group:"Records",size:"small",description:"Current reader edition and publication status."}
];

const DEFAULTS = {
  "By-Law Officer":["governance","reviews","quick","priorities","committees","ore"],
  "President":["governance","priorities","committees","actions","annual","activity"],
  "Secretary":["priorities","committees","documents","annual","activity","quick"],
  "Treasurer":["priorities","actions","committees","documents","annual","activity"],
  "Committee Chair":["committees","priorities","actions","quick","documents","activity"]
};

export default function register(ctx){
  const {router,renderShell,storage,toast}=ctx;
  const key="WORKSPACE_CONFIG";
  const get=()=>storage.get(key,{name:"My Workspace",role:"By-Law Officer",widgets:DEFAULTS["By-Law Officer"].map((id,index)=>({id,size:CATALOG.find(x=>x.id===id)?.size||"medium",order:index}))});
  const save=value=>storage.set(key,value);

  router.register("workspace",()=>render());

  function render(){
    const config=get();
    const selected=new Set(config.widgets.map(x=>x.id));
    const active=config.widgets.slice().sort((a,b)=>a.order-b.order).map((item,index)=>{
      const meta=CATALOG.find(x=>x.id===item.id);
      return `<article class="workspace-item glass-card" data-widget-id="${item.id}">
        <div class="workspace-drag">⋮⋮</div><div><span>${meta?.group||"Widget"}</span><strong>${meta?.name||item.id}</strong><small>${meta?.description||""}</small></div>
        <select data-size aria-label="Widget size"><option ${item.size==="small"?"selected":""}>small</option><option ${item.size==="medium"?"selected":""}>medium</option><option ${item.size==="large"?"selected":""}>large</option></select>
        <div class="workspace-controls"><button type="button" data-move="up" ${index===0?"disabled":""}>↑</button><button type="button" data-move="down" ${index===config.widgets.length-1?"disabled":""}>↓</button><button type="button" data-remove>×</button></div>
      </article>`;
    }).join("");
    const library=CATALOG.map(w=>`<label class="widget-library-card glass-card"><input type="checkbox" data-library-id="${w.id}" ${selected.has(w.id)?"checked":""}><span><b>${w.name}</b><small>${w.group} · ${w.description}</small></span></label>`).join("");
    renderShell(`<div class="backline"><button data-route="dashboard">‹ Dashboard</button></div>
      <section class="hero"><div class="eyebrow">Personal Workspace</div><h1>Customize CORE</h1><p>Choose the widgets, order, and sizes that match how you govern.</p><div class="rule"></div></section>
      <section class="workspace-settings glass-card"><label>Workspace name<input id="workspace-name" value="${escape(config.name)}"></label><label>Role template<select id="workspace-role">${Object.keys(DEFAULTS).map(r=>`<option ${r===config.role?"selected":""}>${r}</option>`).join("")}</select></label><button class="btn secondary" type="button" data-apply-template>Apply role template</button><button class="btn" type="button" data-save-workspace>Save Workspace</button></section>
      <section class="workspace-layout"><div><div class="section-heading"><div><span>Current layout</span><h2>Widget Order</h2></div><small>Move and resize widgets</small></div><div id="workspace-active">${active||'<div class="dashboard-empty">No widgets selected.</div>'}</div></div>
      <aside><div class="section-heading"><div><span>Add or remove</span><h2>Widget Library</h2></div></div><div class="widget-library">${library}</div></aside></section>`,"workspace");
  }

  document.addEventListener("click",e=>{
    if(e.target.closest("[data-apply-template]")){
      const role=document.querySelector("#workspace-role")?.value||"By-Law Officer";
      const config=get(); config.role=role; config.widgets=(DEFAULTS[role]||DEFAULTS["By-Law Officer"]).map((id,order)=>({id,size:CATALOG.find(x=>x.id===id)?.size||"medium",order})); save(config); toast(`${role} workspace applied.`); render(); return;
    }
    if(e.target.closest("[data-save-workspace]")){
      const config=get(); config.name=document.querySelector("#workspace-name")?.value.trim()||"My Workspace"; config.role=document.querySelector("#workspace-role")?.value||config.role; save(config); toast("Workspace saved."); return;
    }
    const row=e.target.closest("[data-widget-id]");
    if(row){
      const config=get(),id=row.dataset.widgetId,index=config.widgets.findIndex(x=>x.id===id);
      if(e.target.closest("[data-remove]")){config.widgets.splice(index,1);}
      const move=e.target.closest("[data-move]")?.dataset.move;
      if(move){const to=move==="up"?index-1:index+1;if(to>=0&&to<config.widgets.length)[config.widgets[index],config.widgets[to]]=[config.widgets[to],config.widgets[index]];}
      config.widgets.forEach((x,i)=>x.order=i);save(config);render();return;
    }
  });
  document.addEventListener("change",e=>{
    const library=e.target.closest("[data-library-id]");
    if(library){const config=get(),id=library.dataset.libraryId,idx=config.widgets.findIndex(x=>x.id===id);if(library.checked&&idx<0)config.widgets.push({id,size:CATALOG.find(x=>x.id===id)?.size||"medium",order:config.widgets.length});if(!library.checked&&idx>=0)config.widgets.splice(idx,1);config.widgets.forEach((x,i)=>x.order=i);save(config);render();return;}
    const size=e.target.closest("[data-size]");if(size){const row=size.closest("[data-widget-id]"),config=get(),item=config.widgets.find(x=>x.id===row.dataset.widgetId);if(item)item.size=size.value;save(config);toast("Widget size updated.");}
  });
}
function escape(v){return String(v||"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
