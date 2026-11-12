/* Paradisavisa: AHA sign-in status in the existing top-right menu.
   Uses AHA's existing Supabase Auth modules; no newspaper-specific accounts. */
(function (global) {
  "use strict";

  const AHA_ROOT = "https://paradispartiet.github.io/AHA-EchoNet/";
  const AHA_LOGIN = new URL("?auth=login&source=paradisavisa", AHA_ROOT);
  const AUTH_TOKEN_KEY = "sb-wshmybqyksrwkawqleiz-auth-token"; // Same public AHA project as History Go.
  let clientPromise = null;
  const pending = new WeakMap();

  function hasAhaToken() {
    try { return Boolean(global.localStorage.getItem(AUTH_TOKEN_KEY)); }
    catch { return false; }
  }

  function menuOf(header) {
    return header?.querySelector?.("[data-avisa-aha-menu]") || null;
  }

  function getReturnPath() {
    const path = String(global.location.pathname || "");
    return path.startsWith("/Paradisavisa/") && !path.includes("\\")
      ? path
      : "/Paradisavisa/";
  }

  function loginUrl() {
    const url = new URL(AHA_LOGIN.href);
    url.searchParams.set("next", getReturnPath());
    return url.href;
  }

  function status(menu, message) {
    const mount = menu?.querySelector?.("[data-aha-message]");
    if (mount) mount.textContent = message || "";
  }

  function showGuest(menu, message = "") {
    const guest = menu?.querySelector?.("[data-aha-guest]");
    const member = menu?.querySelector?.("[data-aha-member]");
    if (guest) guest.hidden = false;
    if (member) member.hidden = true;
    status(menu, message);
  }

  function showMember(menu, name) {
    const guest = menu?.querySelector?.("[data-aha-guest]");
    const member = menu?.querySelector?.("[data-aha-member]");
    const label = menu?.querySelector?.("[data-aha-name]");
    if (guest) guest.hidden = true;
    if (member) member.hidden = false;
    if (label) label.textContent = String(name || "Min Aha-konto").trim().slice(0, 90);
    status(menu, "Innlogget med Aha. Samme konto som i History GO.");
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Aha-innloggingen kunne ikke lastes."));
      document.head.appendChild(script);
    });
  }

  async function getClient() {
    if (global.AHADb?.getClient && global.AHAAuth?.loadProfile) {
      const existing = global.AHADb.getClient();
      if (existing) return existing;
    }
    if (!clientPromise) {
      clientPromise = (async () => {
        await loadScript(new URL("js/ahaConfig.js", AHA_ROOT).href);
        if (!global.supabase?.createClient) {
          await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
        }
        await loadScript(new URL("js/ahaDb.js", AHA_ROOT).href);
        await loadScript(new URL("js/ahaAuth.js", AHA_ROOT).href);
        const client = global.AHADb?.getClient?.();
        if (!client) throw new Error("Aha Auth kunne ikke initialiseres.");
        return client;
      })().catch((error) => {
        clientPromise = null;
        throw error;
      });
    }
    return clientPromise;
  }

  async function refresh(menu) {
    if (!menu) return;
    const seq = (pending.get(menu) || 0) + 1;
    pending.set(menu, seq);
    const isCurrent = () => pending.get(menu) === seq;
    if (!hasAhaToken()) {
      if (isCurrent()) showGuest(menu);
      return;
    }
    status(menu, "Kontrollerer Aha-innlogging …");
    try {
      const client = await getClient();
      // A profile cache or localStorage token does not prove authentication.
      const { data, error } = await client.auth.getUser();
      if (!isCurrent()) return;
      if (error || !data?.user?.id || data.user.is_anonymous === true) {
        showGuest(menu, "Innloggingen kunne ikke bekreftes. Logg inn med Aha på nytt.");
        return;
      }
      const user = data.user;
      let profile = null;
      try {
        const readback = await global.AHAAuth.loadProfile(user);
        profile = readback?.ok ? readback.data : null;
      } catch {
        // A missing profile name is not a failed authenticated session.
      }
      if (!isCurrent()) return;
      const name = profile?.display_name || user.user_metadata?.full_name
        || user.user_metadata?.display_name || user.user_metadata?.name || "Min Aha-konto";
      showMember(menu, name);
    } catch {
      if (isCurrent()) showGuest(menu, "Kunne ikke hente innloggingsstatus. Prøv igjen.");
    }
  }

  async function signOut(menu, button) {
    if (!menu || !button || button.disabled) return;
    button.disabled = true;
    status(menu, "Logger ut fra Aha …");
    // Invalidate any in-flight user check before changing the menu.
    pending.set(menu, (pending.get(menu) || 0) + 1);
    try {
      const client = await getClient();
      if (!client) throw new Error("Ingen Aha-klient.");
      const result = await global.AHAAuth.signOut();
      if (!result?.ok) throw new Error(result?.error?.message || "Utlogging feilet.");
      showGuest(menu, "Logget ut fra Aha, History GO og Paradisavisa.");
    } catch {
      status(menu, "Kunne ikke logge ut. Prøv igjen.");
    } finally {
      button.disabled = false;
    }
  }

  function initMenu(header) {
    const menu = menuOf(header);
    if (!menu || menu.dataset.ahaAuthBound === "true") return;
    menu.dataset.ahaAuthBound = "true";
    const login = menu.querySelector("[data-aha-login]");
    if (login) login.href = loginUrl();
    const logout = menu.querySelector("[data-aha-signout]");
    if (logout) logout.addEventListener("click", () => signOut(menu, logout));
    showGuest(menu);
  }

  function onMenuOpen(header) {
    initMenu(header);
    refresh(menuOf(header));
  }

  function initAll() {
    document.querySelectorAll(".avis-topp").forEach(initMenu);
  }

  global.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    document.querySelectorAll(".avis-topp").forEach((header) => {
      if (!header.querySelector(".avisa-menu:not([hidden])")) return;
      refresh(menuOf(header));
    });
  });
  global.addEventListener("storage", (event) => {
    if (event.key !== AUTH_TOKEN_KEY) return;
    document.querySelectorAll(".avis-topp").forEach((header) => {
      if (!header.querySelector(".avisa-menu:not([hidden])")) return;
      refresh(menuOf(header));
    });
  });

  global.ParadisavisaAhaAuth = Object.freeze({ initMenu, onMenuOpen, refresh, loginUrl, getReturnPath });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})(window);