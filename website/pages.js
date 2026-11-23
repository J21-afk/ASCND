const { packages, holiday, holidayIsActive, money } = require("./catalog");

const siteName = "ASCND Systems";
const email = "contact@ascndsystems.com";
const assessment = "/assessment";
const salePrice = money(holiday.package.price * (1 - holiday.percent / 100));
const saleLink = `/assessment?package=connect&promo=${holiday.code}`;

function button(label, href, className = "") {
    return `<a class="button ${className}" href="${href}">${label}</a>`;
}

function serviceLink(item) {
    return `/services/${item.slug}`;
}

function price(item) {
    return item.price === null ? "Quoted by scope" : money(item.price);
}

function brand() {
    return `<a class="brand" href="/" aria-label="ASCND Systems home">
        <img src="/ascnd-shark-transparent.png" width="46" height="35" alt="">
        <span>ASCND<small>SYSTEMS</small></span>
    </a>`;
}

function offerStrip() {
    return `<div class="offer-strip"><a href="/investments#holiday-offer">
        <span>Holiday offer</span><strong>50% off ASCND Connect</strong><span class="strip-link">View offer</span>
    </a></div>`;
}

function offerPoster() {
    return `<dialog class="offer-poster" id="offer-poster" aria-label="ASCND Connect holiday offer" data-expires="${holiday.endsAt}">
        <form method="dialog"><button class="poster-close" aria-label="Close holiday offer" autofocus>×</button></form>
        <img src="/holiday-connect-poster.webp" width="720" height="900" alt="ASCND Systems holiday offer. 50% off ASCND Connect, website and digital foundation. Code HOLIDAY.">
        <div class="poster-action">
            ${button(`Request Connect for ${salePrice}`, saleLink, "button-primary")}
            <a href="/investments#holiday-offer">See offer details</a>
        </div>
    </dialog>`;
}

function navLink(label, href, current) {
    return `<a href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a>`;
}

function layout(page, content, current, sale) {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${page.title} | ${siteName}</title>
    <meta name="description" content="${page.description}">
    <meta name="theme-color" content="#071b25">
    <link rel="icon" href="/ascnd-shark-transparent.png">
    <link rel="stylesheet" href="/ascnd-site.css">
    <script defer src="/ascnd-site.js"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-DDVLG3ECP6"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-DDVLG3ECP6');</script>
</head>
<body>
    <a class="skip" href="#main">Skip to content</a>
    ${sale ? offerStrip() : ""}
    <header class="site-header">
        <div class="wrap header-inner">
            ${brand()}
            <button type="button" class="menu-toggle" aria-controls="site-nav" aria-expanded="false" hidden>Menu</button>
            <nav id="site-nav" aria-label="Main navigation">
                ${navLink("Home", "/", current === "home")}
                ${navLink("About", "/about", current === "about")}
                <details class="services-menu">
                    <summary${current === "services" ? ' class="active"' : ""}>Services</summary>
                    <div class="services-dropdown">
                        <a class="all-services" href="/services">All services</a>
                        ${packages.map((item) => `<a href="${serviceLink(item)}"><strong>${item.name}</strong><span>${item.category}</span></a>`).join("")}
                    </div>
                </details>
                ${navLink("Investments", "/investments", current === "investments")}
                ${navLink("Contact", "/contact", current === "contact")}
            </nav>
            ${button("Start an assessment", assessment, "header-cta")}
        </div>
    </header>
    <main id="main">${content}</main>
    <footer class="site-footer"><div class="wrap footer-inner">
        ${brand()}
        <p>Based in San Antonio, Texas</p>
        <div><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
        <small>© ${new Date().getFullYear()} ASCND Systems</small>
    </div></footer>
    ${sale && current === "home" ? offerPoster() : ""}
</body>
</html>`;
}

function serviceRows() {
    return `<ul class="service-rows">${packages.map((item) => `<li><a href="${serviceLink(item)}">
        <span class="row-name">${item.name}</span><span class="row-category">${item.category}</span><span class="row-action">Explore<span class="sr-only"> ${item.name}</span></span>
    </a></li>`).join("")}</ul>`;
}

function pageHead(label, headline, description) {
    return `<section class="subhero"><div class="wrap"><p class="eyebrow">${label}</p>
        <h1>${headline}</h1><p class="lead">${description}</p></div></section>`;
}

function home() {
    return `<section class="hero">
        <div class="wrap hero-inner">
            <p class="eyebrow">ASCND Systems · San Antonio, TX</p>
            <h1>A stronger<br>presence.<br><em>Less busywork.</em></h1>
            <p class="lead">We build websites, brands, and customer systems for service businesses that want to win work and stay on top of it.</p>
            <div class="actions">${button("Explore services", "/services", "button-primary")}${button("Assess your business", assessment)}</div>
        </div>
    </section>
    <section class="section section-light" id="solutions"><div class="wrap">
        <div class="split-heading"><h2>What could work better?</h2>
        <p>Give customers a clear next step, then make the work behind it easier to manage.</p></div>
        ${serviceRows()}
    </div></section>
    <section class="section ocean-story" id="about"><div class="wrap story-grid">
        <div><p class="eyebrow">Behind the work</p><h2>Built around how<br>you do business.</h2>
        <p>From a plumber taking quote requests to an installer juggling bookings, we start with what customers need and how your team handles the work.</p>
        ${button("About ASCND", "/about")}</div>
        <img src="/about-shark.jpg" alt="A great white shark rising through deep blue water" loading="lazy">
    </div></section>
    <section class="section section-light" id="investment"><div class="wrap split-heading">
        <h2>Find the right starting point.</h2><div><p>See package prices, what goes into your proposal, and how milestone payments work.</p>${button("See investments", "/investments", "button-dark")}</div>
    </div></section>
    <section class="section bottom-call" id="how"><div class="wrap split-heading">
        <h2>See how a system works.</h2><div><p>Walk through sample workflows for customer requests, quoting, onboarding, and follow-up.</p>${button("Explore workflow examples", "/services#systems-demo")}</div>
    </div></section>`;
}

function about() {
    return `${pageHead("About ASCND", "The work beneath the surface.", "ASCND Systems is a San Antonio studio building brands, websites, and customer workflows for service businesses.")}
    <section class="section ocean-story"><div class="wrap story-grid">
        <div><h2>Why the shark?</h2>
        <p>A great white’s breach is the moment you see. The positioning and work that made it possible happened beneath the surface. We bring that same attention to your business, from how customers find you to what happens after they reach out.</p>
        <p>We start by learning how you operate today, then build around where your team and customers could use a clearer next step.</p>
        ${button("Start an assessment", assessment, "button-primary")}</div>
        <img src="/about-shark.jpg" alt="A great white shark rising through deep blue water">
    </div></section>
    <section class="section section-light"><div class="wrap"><h2>How we work</h2>
        <div class="process-grid">
            <article><h3>Understand the business</h3><p>Tell us what you do, how inquiries arrive, and where the day gets held up.</p></article>
            <article><h3>Agree on the scope</h3><p>We define the package, deliverables, timeline, and any ongoing costs in a proposal.</p></article>
            <article><h3>Build and hand over</h3><p>We build around the agreed scope and walk you through how to use what we delivered.</p></article>
        </div>
    </div></section>`;
}

function services() {
    return `${pageHead("Services", "Make one part of the business work better.", "Choose a package based on what needs attention now. Each page explains what it helps you do and what’s included.")}
    <section class="section section-light"><div class="wrap">${serviceRows()}</div></section>
    <section class="section bottom-call" id="systems-demo"><div class="wrap">
        <div class="split-heading"><h2>See the workflow.</h2><p>Try sample scenarios for lead intake, quoting, onboarding, team coordination, and customer follow-up.</p></div>
        <details class="explorer"><summary>Open interactive examples</summary>
            <iframe src="/systems-explorer.html" title="Illustrative ASCND customer workflow examples" loading="lazy" height="1100" id="systems-explorer-frame"></iframe>
        </details>
    </div></section>`;
}

function service(item, sale) {
    const connectOffer = sale && item.slug === "connect";
    return `${pageHead(`${item.name} / ${item.category}`, item.headline, item.description)}
    <section class="section section-light"><div class="wrap detail-grid">
        <div><h2>What’s included</h2>
        <ul class="feature-list">${item.includes.map((feature) => `<li>${feature}</li>`).join("")}</ul>
        <a class="text-link" href="/services">Compare services</a></div>
        <aside class="price-card"><p class="eyebrow">Package investment</p>
            ${connectOffer ? `<p class="amount"><s>${price(item)}</s> ${salePrice}</p><p>Use code <strong>${holiday.code}</strong> through ${holiday.deadline}.</p>` : `<p class="amount">${price(item)}</p>`}
            <p>We confirm deliverables and any ongoing costs in your proposal.</p>
            ${button(`Request ${item.name}`, connectOffer ? saleLink : `/assessment?package=${item.slug}`, "button-dark")}
        </aside>
    </div></section>`;
}

function investments(sale) {
    return `${pageHead("Investments", "See what it costs to get started.", "Compare package prices, then tell us what you need so we can confirm your scope in writing.")}
    <section class="section section-light"><div class="wrap">
        ${sale ? `<aside class="sale-card" id="holiday-offer"><div><p class="eyebrow">Holiday offer · ASCND Connect</p><h2><s>${money(holiday.package.price)}</s> ${salePrice}</h2>
            <p>Use code <strong>${holiday.code}</strong> when requesting the standard ASCND Connect build by ${holiday.deadline}. Add-ons and recurring costs are quoted separately.</p></div>
            ${button("Request the holiday offer", saleLink, "button-primary")}</aside>` : ""}
        <dl class="investment-list">${packages.map((item) => `<div><dt><a href="${serviceLink(item)}">${item.name}</a><span>${item.category}</span></dt>
            <dd>${sale && item.slug === "connect" ? `<s>${price(item)}</s> <strong>${salePrice}</strong>` : price(item)}</dd></div>`).join("")}</dl>
    </div></section>
    <section class="section bottom-call"><div class="wrap split-heading"><h2>How payments work.</h2>
        <div><p>Your proposal lists deliverables, milestones, and any hosting, maintenance, or third-party costs. Eligible projects can be split into milestone payments. Invoices can be paid by card through Stripe.</p>${button("Discuss your project", assessment)}</div>
    </div></section>`;
}

function contact() {
    return `${pageHead("Contact", "What are you looking to improve?", "Tell us a little about your business and where you could use a hand.")}
    <section class="section section-light"><div class="wrap process-grid contact-grid">
        <article><h2>Discuss a project</h2><p>Use the business assessment to share what you do and what you’d like to build.</p>${button("Start an assessment", assessment, "button-dark")}</article>
        <article><h2>Get in touch</h2><p>For general questions, email us directly.</p><a class="text-link" href="mailto:${email}">${email}</a><p>San Antonio, Texas</p></article>
    </div></section>`;
}

function registerWebsite(app) {
    const pages = [
        ["/", "home", "Websites, brands & customer systems", "Websites, brands, and customer systems for service businesses in San Antonio, Texas.", home],
        ["/about", "about", "About", "Learn how ASCND Systems works and why the great white shark is part of our identity.", about],
        ["/services", "services", "Services", "Explore ASCND Systems packages for websites, branding, customer workflows, scheduling, and AI receptionists.", services],
        ["/investments", "investments", "Investments", "Compare ASCND Systems package prices, proposal details, and payment options.", investments],
        ["/contact", "contact", "Contact", "Start a business assessment or contact ASCND Systems in San Antonio, Texas.", contact]
    ];
    for (const [path, current, title, description, render] of pages) {
        app.get(path, (_req, res) => {
            const sale = holidayIsActive();
            res.set("Cache-Control", "no-cache").send(layout({ title, description }, render(sale), current, sale));
        });
    }
    app.get("/services/:slug", (req, res) => {
        const item = packages.find((entry) => entry.slug === req.params.slug);
        const sale = holidayIsActive();
        if (!item) {
            const page = { title: "Service not found", description: "Find an ASCND Systems package." };
            return res.status(404).send(layout(page, pageHead("Services", "Service not found.", 'View <a href="/services">all ASCND services</a>.'), "services", sale));
        }
        res.set("Cache-Control", "no-cache").send(layout(
            { title: item.name, description: item.description },
            service(item, sale),
            "services",
            sale
        ));
    });
}

module.exports = { registerWebsite };
