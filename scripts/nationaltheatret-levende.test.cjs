"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const h=read("artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html");
const svg=read("Bilder/Artikler/2026-11-11-nationaltheatret-to-scener-forklaring.svg");

test("Nationaltheatret: godkjent arkivfoto, kreditering og opprinnelig publiseringsdato beholdes",()=>{
 assert.match(h,/<h1 class="story-title">Nationaltheatret får en ny adresse på Tøyen – og to hjem for framtiden<\/h1>/);
 assert.equal((h.match(/<h1\b/g)||[]).length,1);
 assert.match(h,/article:published_time" content="2026-11-10"/);
 assert.match(h,/article:modified_time" content="2026-11-12"/);
 assert.match(h,/2026-11-11-gamle-munch-arkivfoto\.webp/);
 assert.match(h,/fotografert i 2005/);
 assert.match(h,/J\. P\. Fagerback/);
 assert.match(h,/Wikimedia Commons/);
 assert.match(h,/class="story-body av-artikkel"/);
 assert.match(h,/href="\.\.\/artikkel\.css\?v=20261111b"/);
 assert.match(h,/artikkel-interaktiv\.js/);
});

test("Kildehenvisninger er knyttet til faktabærende avsnitt og holder status atskilt",()=>{
 assert.ok((h.match(/class="av-kilde-note"/g)||[]).length>=7);
 assert.ok((h.match(/id="k\d+"/g)||[]).length>=12);
 assert.match(h,/Statsbygg 14 tomtetilbud|Statsbygg vurderte 14 tomtetilbud/);
 assert.match(h,/forprosjekt i 2027/);
 assert.match(h,/ikke en dato for teateråpning|ikke en fastsatt åpningsdato/);
 assert.match(h,/Oslo kommune oppgir en salgspris på 111 millioner kroner/);
 assert.match(h,/bystyret skal vedta salget endelig/);
 assert.match(h,/aktuelt\.oslo\.kommune\.no\/oslo-kommune-selger-gamle-munch/);
 assert.match(h,/arbeider med å finne erstatningslokaler/);
 assert.match(h,/Det er ikke det samme som at nye lokaler er sikret/);
 assert.match(h,/en uttalelse fra mars, ikke en reaksjon på regjeringens beslutning/);
 assert.match(h,/id="av-zoom-dialog"/);
});

test("Levende kulturmoduler er informative uten fiktive avstemninger eller visualisert arkitektur",()=>{
 assert.match(h,/class="av-infoboks"/);
 assert.match(h,/data-av-explainer/);
 assert.match(h,/data-av-step="under"/);
 assert.match(h,/data-av-step="etter"/);
 assert.match(h,/class="av-tidslinje"/);
 assert.match(h,/data-av-zoom aria-label="Forstørr diagrammet over de to teaterstedene">Forstørr/);
 assert.match(h,/class="av-figur av-mellombilde"/);
 assert.equal((h.match(/<figure\b/g)||[]).length,2);
 assert.doesNotMatch(h,/data-av-poll="/,"Ingen poll for et uklart teater-/byggespørsmål");
 assert.match(svg,/<title id="t">/);
 assert.match(svg,/<desc id="d">/);
 assert.match(svg,/ikke bygg- eller scenetegning/);
 assert.match(svg,/regjeringens plan/i);
});
