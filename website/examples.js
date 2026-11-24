const examples = {
    start: {
        title: "A brand that looks like the same business everywhere.",
        caption: "An identity study for Alder &amp; Vale, a fictional residential design-build studio.",
        display: `<div class="sample-brand"><div class="brand-board"><span>ALDER &amp; VALE</span><small>Residential design-build</small></div>
            <div class="brand-swatch swatch-moss">Moss</div><div class="brand-swatch swatch-stone">Stone</div><div class="brand-swatch swatch-clay">Clay</div></div>`
    },
    connect: {
        title: "Turn portfolio visits into project inquiries.",
        caption: "A sample website for a residential design-build studio pairs project photography with a clear consultation request.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>ALDER &amp; VALE</span><span>Projects · Contact</span></div>
            <div class="sample-website"><img src="/ascnd-sample-renovation.webp" width="800" height="460" alt="Illustrative kitchen renovation with walnut cabinetry and a stone island" loading="lazy"><strong>Custom renovations, built around how you live.</strong><p>Kitchens, additions, and whole-home renovations in San Antonio.</p><span class="sample-pill">Request a consultation</span></div></div>`
    },
    intelligence: {
        title: "See who needs a follow-up at a glance.",
        caption: "A sample lead workspace showing the status and next action for each inquiry.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>Customer workspace</span><span>Inquiries</span></div><ul class="sample-records">
            <li><span><strong>Kitchen renovation</strong><small>Review photos and project brief</small></span><span class="sample-tag">New</span></li>
            <li><span><strong>Primary suite addition</strong><small>Follow up on Thursday</small></span><span class="sample-tag">Estimate sent</span></li>
            <li><span><strong>Whole-home remodel</strong><small>Confirm kickoff details</small></span><span class="sample-tag">Approved</span></li></ul></div>`
    },
    coordinate: {
        title: "Make the handoff from quote to scheduled work clear.",
        caption: "A sample renovation workflow keeps the site walkthrough and proposal together, from the first inquiry to project kickoff.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>Kitchen renovation</span><span>Job timeline</span></div><ol class="sample-records sample-steps">
            <li><span><strong>Project brief received</strong><small>Floor plan and existing photos collected</small></span></li>
            <li><span><strong>Site walkthrough scheduled</strong><small>Thursday · 10:00 a.m.</small></span></li>
            <li><span><strong>Proposal approved</strong><small>Confirm project kickoff</small></span></li></ol></div>`
    },
    "ai-receptionist": {
        title: "Give a caller a next step when your crew is on a job.",
        caption: "A sample call summary shows the information a receptionist can capture for your team, based on your agreed call flow.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>Incoming call</span><span>Example summary</span></div><dl class="sample-call">
            <div><dt>What they need</dt><dd>Kitchen and main-floor renovation</dd></div><div><dt>Where</dt><dd>San Antonio</dd></div>
            <div><dt>Next step</dt><dd>Design team to follow up about a consultation.</dd></div></dl></div>`
    },
    custom: {
        title: "Connect the steps your team currently handles by hand.",
        caption: "An example of how intake, review, and scheduling could work together. Your integrations and handoffs are defined during scoping.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>Custom workflow</span><span>Example handoff</span></div>
            <ol class="sample-records sample-steps"><li><span><strong>Homeowner submits a project brief</strong><small>Scope, photos, and desired timing collected</small></span></li>
            <li><span><strong>Team reviews the details</strong><small>Confirm project fit and assign a lead</small></span></li>
            <li><span><strong>Qualified inquiry moves to consultation</strong><small>Offer dates for a site walkthrough</small></span></li></ol></div>`
    }
};

function serviceExample(item) {
    const example = examples[item.slug];
    return `<figure class="service-example">
        ${example.display}
        <figcaption><strong>${example.title}</strong><span>${example.caption}</span></figcaption>
    </figure>`;
}

module.exports = { serviceExample };
