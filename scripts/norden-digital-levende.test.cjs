"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const html=read("artikler/2026-11-10-norden-teknologigigantene.html");
const graphic=read("Bilder/Artikler/2026-11-12-digital-suverenitet-exit-forklaringsgrafikk.svg");
test("Nordisk feature: opprinnelig tittel, datolinje, kilder og to godkjente bilder beholdes",()=>{
 assert.match(html,/<h1>Kan Norden frigjøre seg fra teknologigigantene\?<\/h1>/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-10"/);
 assert.match(html,/article:modified_time" content="2026-11-12"/);
 assert.match(html,/feature07-nordisk-digital-suverenitet-hovedbilde-2026\.webp/);
 assert.match(html,/feature07-nordisk-digital-suverenitet-sekundaerillustrasjon-2026\.webp/);
 assert.match(html,/Viser ikke et virkelig nordisk-baltisk datasenter/);
 assert.match(html,/class="av-artikkel"/);
 assert.match(html,/class="av-prosa"/);
 assert.match(html,/href="\.\.\/artikkel\.css\?v=20261112a"/);
 assert.match(html,/artikkel-interaktiv\.js/);
 assert.ok((html.match(/<li><strong>/g)||[]).length>=12);
});
test("Tydelig dokumenterte primærkilder og skille mellom intensjon og vedtak",()=>{
 assert.ok((html.match(/class="av-kilde-note"/g)||[]).length>=9);
 for(const term of [
  "norden.org/en/declaration/common-nordic-and-baltic-approach-digital-sovereignty",
  "digdir.no/digitalisering-og-samordning/skiftende-skydekke/8337",
  "digdir.no/digitalisering-og-samordning/ny-rapport-dette-bor-en-god-exit-strategi",
  "digdir.no/digitalisering-og-samordning/gi-oss-innspill",
  "forbrukerradet.no/?p=54996",
  "regjeringen.no/no/aktuelt/nordisk-baltisk-samarbeid"
 ])assert.ok(html.includes(term),term+" er ikke koblet til teksten");
 assert.match(html,/politisk intensjonserklæring, ikke en avtale/);
 assert.match(html,/faglig anbefaling/);
 assert.match(html,/11 punkter/);
 assert.match(html,/ikke en vedtatt lovregel/);
 assert.match(html,/innspill.*8\. desember 2026/);
 assert.match(html,/et skriftlig svar til Paradisavisa/);
});
test("Levende feature: tre illustrasjoner, forklaringsgrafikk, fire trinn, tidslinje og lokal poll",()=>{
 assert.equal((html.match(/<figure\b/g)||[]).length,3);
 assert.match(html,/class="av-zoom-knapp" data-av-zoom aria-label="Forstørr diagrammet om leverandøravhengighet">Forstørr/);
 assert.match(html,/id="av-zoom-dialog"/);
 assert.match(html,/class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 assert.match(html,/data-av-step="beredskap"/);
 assert.match(html,/data-av-panel="data"/);
 assert.match(html,/class="av-tidslinje"/);
 assert.match(html,/8\. desember 2026 – planlagt frist/);
 assert.match(html,/data-av-poll="digital-suverenitet-kommune-2026"/);
 assert.match(html,/data-av-poll-js-required/);
 assert.match(html,/<form hidden>/);
 assert.match(html,/Ingen fellestall eller prosenter vises/);
 assert.match(html,/value="usikker"/);
 assert.match(graphic,/<title id="svgt">/);
 assert.match(graphic,/<desc id="svgdesc">/);
 assert.match(graphic,/ikke en offisiell sjekkliste/);
 assert.match(graphic,/redaksjonelle forenkling/);
});