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
  assert.equal(notes.length, 54, "De 52 eksisterende notisene skal beholdes og to legges til");
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
  assert.match(script, /radiosaker = prioriterNyeRadioNotiser\(radiosaker, data\);/);
});

test("Radiotekst tilpasses uttale uten å endre godkjent notis", () => {
  const lageTekst=vm.runInContext("lagRadioOpplesning",sandbox);
  const notis={category:"Økonomi",text:"Norge bidrar med 2,5 mrd. kr og 30 %."};
  assert.equal(lageTekst(notis),"Økonomi. Norge bidrar med 2,5 milliarder kr og 30 prosent.");
  assert.equal(notis.text,"Norge bidrar med 2,5 mrd. kr og 30 %.");
  assert.equal(lageTekst({category:"Sport",text:"Ordinær tekst",speechText:"Tilpasset uttale"}),
    "Sport. Tilpasset uttale");
  assert.equal(lageTekst({text:"120 kr"}),"Nyheter. 120 kroner");
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
  assert.match(kode, /prioriterNyeRadioNotiser\(gammelKo, data\)/);
  assert.match(kode, /radioIndeks = neste \? finn\(neste\) : nyKo\.length/);
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