"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const html=read("artikler/2026-11-02-meta-plattformmakt-pressefrihet.html");
const rights=read("Bilder/Artikler/2026-11-12-meta-lenke-innhenting-rettigheter.svg");
const numbers=read("Bilder/Artikler/2026-11-12-meta-norske-mediehus-180-10.svg");
test("Originalt Meta-innhold, publiseringsdato, godkjente bilder og synlig h1",()=>{
 assert.match(html,/<h1 id="tittel">Hvem bestemmer over journalistikken/);
 assert.doesNotMatch(html,/<h1 class="hidden-title"/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.equal((html.match(/<article\b/g)||[]).length,1);
 assert.equal((html.match(/<\/article>/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-02"/);
 assert.match(html,/article:modified_time" content="2026-11-12"/);
 assert.match(html,/meta-plattformmakt-redaksjon-kiillustrasjon-2026\.jpg/);
 assert.match(html,/meta-rettigheter-2026\.svg/);
 assert.match(html,/KI-generert redaksjonell illustrasjon/);
 assert.match(html,/class="prose av-artikkel"/);
 assert.match(html,/artikkel\.css\?v=20261112a/);
 assert.match(html,/artikkel-interaktiv\.js/);
});
test("Oppdatering 6 november 2026 og rettslige reservasjoner",()=>{
 assert.match(html,/Oppdatert 12\. november/);
 assert.match(html,/Meta bekreftet 6\. november/);
 assert.match(html,/Endringene trer derfor ikke i kraft 20\. november/);
 assert.match(html,/de gjeldende vilkårene fortsetter inntil videre/);
 assert.match(html,/ikke en ny dom/);
 assert.match(html,/retter den midlertidige forføyningen seg mot de formelle partene/);
 assert.match(html,/støttetallet må ikke forveksles med hvem som omfattes/);
 assert.match(html,/rettskraftig avgjort/);
 assert.match(html,/ikke er fastslått lovbrudd/);
 assert.match(html,/manglende|har ikke selv sett den fullstendige rettsteksten/);
 assert.match(html,/reuters\.com\/business\/meta-pauses-planned-terms-updates-keeps-existing-rules-place-2026-11-06/);
 assert.match(html,/gov\.uk\/cma-cases\/suspected-abuse-of-a-dominant-position/);
 assert.match(html,/niemanlab\.org\/2026\/11\/meta-pulls-down-controversial-terms-of-service/);
});
test("To originale SVG-grafikker er faktabasert og tilgjengelig",()=>{
 assert.equal((html.match(/<figure\b/g)||[]).length,4);
 assert.equal((html.match(/class="av-zoom-knapp" data-av-zoom/g)||[]).length,2);
 assert.equal((html.match(/>Forstørr<\/a>/g)||[]).length,2);
 assert.match(html,/id="av-zoom-dialog"/);
 for(const svg of [rights,numbers]){
  assert.match(svg,/<title id="title">/);
  assert.match(svg,/<desc id="desc(?:ription)?">/);
 }
 assert.match(rights,/DELE EN LENKE/);
 assert.match(rights,/INDEKSERE/);
 assert.match(rights,/BRUKE INNHOLD/);
 assert.match(rights,/ingen dokumentasjon på faktisk innhenting|ingen dokumentasjon på faktisk/i);
 assert.match(numbers,/>180</);
 assert.match(numbers,/>10</);
 assert.match(numbers,/180 \+ 10 skal ikke summeres til 190/);
 assert.match(html,/180 er oppgitt støtte til aksjonen/);
 assert.match(html,/ti er antallet navngitte begjærende foretak/);
});
test("Seks tidslinjehendelser, fire interaktive forklaringer, faktaboks og lokal poll",()=>{
 assert.equal((html.match(/<li><details><summary><time /g)||[]).length,6);
 assert.match(html,/class="av-tidslinje"/);
 assert.match(html,/details class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 for(const step of ["lenke","robots","avtale","myndighet"]){
  assert.ok(html.includes('data-av-step="'+step+'"'));
  assert.ok(html.includes('data-av-panel="'+step+'"'));
 }
 assert.match(html,/data-av-poll="meta-pressefrihet-vilkar-2026"/);
 assert.match(html,/Ingen fellestall eller prosenter vises/);
 assert.match(html,/<form hidden>/);
});
