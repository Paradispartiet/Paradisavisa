"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const html=read("artikler/2026-11-02-nav-rettigheter-automatisk-hjelp.html");
const comparison=read("Bilder/Artikler/2026-11-12-nav-dagens-ordning-vs-forslag.svg");
const law=read("Bilder/Artikler/2026-11-12-nav-loven-paragrafene-17-20.svg");
test("Kommentar, satirisk originalbilde, dato og kanonisk avisheader bevares",()=>{
 assert.match(html,/<h1 id="artikkeltittel">Når noen ber om hjelp, skal de få hjelp/);
 assert.doesNotMatch(html,/<h1[^>]*class="sr-only"/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.equal((html.match(/<article\b/g)||[]).length,1);
 assert.equal((html.match(/<\/article>/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-02"/);
 assert.match(html,/article:modified_time" content="2026-11-12"/);
 assert.match(html,/Bilder\/nav-satire-skopuss\.jpg/);
 assert.match(html,/[Ee]n allegori over maktubalanse, ikke en faktisk hendelse/);
 assert.match(html,/class="story av-artikkel"/);
 assert.match(html,/class="avisa-article-fallback"/);
 assert.match(html,/artikkel-header\.css/);
 assert.match(html,/artikkel-header\.js/);
 assert.match(html,/artikkel\.css\?v=20261112a/);
 assert.match(html,/artikkel-interaktiv\.js/);
});
test("Kildebasert skille mellom gjeldende rett og redaksjonelt forslag",()=>{
 assert.match(html,/Rett og forslag/);
 assert.match(html,/Alle har rett til å søke om økonomisk sosialhjelp/);
 assert.match(html,/individuell vurdering/);
 assert.match(html,/ikke gjeldende NAV-praksis/);
 assert.match(html,/automatisk den foreslåtte støtten uten søknad/);
 assert.match(html,/er en politisk målsetting, ikke en nåværende generell ytelse/);
 assert.match(html,/I nødsituasjoner skal NAV svare raskt/);
 assert.match(html,/lovdata\.no\/dokument\/NL\/lov\/2009-12-18-131/);
 assert.match(html,/nav\.no\/samarbeidspartner\/tolkning-sosialtjenesteloven/);
 assert.match(html,/nav\.no\/ikke-penger/);
 assert.match(html,/nav\.no\/okonomisk-sosialhjelp/);
 assert.match(html,/Dette er en meningsartikkel/);
});
test("To nye SVG-er forklarer dagens system og loven uten oppdiktede tall",()=>{
 assert.equal((html.match(/<figure\b/g)||[]).length,3);
 assert.equal((html.match(/class="av-zoom-knapp" data-av-zoom/g)||[]).length,2);
 assert.equal((html.match(/>Forstørr<\/a>/g)||[]).length,2);
 assert.match(html,/id="av-zoom-dialog"/);
 for(const svg of [comparison,law]){assert.match(svg,/<title id="t">/);assert.match(svg,/<desc id="d">/);}
 assert.match(comparison,/DAGENS ORDNING/);
 assert.match(comparison,/PARADISAVISAS FORSLAG/);
 assert.match(comparison,/IKKE GJELDENDE ORDNING/);
 for(const p of ["§ 17","§ 18","§ 19","§ 20"])assert.ok(law.includes(p),p+" mangler");
 assert.match(law,/Loven gir individuelle rettigheter/);
});
test("Utfellbar faktaboks, fire forklaringspaneler, kildekatalog og lokal poll",()=>{
 assert.match(html,/details class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 for(const id of ["søknad","data","nød","rettssikkerhet"]){
  assert.ok(html.includes('data-av-step="'+id+'"'),"knapp "+id);
  assert.ok(html.includes('data-av-panel="'+id+'"'),"panel "+id);
 }
 assert.match(html,/data-av-poll="nav-hjelp-trygghet-2026"/);
 assert.match(html,/Ingen fellestall eller prosenter vises/);
 assert.match(html,/<form hidden>/);
 assert.match(html,/class="av-kilder-samlet"/);
});
