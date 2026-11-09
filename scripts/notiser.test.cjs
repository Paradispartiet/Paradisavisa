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
  assert.equal(fersk(note("2026-11-03")), true);
  assert.equal(fersk(note("2026-11-02")), false);
  assert.equal(fersk(note("2025-10-24")), false);
  assert.equal(fersk(note("2026-11-10")), false);
  assert.equal(fersk(note("2026-02-30")), false);
  assert.equal(fersk({ text: "Utdatert uten dato" }), false);
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

test("Notisbåndet bruker bare 2×/4×/6× og samler radio/pause/fart i én meny", () => {
  assert.match(script, /const fartvalg = \[2, 4, 6\]/);
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
  assert.match(index, /styles\.css\?v=41/);
});

test("Notisbåndet animerer bare et kort spor uten å lage en gigantisk liste", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const ticker = script.slice(script.indexOf("const lagNotiselement = n =>"),
    script.indexOf("// Én knapp åpner alle tre kontrollene."));
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

test("Radiotekst tilpasses uttale uten å endre godkjent notis", () => {
  const lageTekst=vm.runInContext("lagRadioOpplesning",sandbox);
  const notis={category:"Økonomi",text:"Norge bidrar med 2,5 mrd. kr og 30 %."};
  assert.equal(lageTekst(notis),"Økonomi. Norge bidrar med 2,5 milliarder kr og 30 prosent.");
  assert.equal(notis.text,"Norge bidrar med 2,5 mrd. kr og 30 %.");
  assert.equal(lageTekst({category:"Sport",text:"Ordinær tekst",speechText:"Tilpasset uttale"}),
    "Sport. Tilpasset uttale");
  assert.equal(lageTekst({text:"120 kr"}),"Nyheter. 120 kroner");
});

test("Norsk stemmevalg, asynkron stemmeliste og radiotempo ligger i én meny", () => {
  assert.match(script,/voiceschanged/);
  assert.match(script,/getVoices/);
  assert.match(script,/paradisavisa-radiostemme/);
  assert.match(script,/paradisavisa-radiotempo/);
  assert.match(script,/notis-stemme-select/);
  assert.match(script,/notis-tempo-select/);
  assert.match(script,/notis-radio-pause/);
  assert.match(script,/lagRadioOpplesning\(notis\)/);
  assert.match(script,/ytring\.rate = valgtTaletempo/);
});
