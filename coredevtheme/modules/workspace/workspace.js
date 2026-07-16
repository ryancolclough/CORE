const TEMPLATES={
  "By-Law Committee":["governance","reviews","priorities","committees","meetings","documents"],
  "Building Committee":["committees","actions","meetings","priorities","documents","activity"],
  "Finance Committee":["governance","actions","annual","meetings","documents","activity"],
  "Temple Board":["governance","priorities","committees","meetings","activity","documents"]
};
const SIZES={governance:"large",reviews:"small",priorities:"medium",committees:"medium",meetings:"medium",documents:"wide",actions:"small",annual:"small",activity:"medium"};
export default function register(ctx){
 const {router,renderShell,storage,toast}=ctx; const key="WORKSPACE_CONFIG";
 router.register("workspace",()=>render());
 function render(){const current=storage.get(key,{name:"My Workspace",role:"By-Law Officer",widgets:[]});renderShell(`<div class="backline"><button data-route="dashboard">‹ Dashboard</button></div><section class="hero"><div class="eyebrow">Workspace Templates</div><h1>Choose a starting point.</h1><p>Templates set the initial cards. Build, save, duplicate, and select reusable workspace templates here. The selected template controls your dashboard layout.</p></section><section class="template-grid">${Object.entries(TEMPLATES).map(([name,widgets])=>`<article class="glass-card template-card"><span>Committee template</span><h2>${name}</h2><p>${widgets.length} widgets configured for this work.</p><button class="btn secondary" type="button" data-apply-workspace-template="${name}">Apply Template</button></article>`).join('')}</section><section class="glass-card workspace-current"><span>Current workspace</span><h2>${current.name||'My Workspace'}</h2><p>This is the active workspace. Save it as a personal layout or use a committee template as the starting point.</p><button class="btn" data-route="dashboard">Open Selected Workspace</button></section>`,`workspace`)}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-apply-workspace-template]');if(!b)return;const name=b.dataset.applyWorkspaceTemplate,ids=TEMPLATES[name];storage.set(key,{name,role:name,widgets:ids.map((id,order)=>({id,size:SIZES[id]||'medium',order}))});toast(`${name} template applied.`);router.go('dashboard')});
}
