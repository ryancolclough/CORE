export default function register(ctx){
  const { router, state, renderShell, events } = ctx;

  router.register("dashboard", () => {
    const m = state.metrics();
    const actions = state.actionSummary();
    const annual = state.annualTaskSummary();
    const attention = state.attentionItems().slice(0,4);
    const amendments = state.amendmentItems();
    const score = m.total ? Math.round(((m.complete + m.discussion * .55 + m.amendment * .35) / m.total) * 100) : 0;
    const openReviews = Math.max(0, m.total - m.reviewed);
    const nextReview = `${state.reviewYear}-07-24`;
    const authorities = [
      ["ONCA", Math.min(100, score + 5), "Legal framework"],
      ["Grand Lodge", Math.min(100, score + 2), "Constitution & regulations"],
      ["Temple Board", score, "Corporate by-laws"],
      ["Internal Policies", Math.max(0, score - 7), "Operational governance"]
    ];

    const attentionRows = attention.length ? attention.map(item => `
      <button class="priority-item" data-open-direct="${item.articleIndex}:${item.sectionIndex}">
        <span class="priority-dot ${item.review.status}"></span>
        <span><strong>Section ${item.section.number}</strong><small>${item.section.title}</small></span>
        <b>${item.review.status === "amendment" ? "Amendment" : "Review"}</b>
      </button>`).join("") : `<div class="dashboard-empty">No urgent governance items.</div>`;

    const workspace = ctx.storage?.get("WORKSPACE_CONFIG", {name:"My Workspace"}) || {name:"My Workspace"};
    const content = `
      <section class="hero cinematic-hero dashboard-intro">
        <div class="eyebrow">${workspace.name} · Temple Board Governance Centre</div>
        <h1>Good ${state.greeting()}, Ryan.</h1>
        <p>Your compliance, committee work, records, and upcoming governance responsibilities—organized in one place.</p>
      </section>

      <section class="dashboard-grid dashboard-hero-grid">
        <article class="glass-card governance-card motion-card-feature">
          <div class="governance-copy">
            <span class="card-kicker">Governance Health</span>
            <strong data-count-to="${score}" data-count-suffix="%">${score}%</strong>
            <p>Internal governance completion score based on current reviews and outstanding actions.</p>
            <button class="text-action" data-route="review">Open compliance review <b>→</b></button>
          </div>
          <div class="hero-ring" data-progress-value="${score}" style="--score:${score}">
            <div><strong data-count-to="${m.reviewed}">${m.reviewed}</strong><small>of ${m.total}<br>reviewed</small></div>
          </div>
        </article>

        <div class="metric-grid">
          <button class="glass-card metric-card" data-route="review"><span>Open Reviews</span><strong data-count-to="${openReviews}">${openReviews}</strong><small>${m.percent}% complete</small></button>
          <button class="glass-card metric-card" data-route="actions"><span>Open Actions</span><strong data-count-to="${actions.open}">${actions.open}</strong><small>${actions.overdue} overdue</small></button>
          <button class="glass-card metric-card" data-route="amendments"><span>Amendments</span><strong data-count-to="${amendments.length}">${amendments.length}</strong><small>Tracked workflows</small></button>
          <button class="glass-card metric-card" data-route="annual"><span>Upcoming</span><strong data-count-to="${annual.upcoming}">${annual.upcoming}</strong><small>Annual tasks</small></button>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading"><div><span>Work faster</span><h2>Quick Actions</h2></div><small><button class="inline-link" data-route="workspace">Customize Workspace</button></small></div>
        <div class="quick-actions-grid">
          <button class="quick-action glass-card" data-route="committees"><i>♙</i><span><strong>Committees</strong><small>Open Committee Manager</small></span></button>
          <button class="quick-action glass-card" data-route="review"><i>✓</i><span><strong>Start Review</strong><small>Assess a by-law section</small></span></button>
          <button class="quick-action glass-card" data-route="amendments"><i>✎</i><span><strong>New Amendment</strong><small>Open amendment workflow</small></span></button>
          <button class="quick-action glass-card" data-route="actions"><i>＋</i><span><strong>Add Action</strong><small>Assign governance work</small></span></button>
          <button class="quick-action glass-card" data-route="export"><i>⇩</i><span><strong>Generate Report</strong><small>Export governance records</small></span></button>
          <button class="quick-action glass-card" data-route="annual"><i>▦</i><span><strong>Schedule Review</strong><small>Manage annual cycle</small></span></button>
          <button class="quick-action glass-card" data-route="settings"><i>♙</i><span><strong>Officer Settings</strong><small>Reviewer and system setup</small></span></button>
        </div>
      </section>

      <section class="dashboard-grid dashboard-content-grid">
        <article class="glass-card dashboard-panel priority-panel">
          <div class="panel-title"><div><span>Attention Required</span><h2>Priority Items</h2></div><button data-route="actions">View all</button></div>
          <div class="priority-list">${attentionRows}</div>
        </article>

        <article class="glass-card dashboard-panel schedule-panel">
          <div class="panel-title"><div><span>Governance Calendar</span><h2>Upcoming</h2></div><button data-route="annual">Open</button></div>
          <div class="schedule-list">
            <div><time>JUL 24</time><span><strong>By-Law Review</strong><small>${new Date(nextReview+"T12:00:00").toLocaleDateString("en-CA",{weekday:"long",month:"long",day:"numeric"})}</small></span></div>
            <div><time>AUG 31</time><span><strong>September Preparation</strong><small>Executive Committee</small></span></div>
            <div><time>SEP 30</time><span><strong>Governance Cycle Resumes</strong><small>By-Laws Committee</small></span></div>
          </div>
        </article>
      </section>

      <section class="dashboard-section">
        <div class="section-heading"><div><span>Core Workspace</span><h2>Governance Tools</h2></div><small>Organize, compare, govern</small></div>
        <div class="tools-grid">
          <button class="tool-card glass-card" data-route="intelligence"><i>◇</i><span><strong>Compliance Matrix</strong><small>Compare by-laws against governing authorities</small></span><b>→</b></button>
          <button class="tool-card glass-card" data-route="review"><i>⇄</i><span><strong>Document Compare</strong><small>Review wording article by article</small></span><b>→</b></button>
          <button class="tool-card glass-card" data-route="amendments"><i>✦</i><span><strong>Amendment Wizard</strong><small>Draft, approve, and publish changes</small></span><b>→</b></button>
          <button class="tool-card glass-card" data-route="actions"><i>!</i><span><strong>Risk & Action Register</strong><small>Track responsibilities and overdue work</small></span><b>→</b></button>
          <button class="tool-card glass-card" data-route="annual"><i>◷</i><span><strong>Annual Governance</strong><small>Manage recurring obligations</small></span><b>→</b></button>
          <button class="tool-card glass-card" data-route="export"><i>▤</i><span><strong>Records & Reports</strong><small>Prepare evidence and governance exports</small></span><b>→</b></button>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading"><div><span>Review Coverage</span><h2>Compliance by Authority</h2></div><small>CORE review status</small></div>
        <div class="authority-grid">
          ${authorities.map(([name,pct,sub])=>`<button class="authority-card glass-card" data-route="intelligence"><div class="mini-ring" data-progress-value="${pct}" style="--score:${pct}"><b>${pct}%</b></div><span><strong>${name}</strong><small>${sub}</small></span></button>`).join("")}
        </div>
      </section>`;

    renderShell(content, "dashboard");
  });

  document.addEventListener("click", e => {
    const direct = e.target.closest("[data-open-direct]");
    if(!direct) return;
    const [articleIndex, sectionIndex] = direct.dataset.openDirect.split(":").map(Number);
    events.emit("review:open-direct", { articleIndex, sectionIndex });
  });
}
