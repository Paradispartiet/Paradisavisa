"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {FEEDS,diffFeeds,shorten,clean}=require("./some-pakke.cjs");
function states(oldItems=[],newItems=[],feed="Nyhetshjul.json"){
  const before=Object.fromEntries(FEEDS.map(([name])=>[name,[]]));
  const current=Object.fromEntries(FEEDS.map(([name])=>[name,[]]));
  before[feed]=oldItems;
  current[feed]=newItems;
  return {before,current};
}
const example={title:"Et nytt møte mellom to regjeringer",excerpt:"En faktakontrollert ingress som forteller hva leseren får vite.",
  date:"2026-11-11",url:"artikler/2026-11-11-mote.html",image:"Bilder/Artikler/mote.webp"};
const reader=(rel,encoding)=>rel.endsWith(".html")?
  '<!doctype html><html><head><meta name="robots" content="index,follow"></head><body><figcaption>KI-assistert illustrasjon, ikke fotografi.</figcaption></body></html>':
  Buffer.from("image");
test("ny sak får ett Instagram-kort og X-tekst med klikkbar artikkellenke",()=>{
 const {before,current}=states([],[example]);
 const r=diffFeeds(before,current,reader);
 assert.equal(r.length,1);
 assert.equal(r[0].instagram.footer,"PARADISAVISA");
 assert.match(r[0].instagram.card,/^Bilder\/SoMe\//);
 assert.doesNotMatch(r[0].instagram.footer,/https|www|\./i);
 assert.match(r[0].x.text,/https:\/\/paradispartiet.github.io\/Paradisavisa\/artikler\//);
 assert.ok(r[0].x.text.length<=280);
 assert.match(r[0].instagram.caption,/Bilde: KI-assistert/);
});
test("eksisterende artikkel med endret ingress blir IKKE publisert igjen",()=>{
 const {before,current}=states([example],[{...example,excerpt:"Omskrevet, men samme URL"}]);
 assert.deepEqual(diffFeeds(before,current,reader),[]);
});
test("ett og samme oppslag i flere hjul oppretter bare ett SoMe-innlegg",()=>{
 const {before,current}=states([],[example]);
 current["Nyhetshjul2.json"]=[example];
 assert.equal(diffFeeds(before,current,reader).length,1);
});
test("upubliserte og farlige filstier sperres",()=>{
 const {before,current}=states([],[example]);
 assert.throws(()=>diffFeeds(before,current,()=>'<meta name="robots" content="noindex,follow">'),/Utkast/);
 current["Nyhetshjul.json"]=[{...example,image:"../../hemmelig.png"}];
 assert.throws(()=>diffFeeds(before,current,reader),/Ugyldig/);
});
test("X-tekst holder seg under 280 tegn med lang ingress",()=>{
 const long={...example,excerpt:("Dette er en beskrivende og lesbar setning om saken. ").repeat(18)};
 const {before,current}=states([],[long]);
 const r=diffFeeds(before,current,reader);
 assert.ok(r[0].x.text.length<=280);
 assert.ok(r[0].instagram.cardIngress.length<=145);
});
test("tekst og lenker håndterer HTML-entiteter uten dobbel HTML",()=>{
 assert.equal(clean("Nord &amp; sør <b>i dag</b>"),"Nord & sør i dag");
 assert.equal(shorten("Dette er et eksempel med mange ord",21),"Dette er et eksempel…");
});
