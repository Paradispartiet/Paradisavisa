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
 assert.match(h,/<link rel="stylesheet" href="\.\.\/artikkel\.css">/);
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
