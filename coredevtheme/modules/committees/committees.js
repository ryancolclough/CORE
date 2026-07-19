const seed = [
  {
    id: "bylaws",
    name: "By-Laws Committee",
    purpose: "Maintain and review the corporate by-laws and governance records.",
    chair: "Ryan Colclough",
    status: "on-track",
    nextMeeting: "2026-07-29",
    members: [
      { name: "Ryan Colclough", role: "Chair" },
      { name: "Greg Forsyth", role: "Ex Officio" },
      { name: "Steve Kipp", role: "Member" }
    ],
    responsibilities: [
      "Review the by-laws on a scheduled basis.",
      "Recommend amendments to the Temple Board.",
      "Maintain the official governance record."
    ],
    projects: [
      {
        id: "bylaw-modernization-2026",
        name: "2026 By-Law Modernization",
        purpose: "Bring the 2023 by-laws into alignment with ONCA and strengthen the Corporation's governance controls.",
        goal: "Complete the 15-item compliance catch-up, legal review, approvals, incorporation and ORE publication.",
        lead: "Ryan Colclough",
        startDate: "2026-07-18",
        targetDate: "2026-12-31",
        status: "in-progress",
        priority: "high",
        currentPhase: "Compliance Comparison",
        definitionOfDone: "All 15 findings are reviewed, required wording is drafted, lawyer review is complete, approvals are recorded, amendments are incorporated into the certified by-laws, the amendment register is updated and ORE publishes the current wording.",
        phases: [
          { id: "comparison", name: "Compliance Comparison", weight: 15 },
          { id: "committee-review", name: "Committee Review", weight: 15 },
          { id: "drafting", name: "Drafting", weight: 20 },
          { id: "legal-review", name: "Legal Review", weight: 15 },
          { id: "board-approval", name: "Board Approval", weight: 15 },
          { id: "member-approval", name: "Member Approval", weight: 10 },
          { id: "incorporation", name: "Incorporation & ORE Publication", weight: 10 }
        ],
        milestones: [
          { id: "m1", title: "15 compliance findings linked to articles", phaseId: "comparison", complete: true, evidence: "CORE compliance register" },
          { id: "m2", title: "Committee reviews all 15 findings", phaseId: "committee-review", complete: false, evidence: "Committee review records" },
          { id: "m3", title: "Draft wording prepared", phaseId: "drafting", complete: false, evidence: "Draft amendment package" },
          { id: "m4", title: "Ontario not-for-profit lawyer review", phaseId: "legal-review", complete: false, evidence: "Legal review letter / marked draft" },
          { id: "m5", title: "Board and member approvals complete", phaseId: "board-approval", complete: false, evidence: "Resolutions and vote records" },
          { id: "m6", title: "Approved wording incorporated and published", phaseId: "incorporation", complete: false, evidence: "Certified by-laws, amendment register and ORE version" }
        ]
      }
    ],
    tasks: [
      { id: "t1", title: "Draft and present an ONCA authority and precedence amendment", description: "Prepare the Article 1 authority clause for committee review.", status: "not-started", due: "", projectId: "bylaw-modernization-2026", phaseId: "drafting", assignee: "Ryan Colclough", evidenceRequired: "Draft wording and committee review record" },
      { id: "t2", title: "Review Article VI", description: "Complete the scheduled article review and record findings.", status: "in-progress", due: "2026-08-15", projectId: "bylaw-modernization-2026", phaseId: "committee-review", assignee: "Ryan Colclough", evidenceRequired: "Completed article review" },
      { id: "t3", title: "Prepare ONCA comparison", description: "Confirm legal references and affected article locations.", status: "not-started", due: "2026-09-01", projectId: "bylaw-modernization-2026", phaseId: "comparison", assignee: "Ryan Colclough", evidenceRequired: "Comparison record" }
    ],
    documents: [],
    activity: [{ title: "Committee workspace created", date: "2026-07-16" }]
  },
  {
    id: "core-development",
    name: "CORE Development Committee",
    purpose: "Keep the CORE roadmap visible: current focus, what comes next, completed work, and product decisions.",
    chair: "Ryan Colclough",
    status: "on-track",
    nextMeeting: "",
    members: [{ name: "Ryan Colclough", role: "Chair / Administrator" }],
    responsibilities: ["Keep the current development focus visible.", "Preserve product decisions and release history.", "Use CORE as a visual guide without slowing development."],
    projects: [
      {
        id: "core-governance-engine",
        name: "CORE Governance Engine",
        purpose: "Build a complete governance operating system for Temple Boards.",
        goal: "Deliver a stable, demonstrable platform covering compliance, committees, meetings, projects and permanent records.",
        lead: "Ryan Colclough",
        startDate: "2026-07-09",
        targetDate: "2026-09-30",
        status: "in-progress",
        priority: "high",
        currentPhase: "Committee Project Management",
        definitionOfDone: "All planned modules are functional on mobile and desktop, workflows are connected end-to-end, demo data is accurate, critical bugs are closed and the platform is ready for board and legal review.",
        phases: [
          { id: "compliance", name: "Compliance Module", weight: 20 },
          { id: "committees", name: "Committee Dashboards", weight: 15 },
          { id: "meetings", name: "Meeting Preparation", weight: 15 },
          { id: "projects", name: "Project Management", weight: 20 },
          { id: "testing", name: "Testing & Polish", weight: 20 },
          { id: "demo", name: "Demo Readiness", weight: 10 }
        ],
        milestones: [
          { id: "c1", title: "Compliance comparison workflow", phaseId: "compliance", complete: true, evidence: "CORE 3.1.x builds" },
          { id: "c2", title: "Committee dashboard templates", phaseId: "committees", complete: true, evidence: "CORE 3.2.1" },
          { id: "c3", title: "Recurring meeting readiness workflow", phaseId: "meetings", complete: true, evidence: "Committee readiness screen" },
          { id: "c4", title: "Project / phase / milestone management", phaseId: "projects", complete: false, evidence: "CORE 3.2.1" },
          { id: "c5", title: "Cross-device testing", phaseId: "testing", complete: false, evidence: "Test log" },
          { id: "c6", title: "Board-ready demonstration", phaseId: "demo", complete: false, evidence: "Demo checklist" }
        ]
      }
    ],
    tasks: [
      { id: "ct1", title: "Build project management engine", description: "Connect projects, phases, milestones, tasks, evidence and completion rules.", status: "in-progress", due: "", projectId: "core-governance-engine", phaseId: "projects", assignee: "Ryan Colclough", evidenceRequired: "Working project detail page" },
      { id: "ct2", title: "Connect meeting agenda to projects", description: "Allow committee agenda items to reference active projects.", status: "not-started", due: "", projectId: "core-governance-engine", phaseId: "meetings", assignee: "Ryan Colclough", evidenceRequired: "Agenda linkage test" },
      { id: "ct3", title: "Complete mobile and desktop testing", description: "Verify all dashboard cards and workflows.", status: "not-started", due: "", projectId: "core-governance-engine", phaseId: "testing", assignee: "Ryan Colclough", evidenceRequired: "Test checklist" }
    ],
    documents: [],
    activity: [{ title: "Development roadmap activated in CORE 3.0", date: "2026-07-16" }]
  },
  { id: "finance", name: "Finance Committee", purpose: "Financial oversight, budgeting, insurance, and annual reporting.", chair: "Unassigned", status: "attention", nextMeeting: "", members: [], responsibilities: [], projects: [], tasks: [{ id:"f1", title:"Confirm insurance renewal", description:"Confirm renewal requirements and report to the Board.", status:"not-started", due:"2026-08-01", projectId:"", phaseId:"", assignee:"Unassigned", evidenceRequired:"Renewal confirmation" }], documents: [], activity: [] },
  { id: "building", name: "Building Committee", purpose: "Building operations, maintenance, safety, and capital planning.", chair: "Unassigned", status: "setup", nextMeeting: "", members: [], responsibilities: [], projects: [], tasks: [], documents: [], activity: [] }
];

export default function register(ctx) {
  const { router, renderShell, storage, toast } = ctx;
  const key = "COMMITTEES";
  const get = () => normalize(storage.get(key, seed));
  const save = value => storage.set(key, value);

  router.register("committees", () => list());
  router.register("committee", params => detail(params.id || "bylaws", params.tab || "overview"));
  router.register("committee-project", params => projectDetail(params.committeeId || "bylaws", params.projectId));

  function list() {
    const items = get();
    const openTasks = items.reduce((sum, committee) => sum + committee.tasks.filter(task => task.status !== "complete").length, 0);
    renderShell(`
      <div class="backline committee-backline"><button type="button" data-route="dashboard">‹ Dashboard</button></div>
      <section class="hero committee-list-hero"><div class="eyebrow">Operational Governance</div><h1>Committee Manager</h1><p>Manage mandates, people, projects, milestones, tasks, evidence and meetings.</p><div class="rule"></div></section>
      <section class="committee-toolbar glass-card"><button class="btn" type="button" data-new-committee>＋ Create Committee</button><div class="committee-toolbar-stat"><strong>${items.length}</strong><span>Committees</span></div><div class="committee-toolbar-stat"><strong>${openTasks}</strong><span>Open Tasks</span></div></section>
      <section class="committee-grid">${items.map(card).join("")}</section>
    `, "committees");
  }

  function card(committee) {
    const taskCount = committee.tasks.filter(task => task.status !== "complete").length;
    const progress = committeeProgress(committee);
    return `<button class="committee-card glass-card" type="button" data-open-committee="${committee.id}">
      <div class="committee-card-head"><span class="committee-status ${committee.status}"></span><small>${label(committee.status)}</small><span class="committee-card-arrow">→</span></div>
      <div class="committee-card-copy"><h2>${esc(committee.name)}</h2><p>${esc(committee.purpose)}</p></div>
      <div class="committee-progress" aria-label="${progress}% progress"><span style="width:${progress}%"></span></div>
      <div class="committee-stats"><div><b>${progress}%</b><small>Project Health</small></div><div><b>${committee.projects.length}</b><small>Projects</small></div><div><b>${taskCount}</b><small>Open Tasks</small></div></div>
      <footer><span><small>Chair</small><strong>${esc(committee.chair)}</strong></span><b>Open workspace</b></footer>
    </button>`;
  }

  function detail(id, activeTab = "overview") {
    const committee = get().find(item => item.id === id);
    if (!committee) return list();
    const tabs = ["overview", "members", "responsibilities", "projects", "meetings", "documents", "activity"];
    if (!tabs.includes(activeTab)) activeTab = "overview";
    const progress = committeeProgress(committee);
    renderShell(`
      <div class="backline committee-backline"><button type="button" data-route="committees">‹ All Committees</button></div>
      <section class="committee-hero glass-card"><div class="committee-hero-copy"><span>${label(committee.status)}</span><h1>${esc(committee.name)}</h1><p>${esc(committee.purpose)}</p></div><div class="committee-ring" style="--score:${progress}"><div><strong>${progress}%</strong><small>Health</small></div></div></section>
      <nav class="committee-tabs">${tabs.map(tab => `<button type="button" class="${tab===activeTab?"active":""}" data-committee-tab="${tab}" data-committee-id="${committee.id}">${titleCase(tab)}</button>`).join("")}</nav>
      <section class="committee-tab-content">${renderTab(committee, activeTab)}</section>
    `, "committees");
  }

  function renderTab(committee, tab) {
    if (tab === "members") return membersPanel(committee, true);
    if (tab === "responsibilities") return responsibilitiesPanel(committee, true);
    if (tab === "projects") return projectsPanel(committee, true);
    if (tab === "meetings") return meetingsPanel(committee, true);
    if (tab === "documents") return documentsPanel(committee, true);
    if (tab === "activity") return activityPanel(committee, true);
    return `<section class="committee-detail-grid">${membersPanel(committee)}${tasksPanel(committee)}${projectsPanel(committee)}${meetingsPanel(committee)}</section>`;
  }

  function projectsPanel(committee, full=false) {
    return `<article class="glass-card committee-panel ${full?"committee-panel-full":""}">
      ${panelHeader("Initiatives", "Projects", `<button type="button" data-add-project="${committee.id}">Add project</button>`)}
      <div class="committee-list project-list">${committee.projects.length ? committee.projects.map(project => projectRow(committee, project)).join("") : emptyState("No projects yet.", "Create a project with a purpose, goal, phases, milestones and a definition of done.")}</div>
    </article>`;
  }

  function projectRow(committee, project) {
    const progress = projectProgress(committee, project);
    const open = committee.tasks.filter(t => t.projectId === project.id && t.status !== "complete").length;
    const next = nextMilestone(project);
    return `<button type="button" class="project-row project-row-button" data-open-project="${project.id}" data-project-committee="${committee.id}">
      <div class="row-copy"><strong>${esc(project.name)}</strong><small>${esc(project.currentPhase || "Phase not set")} · ${open} open task${open===1?"":"s"}${next?` · Next: ${esc(next.title)}`:""}</small></div>
      <div class="project-progress-wrap"><div class="committee-progress"><span style="width:${progress}%"></span></div><b>${progress}%</b></div>
    </button>`;
  }

  function tasksPanel(committee) {
    const grouped = groupTasks(committee);
    return `<article class="glass-card committee-panel">
      ${panelHeader("Current Work", "Tasks", `<button type="button" data-add-task="${committee.id}">Add task</button>`)}
      <div class="committee-list task-groups">${grouped.length ? grouped.map(group => `<section class="task-group"><div class="task-group-title"><strong>${esc(group.name)}</strong><small>${group.items.length} task${group.items.length===1?"":"s"}</small></div>${group.items.map(task => taskRow(committee, task)).join("")}</section>`).join("") : emptyState("No tasks yet.", "Add the first action item for this committee.")}</div>
    </article>`;
  }

  function taskRow(committee, task) {
    const project = committee.projects.find(p => p.id === task.projectId);
    const phase = project?.phases?.find(p => p.id === task.phaseId);
    return `<button type="button" class="task-row task-row-button" data-edit-task="${task.id}" data-task-committee="${committee.id}">
      <span class="task-state ${task.status}"></span><div class="row-copy"><strong>${esc(task.title)}</strong><small>${esc(task.assignee || "Unassigned")} · ${phase?esc(phase.name):"No phase"} · ${formatDate(task.due)||"No due date"}</small></div><span class="status-pill ${task.status}">${titleCase(task.status.replaceAll("-"," "))}</span>
    </button>`;
  }

  function projectDetail(committeeId, projectId) {
    const committee = get().find(item => item.id === committeeId);
    const project = committee?.projects.find(item => item.id === projectId);
    if (!committee || !project) return detail(committeeId, "projects");
    const progress = projectProgress(committee, project);
    const tasks = committee.tasks.filter(t => t.projectId === project.id);
    const completed = tasks.filter(t => t.status === "complete").length;
    const next = nextMilestone(project);
    renderShell(`
      <div class="backline committee-backline"><button type="button" data-back-projects="${committee.id}">‹ ${esc(committee.name)}</button></div>
      <section class="project-hero glass-card"><div><div class="eyebrow">${esc(committee.name)} · Project</div><h1>${esc(project.name)}</h1><p>${esc(project.purpose || "No purpose recorded.")}</p></div><div class="project-score"><strong>${progress}%</strong><small>Overall progress</small></div></section>
      <section class="project-metrics"><article class="metric-card"><span>Current phase</span><strong>${esc(project.currentPhase || "Not set")}</strong></article><article class="metric-card"><span>Target date</span><strong>${formatDate(project.targetDate)||"Not set"}</strong></article><article class="metric-card"><span>Tasks</span><strong>${completed}/${tasks.length}</strong></article><article class="metric-card"><span>Next milestone</span><strong>${next?esc(next.title):"All milestones complete"}</strong></article></section>
      <section class="project-detail-grid">
        <article class="glass-card project-section"><div class="panel-title"><div><span>Direction</span><h2>Goal & Definition of Done</h2></div><button type="button" data-edit-project="${project.id}" data-project-committee="${committee.id}">Edit</button></div><h3>Goal</h3><p>${esc(project.goal||"No goal recorded.")}</p><h3>Definition of done</h3><p>${esc(project.definitionOfDone||"No completion criteria recorded.")}</p><div class="project-meta"><span><b>Lead</b>${esc(project.lead||"Unassigned")}</span><span><b>Priority</b>${titleCase(project.priority||"normal")}</span><span><b>Status</b>${titleCase((project.status||"proposed").replaceAll("-"," "))}</span></div></article>
        <article class="glass-card project-section"><div class="panel-title"><div><span>Roadmap</span><h2>Phases</h2></div></div><div class="phase-list">${(project.phases||[]).map(phase => phaseRow(committee, project, phase)).join("") || emptyState("No phases configured.", "Edit the project to add its roadmap.")}</div></article>
        <article class="glass-card project-section project-section-wide"><div class="panel-title"><div><span>Delivery</span><h2>Milestones</h2></div><button type="button" data-add-milestone="${project.id}" data-project-committee="${committee.id}">Add milestone</button></div><div class="milestone-list">${(project.milestones||[]).map(m => milestoneRow(committee, project, m)).join("") || emptyState("No milestones yet.", "Add measurable deliverables that prove the project is advancing.")}</div></article>
        <article class="glass-card project-section project-section-wide"><div class="panel-title"><div><span>Execution</span><h2>Project Tasks</h2></div><button type="button" data-add-project-task="${project.id}" data-project-committee="${committee.id}">Add task</button></div><div class="committee-list">${tasks.length ? tasks.map(task => taskRow(committee, task)).join("") : emptyState("No linked tasks.", "Create a task and assign it to this project and phase.")}</div></article>
      </section>
    `, "committees");
  }

  function phaseRow(committee, project, phase) {
    const tasks = committee.tasks.filter(t => t.projectId===project.id && t.phaseId===phase.id);
    const milestones = (project.milestones||[]).filter(m => m.phaseId===phase.id);
    const completeMilestones = milestones.filter(m=>m.complete).length;
    const taskComplete = tasks.filter(t=>t.status==="complete").length;
    const pct = milestones.length ? Math.round(completeMilestones/milestones.length*100) : tasks.length ? Math.round(taskComplete/tasks.length*100) : 0;
    return `<div class="phase-row"><div><strong>${esc(phase.name)}</strong><small>${phase.weight||0}% project weight · ${completeMilestones}/${milestones.length} milestones</small></div><div class="phase-progress"><span><i style="width:${pct}%"></i></span><b>${pct}%</b></div></div>`;
  }

  function milestoneRow(committee, project, milestone) {
    return `<button type="button" class="milestone-row ${milestone.complete?"complete":""}" data-toggle-milestone="${milestone.id}" data-project-id="${project.id}" data-project-committee="${committee.id}"><span class="milestone-check">${milestone.complete?"✓":""}</span><div><strong>${esc(milestone.title)}</strong><small>${esc(milestone.evidence||"No evidence requirement recorded")}</small></div><b>${milestone.complete?"Complete":"Open"}</b></button>`;
  }

  function membersPanel(committee, full=false){ return `<article class="glass-card committee-panel ${full?"committee-panel-full":""}">${panelHeader("Leadership","Members",`<button type="button" data-add-member="${committee.id}">Add member</button>`)}<div class="committee-list">${committee.members.length?committee.members.map(member=>`<div class="member-row"><span class="member-avatar">${initials(member.name)}</span><div class="row-copy"><strong>${esc(member.name)}</strong><small>${esc(member.role)}</small></div></div>`).join(""):emptyState("No members configured.","Add the chair and committee members to begin.")}</div></article>`; }
  function responsibilitiesPanel(committee, full=false){ return `<article class="glass-card committee-panel ${full?"committee-panel-full":""}">${panelHeader("Mandate","Responsibilities",`<button type="button" data-add-responsibility="${committee.id}">Add responsibility</button>`)}<div class="committee-list responsibility-list">${committee.responsibilities.length?committee.responsibilities.map((item,index)=>`<div class="responsibility-row"><span>${String(index+1).padStart(2,"0")}</span><p>${esc(item)}</p></div>`).join(""):emptyState("No responsibilities recorded.","Add the duties established by the by-laws or committee mandate.")}</div></article>`; }
  function meetingsPanel(committee, full=false){ return `<article class="glass-card committee-panel ${full?"committee-panel-full":""}">${panelHeader("Schedule","Next Meeting","")}<div class="meeting-feature"><div><strong>${committee.nextMeeting?formatDate(committee.nextMeeting):"Not scheduled"}</strong><small>${committee.nextMeeting?new Date(`${committee.nextMeeting}T12:00:00`).toLocaleDateString("en-CA",{weekday:"long",month:"long",day:"numeric"}):"Schedule the committee's next meeting."}</small></div><button class="btn secondary" type="button" data-schedule-meeting="${committee.id}">${committee.nextMeeting?"Change meeting":"Schedule meeting"}</button></div></article>`; }
  function documentsPanel(committee, full=false){ return `<article class="glass-card committee-panel ${full?"committee-panel-full":""}">${panelHeader("Records","Documents",`<button type="button" data-add-document="${committee.id}">Add document</button>`)}<div class="committee-list">${committee.documents.length?committee.documents.map(document=>`<div class="document-row"><div class="document-icon">▤</div><div class="row-copy"><strong>${esc(document.title)}</strong><small>${formatDate(document.date)}</small></div></div>`).join(""):emptyState("No documents added.","Link minutes, reports, mandates, evidence or working files here.")}</div></article>`; }
  function activityPanel(committee, full=false){ return `<article class="glass-card committee-panel ${full?"committee-panel-full":""}">${panelHeader("Audit Trail","Activity","")}<div class="committee-list">${committee.activity.length?committee.activity.map(item=>`<div class="activity-row"><span></span><div class="row-copy"><strong>${esc(item.title)}</strong><small>${formatDate(item.date)}</small></div></div>`).join(""):emptyState("No activity recorded.","Committee changes will appear here as the workspace is used.")}</div></article>`; }

  document.addEventListener("click", event => {
    const open = event.target.closest("[data-open-committee]"); if(open){ const id=open.dataset.openCommittee; id==="core-development"?detail(id,"overview"):router.go("committee",{id,tab:"overview"}); return; }
    const tab = event.target.closest("[data-committee-tab]"); if(tab){router.go("committee",{id:tab.dataset.committeeId,tab:tab.dataset.committeeTab});return;}
    const openProject = event.target.closest("[data-open-project]"); if(openProject){router.go("committee-project",{committeeId:openProject.dataset.projectCommittee,projectId:openProject.dataset.openProject});return;}
    const backProjects = event.target.closest("[data-back-projects]"); if(backProjects){router.go("committee",{id:backProjects.dataset.backProjects,tab:"projects"});return;}

    if(event.target.closest("[data-new-committee]")){const name=prompt("Committee name");if(!name)return;const items=get();items.push({id:`committee-${Date.now()}`,name,purpose:"Committee purpose not yet entered.",chair:"Unassigned",status:"setup",nextMeeting:"",members:[],responsibilities:[],tasks:[],projects:[],documents:[],activity:[{title:"Committee created",date:today()}]});save(items);toast("Committee created.");list();return;}
    const addMember=event.target.closest("[data-add-member]");if(addMember){const name=prompt("Member name");if(!name)return;const role=prompt("Role","Member")||"Member";updateCommittee(addMember.dataset.addMember,c=>{c.members.push({name,role});if(c.chair==="Unassigned"&&role.toLowerCase().includes("chair"))c.chair=name;addActivity(c,`${name} added as ${role}`)});toast("Member added.");detail(addMember.dataset.addMember,"members");return;}
    const addTask=event.target.closest("[data-add-task]");if(addTask){createTask(addTask.dataset.addTask);return;}
    const addProjectTask=event.target.closest("[data-add-project-task]");if(addProjectTask){createTask(addProjectTask.dataset.projectCommittee,addProjectTask.dataset.addProjectTask);return;}
    const editTask=event.target.closest("[data-edit-task]");if(editTask){editTaskRecord(editTask.dataset.taskCommittee,editTask.dataset.editTask);return;}
    const addProject=event.target.closest("[data-add-project]");if(addProject){createProject(addProject.dataset.addProject);return;}
    const editProject=event.target.closest("[data-edit-project]");if(editProject){editProjectRecord(editProject.dataset.projectCommittee,editProject.dataset.editProject);return;}
    const addMilestone=event.target.closest("[data-add-milestone]");if(addMilestone){createMilestone(addMilestone.dataset.projectCommittee,addMilestone.dataset.addMilestone);return;}
    const toggleMilestone=event.target.closest("[data-toggle-milestone]");if(toggleMilestone){updateCommittee(toggleMilestone.dataset.projectCommittee,c=>{const p=c.projects.find(x=>x.id===toggleMilestone.dataset.projectId);const m=p?.milestones?.find(x=>x.id===toggleMilestone.dataset.toggleMilestone);if(m){m.complete=!m.complete;addActivity(c,`${m.complete?"Completed":"Reopened"} milestone: ${m.title}`);syncCurrentPhase(c,p);}});projectDetail(toggleMilestone.dataset.projectCommittee,toggleMilestone.dataset.projectId);return;}
    const addResponsibility=event.target.closest("[data-add-responsibility]");if(addResponsibility){const text=prompt("Committee responsibility");if(!text)return;updateCommittee(addResponsibility.dataset.addResponsibility,c=>{c.responsibilities.push(text);addActivity(c,"Committee mandate updated")});toast("Responsibility added.");detail(addResponsibility.dataset.addResponsibility,"responsibilities");return;}
    const schedule=event.target.closest("[data-schedule-meeting]");if(schedule){const date=prompt("Meeting date (YYYY-MM-DD)","");if(!date)return;updateCommittee(schedule.dataset.scheduleMeeting,c=>{c.nextMeeting=date;addActivity(c,`Meeting scheduled for ${date}`)});toast("Meeting scheduled.");detail(schedule.dataset.scheduleMeeting,"meetings");return;}
    const addDocument=event.target.closest("[data-add-document]");if(addDocument){const title=prompt("Document title");if(!title)return;updateCommittee(addDocument.dataset.addDocument,c=>{c.documents.push({title,date:today()});addActivity(c,`Document added: ${title}`)});toast("Document added.");detail(addDocument.dataset.addDocument,"documents");}
  });

  function createProject(committeeId){
    const name=prompt("Project name");if(!name)return;
    const purpose=prompt("Purpose — what problem is this project solving?","")||"";
    const goal=prompt("Goal — what outcome should this project achieve?","")||"";
    const lead=prompt("Project lead","")||"Unassigned";
    const targetDate=prompt("Target completion date (YYYY-MM-DD)","")||"";
    const definitionOfDone=prompt("Definition of done — what must be true before this project can close?","")||"";
    const id=`project-${Date.now()}`;
    const phases=["Planning","Execution","Review","Approval","Implementation"].map((name,index)=>({id:`phase-${index+1}`,name,weight:20}));
    updateCommittee(committeeId,c=>{c.projects.push({id,name,purpose,goal,lead,startDate:today(),targetDate,status:"in-progress",priority:"normal",currentPhase:"Planning",definitionOfDone,phases,milestones:[]});addActivity(c,`Project created: ${name}`)});
    toast("Project created with a roadmap.");router.go("committee-project",{committeeId,projectId:id});
  }

  function editProjectRecord(committeeId,projectId){
    const c=get().find(x=>x.id===committeeId);const p=c?.projects.find(x=>x.id===projectId);if(!p)return;
    const purpose=prompt("Project purpose",p.purpose||"");if(purpose===null)return;
    const goal=prompt("Project goal",p.goal||"");if(goal===null)return;
    const lead=prompt("Project lead",p.lead||"");if(lead===null)return;
    const targetDate=prompt("Target date (YYYY-MM-DD)",p.targetDate||"");if(targetDate===null)return;
    const definitionOfDone=prompt("Definition of done",p.definitionOfDone||"");if(definitionOfDone===null)return;
    updateCommittee(committeeId,committee=>{const project=committee.projects.find(x=>x.id===projectId);Object.assign(project,{purpose,goal,lead,targetDate,definitionOfDone});addActivity(committee,`Project updated: ${project.name}`)});
    toast("Project updated.");projectDetail(committeeId,projectId);
  }

  function createMilestone(committeeId,projectId){
    const c=get().find(x=>x.id===committeeId);const p=c?.projects.find(x=>x.id===projectId);if(!p)return;
    const title=prompt("Milestone / deliverable");if(!title)return;
    const phaseNames=(p.phases||[]).map(x=>x.name).join(", ");
    const chosen=prompt(`Phase (${phaseNames})`,p.currentPhase||"")||p.currentPhase;
    const phase=(p.phases||[]).find(x=>x.name.toLowerCase()===chosen.toLowerCase())||(p.phases||[])[0];
    const evidence=prompt("Evidence required to prove completion","")||"Completion evidence";
    updateCommittee(committeeId,committee=>{const project=committee.projects.find(x=>x.id===projectId);project.milestones.push({id:`milestone-${Date.now()}`,title,phaseId:phase?.id||"",complete:false,evidence});addActivity(committee,`Milestone added: ${title}`)});
    toast("Milestone added.");projectDetail(committeeId,projectId);
  }

  function createTask(committeeId,forcedProjectId=""){
    const c=get().find(x=>x.id===committeeId);if(!c)return;
    const title=prompt("Task title");if(!title)return;
    const description=prompt("Task description / expected outcome","")||"";
    let projectId=forcedProjectId;
    if(!projectId&&c.projects.length){const names=c.projects.map(p=>p.name).join(", ");const choice=prompt(`Assign to project (${names}) or leave blank for Unassigned Work`,"")||"";projectId=c.projects.find(p=>p.name.toLowerCase()===choice.toLowerCase())?.id||"";}
    const project=c.projects.find(p=>p.id===projectId);
    let phaseId="";
    if(project?.phases?.length){const names=project.phases.map(p=>p.name).join(", ");const choice=prompt(`Assign to phase (${names})`,project.currentPhase||"")||project.currentPhase;phaseId=project.phases.find(p=>p.name.toLowerCase()===choice.toLowerCase())?.id||project.phases[0].id;}
    const assignee=prompt("Assignee",c.chair||"Unassigned")||"Unassigned";
    const due=prompt("Due date (YYYY-MM-DD)","")||"";
    const evidenceRequired=prompt("Evidence / deliverable required before completion","")||"Completion notes";
    updateCommittee(committeeId,committee=>{committee.tasks.push({id:`task-${Date.now()}`,title,description,status:"not-started",due,projectId,phaseId,assignee,evidenceRequired});addActivity(committee,`Task added: ${title}`)});
    toast("Task added and linked.");forcedProjectId?projectDetail(committeeId,forcedProjectId):detail(committeeId,"overview");
  }

  function editTaskRecord(committeeId,taskId){
    const c=get().find(x=>x.id===committeeId);const t=c?.tasks.find(x=>x.id===taskId);if(!t)return;
    const status=prompt("Status: not-started, in-progress, blocked, awaiting-approval, complete",t.status||"not-started");if(status===null)return;
    let completionNotes=t.completionNotes||"";
    if(status==="complete"){completionNotes=prompt(`Completion evidence / notes required:\n${t.evidenceRequired||"Evidence"}`,completionNotes);if(!completionNotes){toast("Completion evidence is required before closing this task.");return;}}
    const assignee=prompt("Assignee",t.assignee||"Unassigned");if(assignee===null)return;
    const due=prompt("Due date (YYYY-MM-DD)",t.due||"");if(due===null)return;
    updateCommittee(committeeId,committee=>{const task=committee.tasks.find(x=>x.id===taskId);Object.assign(task,{status,completionNotes,assignee,due});const project=committee.projects.find(p=>p.id===task.projectId);if(project)syncCurrentPhase(committee,project);addActivity(committee,`Task updated: ${task.title} (${status})`)});
    toast("Task updated.");const updated=get().find(x=>x.id===committeeId)?.tasks.find(x=>x.id===taskId);updated?.projectId?projectDetail(committeeId,updated.projectId):detail(committeeId,"overview");
  }

  function updateCommittee(id,callback){const items=get();const committee=items.find(item=>item.id===id);if(!committee)return;callback(committee);save(items);}
}

function normalize(items){
  const source=Array.isArray(items)?[...items]:[...seed];
  seed.forEach(defaultItem=>{if(!source.some(item=>item.id===defaultItem.id))source.push(defaultItem);});
  return source.map(item=>{
    const defaultItem=seed.find(s=>s.id===item.id);
    const projects=(Array.isArray(item.projects)?item.projects:[]).map((project,index)=>normalizeProject(project,item.id,index));
    const tasks=(Array.isArray(item.tasks)?item.tasks:[]).map((task,index)=>normalizeTask(task,index,projects));
    return {...defaultItem,...item,members:Array.isArray(item.members)?item.members:[],responsibilities:Array.isArray(item.responsibilities)?item.responsibilities:[],projects,tasks,documents:Array.isArray(item.documents)?item.documents:[],activity:Array.isArray(item.activity)?item.activity:[]};
  });
}
function normalizeProject(project,committeeId,index){const id=project.id||`${committeeId}-project-${index+1}`;const phases=Array.isArray(project.phases)&&project.phases.length?project.phases:[{id:"planning",name:"Planning",weight:20},{id:"execution",name:"Execution",weight:40},{id:"review",name:"Review",weight:20},{id:"approval",name:"Approval",weight:20}];return {...project,id,purpose:project.purpose||"Purpose not yet recorded.",goal:project.goal||"Goal not yet recorded.",lead:project.lead||"Unassigned",status:project.status||"in-progress",priority:project.priority||"normal",currentPhase:project.currentPhase||phases[0].name,definitionOfDone:project.definitionOfDone||"Project completion criteria not yet defined.",phases,milestones:Array.isArray(project.milestones)?project.milestones:[]};}
function normalizeTask(task,index,projects){return {...task,id:task.id||`task-${index+1}-${slug(task.title)}`,description:task.description||"",status:task.status||"not-started",projectId:task.projectId||"",phaseId:task.phaseId||"",assignee:task.assignee||"Unassigned",evidenceRequired:task.evidenceRequired||"Completion notes"};}
function committeeProgress(committee){if(!committee.projects.length)return 0;return Math.round(committee.projects.reduce((sum,p)=>sum+projectProgress(committee,p),0)/committee.projects.length);}
function projectProgress(committee,project){const phases=project.phases||[];if(!phases.length)return 0;const totalWeight=phases.reduce((s,p)=>s+(Number(p.weight)||0),0)||100;let score=0;phases.forEach(phase=>{const milestones=(project.milestones||[]).filter(m=>m.phaseId===phase.id);const tasks=committee.tasks.filter(t=>t.projectId===project.id&&t.phaseId===phase.id);let phasePct=0;if(milestones.length)phasePct=milestones.filter(m=>m.complete).length/milestones.length;else if(tasks.length)phasePct=tasks.filter(t=>t.status==="complete").length/tasks.length;score+=phasePct*(Number(phase.weight)||0);});return Math.max(0,Math.min(100,Math.round(score/totalWeight*100)));}
function nextMilestone(project){return (project.milestones||[]).find(m=>!m.complete);}
function syncCurrentPhase(committee,project){for(const phase of project.phases||[]){const milestones=(project.milestones||[]).filter(m=>m.phaseId===phase.id);const tasks=committee.tasks.filter(t=>t.projectId===project.id&&t.phaseId===phase.id);const done=(milestones.length?milestones.every(m=>m.complete):true)&&(tasks.length?tasks.every(t=>t.status==="complete"):true);if(!done){project.currentPhase=phase.name;return;}}project.currentPhase="Complete";project.status="complete";}
function groupTasks(committee){const groups=committee.projects.map(project=>({id:project.id,name:project.name,items:committee.tasks.filter(t=>t.projectId===project.id)})).filter(g=>g.items.length);const unassigned=committee.tasks.filter(t=>!t.projectId||!committee.projects.some(p=>p.id===t.projectId));if(unassigned.length)groups.push({id:"unassigned",name:"Unassigned Work",items:unassigned});return groups;}
function panelHeader(eyebrow,title,action){return `<div class="panel-title"><div><span>${eyebrow}</span><h2>${title}</h2></div>${action||""}</div>`;}
function emptyState(title,copy){return `<div class="committee-empty"><strong>${title}</strong><small>${copy}</small></div>`;}
function addActivity(committee,title){committee.activity.unshift({title,date:today()});}
function label(status){return status==="on-track"?"On Track":status==="attention"?"Attention Required":"Setup Required";}
function initials(value){return String(value||"").split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase();}
function formatDate(value){if(!value)return"";const date=new Date(`${value}T12:00:00`);if(Number.isNaN(date.getTime()))return value;return date.toLocaleDateString("en-CA",{year:"numeric",month:"short",day:"numeric"});}
function titleCase(value){return String(value||"").replace(/\b\w/g,letter=>letter.toUpperCase());}
function today(){return new Date().toISOString().slice(0,10);}
function slug(value){return String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,32);}
function esc(value){return String(value||"").replace(/[&<>\"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));}
