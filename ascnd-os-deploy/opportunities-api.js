"use strict";

const STAGES = ["NEW", "REVIEW", "CONTACTED", "DISCOVERY", "FOLLOW-UP", "PROPOSAL", "WON", "LOST", "CLOSED"];
const TEXT_FIELDS = { contact_name: 200, business_name: 300, location: 500, phone: 500, email: 320, website: 2000, solutions: 2000, notes: 20000 };
const normalizeSolutionText = require("./public/solutions-catalog").normalize;

const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function validateUpdate(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Supply opportunity details.");
    const update = {};
    for (const [key, limit] of Object.entries(TEXT_FIELDS)) {
        if (!own(body, key)) continue;
        if (typeof body[key] !== "string" || body[key].length > limit) throw new Error(`Invalid ${key.replaceAll("_", " ")}.`);
        update[key] = body[key].trim() || null;
    }
    if (own(update, "business_name") && !update.business_name) throw new Error("Business name is required.");
    if (own(update, "solutions")) {
        if (!update.solutions) throw new Error("At least one solution is required.");
        update.solutions = normalizeSolutionText(update.solutions);
        update.opportunity = update.solutions; // Preserve the legacy display field.
    }
    if (own(body, "value")) {
        if (!["number", "string"].includes(typeof body.value) || body.value === "" || !Number.isFinite(Number(body.value)) || Number(body.value) < 0) throw new Error("Value must be a nonnegative number.");
        update.value = Number(body.value);
    }
    if (own(body, "stage")) {
        if (!STAGES.includes(body.stage)) throw new Error("Choose a valid opportunity stage.");
        update.stage = body.stage;
    }
    if (own(body, "workflow")) {
        const w = body.workflow;
        if (!w || typeof w !== "object" || Array.isArray(w)) throw new Error("Invalid follow-up details.");
        if (typeof w.next_action !== "string" || w.next_action.length > 1000) throw new Error("Next action must be under 1,000 characters.");
        if (!["normal", "high"].includes(w.priority)) throw new Error("Choose normal or high priority.");
        const date = w.follow_up_date;
        if (date !== null && (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) throw new Error("Choose a valid follow-up date.");
        update.workflow = { next_action: w.next_action.trim(), follow_up_date: date, priority: w.priority };
    }
    if (!Object.keys(update).length) throw new Error("No editable fields supplied.");
    return update;
}

function registerOpportunityRoutes(app, supabase) {
    // Mounted after the existing /api authorization middleware in server.js.
    const authorize = (req, res, next) => req.authUser ? next() : res.status(401).json({ error: "Sign in to manage opportunities." });
    app.patch("/api/opportunities/:id", authorize, async (req, res) => {
        let update;
        try { update = validateUpdate(req.body); }
        catch (error) { return res.status(400).json({ error: error.message }); }
        try {
            const { data, error } = await supabase.from("opportunities").update(update).eq("id", req.params.id).select("*").maybeSingle();
            if (error) {
                console.error("Opportunity update failed:", error.code);
                const missingWorkflow = /workflow/.test(error.message || "") && ["PGRST204", "42703"].includes(error.code);
                return res.status(500).json({ error: missingWorkflow ? "Follow-up storage needs setup. Run migrations/001-opportunity-workflow.sql in Supabase, then try again." : "Unable to save this opportunity. Your changes have not been confirmed." });
            }
            if (!data) return res.status(404).json({ error: "This opportunity no longer exists. Refresh the list." });
            res.json({ opportunity: data });
        } catch (error) { res.status(500).json({ error: "Unable to save this opportunity. Try again." }); }
    });
    app.delete("/api/opportunities/:id", authorize, async (req, res) => {
        try {
            // Delete only this opportunity. Never delete its company or contact.
            const { data, error } = await supabase.from("opportunities").delete().eq("id", req.params.id).select("id").maybeSingle();
            if (error) {
                console.error("Opportunity delete failed:", error.code);
                return res.status(error.code === "23503" ? 409 : 500).json({ error: error.code === "23503" ? "This opportunity is linked to another record. Remove that link before deleting it." : "Unable to delete this opportunity. Try again." });
            }
            if (!data) return res.status(404).json({ error: "This opportunity no longer exists. Refresh the list." });
            res.json({ success: true, id: data.id });
        } catch (error) { res.status(500).json({ error: "Unable to delete this opportunity. Try again." }); }
    });
}
module.exports = { registerOpportunityRoutes, validateUpdate, STAGES, normalizeSolutionText };
