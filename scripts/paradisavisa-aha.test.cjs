"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "..", "paradisavisa-aha.js"), "utf8");
const mainScript = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
function harness(options = {}) {
  const store = new Map(), buttons = {}, listeners = {}, downloaded = [];
  if (options.owner) {
    store.set("aha_paradisavisa_cloud_owner_v1", options.owner);
    store.set("aha_paradisavisa_library_v1", JSON.stringify({
      version: 1, trackingEnabled: true, articles: [{
        id: "/Paradisavisa/artikler/test.html",
        url: "https://paradispartiet.github.io/Paradisavisa/artikler/test.html",
        title: "Privat fra første konto", savedAt: "2026-11-12T10:00:00Z"
      }]
    }));
  }
  if (options.preloaded) {
    store.set("aha_paradisavisa_library_v1", JSON.stringify({
      version: 1, trackingEnabled: false,
      articles: Array.from({ length: options.preloaded }, (_, i) => ({
        id: "/Paradisavisa/artikler/gammel-" + i + ".html",
        url: "https://paradispartiet.github.io/Paradisavisa/artikler/gammel-" + i + ".html",
        title: "Eldre lagret artikkel " + i,
        savedAt: "2026-11-11T10:00:00.000Z"
      }))
    }));
  }
  let currentUser = options.verifiedUserId || "";
  const article = { textContent: "Artikkel om Nationaltheatret og Gamle Munch. ", querySelector() { return null; }, getBoundingClientRect: () => ({ bottom: 1800 }) };
  const anchor = { insertAdjacentElement() {} };
  const main = { querySelector() { return anchor; }, insertBefore() {} };
  function makeButton(name) {
    return buttons[name] = { textContent: "", setAttribute() {}, addEventListener(name, fn) { this[name] = fn; } };
  }
  ["save", "read", "tracking", "export"].forEach(makeButton);
  const section = { className: "", setAttribute() {}, innerHTML: "",
    querySelector(selector) { return selector === ".av-aha-status" ? { textContent: "" } : buttons[selector.match(/data-aha="([^"]+)"/)?.[1]]; } };
  const selectors = {
    ".story-body, .av-artikkel, article": article,
    main, 'link[rel="canonical"]': { href: "https://paradispartiet.github.io/Paradisavisa/artikler/test.html" },
    h1: { textContent: "Testartikkel" },
    ".story-meta, .av-artikkel-meta, .story-ingress": anchor,
    ".story-kicker": { textContent: "Oslo · Kultur" }
  };
  const document = {
    addEventListener(name, fn) { listeners["document:" + name] = fn; },
    head: { appendChild() {} },
    body: { appendChild(node) { downloaded.push(node); } },
    querySelector(q) { return selectors[q] || null; },
    createElement(type) { return type === "section" ? section : type === "a" ? { click() { this.wasClicked = true; }, remove() {} } : { textContent: "" }; }
  };
  const ctx = { document, location: { origin: "https://paradispartiet.github.io", pathname: "/Paradisavisa/artikler/test.html", href: "https://paradispartiet.github.io/Paradisavisa/artikler/test.html" },
    URL, Date, Blob, setTimeout(fn) { fn(); }, innerHeight: 700, addEventListener(name, fn) { listeners[name] = fn; },
    localStorage: { getItem(k) { return store.get(k) || null; }, setItem(k, v) { store.set(k, v); } } };
  if (options.owner || options.verifiedUserId) {
    ctx.ParadisavisaAhaAuth = { async getVerifiedUserId() { return currentUser; } };
  }
  vm.runInNewContext(source, ctx, { filename: "paradisavisa-aha.js" });
  return { buttons, listeners, store, downloaded, article, setVerifiedUserId(id) { currentUser = id; },
    data: () => JSON.parse(store.get("aha_paradisavisa_library_v1") || "null") };
}

test("Ingen sporing skjer når en artikkel bare åpnes", () => {
  const h = harness();
  assert.equal(h.store.size, 0);
  assert.equal(h.buttons.tracking.textContent, "Aktiver lesehistorikk");
});
test("Lagre og markere lest er eksplisitte, reversible handlinger", () => {
  const h = harness();
  h.buttons.save.click();
  assert.equal(h.data().articles.length, 1);
  assert.ok(h.data().articles[0].savedAt);
  assert.equal(h.data().trackingEnabled, false);
  h.buttons.read.click();
  assert.ok(h.data().articles[0].readAt);
  h.buttons.read.click();
  assert.equal(h.data().articles[0].readAt, null);
  h.buttons.save.click();
  assert.equal(h.data().articles[0].savedAt, null);
});
test("Opt-in registrerer åpning; gjennomført lesing registreres ved slutten", () => {
  const h = harness();
  h.buttons.tracking.click();
  assert.equal(h.data().trackingEnabled, true);
  assert.equal(h.data().articles[0].openCount, 1);
  assert.equal(h.data().articles[0].readAt, undefined);
  h.article.getBoundingClientRect = () => ({ bottom: 100 });
  h.listeners.scroll();
  assert.ok(h.data().articles[0].readAt);
  h.buttons.tracking.click();
  assert.equal(h.data().trackingEnabled, false);
});
test("JSON-eksport krever lagret materiale og gir en lokal fil", () => {
  const h = harness();
  h.buttons.export.click();
  assert.equal(h.downloaded.length, 0);
  h.buttons.save.click();
  h.buttons.export.click();
  assert.equal(h.downloaded.length, 1);
  assert.equal(h.downloaded[0].download, "paradisavisa-til-aha.json");
  assert.equal(h.downloaded[0].wasClicked, true);
});

test("Eierbundet leselogg kan ikke sees eller endres fra en annen konto", async () => {
  const firstUser = "11111111-1111-4111-8111-111111111111";
  const h = harness({ owner: firstUser, verifiedUserId: "22222222-2222-4222-8222-222222222222" });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(h.buttons.save.disabled, true);
  assert.equal(h.buttons.tracking.disabled, true);
  assert.equal(h.buttons.export.disabled, true);
  const unchanged = JSON.stringify(h.data());
  h.buttons.save.click();
  h.buttons.tracking.click();
  assert.equal(JSON.stringify(h.data()), unchanged, "Annen konto må ikke endre eller aktivere leselogg");
  assert.equal(h.downloaded.length, 0);
});
test("Samme Aha-konto låser opp, og kontobytte låser historikken på nytt", async () => {
  const owner = "11111111-1111-4111-8111-111111111111";
  const h = harness({ owner, verifiedUserId: owner });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(h.buttons.save.disabled, false);
  h.setVerifiedUserId("");
  h.listeners["document:paradisavisa:aha-account-changed"]();
  assert.equal(h.buttons.save.disabled, true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(h.buttons.save.disabled, true);
});
test("an article opened as a guest locks immediately when another tab binds its library to an account", async () => {
  const owner = "11111111-1111-4111-8111-111111111111";
  const h = harness({ verifiedUserId: owner });
  assert.equal(h.buttons.save.disabled, false);
  h.store.set("aha_paradisavisa_cloud_owner_v1", owner);
  h.listeners.storage({ key: "aha_paradisavisa_cloud_owner_v1" });
  assert.equal(h.buttons.save.disabled, true, "Owner claim should lock controls during verification");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.buttons.save.disabled, false, "Only verified owner unlocks");
  h.setVerifiedUserId("");
  h.listeners.storage({ key: "sb-wshmybqyksrwkawqleiz-auth-token" });
  assert.equal(h.buttons.save.disabled, true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.buttons.save.disabled, true);
});

test("Lagring av artikkel nummer 5001 bevarer alle eksisterende lagrede artikler", () => {
  const h = harness({ preloaded: 5000 });
  const original = h.store.get("aha_paradisavisa_library_v1");
  h.buttons.save.click();
  assert.equal(h.store.get("aha_paradisavisa_library_v1"), original);
  assert.equal(h.data().articles.length, 5000);
  assert.ok(h.data().articles.some(item => item.id === "/Paradisavisa/artikler/gammel-0.html"));
  assert.equal(h.data().articles.some(item => item.id === "/Paradisavisa/artikler/test.html"), false);
});

test("Avisen laster broen bare på artikkelsider", () => {
  assert.match(mainScript, /paradisavisa-aha\.js/);
  assert.match(mainScript, /artikler\|posts/);
  assert.doesNotMatch(source, /\bfetch\s*\(|sendBeacon|XMLHttpRequest|supabase|AHARepository/);
});