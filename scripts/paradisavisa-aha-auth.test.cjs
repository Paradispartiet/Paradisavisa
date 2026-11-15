"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const authSource = fs.readFileSync(path.join(root, "paradisavisa-aha-auth.js"), "utf8");
const shared = fs.readFileSync(path.join(root, "header.html"), "utf8");
const front = fs.readFileSync(path.join(root, "index.html"), "utf8");
const bootstrap = fs.readFileSync(path.join(root, "script.js"), "utf8");

function fakeMenu() {
  const nodes = {};
  for (const key of ["guest", "member", "name", "message", "login", "signout"]) {
    nodes[key] = { hidden: false, disabled: false, textContent: "", href: "", handlers: {},
      addEventListener(event, handler) { this.handlers[event] = handler; } };
  }
  return {
    dataset: {},
    nodes,
    querySelector(selector) {
      const match = selector.match(/\[data-aha-([a-z]+)\]/);
      return nodes[match?.[1]] || null;
    }
  };
}

function environment() {
  const store = new Map([["aha_profile_id", "cached-id-without-auth"]]);
  const listener = {};
  const menu = fakeMenu();
  let getUserCount = 0, logoutCount = 0;
  let user = { id: "verified-user", user_metadata: { name: "Verifisert navn" } };
  const client = { auth: { async getUser() { getUserCount++; return { data: { user }, error: null }; } } };
  const context = {
    URL, URLSearchParams, Date, Promise, console,
    location: { origin: "https://paradispartiet.github.io", pathname: "/Paradisavisa/artikler/artikkel.html" },
    localStorage: { getItem(key) { return store.get(key) || null; } },
    document: { readyState: "loading", addEventListener(event, cb) { listener["document:" + event] = cb; },
      querySelectorAll() { return []; }, createElement() { throw Error("No new scripts should load with an injected Aha client"); } },
    addEventListener(event, cb) { listener[event] = cb; },
    AHADb: { getClient: () => client },
    AHAAuth: { async loadProfile(verified) {
      assert.equal(verified.id, "verified-user");
      return { ok: true, data: { display_name: "Profil fra Aha" } };
    }, async signOut() { logoutCount++; store.delete("sb-wshmybqyksrwkawqleiz-auth-token"); return { ok: true }; } }
  };
  context.window = context;
  vm.runInNewContext(authSource, context, { filename: "paradisavisa-aha-auth.js" });
  return { context, store, menu, client, listener, getUserCount: () => getUserCount,
    logoutCount: () => logoutCount, setUser(value) { user = value; } };
}

test("Aha-innlogging finnes i begge avisens toppmenyer", () => {
  for (const markup of [front, shared]) {
    assert.match(markup, /data-avisa-aha-menu/);
    assert.match(markup, /data-aha-login/);
    assert.match(markup, /Logg inn med Aha/);
    assert.match(markup, /data-aha-member hidden/);
    assert.match(markup, /data-aha-signout/);
    assert.match(markup, /History GO/);
  }
  assert.match(bootstrap, /paradisavisa-aha-auth\.js/);
  assert.match(bootstrap, /ParadisavisaAhaAuth\?\.onMenuOpen/);
});

test("Innlogging går gjennom Aha og tilbake til samme avisartikkel", () => {
  const h = environment();
  const u = new URL(h.context.ParadisavisaAhaAuth.loginUrl());
  assert.equal(u.origin, "https://paradispartiet.github.io");
  assert.equal(u.pathname, "/AHA-EchoNet/");
  assert.equal(u.searchParams.get("auth"), "login");
  assert.equal(u.searchParams.get("source"), "paradisavisa");
  assert.equal(u.searchParams.get("next"), "/Paradisavisa/artikler/artikkel.html");
});

test("Lokal cache alene gir aldri innlogget status eller SDK-henting", async () => {
  const h = environment();
  await h.context.ParadisavisaAhaAuth.refresh(h.menu);
  assert.equal(h.getUserCount(), 0);
  assert.equal(h.menu.nodes.guest.hidden, false);
  assert.equal(h.menu.nodes.member.hidden, true);
});

test("Bekreftet Supabase-bruker vises med Aha-profilnavnet", async () => {
  const h = environment();
  h.store.set("sb-wshmybqyksrwkawqleiz-auth-token", "test-token");
  await h.context.ParadisavisaAhaAuth.refresh(h.menu);
  assert.equal(h.getUserCount(), 1);
  assert.equal(h.menu.nodes.guest.hidden, true);
  assert.equal(h.menu.nodes.member.hidden, false);
  assert.equal(h.menu.nodes.name.textContent, "Profil fra Aha");
});

test("Anonym eller ugyldig Supabase-bruker er ikke innlogget", async () => {
  const h = environment();
  h.store.set("sb-wshmybqyksrwkawqleiz-auth-token", "stale");
  h.setUser({ id: "anon", is_anonymous: true });
  await h.context.ParadisavisaAhaAuth.refresh(h.menu);
  assert.equal(h.menu.nodes.member.hidden, true);
  assert.match(h.menu.nodes.message.textContent, /kunne ikke bekreftes/);
});

test("Utlogging bruker den eksisterende Aha Auth-funksjonen og oppdaterer menyen", async () => {
  const h = environment();
  h.store.set("sb-wshmybqyksrwkawqleiz-auth-token", "token");
  const header = { querySelector() { return h.menu; } };
  h.context.ParadisavisaAhaAuth.initMenu(header);
  await h.context.ParadisavisaAhaAuth.refresh(h.menu);
  await h.menu.nodes.signout.handlers.click();
  assert.equal(h.logoutCount(), 1);
  assert.equal(h.menu.nodes.guest.hidden, false);
  assert.equal(h.menu.nodes.member.hidden, true);
  assert.equal(h.store.has("sb-wshmybqyksrwkawqleiz-auth-token"), false);
});
