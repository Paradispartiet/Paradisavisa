"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const html=read("artikler/2026-11-02-serbia-studentvalget.html");
const svg=read("Bilder/Artikler/2026-11-12-serbia-studentbevegelse-orienteringskart.svg");
test("Original Serbia-artikkel, kildekreditering og publiseringsdato beholdes",()=>{
 assert.match(html,/<h1>De sørget i 16 minutter/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-02"/);
 assert.match(html,/article:modified_time" content="2026-11-12"/);
 assert.match(html,/serbia-studentprotest-novi-sad-2025-arkivfoto\.jpg/);
 assert.match(html,/Nikola Dyordyevich/);
 assert.match(html,/creativecommons\.org\/licenses\/by-sa\/4\.0/);
 assert.match(html,/class="utkast-tekst av-artikkel"/);
 assert.match(html,/artikkel-interaktiv\.js/);
});
test("Bekreftet valgresultat erstatter foreldede mandatprognoser",()=>{
 assert.match(html,/godkjente Serbias valgkommisjon/);
 assert.match(html,/140 av 250 seter/);
 assert.match(html,/fikk <strong>103<\/strong>/);
 assert.match(html,/sju mandatene/);
 assert.match(html,/126 seter/);
 assert.match(html,/RIK, endelig valgresultat 5\. november/);
 assert.match(html,/mandates-allocated-to-members-of-new-parliaments-convocation/);
 assert.doesNotMatch(html,/140 mandater fortsatt er en beregning/);
 assert.doesNotMatch(html,/mandatfordelingen ennå er foreløpig/);
});
test("Levende modulbibliotek: map zoom, timeline, infoboks, step explainer og lokal poll",()=>{
 assert.match(html,/class="av-zoom-knapp" data-av-zoom[^>]+>Forstørr<\/a>/);
 assert.match(html,/id="av-zoom-dialog"/);
 assert.match(html,/class="av-tidslinje"/);
 assert.equal((html.match(/<li><details><summary><time /g)||[]).length,5);
 assert.match(html,/details class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 for(const stage of ["sorg","innsyn","mobilisering","valg"]){
  assert.ok(html.includes('data-av-step="'+stage+'"'));
  assert.ok(html.includes('data-av-panel="'+stage+'"'));
 }
 assert.match(html,/data-av-poll="serbia-studentvalg-ansvar-2026"/);
 assert.match(html,/Ingen fellestall eller prosenter vises/i);
 assert.match(html,/<form hidden>/);
 assert.match(svg,/<title id="maptitle">/);
 assert.match(svg,/<desc id="mapdesc">/);
 assert.match(svg,/ikke målestokkriktig/);
 assert.match(svg,/NOVI SAD/);
 assert.match(svg,/BEOGRAD/);
 assert.match(svg,/NIŠ/);
});
