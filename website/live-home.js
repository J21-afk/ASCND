const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { packages, holiday, holidayIsActive, money } = require("./catalog");

const { faq } = require("./faq");

const template = readFileSync(join(__dirname, "../public/home-new.html"), "utf8");
const paths = {
    "/": ["home", "ASCND Systems"],
    "/solutions": ["solutions", "Solutions | ASCND Systems"],
    "/about": ["about", "About Us | ASCND Systems"],
    "/plans": ["plans", "Plans & Pricing | ASCND Systems"],
    "/contact": ["contact", "Contact | ASCND Systems"]
};
const pageSections = new Map([...template.matchAll(/<!-- PAGE: (\w+) -->([\s\S]*?)(?=<!-- PAGE:|<!-- END PAGES -->)/g)].map(([,page,html]) => [page, html.trim()]));
const services = {
    start: ["Customer attraction", "Use the same logo, colors, and type on your website, estimate documents, and social profiles.", "A renovation studio uses one visual identity across its portfolio, proposals, and vehicle graphics.", "Homeowners can recognize the business wherever they encounter it."],
    connect: ["Customer attraction & inquiries", "Show your work, explain your services, and give visitors a clear way to request a consultation.", "A design-build studio showcases a kitchen renovation, then asks interested homeowners for their project type, location, and timing.", "You get a more useful first inquiry to work from."],
    intelligence: ["Lead management & customer engagement", "Give each inquiry a record, an owner, a status, and a next step your team can see.", "A remodel inquiry goes from new to walkthrough booked, with a follow-up reminder after the proposal goes out.", "You can spot who is waiting on a reply and which jobs need attention."],
    coordinate: ["Team management & scheduling", "Collect job details, assign the next action, and track estimates and scheduling from one workflow.", "The office collects photos, assigns a site visit, and flags approved work for scheduling.", "Your team knows who owns the next step and which jobs are ready to book."],
    "ai-receptionist": ["Call flows & customer intake", "Set rules for answering common questions, collecting caller details, and routing calls to your team where supported.", "An after-hours caller asks about a remodel. The receptionist captures their project type, ZIP code, and callback number so your team can follow up.", "Callers get a clear next step while your team is on a job or away from the phone."],
    custom: ["Custom workflows & integrations", "Map the tools and handoffs you already use, then build around a specific bottleneck.", "An approved estimate creates a scheduling task and sends the project details to the person coordinating the job.", "Your team spends less time re-entering information and checking whether it reached the right person."]
};

function requestLink(slug, sale) {
    const params = new URLSearchParams();
    if (slug) params.set("package", slug);
    if (sale) params.set("promo", holiday.code);
    return params.size ? `/assessment?${params.toString().replaceAll("&", "&amp;")}` : "/assessment";
}

const packageGroups = [
    { id: "attract", label: "Attract customers", packages: ["start", "connect"], example: ["Find your business", "See examples of your work", "Request a consultation"] },
    { id: "manage", label: "Manage leads & jobs", packages: ["intelligence", "coordinate"], example: ["Receive a project inquiry", "Assign the next step", "Schedule a site visit"] },
    { id: "automate", label: "Handle calls & connect tools", packages: ["ai-receptionist", "custom"], example: ["Capture the caller’s details", "Send them to the right person", "Create a follow-up task"] }
];

function renderPricing(sale) {
    return `<div class="pricing-browser" id="pricing-browser">
        <nav class="pricing-filters" aria-label="Package categories">${packageGroups.map(({id,label}) =>
            `<a href="#plans-${id}">${label}</a>`).join("")}</nav>
        ${packageGroups.map(({id,label,packages: slugs,example}) => `<section class="pricing-group" id="plans-${id}">
            <div class="pricing-group-head"><h2>${label}</h2>
                <div class="pricing-flow"><p>Example workflow</p><ol>${example.map(step => `<li>${step}</li>`).join("")}</ol></div>
            </div>
            <div class="package-grid">${slugs.map(slug => {
                const {name, price, category, headline, includes} = packages.find(item => item.slug === slug);
                const amount = price === null ? "Quoted by scope" : (sale
                    ? `<s aria-label="Regular price ${money(price)}">${money(price)}</s> <strong>${money(price * (1 - holiday.percent / 100))}</strong>`
                    : `<strong>${money(price)}</strong>`);
                const note = price === null ? (sale ? "50% off the agreed service fee with HOLIDAY" : "Project fee confirmed in your proposal")
                    : (sale ? "Project fee with HOLIDAY" : "Project fee");
                return `<article class="package-card" id="price-${slug}">
    <header><p class="package-category">${category.replaceAll("&", "&amp;")}</p><h3>${name}</h3><p>${headline}</p></header>
    <div class="package-cost"><p class="package-amount">${amount}</p><p>${note}</p></div>
    <a class="button primary package-cta" href="${requestLink(slug, sale)}">Discuss ${name}</a>
    <div class="package-includes"><h4>What’s included</h4><ul>${includes.map(feature => `<li>${feature}</li>`).join("")}</ul></div>
    <a class="package-service-link" href="/solutions#service-${slug}">See how it works</a>
</article>`;
            }).join("")}</div>
        </section>`).join("")}
    </div>`;
}

function renderHome(now = Date.now(), pathname = "/") {
    const sale = holidayIsActive(now);
    const [page, title] = paths[pathname];
    const menu = `<div><p>What we offer</p>${packages.map(({slug, name}) =>
        `<a href="/solutions#service-${slug}">${name}</a>`).join("")}</div>
<div><p>By business need</p>
    <a href="/solutions#service-coordinate">Manage your team</a>
    <a href="/solutions#service-connect">Attract customers</a>
    <a href="/solutions#service-intelligence">Engage customers &amp; follow up</a>
    <a href="/solutions#service-ai-receptionist">Call flows &amp; intake</a>
    <a href="/solutions#service-custom">Connect your tools</a>
</div>`;
    const details = packages.map(({slug, name, includes}) => {
        const [category, workflow, example, benefit] = services[slug];
        return `<details class="offer-service" id="service-${slug}">
    <summary><span><small>${category}</small><strong>${name}</strong></span><span class="service-expand" aria-hidden="true"></span></summary>
    <div class="offer-service-body">
        <div><h3>How it works</h3><p>${workflow}</p><ul>${includes.map(feature => `<li>${feature}</li>`).join("")}</ul></div>
        <div><h3>Example in your operation</h3><p>${example}</p><h3>What it helps you do</h3><p>${benefit}</p></div>
        <div class="service-actions"><a class="button primary" href="${requestLink(slug, sale)}">Discuss this service</a><a class="button text" href="/plans#price-${slug}">See pricing</a></div>
    </div>
</details>`;
    }).join("");
    const pricing = renderPricing(sale);
    const banner = sale ? `<aside class="black-friday-strip"><a href="/plans#black-friday-offer"><strong>Black Friday · 50% off any service</strong><span>Code <b>${holiday.code}</b></span><span class="promo-strip-link">View offer</span></a></aside>` : "";
    const offer = sale ? `<aside id="black-friday-offer" class="black-friday-offer">
    <div><h3>50% off any ASCND service</h3><p>Enter <strong>${holiday.code}</strong> when you submit your business assessment by ${holiday.deadline}. The discount applies to the agreed service fee, including custom projects. Ongoing hosting, usage, and third-party costs are quoted separately.</p></div>
    <a class="button primary" href="${requestLink(null, true)}">Request the offer</a>
</aside>` : "";
    const recommendation = `<section class="section recommendation" id="recommendation">
    <div><h2>Not sure what you need?</h2><p>Find a plan that fits your business.</p>
    <p>Tell us what you do, what’s slowing you down, and what you’d like to improve. We’ll use your answers to recommend where to start.</p></div>
    <div class="actions"><a class="button primary" href="${requestLink(null, sale)}">Get a recommendation</a><a class="button text" href="/contact">Get in contact</a></div>
</section>`;
    const entries = faq.filter(item => sale || !item.phrases.includes("black friday"));
    const common = entries.filter(item => item.common).map(({question,answer,url}) => `<details class="offer-service">
        <summary>${question}<span class="service-expand" aria-hidden="true"></span></summary>
        <div class="faq-copy"><p>${answer}</p><a href="${url.replaceAll("&", "&amp;")}">See related details</a></div>
    </details>`).join("");
    const faqData = JSON.stringify(entries).replaceAll("<", "\\u003c");
    return template
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${title.replaceAll("&", "&amp;")}</title>`)
        .replace(/<!-- PAGE: home -->[\s\S]*?<!-- END PAGES -->/, () => pageSections.get(page))
        .replace(`<a href="${pathname}">`, `<a href="${pathname}" aria-current="page">`)
        .replace("<!-- RECOMMENDATION -->", recommendation)
        .replace("<!-- COMMON_FAQS -->", `${common}<script id="ascnd-faq-data" type="application/json">${faqData}</script>`)
        .replace("<!-- BLACK_FRIDAY_BANNER -->", banner)
        .replace("<!-- SERVICE_MENU -->", menu)
        .replace("<!-- SERVICE_DETAILS -->", details)
        .replace("<!-- BLACK_FRIDAY_OFFER -->", offer)
        .replace("<!-- SERVICE_PRICING -->", pricing);
}

module.exports = { renderHome, paths };
