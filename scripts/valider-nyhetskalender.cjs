/* Paradisavisa: valider tidskritisk hendelseslogg, ikke journalistisk godkjenning. */
"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const log=JSON.parse(read("utkast/nyhetskalender.json"));
const queue=JSON.parse(read("utkast/artikler.json")).artikler;
const markdown=read("utkast/NYHETSKALENDER.md");
const html=read("utkast/nyhetskalender.html");
const ics=read("utkast/nyhetskalender.ics");
const errors=[];
const expect=(value,msg)=>{if(!value)errors.push(msg)};
const iso=value=>{
 if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+"T12:00:00Z");
 return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
};
const knownStatuses=new Set(["bekreftet","annonsert","etterkontroll","dato-ikke-bekreftet","utsatt"]);
const knownPriorities=new Set(["kritisk","hoy","normal"]);
const ids=new Set(), knownArticles=new Set(queue.map(a=>a.id)), linkedArticles=new Set();
expect(log.tidssone==="Europe/Oslo","Kalenderen må oppgi norsk tidssone");
expect(iso(log.oppdatert),"Kalenderen må oppgi gyldig oppdateringsdato");
expect(Array.isArray(log.hendelser)&&log.hendelser.length>0,"Kalenderen mangler hendelser");
for(const e of log.hendelser||[]){
 expect(typeof e.id==="string"&&/^[a-z0-9-]+$/.test(e.id),"Ugyldig hendelses-ID: "+e.id);
 expect(!ids.has(e.id),"Duplisert ID: "+e.id);ids.add(e.id);
 expect(typeof e.tittel==="string"&&e.tittel.length>8,"Mangler hendelsestittel: "+e.id);
 expect(typeof e.handling==="string"&&e.handling.length>25,"Mangler konkret redaksjonell handling: "+e.id);
 expect(knownStatuses.has(e.status),"Ukjent status: "+e.id);
 expect(knownPriorities.has(e.prioritet),"Ukjent prioritet: "+e.id);
 expect(iso(e.sist_kontrollert),"Mangler kontroll-dato: "+e.id);
 if(e.dato!==null)expect(iso(e.dato),"Ugyldig dato: "+e.id);
 if(e.slutt_dato!==null) {
   expect(iso(e.slutt_dato),"Ugyldig sluttdato: "+e.id);
   expect(typeof e.dato==="string"&&e.slutt_dato>=e.dato,"Sluttdato før start: "+e.id);
 }
 if(e.klokkeslett!==null)expect(typeof e.dato==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.klokkeslett),"Ugyldig klokkeslett: "+e.id);
 if(e.status==="dato-ikke-bekreftet")expect(e.dato===null,"Ubekreftet dato må være null: "+e.id);
 expect(Array.isArray(e.kilder)&&e.kilder.length>0,"Ingen kilder: "+e.id);
 for(const k of e.kilder||[])expect(k.navn&&/^https:\/\//.test(k.url),"Ugyldig kilde: "+e.id);
 expect(Array.isArray(e.artikkel_ider)&&Array.isArray(e.pr_numre),"Manglende lenker til artikkelkø og PR: "+e.id);
 for(const a of e.artikkel_ider||[]){
   linkedArticles.add(a);
   expect(knownArticles.has(a),"Ukjent artikkel-ID: "+e.id+" / "+a);
 }
 for(const p of e.pr_numre||[])expect(Number.isInteger(p)&&p>0,"Ugyldig PR-nummer: "+e.id);
 expect(markdown.includes(e.tittel),"Hendelse mangler i lesbar Markdown-logg: "+e.id);
 const uid="UID:"+e.id+"@paradisavisa.no";
 const inCalendar=e.dato&&e.dato>=log.oppdatert&&e.status!=="utsatt";
 expect(ics.includes(uid)===Boolean(inCalendar),"iCalendar-samsvar feil: "+e.id);
}
for(const a of queue.filter(a=>a.status==="utkast"))expect(linkedArticles.has(a.id),"Aktivt utkast uten oppfølgingspunkt: "+a.id);
expect(html.includes('name="robots" content="noindex, nofollow"'),"Kalendersiden mangler noindex/nofollow");
expect(html.includes('fetch("nyhetskalender.json"'),"Kalendersiden mangler tilkoblet datakilde");
expect(ics.includes("BEGIN:VCALENDAR")&&ics.includes("END:VCALENDAR"),"iCalendar-filen er ugyldig");
const count=(ics.match(/BEGIN:VEVENT/g)||[]).length;
const expected=log.hendelser.filter(e=>e.dato&&e.dato>=log.oppdatert&&e.status!=="utsatt").length;
expect(count===expected,"Ulikt antall tidsfestede kalenderoppføringer: "+count+" mot "+expected);
if(errors.length){
 console.error(errors.map(x=>"FEIL: "+x).join("\n"));
 process.exitCode=1;
}else{
 console.log("OK: "+log.hendelser.length+" loggførte hendelser; "+expected+" eksporterte kalenderoppføringer.");
 console.log("Alle aktive utkast har minst ett oppfølgingspunkt. Ingen publiseringsstatus er endret.");
}