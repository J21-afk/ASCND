const examples = {
    start: {
        title: "A brand that looks like the same business everywhere.",
        caption: "A design study for a fictional landscaping company, showing how one identity can carry across print and digital.",
        display: `<div class="sample-brand"><div class="brand-board"><span>FIELD &amp; FORM</span><small>Landscaping &amp; outdoor care</small></div>
            <div class="brand-swatch swatch-moss">Moss</div><div class="brand-swatch swatch-stone">Stone</div><div class="brand-swatch swatch-clay">Clay</div></div>`
    },
    connect: {
        title: "Give visitors a clear way to request an estimate.",
        caption: "A sample service page takes a homeowner from understanding the job to knowing exactly how to reach the business.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>FIELD &amp; FORM</span><span>Services · Contact</span></div>
            <div class="sample-website"><strong>Bring your yard back to life.</strong><p>Landscape maintenance for San Antonio homes.</p><span class="sample-pill">Request an estimate</span></div></div>`
    },
    intelligence: {
        title: "See who needs a follow-up at a glance.",
        caption: "A sample lead workspace showing the status and next action for each inquiry.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>Customer workspace</span><span>Inquiries</span></div><ul class="sample-records">
            <li><span><strong>Backyard cleanup</strong><small>Review customer photos</small></span><span class="sample-tag">New</span></li>
            <li><span><strong>Monthly lawn care</strong><small>Follow up on Thursday</small></span><span class="sample-tag">Estimate sent</span></li>
            <li><span><strong>Front yard refresh</strong><small>Confirm kickoff details</small></span><span class="sample-tag">Approved</span></li></ul></div>`
    },
    coordinate: {
        title: "Make the handoff from quote to scheduled work clear.",
        caption: "A sample estimate workflow keeps the customer’s details and appointment in one place as the job moves forward.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>Backyard cleanup</span><span>Job timeline</span></div><ol class="sample-records sample-steps">
            <li><span><strong>Request received</strong><small>Address and site photos collected</small></span></li>
            <li><span><strong>Estimate approved</strong><small>Scope confirmed with customer</small></span></li>
            <li><span><strong>Visit scheduled</strong><small>Thursday · 10:00 a.m.</small></span></li></ol></div>`
    },
    "ai-receptionist": {
        title: "Give a caller a next step when your crew is on a job.",
        caption: "A sample call summary shows the information a receptionist can capture for your team, based on your agreed call flow.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>Incoming call</span><span>Example summary</span></div><dl class="sample-call">
            <div><dt>What they need</dt><dd>One-time yard cleanup</dd></div><div><dt>Where</dt><dd>San Antonio</dd></div>
            <div><dt>Next step</dt><dd>Team to call back and discuss an estimate.</dd></div></dl></div>`
    },
    custom: {
        title: "Connect the steps your team currently handles by hand.",
        caption: "An example of how intake, review, and scheduling could work together. Your integrations and handoffs are defined during scoping.",
        display: `<div class="sample-window"><div class="sample-toolbar"><span>Custom workflow</span><span>Example handoff</span></div>
            <ol class="sample-records sample-steps"><li><span><strong>Customer sends a request</strong><small>Project details collected once</small></span></li>
            <li><span><strong>Team reviews the details</strong><small>Assign an owner and confirm scope</small></span></li>
            <li><span><strong>Approved work moves to scheduling</strong><small>Give the customer a clear next step</small></span></li></ol></div>`
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
