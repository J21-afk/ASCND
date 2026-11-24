const servicesNav = document.querySelector("#services-nav");
const servicesSummary = servicesNav.querySelector("summary");
const navigation = document.querySelector("#navigation");
const canHover = window.matchMedia("(min-width: 801px) and (hover: hover) and (pointer: fine)");

servicesNav.addEventListener("pointerenter", (event) => {
    if (canHover.matches && event.pointerType === "mouse") servicesNav.open = true;
});
servicesNav.addEventListener("pointerleave", (event) => {
    if (canHover.matches && event.pointerType === "mouse" && !servicesNav.contains(document.activeElement)) {
        servicesNav.open = false;
    }
});
document.addEventListener("click", (event) => {
    if (!servicesNav.contains(event.target) || event.target.closest(".services-panel a")) servicesNav.open = false;
});
navigation.addEventListener("focusout", (event) => {
    if (servicesNav.contains(event.target) && !servicesNav.contains(event.relatedTarget)) servicesNav.open = false;
});
navigation.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && servicesNav.open) {
        servicesNav.open = false;
        servicesSummary.focus();
    }
});
