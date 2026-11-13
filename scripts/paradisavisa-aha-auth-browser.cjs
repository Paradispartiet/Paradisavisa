/* Real newspaper DOM on mobile/desktop. AHA user is mocked only at the SDK boundary;
   this does not claim a real Supabase OAuth login or physical Safari verification. */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const tokenKey = "sb-wshmybqyksrwkawqleiz-auth-token";
const mime = { ".html": "text/html;charset=utf-8", ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8", ".json": "application/json;charset=utf-8" };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400); res.end(); return; }
  let file = path.resolve(root, "." + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403); res.end(); return; }
  if (file === root) file = path.join(root, "index.html");
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("Mangler"); return; }
    res.writeHead(200, { "Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
});

async function main() {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 900 }]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.route("https://fonts.googleapis.com/**", route => route.abort());
      await page.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => Boolean(window.ParadisavisaAhaAuth));
      const toggle = page.locator(".avis-masthead .nav-toggle");
      await toggle.click();
      const login = page.locator(".avis-masthead [data-aha-login]");
      await login.waitFor({ state: "visible" });
      assert.match(await login.textContent(), /Logg inn med Aha/);
      assert.equal((await toggle.getAttribute("aria-expanded")), "true");
      const rect = await page.locator(".avis-masthead [data-avisa-aha-menu]").boundingBox();
      assert.ok(rect.x >= -1 && rect.x + rect.width <= viewport.width + 1,
        "The account section must fit a " + viewport.width + "px viewport");
      await page.keyboard.press("Escape");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");

      await page.goto(base + "/artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => Boolean(document.querySelector(".avisa-shared-header")));
      await page.waitForFunction(() => Boolean(window.ParadisavisaAhaAuth));
      await page.locator(".avisa-shared-header .nav-toggle").click();
      await page.locator(".avisa-shared-header [data-aha-login]").waitFor({ state: "visible" });
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(key => {
      localStorage.setItem(key, "mock-auth-token");
      window.AHADb = { getClient: () => ({ auth: { getUser: async () => ({
        data: { user: { id: "confirmed", is_anonymous: false } }, error: null }) } }) };
      window.AHAAuth = {
        loadProfile: async () => ({ ok: true, data: { display_name: "Aha-testprofil" } }),
        signOut: async () => { localStorage.removeItem(key); return { ok: true }; }
      };
    }, tokenKey);
    const page = await context.newPage();
    await page.route("https://fonts.googleapis.com/**", route => route.abort());
    await page.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.ParadisavisaAhaAuth));
    await page.locator(".avis-masthead .nav-toggle").click();
    const member = page.locator(".avis-masthead [data-aha-member]");
    await member.waitFor({ state: "visible" });
    assert.match(await member.textContent(), /Aha-testprofil/);
    await member.locator("[data-aha-signout]").click();
    await page.locator(".avis-masthead [data-aha-login]").waitFor({ state: "visible" });
    await context.close();
    console.log("PASS: real mobile + desktop menus and authenticated UI mock work on homepage/article.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(err => { console.error(err); process.exitCode = 1; server.close(); });
