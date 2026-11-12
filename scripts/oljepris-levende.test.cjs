"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const html=read("artikler/2026-11-05-oljeprisfall-usa-valg-norge.html");
const chart=read("Bilder/Artikler/2026-11-12-brent-november-sluttkurser.svg");
const flow=read("Bilder/Artikler/2026-11-12-oljepris-norge-virkninger.svg");
test("Originalt oljeprisinnhold, hovedillustrasjon, dato og felles stil beholdes",()=>{
 assert.match(html,/<h1 class="story-title">Oljeprisen falt nesten ni prosent/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.equal((html.match(/<article\b/g)||[]).length,1);
 assert.equal((html.match(/<\/article>/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-05"/);
 assert.match(html,/article:modified_time" content="2026-11-12"/);
 assert.match(html,/2026-11-05-oljeprisen-norge-godkjent\.webp/);
 assert.match(html,/KI-assistert redaksjonell illustrasjon/);
 assert.match(html,/class="story-body av-artikkel"/);
 assert.match(html,/artikkel\.css\?v=20261112a/);
 assert.match(html,/artikkel-interaktiv\.js/);
 for(let i=1;i<=8;i++)assert.ok(html.includes('id="k'+i+'"'),"opprinnelig kilde "+i+" mangler");
});
test("Sluttkurser sammenlignes riktig, intradagstall markeres, kilder refereres",()=>{
 assert.match(html,/89,65 dollar fatet/);
 assert.match(html,/Sluttkursen 10\. november var 91,49 dollar/);
 assert.match(html,/Dette er en tidsfestet notering, ikke sluttkursen/);
 assert.match(html,/94,62 dollar fatet/);
 assert.match(html,/8,7 prosent/);
 assert.match(html,/Norges Bank offentliggjorde torsdag 5\. november/);
 assert.match(html,/Beslutningen ble fattet på møtet 4\. november/);
 assert.match(html,/markets\.ft\.markitdigital\.com/);
 assert.match(html,/norges-bank\.no\/en\/topics\/monetary-policy\/Monetary-policy-meetings\/2026\/november-2026/);
 assert.match(html,/id="k9"/);
 assert.match(html,/id="k10"/);
 assert.match(html,/id="k11"/);
});
test("Sju dokumenterte daglige oppgjørspriser er både i SVG og tabell",()=>{
 const prices=["104,77","103,60","94,62","98,29","98,32","92,57","91,49"];
 for(const p of prices){assert.ok(html.includes("<td>"+p+"</td>"),p+" ikke i tabell");assert.ok(chart.includes(p),p+" mangler i diagram");}
 assert.equal((html.match(/<tr><th scope="row">/g)||[]).length,7);
 assert.match(chart,/<title id="t">/);
 assert.match(chart,/<desc id="d">/);
 assert.match(chart,/Y-aksen starter ved 85 dollar/);
 assert.match(html,/Y-aksen starter ved 85 dollar/);
 assert.match(chart,/januar-kontraktens oppgjørspris/);
});
test("Levende moduler: to nye SVG-er, kompakt zoom, forklarer, tidslinje, faktaboks, lokal poll",()=>{
 assert.equal((html.match(/<figure\b/g)||[]).length,3);
 assert.equal((html.match(/class="av-zoom-knapp" data-av-zoom/g)||[]).length,2);
 assert.equal((html.match(/>Forstørr<\/a>/g)||[]).length,2);
 assert.match(html,/id="av-zoom-dialog"/);
 assert.match(flow,/<title id="t">/);
 assert.match(flow,/<desc id="d">/);
 assert.match(flow,/STATENS INNTEKTER/);
 assert.match(flow,/DRIVSTOFF/);
 assert.match(flow,/KLIMA/);
 assert.match(html,/class="av-tidslinje"/);
 assert.equal((html.match(/<li><details><summary><time /g)||[]).length,5);
 assert.match(html,/details class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 for(const step of ["risiko","ettersporsel","tilbud","norge"]){
  assert.ok(html.includes('data-av-step="'+step+'"'));
  assert.ok(html.includes('data-av-panel="'+step+'"'));
 }
 assert.match(html,/data-av-poll="oljepris-norsk-okonomi-2026"/);
 assert.match(html,/Ingen fellestall eller prosenter vises/);
 assert.match(html,/<form hidden>/);
});
