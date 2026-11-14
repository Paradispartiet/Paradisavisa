"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.join(__dirname, "..");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const sandbox = { document: { addEventListener() {} }, Date };
vm.createContext(sandbox);
vm.runInContext(script, sandbox);
const fersk = (note, now = new Date(2026, 10, 9)) => vm.runInContext("isNotisAktuell", sandbox)(note, now);

test("Hver nåværende og historiske notis har én stabil intern lenke", () => {
  const aktive = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const arkiverte = JSON.parse(fs.readFileSync(path.join(root, "arkiv/notiser-2025-10.json"), "utf8"));
  const id = vm.runInContext("notisVisningsId", sandbox);
  const alle = [...aktive, ...arkiverte];
  const alleIder = alle.map(id);
  assert.equal(new Set(alleIder).size, alle.length, "Ingen interne lenker må kollidere");
  assert.equal(id(aktive[0]), aktive[0].id);
  assert.match(id(arkiverte[0]), /^arkiv-2025-10-\d{2}-[a-z0-9]+$/);
  assert.equal(id(arkiverte[0]), id({ ...arkiverte[0] }), "Arkivlenken skal være deterministisk");

  // Samme destination uansett hvor på nettstedet script.js brukes.
  const browser = {
    Date, URL,
    document: { addEventListener() {}, scripts: [
      { src:"https://paradispartiet.github.io/Paradisavisa/script.js?v=46" }
    ] },
    window: { location: { href:"https://paradispartiet.github.io/Paradisavisa/artikler/eksempel.html" } }
  };
  vm.createContext(browser);
  vm.runInContext(script, browser);
  const intern = vm.runInContext("notisSideLenke", browser);
  const href = intern(aktive[0]);
  const url = new URL(href);
  assert.equal(url.origin + url.pathname,
    "https://paradispartiet.github.io/Paradisavisa/notiser.html");
  assert.equal(url.searchParams.get("id"), aktive[0].id);
  assert.equal(intern(arkiverte[0]).includes("notiser.html?id=arkiv-"), true);
});

test("Notisbåndet åpner interne notissider, med separat klikkbar og trygg originalkilde", () => {
  const html = fs.readFileSync(path.join(root, "notiser.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "avisdesign.css"), "utf8");
  const kilde = vm.runInContext("notisOriginalkilde", sandbox);
  // URL er ikke tilgjengelig i den minimale test-sandboksen før vi setter den.
  sandbox.URL = URL;
  const godkjent = kilde({ url: "https://www.nrk.no/test" });
  assert.equal(godkjent.hostname, "www.nrk.no");
  assert.equal(kilde({ url: "javascript:alert(1)" }), null);
  assert.equal(kilde({ url: "http://example.org/" }), null);
  assert.equal(kilde({ url: "/relative-kilde" }), null);
  assert.equal(kilde({}), null);

  const ticker = script.slice(script.indexOf("const lagNotiselement = n =>"),
    script.indexOf("let nesteNotisIndeks = 0;", script.indexOf("const lagNotiselement = n =>")));
  assert.match(ticker, /link\.href = notisSideLenke\(n\)/);
  assert.doesNotMatch(ticker, /link\.href = url\.href/,
    "Notisbåndet skal ikke sende lesere direkte til eksterne nettsteder");
  assert.match(script, /egenSide\.href = notisSideLenke\(item\)/);
  assert.match(script, /kilder\.append\(kildeTittel, lagNotisKildelenke\(notis\)\)/);
  assert.match(script, /lenker\.append\(egenSide, lagNotisKildelenke\(item\)\)/);
  assert.match(script, /link\.rel = "noopener noreferrer"/);
  assert.match(script, /document\.title = tittel \+ " \| Paradisavisa"/);
  assert.match(html, /id="notis-oversikt"/);
  assert.match(html, /id="notis-detalj"[^>]*hidden/);
  assert.match(html, /src="script\.js\?v=46"/);
  assert.match(css, /\.notiser-side \.notis-detalj-kilder a/);
});

test("Datofilter skjuler gamle, udaterte, fremtidige og ugyldige notiser", () => {
  const note = date => ({ category: "Klima", text: "Kontrollert testnotis", date });
  assert.equal(fersk(note("2026-11-09")), true);
  assert.equal(fersk(note("2026-11-08"), new Date(2026, 10, 11)), false);
  assert.equal(fersk(note("2026-11-03")), false);
  assert.equal(fersk(note("2026-11-02")), false);
  assert.equal(fersk(note("2025-10-24")), false);
  assert.equal(fersk(note("2026-11-10")), false);
  assert.equal(fersk(note("2026-02-30")), false);
  assert.equal(fersk({ text: "Utdatert uten dato" }), false);
});
test("Tre kalenderdager er standard, mens godkjent expires kan overstyre", () => {
  const note = { category:"Vitenskap", text:"Ny forskningssak", date:"2026-11-09" };
  assert.equal(fersk(note, new Date(2026, 10, 9)), true);
  assert.equal(fersk(note, new Date(2026, 10, 11)), true);
  assert.equal(fersk(note, new Date(2026, 10, 12)), false);
  assert.equal(fersk({ ...note, expires:"2026-11-10" }, new Date(2026, 10, 11)), false);
  assert.equal(fersk({ ...note, expires:"2026-11-13" }, new Date(2026, 10, 13)), true);
  assert.equal(fersk({ ...note, expires:"2026-11-15" }, new Date(2026, 10, 15)), true);
  assert.equal(fersk({ ...note, expires:"2026-11-16" }, new Date(2026, 10, 16)), false,
    "Sju kalenderdager er en hard grense selv med senere expires");
  assert.equal(fersk({ ...note, expires:"2026-11-31" }, new Date(2026, 10, 9)), false);
});

test("Eksplisitt utløpsdato begrenser ytterligere", () => {
  const note = { text: "Tidsavgrenset", date: "2026-11-09", expires: "2026-11-10" };
  assert.equal(fersk(note, new Date(2026, 10, 10)), true);
  assert.equal(fersk(note, new Date(2026, 10, 11)), false);
});
test("Aktiv notisstrøm er fersk, eldre allmenn- og sportsnotiser arkivert", () => {
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  const live = read("notiser.json");
  assert.ok(live.length >= 3);
  assert.ok(live.every(note => typeof note.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(note.date)));
  assert.equal(read("sport-notiser.json").length, 0);
  const old = read("arkiv/notiser-2025-10.json");
  assert.equal(old.length, 26);
  assert.ok(old.every(note => !fersk(note)));
  const sport = read("arkiv/sport-notiser-2025.json");
  assert.equal(sport.length, 5);
  assert.ok(sport.every(note => !fersk(note)));
  assert.ok(script.includes('const filename = "notiser.json"'));
  // Array.filter sender også index; nyhetsfunksjonen må få Date som standardverdi.
  assert.ok(script.includes("items.filter(item => isNotisAktuell(item))"));
});

test("Nyhetsradioen har unike, daterte og kildebelagte notiser", () => {
  const notiser = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const nye = notiser.filter(n => typeof n.id === "string" && n.id.startsWith("notis-"));
  assert.ok(nye.length >= 18, "Tidligere godkjente notiser skal ikke forsvinne");
  assert.equal(new Set(nye.map(n => n.id)).size, nye.length, "Hver notis skal ha unik ID");
  assert.equal(new Set(notiser.map(n => n.url)).size, notiser.length, "Kildelenker skal ikke gjentas");
  for (const note of nye) {
    assert.match(note.date, /^\d{4}-\d{2}-\d{2}$/);
    const [year, month, day] = note.date.split("-").map(Number);
    const publishedDay = new Date(year, month - 1, day);
    assert.ok(fersk(note, publishedDay), "Ugyldig publiseringsdato eller utløp: " + note.id);
    assert.ok(note.text.length >= 100 && note.text.length <= 400,
      "Teksten må passe radiolesing: " + note.id);
    assert.ok(note.url?.startsWith("https://"), "Mangler sikker kildelenke: " + note.id);
    if (note.expires) assert.ok(note.expires >= note.date,
      "Utløp kan ikke være før publisering: " + note.id);
  }
});

test("Seks nye notiser er fra atskilte dokumenterte kilder", () => {
  const notiser = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const expected = [
    "notis-eu-digital-fairness-20261111",
    "notis-prisvekst-oktober-20261110",
    "notis-riksrevisjon-regnskap-20261110",
    "notis-havbruk-auksjon-20261111",
    "notis-gaza-luftangrep-20261111",
    "notis-regnskog-indonesia-cop31-20261111"
  ];
  for (const id of expected) {
    const note = notiser.find(n => n.id === id);
    assert.ok(note, "Mangler ny kildebelagt notis: " + id);
    assert.equal(new URL(note.url).protocol, "https:");
    assert.ok(note.text.split(/\s+/).length >= 25);
  }
});

test("Seks nye kveldssaker har kildelenke, gyldig dato og unike ID-er", () => {
  const notiser = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const ids = [
    "notis-falske-rettskjennelser-india-20261111",
    "notis-sjofart-hormuz-20261111",
    "notis-fractile-ai-brikker-20261111",
    "notis-tu-stroma-eggstokkreft-20261111",
    "notis-usa-inflasjon-oktober-20261111",
    "notis-ozonhullet-2026-nasa-20261109"
  ];
  assert.equal(new Set(notiser.map(n => n.url)).size, notiser.length,
    "To notiser skal ikke bruke samme kildelenke");
  assert.equal(new Set(notiser.filter(n => n.id).map(n => n.id)).size,
    notiser.filter(n => n.id).length, "Stabile ID-er skal ikke kollidere");
  for (const id of ids) {
    const n = notiser.find(note => note.id === id);
    assert.ok(n, "Mangler kildekontrollert notis " + id);
    assert.ok(fersk(n, new Date(2026, 10, 11)), "Notisen er ikke gyldig 11. november");
    assert.ok(n.text.trim().split(/\s+/).length >= 27 && n.text.trim().split(/\s+/).length <= 70,
      "Lengden er ikke tilpasset kort radioopplesning");
    assert.equal(new URL(n.url).protocol, "https:", "Originalkilden må være sikker lenke");
  }
});

test("Seks nyheter har originalkilde, riktig dato og redaksjonelt avgrenset holdbarhet", () => {
  const items = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const keys = [
    "notis-eu-budsjettavtale-20261111",
    "notis-mediepolitikk-unge-20261110",
    "notis-ki-utdanning-horing-20261110",
    "notis-nordisk-afrikansk-utenriksministre-20261110",
    "notis-ssb-fengsel-lavt-niva-20261110",
    "notis-ssb-ikt-bedrifter-20261110"
  ];
  assert.equal(new Set(items.map(x => x.url)).size, items.length,
    "Ingen ulike notiser skal ha samme kilde-URL");
  assert.equal(new Set(items.filter(x => x.id).map(x => x.id)).size,
    items.filter(x => x.id).length, "Ingen ID-kollisjoner");
  for(const key of keys) {
    const note = items.find(x => x.id === key);
    assert.ok(note, "Mangler notis " + key);
    assert.equal(note.date, key.includes("20261111") ? "2026-11-11" : "2026-11-10");
    assert.ok(fersk(note, new Date(2026, 10, 11)), "Utdatert på kontrolltidspunkt " + key);
    assert.equal(new URL(note.url).protocol, "https:");
    assert.ok(note.text.trim().split(/\s+/).length >= 25 &&
      note.text.trim().split(/\s+/).length <= 65, "Ikke passende radiolengde " + key);
  }
  assert.equal(items.find(x => x.id === keys[2]).expires, "2026-11-14");
  assert.equal(items.find(x => x.id === keys[3]).expires, "2026-11-16");
  assert.equal(fersk(items.find(x => x.id === keys[3]), new Date(2026, 10, 17)), false,
    "Selv framtidige møter må ikke beholde foreldet notis utover sju dager");
});

test("Posten-streiken har riktig klokkeslett, kildelenke og dato", () => {
  const notes = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const note = notes.find(n => n.id === "notis-sporveien-politisk-streik-posten-20261111");
  assert.ok(note, "Varslet politisk streik må finnes i radioen");
  assert.equal(note.date, "2026-11-11");
  assert.equal(note.expires, "2026-11-16");
  assert.match(note.text, /15\.00 til 15\.15/);
  assert.match(note.text, /varslet/);
  assert.ok(note.url.startsWith("https://kommunikasjon.ntb.no/pressemelding/19138472/"));
  assert.equal(fersk(note, new Date(2026, 10, 12)), true);
  assert.equal(fersk(note, new Date(2026, 10, 16)), true);
  assert.equal(fersk(note, new Date(2026, 10, 17)), false);
  const sourceUrls = notes.map(n => n.url);
  assert.equal(new Set(sourceUrls).size, sourceUrls.length);
});

test("Sexy sosialister er faktasjekket og tidsavgrenset til tre dager", () => {
  const notes = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const id = "notis-sexy-sosialister-donasjoner-20261111";
  const note = notes.find(x => x.id === id);
  assert.ok(note, "Kalenderstriden skal være med i notisbåndet");
  assert.equal(note.category, "Politikk og kultur");
  assert.equal(note.date, "2026-11-11");
  assert.equal(note.expires, undefined, "Tre dager er standard");
  assert.ok(note.text.includes("Rødt") && note.text.includes("SV"));
  assert.ok(note.text.includes("donere direkte") && note.text.includes("Skogøy sier"),
    "Salgstall og oppfordring skal tilskrives kilden");
  assert.equal(note.url,
    "https://www.fagbladet.no/nyheter/vurderer-a-melde-seg-ut-av-sv-etter-sexy-sosialist-kalender/764005");
  assert.equal(fersk(note, new Date(2026, 10, 12)), true);
  assert.equal(fersk(note, new Date(2026, 10, 13)), true);
  assert.equal(fersk(note, new Date(2026, 10, 14)), false);
  assert.equal(new Set(notes.map(x => x.url)).size, notes.length);
});

test("Lagmannsrettens bagasjeromssak er kildebelagt og riktig tidsavgrenset", () => {
  const notes = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const note = notes.find(n => n.id === "notis-bagasjerom-oppreisning-eidsivating-20261112");
  assert.ok(note, "Mangler rettsnotisen fra 12. november");
  assert.equal(note.category, "Rett og samfunn");
  assert.equal(note.date, "2026-11-12");
  assert.equal(note.expires, undefined, "Normalt tre kalenderdager");
  assert.ok(note.text.includes("to mot én") && note.text.includes("80 000") &&
    note.text.includes("55 000") && note.text.includes("16-åring"));
  assert.equal(note.url,
    "https://rett24.no/articles/sjafor-ma-betale-full-oppreisning-til-passasjer-som-satte-seg-i-bagasjerommet");
  assert.equal(fersk(note, new Date(2026, 10, 12)), true);
  assert.equal(fersk(note, new Date(2026, 10, 14)), true);
  assert.equal(fersk(note, new Date(2026, 10, 15)), false);
  assert.equal(new Set(notes.map(x => x.url)).size, notes.length);
});

test("Seks kildebelagte norske notiser fra 13. november er unike og tidsstyrte", () => {
  const notes = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const ids = [
    "notis-ordforer-banenor-anmeldt-20261113",
    "notis-sultestreiker-dommer-jobbsoknad-20261113",
    "notis-horst-forlag-ki-kontrakter-20261113",
    "notis-hoyesterett-oljefelt-ugyldige-20261113",
    "notis-puskas-alta-bakgrunnsmusikk-20261113",
    "notis-norsk-industri-stotter-posten-20261113"
  ];
  assert.ok(notes.length >= 52, "Tidligere godkjente notiser skal beholdes");
  assert.equal(new Set(notes.map(n => n.url)).size, notes.length);
  const named = notes.filter(n => n.id);
  assert.equal(new Set(named.map(n => n.id)).size, named.length);
  for (const id of ids) {
    const n = notes.find(n => n.id === id);
    assert.ok(n, "Mangler notis: " + id);
    assert.equal(n.date, "2026-11-13");
    assert.equal(n.expires, undefined, "Normal holdbarhet er tre kalenderdager");
    assert.ok(n.url.startsWith("https://"));
    assert.ok(n.text.trim().split(/\s+/).length >= 25 && n.text.trim().split(/\s+/).length <= 65);
    assert.equal(fersk(n, new Date(2026, 10, 13)), true);
    assert.equal(fersk(n, new Date(2026, 10, 15)), true);
    assert.equal(fersk(n, new Date(2026, 10, 16)), false);
  }
  const horst = notes.find(n => n.id === ids[2]);
  assert.match(horst.text, /ikke i seg selv bevis/);
  const klima = notes.find(n => n.id === ids[3]);
  assert.match(klima.text, /seks mot fem/);
  assert.match(klima.text, /ikke automatisk/);
  const post = notes.find(n => n.id === ids[5]);
  assert.match(post.text, /Norsk Industri/);
});

test("Rettferdsvederlag og lakseutbrudd 13. november er to forskjellige, korrekt tidsstyrte notiser", () => {
  const notes = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const ids = [
    "notis-rettferdsvederlag-avvikling-forslag-20261113",
    "notis-laks-audna-sopp-trondelag-20261113"
  ];
  assert.ok(notes.length >= 54, "Notisene fra 13. november og eldre skal beholdes ved nye publiseringer");
  assert.equal(new Set(notes.map(n => n.url)).size, notes.length, "Ingen gjentatt kildelenke");
  assert.equal(new Set(notes.filter(n => n.id).map(n => n.id)).size,
    notes.filter(n => n.id).length, "Ingen ID-kollisjoner");
  for (const id of ids) {
    const n = notes.find(note => note.id === id);
    assert.ok(n, "Mangler notisen " + id);
    assert.equal(n.date, "2026-11-13");
    assert.equal(n.expires, undefined, "Tre kalenderdager er standard");
    assert.ok(n.url.startsWith("https://"), "HTTPS-kilde kreves");
    assert.ok(n.text.trim().split(/\s+/).length >= 25 &&
      n.text.trim().split(/\s+/).length <= 65, "Radioformat 25–65 ord");
    assert.equal(fersk(n, new Date(2026, 10, 14)), true);
    assert.equal(fersk(n, new Date(2026, 10, 15)), true);
    assert.equal(fersk(n, new Date(2026, 10, 16)), false);
  }
  const ordning = notes.find(n => n.id === ids[0]);
  assert.match(ordning.text, /foreslår/);
  assert.match(ordning.text, /dersom Stortinget vedtar/);
  const laks = notes.find(n => n.id === ids[1]);
  assert.match(laks.text, /frykter at opptil 90 prosent/);
  assert.match(laks.text, /prøvesvar må bekrefte årsaken/);
  assert.match(laks.text, /ikke fastslått at utbruddene har samme årsak/);
});

test("To nye notiser 14. november har unike kilder og riktig levetid", () => {
  const notes = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const ids = [
    "notis-musikkraad-jubileum-146-musikere-20261114",
    "notis-tryg-fredag-trettende-bilskader-20261114"
  ];
  assert.equal(notes.length, 56, "54 eksisterende og to nye saker");
  assert.equal(new Set(notes.map(n => n.url)).size, notes.length);
  const named = notes.filter(n => n.id);
  assert.equal(new Set(named.map(n => n.id)).size, named.length);
  const [konsert, tryg] = ids.map(id => notes.find(n => n.id === id));
  for (const n of [konsert, tryg]) {
    assert.ok(n, "Mangler valgt notis");
    assert.equal(n.date, "2026-11-14");
    assert.match(n.url, /^https:/);
    assert.ok(n.text.trim().split(/\s+/).length >= 25 &&
      n.text.trim().split(/\s+/).length <= 65, "Radiotekst 25–65 ord");
    assert.equal(fersk(n, new Date(2026, 10, 14)), true);
  }
  assert.equal(konsert.expires, "2026-11-14",
    "Forhåndsomtale av konserten skal utløpe konsertdagen");
  assert.equal(fersk(konsert, new Date(2026, 10, 15)), false);
  assert.match(konsert.text, /er varslet/);
  assert.match(konsert.text, /14\. november/);
  assert.equal(tryg.expires, undefined, "Tryg-notisen skal ha tre kalenderdager");
  assert.equal(fersk(tryg, new Date(2026, 10, 16)), true);
  assert.equal(fersk(tryg, new Date(2026, 10, 17)), false);
  assert.match(tryg.text, /selskapets egne skademeldinger/);
  assert.match(tryg.text, /ikke viser at selve datoen forårsaker ulykkene/);
});

test("Notisbåndet bruker bare 2×/4×/5× og samler radio/pause/fart i én meny", () => {
  assert.match(script, /const fartvalg = \[2, 4, 5\]/);
  assert.match(script, /lagret === 6/);
  assert.match(script, /localStorage\.setItem\("paradisavisa-notisfart", "5"\)/);
  assert.match(script, /let valgtFart = 2/);
  assert.match(script, /notis-valgknapp/);
  assert.match(script, /notis-valgpanel/);
  assert.match(script, /notis-pause/);
  assert.match(script, /notis-fartknapp/);
  assert.match(script, /notis-radio/);
  assert.match(script, /SpeechSynthesisUtterance/);
  assert.match(script, /ytring\.lang = "nb-NO"/);
  assert.match(script, /radioknapp\.addEventListener\("click"/);
  assert.match(script, /window\.addEventListener\("pagehide"/);
});

test("Firefox skal ikke reservere falsk bunnsikkerhetssone under notisbåndet", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const firefox = css.match(/@supports \(-moz-appearance: none\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(firefox, "Mangler Firefox-spesifikk safe-area-rettelse");
  assert.match(firefox, /\.notisbånd\s*\{\s*padding-bottom:\s*2px\s*;/);
  assert.match(firefox, /body:has\(> \.notisbånd\)/);
  assert.match(firefox, /padding-bottom:\s*3rem\s*;/);
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(index, /styles\.css\?v=\d+/);
});

test("Notisbåndet animerer bare et kort spor uten å lage en gigantisk liste", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const ticker = script.slice(script.indexOf("const lagNotiselement = n =>"),
    script.indexOf("// Én knapp åpner båndhastighet, talehastighet og avspillingskontroller."));
  assert.ok(ticker.length > 200, "Mangler det resirkulerende notissporet");
  assert.match(ticker, /innhold\.animate\(/);
  assert.match(ticker, /animasjon\.onfinish =/);
  assert.match(ticker, /forste\.remove\(\)/);
  assert.match(ticker, /innhold\.scrollWidth < minsteBredde/);
  assert.match(ticker, /tickerAnimasjon\.playbackRate = valgtFart/);
  assert.doesNotMatch(ticker, /cloneNode|requestAnimationFrame|addEventListener\("scroll"/);
  assert.doesNotMatch(css, /animation: ticker-smooth/);
  assert.match(css, /\.notisinnhold \.notis-element/);
  assert.match(css, /@supports \(-moz-appearance: none\)/);
  assert.match(css, /-webkit-transform: none/);
});

test("Nye radiomeldinger kommer først, uten å omstokke gamle eller gjenta duplikater", () => {
  const prioriter = vm.runInContext("prioriterNyeRadioNotiser", sandbox);
  const now = new Date(2026, 10, 11);
  const lag = (id, text = id, date = "2026-11-10") =>
    ({ id, date, text, category: "Nyheter", url: "https://example.org/" + id });
  const gammel = [lag("a"), lag("b"), lag("c")];
  const innkomne = [lag("b"), lag("ny"), lag("a"), lag("ny"), lag("gammel", "Gammel", "2026-11-01")];
  const resultat = prioriter(gammel, innkomne, now);
  assert.equal(resultat.map(n => n.id).join(","), "ny,a,b");
  assert.equal(resultat.length, 3);
  assert.ok(resultat.every(n => fersk(n, now)));
});

test("Radiokøen prioriterer nye og ferske notiser og varierer kategorier", () => {
  const fordel = vm.runInContext("fordelRadioKategorier", sandbox);
  const lag = (id, category, date = "2026-11-13") =>
    ({ id, category, date, text: "Kildekontrollert sak " + id, url: "https://example.org/" + id });
  const original = [
    lag("k1", "Kultur"), lag("k2", "Kultur"), lag("s", "Sport"),
    lag("r", "Rett"), lag("e", "Økonomi", "2026-11-12")
  ];
  const sortert = fordel([...original, original[0]], "Kultur");
  assert.equal(sortert.length, 5, "Dubletter skal ikke kunne gi to opplesninger");
  assert.deepEqual(Array.from(sortert, n => n.id), ["s","k1","r","k2","e"],
    "Samme dags saker skal veksle kategori når det finnes alternativer");
  const prioritert = fordel(original, "Kultur", new Set(["id:k2"]));
  assert.equal(prioritert[0].id, "k2", "Helt ny notis skal komme først selv ved lik kategori");
  assert.equal(prioritert.at(-1).id, "e", "Eldre dato skal ikke fortrenge nyere");
});

test("Live radiooppdatering beholder lest del og fletter inn nye uten gjentakelser", () => {
  const oppdater = vm.runInContext("oppdaterRadioKoUnderSending", sandbox);
  const lag = (id, category, date = "2026-11-13") =>
    ({ id, category, date, text: "Sak " + id, url: "https://example.org/" + id });
  const a = lag("a", "Kultur"), b = lag("b", "Kultur"), c = lag("c", "Sport");
  const ny = lag("ny", "Rett"), eldre = lag("gammel", "Sport", "2026-11-10");
  const korrigertB = { ...b, text: "Korrigert og fortsatt gyldig" };
  // A er allerede lest. Radioen leser B når en ny C-katalog ankommer.
  const oppdatert = oppdater([a,b,c], [ny,ny,c,korrigertB,a,eldre], 2, b, new Date(2026,10,14));
  const keys = Array.from(oppdatert.ko, n => n.id);
  assert.deepEqual(keys.slice(0,2), ["a","b"]);
  assert.equal(oppdatert.nesteIndeks, 2);
  assert.equal(oppdatert.gjeldendeIndeks, 1);
  assert.equal(keys[2], "ny", "Ny kildekontrollert notis skal leses ved neste pause");
  assert.equal(oppdatert.ko[1].text, korrigertB.text,
    "Korrigering av stabil notis-ID skal slå gjennom uten ny køplass");
  assert.deepEqual(keys, ["a","b","ny","c"],
    "Ingen dubletter eller utløpte notiser skal leses i denne runden");
  // Også når siste notis allerede er lest før oppdateringen kommer,
  // skal en ny sak kunne starte som neste uten å gjenta gamle.
  const etterSiste = oppdater([a,b], [ny,b,a], 2, b, new Date(2026,10,14));
  assert.equal(etterSiste.nesteIndeks, 2);
  assert.equal(etterSiste.ko[2].id, "ny");
});

test("Lite nyhetstilfang gir aldri en endeløs ett- eller to-notisløkke", () => {
  assert.match(script, /const begynnNesteRunde = \(oppdaterte, versjon, nyeNokler = new Set\(\)\)/);
  assert.match(script, /radiosaker\.length <= 2 && nyeNokler\.size === 0/);
  assert.match(script, /Alle aktuelle nyheter er lest opp\. Trykk Spill for å høre dem igjen/);
  assert.match(script, /begynnNesteRunde\(nesteKo, versjon, nyeNokler\)/);
  assert.match(script, /begynnNesteRunde\(radiosaker, versjon\)/);
  assert.doesNotMatch(script, /setInterval\(\(\) => tale\.speak/);
});

test("Redigert kjent ID oppdateres uten å bli en ny sak", () => {
  const prioriter = vm.runInContext("prioriterNyeRadioNotiser", sandbox);
  const now = new Date(2026, 10, 11);
  const a = { id: "a", text: "Første versjon", date: "2026-11-10" };
  const endret = { ...a, text: "Korrigert, redaksjonelt godkjent versjon" };
  const b = { id: "b", text: "Annen notis", date: "2026-11-10" };
  const r = prioriter([a, b], [b, endret], now);
  assert.equal(r.map(n => n.id).join(","), "a,b");
  assert.equal(r[0].text, endret.text);
});

test("Navigasjon i radioen bruker bare aktive notiser", () => {
  assert.match(script, /const ferske = radiosaker\.filter\(item => isNotisAktuell\(item\)\);/);
  assert.match(script, /const fra = ferske\.indexOf\(radiosaker\[radioGjeldendeIndeks\]\);/);
  assert.match(script, /spillFraKo\(mål\);/);
  assert.match(script, /const nesteKo = prioriterNyeRadioNotiser\(radiosaker, data\);/);
});

test("Radiotekst tilpasses uttale uten å endre godkjent notis", () => {
  const lageTekst=vm.runInContext("lagRadioOpplesning",sandbox);
  const notis={category:"Økonomi",text:"Norge bidrar med 2,5 mrd. kr og 30 %."};
  assert.equal(lageTekst(notis),"Økonomi. Norge bidrar med 2,5 milliarder kroner og 30 prosent.");
  assert.equal(notis.text,"Norge bidrar med 2,5 mrd. kr og 30 %.");
  assert.equal(lageTekst({category:"Sport",text:"Ordinær tekst",speechText:"Tilpasset uttale"}),
    "Sport. Tilpasset uttale");
  assert.equal(lageTekst({text:"120 kr"}),"Nyheter. 120 kroner");
});

test("Radiotale leser enkle beløp og mengder grammatisk, uten å endre tallverdier", () => {
  const tale = vm.runInContext("lagRadioOpplesning", sandbox);
  assert.equal(tale({ text: "1 mrd. kr, 2,5 mrd. kr, 1 mill. kr og 3 mill. kr." }),
    "Nyheter. 1 milliard kroner, 2,5 milliarder kroner, 1 million kroner og 3 millioner kroner.");
  assert.equal(tale({ text: "2 500 kr og 15,5 %." }),
    "Nyheter. 2 500 kroner og 15,5 prosent.");
  assert.equal(tale({ text: "ca. 2 mill. kr, bl.a. til skole, f.eks. i Oslo." }),
    "Nyheter. cirka 2 millioner kroner, blant annet til skole, for eksempel i Oslo.");
  assert.equal(tale({ text: "1. januar 2027 og 5 mot 4 stemmer." }),
    "Nyheter. 1. januar 2027 og 5 mot 4 stemmer.",
    "Datoer og opptellingsresultat skal aldri tolkes som klokkeslett");
});

test("Radioopplesning gjør digitale klokkeslett tydelige, men lar ugyldige klokkeslett stå", () => {
  const tale = vm.runInContext("lagRadioOpplesning", sandbox);
  assert.equal(tale({ text: "Trikken stanser klokken 15.00 til 15.15." }),
    "Nyheter. Trikken stanser klokken femten til femten femten.");
  assert.equal(tale({ text: "Møtet begynner kl. 08.05, neste møte klokken 21:30." }),
    "Nyheter. Møtet begynner klokken åtte null fem, neste møte klokken tjueen tretti.");
  assert.equal(tale({ text: "Klokken 25.99 og serien 15.15 er bare tekst." }),
    "Nyheter. Klokken 25.99 og serien 15.15 er bare tekst.");
});

test("Bare entydige initialord utvides automatisk, ikke deler av navn", () => {
  const tale = vm.runInContext("lagRadioOpplesning", sandbox);
  assert.equal(tale({ text: "SV og MDG diskuterer KI. NRK og NHO følger saken." }),
    "Nyheter. Sosialistisk Venstreparti og Miljøpartiet De Grønne diskuterer kunstig intelligens. Norsk rikskringkasting og Næringslivets Hovedorganisasjon følger saken.");
  assert.equal(tale({ text: "KI-bruk, UDN og NRK-saken omtales." }),
    "Nyheter. KI-bruk, UDN og NRK-saken omtales.",
    "Ukjente forkortelser og sammensetninger skal kreve et redaksjonelt uttalevalg");
});

test("Redaksjonell uttaleordbok erstatter hele fraser kun i tale, ikke i notisbåndet", () => {
  const tale = vm.runInContext("lagRadioOpplesning", sandbox);
  const notis = {
    category: "Kultur",
    text: "Audna og Alta. Puskas Musikk & Platebar i Alta, ikke Altaværing.",
    speechPronunciations: {
      "Puskas Musikk & Platebar": "Puskas Musikk og Platebar",
      "Alta": "Alta-byen"
    }
  };
  assert.equal(tale(notis),
    "Kultur. Audna og Alta-byen. Puskas Musikk og Platebar i Alta-byen, ikke Altaværing.");
  assert.equal(notis.text, "Audna og Alta. Puskas Musikk & Platebar i Alta, ikke Altaværing.");
  assert.equal(tale({ text: "A.B og A-B og Aa", speechPronunciations: {
    "A.B": "A punktum B", "": "feil", "Aa": ""
  } }), "Nyheter. A punktum B og A-B og Aa");
  assert.equal(tale({ text: "Original tekst", speechText: "Tilpasset lesetekst" }),
    "Nyheter. Tilpasset lesetekst");
});

test("Tre faktiske norske notiser har etterprøvbare talevalg uten redigert nyhetsinnhold", () => {
  const tale = vm.runInContext("lagRadioOpplesning", sandbox);
  const notes = JSON.parse(fs.readFileSync(path.join(root,"notiser.json"), "utf8"));
  const horst = notes.find(n=>n.id==="notis-horst-forlag-ki-kontrakter-20261113");
  const nho = notes.find(n=>n.id==="notis-norsk-industri-stotter-posten-20261113");
  const puskas = notes.find(n=>n.id==="notis-puskas-alta-bakgrunnsmusikk-20261113");
  assert.ok(horst && nho && puskas);
  assert.match(tale(horst), /bruk av kunstig intelligens/);
  assert.match(tale(horst), /tekster generert med kunstig intelligens/);
  assert.doesNotMatch(tale(horst), /KI-detektor|KI-skrevet/);
  assert.match(tale(nho), /Næringslivets Hovedorganisasjons største landsforening/);
  assert.match(tale(puskas), /Puskas Musikk og Platebar/);
  assert.match(horst.text, /KI-genererte tekster/);
  assert.match(nho.text, /NHOs største landsforening/);
  assert.match(puskas.text, /Puskas Musikk & Platebar/);
  assert.ok([horst, nho, puskas].every(n=>n.url.startsWith("https://")));
});

test("Radiomotoren gir pust mellom notiser og krever brukertrykk etter taleavbrudd", () => {
  assert.match(script,/const mellomNyheterMs = 650/);
  assert.match(script,/radioOvergangTimeout = setTimeout/);
  assert.match(script,/clearTimeout\(radioOvergangTimeout\)/);
  assert.match(script,/event\?\.error === "interrupted"/);
  assert.match(script,/radioKreverOmstart = true/);
  assert.match(script,/spillFraKo\(indeks\)/);
  assert.match(script,/visibilitychange/);
  assert.match(script,/tale\?\.speaking/);
  assert.match(script,/Trykk Fortsett for å starte denne nyheten på nytt/);
});

test("To uavhengige hastighetsvelgere ligger i samme notisradiomeny", () => {
  // Båndet beholder sine tre hastigheter og får en tydelig egen etikett.
  assert.match(script, /const fartvalg = \[2, 4, 5\]/);
  assert.match(script, /fartknapp\.textContent = "Tekstbånd · "/);
  assert.match(script, /tickerAnimasjon\.playbackRate = valgtFart/);
  // Talevelgeren fra PR #73 er gjeninnført, under samme eksisterende panel.
  assert.match(script, /tempoLabel\.textContent = "Talehastighet"/);
  assert.match(script, /tempoSelect\.className = "notis-tempo-select"/);
  assert.match(script, /radioInnstillinger\.append\(stemmeLabel, stemmeSelect, stemmeInfo, tempoLabel, tempoSelect\)/);
  assert.match(script, /panel\.append\(radioknapp, radioPauseknapp, radioInnstillinger, radiostatus, radioSideLenke\)/);
  for (const tempo of ["0.9", "1", "1.1"]) {
    assert.match(script, new RegExp("verdi: " + tempo.replace(".", "\\.") + "(?:,| \\})"));
  }
  assert.match(script, /let valgtTaletempo = 1/);
  assert.match(script, /paradisavisa-radiotempo/);
  assert.match(script, /ytring\.rate = valgtTaletempo/);
  assert.match(script, /settTaletempo\(tempoSelect\.value\)/);
  assert.match(script, /setTempo\(verdi\) \{ settTaletempo\(verdi\); \}/);
  assert.match(script, /taletempo\.some\(valg => valg\.verdi === nummer\)/,
    "Ukjente hastigheter skal ikke aksepteres");
  assert.match(script, /paradisavisa-radiostemme/);
  assert.match(script, /notis-radio-pause/);
  assert.match(script, /lagRadioOpplesning\(notis\)/);
  assert.match(script, /radioknapp\.addEventListener\("click"/,
    "Stemmeopplesningen skal fortsatt kreve et brukertrykk");
});

test("Radiosiden har egen talehastighet bundet til den delte motoren", () => {
  const html = fs.readFileSync(path.join(root, "paradisradio.html"), "utf8");
  const side = fs.readFileSync(path.join(root, "radio-player.js"), "utf8");
  assert.match(html, /data-radio="tempo"/);
  assert.match(html, /value="0\.9"/);
  assert.match(html, /value="1"/);
  assert.match(html, /value="1\.1"/);
  assert.match(side, /tempoSelect = finn\("tempo"\)/);
  assert.match(side, /tilstand\.valgtTaletempo/);
  assert.match(side, /spiller\?\.setTempo\(tempoSelect\.value\)/);
  assert.doesNotMatch(side, /new\s+(?:window\.)?SpeechSynthesisUtterance/,
    "Radiosiden skal bruke den eksisterende motoren, ikke lage en ny");
});


test("Radioikonet åpner samme kontroller, og menylinken går til en eksisterende radioside", () => {
  assert.match(script, /valgknapp\.innerHTML = '<svg[^']*<rect x="3" y="9" width="18" height="12"/);
  for (const filePath of ["index.html", "header.html"]) {
    const html = fs.readFileSync(path.join(root, filePath), "utf8");
    assert.match(html, /href="paradisradio\.html">Paradisradioen<\/a>/);
  }
  const radio = fs.readFileSync(path.join(root, "paradisradio.html"), "utf8");
  assert.match(radio, /<h1>Paradisradioen<\/h1>/);
  assert.match(radio, /class="notisbånd"/);
  assert.match(radio, /id="paradisradio-stemme"/);
  assert.match(radio, /data-radio="voice"/);
  assert.match(radio, /data-radio="playlist"/);
  assert.match(radio, /id="paradisradio-player"/);
  assert.match(radio, /data-radio="play"/);
  assert.doesNotMatch(radio, /data-radio="pause"/);
  assert.match(radio, /data-radio="stop"/);
  assert.match(radio, /data-radio="next"/);
  assert.match(radio, /data-radio="previous"/);
  assert.match(radio, /radio-player\.js\?v=4/);
  const side = fs.readFileSync(path.join(root, "radio-player.js"), "utf8");
  assert.match(side, /window\.ParadisRadioPlayer/);
  assert.doesNotMatch(side, /new\s+(?:window\.)?SpeechSynthesisUtterance/);
  assert.match(script, /window\.ParadisRadioPlayer = \{/);
  assert.match(script, /playIndex\(indeks\)/);
  assert.match(script, /setVoice\(verdi\)/);
  assert.match(side, /spiller\?\.playIndex\(indeks\)/);
  assert.match(side, /spiller\?\.setVoice\(stemmevalg\.value\)/);
  assert.match(script, /radioSideLenke\.href/);
  assert.match(script, /radioSistOppdatert/);
  assert.match(script, /5 \* 60 \* 1000/);
});


test("Åpen radioside og notisbånd får ferske saker uten ny radiomotor", () => {
  const start = script.indexOf("const oppdaterAktuelleNotiser = async () =>");
  const slutt = script.indexOf("// Radiosiden og det lille kontrollpanelet bruker samme spiller", start);
  assert.ok(start > 0 && slutt > start, "Mangler oppfriskning av den delte notiskatalogen");
  const kode = script.slice(start, slutt);
  assert.match(kode, /fetch\(source, \{ cache: "no-store" \}\)/);
  assert.match(kode, /data\.filter\(item => isNotisAktuell\(item\)\)/);
  assert.match(kode, /oppdaterRadioKoUnderSending\(gammelKo, data, radioIndeks, gjeldende\)/);
  assert.match(kode, /radioIndeks = plan\.nesteIndeks/);
  assert.match(kode, /radioGjeldendeIndeks = plan\.gjeldendeIndeks/);
  assert.match(kode, /nesteNotisIndeks = aktuelle\.findIndex/);
  assert.match(kode, /oppfriskIntervall = window\.setInterval\(oppdaterAktuelleNotiser, 5 \* 60 \* 1000\)/);
  assert.match(kode, /document\.addEventListener\("visibilitychange", vedTilbakekomst\)/);
  assert.match(kode, /window\.clearInterval\(oppfriskIntervall\)/);
  assert.doesNotMatch(kode, /new SpeechSynthesisUtterance|tale\.speak\(/,
    "En notisoppdatering skal ikke starte opplesning uten brukerklikk");
  assert.match(script, /window\.setTimeout\(loadNotiser, 5 \* 60 \* 1000\)/,
    "Også en tom notisstrøm må kunne oppdage neste publisering");
});

test("Nyhetsstrømmen holder åtte notiser fra 13. november aktive 13.–15. november", () => {
  const noter = JSON.parse(fs.readFileSync(path.join(root, "notiser.json"), "utf8"));
  const dagens = noter.filter(n => n.date === "2026-11-13");
  assert.equal(dagens.length, 8, "Seks opprinnelige og to nye unike notiser");
  for (const dag of [13, 14, 15]) {
    assert.equal(dagens.filter(n => fersk(n, new Date(2026, 10, dag))).length, 8);
  }
  assert.equal(dagens.filter(n => fersk(n, new Date(2026, 10, 16))).length, 0);
});


test("iPad-radioen kan starte siste aktuelle nyhet på nytt uten autoplay", () => {
  const html = fs.readFileSync(path.join(root, "paradisradio.html"), "utf8");
  const side = fs.readFileSync(path.join(root, "radio-player.js"), "utf8");
  assert.match(script, /const sisteRadioNokkel = "paradisavisa-radio-siste-v1"/);
  assert.match(script, /localStorage\.getItem\(sisteRadioNokkel\)/);
  assert.match(script, /localStorage\.setItem\(sisteRadioNokkel/);
  assert.match(script, /finnLagretRadioIndeks/);
  assert.match(script, /\.filter\(item => isNotisAktuell\(item\)\)/);
  assert.match(script, /gjenopptaIndeks: !radioAktiv \? finnLagretRadioIndeks\(\) : -1/);
  assert.match(script, /lagreRadioPosisjon\(notis\)/);
  assert.match(script, /resumeLast\(\) \{/);
  assert.match(script, /if \(indeks >= 0\) spillFraKo\(indeks\)/);
  assert.match(html, /data-radio="resume"[^>]*hidden/);
  assert.match(side, /gjenoppta\.addEventListener\("click", \(\) => spiller\?\.resumeLast\(\)\)/);
  assert.match(script, /vedSynlighetsendring/);
  assert.match(script, /radioKreverOmstart = true/);
});

test("Radiosiden er ryddig, men beholder begge uavhengige fartvalg", () => {
  const html = fs.readFileSync(path.join(root, "paradisradio.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "radio.css"), "utf8");
  assert.match(html, /<details class="radio-innstillinger">/);
  assert.match(html, /<summary>Stemme og talehastighet<\/summary>/);
  assert.match(html, /<details class="radio-spilleliste">/);
  assert.match(html, /data-radio="playlist"/);
  assert.match(html, /data-radio="voice"/);
  assert.match(html, /data-radio="tempo"/);
  assert.match(html, /class="notisbånd"/);
  assert.match(script, /const fartvalg = \[2, 4, 5\]/);
  assert.match(script, /ytring\.rate = valgtTaletempo/);
  assert.match(css, /radio-gjenoppta\[hidden\]/);
});