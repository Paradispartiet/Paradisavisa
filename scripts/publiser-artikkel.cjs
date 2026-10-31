/* Paradisavisa: klargjør kun EN godkjent artikkel i lokal arbeidskopi.
   node scripts/publiser-artikkel.cjs artikkel-id YYYY-MM-DD           (vis plan)
   node scripts/publiser-artikkel.cjs artikkel-id YYYY-MM-DD --publiser
   Ingen push eller merge; status og faktakontroll må være godkjent. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
const [id,date,flag]=process.argv.slice(2);
function stop(msg){console.error("Publisering avvist: "+msg);process.exit(1)}
function read(p){return fs.readFileSync(path.join(root,p),"utf8")}
function json(p){return JSON.parse(read(p))}
function write(p,src){const name=path.join(root,p);fs.mkdirSync(path.dirname(name),{recursive:true});fs.writeFileSync(name,src,"utf8")}
function validDate(d){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d||""))return false;
 const t=new Date(d+"T12:00:00Z");
 return Number.isFinite(t.getTime())&&t.toISOString().slice(0,10)===d;
}
if(!/^[a-z0-9-]+$/.test(id||"")||!validDate(date)||![undefined,"--publiser"].includes(flag))
 stop("Bruk: node scripts/publiser-artikkel.cjs <id> <YYYY-MM-DD> [--publiser]");
const source="utkast/artikler.json",queue=json(source);
if(queue.arbeidsflyt!=="fortlopende"||!Array.isArray(queue.artikler))stop("Ugyldig artikkelkø");
const a=queue.artikler.find(x=>x.id===id);
if(!a)stop("Ukjent artikkel-ID");
if(a.publisert||a.status==="publisert")stop("Allerede publisert");
if(a.status!=="godkjent"||a.godkjent!==true||a.faktasjekk!=="godkjent")
 stop("Artikkelen krever individuell kildekontroll og eksplisitt redaksjonell godkjenning");
if(!/^utkast\/\d{4}-\d{2}-\d{2}\/[a-z0-9-]+\.html$/.test(a.artikkel)||
   !/^utkast\/\d{4}-\d{2}-\d{2}\/bilder\/[a-z0-9-]+\.svg$/.test(a.bilde))
 stop("Ugyldig filbane");
const draft=read(a.artikkel),image=read(a.bilde);
if(!draft.includes("REDAKSJONELT UTKAST")||!draft.includes("Kilder og dokumentasjon"))
 stop("Utkastet mangler tydelig merking eller kilder");
if(!image.startsWith("<svg")||!image.trimEnd().endsWith("</svg>"))stop("Ugyldig SVG");
if(/href="\.\.\/\d{4}-\d{2}-\d{2}\/[^"]+\.html"/.test(draft))
 stop("Utkastet lenker til en annen upublisert artikkel – oppdater lenken først");
const publicHtml="artikler/"+date+"-"+id+".html";
const publicImage="Bilder/Artikler/"+date+"-"+id+".svg";
if(fs.existsSync(path.join(root,publicHtml))||fs.existsSync(path.join(root,publicImage)))
 stop("En av publiseringsfilene eksisterer allerede");
const category=String(a.kategori||"").toLocaleLowerCase("nb-NO");
const feed=/kultur|film|musikk|scenekunst/.test(category)?"Kulturhjul.json":
 /sport|idrett/.test(category)?"Sportshjul.json":
 /kommentar|mening/.test(category)?"kommentarer.json":"Nyhetshjul.json";
const articles=json(feed);
if(!Array.isArray(articles)||articles.some(x=>x.title===a.tittel||x.url===publicHtml))
 stop("Strømmen er ugyldig eller har allerede denne saken");
const excerpt=(draft.match(/<meta name="description" content="([^"]+)"/)||[])[1];
if(!excerpt)stop("Ingen ingress i utkastet");
const imageName=a.bilde.split("/").slice(-2).join("/");
if(!draft.includes('src="'+imageName+'"'))stop("Bildebanen i utkastet stemmer ikke");
const pretty=new Intl.DateTimeFormat("nb-NO",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(date+"T12:00:00Z"));
let html=draft.replace('<meta name="robots" content="noindex, nofollow">',
 '<meta name="robots" content="index, follow">\n<meta property="article:published_time" content="'+date+'">')
 .replaceAll('href="../../index.html"','href="../index.html"')
 .replaceAll('href="../../styles.css"','href="../styles.css"')
 .replaceAll('href="../2026-10-28/redaksjon.css"','href="../utkast/2026-10-28/redaksjon.css"')
 .replace('src="'+imageName+'"','src="../'+publicImage+'"')
 .replace(/<p class="utkast-etikett">REDAKSJONELT UTKAST[^<]*<\/p>/,"")
 .replace(/<p class="utkast-kategori">([^<]*)<\/p>/,
  (_,label)=>'<p class="utkast-kategori">'+label.split("·")[0].trim()+' · <time datetime="'+date+'">Publisert '+pretty+'</time></p>')
 .replace(/<p><strong>Før publisering:<\/strong>[\s\S]*?<\/p>/g,"");
if(html.includes('noindex, nofollow')||html.includes("REDAKSJONELT UTKAST")||
   !html.includes('href="../styles.css"')||!html.includes('src="../'+publicImage+'"'))
 stop("Publiseringskopien bestod ikke grunnkontrollen");
const record={title:a.tittel,excerpt:excerpt.replaceAll("&quot;",'"').replaceAll("&amp;","&"),
 image:publicImage,url:publicHtml,date};
if(flag!=="--publiser"){
 console.log("FORHÅNDSVISNING – ingen filer er endret");
 console.log(JSON.stringify({artikkel:id,html:publicHtml,bilde:publicImage,nyhetsstrom:feed,metadata:record},null,2));
 process.exit(0);
}
const copy=JSON.parse(JSON.stringify(queue));
const item=copy.artikler.find(x=>x.id===id);
item.status="publisert";item.publisert=true;item.publisert_dato=date;item.publisert_url=publicHtml;
write(publicImage,image);
write(publicHtml,html);
write(feed,JSON.stringify([record,...articles],null,2)+"\n");
write(source,JSON.stringify(copy,null,2)+"\n");
console.log("Klargjort ÉN godkjent artikkel lokalt: "+publicHtml);
console.log("Kontroller filene og commit/merge eksplisitt. Ingen automatisk publisering.");
