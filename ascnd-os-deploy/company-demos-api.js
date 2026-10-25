"use strict";

const DEMO_STATUSES = ["not_started", "building", "created", "needs_updates", "ready"];
const OUTREACH_STATUSES = ["not_contacted", "sent", "follow_up", "replied", "meeting", "won", "lost"];
const CHECKS = ["identity", "contact", "service_area", "services", "images"];
const FIELDS = ["demo_url", "demo_status", "link_checked", "info_checks", "changes_requested", "changes_complete", "outreach_status", "last_contacted", "follow_up_date", "next_action", "expected_revision"];

function validPublicUrl(value) {
    if (!value) return true;
    try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase();
        return url.protocol === "https:" && !url.username && !url.password && host.includes(".") &&
            host !== "localhost" && !host.endsWith(".localhost") && !host.endsWith(".local") &&
            !/^\d+(?:\.\d+){3}$/.test(host) && !host.includes(":");
    } catch { return false; }
}
function validDate(value) {
    if (!value) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value;
}
function validate(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Send a demo tracking record." };
    if (Object.keys(body).some(key => !FIELDS.includes(key))) return { error: "The record contains an unsupported field." };
    for (const key of ["demo_url", "changes_requested", "next_action", "last_contacted", "follow_up_date"]) {
        if (typeof body[key] !== "string") return { error: `Missing or invalid ${key}.` };
    }
    if (body.demo_url.length > 2048 || body.changes_requested.length > 4000 || body.next_action.length > 1000)
        return { error: "A link or note is too long." };
    const demo_url = body.demo_url.trim();
    if (!validPublicUrl(demo_url)) return { error: "Use a public HTTPS demo link, without a username or password." };
    if (!DEMO_STATUSES.includes(body.demo_status) || !OUTREACH_STATUSES.includes(body.outreach_status))
        return { error: "Choose a supported demo and outreach status." };
    if (typeof body.link_checked !== "boolean" || typeof body.changes_complete !== "boolean")
        return { error: "Checklist values must be true or false." };
    const checks = body.info_checks;
    if (!checks || typeof checks !== "object" || Array.isArray(checks) || Object.keys(checks).some(key => !CHECKS.includes(key)) ||
        CHECKS.some(key => typeof checks[key] !== "boolean")) return { error: "Complete the information checklist." };
    if (!Number.isSafeInteger(body.expected_revision) || body.expected_revision < 0)
        return { error: "Reload the company before saving its demo record." };
    if (!validDate(body.last_contacted) || !validDate(body.follow_up_date)) return { error: "Use valid calendar dates." };
    if (body.last_contacted && body.last_contacted > new Date().toISOString().slice(0, 10))
        return { error: "The last-contacted date cannot be in the future." };
    if (body.outreach_status === "follow_up" && !body.follow_up_date)
        return { error: "Choose a follow-up date for Follow-up scheduled." };
    if (body.demo_status === "ready" && (!demo_url || !body.link_checked || !CHECKS.every(key => checks[key]) ||
        (body.changes_requested.trim() && !body.changes_complete)))
        return { error: "Ready requires a live link you have tested, all five information checks, and all requested changes completed." };
    return { value: {
        demo_url, demo_status: body.demo_status, link_checked: Boolean(demo_url && body.link_checked),
        info_checks: Object.fromEntries(CHECKS.map(key => [key, checks[key]])),
        changes_requested: body.changes_requested.trim(), changes_complete: body.changes_complete,
        outreach_status: body.outreach_status, last_contacted: body.last_contacted,
        follow_up_date: body.follow_up_date, next_action: body.next_action.trim()
    }};
}
function setupError(error) {
    return error && (error.code === "42703" || error.code === "PGRST204" || /demo_tracking.*(column|schema)|column.*demo_tracking/i.test(error.message || ""));
}
function fail(res, error) {
    if (setupError(error)) return res.status(503).json({ error: "Demo tracking needs its one-time database setup. Run migrations/001_company_demo_tracking.sql in the Supabase SQL Editor, then refresh.", code: "DEMO_SETUP_REQUIRED" });
    return res.status(500).json({ error: "Demo tracking could not be saved or loaded. Your existing record has not been replaced." });
}
function installCompanyDemoRoutes(app, supabase) {
    // Mount AFTER the existing /api authentication middleware. This guard also fails closed if misplaced.
    const authorize = (req, res, next) => req.authUser ? next() : res.status(401).json({ error: "Sign in to access company demos." });
    app.get("/api/company-demos", authorize, async (req, res) => {
        res.set("Cache-Control", "no-store");
        try {
            const { data, error } = await supabase.from("companies")
                .select("id,name,industry,status,primary_contact,phone,email,demo_tracking").order("name", { ascending: true });
            if (error) return fail(res, error);
            res.json(data || []);
        } catch (error) { fail(res, error); }
    });
    app.get("/api/companies/:companyId/demo", authorize, async (req, res) => {
        res.set("Cache-Control", "no-store");
        try {
            const { data, error } = await supabase.from("companies").select("id,name,demo_tracking").eq("id", req.params.companyId).maybeSingle();
            if (error) return fail(res, error);
            if (!data) return res.status(404).json({ error: "Company not found. Refresh the company list." });
            res.json(data);
        } catch (error) { fail(res, error); }
    });
    app.patch("/api/companies/:companyId/demo", authorize, async (req, res) => {
        res.set("Cache-Control", "no-store");
        const checked = validate(req.body);
        if (checked.error) return res.status(400).json({ error: checked.error });
        try {
            const { data: existing, error: readError } = await supabase.from("companies").select("id,demo_tracking").eq("id", req.params.companyId).maybeSingle();
            if (readError) return fail(res, readError);
            if (!existing) return res.status(404).json({ error: "Company not found." });
            const old = existing.demo_tracking || {};
            const revision = Number(old.revision || 0);
            if (revision !== req.body.expected_revision)
                return res.status(409).json({ error: "This company was updated in another window. Copy any unsaved notes, then reload its demo record before saving again." });
            const value = { ...checked.value, revision: revision + 1, updated_at: new Date().toISOString(), updated_by: req.authUser.id };
            let query = supabase.from("companies").update({ demo_tracking: value }).eq("id", req.params.companyId);
            query = old.revision == null ? query.is("demo_tracking->>revision", null) : query.eq("demo_tracking->>revision", String(revision));
            const { data, error } = await query.select("id,name,demo_tracking").maybeSingle();
            if (error) return fail(res, error);
            if (!data) return res.status(409).json({ error: "Another save arrived first. Copy unsaved notes and reload this demo record." });
            res.json(data);
        } catch (error) { fail(res, error); }
    });
}
module.exports = { installCompanyDemoRoutes, validate, validPublicUrl, validDate };
