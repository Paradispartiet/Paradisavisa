"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=x=>fs.readFileSync(path.join(__dirname,"..",x),"utf8");
const html=read("artikler/2026-11-10-hvem-skal-fa-norges-strom.html");
const ko=read("Bilder/Artikler/2026-11-11-datasentre-kraftko-graf.svg");
const tre=read("Bilder/Artikler/2026-11-11-datasentre-tre-beslutningsspor.svg");

test("Eksisterende datasenteranalyse beholder tittel, dato, hovedbilde og originalkilder",()=>{
 assert.match(html,/Hvem skal få Norges strøm\? Nå setter Statnett bremsene på datasentrene/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-10"/);
 assert.match(html,/article:modified_time" content="2026-11-11"/);
 assert.match(html,/2026-11-10-datasentre-kraftnett\.webp/);
 assert.match(html,/KI-assistert redaksjonell illustrasjon/);
 assert.match(html,/class="story-body av-artikkel"/);
 assert.match(html,/class="av-prosa"/);
 assert.match(html,/href="\.\.\/artikkel\.css\?v=20261111b"/);
 assert.match(html,/src="\.\.\/artikkel-interaktiv\.js"/);
});
test("Kilder er ved påstandene, og forslag forveksles ikke med innførte tiltak",()=>{
 assert.ok((html.match(/class="av-kilde-note"/g)||[]).length>=9);
 assert.match(html,/Per 11\. november 2026 var svaret fremdeles ikke publisert/);
 assert.match(html,/Forslaget er ikke vedtatt/);
 assert.match(html,/ikke vedtatte regler/);
 assert.match(html,/unntak fra tilknytnings- og investeringsplikten/i);
 assert.match(html,/www\.statnett\.no\/om-statnett/);
 assert.match(html,/www\.regjeringen\.no\/no\/aktuelt/);
 assert.match(html,/dok8-202627-034ls/);
 assert.match(html,/h=10006019/);
});
test("Kapasitetskø er kildebelagt, datatabell tilgjengelig og skala ikke misvisende",()=>{
 for(const s of ["800 MW","4 200 MW","9 100 MW","18 000 MW"])assert.ok(html.includes(s),s+" mangler i artikkel");
 for(const s of ["800","4 200","9 100","18 000"])assert.ok(ko.includes(s),s+" mangler i graf");
 assert.match(ko,/0 0 1280 760/);
 assert.match(ko,/<title id="chartTitle">/);
 assert.match(ko,/<desc id="chartDescription">/);
 assert.match(ko,/nullbaserte skala/);
 assert.match(html,/class="av-datatabell"/);
 assert.match(html,/Vis tallene i tabell/);
 assert.match(html,/ikke en prognose for hvor mange anlegg som blir bygget/);
 assert.match(tre,/Tre ulike prosesser rundt datasentre og kraft/);
 assert.match(tre,/ikke et vedtatt prioriteringssystem/);
});
test("Samme modulbibliotek brukes med poll, zoom, tidslinje, forklaring og fakta",()=>{
 assert.match(html,/class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 assert.match(html,/data-av-step="samfunn"/);
 assert.match(html,/class="av-tidslinje"/);
 assert.match(html,/data-av-poll="norge-kraftprioritering-2026"/);
 assert.match(html,/data-av-poll-js-required/);
 assert.match(html,/<form hidden>/);
 assert.match(html,/ingen felles resultater registreres/);
 assert.match(html,/data-av-zoom/);
 assert.match(html,/id="av-zoom-dialog"/);
 assert.equal((html.match(/<figure\b/g)||[]).length,3);
});
