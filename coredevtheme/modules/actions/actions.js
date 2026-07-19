import { escapeHTML } from "../../sdk/ui.js";

export default function register(ctx){
  const { router, state, renderShell, toast, events, dialogs, storage } = ctx;
  let currentFilter = "active";
  let complianceDataPromise = null;
  let pendingDetailId = "";

  // Compliance actions always resolve their detail from the live comparison register.
  // Saved Action Centre records are assignments/status only; they are never the legal-analysis source of truth.
  function loadComplianceData(){
    if(!complianceDataPromise){
      complianceDataPromise = fetch("data/onca-compliance.json?v=20260718.418", {cache:"no-store"})
        .then(response => {
          if(!response.ok) throw new Error(`Compliance register failed to load (${response.status})`);
          return response.json();
        });
    }
    return complianceDataPromise;
  }

  function mapComplianceRecord(record){
    if(!record) return {};
    return {
      complianceId:record.id,
      complianceTitle:record.title,
      bylawLocation:record.article + (record.section ? ` · ${record.section}` : ""),
      proposedPlacement:record.proposedPlacement,
      reasoning:record.reasoning,
      currentState:record.current,
      currentExcerpt:record.currentExcerpt,
      sourcePage:record.sourcePage,
      needsWork:record.needsWork,
      compliesWith:record.compliesWith,
      evidenceRequired:record.evidenceRequired,
      suggestedWording:record.suggestedWording,
      workSteps:record.workSteps,
      completionCriteria:record.completionCriteria
    };
  }

  async function hydrateComplianceTasks(){
    try{
      const data = await loadComplianceData();
      const items = state.actionItems();
      let changed = false;
      items.forEach(item => {
        if(!item.complianceId) return;
        const record = data.items?.find(entry => entry.id === item.complianceId);
        if(!record) return;
        const live = mapComplianceRecord(record);
        Object.entries(live).forEach(([key,value]) => {
          if(JSON.stringify(item[key]) !== JSON.stringify(value)){ item[key] = value; changed = true; }
        });
      });
      if(changed) state.saveActionItems(items);
    }catch(error){
      console.error("CORE compliance hydration failed", error);
    }
  }

  hydrateComplianceTasks();

  router.register("actions", () => renderActions(currentFilter));
  router.register("action-detail", () => {
    if(!pendingDetailId){ router.go("actions"); return; }
    renderActionDetailPage(pendingDetailId);
  });

  events.on("actions:create-from-review", detail => {
    const items = state.actionItems();
    const action = {
      id:state.nextActionId(),
      title:detail.title || `Follow up Section ${detail.section}`,
      description:detail.description || "",
      sourceType:"By-Law Review",
      sourceReference:`Section ${detail.section}`,
      articleIndex:detail.articleIndex,
      sectionIndex:detail.sectionIndex,
      assignedCommittee:detail.assignedCommittee || "By-Laws Committee",
      assignedOfficer:"",
      priority:"medium",
      status:"open",
      dueDate:"",
      createdDate:new Date().toISOString().slice(0,10),
      completedDate:"",
      history:[{
        date:new Date().toISOString(),
        event:"Action created",
        note:`Created from Section ${detail.section}`
      }]
    };
    items.unshift(action);
    state.saveActionItems(items);
    toast(`${action.id} created.`);
    return action;
  });

  document.addEventListener("click", e => {
    const filter = e.target.closest("[data-action-filter]");
    if(filter){
      currentFilter = filter.dataset.actionFilter;
      renderActions(currentFilter);
      return;
    }

    if(e.target.closest("[data-new-action]")){
      openEditor();
      return;
    }

    const view = e.target.closest("[data-view-action]");
    if(view){
      pendingDetailId = view.dataset.viewAction;
      dialogs.close();
      router.go("action-detail");
      return;
    }

    const edit = e.target.closest("[data-edit-action]");
    if(edit){
      openEditor(edit.dataset.editAction);
      return;
    }

    const complete = e.target.closest("[data-complete-action]");
    if(complete){
      setStatus(complete.dataset.completeAction, "completed");
      return;
    }

    const reopen = e.target.closest("[data-reopen-action]");
    if(reopen){
      setStatus(reopen.dataset.reopenAction, "open");
      return;
    }

    const source = e.target.closest("[data-open-action-source]");
    if(source){
      const item = state.actionItems().find(x => x.id === source.dataset.openActionSource);
      if(item && item.articleIndex !== undefined){
        events.emit("review:open-direct", {
          articleIndex:item.articleIndex,
          sectionIndex:item.sectionIndex
        });
      }
      return;
    }

    if(e.target.closest("[data-modal-save-action]")){
      saveEditor();
      return;
    }

    if(e.target.closest("[data-modal-cancel-action]")){
      dialogs.close();
      return;
    }

    const remove = e.target.closest("[data-modal-delete-action]");
    if(remove){
      deleteAction(remove.dataset.modalDeleteAction);
    }
  });

  function renderActions(filter="active"){
    const items = state.actionItems();
    const summary = state.actionSummary();
    const today = new Date().toISOString().slice(0,10);

    const visible = items.filter(item => {
      if(filter === "all") return true;
      if(filter === "completed") return item.status === "completed";
      if(filter === "due-month"){
        const now=new Date(), end=new Date(now.getFullYear(),now.getMonth()+1,0).toISOString().slice(0,10);
        return !["completed","archived"].includes(item.status) && item.dueDate && item.dueDate >= today && item.dueDate <= end;
      }
      if(filter === "overdue"){
        return !["completed","archived"].includes(item.status) &&
          item.dueDate &&
          item.dueDate < today;
      }
      return !["completed","archived"].includes(item.status);
    });

    const rows = visible.length
      ? visible.map(actionRow).join("")
      : `<div class="actions-empty">No action items match this view.</div>`;

    const content = `
      <div class="backline"><button data-route="dashboard">‹ Dashboard</button></div>
      <section class="hero">
        <div class="eyebrow">Temple Board Work · Action Centre Module</div>
        <h1>Action Centre</h1>
        <p>Assign, track, complete, and preserve follow-up work created by reviews, amendments, meetings, and operations.</p>
        <div class="rule"></div>
      </section>

      <section class="action-summary">
        ${stat("Open",summary.open,"open")}
        ${stat("Overdue",summary.overdue,"overdue")}
        ${stat("Due This Month",summary.dueThisMonth,"due-month")}
        ${stat("Completed",summary.completed,"completed")}
      </section>

      <section class="panel">
        <div class="panel-head action-head">
          <div><h2>Action Items</h2><p>${visible.length} shown · ${summary.total} total</p></div>
          <div class="action-controls">
            <button type="button" class="filter-btn status-active ${filter==="active"?"active":""}" data-action-filter="active">Active</button>
            <button type="button" class="filter-btn status-overdue ${filter==="overdue"?"active":""}" data-action-filter="overdue">Overdue</button>
            <button type="button" class="filter-btn status-completed ${filter==="completed"?"active":""}" data-action-filter="completed">Completed</button>
            <button type="button" class="filter-btn status-due ${filter==="due-month"?"active":""}" data-action-filter="due-month">Due This Month</button>
            <button type="button" class="filter-btn ${filter==="all"?"active":""}" data-action-filter="all">All</button>
            <button type="button" class="btn" data-new-action>New Action</button>
          </div>
        </div>
        <div class="panel-body">${rows}</div>
      </section>`;

    renderShell(content,"actions");
  }

  function actionRow(item){
    const overdue = item.dueDate &&
      !["completed","archived"].includes(item.status) &&
      item.dueDate < new Date().toISOString().slice(0,10);

    return `
      <article class="action-row ${overdue ? "overdue" : ""}">
        <div class="action-priority ${item.priority}"></div>
        <div class="action-main">
          <span>${escapeHTML(item.id)}</span>
          <strong>${escapeHTML(item.title)}</strong>
          <small>${escapeHTML(item.assignedCommittee || "Unassigned")} · ${escapeHTML(statusLabel(item.status))}${item.dueDate ? ` · Due ${escapeHTML(item.dueDate)}` : ""}</small>
        </div>
        <div class="action-links">
          ${item.articleIndex !== undefined ? `<button type="button" data-open-action-source="${item.id}">Source</button>` : ""}
          ${item.complianceId ? `<button type="button" data-view-action="${item.id}">Reasoning & Draft</button>` : ""}
          <button type="button" data-edit-action="${item.id}">Edit</button>
          ${item.status === "completed"
            ? `<button type="button" data-reopen-action="${item.id}">Reopen</button>`
            : `<button type="button" data-complete-action="${item.id}">Complete</button>`}
        </div>
      </article>`;
  }

  async function renderActionDetailPage(id){
    const savedItem=state.actionItems().find(x=>x.id===id);
    if(!savedItem) return;

    let item={...savedItem};
    let liveLoaded=false;
    let loadError="";
    if(savedItem.complianceId){
      try{
        const data=await loadComplianceData();
        const record=data.items?.find(entry=>entry.id===savedItem.complianceId);
        if(record){
          item={...savedItem,...mapComplianceRecord(record)};
          liveLoaded=true;
        }else{
          loadError=`No matching comparison record was found for ${savedItem.complianceId}.`;
        }
      }catch(error){
        loadError="The live comparison register could not be loaded. Refresh CORE and try again.";
        console.error(error);
      }
    }

    const list=value=>Array.isArray(value)&&value.length?`<ul>${value.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul>`:`<p>Not recorded.</p>`;
    const sourceLine=[item.bylawLocation,item.sourcePage?`Signed bylaws: ${item.sourcePage}`:""] .filter(Boolean).join(" · ");
    const content = `
      <section class="panel compliance-detail-page">
        <div class="panel-head action-head compliance-detail-head">
          <div>
            <div class="eyebrow">${escapeHTML(item.complianceId||item.id)} · Compliance Work Record</div>
            <h1>${escapeHTML(item.complianceTitle||item.title)}</h1>
            <p>${escapeHTML(sourceLine||item.sourceReference||"")}</p>
          </div>
          <button class="btn secondary" type="button" data-route="actions">← Back to Action Centre</button>
        </div>
        <div class="panel-body action-modal compliance-task-detail">
          <div class="compliance-meta">
            <span class="compliance-pill">${escapeHTML(sourceLine||item.sourceReference||"")}</span>
            <span class="compliance-pill">${escapeHTML(item.priority||"medium").toUpperCase()} PRIORITY</span>
            ${item.complianceId?`<span class="compliance-pill">${liveLoaded?"LIVE COMPARISON LOADED":"COMPARISON LOAD ERROR"}</span>`:""}
          </div>
          ${loadError?`<section class="compliance-box"><h4>Comparison error</h4><p>${escapeHTML(loadError)}</p></section>`:""}
          <section class="compliance-box"><h4>Why this specific change is needed</h4><p>${escapeHTML(item.reasoning||item.description||"")}</p></section>
          <section class="compliance-box"><h4>Exact bylaw location / insertion point</h4><p>${escapeHTML(item.proposedPlacement||"The live comparison record did not supply a placement.")}</p></section>
          <section class="compliance-box"><h4>Current signed-bylaw condition</h4><p>${escapeHTML(item.currentState||"Not recorded.")}</p>${item.currentExcerpt?`<div class="suggested-wording"><strong>Current wording:</strong><br>${escapeHTML(item.currentExcerpt)}</div>`:""}</section>
          <section class="compliance-box"><h4>What must change</h4><p>${escapeHTML(item.needsWork||"Not recorded.")}</p></section>
          <div class="compliance-grid">
            <section class="compliance-box"><h4>Authority / compliance target</h4>${list(item.compliesWith)}</section>
            <section class="compliance-box"><h4>Evidence the committee must retain</h4>${list(item.evidenceRequired)}</section>
            <section class="compliance-box"><h4>Step-by-step committee work</h4>${list(item.workSteps)}</section>
            <section class="compliance-box"><h4>Completion test</h4>${list(item.completionCriteria)}</section>
          </div>
          <section class="compliance-box"><h4>Suggested draft wording</h4><div class="suggested-wording">${escapeHTML(item.suggestedWording||"No draft wording recorded.")}</div></section>
          <div class="actions">
            <button class="btn" type="button" data-edit-action="${escapeHTML(item.id)}">Edit Assignment</button>
            <button class="btn secondary" type="button" data-route="compliance">Open Full Compliance Register</button>
            <button class="btn secondary" type="button" data-route="actions">Back to Action Centre</button>
          </div>
        </div>
      </section>`;
    dialogs.close();
    renderShell(content,"action-detail");
    window.scrollTo({top:0,behavior:"instant"});
  }

  function openEditor(id=""){
    const existing = state.actionItems().find(x => x.id === id) || {};
    dialogs.open(existing.id ? "Edit Action" : "Create Action", `
      <form class="action-modal" id="action-editor-form" data-action-modal novalidate>
        <input type="hidden" id="modal-action-id" value="${escapeHTML(existing.id || "")}">
        <div class="field"><label for="modal-action-title">Title <span aria-hidden="true">*</span></label><input id="modal-action-title" required value="${escapeHTML(existing.title || "")}" placeholder="What needs to be done?"></div>
        <div class="field"><label for="modal-action-description">Description</label><textarea id="modal-action-description" placeholder="Expected result and context.">${escapeHTML(existing.description || "")}</textarea></div>
        <div class="action-form-grid">
          <div class="field"><label>Assigned Committee</label><select id="modal-action-committee">${committeeOptions(existing.assignedCommittee)}</select></div>
          <div class="field"><label for="modal-action-officer">Assigned Officer</label><select id="modal-action-officer">${officerOptions(existing.assignedCommittee, existing.assignedOfficer)}</select></div>
          <div class="field"><label>Priority</label><select id="modal-action-priority">${priorityOptions(existing.priority)}</select></div>
          <div class="field"><label>Status</label><select id="modal-action-status">${statusOptions(existing.status)}</select></div>
          <div class="field"><label>Due Date</label><input id="modal-action-due" type="date" value="${escapeHTML(existing.dueDate || "")}"></div>
          <div class="field"><label>Source Reference</label><input id="modal-action-source" value="${escapeHTML(existing.sourceReference || "")}" placeholder="Section, motion, meeting, etc."></div>
        </div>
        <div class="actions">
          <button class="btn" type="submit" data-modal-save-action>Save Action</button>
          <button class="btn secondary" type="button" data-modal-cancel-action>Cancel</button>
          ${existing.id ? `<button class="btn danger" type="button" data-modal-delete-action="${existing.id}">Delete</button>` : ""}
        </div>
      </form>
    `);

    // Bind directly after the modal exists. This avoids global router/click handlers
    // swallowing form interactions on iOS Safari and installed PWA mode.
    requestAnimationFrame(() => {
      const form = document.querySelector("#action-editor-form");
      if(!form) return;

      ["pointerdown","click","input","change","keydown"].forEach(type => {
        form.addEventListener(type, event => event.stopPropagation());
      });

      form.addEventListener("submit", event => {
        event.preventDefault();
        event.stopPropagation();
        saveEditor();
      });

      form.querySelector("[data-modal-cancel-action]")?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        dialogs.close();
      });

      form.querySelector("[data-modal-delete-action]")?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        deleteAction(event.currentTarget.dataset.modalDeleteAction);
      });

      form.querySelector("#modal-action-committee")?.addEventListener("change", event => {
        const officer = form.querySelector("#modal-action-officer");
        if(officer) officer.innerHTML = officerOptions(event.currentTarget.value, officer.value);
      });

      form.querySelector("#modal-action-title")?.focus({preventScroll:true});
    });
  }

  function saveEditor(){
    const title = document.querySelector("#modal-action-title")?.value.trim();
    if(!title){
      toast("Action title is required.");
      return;
    }

    const id = document.querySelector("#modal-action-id")?.value || state.nextActionId();
    const items = state.actionItems();
    const index = items.findIndex(x => x.id === id);
    const existing = index >= 0 ? items[index] : null;
    const status = document.querySelector("#modal-action-status")?.value || "open";

    const action = {
      id,
      title,
      description:document.querySelector("#modal-action-description")?.value.trim() || "",
      assignedCommittee:document.querySelector("#modal-action-committee")?.value || "",
      assignedOfficer:document.querySelector("#modal-action-officer")?.value.trim() || "",
      priority:document.querySelector("#modal-action-priority")?.value || "medium",
      status,
      dueDate:document.querySelector("#modal-action-due")?.value || "",
      sourceType:existing?.sourceType || "Manual",
      sourceReference:document.querySelector("#modal-action-source")?.value.trim() || "",
      articleIndex:existing?.articleIndex,
      sectionIndex:existing?.sectionIndex,
      createdDate:existing?.createdDate || new Date().toISOString().slice(0,10),
      completedDate:status === "completed" ? (existing?.completedDate || new Date().toISOString().slice(0,10)) : "",
      complianceId:existing?.complianceId,
      complianceTitle:existing?.complianceTitle,
      bylawLocation:existing?.bylawLocation,
      proposedPlacement:existing?.proposedPlacement,
      reasoning:existing?.reasoning,
      currentState:existing?.currentState,
      needsWork:existing?.needsWork,
      compliesWith:existing?.compliesWith,
      evidenceRequired:existing?.evidenceRequired,
      suggestedWording:existing?.suggestedWording,
      workSteps:existing?.workSteps,
      completionCriteria:existing?.completionCriteria,
      history:[
        ...(existing?.history || []),
        {
          date:new Date().toISOString(),
          event:existing ? "Action updated" : "Action created",
          note:`Status: ${statusLabel(status)}`
        }
      ]
    };

    if(index >= 0) items[index] = action;
    else items.unshift(action);

    state.saveActionItems(items);
    syncCommitteeTask(action);
    events.emit("actions:changed", { action, mode: existing ? "updated" : "created" });
    dialogs.close();
    toast(`${id} saved.`);
    renderActions(currentFilter);
  }

  function setStatus(id,status){
    const items = state.actionItems();
    const item = items.find(x => x.id === id);
    if(!item) return;
    item.status = status;
    item.completedDate = status === "completed" ? new Date().toISOString().slice(0,10) : "";
    item.history = [
      ...(item.history || []),
      {date:new Date().toISOString(),event:`Status changed to ${statusLabel(status)}`,note:""}
    ];
    state.saveActionItems(items);
    syncCommitteeTask(item);
    events.emit("actions:changed", { action:item, mode:"status" });
    toast(`${id} ${status === "completed" ? "completed" : "reopened"}.`);
    renderActions(currentFilter);
  }

  function deleteAction(id){
    if(!confirm(`Delete ${id}?`)) return;
    state.saveActionItems(state.actionItems().filter(x => x.id !== id));
    removeCommitteeTask(id);
    events.emit("actions:changed", { id, mode:"deleted" });
    dialogs.close();
    toast(`${id} deleted.`);
    renderActions(currentFilter);
  }

  function committeeRecords(){
    return storage?.get("COMMITTEES", []) || [];
  }

  function officerOptions(committeeName="", current=""){
    const committees = committeeRecords();
    const selected = committees.find(item => item.name === committeeName);
    const names = new Set();
    if(selected){
      (selected.members || []).forEach(member => names.add(member.name));
      if(selected.chair && selected.chair !== "Unassigned") names.add(selected.chair);
    }
    committees.forEach(committee => (committee.members || []).forEach(member => names.add(member.name)));
    if(current) names.add(current);
    const choices = ["", ...Array.from(names).sort((a,b)=>a.localeCompare(b))];
    return choices.map(name => option(name, name || "Unassigned / Committee owned", current || "")).join("");
  }

  function syncCommitteeTask(action){
    if(!storage || !action.assignedCommittee) return;
    const committees = committeeRecords();
    const committee = committees.find(item => item.name === action.assignedCommittee);
    if(!committee) return;
    committee.tasks = Array.isArray(committee.tasks) ? committee.tasks : [];
    const taskIndex = committee.tasks.findIndex(task => task.actionId === action.id);
    const task = {
      actionId:action.id,
      title:action.title,
      status:action.status === "completed" ? "complete" : action.status.replaceAll("_","-"),
      due:action.dueDate || "",
      assignedOfficer:action.assignedOfficer || "",
      priority:action.priority || "medium",
      sourceReference:action.sourceReference || ""
    };
    if(taskIndex >= 0) committee.tasks[taskIndex] = {...committee.tasks[taskIndex], ...task};
    else committee.tasks.unshift(task);
    committee.activity = Array.isArray(committee.activity) ? committee.activity : [];
    committee.activity.unshift({
      title:`Action ${taskIndex >= 0 ? "updated" : "created"}: ${action.title}`,
      date:new Date().toISOString().slice(0,10)
    });
    storage.set("COMMITTEES", committees);
  }

  function removeCommitteeTask(actionId){
    if(!storage) return;
    const committees = committeeRecords();
    let changed = false;
    committees.forEach(committee => {
      const before = (committee.tasks || []).length;
      committee.tasks = (committee.tasks || []).filter(task => task.actionId !== actionId);
      if(committee.tasks.length !== before) changed = true;
    });
    if(changed) storage.set("COMMITTEES", committees);
  }

  function committeeOptions(current=""){
    return [
      "By-Laws Committee",
      "Building Committee",
      "Finance Committee",
      "Property Committee",
      "Executive Committee",
      "Temple Board",
      "Unassigned"
    ].map(value => option(value,value,current || "By-Laws Committee")).join("");
  }

  function priorityOptions(current="medium"){
    return [
      ["low","Low"],
      ["medium","Medium"],
      ["high","High"],
      ["urgent","Urgent"]
    ].map(([value,label]) => option(value,label,current || "medium")).join("");
  }

  function statusOptions(current="open"){
    return [
      ["open","Open"],
      ["assigned","Assigned"],
      ["in_progress","In Progress"],
      ["waiting_review","Waiting Review"],
      ["completed","Completed"],
      ["archived","Archived"]
    ].map(([value,label]) => option(value,label,current || "open")).join("");
  }

  function option(value,label,current){
    return `<option value="${escapeHTML(value)}" ${current===value ? "selected" : ""}>${escapeHTML(label)}</option>`;
  }

  function stat(label,value,tone=""){
    return `<article class="action-stat ${tone}"><span>${label}</span><strong>${value}</strong></article>`;
  }

  function statusLabel(status){
    return ({
      open:"Open",
      assigned:"Assigned",
      in_progress:"In Progress",
      waiting_review:"Waiting Review",
      completed:"Completed",
      archived:"Archived"
    })[status] || status;
  }
}
