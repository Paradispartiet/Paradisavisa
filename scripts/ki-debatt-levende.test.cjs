"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=pathFromRoot=>fs.readFileSync(path.join(root,pathFromRoot),"utf8");
const html=read("artikler/2026-11-11-maskinene-laerer-aa-skrive.html");
const svg=read("Bilder/debatt/2026-11-11-skriveprosess-forklaringsgrafikk.svg");
test("KI-debatt beholder godkjent karikatur, identitet, byline og publiseringsdato",()=>{
 assert.match(html,/<h1>Når maskinene lærer å skrive, mister de lærde sitt monopol<\/h1>/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/Av Paradispartiet/);
 assert.match(html,/Debattinnlegg/);
 assert.match(html,/article:published_time" content="2026-11-11"/);
 assert.match(html,/article:modified_time" content="2026-11-11"/);
 assert.match(html,/ellefsen-ai-skriving-hires\.webp/);
 assert.match(html,/class="av-artikkel"/);
 assert.match(html,/href="\.\.\/artikkel\.css\?v=20261111b"/);
 assert.match(html,/artikkel-interaktiv\.js/);
 assert.match(html,/class="prose av-prosa"/);
});
test("Kilder er integrert og motiver hos navngitte kritikere framstilles som tolkning",()=>{
 assert.ok((html.match(/class="av-kilde-note"/g)||[]).length>=4,"minst fire kildenoter");
 for(const url of [
  "www.morgenbladet.no/kultur/",
  "www.samtiden.no/notiser/",
  "www.aftenposten.no/kultur/kommentar/",
  "www.aftenposten.no/meninger/debatt/",
  "www.vg.no/nyheter/",
  "arxiv.org/abs/2306.15666"
 ])assert.ok(html.includes(url),url+" mangler");
 assert.match(html,/med glimt i øyet/);
 assert.match(html,/et høyt utslag er ikke et bevis/i);
 assert.match(html,/forfatterens tolkning, ikke et dokumentert personlig motiv/);
 assert.match(html,/det betyr ikke at forskningen i seg selv evaluerer akkurat det verktøyet Aftenposten brukte/i);
});
test("Levende moduler fungerer som redaksjonell fordypning – ikke offentlig meningsmåling",()=>{
 assert.match(html,/class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 assert.match(html,/data-av-step="kontroll"/);
 assert.match(html,/data-av-poll="ki-skriving-aapenhet-2026"/);
 assert.match(html,/data-av-poll-js-required/);
 assert.match(html,/<form hidden>/);
 assert.match(html,/data-av-poll-result hidden/);
 assert.match(html,/ingen samlede stemmetall registreres eller vises/i);
 assert.match(html,/id="av-zoom-dialog"/);
 assert.match(html,/data-av-zoom/);
 assert.match(html,/Forstørr forklaringsgrafikken/);
 assert.match(html,/class="sources av-kilder-samlet"/);
 assert.match(html,/class="av-figur av-mellombilde/);
});
test("Sekundærillustrasjonen forklarer prosess, er original og merket",()=>{
 assert.match(svg,/<svg[^>]+viewBox="0 0 1600 860"/);
 assert.match(svg,/<title id="title">/);
 assert.match(svg,/<desc id="description">/);
 assert.match(svg,/ikke et dokumentarfotografi/);
 assert.match(html,/2026-11-11-skriveprosess-forklaringsgrafikk\.svg/);
 assert.match(html,/anbefalt ansvarsfordeling, ikke en dokumentert framstilling/);
});
