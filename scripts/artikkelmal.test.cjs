"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("Én kanonisk mal har nødvendig artikkelstruktur og ingen publiserbare plassholdere",()=>{
 const h=read("Maler/mal-artikkel.html");
 assert.match(h,/<html lang="nb" class="av-artikkelside">/);
 assert.match(h,/<meta name="robots" content="noindex, nofollow">/);
 assert.match(h,/<article class="av-artikkel">/);
 assert.equal((h.match(/<h1\b/g)||[]).length,1);
 assert.match(h,/<link rel="stylesheet" href="\.\.\/artikkel\.css\?v=20261111b">/);
 assert.match(h,/<figure class="av-figur av-hovedbilde">/);
 assert.match(h,/<figure class="av-figur av-mellombilde">/);
 assert.equal((h.match(/<figcaption>/g)||[]).length,2);
 assert.ok((h.match(/class="av-kilde-note"/g)||[]).length>=2,"Minst to eksempler på avsnittskilder");
 assert.match(h,/class="av-kilder-samlet"/);
 assert.match(h,/<meta property="og:image"/);
 assert.match(h,/twitter:image/);
 assert.match(h,/ARTIKKELTITTEL/); // Bare en ikke-publiserbar mal
});
test("Artikkelstil skiller lesbar prosa, små kildenoter og bildehøyde",()=>{
 const css=read("artikkel.css");
 assert.match(css,/\.av-artikkel \.av-prosa/);
 assert.match(css,/\.av-artikkel \.av-kilde-note/);
 assert.match(css,/\.av-hovedbilde img\{[^}]*max-height:/s);
 assert.match(css,/object-fit:contain/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.doesNotMatch(css,/^\s*article\s*\{/m,"Stilen skal ikke endre eldre artikler globalt");
});
test("Gamle maler er tydelig merket historiske",()=>{
 for(const f of ["article.html","Maler/mal-nyhet.html","Maler/mal-kultur.html","Maler/mal-sport.html","posts/innlegg-mal.html"]){
  assert.match(read(f),/HISTORISK MAL, IKKE BRUK TIL NYE ARTIKLER/,f);
 }
});
test("Dokumentasjon viser til den kanoniske standarden",()=>{
 for(const f of ["REDAKSJONSPLAN.md","README.html"]){
  assert.match(read(f),/ARTIKKELSTANDARD\.md/,f);
 }
 assert.match(read("redaksjon/ARTIKKELSTANDARD.md"),/BILDEHANDBOK\.md/);
});


test("Levende moduler har fungerende semantikk og en reell demonstrasjon",()=>{
 const demo=read("redaksjon/artikkel-demo.html");
 assert.match(demo,/<meta name="robots" content="noindex, nofollow">/);
 assert.match(demo,/data-av-poll="redaksjon-demo-tema"/);
 assert.match(demo,/data-av-poll-js-required/);
 assert.match(demo,/<form hidden>/);
 assert.match(demo,/<fieldset>/);
 assert.match(demo,/data-av-poll-result hidden/);
 assert.match(demo,/data-av-zoom/);
 assert.match(demo,/id="av-zoom-dialog"/);
 assert.match(demo,/class="av-datatabell"/);
 assert.match(demo,/class="av-tidslinje"/);
 assert.match(demo,/data-av-explainer/);
 assert.match(demo,/class="av-infoboks"/);
 assert.match(demo,/data-av-kilde-note|class="av-kilde-note"/);
 assert.match(demo,/oppdiktede demoverdier|oppdiktede eksempelverdier/i);
 assert.match(demo,/artikkel-interaktiv\.js/);
 assert.match(demo,/demomateriell\/graf-demo\.svg/);
 assert.match(demo,/demomateriell\/prosess-demo\.svg/);
});
test("Grafen har tilgjengelige demoetiketter og kan ikke forveksles med tall fra en kilde",()=>{
 const chart=read("redaksjon/demomateriell/graf-demo.svg");
 const process=read("redaksjon/demomateriell/prosess-demo.svg");
 assert.match(chart,/ikke statistikk/i);
 assert.match(chart,/<title id="title">/);
 assert.match(chart,/<desc id="description">/);
 assert.match(process,/ikke dokumentasjon/i);
 assert.match(process,/<desc id="desc">/);
});
test("Interaktive moduler er isolerte, skriptet er gyldig, uten falske meningsmålinger",()=>{
 const js=read("artikkel-interaktiv.js");
 assert.doesNotThrow(()=>new Function(js));
 assert.match(js,/window\.localStorage/);
 assert.match(js,/data-av-poll-js-required/);
 assert.match(js,/showModal/);
 assert.match(js,/data-av-explainer/);
 assert.doesNotMatch(js,/fetch\s*\(/,"Ingen stemmer sendes til en upåvist server");
 const css=read("artikkel.css");
 for(const cls of [".av-poll",".av-tidslinje",".av-graf",".av-infoboks",".av-forklaring-kart",".av-zoom-dialog"]){
  assert.ok(css.includes(cls),"Manglende modulstil: "+cls);
 }
 const template=read("Maler/mal-artikkel.html");
 assert.match(template,/artikkel-interaktiv\.js/);
 assert.match(template,/redaksjon\/artikkel-demo\.html/);
 assert.match(template,/id="av-zoom-dialog"/);
 assert.match(read("redaksjon/LEVENDE-ARTIKLER.md"),/GitHub Pages/);
});


test("Forstørringslenker er små, ensartede og tilgjengelig navngitt",()=>{
 const css=read("artikkel.css");
 const zoomRule=css.match(/\.av-artikkel \.av-zoom-knapp\{([\s\S]*?)\}/)?.[1]||"";
 assert.match(zoomRule,/background:transparent/);
 assert.match(zoomRule,/border:0/);
 assert.match(zoomRule,/min-height:44px/);
 assert.match(zoomRule,/font:600 \.82rem/);
 assert.match(css,/\.av-artikkel \.av-zoom-knapp::before/);
 const articles=[
   ["artikler/2026-11-10-hvem-skal-fa-norges-strom.html",2],
   ["artikler/2026-11-10-bankene-tjener-milliarder.html",1],
   ["artikler/2026-11-11-maskinene-laerer-aa-skrive.html",1],
   ["redaksjon/artikkel-demo.html",1]
 ];
 for(const [filename,count] of articles){
   const html=read(filename);
   const links=[...html.matchAll(/<a\b[^>]*class="av-zoom-knapp"[^>]*>/g)];
   // In actual articles the class attribute can appear after href.
   const all=[...html.matchAll(/<a\b[^>]*data-av-zoom[^>]*>Forstørr<\/a>/g)];
   assert.equal(all.length,count,filename+" skal vise kun kort lenketekst");
   for(const match of all){
     assert.match(match[0],/aria-label="Forstørr [^"]+"/);
     assert.match(match[0],/href="[^"]+\.svg"/);
   }
 }
});
