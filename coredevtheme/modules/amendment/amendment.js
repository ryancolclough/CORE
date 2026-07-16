import { escapeHTML } from "../../sdk/ui.js";

export default function register(ctx){
  const { events, router, state, renderShell, toast, dialogs } = ctx;
  let filters = { search:"", status:"all", article:"all" };

  router.register("amendments", () => renderAmendmentCentre());

  events.on("review:screen", ({ section, existing }) => {
    const slot = document.querySelector("#amendment-slot");
    if(!slot) return;
    const a = existing.amendment || {};
    const shouldShow = existing.status === "amendment" || Object.keys(a).length > 0;
    slot.innerHTML = reviewPanel(section, a, shouldShow);
  });

  events.on("amendment:collect", ({ form, existing }) => {
    const fd = new FormData(form);
    const old = existing?.amendment || {};
    const status = fd.get("status");
    const hasDraft = String(fd.get("proposedText") || "").trim() || String(fd.get("amendmentReason") || "").trim() || old.amendmentId;
    if(status !== "amendment" && !hasDraft) return old && Object.keys(old).length ? old : null;
    return {
      ...old,
      amendmentId: old.amendmentId || nextAmendmentId(),
      createdDate: old.createdDate || today(),
      originalText: String(fd.get("originalText") || "").trim(),
      proposedText: String(fd.get("proposedText") || "").trim(),
      reason: String(fd.get("amendmentReason") || "").trim(),
      committeeRecommendation: String(fd.get("committeeRecommendation") || "").trim(),
      motionNumber: String(fd.get("motionNumber") || "").trim(),
      meetingDate: String(fd.get("meetingDate") || "").trim(),
      movedBy: String(fd.get("movedBy") || "").trim(),
      secondedBy: String(fd.get("secondedBy") || "").trim(),
      votesFor: numberOrBlank(fd.get("votesFor")),
      votesAgainst: numberOrBlank(fd.get("votesAgainst")),
      abstentions: numberOrBlank(fd.get("abstentions")),
      voteResult: String(fd.get("voteResult") || "").trim(),
      approvalDate: String(fd.get("approvalDate") || "").trim(),
      effectiveDate: old.effectiveDate || "",
      analysisComplete: Boolean(fd.get("analysisComplete")),
      committeeReviewed: Boolean(fd.get("committeeReviewed")),
      boardDiscussed: Boolean(fd.get("boardDiscussed")),
      boardApproved: Boolean(fd.get("boardApproved")),
      publishedToORE: Boolean(fd.get("publishedToORE")),
      archived: Boolean(fd.get("archived")),
      superseded: Boolean(old.superseded),
      supersededBy: old.supersededBy || ""
    };
  });

  document.addEventListener("change", e => {
    if(e.target.matches('input[name="status"]')){
      const panel = document.querySelector("[data-amendment-panel]");
      if(panel) panel.style.display = e.target.value === "amendment" ? "grid" : "none";
    }
    const stepBox = e.target.closest(".workflow-step input");
    if(stepBox) stepBox.closest(".workflow-step").classList.toggle("complete", stepBox.checked);

    if(e.target.matches("[data-amendment-status-filter]")){
      filters.status = e.target.value;
      renderAmendmentCentre();
    }
    if(e.target.matches("[data-amendment-article-filter]")){
      filters.article = e.target.value;
      renderAmendmentCentre();
    }
  });

  document.addEventListener("input", e => {
    if(e.target.matches("[data-amendment-search]")){
      filters.search = e.target.value;
      refreshAmendmentList();
    }
  });

  document.addEventListener("click", e => {
    const open = e.target.closest("[data-open-amendment]");
    if(open){
      const [articleIndex, sectionIndex] = open.dataset.openAmendment.split(":").map(Number);
      openDetails(articleIndex, sectionIndex);
      return;
    }
    if(e.target.closest("[data-add-amendment]")){ openCreate(); return; }
    if(e.target.closest("[data-export-amendments]")){ exportHistory(); return; }
    const compare = e.target.closest("[data-compare-amendment]");
    if(compare){
      const [articleIndex, sectionIndex] = compare.dataset.compareAmendment.split(":").map(Number);
      openCompare(articleIndex, sectionIndex);
      return;
    }
    const editReview = e.target.closest("[data-edit-review-amendment]");
    if(editReview){
      dialogs.close();
      const [articleIndex, sectionIndex] = editReview.dataset.editReviewAmendment.split(":").map(Number);
      events.emit("review:open-direct", { articleIndex, sectionIndex });
      return;
    }
    if(e.target.closest("[data-save-new-amendment]")){ saveNewAmendment(); return; }
    if(e.target.closest("[data-save-amendment-details]")){ saveDetails(); return; }
    const remove = e.target.closest("[data-delete-amendment]");
    if(remove){ deleteAmendment(remove.dataset.deleteAmendment); return; }
  });

  function renderAmendmentCentre(){
    const items = state.amendmentItems();
    const summary = amendmentSummary(items);
    const content = `
      <div class="backline"><button type="button" data-route="dashboard">‹ Dashboard</button></div>
      <section class="amendment-hero">
        <div>
          <div class="eyebrow">Governance Records · Amendment Centre</div>
          <h1>By-Law Amendments</h1>
          <p>A complete working record of proposed, approved, published, and superseded changes to the By-Laws.</p>
        </div>
        <button type="button" class="amendment-export" data-export-amendments>⇧ Export History</button>
      </section>

      <section class="amendment-summary-grid">
        ${summaryCard("Total Amendments", summary.total, "Since inception", "total")}
        ${summaryCard("Approved", summary.approved, "Active", "approved")}
        ${summaryCard("Pending", summary.pending, "Approval", "pending")}
        ${summaryCard("Superseded", summary.superseded, "No longer active", "superseded")}
      </section>

      <section class="amendment-centre-panel">
        <div class="amendment-toolbar">
          <label class="amendment-search"><span>⌕</span><input data-amendment-search value="${escapeHTML(filters.search)}" placeholder="Search amendments…" aria-label="Search amendments"></label>
          <select data-amendment-status-filter aria-label="Filter by status">${statusFilterOptions(filters.status)}</select>
          <select data-amendment-article-filter aria-label="Filter by article">${articleFilterOptions(filters.article)}</select>
          <button type="button" class="btn amendment-add" data-add-amendment>＋ Add Amendment</button>
        </div>
        <div class="amendment-card-list" data-amendment-list>${amendmentCards(filteredItems(items))}</div>
      </section>`;
    renderShell(content, "amendments");
  }

  function refreshAmendmentList(){
    const node = document.querySelector("[data-amendment-list]");
    if(node) node.innerHTML = amendmentCards(filteredItems(state.amendmentItems()));
  }

  function amendmentCards(items){
    if(!items.length) return `<div class="empty-amendments"><strong>No amendments match this view.</strong><span>Create a new amendment or adjust the filters.</span></div>`;
    return items.map(item => {
      const a = item.review.amendment || {};
      const status = displayStatus(item.review);
      const dates = dateMeta(a, status);
      return `<article class="amendment-card status-${status.key}">
        <div class="amendment-card-status">
          <span class="record-status ${status.key}">${status.icon} ${status.label}</span>
          <small>Amendment</small>
          <strong>${escapeHTML(shortId(a.amendmentId || "Draft"))}</strong>
        </div>
        <div class="amendment-card-main">
          <span class="article-label">${escapeHTML(item.article.title || `Article ${item.articleIndex + 1}`)}</span>
          <h2>${escapeHTML(item.section.title || `Section ${item.section.number}`)}</h2>
          <p>${escapeHTML(a.reason || "No amendment summary has been entered yet.")}</p>
          <div class="amendment-card-actions">
            <button type="button" data-open-amendment="${item.articleIndex}:${item.sectionIndex}">◉ View Details</button>
            <button type="button" data-compare-amendment="${item.articleIndex}:${item.sectionIndex}">Compare Changes</button>
          </div>
        </div>
        <div class="amendment-card-meta">
          <span>${escapeHTML(dates.primaryLabel)}</span><strong>${escapeHTML(dates.primaryValue)}</strong>
          <span>${escapeHTML(dates.secondaryLabel)}</span><strong>${escapeHTML(dates.secondaryValue)}</strong>
        </div>
      </article>`;
    }).join("");
  }

  function openCreate(){
    const options = state.allSections.map(item => `<option value="${item.articleIndex}:${item.sectionIndex}">${escapeHTML(item.article.title)} · Section ${escapeHTML(item.section.number)} — ${escapeHTML(item.section.title)}</option>`).join("");
    dialogs.open("Add Amendment", `
      <form class="amendment-editor" id="new-amendment-form" novalidate>
        <div class="field"><label>By-Law Section</label><select id="new-amendment-section">${options}</select></div>
        <div class="field"><label>Amendment Summary</label><input id="new-amendment-reason" placeholder="What is being changed and why?"></div>
        <div class="field"><label>Proposed Wording</label><textarea id="new-amendment-proposed" placeholder="Enter the proposed replacement wording."></textarea></div>
        <div class="amendment-editor-actions"><button type="button" class="btn" data-save-new-amendment>Create Amendment</button><button type="button" class="btn secondary" data-close-modal>Cancel</button></div>
      </form>`);
    bindModalForm("#new-amendment-form");
  }

  function saveNewAmendment(){
    const sectionValue = document.querySelector("#new-amendment-section")?.value;
    const reason = document.querySelector("#new-amendment-reason")?.value.trim() || "";
    const proposed = document.querySelector("#new-amendment-proposed")?.value.trim() || "";
    if(!sectionValue){ toast("Choose a by-law section."); return; }
    if(!reason && !proposed){ toast("Add a summary or proposed wording."); return; }
    const [articleIndex, sectionIndex] = sectionValue.split(":").map(Number);
    const item = state.allSections.find(x => x.articleIndex === articleIndex && x.sectionIndex === sectionIndex);
    if(!item) return;
    const existing = state.getReview(item.section) || {};
    const amendment = {
      ...(existing.amendment || {}), amendmentId:existing.amendment?.amendmentId || nextAmendmentId(),
      createdDate:existing.amendment?.createdDate || today(), originalText:existing.amendment?.originalText || (item.section.paragraphs || []).join("\n\n"),
      proposedText:proposed, reason, committeeRecommendation:"", motionNumber:"", meetingDate:"", movedBy:"", secondedBy:"",
      votesFor:"", votesAgainst:"", abstentions:"", voteResult:"", approvalDate:"", effectiveDate:"",
      analysisComplete:false, committeeReviewed:false, boardDiscussed:false, boardApproved:false, publishedToORE:false, archived:false, superseded:false, supersededBy:""
    };
    state.setReview(item.section, { ...existing, reviewId:existing.reviewId || state.nextReviewId(), status:"amendment", reviewDate:existing.reviewDate || today(), amendment });
    dialogs.close();
    toast(`${amendment.amendmentId} created.`);
    renderAmendmentCentre();
  }

  function openDetails(articleIndex, sectionIndex){
    const item = state.allSections.find(x => x.articleIndex === articleIndex && x.sectionIndex === sectionIndex);
    if(!item) return;
    const review = state.getReview(item.section) || {};
    const a = review.amendment || {};
    dialogs.open(a.amendmentId || "Amendment Details", `
      <form class="amendment-editor amendment-detail-editor" id="amendment-detail-form" data-amendment-key="${articleIndex}:${sectionIndex}" novalidate>
        <div class="detail-status-row"><span class="record-status ${displayStatus(review).key}">${displayStatus(review).icon} ${displayStatus(review).label}</span><strong>${escapeHTML(item.article.title)} · Section ${escapeHTML(item.section.number)}</strong></div>
        <div class="field"><label>Amendment Summary</label><textarea id="detail-reason">${escapeHTML(a.reason || "")}</textarea></div>
        <div class="compare-editor-grid">
          <div class="field"><label>Current Wording</label><textarea id="detail-original">${escapeHTML(a.originalText || (item.section.paragraphs || []).join("\n\n"))}</textarea></div>
          <div class="field"><label>Proposed Wording</label><textarea id="detail-proposed">${escapeHTML(a.proposedText || "")}</textarea></div>
        </div>
        <div class="amendment-detail-grid">
          ${input("Motion / Resolution", "detail-motion", a.motionNumber, "text")}
          ${input("Meeting Date", "detail-meeting-date", a.meetingDate, "date")}
          ${input("Moved By", "detail-moved", a.movedBy, "text")}
          ${input("Seconded By", "detail-seconded", a.secondedBy, "text")}
          ${input("Approval Date", "detail-approval-date", a.approvalDate, "date")}
          ${input("Effective Date", "detail-effective-date", a.effectiveDate, "date")}
        </div>
        <div class="field"><label>Decision</label><select id="detail-vote-result">${decisionOptions(a.voteResult)}</select></div>
        <div class="detail-check-grid">
          ${check("detail-analysis", "Analysis complete", a.analysisComplete)}
          ${check("detail-committee", "Committee reviewed", a.committeeReviewed)}
          ${check("detail-discussed", "Board discussion complete", a.boardDiscussed)}
          ${check("detail-approved", "Temple Board approved", a.boardApproved)}
          ${check("detail-published", "Published to ORE", a.publishedToORE)}
          ${check("detail-archived", "Archived", a.archived)}
          ${check("detail-superseded", "Superseded", a.superseded)}
        </div>
        ${input("Superseded By", "detail-superseded-by", a.supersededBy, "text", "Amendment #")}
        <div class="amendment-editor-actions">
          <button type="button" class="btn" data-save-amendment-details>Save Changes</button>
          <button type="button" class="btn secondary" data-compare-amendment="${articleIndex}:${sectionIndex}">Compare</button>
          <button type="button" class="btn secondary" data-edit-review-amendment="${articleIndex}:${sectionIndex}">Open Full Review</button>
          <button type="button" class="btn danger" data-delete-amendment="${articleIndex}:${sectionIndex}">Delete</button>
        </div>
      </form>`);
    bindModalForm("#amendment-detail-form");
  }

  function saveDetails(){
    const form = document.querySelector("#amendment-detail-form");
    if(!form) return;
    const [articleIndex, sectionIndex] = form.dataset.amendmentKey.split(":").map(Number);
    const item = state.allSections.find(x => x.articleIndex === articleIndex && x.sectionIndex === sectionIndex);
    if(!item) return;
    const review = state.getReview(item.section) || {};
    const old = review.amendment || {};
    const amendment = {
      ...old,
      reason:value("#detail-reason"), originalText:value("#detail-original"), proposedText:value("#detail-proposed"),
      motionNumber:value("#detail-motion"), meetingDate:value("#detail-meeting-date"), movedBy:value("#detail-moved"), secondedBy:value("#detail-seconded"),
      approvalDate:value("#detail-approval-date"), effectiveDate:value("#detail-effective-date"), voteResult:value("#detail-vote-result"),
      analysisComplete:checked("#detail-analysis"), committeeReviewed:checked("#detail-committee"), boardDiscussed:checked("#detail-discussed"),
      boardApproved:checked("#detail-approved"), publishedToORE:checked("#detail-published"), archived:checked("#detail-archived"),
      superseded:checked("#detail-superseded"), supersededBy:value("#detail-superseded-by"), updatedDate:today()
    };
    state.setReview(item.section, { ...review, status:"amendment", amendment });
    dialogs.close(); toast(`${amendment.amendmentId} updated.`); renderAmendmentCentre();
  }

  function deleteAmendment(key){
    const [articleIndex, sectionIndex] = key.split(":").map(Number);
    const item = state.allSections.find(x => x.articleIndex === articleIndex && x.sectionIndex === sectionIndex);
    if(!item || !confirm("Delete this amendment record? The section review will be preserved.")) return;
    const review = state.getReview(item.section) || {};
    const { amendment, ...remaining } = review;
    const nextStatus = remaining.status === "amendment" ? "discussion" : remaining.status;
    state.setReview(item.section, { ...remaining, status:nextStatus || "discussion" });
    dialogs.close(); toast("Amendment deleted."); renderAmendmentCentre();
  }

  function openCompare(articleIndex, sectionIndex){
    const item = state.allSections.find(x => x.articleIndex === articleIndex && x.sectionIndex === sectionIndex);
    if(!item) return;
    const a = state.getReview(item.section)?.amendment || {};
    const original = a.originalText || (item.section.paragraphs || []).join("\n\n");
    const proposed = a.proposedText || "No proposed wording recorded.";
    dialogs.open("Compare Amendment", `
      <div class="amendment-compare-view">
        <div><span>Current wording</span><div class="compare-copy">${diffText(original, proposed, "old")}</div></div>
        <div><span>Proposed wording</span><div class="compare-copy">${diffText(proposed, original, "new")}</div></div>
      </div>
      <div class="amendment-editor-actions"><button type="button" class="btn secondary" data-close-modal>Close Comparison</button></div>`);
  }

  function exportHistory(){
    const payload = state.amendmentItems().map(item => ({
      id:item.review.amendment?.amendmentId || "Draft", article:item.article.title, section:item.section.number, title:item.section.title,
      status:displayStatus(item.review).label, reason:item.review.amendment?.reason || "", approvalDate:item.review.amendment?.approvalDate || "",
      effectiveDate:item.review.amendment?.effectiveDate || "", motion:item.review.amendment?.motionNumber || ""
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `CORE-Amendment-History-${today()}.json`; link.click(); URL.revokeObjectURL(url);
    toast("Amendment history exported.");
  }

  function reviewPanel(section, a, shouldShow){
    return `<section class="amendment-panel" data-amendment-panel style="${shouldShow ? "" : "display:none"}">
      <div class="amendment-head"><div><span>Amendment Engine</span><h3>${escapeHTML(a.amendmentId || "Draft Amendment")}</h3></div><span class="stage-badge ${stageClass(stageOf(a))}">${stageLabel(stageOf(a))}</span></div>
      <div class="text-compare"><div class="text-block"><label>Current Wording</label><textarea name="originalText">${escapeHTML(a.originalText || (section.paragraphs || []).join("\n\n"))}</textarea></div><div class="text-block"><label>Proposed Wording</label><textarea name="proposedText" placeholder="Enter the proposed replacement wording.">${escapeHTML(a.proposedText || "")}</textarea></div></div>
      <div class="field"><label>Reason for Amendment</label><textarea name="amendmentReason">${escapeHTML(a.reason || "")}</textarea></div>
      <div class="field"><label>Committee Recommendation</label><textarea name="committeeRecommendation">${escapeHTML(a.committeeRecommendation || "")}</textarea></div>
      <div class="amendment-grid">${field("Motion / Resolution", "motionNumber", a.motionNumber, "text", "TB-2026-001")}${field("Meeting Date", "meetingDate", a.meetingDate, "date")}${field("Moved By", "movedBy", a.movedBy)}${field("Seconded By", "secondedBy", a.secondedBy)}${field("Votes For", "votesFor", a.votesFor, "number")}${field("Votes Against", "votesAgainst", a.votesAgainst, "number")}${field("Abstentions", "abstentions", a.abstentions, "number")}${field("Approval Date", "approvalDate", a.approvalDate, "date")}</div>
      <div class="field"><label>Vote Result / Decision</label><select name="voteResult">${decisionOptions(a.voteResult)}</select></div>
      <div class="field"><label>Workflow</label><div class="workflow-steps">${step("analysisComplete", "Analysis complete", "Review analysis and supporting authorities documented.", a)}${step("committeeReviewed", "Committee reviewed", "By-Laws Committee recommendation completed.", a)}${step("boardDiscussed", "Board discussion complete", "Formally considered at a meeting.", a)}${step("boardApproved", "Temple Board approved", "Motion carried and approval details recorded.", a)}${step("publishedToORE", "Published to ORE", "Approved public record was published.", a)}${step("archived", "Archived", "Final amendment record preserved.", a)}</div></div>
      <div class="publication-readiness ${publicationReady(a) ? "ready" : ""}"><span>${publicationReady(a) ? "✓" : "○"}</span><div><strong>${publicationReady(a) ? "Ready to publish" : "Publication requirements incomplete"}</strong><small>${publicationReady(a) ? "This approved amendment can be included in the ORE publication export." : readinessMessage(a)}</small></div></div>
    </section>`;
  }

  function filteredItems(items){
    const q = filters.search.trim().toLowerCase();
    return items.filter(item => {
      const a = item.review.amendment || {};
      const status = displayStatus(item.review).key;
      const article = String(item.articleIndex + 1);
      const haystack = [a.amendmentId, item.article.title, item.section.title, item.section.number, a.reason].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (filters.status === "all" || status === filters.status) && (filters.article === "all" || article === filters.article);
    });
  }

  function amendmentSummary(items){
    return { total:items.length, approved:items.filter(x => ["approved","published"].includes(displayStatus(x.review).key)).length, pending:items.filter(x => ["pending","review"].includes(displayStatus(x.review).key)).length, superseded:items.filter(x => displayStatus(x.review).key === "superseded").length };
  }

  function displayStatus(review){
    const a = review?.amendment || {};
    if(a.superseded) return {key:"superseded",label:"Superseded",icon:"⌁"};
    if(a.publishedToORE) return {key:"published",label:"Published",icon:"✓"};
    if(a.boardApproved) return {key:"approved",label:"Approved",icon:"✓"};
    if(a.committeeReviewed || a.boardDiscussed) return {key:"review",label:"In Review",icon:"◷"};
    return {key:"pending",label:"Pending",icon:"◷"};
  }

  function dateMeta(a, status){
    if(status.key === "superseded") return {primaryLabel:"Superseded",primaryValue:a.approvalDate || a.updatedDate || "Not recorded",secondaryLabel:"Superseded By",secondaryValue:a.supersededBy || "Not recorded"};
    if(["approved","published"].includes(status.key)) return {primaryLabel:"Approved",primaryValue:a.approvalDate || "Not recorded",secondaryLabel:"Effective",secondaryValue:a.effectiveDate || a.approvalDate || "Not recorded"};
    return {primaryLabel:"Submitted",primaryValue:a.createdDate || "Not recorded",secondaryLabel:"Review Meeting",secondaryValue:a.meetingDate || "Not scheduled"};
  }

  function statusFilterOptions(current){ return [["all","All Statuses"],["approved","Approved"],["published","Published"],["pending","Pending"],["review","In Review"],["superseded","Superseded"]].map(([v,l])=>`<option value="${v}" ${v===current?"selected":""}>${l}</option>`).join(""); }
  function articleFilterOptions(current){ return `<option value="all">All Articles</option>` + state.articles.map((article,index)=>`<option value="${index+1}" ${String(index+1)===current?"selected":""}>${escapeHTML(article.title)}</option>`).join(""); }
  function summaryCard(label,value,sub,type){ return `<article class="amendment-summary-card ${type}"><span>${label}</span><strong>${value}</strong><small>${sub}</small></article>`; }
  function shortId(id){ const match = String(id).match(/(\d{1,4})$/); return match ? `#${Number(match[1])}` : id; }
  function stageOf(a){ if(a.archived) return "archived"; if(a.publishedToORE) return "published"; if(a.boardApproved) return "ready_to_publish"; if(a.boardDiscussed) return "awaiting_approval"; if(a.committeeReviewed) return "awaiting_board"; if(a.analysisComplete || a.proposedText) return "drafting"; return "not_started"; }
  function stageLabel(stage){ return ({not_started:"Not started",drafting:"Drafting",awaiting_board:"Awaiting board",awaiting_approval:"Awaiting approval",ready_to_publish:"Ready to publish",published:"Published",archived:"Archived"})[stage] || stage; }
  function stageClass(stage){ return String(stage).replaceAll("_", "-"); }
  function publicationReady(a){ return Boolean(a.boardApproved && a.approvalDate && a.motionNumber && a.proposedText && ["carried","carried-unanimously"].includes(a.voteResult)); }
  function readinessMessage(a){ const missing=[]; if(!a.proposedText)missing.push("proposed wording"); if(!a.motionNumber)missing.push("motion number"); if(!a.voteResult||!["carried","carried-unanimously"].includes(a.voteResult))missing.push("carried vote"); if(!a.approvalDate)missing.push("approval date"); if(!a.boardApproved)missing.push("board approval"); return missing.length?`Missing: ${missing.join(", ")}.`:"Complete the remaining workflow steps."; }
  function nextAmendmentId(){ const used=state.amendmentItems().map(x=>x.review?.amendment?.amendmentId).filter(Boolean); let n=1,id; do{id=`AMD-${state.reviewYear}-${String(n++).padStart(4,"0")}`;}while(used.includes(id)); return id; }
  function decisionOptions(current){ return [["","Not recorded"],["carried","Carried"],["carried-unanimously","Carried unanimously"],["defeated","Defeated"],["tabled","Tabled / deferred"],["withdrawn","Withdrawn"]].map(([v,l])=>`<option value="${v}" ${v===current?"selected":""}>${l}</option>`).join(""); }
  function field(label,name,value="",type="text",placeholder=""){ return `<div class="field"><label>${label}</label><input type="${type}" name="${name}" value="${escapeHTML(value ?? "")}" placeholder="${escapeHTML(placeholder)}"></div>`; }
  function input(label,id,value="",type="text",placeholder=""){ return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${escapeHTML(value ?? "")}" placeholder="${escapeHTML(placeholder)}"></div>`; }
  function check(id,label,isChecked){ return `<label class="detail-check"><input id="${id}" type="checkbox" ${isChecked?"checked":""}><span>${label}</span></label>`; }
  function step(name,label,description,a){ return `<label class="workflow-step ${a[name]?"complete":""}"><input type="checkbox" name="${name}" ${a[name]?"checked":""}><span><strong>${label}</strong><small>${description}</small></span></label>`; }
  function numberOrBlank(value){ const text=String(value??"").trim(); return text===""?"":Number(text); }
  function value(selector){ return document.querySelector(selector)?.value.trim() || ""; }
  function checked(selector){ return Boolean(document.querySelector(selector)?.checked); }
  function today(){ return new Date().toISOString().slice(0,10); }
  function bindModalForm(selector){ requestAnimationFrame(()=>{ const form=document.querySelector(selector); if(!form)return; ["pointerdown","click","input","change","keydown"].forEach(type=>form.addEventListener(type,event=>event.stopPropagation())); form.querySelector("input,textarea,select")?.focus({preventScroll:true}); }); }
  function diffText(text,other,mode){ const otherWords=new Set(String(other).split(/\s+/).filter(Boolean).map(w=>w.toLowerCase())); return String(text).split(/(\s+)/).map(word=>{ if(/^\s+$/.test(word))return word; const changed=!otherWords.has(word.toLowerCase()); return changed?`<mark class="diff-${mode}">${escapeHTML(word)}</mark>`:escapeHTML(word); }).join(""); }
}
