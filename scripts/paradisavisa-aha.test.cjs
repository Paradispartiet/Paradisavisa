"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "..", "paradisavisa-aha.js"), "utf8");
const mainScript = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
function harness() {
  const store = new Map(), buttons = {}, listeners = {};
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
    head: { appendChild() {} },
    querySelector(q) { return selectors[q] || null; },
    createElement(type) { return type === "section" ? section : { textContent: "" }; }
  };
  const ctx = { document, location: { origin: "https://paradispartiet.github.io", pathname: "/Paradisavisa/artikler/test.html", href: "https://paradispartiet.github.io/Paradisavisa/artikler/test.html" },
    URL, Date, innerHeight: 700, addEventListener(name, fn) { listeners[name] = fn; },
    localStorage: { getItem(k) { return store.get(k) || null; }, setItem(k, v) { store.set(k, v); } } };
  vm.runInNewContext(source, ctx, { filename: "paradisavisa-aha.js" });
  return { buttons, listeners, store, article, data: () => JSON.parse(store.get("aha_paradisavisa_library_v1") || "null") };
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
test("Avisen laster broen bare på artikkelsider", () => {
  assert.match(mainScript, /paradisavisa-aha\.js/);
  assert.match(mainScript, /artikler\|posts/);
  assert.doesNotMatch(source, /\bfetch\s*\(|sendBeacon|XMLHttpRequest|supabase|AHARepository/);
});