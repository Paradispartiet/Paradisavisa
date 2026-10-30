/* Paradisavisa: teknisk kontroll av utkast (ikke journalistisk faktasjekk).
   Kjør: node scripts/valider-utgaver.cjs */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const errors = [];
let checked = 0;
function file(name) {
  const p=path.join(root,name);
  if(!fs.existsSync(p)){errors.push("Mangler fil: "+name);return "";}
  return fs.readFileSync(p,"utf8");
}
function check(valid,message){if(!valid)errors.push(message);}
const home=file("index.html");
check(home.includes("Objektivt sett, fra vår synsvinkel."),"Motto mangler på forsiden");
check(home.includes('id="avis-hovedmeny"'),"Hovedmenyen mangler");
const css=file("styles.css");
check(css.includes("--yellow: #FFD600")&&css.includes("--bg: #000"),"Partifargene er endret");
try { new Function(file("script.js")); } catch(e) { errors.push("Ugyldig JavaScript: "+e.message); }
const draftRoot=path.join(root,"utkast");
const dates=fs.existsSync(draftRoot)?fs.readdirSync(draftRoot).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)):[];
for(const date of dates){
  const base="utkast/"+date;
  if(!fs.existsSync(path.join(root,base,"utgave.json")))continue;
  let manifest;
  try{manifest=JSON.parse(file(base+"/utgave.json"))}
  catch(e){errors.push("Ugyldig manifest "+date+": "+e.message);continue}
  check(manifest.dato===date,"Feil dato i "+date);
  check(Array.isArray(manifest.saker)&&manifest.saker.length>0,"Manglende saksliste "+date);
  const index=file(base+"/index.html");
  const unique=new Set();
  for(const story of manifest.saker||[]){
    const name=story.fil;
    if(typeof name!=="string"||!/^[a-z0-9-]+\.html$/.test(name)){
      errors.push("Ugyldig artikkelnavn i "+date);continue
    }
    check(!unique.has(name),"Duplisert artikkel "+date+"/"+name);
    unique.add(name);
    check(index.includes('href="'+name+'"'),"Manglende oversiktslenke "+date+"/"+name);
    const html=file(base+"/"+name);
    if(!html)continue;
    check((html.match(/<h1\b/g)||[]).length===1,"For mange/få h1: "+name);
    check(html.includes("<main")&&html.includes("</html>"),"Ufullstendig HTML: "+name);
    check(html.includes("Kilder og dokumentasjon"),"Mangler kilder: "+name);
    check(html.includes("Objektivt sett, fra vår synsvinkel."),"Mangler motto: "+name);
    if(story.godkjent!==true){
      check(html.includes('name="robots" content="noindex, nofollow"'),"Utkast uten noindex: "+name);
      check(html.includes("REDAKSJONELT UTKAST"),"Utkast uten merking: "+name);
    }
    const img=story.bilde;
    if(typeof img!=="string"||!/^bilder\/[a-z0-9-]+\.svg$/.test(img)){
      errors.push("Ugyldig bilde for "+name);
    } else {
      check(html.includes('src="'+img+'"'),"Feil bildelenke: "+name);
      const svg=file(base+"/"+img);
      check(svg.trimStart().startsWith("<svg")&&svg.trimEnd().endsWith("</svg>"),"Feil i SVG: "+img);
    }
    checked++;
  }
}
for(const name of ["Nyhetshjul.json","Nyhetshjul2.json","Kulturhjul.json"]){
  const s=file(name);
  check(!s.includes('"utkast/'),"Utkast i offentlig nyhetsstrøm: "+name);
  try{JSON.parse(s)}catch(e){errors.push("Ugyldig JSON: "+name)}
}
if(errors.length){
  console.error(errors.map(e=>"FEIL: "+e).join("\n"));
  process.exitCode=1;
} else {
  console.log("OK: "+checked+" redaksjonelle utkast og lenker kontrollert.");
  console.log("Faktasjekk og publiseringsgodkjenning må fortsatt gjøres manuelt.");
}
