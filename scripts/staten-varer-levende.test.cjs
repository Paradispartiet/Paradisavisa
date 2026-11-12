"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const html=read("artikler/2026-11-06-staten-bor-lage-ting-som-varer.html");
const svg=read("Bilder/Artikler/2026-11-12-staten-grunnsortiment-ansvarsdeling.svg");
const cards=JSON.parse(read("kommentarer.json"));
const heroPath="Bilder/Artikler/2026-11-12-staten-skal-lage-ting-som-varer-hovedbilde.webp";

test("Kommentar beholder tittel, avsender, publiseringsdato og godkjent hovedbilde",()=>{
 assert.match(html,/<h1 class="title">Staten skal lage ting som varer<\/h1>/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/article:published_time" content="2026-11-06"/);
 assert.match(html,/article:modified_time" content="2026-11-12"/);
 assert.match(html,/Kommentar fra Paradispartiet/);
 assert.match(html,/2026-11-12-staten-skal-lage-ting-som-varer-hovedbilde\.webp/);
 assert.match(html,/width="1672" height="941"/);
 assert.match(html,/KI-assistert redaksjonell illustrasjon/);
 assert.doesNotMatch(html,/2026-11-06-offentlig-grunnsortiment\.svg/);
 assert.match(html,/ikke eksisterende statlige produkter/);
 assert.match(html,/class="av-artikkel"/);
 assert.match(html,/class="body av-prosa"/);
 assert.match(html,/href="\.\.\/artikkel\.css\?v=20261112a"/);
 assert.match(html,/artikkel-interaktiv\.js/);
});
test("Politisk forslag skilles fra etablert virksomhet; kildene er transparente",()=>{
 assert.ok((html.match(/class="av-kilde-note"/g)||[]).length>=7);
 for(const url of [
  "commission.europa.eu/law/law-topic/consumer-protection-law/directive-repair-goods_en",
  "datatilsynet.no/rettigheter-og-plikter/personvernprinsippene",
  "mn.uio.no/ifi/forskning/index.html",
  "github.com/Paradispartiet/AHA-EchoNet",
  "paradispartiet.github.io/Paradispartiet/okonomisk-modell.html"
 ])assert.ok(html.includes(url),url+" missing");
 assert.match(html,/Ingen avtale eller uttalt tilslutning fra instituttet er dokumentert/);
 assert.match(html,/en allerede opprettet etat eller samarbeidsavtale/);
 assert.match(html,/ingen offentlig produktordning/i);
 assert.match(html,/Private selskaper skal fortsatt kunne selge/);
});
test("Levende kommentar: originalgrafikk, liten zoom, forklaring, faktaboks og lokal avstemning",()=>{
 assert.equal((html.match(/<figure\b/g)||[]).length,2);
 assert.match(svg,/<title id="svgtitle">/);
 assert.match(svg,/<desc id="svgdesc">/);
 assert.match(svg,/ikke en allerede vedtatt ordning/);
 assert.match(html,/2026-11-12-staten-grunnsortiment-ansvarsdeling\.svg/);
 assert.match(html,/class="av-zoom-knapp"[^>]*data-av-zoom aria-label="Forstørr diagrammet over offentlig ansvarsdeling">Forstørr/);
 assert.match(html,/id="av-zoom-dialog"/);
 assert.match(html,/class="av-infoboks"/);
 assert.match(html,/data-av-explainer/);
 assert.match(html,/data-av-step="etterprove"/);
 assert.match(html,/data-av-panel="prioritere"/);
 assert.match(html,/data-av-poll="offentlig-grunnsortiment-prioritering-2026"/);
 assert.match(html,/<form hidden>/);
 assert.match(html,/data-av-poll-js-required/);
 assert.match(html,/Ingen samlede stemmetall eller prosenter vises/);
 assert.match(html,/value="ingen"/);
});

test("Godkjent illustrasjon er en virkelig skarp WebP i repoet, og den brukes på forside og deling",()=>{
 const full=path.join(__dirname,"..",heroPath);
 const img=fs.readFileSync(full);
 assert.ok(img.length>150000,"Hovedbildet skal være høyoppløselig, ikke et lite ikon");
 assert.ok(img.length<1500000,"Bildeformat må fungere effektivt i mobilnett");
 assert.equal(img.subarray(0,4).toString(),"RIFF");
 assert.equal(img.subarray(8,12).toString(),"WEBP");
 assert.match(html,/og:image" content="https:\/\/paradispartiet\.github\.io\/Paradisavisa\/Bilder\/Artikler\/2026-11-12-staten-skal-lage-ting-som-varer-hovedbilde\.webp"/);
 assert.match(html,/twitter:image" content="https:\/\/paradispartiet\.github\.io\/Paradisavisa\/Bilder\/Artikler\/2026-11-12-staten-skal-lage-ting-som-varer-hovedbilde\.webp"/);
 const card=cards.find(x=>x.url==="artikler/2026-11-06-staten-bor-lage-ting-som-varer.html");
 assert.ok(card,"Kanonisk kommentar-kort mangler");
 assert.equal(card.title,"Staten skal lage ting som varer");
 assert.equal(card.image,heroPath);
 assert.equal(card.date,"2026-11-06");
});
