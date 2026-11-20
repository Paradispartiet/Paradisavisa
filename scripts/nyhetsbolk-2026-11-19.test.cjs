"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const ids = ["stormaktene-fredserklaering", "anthropic-rekordnotering", "hoyre-budsjett-frp-maling"];
const queue = JSON.parse(fs.readFileSync(path.join(root, "utkast/artikler.json"), "utf8"));
const feeds = ["Nyhetshjul.json", "Nyhetshjul2.json", "kommentarer.json", "Kulturhjul.json", "Sportshjul.json"];
test("Tre individuelle kilderike nyhetsutkast i eksisterende redaksjonell kø", () => {
  for (const id of ids) {
    const item = queue.artikler.find(x => x.id === id);
    assert.ok(item, "Mangler artikkel " + id);
    assert.equal(queue.artikler.filter(x => x.id === id).length, 1);
    assert.equal(item.status, "utkast");
    assert.equal(item.godkjent, false);
    assert.equal(item.publisert, false);
    assert.notEqual(item.faktasjekk, "godkjent");
    assert.match(item.artikkel, /^utkast\/2026-11-19\/[a-z0-9-]+\.html$/);
    assert.match(item.bilde, /^utkast\/2026-11-19\/bilder\/[a-z0-9-]+\.(?:svg|webp)$/);
    const html = fs.readFileSync(path.join(root, item.artikkel), "utf8");
    const image = fs.readFileSync(path.join(root, item.bilde));
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
    assert.match(html, /REDAKSJONELT UTKAST – IKKE PUBLISERT/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /class="avisa-article-fallback"/);
    assert.match(html, /<details class="pa-menu">/);
    assert.match(html, /Kilder og dokumentasjon/);
    assert.ok((html.match(/class="av-kilde-note"/g) || []).length >= 3, "Få kildenoter i " + id);
    assert.ok(html.includes('src="bilder/' + path.basename(item.bilde) + '"'), "Feil bilde i " + id);
    if (item.bilde.endsWith(".svg")) {
      const svg = image.toString("utf8");
      assert.match(svg, /^<svg\b/);
      assert.match(svg.trim(), /<\/svg>$/);
    } else {
      assert.ok(image.length > 4000, "WebP-bildet er for lite: " + id);
      assert.equal(image.toString("ascii", 0, 4), "RIFF");
      assert.equal(image.toString("ascii", 8, 12), "WEBP");
    }
    assert.ok(!html.includes('content="index, follow"'));
    for (const feed of feeds) {
      const items = JSON.parse(fs.readFileSync(path.join(root, feed), "utf8"));
      assert.ok(!items.some(x => (x.url || "").includes(id)), "Utkast lekket til " + feed);
    }
  }
});
test("Tre nyhetsutkast er faktiske uavhengige artikler", () => {
  const articles = ids.map(id => fs.readFileSync(path.join(root, 'utkast/2026-11-19/' + id + '.html'), 'utf8'));
  assert.ok(articles[0].includes("Anadolu") && articles[0].includes("atom"));
  assert.ok(articles[1].includes("97,17 dollar") && articles[1].includes("Reuters"));
  assert.ok(articles[2].includes("hoyre.no/hoyres-alternative-budsjett-2027/") && articles[2].includes("Norstat"));
});
