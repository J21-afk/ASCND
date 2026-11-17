/* Shared offer definitions. New identifiers preserve the meaning of legacy records. */
(function (root, factory) {
    const catalog = factory();
    if (typeof module === "object" && module.exports) module.exports = catalog;
    else root.ASCNDSolutions = catalog;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";
    const offers = [
        { id: "start-brand", name: "ASCND Start", description: "Brand Identity", value: 500 },
        { id: "connect-digital", name: "ASCND Connect", description: "Website & Digital Foundation", value: 799 },
        { id: "intelligence", name: "ASCND Intelligence", description: "Lead & Customer Management", value: 1500 },
        { id: "coordinate", name: "ASCND Coordinate", description: "Estimates / Quotes / Scheduling", value: 750 },
        { id: "ai-receptionist", name: "AI Receptionist", description: "Call Answering & Inquiry Capture", value: 2250 },
        { id: "custom", name: "Custom Solution", description: "Quoted by scope", value: 0 }
    ];
    const addons = [
        { id: "ai-analysis", name: "AI Analysis", description: "Summarize inquiries and suggest next actions", value: 0 },
        { id: "ai-automation", name: "AI Automation", description: "Assist approved follow-ups and routine workflows", value: 0 }
    ];
    const entries = [...offers, ...addons];
    const byId = Object.fromEntries(entries.map(item => [item.id, item]));
    const aliases = { start: "connect-digital", brand: "start-brand", grow: "intelligence", connect: "intelligence", estimate: "coordinate", other: "custom" };
    function canonical(part) {
        const text = part.trim();
        const lower = text.toLowerCase();
        if (byId[lower]) return lower;
        if (aliases[lower]) return aliases[lower];
        // Classify full legacy labels by their original service, not their former name.
        if (/^ascnd (start|connect|grow)\s*[-—–â]/i.test(text)) {
            if (/website|digital foundation/i.test(text)) return "connect-digital";
            if (/lead|customer/i.test(text)) return "intelligence";
            if (/brand/i.test(text)) return "start-brand";
        }
        if (/^brand identity(?:\s*[-—–â]|$)/i.test(text)) return "start-brand";
        if (/^estimate\s*\/\s*quote system/i.test(text)) return "coordinate";
        if (/^other\s*\/\s*custom/i.test(text)) return "custom";
        // Previous editor saved bare names; preserve their old service meaning.
        if (/^ascnd start$/i.test(text)) return "connect-digital";
        if (/^ascnd (connect|grow)$/i.test(text)) return "intelligence";
        for (const item of entries) {
            if (lower === item.name.toLowerCase() || lower === `${item.name} — ${item.description}`.toLowerCase()) return item.id;
        }
        return text;
    }
    function selection(value) {
        const result = [...new Set(String(value || "").split(",").map(canonical).filter(Boolean))];
        if (result.some(id => addons.some(addon => addon.id === id)) && !result.includes("intelligence")) result.unshift("intelligence");
        return result;
    }
    function normalize(value) {
        return typeof value === "string" ? selection(value).join(", ") : value;
    }
    function labels(value) {
        return selection(value).map(id => byId[id] ? `${byId[id].name} — ${byId[id].description}` : id);
    }
    function price(value) { return selection(value).reduce((sum, id) => sum + (byId[id]?.value || 0), 0); }
    function hasCustomPricing(value) { return selection(value).some(id => !byId[id] || ["custom", "ai-analysis", "ai-automation"].includes(id)); }
    return { offers, addons, entries, byId, selection, normalize, labels, price, hasCustomPricing };
});
