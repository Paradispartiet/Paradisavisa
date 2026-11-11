"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const h=read("artikler/2026-11-05-ronaldo-landslagsavskjed.html");
const diagram=read("Bilder/Artikler/2026-11-11-ronaldo-presspill-forklaringsdiagram.svg");

test("Ronaldo-sportanalyse: originalt bildepar, dato og redaksjonell identitet beholdes",()=>{
 assert.match(h,/<h1>Ronaldo var en gigant\. Men hvem tok løpene for ham\?<\/h1>/);
 assert.equal((h.match(/<h1\b/g)||[]).length,1);
 assert.match(h,/article:published_time" content="2026-11-05"/);
 assert.match(h,/article:modified_time" content="2026-11-11"/);
 assert.match(h,/2026-11-07-ronaldo-hovedbilde-portrett\.webp/);
 assert.match(h,/2026-11-06-ronaldo-symbolmettet-analyse\.webp/);
 assert.match(h,/Ikke dokumentarfotografi/);
 assert.match(h,/class="utkast-tekst av-artikkel"/);
 assert.match(h,/href="\.\.\/artikkel\.css\?v=20261111b"/);
 assert.match(h,/artikkel-interaktiv\.js/);
});
test("Løpende faktakilder og tydelig skille mellom fakta, analyse og anslag",()=>{
 assert.ok((h.match(/class="av-kilde-note"/g)||[]).length>=7);
 assert.match(h,/www\.fifa\.com\/en\/tournaments/);
 assert.match(h,/www\.theguardian\.com\/football\/2022/);
 assert.match(h,/www\.forbes\.com\.au\/news\/sport/);
 assert.match(h,/www\.amnesty\.org\/en\/latest/);
 assert.match(h,/www\.reuters\.com\/sports\/soccer\/ronaldo-handed-30-day-ban/);
 assert.match(h,/ikke en måling av Ronaldos løpsmengde/);
 assert.match(h,/anslag før skatt og honorarer/i);
 assert.match(h,/ikke i seg selv bevis på personlig støtte/);
});
test("Karrieretall er kildebelagte og modulene viser ikke oppdiktet løpsstatistikk",()=>{
 for(const snippet of ["234","146","2016","2019","2025","data-av-step=\"vinne\"","data-av-poll=\"ronaldo-ettermale-2026\"","data-av-zoom","class=\"av-tidslinje\""])assert.ok(h.includes(snippet),snippet);
 assert.match(h,/class="av-nokkeltall"/);
 assert.match(h,/Dette er fotballfaglige prinsipper, ikke individuell løpsstatistikk/);
 assert.match(h,/ingen fellestall samles inn/);
 assert.match(h,/<form hidden>/);
 assert.match(h,/data-av-poll-js-required/);
 assert.match(h,/class="av-zoom-knapp"[^>]*aria-label="Forstørr taktikkdiagrammet om presspillet">Forstørr/);
 assert.equal((h.match(/<figure\b/g)||[]).length,3);
 assert.match(diagram,/<title id="title">/);
 assert.match(diagram,/<desc id="description">/);
 assert.match(diagram,/ikke bevis for hvordan en konkret spiller beveget seg/);
});
