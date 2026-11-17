/* Opportunity workflow. Loaded only after the authenticated dashboard app. */
(function () {
    "use strict";
    const stages = ["NEW", "REVIEW", "CONTACTED", "DISCOVERY", "FOLLOW-UP", "PROPOSAL", "WON", "LOST", "CLOSED"];
    const esc = escapeOpportunityHtml;
    function solutionLabel(value) {
        return window.ASCNDSolutions.labels(value).join(" + ");
    }

    const closed = item => ["WON", "LOST", "CLOSED"].includes(String(item.stage).toUpperCase());
    const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
    const workflow = item => item.workflow || {};
    const due = item => !closed(item) && workflow(item).follow_up_date && workflow(item).follow_up_date <= today();
    const needsAction = item => !closed(item) && !workflow(item).next_action;
    const dateLabel = date => date ? new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No date set";
    const state = { search: "", filter: "active", selected: null, busy: false, dirty: false };
    const list = document.getElementById("opportunityList");
    const detail = document.getElementById("opportunityDetail");
    const toolbar = document.createElement("div");
    toolbar.className = "ow-toolbar";
    toolbar.innerHTML = `<label>Find an opportunity<input id="ow-search" type="search" placeholder="Business, contact or service…"></label><label>Show<select id="ow-filter"><option value="active">Active opportunities</option><option value="due">Follow-ups due</option><option value="high">High priority</option><option value="missing">Needs a next action</option><option value="all">All opportunities</option>${stages.map(stage => `<option value="${stage}">${stage}</option>`).join("")}</select></label><p id="ow-count" role="status"></p>`;
    list.before(toolbar);
    toolbar.querySelector("#ow-search").addEventListener("input", e => { state.search = e.target.value.toLowerCase().trim(); renderList(); });
    toolbar.querySelector("#ow-filter").addEventListener("change", e => { state.filter = e.target.value; renderList(); });
    function matches(item) {
        if (![item.business_name, item.contact_name, item.solutions, solutionLabel(item.solutions || item.opportunity), item.opportunity, item.email, item.notes].join(" ").toLowerCase().includes(state.search)) return false;
        switch (state.filter) {
            case "all": return true;
            case "active": return !closed(item);
            case "due": return due(item);
            case "high": return !closed(item) && workflow(item).priority === "high";
            case "missing": return needsAction(item);
            default: return item.stage === state.filter;
        }
    }
    function renderList() {
        if (opportunityLoadState !== "ready") {
            list.replaceChildren();
            const message = document.createElement("p"); message.className = "ow-empty";
            message.textContent = opportunityLoadState === "error" ? "Opportunities could not be loaded. Your saved data has not changed." : "Loading saved opportunities…";
            list.append(message);
            toolbar.querySelector("#ow-count").textContent = "";
            if (opportunityLoadState === "error") {
                const retry = document.createElement("button"); retry.type = "button"; retry.className = "text-button"; retry.textContent = "Try again";
                retry.addEventListener("click", () => { opportunityLoadState = "loading"; renderList(); loadOpportunities(); }); list.append(retry);
            }

            ["overviewActiveOpportunities", "overviewFollowUps", "overviewProposals", "overviewPipelineValue", "opportunityPipelineValue"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = "—"; });
            document.querySelectorAll("[data-ow-stat]").forEach(el => { el.textContent = "—"; });
            return;
        }
        const filtered = opportunities.filter(matches).sort((a, b) => Number(Boolean(due(b))) - Number(Boolean(due(a))) || Number(workflow(b).priority === "high") - Number(workflow(a).priority === "high") || String(workflow(a).follow_up_date || "9999").localeCompare(String(workflow(b).follow_up_date || "9999")));
        toolbar.querySelector("#ow-count").textContent = `${filtered.length} of ${opportunities.length} opportunities`;
        list.replaceChildren();
        if (!filtered.length) {
            const empty = document.createElement("p"); empty.className = "ow-empty";
            empty.textContent = opportunities.length ? "No opportunities match this view. Try All opportunities or clear your search." : "No opportunities yet. Add your first prospect to get started.";
            list.append(empty);
        }
        for (const item of filtered) {
            const row = document.createElement("button"); row.type = "button"; row.className = "ow-row";
            row.innerHTML = `<span class="company-avatar">${esc(getOpportunityInitials(item.business_name))}</span><span class="ow-row-main"><strong>${esc(item.business_name || "Unnamed business")}</strong><span>${esc(solutionLabel(item.solutions || item.opportunity) || "No solution selected")}</span><span class="ow-next">${esc(workflow(item).next_action || (closed(item) ? "Opportunity closed" : "Set the next action"))}</span></span><span class="ow-row-meta"><span class="ow-stage">${esc(item.stage || "NEW")}</span><span class="${due(item) ? "ow-due" : ""}">${esc(dateLabel(workflow(item).follow_up_date))}${due(item) ? " · Due" : ""}</span>${workflow(item).priority === "high" ? '<span class="ow-priority">High priority</span>' : ""}</span>`;
            row.addEventListener("click", () => openOpportunityDetail(item));
            list.append(row);
        }

        updateMetrics();
        renderOverviewBriefing();
        loadGuidance();
    }
    function updateMetrics() {
        renderPipeline();
        const active = opportunities.filter(item => !closed(item));
        const value = active.reduce((total, item) => total + window.ASCNDSolutions.price(item.solutions || item.opportunity), 0);
        for (const [id, text] of Object.entries({ overviewActiveOpportunities: active.length, overviewFollowUps: opportunities.filter(due).length, overviewPipelineValue: `$${value.toLocaleString()}`, opportunityPipelineValue: `$${value.toLocaleString()}` })) {
            const el = document.getElementById(id); if (el) el.textContent = text;
        }
    }
    function renderPipeline() {
        const data = window.ASCNDBusinessAnalysis.compute(opportunities, assessmentRecords);
        const money = value => `$${Math.round(value).toLocaleString()}`;
        const set = (id,text) => { const el=document.getElementById(id);if(el)el.textContent=text; };
        set('goalMonth',new Date().toLocaleDateString(undefined,{month:'long',year:'numeric'})+' · MONTHLY GOAL');
        set('goalPotential',money(data.openValue));set('goalWon',money(data.wonValue));set('goalRemaining',money(data.remaining));set('goalGap',money(data.coverageGap));set('goalDaily',money(data.dailyRequired)+'/day');
        set('goalCoverage',`${Math.round(data.coveragePercent)}% potential coverage from open opportunities and this month's recorded wins. Opportunities must still close to count as won.`);
        set('goalPace',`At the current recorded-wins pace, this month projects to ${money(data.projection)}. ${data.days-data.elapsed+1} calendar days remain including today. Won opportunity values are not proof of payment.`);
        const fill=document.getElementById('goalProgressFill');if(fill){fill.style.width=data.coveragePercent+'%';fill.parentElement.setAttribute('aria-valuenow',Math.round(data.coveragePercent));}

        const refresh=document.getElementById('refreshBusinessGuidance');
        if(refresh && !refresh.dataset.bound){refresh.dataset.bound='true';refresh.addEventListener('click',()=>loadGuidance(true));}
    }
    let guidanceSignature='', guidanceRequest=0;
    function renderGuidance(suggestions,source) {
        const node=document.getElementById('businessGuidance');if(!node)return;
        const status=document.getElementById('guidanceSource');if(status)status.textContent=source;
        node.replaceChildren();
        suggestions.forEach(s=>{const article=document.createElement('article');article.className='guidance-item';const title=document.createElement('h4');title.textContent=s.title;const text=document.createElement('p');text.textContent=s.detail;article.append(title,text);node.append(article);});
    }
    async function loadGuidance(force=false) {
        const signature=JSON.stringify({date:new Date().toDateString(),opportunities:opportunities.map(o=>[o.id,o.stage,o.solutions,o.workflow,o.updated_at]),assessments:assessmentRecords.map(a=>[a.id,a.status,a.opportunity_id])});
        if(!force && signature===guidanceSignature)return;
        guidanceSignature=signature;const request=++guidanceRequest;
        renderGuidance(window.ASCNDBusinessAnalysis.compute(opportunities,assessmentRecords).suggestions,'Live pipeline analysis');
        const button=document.getElementById('refreshBusinessGuidance');if(button)button.disabled=true;
        try {
            const result=await api('/api/business-guidance');if(request!==guidanceRequest)return;
            if(!Array.isArray(result.suggestions))return;
            renderGuidance(result.suggestions,result.source==='ai'?'AI analysis · based on live pipeline data':result.aiConnected?'Live pipeline analysis · AI temporarily unavailable':'Live pipeline analysis · AI generation is not connected');
        } catch { const status=document.getElementById('guidanceSource');if(status)status.textContent='Live pipeline analysis · live AI guidance could not be loaded'; }
        finally{if(request===guidanceRequest && button)button.disabled=false;}
    }
    function field(name, label, value, type = "text", attributes = "") {
        return `<label>${label}<input name="${name}" type="${type}" value="${esc(value ?? "")}" ${attributes}></label>`;
    }
    function solutionPicker(value) {
        const catalog = window.ASCNDSolutions;
        const selected = catalog.selection(value);
        const option = item => `<label class="solution-option"><input type="checkbox" name="owSolution" value="${item.id}"${selected.includes(item.id) ? " checked" : ""}><div><strong>${esc(item.name)}</strong><span>${esc(item.description)}</span></div><b>${item.value ? '$'+item.value.toLocaleString() : 'Quoted by scope'}</b></label>`;
        const addons = `<fieldset class="intelligence-options" id="ow-intelligence-options"><legend>Optional AI capabilities</legend><p>Intelligence works without AI. Add only what this business needs.</p>${catalog.addons.map(option).join("")}</fieldset>`;
        const choices = catalog.offers.map(item => option(item) + (item.id === "intelligence" ? addons : "")).join("");
        const extra = selected.filter(id => !catalog.byId[id]).join(", ");
        return `<fieldset class="ow-solution-picker"><legend>Services / solutions</legend><div class="solution-options">${choices}</div></fieldset>${field("additional_solutions", "Additional scope (optional)", extra, "text", 'maxlength="2000"')}`;
    }
    function syncEditorIntelligence(form) {
        const parent = form.querySelector('[name="owSolution"][value="intelligence"]');
        const group = form.querySelector("#ow-intelligence-options");
        group.hidden = !parent.checked;
        group.disabled = !parent.checked;
        group.querySelectorAll("input").forEach(input => { input.disabled = !parent.checked; if (!parent.checked) input.checked = false; });
    }
    function renderDetail(item) {
        state.selected = item.id;
        state.dirty = false;
        const w = workflow(item);
        detail.innerHTML = `<div class="section-heading"><div><span class="eyebrow">OPPORTUNITY</span><h2>${esc(item.business_name)}</h2><p>Review the business, record the conversation, and choose the next move.</p></div><button type="button" class="text-button" id="ow-back">← Opportunities</button></div>
        <form id="ow-form" class="ow-form">
          <div class="panel"><h3>Next move</h3><div class="ow-grid"><label>Stage<select name="stage">${stages.map(s => `<option${s === (item.stage || "NEW") ? " selected" : ""}>${s}</option>`).join("")}</select></label><label>Priority<select name="priority"><option value="normal">Normal</option><option value="high"${w.priority === "high" ? " selected" : ""}>High</option></select></label>${field("next_action", "Next action", w.next_action, "text", 'maxlength="1000" placeholder="e.g. Call David to review the demo"')}${field("follow_up_date", "Follow-up date", w.follow_up_date, "date")}</div><p>Closing an opportunity removes it from active follow-ups. Its details stay available under All opportunities.</p></div>
          <div class="panel"><h3>Business & contact</h3><p>These details belong to this opportunity. Manage the shared company and contact records in their sections.</p><div class="ow-grid">${field("business_name", "Business name", item.business_name, "text", 'required maxlength="300"')}${field("contact_name", "Contact name", item.contact_name, "text", 'maxlength="200"')}${field("phone", "Phone(s)", item.phone, "text", 'maxlength="500"')}${field("email", "Email", item.email, "text", 'maxlength="320"')}${field("website", "Website", item.website, "text", 'maxlength="2000"')}${field("location", "Location", item.location, "text", 'maxlength="500"')}</div></div>
          <div class="panel"><h3>Scope & notes</h3><div class="ow-grid">${solutionPicker(item.solutions || item.opportunity)}${field("value", "Estimated value ($)", window.ASCNDSolutions.price(item.solutions || item.opportunity), "number", 'readonly aria-label="Calculated value from selected services"')}</div><p id="ow-quote-status" role="status"></p><label>Conversation notes<textarea name="notes" rows="6" maxlength="20000" placeholder="What did you discuss? What is the business waiting on?">${esc(item.notes || "")}</textarea></label></div>
          <div class="ow-actions"><button type="submit" class="primary-button" id="ow-save">Save changes</button><button type="button" class="text-button" id="ow-cancel">Cancel changes</button><button type="button" class="ow-delete" id="ow-delete">Delete opportunity</button><p id="ow-message" role="status" aria-live="polite"></p></div>
        </form>`;
        const form = detail.querySelector("form"); let dirty = false;
        const updatePrice = () => { const selected=Array.from(form.querySelectorAll('[name="owSolution"]:checked')).filter(input=>!input.disabled).map(input=>input.value).join(', '); form.elements.value.value=window.ASCNDSolutions.price(selected); form.querySelector("#ow-quote-status").textContent=window.ASCNDSolutions.hasCustomPricing(selected) ? "Custom scope is awaiting a quote and is excluded from the calculated value." : ""; };
        syncEditorIntelligence(form);
        updatePrice();
        form.addEventListener("input", () => { dirty = true; state.dirty = true; });
        form.addEventListener("change", () => { syncEditorIntelligence(form); updatePrice(); dirty = true; state.dirty = true; });
        detail.querySelector("#ow-back").onclick = () => { if (!state.busy && (!dirty || window.confirm("Leave without saving these changes?"))) { state.dirty = false; showView("opportunities"); } };
        detail.querySelector("#ow-cancel").onclick = () => { if (!state.busy && (!dirty || window.confirm("Discard your unsaved changes?"))) renderDetail(item); };
        form.onsubmit = async e => {
            e.preventDefault(); if (state.busy) return;
            const data = Object.fromEntries(new FormData(form));
            const selectedSolutions = Array.from(form.querySelectorAll('[name="owSolution"]:checked')).filter(input => !input.disabled).map(input => input.value);
            if (data.additional_solutions.trim()) selectedSolutions.push(data.additional_solutions.trim());
            if (!selectedSolutions.length) { detail.querySelector("#ow-message").textContent = "Select at least one service or describe the additional scope."; return; }
            const payload = { ...data, solutions: selectedSolutions.join(", "), value: Number(data.value), workflow: { next_action: data.next_action, follow_up_date: data.follow_up_date || null, priority: data.priority } };
            if (item.workflow === undefined && !data.next_action && !data.follow_up_date && data.priority === "normal") delete payload.workflow;
            delete payload.owSolution; delete payload.additional_solutions;
            delete payload.next_action; delete payload.follow_up_date; delete payload.priority;
            setBusy(true);
            try {
                const result = await api(`/api/opportunities/${encodeURIComponent(item.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                opportunities = opportunities.map(record => record.id === item.id ? result.opportunity : record);
                refresh(); renderDetail(result.opportunity); dirty = false;
                detail.querySelector("#ow-message").textContent = "Changes saved.";
            } catch (error) { detail.querySelector("#ow-message").textContent = error.message; }
            finally { setBusy(false); }
        };
        detail.querySelector("#ow-delete").onclick = async () => {
            if (state.busy || !window.confirm(`Delete the opportunity for “${item.business_name}” and its unshared company/contact records? Shared records and assessments will be kept. This cannot be undone.`)) return;
            setBusy(true);
            try {
                await api(`/api/opportunities/${encodeURIComponent(item.id)}`, { method: "DELETE" });
                opportunities = opportunities.filter(record => record.id !== item.id); state.selected = null; dirty = false; state.dirty = false;
                await Promise.all([loadCompanies(),loadContacts(),loadAssessments(),loadContactCompanies()]);
                window.dispatchEvent(new Event('ascnd-records-changed'));
                refresh(); showView("opportunities");
            } catch (error) { detail.querySelector("#ow-message").textContent = error.message; }
            finally { setBusy(false); }
        };
    }
    function renderRelated(viewId, recordId, foreignKey) {
        const view = document.getElementById(viewId);
        if (!view) return;
        let panel = view.querySelector(".ow-related");
        if (!panel) { panel = document.createElement("div"); panel.className = "panel ow-related"; view.append(panel); }
        panel.innerHTML = "<h3>Linked opportunities</h3>";
        const oldCard = view.querySelector("#companyRecordOpportunityCard");
        if (oldCard) oldCard.closest(".dashboard-section").style.display = "none";
        const linked = opportunities.filter(item => String(item[foreignKey]) === String(recordId));
        const next = linked.find(item => !closed(item) && workflow(item).next_action);
        const nextNode = view.querySelector(viewId === "companyRecord" ? "#companyRecordNextAction" : "#contactDetailNextAction");
        if (nextNode) nextNode.textContent = next ? workflow(next).next_action : "Open a linked opportunity to choose the next action.";
        if (!linked.length) { const p = document.createElement("p"); p.textContent = "No opportunities linked to this record."; panel.append(p); }
        for (const item of linked) {
            const button = document.createElement("button"); button.type = "button"; button.className = "ow-linked-button";
            button.textContent = `${item.business_name || "Opportunity"} · ${item.stage || "NEW"} · ${workflow(item).next_action || "Set next action"}`;
            button.addEventListener("click", () => openOpportunityDetail(item)); panel.append(button);
        }
    }
    function setBusy(busy) { state.busy = busy; detail.querySelectorAll("button, input, select, textarea").forEach(el => { el.disabled = busy; }); }
    async function api(url, options) {
        const response = await fetch(url, options); let data;
        try { data = await response.json(); } catch { throw new Error("The server returned an unexpected response. Please try again."); }
        if (!response.ok) throw new Error(data.error || data.message || "The opportunity could not be updated.");
        return data;
    }
    function refresh() {
        renderOpportunities(); renderOverviewMetrics(); renderOverviewBriefing();
        renderAttentionQueue(opportunities, assessmentRecords); renderInboxRecentActivity(); renderOverviewAttention(); renderOverviewRecentActivity();
        renderList();
    }
    document.addEventListener("click", event => {
        const navigation = event.target.closest(".nav-item, [data-view-target], .ow-row, .ow-today-list button, .ow-linked-button");
        if (!navigation || !detail.classList.contains("active")) return;
        if (state.busy || (state.dirty && !window.confirm("Leave without saving these changes?"))) { event.preventDefault(); event.stopImmediatePropagation(); }
        else state.dirty = false;
    }, true);
    window.addEventListener("beforeunload", event => { if (state.dirty || state.busy) { event.preventDefault(); event.returnValue = ""; } });
    window.ASCNDOpportunityWorkflow = { renderList, renderDetail, renderRelated, isDue: due };
    renderList();
    // Calendar-based due dates refresh after midnight without a server request.
    setInterval(renderList, 60000);
})();
