"use strict";
// Sikrer at akkurat de godkjente rasterfilene er lastet opp og brukt overalt.
// Denne testen skal feile mens bildefilene mangler på PR-grenen.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const feed=JSON.parse(fs.readFileSync(path.join(root,"Nyhetshjul2.json"),"utf8"));
const site="https://paradispartiet.github.io/Paradisavisa/";
const items=[
 {title:"Bankene tjener milliarder – hvem betaler?",page:"artikler/2026-11-10-bankene-tjener-milliarder.html",image:"Bilder/Artikler/feature06-bankene-hovedbilde-2026-11-11.webp",gitSha:"8896cd1a32a2520f27427b60bfe188d70052e861"},
 {title:"Kan Norden frigjøre seg fra teknologigigantene?",page:"artikler/2026-11-10-norden-teknologigigantene.html",image:"Bilder/Artikler/feature07-nordisk-digital-suverenitet-hovedbilde-2026-11-11.webp",gitSha:"715b369a73c4867080db89e75579adf94ab30756"}
];
for(const item of items){
 test("Godkjent raster WebP 1600x900: "+item.image,()=>{
  const bytes=fs.readFileSync(path.join(root,item.image));
  assert.ok(bytes.length>20000&&bytes.length<600000);
  assert.equal(bytes.toString("ascii",0,4),"RIFF");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
  const sha=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\\0")).update(bytes).digest("hex");
  assert.equal(sha,item.gitSha,"Riktig godkjent rasterfil må lastes opp uten endringer");
  const kind=bytes.toString("ascii",12,16);
  if(kind==="VP8 "){
   assert.equal(bytes.readUInt16LE(26)&0x3fff,1600);
   assert.equal(bytes.readUInt16LE(28)&0x3fff,900);
  }else if(kind==="VP8X"){
   assert.equal(bytes.readUIntLE(24,3)+1,1600);
   assert.equal(bytes.readUIntLE(27,3)+1,900);
  }else assert.fail("Uventet WebP-format: "+kind);
 });
 test("Riktig Feature-kort, artikkel og delingsmetadata: "+item.title,()=>{
  const card=feed.find(c=>c.title===item.title);
  assert.ok(card);
  assert.equal(card.image,item.image);
  const html=fs.readFileSync(path.join(root,item.page),"utf8");
  assert.ok(html.includes('src="../'+item.image+'"'));
  assert.ok(html.includes('property="og:image" content="'+site+item.image+'"'));
  assert.ok(html.includes('name="twitter:image" content="'+site+item.image+'"'));
  assert.match(html,/<meta property="og:image:alt" content="KI-assistert illustrasjon/);
  assert.match(html,/Ikke dokumentarfotografi|ikke dokumentarfotografi/);
  assert.ok(html.includes('article:published_time" content="2026-11-10"'));
  assert.ok(html.includes('article:modified_time" content="2026-11-11"'));
 });
}
