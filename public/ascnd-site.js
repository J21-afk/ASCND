const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const services = document.querySelector(".services-menu");

menu.hidden = false;
menu.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!expanded));
    if (expanded) services.open = false;
});
document.addEventListener("click", (event) => {
    if (!services.contains(event.target)) services.open = false;
});
nav.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (services.open) {
        services.open = false;
        services.querySelector("summary").focus();
    } else if (menu.getAttribute("aria-expanded") === "true") {
        menu.setAttribute("aria-expanded", "false");
        menu.focus();
    }
});

const poster = document.querySelector("#offer-poster");
if (poster && typeof poster.showModal === "function" && Date.now() < Number(poster.dataset.expires)) {
    const seenKey = "ascnd-holiday-2026-seen";
    let seen = false;
    try {
        seen = sessionStorage.getItem(seenKey) === "yes";
    } catch {}
    if (!seen) {
        poster.showModal();
        try {
            sessionStorage.setItem(seenKey, "yes");
        } catch {}
    }
}

const explorer = document.querySelector("#systems-explorer-frame");
if (explorer) {
    window.addEventListener("message", (event) => {
        if (event.origin !== location.origin || event.source !== explorer.contentWindow) return;
        if (event.data?.type !== "ascnd-explorer-height" || !Number.isFinite(event.data.height)) return;
        explorer.height = Math.min(4000, Math.max(450, Math.ceil(event.data.height)));
    });
}
