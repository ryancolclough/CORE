import { escapeHTML } from "../../sdk/ui.js";

export default function register(ctx){
  const { router, state, renderShell, toast, platform, storage } = ctx;
  const ROADMAP_URL = `data/development-roadmap.json?v=${platform.build || "300"}`;

  router.register("developer", params => renderDevelopment(params.view || "roadmap"));
  router.register("developer-task", params => renderTask(params.project, params.feature));

  document.addEventListener("click", async event => {
    const tab=event.target.closest("[data-dev-view]");
    if(tab){ router.go("developer",{view:tab.dataset.devView}); return; }
    const project=event.target.closest("[data-dev-project]");
    if(project){ router.go("developer",{view:"roadmap"}); setTimeout(()=>document.getElementById(`dev-project-${project.dataset.devProject}`)?.scrollIntoView({behavior:"smooth",block:"start"}),50); return; }
    const feature=event.target.closest("[data-dev-feature]");
    if(feature){ router.go("developer-task",{project:feature.dataset.project,feature:feature.dataset.devFeature}); return; }
    if(event.target.closest("[data-sync-roadmap]")){ storage.remove("DEV_ROADMAP_CACHE"); await renderDevelopment("roadmap"); toast("Roadmap refreshed from CORE 3.0.1."); return; }
    if(event.target.closest("[data-dev-back]")){ router.go("developer",{view:"roadmap"}); return; }
    if(event.target.closest("[data-copy-dev-summary]")){
      const data=await getRoadmap();
      const text=summaryText(data);
      try{ await navigator.clipboard.writeText(text); toast("Roadmap summary copied."); }
      catch{ download(text,"CORE-development-roadmap.txt"); toast("Roadmap summary downloaded."); }
      return;
    }
  });

  async function getRoadmap(){
    const cached=storage.get("DEV_ROADMAP_CACHE",null);
    try{
      const response=await fetch(ROADMAP_URL,{cache:"no-store"});
      if(!response.ok) throw new Error(`Roadmap HTTP ${response.status}`);
      const data=await response.json();
      storage.set("DEV_ROADMAP_CACHE",data);
      return data;
    }catch(error){
      if(cached) return cached;
      throw error;
    }
  }

  function allFeatures(data){ return data.projects.flatMap(project=>project.features.map(feature=>({...feature,projectId:project.id,projectName:project.name}))); }
  function isDone(status){ return status==="complete" || status==="released"; }
  function percent(features){ return features.length ? Math.round(features.filter(f=>isDone(f.status)).length/features.length*100) : 0; }
  function statusLabel(status){ return ({complete:"Complete",released:"Released",building:"Building",current:"Current Focus",next:"Next Up",planned:"Planned",future:"Future"})[status] || title(status); }
  function statusClass(status){ return String(status||"planned").replace(/[^a-z-]/g,""); }

  async function renderDevelopment(view="roadmap"){
    try{
      const data=await getRoadmap();
      const features=allFeatures(data);
      const completed=features.filter(f=>isDone(f.status)).length;
      const active=features.filter(f=>["current","building"].includes(f.status)).length;
      const overall=percent(features);
      const current=features.filter(f=>f.status==="current");
      const next=features.filter(f=>f.status==="next");

      renderShell(`
        <div class="backline"><button type="button" data-route="committees">‹ All Committees</button></div>
        <section class="dev-hero glass-card">
          <div>
            <div class="eyebrow">CORE Development Committee · Build ${escapeHTML(data.build)}</div>
            <h1>Where we are. What we are building. What comes next.</h1>
            <p>${escapeHTML(data.why)}</p>
          </div>
          <div class="dev-overall-ring" style="--score:${overall}"><div><strong>${overall}%</strong><small>Mapped</small></div></div>
        </section>

        <nav class="dev-tabs" aria-label="Development sections">
          ${["roadmap","projects","decisions","releases","diagnostics"].map(item=>`<button type="button" class="${view===item?'active':''}" data-dev-view="${item}">${title(item)}</button>`).join("")}
        </nav>

        ${view==="roadmap" ? roadmapView(data,current,next,completed,active,features.length,overall) : ""}
        ${view==="projects" ? projectsView(data) : ""}
        ${view==="decisions" ? decisionsView(data) : ""}
        ${view==="releases" ? releasesView(data) : ""}
        ${view==="diagnostics" ? diagnosticsView(data) : ""}
      `,"developer");
    }catch(error){
      renderShell(`<section class="hero"><div class="eyebrow">Development Roadmap</div><h1>Roadmap unavailable</h1><p>${escapeHTML(error.message||String(error))}</p></section>`,"developer");
    }
  }

  function roadmapView(data,current,next,completed,active,total,overall){
    return `
      <section class="dev-metrics">
        ${metric("Current Phase",data.phase,"Build 3.0")}
        ${metric("Completed",completed,`${total} mapped features`)}
        ${metric("Active",active,"Building now")}
        ${metric("Overall",`${overall}%`,"Visual roadmap")}
      </section>

      <section class="dev-focus-grid">
        <article class="glass-card dev-focus-card primary">
          <span>Current Focus</span><h2>${escapeHTML(data.currentFocus)}</h2>
          <p>These are the specific items we are discussing and building now.</p>
          <div class="dev-feature-list">${current.map(featureRow).join("") || empty("No current-focus items in this build.")}</div>
        </article>
        <article class="glass-card dev-focus-card">
          <span>Next Up</span><h2>After the current focus</h2>
          <p>Visible enough to keep direction, without burying the current work.</p>
          <div class="dev-feature-list">${next.map(featureRow).join("") || empty("Next items will appear with the next release plan.")}</div>
        </article>
      </section>

      <section class="panel dev-recent">
        <div class="panel-head"><div><h2>Recently Completed</h2><p>Proof of momentum</p></div><button class="btn secondary" type="button" data-sync-roadmap>Refresh Roadmap</button></div>
        <div class="dev-completed-grid">${data.recentlyCompleted.map(item=>`<div><span>✓</span><strong>${escapeHTML(item)}</strong></div>`).join("")}</div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><h2>Project Map</h2><p>Each project calculates progress from the features beneath it.</p></div><button class="btn secondary" type="button" data-copy-dev-summary>Copy Summary</button></div>
        <div class="dev-project-grid">${data.projects.map(projectCard).join("")}</div>
      </section>
    `;
  }

  function projectsView(data){ return `<section class="dev-project-stack">${data.projects.map(projectDetail).join("")}</section>`; }
  function decisionsView(data){ return `<section class="panel"><div class="panel-head"><div><h2>Design Decisions</h2><p>The reason behind important choices.</p></div></div><div class="dev-decision-list">${data.decisions.map((d,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><div><h3>${escapeHTML(d.title)}</h3><p>${escapeHTML(d.reason)}</p></div></article>`).join("")}</div></section>`; }
  function releasesView(data){ return `<section class="panel"><div class="panel-head"><div><h2>Release Journal</h2><p>Bundled automatically with each build.</p></div></div><div class="dev-release-list">${data.releases.map(r=>`<article><b>${escapeHTML(r.version)}</b><div><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.summary)}</p></div></article>`).join("")}</div></section>`; }
  function diagnosticsView(data){
    const committees=storage.get("COMMITTEES",[]);
    const rows=[
      ["Platform Version",platform.version],["Build",platform.build],["Environment",platform.environment],["Roadmap Build",data.build],
      ["Committees",Array.isArray(committees)?committees.length:0],["Reviews",Object.keys(state.reviews||{}).length],["Actions",state.actionItems().length],["Meetings",storage.get("MEETINGS",[]).length]
    ];
    return `<section class="panel"><div class="panel-head"><div><h2>Developer Diagnostics</h2><p>Quick health facts without distracting from the roadmap.</p></div></div><div class="dev-diagnostic-grid">${rows.map(([a,b])=>`<article><span>${escapeHTML(a)}</span><strong>${escapeHTML(String(b))}</strong></article>`).join("")}</div></section>`;
  }

  function projectCard(project){
    const score=percent(project.features);
    const current=project.features.filter(f=>["current","building"].includes(f.status)).length;
    return `<button type="button" class="dev-project-card glass-card" data-dev-project="${project.id}">
      <div class="dev-project-head"><span class="dev-status ${statusClass(project.status)}">${statusLabel(project.status)}</span><b>${score}%</b></div>
      <h3>${escapeHTML(project.name)}</h3><p>${escapeHTML(project.summary)}</p>
      <div class="dev-progress"><span style="width:${score}%"></span></div>
      <footer><span>${project.features.length} features</span><span>${current} active</span><b>Open →</b></footer>
    </button>`;
  }

  function projectDetail(project){
    const score=percent(project.features);
    return `<section class="glass-card dev-project-detail" id="dev-project-${project.id}">
      <header><div><span class="dev-status ${statusClass(project.status)}">${statusLabel(project.status)}</span><h2>${escapeHTML(project.name)}</h2><p>${escapeHTML(project.summary)}</p></div><div class="dev-project-score"><strong>${score}%</strong><small>${project.features.filter(f=>isDone(f.status)).length}/${project.features.length} complete</small></div></header>
      <div class="dev-progress"><span style="width:${score}%"></span></div>
      <div class="dev-feature-cards">${project.features.map(f=>featureRow({...f,projectId:project.id,projectName:project.name})).join("")}</div>
    </section>`;
  }

  function featureRow(feature){
    return `<button type="button" class="dev-feature-row" data-project="${feature.projectId}" data-dev-feature="${feature.id}">
      <span class="dev-feature-state ${statusClass(feature.status)}">${isDone(feature.status)?'✓':'•'}</span>
      <span><strong>${escapeHTML(feature.title)}</strong><small>${escapeHTML(feature.projectName||"")} · ${statusLabel(feature.status)}</small></span>
      <b class="priority ${feature.priority||'medium'}">${title(feature.priority||'medium')}</b>
    </button>`;
  }

  async function renderTask(projectId,featureId){
    const data=await getRoadmap();
    const project=data.projects.find(p=>p.id===projectId);
    const feature=project?.features.find(f=>f.id===featureId);
    if(!project||!feature){ router.go("developer",{view:"roadmap"}); return; }
    renderShell(`
      <div class="backline"><button type="button" data-dev-back>‹ Development Roadmap</button></div>
      <section class="dev-task-hero glass-card">
        <div><span class="dev-status ${statusClass(feature.status)}">${statusLabel(feature.status)}</span><div class="eyebrow">${escapeHTML(project.name)}</div><h1>${escapeHTML(feature.title)}</h1><p>${escapeHTML(feature.notes||project.summary)}</p></div>
        <b class="priority ${feature.priority||'medium'}">${title(feature.priority||'medium')} Priority</b>
      </section>
      <section class="dev-task-grid">
        <article class="glass-card"><span>Where we are</span><h2>${statusLabel(feature.status)}</h2><p>This status is bundled with the installed CORE build so the roadmap updates with each release.</p></article>
        <article class="glass-card"><span>Why it matters</span><h2>${escapeHTML(project.name)}</h2><p>${escapeHTML(project.summary)}</p></article>
        <article class="glass-card wide"><span>Development Notes</span><h2>Working definition</h2><p>${escapeHTML(feature.notes||"This feature is mapped and will receive detailed implementation notes as development proceeds.")}</p></article>
      </section>
    `,"developer");
  }

  function metric(label,value,copy){ return `<article class="glass-card"><span>${escapeHTML(label)}</span><strong>${escapeHTML(String(value))}</strong><small>${escapeHTML(copy)}</small></article>`; }
  function empty(text){ return `<div class="dev-empty">${escapeHTML(text)}</div>`; }
  function title(value){ return String(value||"").replaceAll("-"," ").replace(/\b\w/g,c=>c.toUpperCase()); }
  function summaryText(data){ return [`CORE Development Committee — Build ${data.build}`,`Current Phase: ${data.phase}`,`Current Focus: ${data.currentFocus}`,"",...data.projects.map(p=>`${p.name}: ${percent(p.features)}% (${p.features.filter(f=>isDone(f.status)).length}/${p.features.length})`) ].join("\n"); }
  function download(text,name){ const blob=new Blob([text],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500); }
}
