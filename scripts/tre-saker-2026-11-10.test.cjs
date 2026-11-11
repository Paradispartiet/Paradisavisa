"use strict";
// Paradisavisa: teknisk integritet for fire ulike redaksjonsbilder.
// Bildekritikk og lisensvurdering krever fortsatt redaksjonell kontroll.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const cards=JSON.parse(read("Nyhetshjul.json"));
const base="https://paradispartiet.github.io/Paradisavisa/";
const items=[
{article:"artikler/2026-11-10-massie-hegseth-riksrettsforslag.html",image:"Bilder/Artikler/2026-11-11-hegseth-votering-grafikk.webp",svg:"Bilder/Artikler/2026-11-11-hegseth-votering-grafikk.svg",sha:"fd1a138a92b467b81a4ad12c5781e1d48c16677e",sources:13,modified:true},
{article:"artikler/2026-11-10-hvem-skal-fa-norges-strom.html",image:"Bilder/Artikler/2026-11-10-datasentre-kraftnett.webp",sha:"b4a8b953d659da15043445a2b1cc5ca3beb9cd4f",sources:9},
{article:"artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html",image:"Bilder/Artikler/2026-11-11-gamle-munch-arkivfoto.webp",sha:"3106e3e9fe493691d859cd810a4edca8cf9639dd",sources:11,photo:true,modified:true},
{article:"artikler/2026-11-05-usa-valget-topartisystem-og-medier.html",image:"Bilder/Artikler/2026-11-05-usa-ludo-politisk-satire.jpg",sha:"df217d18d67963da2fdf9c6f07bdb02f09f12de2",mime:"image/jpeg"}
];
test("de fire synlige bildene er ulike og kortene har riktige lenker",()=>{
 const urls=cards.map(c=>c.url);
 assert.equal(new Set(urls).size,urls.length);
 assert.equal(new Set(items.map(i=>i.image)).size,4);
 for(const item of items){
  const found=cards.filter(c=>c.url===item.article);
  assert.equal(found.length,1);
  assert.equal(found[0].image,item.image);
 }
});
for(const item of items){
 test("artikkel og bildemetadata: "+item.article,()=>{
  const html=read(item.article);
  const card=cards.find(c=>c.url===item.article);
  const full=base+item.image;
  assert.ok(html.includes('src="../'+item.image+'"'));
  assert.ok(html.includes('property="og:image" content="'+full+'"'));
  assert.ok(html.includes('name="twitter:image" content="'+full+'"'));
  if(item.mime)assert.ok(html.includes('property="og:image:type" content="'+item.mime+'"'));
  assert.ok(html.includes('property="og:image:alt"'));
  assert.ok(html.includes('rel="canonical" href="'+base+item.article+'"'));
  assert.ok(html.includes('article:published_time" content="'+card.date+'"'));
  if(item.modified)assert.ok(html.includes('article:modified_time" content="2026-11-11"'));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/<figcaption class="story-caption">[\s\S]*?<\/figcaption>/);
  assert.ok(!html.includes("Vurderingsbilde – ikke endelig godkjent"));
  assert.ok(!html.includes('name="robots" content="noindex'));
  if(item.photo){
   assert.match(html,/J\. P\. Fagerback/);
   assert.match(html,/18\. juni 2005/);
   assert.match(html,/Arkivfoto/);
   const license=read("Bilder/Artikler/2026-11-11-gamle-munch-arkivfoto-LISENS.md");
   assert.match(license,/BSD-3-Clause/);
   assert.match(license,/c01b527e1ec263ef76b7e36b371f7c4f5af3906f/);
  }
  if(item.svg){
   const svg=read(item.svg).trim();
   assert.ok(svg.startsWith("<svg")&&svg.endsWith("</svg>"));
   assert.match(svg,/<title/);
   assert.match(svg,/<desc/);
   assert.doesNotMatch(svg,/<image\b[^>]*href/i);
  }
  if(item.sources){
   const anchors=new Set([...html.matchAll(/id="k(\d+)"/g)].map(m=>m[1]));
   const citations=new Set([...html.matchAll(/href="#k(\d+)"/g)].map(m=>m[1]));
   assert.ok(anchors.size>=item.sources);
   for(const n of citations)assert.ok(anchors.has(n));
  }
 });
 test("WebP-filen er uendret fra kontrollert original og 1600×900: "+item.image,()=>{
  const bytes=fs.readFileSync(path.join(root,item.image));
  assert.ok(bytes.length>20000&&bytes.length<900000);
  if(item.mime==="image/jpeg"){
   assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);
   assert.equal(bytes[bytes.length-2],0xff);assert.equal(bytes[bytes.length-1],0xd9);
   return;
  }
  assert.equal(bytes.toString("ascii",0,4),"RIFF");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
  const sha=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
  assert.equal(sha,item.sha,"image changed after editorial review");
  const chunk=bytes.toString("ascii",12,16);
  if(chunk==="VP8 "){
   assert.equal(bytes.readUInt16LE(26)&0x3fff,1600);
   assert.equal(bytes.readUInt16LE(28)&0x3fff,900);
  }else if(chunk==="VP8X"){
   assert.equal(bytes.readUIntLE(24,3)+1,1600);
   assert.equal(bytes.readUIntLE(27,3)+1,900);
  }else assert.fail("unexpected WebP chunk "+chunk);
 });
}
test("kildebelagte resultater og lovforslag beholdes uforandret",()=>{
 const hegs=read(items[0].article),data=read(items[1].article);
 assert.match(hegs,/211(?:–|-)204|211 mot 204/i);
 assert.match(hegs,/H\. Res\. 1655/);
 assert.match(hegs,/Roll Call 317/);
 assert.match(hegs,/Hegseth ble ikke stilt for riksrett/i);
 assert.match(data,/forslaget er ikke vedtatt|ikke vedtatte regler/i);
 assert.match(data,/over 1 MW|over én megawatt/i);
});
