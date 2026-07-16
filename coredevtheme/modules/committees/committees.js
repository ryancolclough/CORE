const seed = [
  {
    id: "bylaws",
    name: "By-Laws Committee",
    purpose: "Maintain and review the corporate by-laws and governance records.",
    chair: "Ryan Colclough",
    status: "on-track",
    progress: 86,
    nextMeeting: "2026-07-29",
    members: [
      { name: "Ryan Colclough", role: "Chair" },
      { name: "Greg Forsyth", role: "Ex Officio" }
    ],
    responsibilities: [
      "Review the by-laws on a scheduled basis.",
      "Recommend amendments to the Temple Board.",
      "Maintain the official governance record."
    ],
    tasks: [
      { title: "Review Article VI", status: "in-progress", due: "2026-08-15" },
      { title: "Prepare ONCA comparison", status: "not-started", due: "2026-09-01" }
    ],
    projects: [
      { name: "2026 By-Law Review", progress: 64, status: "active" }
    ],
    documents: [],
    activity: [
      { title: "Committee workspace created", date: "2026-07-16" }
    ]
  },

  {
    id: "core-development",
    name: "CORE Development Committee",
    purpose: "Keep the CORE roadmap visible: current focus, what comes next, completed work, and product decisions.",
    chair: "Ryan Colclough",
    status: "on-track",
    progress: 32,
    nextMeeting: "",
    members: [{ name: "Ryan Colclough", role: "Chair / Administrator" }],
    responsibilities: [
      "Keep the current development focus visible.",
      "Preserve product decisions and release history.",
      "Use CORE as a visual guide without slowing development."
    ],
    tasks: [
      { title: "Build Task Engine", status: "in-progress", due: "" },
      { title: "Build meeting readiness cycle", status: "not-started", due: "" },
      { title: "Connect PWA reminders to assigned responsibilities", status: "not-started", due: "" }
    ],
    projects: [
      { name: "CORE Governance Engine", progress: 32, status: "active" }
    ],
    documents: [],
    activity: [{ title: "Development roadmap activated in CORE 3.0", date: "2026-07-16" }]
  },
  {
    id: "finance",
    name: "Finance Committee",
    purpose: "Financial oversight, budgeting, insurance, and annual reporting.",
    chair: "Unassigned",
    status: "attention",
    progress: 48,
    nextMeeting: "",
    members: [],
    responsibilities: [],
    tasks: [
      { title: "Confirm insurance renewal", status: "not-started", due: "2026-08-01" }
    ],
    projects: [],
    documents: [],
    activity: []
  },
  {
    id: "building",
    name: "Building Committee",
    purpose: "Building operations, maintenance, safety, and capital planning.",
    chair: "Unassigned",
    status: "setup",
    progress: 20,
    nextMeeting: "",
    members: [],
    responsibilities: [],
    tasks: [],
    projects: [],
    documents: [],
    activity: []
  }
];

export default function register(ctx) {
  const { router, renderShell, storage, toast } = ctx;
  const key = "COMMITTEES";
  const get = () => normalize(storage.get(key, seed));
  const save = value => storage.set(key, value);

  router.register("committees", () => list());
  router.register("committee", params => detail(params.id || "bylaws", params.tab || "overview"));

  function list() {
    const items = get();
    const openTasks = items.reduce(
      (sum, committee) => sum + committee.tasks.filter(task => task.status !== "complete").length,
      0
    );

    renderShell(`
      <div class="backline committee-backline">
        <button type="button" data-route="dashboard">‹ Dashboard</button>
      </div>

      <section class="hero committee-list-hero">
        <div class="eyebrow">Operational Governance</div>
        <h1>Committee Manager</h1>
        <p>Manage mandates, members, responsibilities, projects, meetings, and records.</p>
        <div class="rule"></div>
      </section>

      <section class="committee-toolbar glass-card">
        <button class="btn" type="button" data-new-committee>＋ Create Committee</button>
        <div class="committee-toolbar-stat">
          <strong>${items.length}</strong>
          <span>Committees</span>
        </div>
        <div class="committee-toolbar-stat">
          <strong>${openTasks}</strong>
          <span>Open Tasks</span>
        </div>
      </section>

      <section class="committee-grid">
        ${items.map(card).join("")}
      </section>
    `, "committees");
  }

  function card(committee) {
    const taskCount = committee.tasks.filter(task => task.status !== "complete").length;
    return `
      <button class="committee-card glass-card" type="button" data-open-committee="${committee.id}">
        <div class="committee-card-head">
          <span class="committee-status ${committee.status}" aria-hidden="true"></span>
          <small>${label(committee.status)}</small>
          <span class="committee-card-arrow" aria-hidden="true">→</span>
        </div>

        <div class="committee-card-copy">
          <h2>${esc(committee.name)}</h2>
          <p>${esc(committee.purpose)}</p>
        </div>

        <div class="committee-progress" aria-label="${committee.progress}% progress">
          <span style="width:${committee.progress}%"></span>
        </div>

        <div class="committee-stats">
          <div><b>${committee.progress}%</b><small>Progress</small></div>
          <div><b>${committee.members.length}</b><small>Members</small></div>
          <div><b>${taskCount}</b><small>Open Tasks</small></div>
        </div>

        <footer>
          <span><small>Chair</small><strong>${esc(committee.chair)}</strong></span>
          <b>Open workspace</b>
        </footer>
      </button>
    `;
  }

  function detail(id, activeTab = "overview") {
    const committee = get().find(item => item.id === id);
    if (!committee) return list();

    const allowedTabs = ["overview", "members", "responsibilities", "projects", "meetings", "documents", "activity"];
    if (!allowedTabs.includes(activeTab)) activeTab = "overview";

    renderShell(`
      <div class="backline committee-backline">
        <button type="button" data-route="committees">‹ All Committees</button>
      </div>

      <section class="committee-hero glass-card">
        <div class="committee-hero-copy">
          <span>${label(committee.status)}</span>
          <h1>${esc(committee.name)}</h1>
          <p>${esc(committee.purpose)}</p>
        </div>
        <div class="committee-ring" style="--score:${committee.progress}">
          <div>
            <strong>${committee.progress}%</strong>
            <small>Health</small>
          </div>
        </div>
      </section>

      <nav class="committee-tabs" aria-label="Committee sections">
        ${allowedTabs.map(tab => `
          <button
            type="button"
            class="${tab === activeTab ? "active" : ""}"
            data-committee-tab="${tab}"
            data-committee-id="${committee.id}">
            ${titleCase(tab)}
          </button>
        `).join("")}
      </nav>

      <section class="committee-tab-content">
        ${renderTab(committee, activeTab)}
      </section>
    `, "committees");
  }

  function renderTab(committee, tab) {
    if (tab === "members") return membersPanel(committee, true);
    if (tab === "responsibilities") return responsibilitiesPanel(committee, true);
    if (tab === "projects") return projectsPanel(committee, true);
    if (tab === "meetings") return meetingsPanel(committee, true);
    if (tab === "documents") return documentsPanel(committee, true);
    if (tab === "activity") return activityPanel(committee, true);

    return `
      <section class="committee-detail-grid">
        ${membersPanel(committee)}
        ${tasksPanel(committee)}
        ${projectsPanel(committee)}
        ${meetingsPanel(committee)}
      </section>
    `;
  }

  function membersPanel(committee, full = false) {
    return `
      <article class="glass-card committee-panel ${full ? "committee-panel-full" : ""}">
        ${panelHeader("Leadership", "Members", `<button type="button" data-add-member="${committee.id}">Add member</button>`)}
        <div class="committee-list">
          ${committee.members.length
            ? committee.members.map(member => `
              <div class="member-row">
                <span class="member-avatar">${initials(member.name)}</span>
                <div class="row-copy">
                  <strong>${esc(member.name)}</strong>
                  <small>${esc(member.role)}</small>
                </div>
              </div>
            `).join("")
            : emptyState("No members configured.", "Add the chair and committee members to begin.")}
        </div>
      </article>
    `;
  }

  function tasksPanel(committee) {
    return `
      <article class="glass-card committee-panel">
        ${panelHeader("Current Work", "Tasks", `<button type="button" data-add-task="${committee.id}">Add task</button>`)}
        <div class="committee-list">
          ${committee.tasks.length
            ? committee.tasks.map(task => `
              <div class="task-row">
                <span class="task-state ${task.status}" aria-hidden="true"></span>
                <div class="row-copy">
                  <strong>${esc(task.title)}</strong>
                  <small>${formatDate(task.due) || "No due date"}</small>
                </div>
                <span class="status-pill ${task.status}">${titleCase(task.status.replaceAll("-", " "))}</span>
              </div>
            `).join("")
            : emptyState("No tasks yet.", "Add the first action item for this committee.")}
        </div>
      </article>
    `;
  }

  function responsibilitiesPanel(committee, full = false) {
    return `
      <article class="glass-card committee-panel ${full ? "committee-panel-full" : ""}">
        ${panelHeader("Mandate", "Responsibilities", `<button type="button" data-add-responsibility="${committee.id}">Add responsibility</button>`)}
        <div class="committee-list responsibility-list">
          ${committee.responsibilities.length
            ? committee.responsibilities.map((item, index) => `
              <div class="responsibility-row">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <p>${esc(item)}</p>
              </div>
            `).join("")
            : emptyState("No responsibilities recorded.", "Add the duties established by the by-laws or committee mandate.")}
        </div>
      </article>
    `;
  }

  function projectsPanel(committee, full = false) {
    return `
      <article class="glass-card committee-panel ${full ? "committee-panel-full" : ""}">
        ${panelHeader("Initiatives", "Projects", `<button type="button" data-add-project="${committee.id}">Add project</button>`)}
        <div class="committee-list">
          ${committee.projects.length
            ? committee.projects.map(project => `
              <div class="project-row">
                <div class="row-copy">
                  <strong>${esc(project.name)}</strong>
                  <small>${titleCase(project.status)}</small>
                </div>
                <div class="project-progress-wrap">
                  <div class="committee-progress"><span style="width:${project.progress}%"></span></div>
                  <b>${project.progress}%</b>
                </div>
              </div>
            `).join("")
            : emptyState("No projects yet.", "Create a project to group related committee work.")}
        </div>
      </article>
    `;
  }

  function meetingsPanel(committee, full = false) {
    return `
      <article class="glass-card committee-panel ${full ? "committee-panel-full" : ""}">
        ${panelHeader("Schedule", "Next Meeting", "")}
        <div class="meeting-feature">
          <div>
            <strong>${committee.nextMeeting ? formatDate(committee.nextMeeting) : "Not scheduled"}</strong>
            <small>${committee.nextMeeting
              ? new Date(`${committee.nextMeeting}T12:00:00`).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })
              : "Schedule the committee's next meeting."}</small>
          </div>
          <button class="btn secondary" type="button" data-schedule-meeting="${committee.id}">
            ${committee.nextMeeting ? "Change meeting" : "Schedule meeting"}
          </button>
        </div>
      </article>
    `;
  }

  function documentsPanel(committee, full = false) {
    return `
      <article class="glass-card committee-panel ${full ? "committee-panel-full" : ""}">
        ${panelHeader("Records", "Documents", `<button type="button" data-add-document="${committee.id}">Add document</button>`)}
        <div class="committee-list">
          ${committee.documents.length
            ? committee.documents.map(document => `
              <div class="document-row">
                <div class="document-icon">▤</div>
                <div class="row-copy"><strong>${esc(document.title)}</strong><small>${formatDate(document.date)}</small></div>
              </div>
            `).join("")
            : emptyState("No documents added.", "Link minutes, reports, mandates, or working files here.")}
        </div>
      </article>
    `;
  }

  function activityPanel(committee, full = false) {
    return `
      <article class="glass-card committee-panel ${full ? "committee-panel-full" : ""}">
        ${panelHeader("Audit Trail", "Activity", "")}
        <div class="committee-list">
          ${committee.activity.length
            ? committee.activity.map(item => `
              <div class="activity-row">
                <span></span>
                <div class="row-copy"><strong>${esc(item.title)}</strong><small>${formatDate(item.date)}</small></div>
              </div>
            `).join("")
            : emptyState("No activity recorded.", "Committee changes will appear here as the workspace is used.")}
        </div>
      </article>
    `;
  }

  document.addEventListener("click", event => {
    const open = event.target.closest("[data-open-committee]");
    if (open) {
      const committeeId = open.dataset.openCommittee;
      if (committeeId === "core-development") {
        router.go("developer", { view: "roadmap" });
      } else {
        router.go("committee", { id: committeeId, tab: "overview" });
      }
      return;
    }

    const tab = event.target.closest("[data-committee-tab]");
    if (tab) {
      router.go("committee", { id: tab.dataset.committeeId, tab: tab.dataset.committeeTab });
      return;
    }

    if (event.target.closest("[data-new-committee]")) {
      const name = prompt("Committee name");
      if (!name) return;
      const items = get();
      items.push({
        id: `committee-${Date.now()}`,
        name,
        purpose: "Committee purpose not yet entered.",
        chair: "Unassigned",
        status: "setup",
        progress: 0,
        nextMeeting: "",
        members: [],
        responsibilities: [],
        tasks: [],
        projects: [],
        documents: [],
        activity: [{ title: "Committee created", date: today() }]
      });
      save(items);
      toast("Committee created.");
      list();
      return;
    }

    const addMember = event.target.closest("[data-add-member]");
    if (addMember) {
      const name = prompt("Member name");
      if (!name) return;
      const role = prompt("Role", "Member") || "Member";
      updateCommittee(addMember.dataset.addMember, committee => {
        committee.members.push({ name, role });
        if (committee.chair === "Unassigned" && role.toLowerCase().includes("chair")) committee.chair = name;
        addActivity(committee, `${name} added as ${role}`);
      });
      toast("Member added.");
      detail(addMember.dataset.addMember, "members");
      return;
    }

    const addTask = event.target.closest("[data-add-task]");
    if (addTask) {
      const title = prompt("Task title");
      if (!title) return;
      const due = prompt("Due date (YYYY-MM-DD)", "") || "";
      updateCommittee(addTask.dataset.addTask, committee => {
        committee.tasks.push({ title, status: "not-started", due });
        addActivity(committee, `Task added: ${title}`);
      });
      toast("Task added.");
      detail(addTask.dataset.addTask, "overview");
      return;
    }

    const addProject = event.target.closest("[data-add-project]");
    if (addProject) {
      const name = prompt("Project name");
      if (!name) return;
      updateCommittee(addProject.dataset.addProject, committee => {
        committee.projects.push({ name, progress: 0, status: "active" });
        addActivity(committee, `Project created: ${name}`);
      });
      toast("Project added.");
      detail(addProject.dataset.addProject, "projects");
      return;
    }

    const addResponsibility = event.target.closest("[data-add-responsibility]");
    if (addResponsibility) {
      const text = prompt("Committee responsibility");
      if (!text) return;
      updateCommittee(addResponsibility.dataset.addResponsibility, committee => {
        committee.responsibilities.push(text);
        addActivity(committee, "Committee mandate updated");
      });
      toast("Responsibility added.");
      detail(addResponsibility.dataset.addResponsibility, "responsibilities");
      return;
    }

    const schedule = event.target.closest("[data-schedule-meeting]");
    if (schedule) {
      const date = prompt("Meeting date (YYYY-MM-DD)", "");
      if (!date) return;
      updateCommittee(schedule.dataset.scheduleMeeting, committee => {
        committee.nextMeeting = date;
        addActivity(committee, `Meeting scheduled for ${date}`);
      });
      toast("Meeting scheduled.");
      detail(schedule.dataset.scheduleMeeting, "meetings");
      return;
    }

    const addDocument = event.target.closest("[data-add-document]");
    if (addDocument) {
      const title = prompt("Document title");
      if (!title) return;
      updateCommittee(addDocument.dataset.addDocument, committee => {
        committee.documents.push({ title, date: today() });
        addActivity(committee, `Document added: ${title}`);
      });
      toast("Document added.");
      detail(addDocument.dataset.addDocument, "documents");
    }
  });

  function updateCommittee(id, callback) {
    const items = get();
    const committee = items.find(item => item.id === id);
    if (!committee) return;
    callback(committee);
    save(items);
  }
}

function normalize(items) {
  const source = Array.isArray(items) ? [...items] : [...seed];
  const development = seed.find(item => item.id === "core-development");
  if (development && !source.some(item => item.id === "core-development")) source.push(development);
  return source.map(item => ({
    ...item,
    members: Array.isArray(item.members) ? item.members : [],
    responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
    tasks: Array.isArray(item.tasks) ? item.tasks : [],
    projects: Array.isArray(item.projects) ? item.projects : [],
    documents: Array.isArray(item.documents) ? item.documents : [],
    activity: Array.isArray(item.activity) ? item.activity : []
  }));
}

function panelHeader(eyebrow, title, action) {
  return `
    <div class="panel-title">
      <div><span>${eyebrow}</span><h2>${title}</h2></div>
      ${action || ""}
    </div>
  `;
}

function emptyState(title, copy) {
  return `<div class="committee-empty"><strong>${title}</strong><small>${copy}</small></div>`;
}

function addActivity(committee, title) {
  committee.activity.unshift({ title, date: today() });
}

function label(status) {
  return status === "on-track" ? "On Track" : status === "attention" ? "Attention Required" : "Setup Required";
}

function initials(value) {
  return value.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, letter => letter.toUpperCase());
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function esc(value) {
  return String(value || "").replace(/[&<>\"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[char]));
}
