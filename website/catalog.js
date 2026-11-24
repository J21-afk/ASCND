const packages = [
    {
        slug: "start", name: "ASCND Start", category: "Brand identity", price: 500,
        headline: "Look as professional as the work you do.",
        description: "Give customers a consistent first impression across your website, social profiles, and printed materials.",
        includes: ["Logo and visual direction", "Brand colors and typography", "Guidance for applying the identity"]
    },
    {
        slug: "connect", name: "ASCND Connect", category: "Website & digital foundation", price: 799,
        headline: "Make it easy for customers to choose you.",
        description: "Give customers a place to understand your services, see your work, and take the next step from any device.",
        includes: ["A responsive business website", "Clear service information and inquiry pathways", "Launch setup"]
    },
    {
        slug: "intelligence", name: "ASCND Intelligence", category: "Lead & customer management", price: 1500,
        headline: "Know who needs a follow-up.",
        description: "Bring customer inquiries, contact details, and next steps into one workspace so opportunities are easier to track.",
        includes: ["Customer intake and lead records", "Statuses and activity notes", "Follow-up tracking"]
    },
    {
        slug: "coordinate", name: "ASCND Coordinate", category: "Scheduling, estimates & quotes", price: 750,
        headline: "Keep work moving from request to booking.",
        description: "Give your team a clear process for the details, decisions, and scheduling that happen before a job starts.",
        includes: ["Scheduling or appointment request workflow", "Estimate or quote request intake", "Clear handoffs and customer next steps"]
    },
    {
        slug: "ai-receptionist", name: "AI Receptionist", category: "Voice assistance", price: 2250,
        headline: "Give callers a next step while you’re on a job.",
        description: "Set up a voice assistant around your business so callers can get answers to common questions and leave the details you need to follow up.",
        includes: ["Call flows built around your business", "Answers based on the information you provide", "Caller details and routing where supported"]
    },
    {
        slug: "custom", name: "ASCND Custom", category: "Custom systems", price: null,
        headline: "Build around the way your business works.",
        description: "Bring a specific bottleneck, integration, or idea. We’ll define what needs to connect and scope the work around it.",
        includes: ["Workflow discovery", "A proposal tailored to the project", "Integrations scoped around your tools"]
    }
];

const holiday = {
    code: "HOLIDAY",
    endsAt: Date.parse("2026-12-01T06:00:00Z"),
    deadline: "November 30 at 11:59 p.m. Central",
    percent: 50
};

function holidayIsActive(now = Date.now()) {
    return now < holiday.endsAt;
}

function money(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2
    }).format(value);
}

function assessmentDetails(data, promo, service) {
    const result = { ...data };
    delete result.promoCode;
    delete result.requestedPackage;
    const requestedPackage = packages.find((item) => item.slug === service);
    if (requestedPackage) result.requestedPackage = requestedPackage.slug;
    if (typeof promo === "string" && promo.trim().toUpperCase() === holiday.code && holidayIsActive()) {
        result.promoCode = holiday.code;
    }
    return result;
}

module.exports = { packages, holiday, holidayIsActive, money, assessmentDetails };
