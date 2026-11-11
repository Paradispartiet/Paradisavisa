"use strict";
// Paradisavisa: kontroller illustrasjonenes opprinnelse, variasjon og nyhetskort.
// Denne testen er teknisk og erstatter ikke redaksjonell faktasjekk.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const cards=JSON.parse(read("Nyhetshjul.json"));
const rootUrl="https://paradispartiet.github.io/Paradisavisa/";
const museumPhoto="https://upload.wikimedia.org/wikipedia/commons/c/cb/Munch_museet_T%C3%B8yen_18jun2005.jpg";
const stories=[
 {url:"artikler/2026-11-10-massie-hegseth-riksrettsforslag.html",image:"Bilder/Artikler/2026-11-11-hegseth-votering-grafikk.svg",sources:13,kind:"graphic"},
 {url:"artikler/2026-11-10-hvem-skal-fa-norges-strom.html",image:"Bilder/Artikler/2026-11-11-kraftnett-datasenter-grafikk.svg",sources:9,kind:"graphic"},
 {url:"artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html",image:museumPhoto,sources:11,kind:"photo"},
 {url:"artikler/2026-11-05-usa-valget-topartisystem-og-medier.html",image:"Bilder/Artikler/2026-11-11-usa-valg-spillgrafikk.svg",kind:"graphic"}
];
test("fire ulike bilder og de rette forsidekortene",()=>{
 const links=cards.map(x=>x.url);
 assert.equal(new Set(links).size,links.length,"dupliserte nyhetskort");
 const hero=stories.map(s=>{
   const matches=cards.filter(c=>c.url===s.url);
   assert.equal(matches.length,1,"mangler forsidekort for "+s.url);
   assert.equal(matches[0].image,s.image);
   return s.image;
 });
 assert.equal(new Set(hero).size,4,"alle fire motiver skal være ulike");
});
for(const s of stories){
 test("artikkel, bilde og delingsmetadata: "+s.url,()=>{
   const html=read(s.url);
   const card=cards.find(x=>x.url===s.url);
   const imageUrl=s.kind==="photo"?s.image:rootUrl+s.image;
   const imageSrc=s.kind==="photo"?s.image:"../"+s.image;
   assert.ok(html.includes('src="'+imageSrc+'"'),"feil bildebane");
   assert.ok(html.includes('property="og:image" content="'+imageUrl+'"'),"og:image peker feil");
   assert.ok(html.includes('name="twitter:image" content="'+imageUrl+'"'),"twitter:image peker feil");
   assert.ok(html.includes('rel="canonical" href="'+rootUrl+s.url+'"'),"canonical peker feil");
   assert.ok(html.includes('property="og:image:alt"'),"alt-tekst for delingsbilde mangler");
   assert.ok(html.includes('article:published_time" content="'+card.date+'"'));
   assert.ok(html.includes('article:modified_time" content="2026-11-11"'));
   assert.equal((html.match(/<h1\b/g)||[]).length,1,"én h1");
   assert.ok(html.includes("<figcaption"),"mangler bildetekst");
   assert.ok(!html.includes("Vurderingsbilde – ikke endelig godkjent"));
   if(s.kind==="photo"){
     assert.match(html,/Arkivfoto av det faktiske Munchmuseet på Tøyen/);
     assert.match(html,/J\. P\. Fagerback/);
     assert.match(html,/18\. juni 2005/);
     assert.match(read("Bilder/Artikler/2026-11-11-gamle-munch-arkivfoto-LISENS.md"),/BSD-3-Clause/);
   }else{
     const svg=read(s.image).trim();
     assert.ok(svg.startsWith("<svg")&&svg.endsWith("</svg>"),"ikke SVG");
     assert.ok(svg.length>2000,"tom eller ufullstendig grafikk");
     assert.match(svg,/<title/);
     assert.match(svg,/<desc/);
     assert.doesNotMatch(svg,/<image\b[^>]*href/i,"grafikken skal ikke hente eksterne illustrasjoner");
   }
   if(s.sources){
     const anchors=new Set([...html.matchAll(/id="k(\d+)"/g)].map(m=>m[1]));
     const citations=new Set([...html.matchAll(/href="#k(\d+)"/g)].map(m=>m[1]));
     assert.ok(anchors.size>=s.sources,"for få kildeanker");
     for(const n of citations)assert.ok(anchors.has(n),"mangler kildeanker k"+n);
   }
 });
}
test("Hegseths votering og det ikke vedtatte datasenterforslaget omtales korrekt",()=>{
 const h=read(stories[0].url);
 assert.match(h,/211(?:–|-)204|211 mot 204/i);
 assert.match(h,/H\. Res\. 1655/);
 assert.match(h,/Roll Call 317/);
 assert.match(h,/Hegseth ble ikke stilt for riksrett/i);
 const d=read(stories[1].url);
 assert.match(d,/forslaget er ikke vedtatt|ikke vedtatte regler/i);
 assert.match(d,/over 1 MW|over én megawatt/i);
});
