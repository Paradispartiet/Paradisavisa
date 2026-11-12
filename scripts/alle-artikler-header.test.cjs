"use strict";
const fs=require("node:fs"),path=require("node:path"),test=require("node:test"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const dir=path.join(root,"artikler");
const articles=fs.readdirSync(dir).filter(p=>p.endsWith(".html"));
const header=fs.readFileSync(path.join(root,"header.html"),"utf8");
const canonical=[...header.matchAll(/<a\s+href="([^"]+)"/g)].map(x=>x[1]).filter(x=>!["index.html"].includes(x));
test("Alle publiserte HTML-artikler har fungerende felles toppmeny eller statisk fallback",()=>{
 assert.ok(articles.length>=40,"uventet få artikler");
 for(const name of articles){
  const html=fs.readFileSync(path.join(dir,name),"utf8");
  const existing=/id=["']header-placeholder["']/.test(html)&&/src=["'][^"']*script\.js/.test(html)&&/href=["'][^"']*styles\.css/.test(html)&&/class=["']avisa-article-fallback["']/.test(html)&&/href=["'][^"']*artikkel-header\.css/.test(html);
  const fallback=/class=["']avisa-article-fallback["']/.test(html)&&/href=["'][^"']*artikkel-header\.css/.test(html)&&/src=["'][^"']*artikkel-header\.js/.test(html);
  assert.ok(existing||fallback,name+": mangler felles header, meny eller script");
  if(existing||fallback){
   assert.equal((html.match(/class="avisa-article-fallback"/g)||[]).length,1,name+": manglende eller duplisert fallback");
   assert.match(html,/<details class="pa-menu">/,name+": meny må virke uten JS");
   assert.match(html,/<nav aria-label="Hovedmeny">/);
   for(const href of canonical)assert.ok(html.includes('href="../'+href+'"'),name+": mangler navigasjonslenken "+href);
  }
 }
});
test("Felles nav-kilde og fallback har samme destinations- og menydekning",()=>{
 assert.ok(canonical.length>=10);
 const js=fs.readFileSync(path.join(root,"artikkel-header.js"),"utf8");
 const css=fs.readFileSync(path.join(root,"artikkel-header.css"),"utf8");
 assert.match(js,/new URL\("header\.html",root\)/);
 assert.match(js,/if\(!fallback\|\|document\.getElementById\("header-placeholder"\)\)return/);
 assert.match(css,/\.avisa-article-fallback/);
 assert.match(css,/\.avisa-artikkel-injisert/);
 assert.match(js,/fallback\.replaceWith\(header\)/);
});
