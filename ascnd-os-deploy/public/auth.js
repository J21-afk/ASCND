(function () {
    "use strict";

    document.body.classList.add("os-auth-locked");

    const overlay = document.createElement("div");
    overlay.id = "ascndAuthOverlay";
    overlay.className = "ascnd-auth-overlay";
    overlay.innerHTML = `
      <form id="ascndLoginForm" class="ascnd-auth-card">
        <img src="/ascnd-shark-transparent.png" alt="ASCND" class="ascnd-auth-logo">
        <p class="ascnd-auth-eyebrow">ASCND SYSTEMS</p>
        <h1>CONTROL ROOM</h1>
        <p class="ascnd-auth-description">Sign in to access your operating system.</p>
        <label for="ascndLoginEmail">Email</label>
        <input id="ascndLoginEmail" type="email" autocomplete="username" required>
        <label for="ascndLoginPassword">Password</label>
        <input id="ascndLoginPassword" type="password" autocomplete="current-password" required>
        <button id="ascndLoginButton" type="submit">Sign in</button>
        <p id="ascndAuthMessage" role="status" aria-live="polite"></p>
      </form>`;
    document.body.appendChild(overlay);

    const form = document.getElementById("ascndLoginForm");
    const message = document.getElementById("ascndAuthMessage");
    const submit = document.getElementById("ascndLoginButton");
    const originalFetch = window.fetch.bind(window);
    let client = null;
    let session = null;
    let appLoaded = false;

    function say(text) {
        message.textContent = text;
    }

    function openDashboard(activeSession) {
        if (!activeSession || appLoaded) return;
        session = activeSession;

        window.fetch = function (input, init) {
            const url = typeof input === "string" ? input : input.url;
            const isApi = url.startsWith("/api/") ||
                url.startsWith(window.location.origin + "/api/");

            if (!isApi) return originalFetch(input, init);

            const headers = new Headers(
                input instanceof Request ? input.headers : undefined
            );
            if (init && init.headers) {
                new Headers(init.headers).forEach((value, key) => headers.set(key, value));
            }
            headers.set("Authorization", "Bearer " + session.access_token);

            return originalFetch(input, Object.assign({}, init || {}, { headers }));
        };

        document.body.classList.remove("os-auth-locked");
        overlay.remove();

        const signOut = document.createElement("button");
        signOut.type = "button";
        signOut.className = "ascnd-signout";
        signOut.textContent = "Sign out";
        signOut.addEventListener("click", async function () {
            await client.auth.signOut();
            window.location.reload();
        });
        const sidebarBottom = document.querySelector(".sidebar-bottom");
        if (sidebarBottom) {
            sidebarBottom.appendChild(signOut);
        } else {
            document.body.appendChild(signOut);
        }

        appLoaded = true;
        const script = document.createElement("script");
        script.src = "/app.js";
        script.onerror = () => {
            document.body.classList.add("os-auth-locked");
            say("The dashboard failed to load. Refresh and try again.");
        };
        document.body.appendChild(script);
    }

    async function verifySession(activeSession) {
        if (!activeSession) return;
        say("Verifying account access…");

        try {
            const response = await originalFetch("/api/status", {
                headers: { Authorization: "Bearer " + activeSession.access_token }
            });

            if (response.status === 403) {
                await client.auth.signOut();
                say("This account is not authorized to access ASCND Control.");
                return;
            }
            if (!response.ok) {
                say("Access could not be verified. Check the server configuration.");
                return;
            }
            openDashboard(activeSession);
        } catch {
            say("Unable to reach the server. Please try again.");
        }
    }

    async function initialize() {
        const config = window.ASCND_CONFIG || {};
        if (!config.supabaseUrl || !config.supabaseAnonKey) {
            say("Supabase configuration is missing. Configure the public Supabase key on the server.");
            return;
        }
        if (!window.supabase || !window.supabase.createClient) {
            say("The authentication library did not load. Check your connection.");
            return;
        }

        client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        client.auth.onAuthStateChange((_event, newSession) => {
            if (newSession) session = newSession;
        });

        const result = await client.auth.getSession();
        if (result.error) {
            say("Could not restore your session. Please sign in.");
            return;
        }
        if (result.data.session) await verifySession(result.data.session);
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!client) {
            say("Authentication is not configured yet.");
            return;
        }

        submit.disabled = true;
        say("Signing in…");
        try {
            const result = await client.auth.signInWithPassword({
                email: document.getElementById("ascndLoginEmail").value.trim(),
                password: document.getElementById("ascndLoginPassword").value
            });
            if (result.error || !result.data.session) {
                say("Sign-in failed. Check your email and password.");
                return;
            }
            await verifySession(result.data.session);
        } catch {
            say("Sign-in could not be completed. Please try again.");
        } finally {
            submit.disabled = false;
        }
    });

    initialize().catch(() => say("Authentication could not initialize. Refresh and try again."));
})();
