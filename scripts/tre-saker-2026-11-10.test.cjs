"use strict";
// Teknisk regresjonskontroll for publiseringspakke #107.
// Dette er IKKE bildegodkjenning, faktasjekk eller tillatelse til PR-merge.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const site = "https://paradispartiet.github.io/Paradisavisa/";
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const sourceCards = JSON.parse(readText("Nyhetshjul.json"));

const subjects = [
  {
    article: "artikler/2026-11-10-hvem-skal-fa-norges-strom.html",
    image: "Bilder/Artikler/2026-11-10-datasentre-kraftnett.webp",
    imageSha256: "8a42805ab56711737fde5c60f94e3e1592d7e7c6f2acc42fc4eecfda983ac025",
    expectedSources: 9,
  },
  {
    article: "artikler/2026-11-10-massie-hegseth-riksrettsforslag.html",
    image: "Bilder/Artikler/2026-11-10-massie-hegseth.webp",
    imageSha256: "7ea0a8736f9b2d8dabf777a91d37003fb2d38f3cf4d5afbd4e04b11408fd093e",
    expectedSources: 9,
  },
  {
    article: "artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html",
    image: "Bilder/Artikler/2026-11-10-nationaltheatret-toyen.webp",
    imageSha256: "53c26f131e190aa7f6b133fd3b33e3bb6e3d1a78c6873ed37db9b3b86c53ed01",
    expectedSources: 11,
  },
];

test("tre unike forsidekort peker på de korrekte artikkelsidene og bildene", () => {
  const links = sourceCards.map((card) => card.url);
  assert.equal(new Set(links).size, links.length, "dupliserte artikkelkort");
  for (const subject of subjects) {
    const matches = sourceCards.filter((card) => card.url === subject.article);
    assert.equal(matches.length, 1, "forventer ett nyhetskort for " + subject.article);
    const card = matches[0];
    assert.equal(card.image, subject.image);
    assert.match(card.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(card.title && card.excerpt && card.excerpt.length > 50);
    assert.ok(!/forhåndsvisning|ikke publisert/i.test(card.title + " " + card.excerpt));
  }
});

for (const subject of subjects) {
  test("artikkel, kilder og delingsmetadata: " + subject.article, () => {
    const html = readText(subject.article);
    const card = sourceCards.find((item) => item.url === subject.article);
    const expectedImageUrl = site + subject.image;
    const expectedCanonical = site + subject.article;
    const relativeImage = "../" + subject.image;

    assert.equal((html.match(/<h1\b/g) || []).length, 1, "nøyaktig én h1");
    assert.ok(html.includes('src="' + relativeImage + '"'), "bildebanen mangler");
    assert.ok(html.includes('alt="'), "bildet må ha alt-tekst");
    assert.ok(html.includes("<figcaption") && html.includes("KI-assistert redaksjonell illustrasjon"));
    assert.ok(html.includes('property="og:image" content="' + expectedImageUrl + '"'));
    assert.ok(html.includes('name="twitter:image" content="' + expectedImageUrl + '"'));
    assert.ok(html.includes('property="og:image:alt"'), "delingsbilde trenger alt-tekst");
    assert.ok(html.includes('rel="canonical" href="' + expectedCanonical + '"'));
    assert.ok(html.includes('property="article:published_time" content="' + card.date + '"'));
    assert.ok(html.includes('datetime="' + card.date + '"'), "visningsdato må stemme med kortet");
    assert.ok(html.includes('name="description" content="'));
    assert.ok(!html.includes('name="robots" content="noindex'), "publisert side kan ikke være noindex");
    assert.ok(!html.includes("Vurderingsbilde – ikke endelig godkjent"));
    assert.ok(!html.includes("REDAKSJONELL FORHÅNDSVISNING"));

    const anchors = new Set([...html.matchAll(/id="k(\d+)"/g)].map((m) => m[1]));
    const cited = new Set([...html.matchAll(/href="#k(\d+)"/g)].map((m) => m[1]));
    for (const n of cited) assert.ok(anchors.has(n), "mangler kildeankeret k" + n);
    assert.ok(anchors.size >= subject.expectedSources, "for få kilder");
    assert.ok(cited.size >= 4, "artikkelen mangler løpende kildehenvisninger");
  });

  test("eksakt WebP-original og korrekte filsignaturer: " + subject.image, () => {
    const buffer = fs.readFileSync(path.join(root, subject.image));
    assert.ok(buffer.length > 100000 && buffer.length < 1000000, "uvanlig bildefilstørrelse");
    assert.equal(buffer.toString("ascii", 0, 4), "RIFF", "ikke RIFF-container");
    assert.equal(buffer.toString("ascii", 8, 12), "WEBP", "ikke WebP-fil");
    const actual = crypto.createHash("sha256").update(buffer).digest("hex");
    assert.equal(actual, subject.imageSha256, "bildeendring krever ny redaksjonell vurdering");
  });
}

test("Hegseth og datasenterforslaget merkes som uavgjort", () => {
  const h = readText(subjects[1].article);
  assert.match(h, /anklagene er ikke avgjort|anklagene er ikke avgjorte|anklagene er ikke bevist/i);
  assert.doesNotMatch(h, /Hegseth er (avsatt|dømt|felt)/i);
  const d = readText(subjects[0].article);
  assert.match(d, /forslaget er ikke vedtatt|ikke vedtatte regler/i);
  assert.match(d, /over 1 MW|over én megawatt/i);
});
