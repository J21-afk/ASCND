const pricingBrowser = document.getElementById("pricing-browser");
if (pricingBrowser) {
    const groups = [...pricingBrowser.querySelectorAll(".pricing-group")];
    const filters = [...pricingBrowser.querySelectorAll(".pricing-filters a")];

    function selectGroup(group) {
        for (const panel of groups) panel.hidden = panel !== group;
        for (const link of filters) {
            if (link.hash === `#${group.id}`) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        }
    }

    function applyHash() {
        const target = document.getElementById(location.hash.slice(1));
        const group = target?.closest(".pricing-group");
        if (!group) return false;
        const wasHidden = group.hidden;
        selectGroup(group);
        if (wasHidden || target !== group) target.scrollIntoView({block:"start"});
        return true;
    }

    if (!applyHash()) selectGroup(groups[0]);
    window.addEventListener("hashchange", applyHash);
    for (const filter of filters) {
        filter.addEventListener("click", (event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            selectGroup(document.getElementById(filter.hash.slice(1)));
            history.replaceState(null, "", filter.hash);
        });
    }
}
