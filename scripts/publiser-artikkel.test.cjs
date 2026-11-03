"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {spawnSync}=require("node:child_process");

const root=path.resolve(__dirname,"..");
const publicationDate="2026-11-03";
const filename="artikler/"+publicationDate+"-faktatest.html";
const imageFile="Bilder/Artikler/"+publicationDate+"-faktatest.svg";
const sourceFile="utkast/2026-10-30/faktatest.html";
const metadataFile="utkast/artikler.json";
const feedFile="Nyhetshjul.json";

function fixture(options={}) {
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),"paradisavisa-publish-test-"));
  const write=(relative,text)=>{
    const absolute=path.join(folder,relative);
    fs.mkdirSync(path.dirname(absolute),{recursive:true});
    fs.writeFileSync(absolute,text,"utf8");
  };
  const article={
    id:"faktatest",
    tittel:"En fiktiv artikkel for regresjonstest",
    kategori:"Samfunn",
    status:options.approved===false?"utkast":"godkjent",
    faktasjekk:options.approved===false?"kreves":"godkjent",
    godkjent:options.approved!==false,
    publisert:false,
    artikkel:sourceFile,
    bilde:"utkast/2026-10-30/bilder/faktatest.svg"
  };
  const another={...article,id:"annen-sak",tittel:"En annen sak i redaksjonell kø",status:"utkast",faktasjekk:"kreves",godkjent:false,artikkel:"utkast/2026-10-30/annen-sak.html",bilde:"utkast/2026-10-30/bilder/annen-sak.svg"};
  write("scripts/publiser-artikkel.cjs",fs.readFileSync(path.join(root,"scripts/publiser-artikkel.cjs"),"utf8"));
  write("scripts/redaksjonelle-sperrer.cjs",fs.readFileSync(path.join(root,"scripts/redaksjonelle-sperrer.cjs"),"utf8"));
  write(metadataFile,JSON.stringify({arbeidsflyt:"fortlopende",artikler:[article,another]},null,2));
  write(feedFile,"[]");
  write("utkast/2026-10-30/bilder/faktatest.svg",'<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  write(sourceFile,[
    '<!doctype html><html lang="no"><head>',
    '<meta name="robots" content="noindex, nofollow">',
    '<meta name="description" content="En prøve-ingress">',
    '<link rel="stylesheet" href="../../styles.css">',
    '<link rel="stylesheet" href="../2026-10-28/redaksjon.css">',
    '</head><body>',
    '<a href="../../index.html">Forside</a>',
    '<p class="utkast-etikett">REDAKSJONELT UTKAST – IKKE PUBLISERT</p>',
    '<p class="utkast-kategori">Samfunn · Utkast</p>',
    '<h1>Fiktiv sak</h1><img src="bilder/faktatest.svg">',
    '<aside><h2>Kilder og dokumentasjon</h2>',
    '<ul><li><a href="https://example.org/rapport">Offentlig kilde</a></li></ul>',
    '<p><strong>Kildesjekk 1. november 2026:</strong> Internt notat</p>',
    '<p><strong>Før publisering:</strong> Siste kontroll</p></aside>',
    options.extraHtml||"",
    '</body></html>'
  ].join("\n"));
  return {
    folder,
    write,
    run:(publish)=>spawnSync(process.execPath,[
      path.join(folder,"scripts/publiser-artikkel.cjs"),"faktatest",publicationDate,
      ...(publish?["--publiser"]:[])
    ],{cwd:folder,encoding:"utf8"}),
    exists:relative=>fs.existsSync(path.join(folder,relative)),
    read:relative=>fs.readFileSync(path.join(folder,relative),"utf8"),
    json:relative=>JSON.parse(fs.readFileSync(path.join(folder,relative),"utf8")),
    cleanup:()=>fs.rmSync(folder,{recursive:true,force:true})
  };
}

test("forhåndsvisning endrer ingen filer eller metadata",()=>{
  const f=fixture();
  try {
    const previous=f.read(metadataFile);
    const result=f.run(false);
    assert.equal(result.status,0,result.stderr);
    assert.match(result.stdout,/FORHÅNDSVISNING/);
    assert.equal(f.exists(filename),false);
    assert.equal(f.exists(imageFile),false);
    assert.equal(f.read(metadataFile),previous);
    assert.deepEqual(f.json(feedFile),[]);
  } finally { f.cleanup(); }
});

test("simulert publisering endrer bare godkjent artikkel og riktig nyhetsstrøm",()=>{
  const f=fixture();
  try {
    const result=f.run(true);
    assert.equal(result.status,0,result.stderr);
    const html=f.read(filename);
    assert.match(html,/content="index, follow"/);
    assert.doesNotMatch(html,/REDAKSJONELT UTKAST/);
    assert.doesNotMatch(html,/Kildesjekk 1\. november/);
    assert.doesNotMatch(html,/Før publisering/);
    assert.match(html,/Kilder og dokumentasjon/);
    assert.match(html,/href="\.\.\/styles\.css"/);
    assert.match(html,/src="\.\.\/Bilder\/Artikler\/2026-11-03-faktatest\.svg"/);
    assert.equal(f.exists(imageFile),true);
    const queue=f.json(metadataFile).artikler;
    assert.equal(queue[0].status,"publisert");
    assert.equal(queue[0].godkjent,true);
    assert.equal(queue[0].publisert,true);
    assert.equal(queue[0].publisert_url,filename);
    assert.equal(queue[0].publisert_dato,publicationDate);
    assert.equal(queue[1].status,"utkast");
    assert.equal(queue[1].publisert,false);
    const feed=f.json(feedFile);
    assert.equal(feed.length,1);
    assert.equal(feed[0].url,filename);
    assert.equal(feed[0].image,imageFile);
  } finally { f.cleanup(); }
});

for(const link of [
  "annen-sak.html",
  "../2026-10-28/cyberrisiko.html",
  "/utkast/2026-10-30/annen-sak.html",
  "https://example.org/utkast/2026-10-30/annen-sak.html"
]){
  test("simulert publisering avvises ved utkastlenke: "+link,()=>{
    const f=fixture({extraHtml:'<a href="'+link+'">Utkast</a>'});
    try {
      const before=f.read(metadataFile);
      const result=f.run(true);
      assert.notEqual(result.status,0);
      assert.match(result.stderr,/lenker til upubliserte artikler/);
      assert.equal(f.exists(filename),false);
      assert.equal(f.exists(imageFile),false);
      assert.equal(f.read(metadataFile),before);
      assert.deepEqual(f.json(feedFile),[]);
    } finally { f.cleanup(); }
  });
}

test("simulert publisering avviser ukontrollert utkast",()=>{
  const f=fixture({approved:false});
  try {
    const result=f.run(true);
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/individuell kildekontroll/);
    assert.equal(f.exists(filename),false);
    assert.deepEqual(f.json(feedFile),[]);
  } finally { f.cleanup(); }
});
