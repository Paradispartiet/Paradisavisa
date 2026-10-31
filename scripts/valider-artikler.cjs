/* Paradisavisa: teknisk kontroll av løpende artikkelkø.
   Kjør: node scripts/valider-artikler.cjs
   Dette er IKKE en automatisk faktasjekk eller publiseringsgodkjenning. */
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const errors=[];
let inspected=0;
function read(relative) {
  const filename=path.resolve(root,relative);
  if(!filename.startsWith(root+path.sep)){
    errors.push("Ulovlig filbane: "+relative);return "";
  }
  if(!fs.existsSync(filename)){
    errors.push("Mangler: "+relative);return "";
  }
  return fs.readFileSync(filename,"utf8");
}
function expect(ok,description){if(!ok)errors.push(description);}
const home=read("index.html");
expect(home.includes("Objektivt sett, fra vår synsvinkel."),"Motto mangler på forsiden");
expect(home.includes('class="tittellinje avis-topp avis-masthead"'),"Klassisk avisoverskrift mangler");
expect(home.includes('aria-controls="avis-hovedmeny"'),"Menyknappen mangler");
expect(home.includes('href="avisdesign.css?v=2"'),"Forsiden mangler redaksjonelt designsystem");
expect(home.includes('class="avis-ledergrid"'),"Forsiden mangler definert hovedsak");
const design=read("avisdesign.css");
expect(design.includes("grid-row:1/span 2"),"Hovedsaken mangler stor layout på PC");
expect(design.includes("grid-template-columns:minmax(0,1fr)"),"Mobiloppsettet mangler enkeltkolonne");
const sport=read("sport.html");
const notiser=read("notiser.html");
expect(!sport.includes('class="sport-banner"'),"Sportssiden skal ikke bruke ekstra gul tittelbjelke");
expect(sport.includes('class="arkiv-hoved sport-arkiv-hoved"'),"Sport mangler felles avisside-layout");
expect(notiser.includes('class="arkiv-hoved notis-arkiv-hoved"'),"Notisarkivet mangler avisside-layout");
expect(design.includes(".notiser-side .notisgrid"),"Notisarkivet mangler lesbart grid");


const css=read("styles.css");
expect(css.includes("--yellow: #FFD600")&&css.includes("--bg: #000"),"Svart/gul fargeprofil er endret");
try{new Function(read("script.js"))}catch(e){errors.push("Ugyldig JavaScript: "+e.message)}
const queuePage=read("utkast/index.html");
expect(queuePage.includes('name="robots" content="noindex, nofollow"'),"Artikkelkøen må være noindex");
expect(queuePage.includes("fortløpende"),"Løpende publiseringsmodell mangler i køvisningen");
expect(!queuePage.includes("Utgaver til gjennomgang"),"Gammelt utgavesystem vises fremdeles");
let catalog;
try{catalog=JSON.parse(read("utkast/artikler.json"))}catch(e){errors.push("Ugyldig artikkelkø: "+e.message);catalog={}}
expect(catalog.arbeidsflyt==="fortlopende","Arbeidsflyt må være fortlopende");
expect(Array.isArray(catalog.artikler)&&catalog.artikler.length>0,"Artikkelkø er tom");
const ids=new Set(),articleFiles=new Set(),allowed=new Set(["utkast","arkivert","godkjent","publisert"]);
for(const article of catalog.artikler||[]){
  const slug=String(article.id||"");
  expect(/^[a-z0-9-]+$/.test(slug),"Ugyldig artikkel-ID: "+slug);
  expect(!ids.has(slug),"Duplisert artikkel-ID: "+slug);
  ids.add(slug);
  expect(typeof article.tittel==="string"&&article.tittel.length>9,"Mangler tittel: "+slug);
  expect(typeof article.kategori==="string"&&article.kategori.length>1,"Mangler kategori: "+slug);
  expect(allowed.has(article.status),"Ukjent arbeidsstatus for "+slug);
  const htmlPath=article.artikkel;
  const imagePath=article.bilde;
  if(typeof htmlPath!=="string"||!/^utkast\/\d{4}-\d{2}-\d{2}\/[a-z0-9-]+\.html$/.test(htmlPath)){
    errors.push("Ugyldig artikkelbane: "+slug);continue;
  }
  expect(!articleFiles.has(htmlPath),"Artikkelen finnes to ganger i køen: "+htmlPath);
  articleFiles.add(htmlPath);
  const html=read(htmlPath);
  expect(html.includes('<main')&&html.includes("</html>"),"Ufullstendig HTML: "+htmlPath);
  expect((html.match(/<h1\b/g)||[]).length===1,"Artikkelen må ha én h1: "+htmlPath);
  expect(html.includes("Kilder og dokumentasjon"),"Kildeliste mangler: "+htmlPath);
  expect(html.includes("Objektivt sett, fra vår synsvinkel."),"Motto mangler: "+htmlPath);
  expect(/<meta[^>]*name="robots"[^>]*noindex/.test(html),"Utkast må være noindex: "+htmlPath);
  expect(article.godkjent===false||article.godkjent===true,"Godkjenningsstatus mangler: "+htmlPath);
  expect(article.publisert===false||article.publisert===true,"Publiseringsstatus mangler: "+htmlPath);
  if(!article.godkjent) {
    expect(article.publisert===false,"Ikke-godkjent artikkel kan ikke publiseres: "+htmlPath);
    expect(/(?:REDAKSJONELT|ARKIVERT) UTKAST/.test(html),"Tydelig utkastmerking mangler: "+htmlPath);
  }
  if(article.publisert===true) {
    expect(article.status==="publisert"&&article.godkjent===true&&article.faktasjekk==="godkjent",
      "Publisert artikkel krever dokumentert individuell godkjenning: "+htmlPath);
    expect(typeof article.publisert_dato==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(article.publisert_dato),
      "Publisert artikkel mangler dato: "+htmlPath);
    expect(typeof article.publisert_url==="string"&&/^artikler\/[a-z0-9-]+\.html$/.test(article.publisert_url),
      "Publisert artikkel mangler gyldig offentlig filbane: "+htmlPath);
    if(typeof article.publisert_url==="string"&&/^artikler\/[a-z0-9-]+\.html$/.test(article.publisert_url)) {
      const publicHtml=read(article.publisert_url);
      expect(publicHtml.includes('name="robots" content="index, follow"'),
        "Publisert artikkel må være tilgjengelig for søk: "+article.publisert_url);
    }
  }
  if(typeof imagePath!=="string"||!/^utkast\/\d{4}-\d{2}-\d{2}\/bilder\/[a-z0-9-]+\.svg$/.test(imagePath)){
    errors.push("Ugyldig bildebane: "+slug);
  }else{
    const svg=read(imagePath);
    expect(svg.trimStart().startsWith("<svg")&&svg.trimEnd().endsWith("</svg>"),"Feil SVG: "+imagePath);
    const relative=imagePath.replace(/^utkast\/\d{4}-\d{2}-\d{2}\//,"");
    expect(html.includes('src="'+relative+'"'),"Artikkel mangler bilde: "+htmlPath);
  }
  inspected++;
}
for(const name of ["Nyhetshjul.json","Nyhetshjul2.json","Kulturhjul.json","Sportshjul.json","kommentarer.json"]){
  const src=read(name);
  let feed=[];
  try{feed=JSON.parse(src)}catch(e){errors.push("Ugyldig JSON i "+name)}
  if(!Array.isArray(feed))errors.push("Nyhetsstrøm må være en liste: "+name);
  for(const item of Array.isArray(feed)?feed:[]){
    if(typeof item.url==="string"&&item.url.includes("utkast/"))
      errors.push("Utkast lekket til offentlig nyhetsstrøm: "+name+" "+item.url);
  }
}
if(errors.length){
  console.error(errors.map(e=>"FEIL: "+e).join("\n"));
  process.exitCode=1;
}else{
  console.log("OK: "+inspected+" individuelle artikler i løpende redaksjonell kø kontrollert.");
  console.log("Ingen utkast ligger i offentlig nyhetsstrøm. Faktasjekk utføres manuelt.");
}
