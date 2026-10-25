(function () {
    "use strict";
    if (window.ASCNDCompanyDemos) return;
    window.ASCNDCompanyDemos = { version: "1.0.0" };
    const statusLabels = { not_started: "Not started", building: "Building", created: "Created", needs_updates: "Needs updates", ready: "Ready for outreach" };
    const outreachLabels = { not_contacted: "Not contacted", sent: "Demo sent", follow_up: "Follow-up scheduled", replied: "Replied", meeting: "Meeting booked", won: "Won", lost: "Closed / lost" };
    const checklist = { identity: "Business identity confirmed", contact: "Contact information confirmed", service_area: "Service area confirmed", services: "Services and business details complete", images: "Imagery and claims checked / samples labeled" };
    const state = { companies: [], filter: "all", search: "", currentId: null, currentName: "", record: {}, dirty: false, saving: false, loading: false, requestNumber: 0, hubRequest: 0 };
    let hub, recordPanel;
    const escape = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    function today() {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    function record(value) {
        const d = value && typeof value === "object" && !Array.isArray(value) ? value : {};
        return { demo_url: "", demo_status: "not_started", link_checked: false, info_checks: {}, changes_requested: "", changes_complete: false,
            outreach_status: "not_contacted", last_contacted: "", follow_up_date: "", next_action: "", revision: 0, ...d,
            info_checks: d.info_checks || {} };
    }
    function safeUrl(value) {
        try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password && u.hostname.includes(".") && !u.hostname.endsWith(".localhost") && !u.hostname.endsWith(".local") && !/^\d+(?:\.\d+){3}$/.test(u.hostname) && !u.hostname.includes(":") ? u.href : ""; } catch { return ""; }
    }
    const closed = d => ["won", "lost"].includes(d.outreach_status);
    const due = d => Boolean(d.follow_up_date && d.follow_up_date <= today() && !closed(d));
    const complete = d => Object.keys(checklist).filter(key => d.info_checks[key] === true).length;
    const ready = d => Boolean(safeUrl(d.demo_url) && d.link_checked && complete(d) === 5 && (!d.changes_requested.trim() || d.changes_complete));
    function suggested(d) {
        if (closed(d)) return d.outreach_status === "won" ? "Move to client onboarding." : "Closed. Reopen only when appropriate.";
        if (due(d)) return "Follow up with this company.";
        if (d.demo_status === "needs_updates" || (d.changes_requested && !d.changes_complete)) return "Complete the requested demo updates.";
        if (complete(d) < 5) return "Confirm the missing business information.";
        if (!d.demo_url) return "Create and publish this company’s demo.";
        if (!d.link_checked) return "Open the live demo and test its pages and form.";
        if (d.demo_status !== "ready") return "Review the demo and mark it ready when complete.";
        if (d.outreach_status === "not_contacted") return "Send the demo through your chosen outreach channel.";
        if (!d.follow_up_date) return "Choose the next follow-up date.";
        return "Review the next scheduled action.";
    }
    const options = (labels, selected) => Object.entries(labels).map(([value, label]) => `<option value="${value}"${selected === value ? " selected" : ""}>${label}</option>`).join("");
    async function api(path, options) {
        const response = await window.fetch(path, options);
        let data;
        try { data = await response.json(); } catch { throw new Error("The demo API returned an unexpected response. Check that the add-on is installed and the server restarted."); }
        if (!response.ok) {
            const error = new Error(data.error || data.message || "Demo tracking could not be loaded.");
            error.status = response.status; throw error;
        }
        return data;
    }
    function setMessage(text, error) {
        const node = recordPanel.querySelector("#cd-save-message");
        if (node) { node.textContent = text; node.classList.toggle("cd-error", Boolean(error)); }
    }
    function matches(company) {
        const d = record(company.demo_tracking);
        if (!`${company.name} ${company.industry || ""}`.toLowerCase().includes(state.search)) return false;
        return state.filter === "all" || (state.filter === "missing" && complete(d) < 5 && !closed(d)) ||
            (state.filter === "ready" && d.demo_status === "ready" && ready(d) && d.outreach_status === "not_contacted") ||
            (state.filter === "updates" && !closed(d) && (d.demo_status === "needs_updates" || (d.changes_requested && !d.changes_complete))) ||
            (state.filter === "due" && due(d)) || (state.filter === "building" && ["not_started", "building"].includes(d.demo_status) && !closed(d));
    }
    function renderHub() {
        const filtered = state.companies.filter(matches).sort((a, b) => {
            const da = record(a.demo_tracking), db = record(b.demo_tracking);
            return Number(due(db)) - Number(due(da)) || (da.follow_up_date || "9999").localeCompare(db.follow_up_date || "9999") || String(a.name).localeCompare(String(b.name));
        });
        const counts = {
            all: state.companies.length,
            ready: state.companies.filter(c => { const d = record(c.demo_tracking); return d.demo_status === "ready" && ready(d) && d.outreach_status === "not_contacted"; }).length,
            due: state.companies.filter(c => due(record(c.demo_tracking))).length,
            updates: state.companies.filter(c => { const d = record(c.demo_tracking); return !closed(d) && (d.demo_status === "needs_updates" || (d.changes_requested && !d.changes_complete)); }).length,
            missing: state.companies.filter(c => { const d = record(c.demo_tracking); return !closed(d) && complete(d) < 5; }).length,
            building: state.companies.filter(c => { const d = record(c.demo_tracking); return !closed(d) && ["not_started", "building"].includes(d.demo_status); }).length
        };
        hub.querySelectorAll("[data-cd-filter]").forEach(button => {
            button.setAttribute("aria-pressed", String(button.dataset.cdFilter === state.filter));
            button.querySelector("b").textContent = counts[button.dataset.cdFilter];
        });
        hub.querySelector("#cd-result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "company" : "companies"}`;
        hub.querySelector("#cd-list").innerHTML = filtered.length ? filtered.map(company => {
            const d = record(company.demo_tracking), url = safeUrl(d.demo_url);
            return `<article class="cd-pipeline-row"><div class="cd-company"><strong>${escape(company.name)}</strong><span>${escape(company.industry || "Business")} · ${complete(d)}/5 info checks</span></div><div><span class="cd-badge cd-${escape(statusLabels[d.demo_status] ? d.demo_status : "not_started")}">${escape(statusLabels[d.demo_status] || "Not started")}</span><small>${escape(outreachLabels[d.outreach_status] || "Not contacted")}</small></div><div class="cd-row-next"><span${due(d) ? ' class="cd-overdue"' : ""}>${d.follow_up_date && !closed(d) ? `${due(d) ? "Due: " : "Follow-up: "}${escape(d.follow_up_date)}` : "No follow-up scheduled"}</span><small>${escape(d.next_action || suggested(d))}</small></div><div class="cd-row-actions">${url ? `<a class="cd-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">Open demo</a>` : '<span class="cd-muted">No live link</span>'}<button type="button" class="text-button cd-manage" data-company-id="${escape(company.id)}">Manage demo →</button></div></article>`;
        }).join("") : '<p class="cd-empty">No companies match this view. Choose another filter or add a company in the OS.</p>';
    }
    async function loadHub() {
        const request = ++state.hubRequest;
        const message = hub.querySelector("#cd-hub-message");
        message.textContent = "Loading saved demo records…";
        hub.querySelector("#cd-refresh").disabled = true;
        try {
            const data = await api("/api/company-demos");
            if (request !== state.hubRequest) return;
            if (!Array.isArray(data)) throw new Error("Unexpected company list response.");
            state.companies = data; renderHub();
            message.textContent = "Saved company records · Follow-ups are reminders only; no messages are sent.";
            message.classList.remove("cd-error");
        } catch (error) {
            if (request !== state.hubRequest) return;
            message.textContent = error.message; message.classList.add("cd-error");
        } finally { if (request === state.hubRequest) hub.querySelector("#cd-refresh").disabled = false; }
    }
    function renderRecord() {
        const d = record(state.record);
        const url = safeUrl(d.demo_url);
        recordPanel.innerHTML = `<div class="panel-header"><div><span class="eyebrow">COMPANY DEMO</span><h3>Demo & follow-up workspace</h3></div><span class="cd-badge cd-${escape(d.demo_status)}">${escape(statusLabels[d.demo_status] || "Not started")}</span></div>
        <p class="cd-intro">Keep this company’s live demo, business checks, changes, and next action together. Updating this record does not edit or publish the website.</p>
        <form id="cd-form"><div class="cd-form-grid"><div class="cd-form-section"><h4>01 / Demo</h4><label for="cd-url">Live demo link</label><div class="cd-url-row"><input id="cd-url" name="demo_url" type="url" maxlength="2048" placeholder="https://your-demo.chatgpt.site" value="${escape(d.demo_url)}"><a id="cd-open-link" class="cd-secondary" target="_blank" rel="noopener noreferrer"${url ? ` href="${escape(url)}"` : ' hidden'}>Open demo</a></div><small>Use a public HTTPS link. Add or replace the link when a new version is published.</small><label class="cd-check"><input type="checkbox" name="link_checked"${d.link_checked ? " checked" : ""}>I opened this link and tested its pages, mobile layout, and form.</label><label for="cd-demo-status">Demo status</label><select id="cd-demo-status" name="demo_status">${options(statusLabels, d.demo_status)}</select><div id="cd-readiness" class="cd-readiness" aria-live="polite"></div></div>
        <fieldset class="cd-form-section"><legend>02 / Business information</legend><p class="cd-help">Check only what you have confirmed. Missing an email does not block readiness if a usable contact method is verified.</p>${Object.entries(checklist).map(([key, label]) => `<label class="cd-check"><input type="checkbox" name="info_${key}"${d.info_checks[key] ? " checked" : ""}>${label}</label>`).join("")}</fieldset>
        <div class="cd-form-section"><h4>03 / Requested updates</h4><label for="cd-changes">Changes to make</label><textarea id="cd-changes" name="changes_requested" maxlength="4000" rows="4" placeholder="Correct service area, update imagery, adjust the contact section…">${escape(d.changes_requested)}</textarea><label class="cd-check"><input type="checkbox" name="changes_complete"${d.changes_complete ? " checked" : ""}>All changes listed above are completed.</label><small>Keep completed requests as a reference. New or edited requests reset this check.</small></div>
        <div class="cd-form-section"><h4>04 / Outreach & follow-up</h4><label for="cd-outreach">Outreach status</label><select id="cd-outreach" name="outreach_status">${options(outreachLabels, d.outreach_status)}</select><div class="cd-dates"><div><label for="cd-contacted">Last contacted</label><input id="cd-contacted" name="last_contacted" type="date" max="${today()}" value="${escape(d.last_contacted)}"></div><div><label for="cd-followup">Next follow-up</label><input id="cd-followup" name="follow_up_date" type="date" value="${escape(d.follow_up_date)}"></div></div><label for="cd-next-action">Next action</label><textarea id="cd-next-action" name="next_action" maxlength="1000" rows="3" placeholder="For example: send the demo, then ask for a 10-minute call.">${escape(d.next_action)}</textarea><small>Dates are tracked as calendar days. Nothing is emailed, texted, or scheduled externally.</small></div></div><div class="cd-save-bar"><button class="primary-button" id="cd-save" type="submit">Save demo record</button><button class="cd-secondary" type="button" id="cd-reload">Reload saved record</button><span id="cd-save-message" role="status" aria-live="polite">${d.updated_at ? `Last saved ${escape(new Date(d.updated_at).toLocaleString())}` : "No saved demo record yet."}</span></div></form>`;
        const form = recordPanel.querySelector("#cd-form");
        form.addEventListener("input", event => {
            state.dirty = true;
            if (event.target.name === "demo_url") form.elements.link_checked.checked = false;
            if (event.target.name === "changes_requested") {
                form.elements.changes_complete.checked = false;
                if (event.target.value.trim()) form.elements.demo_status.value = "needs_updates";
            }
            updateReadiness(); setMessage("Unsaved changes.");
        });
        form.addEventListener("change", () => { state.dirty = true; updateReadiness(); setMessage("Unsaved changes."); });
        form.addEventListener("submit", saveRecord);
        recordPanel.querySelector("#cd-reload").addEventListener("click", () => {
            if (state.saving || (state.dirty && !window.confirm("Discard your unsaved demo changes and reload the saved record?"))) return;
            loadRecord(state.currentId);
        });
        updateReadiness(); updateNextAction(d);
    }
    function values() {
        const form = recordPanel.querySelector("#cd-form");
        return { demo_url: form.elements.demo_url.value.trim(), demo_status: form.elements.demo_status.value,
            link_checked: form.elements.link_checked.checked, info_checks: Object.fromEntries(Object.keys(checklist).map(key => [key, form.elements[`info_${key}`].checked])),
            changes_requested: form.elements.changes_requested.value.trim(), changes_complete: form.elements.changes_complete.checked,
            outreach_status: form.elements.outreach_status.value, last_contacted: form.elements.last_contacted.value,
            follow_up_date: form.elements.follow_up_date.value, next_action: form.elements.next_action.value.trim(), expected_revision: Number(state.record.revision || 0) };
    }
    function updateReadiness() {
        const d = values(), count = complete(d), blockers = [];
        if (!safeUrl(d.demo_url)) blockers.push("a public HTTPS link");
        if (!d.link_checked) blockers.push("a tested live link");
        if (count < 5) blockers.push(`${5 - count} business information ${5 - count === 1 ? "check" : "checks"}`);
        if (d.changes_requested && !d.changes_complete) blockers.push("completion of requested changes");
        const node = recordPanel.querySelector("#cd-readiness");
        node.textContent = blockers.length ? `${count}/5 information checks. Before Ready: ${blockers.join("; ")}.` : "All readiness checks are complete. You can mark this demo Ready for outreach.";
        node.classList.toggle("cd-ready-note", !blockers.length);
        const link = recordPanel.querySelector("#cd-open-link"), url = safeUrl(d.demo_url);
        link.hidden = !url; if (url) link.href = url; else link.removeAttribute("href");
    }
    function updateNextAction(d) {
        const node = document.querySelector("#companyRecordNextAction");
        if (node) node.textContent = d.next_action || suggested(d);
    }
    async function loadRecord(id) {
        const request = ++state.requestNumber;
        state.currentId = String(id); state.loading = true; state.dirty = false;
        recordPanel.innerHTML = '<div class="panel-header"><h3>Demo & follow-up workspace</h3></div><p class="cd-intro" role="status">Loading this company’s saved demo record…</p>';
        try {
            const data = await api(`/api/companies/${encodeURIComponent(id)}/demo`);
            if (request !== state.requestNumber) return;
            state.record = record(data.demo_tracking); state.currentName = data.name || "Company"; renderRecord();
        } catch (error) {
            if (request !== state.requestNumber) return;
            recordPanel.innerHTML = '<div class="panel-header"><h3>Demo tracking unavailable</h3></div><p class="cd-intro cd-error" role="status"></p><button class="cd-secondary" type="button">Retry</button>';
            recordPanel.querySelector("p").textContent = error.message;
            recordPanel.querySelector("button").addEventListener("click", () => loadRecord(id));
        } finally { if (request === state.requestNumber) state.loading = false; }
    }
    async function saveRecord(event) {
        event.preventDefault();
        if (state.saving || state.loading) return;
        const payload = values();
        if (payload.demo_status === "ready" && !ready(payload)) { setMessage("Complete the readiness checks before marking this demo Ready.", true); return; }
        if (payload.demo_url && !safeUrl(payload.demo_url)) { setMessage("Use a public HTTPS demo link, without a username or password.", true); return; }
        if (payload.outreach_status === "follow_up" && !payload.follow_up_date) { setMessage("Choose a follow-up date.", true); return; }
        const id = state.currentId;
        state.saving = true;
        const form = recordPanel.querySelector("#cd-form");
        const disabledBefore = [...form.elements].map(el => [el, el.disabled]);
        disabledBefore.forEach(([el]) => { el.disabled = true; });
        setMessage("Saving to this company’s record…");
        try {
            const data = await api(`/api/companies/${encodeURIComponent(id)}/demo`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            state.record = record(data.demo_tracking); state.dirty = false;
            const company = state.companies.find(c => String(c.id) === id);
            if (company) company.demo_tracking = data.demo_tracking;
            renderRecord(); renderHub();
            setMessage("Saved to this company’s record.");
        } catch (error) { setMessage(error.message, true); }
        finally { state.saving = false; disabledBefore.forEach(([el, disabled]) => { el.disabled = disabled; }); }
    }
    function boot() {
        const companyView = document.querySelector("#companies"), companyRecord = document.querySelector("#companyRecord");
        if (!companyView || !companyRecord || typeof window.openCompany !== "function") return false;
        hub = document.createElement("section"); hub.id = "companyDemoPipeline"; hub.className = "cd-workspace panel"; hub.setAttribute("aria-labelledby", "cd-hub-title");
        hub.innerHTML = `<div class="panel-header"><div><span class="eyebrow">CLIENT DEMO OPERATIONS</span><h3 id="cd-hub-title">Demo pipeline</h3></div><button type="button" class="cd-secondary" id="cd-refresh">Refresh demos</button></div><p class="cd-intro">Every company. Its demo. The next move.</p><div class="cd-filters" role="group" aria-label="Demo pipeline filters">${Object.entries({ all: "All companies", ready: "Ready to send", due: "Follow-ups due", updates: "Needs updates", missing: "Missing info", building: "To build" }).map(([key, label]) => `<button type="button" data-cd-filter="${key}" aria-pressed="${key === "all"}">${label}<b>0</b></button>`).join("")}</div><div class="cd-search-row"><label for="cd-search" class="cd-sr-only">Search demo companies</label><input id="cd-search" type="search" placeholder="Find a company’s demo…"><span id="cd-result-count"></span></div><div id="cd-list"></div><p id="cd-hub-message" class="cd-hub-message" role="status" aria-live="polite"></p>`;
        const toolbar = companyView.querySelector(".company-toolbar");
        if (toolbar) toolbar.before(hub); else companyView.append(hub);
        recordPanel = document.createElement("section"); recordPanel.id = "companyDemoRecord"; recordPanel.className = "cd-workspace panel";
        const firstSection = companyRecord.querySelector(".dashboard-section");
        if (firstSection) firstSection.before(recordPanel); else companyRecord.append(recordPanel);
        const originalOpen = window.openCompany;
        window.openCompany = function (id) {
            if (state.saving) { setMessage("Please wait for this save to finish."); return; }
            if (state.dirty && !window.confirm("Discard unsaved demo changes and open this company’s saved record?")) return;
            originalOpen.apply(this, arguments);
            if (companyRecord.classList.contains("active")) loadRecord(id);
        };
        hub.addEventListener("click", event => {
            const filter = event.target.closest("[data-cd-filter]");
            if (filter) { state.filter = filter.dataset.cdFilter; renderHub(); }
            const manage = event.target.closest("[data-company-id]");
            if (manage) window.openCompany(manage.dataset.companyId);
        });
        hub.querySelector("#cd-search").addEventListener("input", event => { state.search = event.target.value.toLowerCase().trim(); renderHub(); });
        hub.querySelector("#cd-refresh").addEventListener("click", loadHub);
        document.addEventListener("click", event => {
            if (event.target.closest('[data-view="companies"], [data-view-target="companies"]')) loadHub();
        });
        window.addEventListener("beforeunload", event => { if (state.dirty) { event.preventDefault(); event.returnValue = ""; } });
        // Use the authenticated fetch installed by auth.js; never replace or bypass it.
        loadHub();
        return true;
    }
    // auth.js loads app.js only after sign-in. Wait for the existing company view to be available.
    let attempts = 0;
    const timer = window.setInterval(() => {
        if (document.body.classList.contains("os-auth-locked")) return;
        if (boot() || ++attempts > 300) window.clearInterval(timer);
    }, 200);
})();
