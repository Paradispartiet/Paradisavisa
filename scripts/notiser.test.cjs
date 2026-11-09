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
  assert.match(index, /styles\.css\?v=39/);
});
