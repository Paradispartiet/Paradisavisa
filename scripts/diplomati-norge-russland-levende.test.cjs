"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const html=read("artikler/2026-11-11-norge-russland-eu-abu-dhabi.html");
const svg=read("Bilder/Artikler/2026-11-12-abu-dhabi-diplomatiske-kanaler.svg");
test("Norsk-russisk analyse: opprinnelig tittel, foto, kilder og publiseringsdato beholdes",()=>{
 assert.match(html,/<h1>Norge har fortsatt en vei til Moskva/);
 assert.equal((html.match(/<h1\\b/g)||[]).length,1);
 assert.equal((html.match(/<article\\b/g)||[]).length,1);
 assert.equal((html.match(/<\\/article>/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-11"/);
 assert.match(html,/article:modified_time" content="2026-11-12"/);
 assert.match(html,/2026-11-11-norge-russland-eu-abu-dhabi\\.png/);
 assert.match(html,/KI-assistert redaksjonell sammenstilling/);
 assert.match(html,/class="story av-artikkel"/);
 assert.match(html,/artikkel\\.css\\?v=20261112a/);
 assert.match(html,/artikkel-interaktiv\\.js/);
 for(let i=1;i<=10;i++)assert.ok(html.includes('id="k'+i+'"'),"kilde "+i+" mangler");
});
test("Tre kanaler, presis kildekarakter og oppdatering 12 november",()=>{
 assert.match(html,/Oppdatert 12\\. november:/);
 assert.match(html,/Støre og Finlands president Alexander Stubb/);
 assert.match(html,/ble de amerikanske utsendingene Steve Witkoff og Jared Kushner/);
 assert.match(html,/ingen fredsavtale eller kunngjort endelig utvekslingsdato/);
 assert.match(html,/prinspiell|prinsipiell/);
 assert.match(html,/id="k11"/);
 assert.match(html,/regjeringen\\.no\\/no\\/aktuelt\\/president-stubb-og-statsminister-store/);
 assert.match(html,/consilium\\.europa\\.eu\\/en\\/press\\/press-releases\\/2026\\/11\\/10/);
 assert.match(html,/apnews\\.com\\/article\\/683810203340077f33611fd1d1757b23/);
 assert.match(html,/EU-kommisjonen utbetalte 5\\. november 4,36 milliarder euro/);
});
test("Diagram med kompakt zoom, seks tider, faktaboks, fire forklaringssteg og lokal poll",()=>{
 assert.equal((html.match(/<figure\\b/g)||[]).length,2);
 assert.match(html,/class="av-zoom-knapp" data-av-zoom[^>]+>Forstørr<\\/a>/);
 assert.match(html,/id="av-zoom-dialog"/);
 assert.match(html,/class="av-tidslinje"/);
 assert.equal((html.match(/<li><details><summary><time /g)||[]).length,6);
 assert.match(html,/details class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 for(const step of ["kontakt","forhandling","avtale","gjennomforing"]){
  assert.ok(html.includes('data-av-step="'+step+'"'));
  assert.ok(html.includes('data-av-panel="'+step+'"'));
 }
 assert.match(html,/data-av-poll="diplomati-europa-ukraina-2026"/);
 assert.match(html,/Ingen fellestall eller prosenter vises/);
 assert.match(html,/<form hidden>/);
 assert.match(svg,/<title id="t">/);
 assert.match(svg,/<desc id="d">/);
 assert.match(svg,/not a map|ikke et kart/);
 assert.match(svg,/RUSSLAND/);
 assert.match(svg,/EU, EUROPEISKE LAND, NATO/);
});
