"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const html=read("artikler/2026-11-03-sofienberg-kirke-varmestue.html");
const prices=read("Bilder/Artikler/2026-11-12-sofienberg-priseksempler.svg");
const access=read("Bilder/Artikler/2026-11-12-sofienberg-adgang-ikke-samme.svg");
test("Bevarer tittel, opprinnelig publiseringsdato, to godkjente illustrasjoner og kommentarstatus",()=>{
 assert.match(html,/<h1 class="title">Sofienberg kirke er varm\. Folk fryser utenfor\./);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.equal((html.match(/<article\b/g)||[]).length,1);
 assert.equal((html.match(/<\/article>/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-03"/);
 assert.match(html,/article:modified_time" content="2026-11-12"/);
 assert.match(html,/sofienberg-pingpong-hd\.webp/);
 assert.match(html,/sofienberg-folk-fryser-hd\.webp/);
 assert.match(html,/Illustrasjonen skildrer ikke et konkret øyeblikk/);
 assert.match(html,/Dette er en kommentar/);
 assert.match(html,/class="av-artikkel"/);
 assert.match(html,/artikkel\.css\?v=20261112a/);
 assert.match(html,/artikkel-interaktiv\.js/);
});
test("Sporbare priser og kildestatus uten å hevde at gratis varmestue mangler",()=>{
 assert.match(html,/23,175 millioner kroner fra Sparebankstiftelsen DNB/);
 assert.match(html,/fikk i <strong>2024<\/strong> en tildeling/);
 assert.match(html,/Kor På Sparket.*?50 kroner/);
 assert.match(html,/nabolagsyoga.*?150 kroner/);
 assert.match(html,/Oslo Kammerkor en gratis konsert/);
 assert.match(html,/6\. november.*?2026/);
 assert.match(html,/Vi har ikke fått dokumentert faste, offentlig annonserte åpningstider/);
 assert.match(html,/Fravær av slik informasjon er ikke bevis for at tilbudet ikke finnes/);
 assert.match(html,/gratis og åpne aktiviteter/);
 assert.match(html,/Sparebankstiftelsen/);
 assert.match(html,/sofienbergprosjektet\.no\/hvaskjer\/oslo-kammerkor-konsert-siste-solarglad/);
 assert.match(html,/sofienbergprosjektet\.no\/hvaskjer\/kor-p-sparket/);
 assert.match(html,/sofienbergprosjektet\.no\/hvaskjer\/narwjxn0paefa1xm3y3jvem5zzi43e-schm4/);
 assert.match(html,/oslo\.kommune\.no\/skole-og-utdanning\/lan-og-leie-av-skolelokaler/);
});
test("To nye kildebelagte og tilgjengelige SVG-grafikker med prisdata/tabell",()=>{
 assert.equal((html.match(/<figure\b/g)||[]).length,4);
 assert.equal((html.match(/class="av-zoom-knapp" data-av-zoom/g)||[]).length,2);
 assert.equal((html.match(/>Forstørr<\/a>/g)||[]).length,2);
 assert.match(html,/id="av-zoom-dialog"/);
 for(const s of [prices,access]){
  assert.match(s,/<title id="t">/);
  assert.match(s,/<desc id="d">/);
 }
 for(const p of ["0 kr","50 kr","150 kr"])assert.ok(prices.includes(p),"SVG mangler "+p);
 for(const p of ["0 kr","50 kr","150 kr"])assert.ok(html.includes("<td>"+p+"</td>"),"HTML-tabell mangler "+p);
 assert.equal((html.match(/<tr><td>/g)||[]).length,3);
 assert.match(prices,/ikke gjennomsnittet/);
 assert.match(access,/PARADISAVISAS/);
 assert.match(access,/FORSLAG/);
 assert.match(access,/sier ikke at fast varmestue mangler/);
});
test("Fem tidslinjeledd, fire forklaringsvalg, rettende faktaboks og lokal poll",()=>{
 assert.equal((html.match(/<li><details><summary><time /g)||[]).length,5);
 assert.match(html,/class="av-tidslinje"/);
 assert.match(html,/details class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 for(const id of ["tid","adgang","drift","sambruk"]){
  assert.ok(html.includes('data-av-step="'+id+'"'));
  assert.ok(html.includes('data-av-panel="'+id+'"'));
 }
 assert.match(html,/data-av-poll="sofienberg-varmestue-prioritering-2026"/);
 assert.match(html,/Ingen fellestall eller prosenter vises/);
 assert.match(html,/<form hidden>/);
});
