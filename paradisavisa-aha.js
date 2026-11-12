/* Paradisavisa → AHA: lokal, samtykkestyrt lesebro. Ingen nettverk eller analyse. */
(() => {
  "use strict";
  const KEY = "aha_paradisavisa_library_v1";
  const AHA_URL = new URL("/AHA-EchoNet/paradisavisa.html", location.origin).href;
  const article = document.querySelector(".story-body, .av-artikkel, article");
  const main = document.querySelector("main");
  if (!article || !main || !/\/(?:artikler|posts)\/[^/]+\.html$/i.test(location.pathname)) return;

  const canonical = document.querySelector('link[rel="canonical"]')?.href || location.href;
  let url;
  try { url = new URL(canonical); } catch { return; }
  if (url.origin !== location.origin || !/\/Paradisavisa\/(?:artikler|posts)\//.test(url.pathname)) return;
  const id = url.pathname;
  const title = (document.querySelector("h1")?.textContent || document.title.split("|")[0] || "").trim().slice(0, 250);
  if (!title) return;
  const meta = (selector) => document.querySelector(selector)?.content?.trim() || "";
  const summary = (meta('meta[name="description"]') || document.querySelector(".story-ingress, .av-ingress")?.textContent || "").trim().slice(0, 700);
  const category = (meta('meta[property="article:section"]') || document.querySelector(".story-kicker")?.textContent?.split(/[·•]/)[1] || "Ukjent").trim().slice(0, 80);
  const publishedAt = (meta('meta[property="article:published_time"]') || document.querySelector('time[datetime]')?.getAttribute("datetime") || "").slice(0, 30);
  const excerpt = (article.querySelector(".av-prosa") || article).textContent.replace(/\s+/g, " ").trim().slice(0, 1100);
  const dateNow = () => new Date().toISOString();
  const empty = () => ({ version: 1, trackingEnabled: false, articles: [] });
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      if (value?.version !== 1 || !Array.isArray(value.articles)) return empty();
      return { version: 1, trackingEnabled: value.trackingEnabled === true, articles: value.articles };
    } catch { return empty(); }
  };
  const write = (data) => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch { setStatus("Kunne ikke lagre lokalt. Kontroller nettleserens lagringsinnstillinger."); return false; }
  };
  const snapshot = () => ({ id, url: url.href, title, summary, category, publishedAt, excerpt, source: "paradisavisa", local_only: true });
  const upsert = (field, value, countVisit = false) => {
    const data = read();
    const previous = data.articles.find((item) => item?.id === id);
    const next = { ...snapshot(), ...previous, ...snapshot(), [field]: value };
    if (countVisit) next.openCount = (Number(previous?.openCount) || 0) + 1;
    if (!previous) data.articles.push(next);
    else data.articles[data.articles.indexOf(previous)] = next;
    if (data.articles.length > 5000) data.articles = data.articles.slice(-5000);
    const success = write(data);
    if (success) syncUi();
    return success;
  };

  const section = document.createElement("section");
  section.className = "av-aha-bridge";
  section.setAttribute("aria-label", "Samle artikkelen i AHA");
  section.innerHTML = '<strong>Aha · Bygg kunnskap av det du leser</strong><p class="av-aha-description">Lagre artikkelen privat, eller merk den som lest. Du bestemmer om framtidig lesing skal registreres.</p><div class="av-aha-actions"><button type="button" data-aha="save">Lagre i Aha</button><button type="button" data-aha="read">Merk som lest</button><button type="button" data-aha="tracking">Aktiver lesehistorikk</button><a data-aha="open" href="' + AHA_URL + '">Mitt artikkelbibliotek i Aha</a></div><p class="av-aha-status" role="status" aria-live="polite"></p>';
  const style = document.createElement("style");
  style.textContent = '.av-aha-bridge{box-sizing:border-box;margin:1.5rem 0 2.5rem;padding:1.1rem;border:1px solid #525252;border-radius:12px;background:#111;color:#f5f5f5;font:400 14px/1.5 system-ui,sans-serif}.av-aha-bridge strong{display:block;color:white;font-size:1rem}.av-aha-bridge p{color:#cecece;margin:.4rem 0 .8rem}.av-aha-actions{display:flex;gap:.5rem;flex-wrap:wrap}.av-aha-actions button,.av-aha-actions a{font:600 13px/1.3 system-ui,sans-serif;text-decoration:none;color:#fff;background:#242424;border:1px solid #777;border-radius:7px;padding:.65rem .85rem;cursor:pointer}.av-aha-actions button:focus-visible,.av-aha-actions a:focus-visible{outline:2px solid #8bb9ff;outline-offset:3px}.av-aha-actions button[aria-pressed="true"]{border-color:#a5cbff;background:#223347}.av-aha-status{min-height:1.2em}';
  document.head.appendChild(style);
  const anchor = main.querySelector(".story-meta, .av-artikkel-meta, .story-ingress");
  if (anchor) anchor.insertAdjacentElement("afterend", section);
  else main.insertBefore(section, article);
  const status = section.querySelector(".av-aha-status");
  const buttons = (key) => section.querySelector('[data-aha="' + key + '"]');
  function setStatus(message) { if (status) status.textContent = message; }
  function syncUi() {
    const data = read();
    const item = data.articles.find((entry) => entry?.id === id);
    buttons("save").textContent = item?.savedAt ? "Lagret i Aha ✓" : "Lagre i Aha";
    buttons("save").setAttribute("aria-pressed", String(Boolean(item?.savedAt)));
    buttons("read").textContent = item?.readAt ? "Lest ✓" : "Merk som lest";
    buttons("read").setAttribute("aria-pressed", String(Boolean(item?.readAt)));
    buttons("tracking").textContent = data.trackingEnabled ? "Slå av lesehistorikk" : "Aktiver lesehistorikk";
    buttons("tracking").setAttribute("aria-pressed", String(data.trackingEnabled));
  }
  buttons("save").addEventListener("click", () => {
    const existing = read().articles.find((item) => item.id === id);
    if (upsert("savedAt", existing?.savedAt ? null : dateNow())) setStatus(existing?.savedAt ? "Fjernet fra lagrede artikler." : "Artikkelen er lagret privat i Aha-biblioteket.");
  });
  buttons("read").addEventListener("click", () => {
    const existing = read().articles.find((item) => item.id === id);
    if (upsert("readAt", existing?.readAt ? null : dateNow())) setStatus(existing?.readAt ? "Markeringen som lest er fjernet." : "Artikkelen er markert som lest.");
  });
  buttons("tracking").addEventListener("click", () => {
    const data = read();
    data.trackingEnabled = !data.trackingEnabled;
    if (write(data)) {
      syncUi();
      setStatus(data.trackingEnabled ? "Lesehistorikk er på, kun i denne nettleseren. Artikler blir markert lest når du kommer til slutten." : "Automatisk lesehistorikk er slått av. Eksisterende historikk er beholdt og kan slettes i Aha.");
      if (data.trackingEnabled) recordVisit();
    }
  });
  let visitRecorded = false;
  function recordVisit() {
    if (visitRecorded || !read().trackingEnabled) return;
    visitRecorded = upsert("openedAt", dateNow(), true);
  }
  function checkReading() {
    const data = read();
    if (!data.trackingEnabled) return;
    const bottom = article.getBoundingClientRect().bottom;
    if (bottom < innerHeight + 70) {
      const existing = data.articles.find((item) => item.id === id);
      if (!existing?.readAt) {
        if (upsert("readAt", dateNow())) setStatus("Artikkelen er nå markert som lest i Aha.");
      }
    }
  }
  syncUi();
  recordVisit();
  addEventListener("scroll", checkReading, { passive: true });
  checkReading();
})();