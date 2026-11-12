"use strict";
// Målrettet kvalitetskontrakt for 7 originale redaksjonelle bildemotiver.
// Låser ikke artiklene permanent til utkaststatus – etter godkjenning kan de publiseres.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(read(p).toString("utf8"));
const manifest=json("redaksjon/illustrasjoner/2026-11-12/manifest.json");
const queue=json("utkast/artikler.json").artikler;
const streams={
  "Nyhetshjul.json":json("Nyhetshjul.json"),
  "Nyhetshjul2.json":json("Nyhetshjul2.json"),
  "Kulturhjul.json":json("Kulturhjul.json")
};
const expected={
  "boligopproret-spania":["Nyheter – verden og samfunn","Nyhetshjul.json"],
  "appene-som-manipulerer":["Feature – teknologi og forbruker","Nyhetshjul2.json"],
  "nussir-hvem-eier-kobberet":["Nyheter – politikk og næringsliv","Nyhetshjul.json"],
  "smabarnsforeldre-jobbpress":["Nyheter – arbeidsliv og familie","Nyhetshjul.json"],
  "gullbjornen-kasakhstan":["Nyheter – forskning og historie","Nyhetshjul.json"],
  "avedon-fotografen-amerika":["Kultur – film og fotografi","Kulturhjul.json"],
  "norge-vannlekkasjer":["Nyheter – samfunn og infrastruktur","Nyhetshjul.json"]
};
const digest=b=>crypto.createHash("sha256").update(b).digest("hex");

test("Eksakt sju ulike originaler, WebP-filer og korrekt redaksjonell kategori",()=>{
 assert.equal(manifest.items.length,7);
 assert.deepEqual(new Set(manifest.items.map(x=>x.slug)),new Set(Object.keys(expected)));
 assert.equal(manifest.publication_approved,false,"Bildekandidatene kan ikke automatisk godkjennes");
 const hashes=new Set();
 for(const item of manifest.items){
  const slug=item.slug;
  assert.deepEqual([item.width,item.height],[1600,900]);
  const original=read(item.source),webp=read(item.file);
  assert.equal(digest(original),item.source_sha256,slug+": originalen er endret");
  assert.equal(digest(webp),item.webp_sha256,slug+": WebP-originalen er endret");
  assert.ok(webp.length>10000&&webp.length===item.bytes);
  assert.equal(webp.toString("ascii",0,4),"RIFF");
  assert.equal(webp.toString("ascii",8,12),"WEBP");
  assert.ok(!hashes.has(item.webp_sha256),"To bilder har samme innhold");
  hashes.add(item.webp_sha256);
  const entry=queue.find(x=>x.id===slug+"-20261112");
  assert.ok(entry,slug+": ikke registrert i køen");
  assert.equal(entry.kategori,expected[slug][0]);
  assert.equal(entry.bilde,item.file);
  const html=read(entry.artikkel).toString("utf8");
  assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
  assert.ok(html.includes('src="bilder/'+slug+'.webp"'));
  assert.ok(html.includes(item.caption));
  const occurrences=Object.entries(streams).flatMap(([name,feed])=>feed.filter(c=>c.url===entry.publisert_url).map(()=>name));
  if(entry.publisert){
   assert.equal(entry.status,"publisert");
   assert.deepEqual(occurrences,[expected[slug][1]],slug+": feil offentlig seksjon");
  }else{
   assert.equal(entry.status,"utkast");
   assert.equal(entry.godkjent,false);
   assert.equal(occurrences.length,0,slug+": ikke-godkjent sak på forsiden");
  }
 }
});
