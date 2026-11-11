"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { lokalDato, dagnummer, analyseNotiser, lagRapport } = require("./notisstatus.cjs");

const lag = (id, date, extra = {}) => ({
  id, date, category: "Verden", text: "Kildekontrollert testnotis om en aktuell hendelse.",
  url: "https://example.org/nyheter/" + id, ...extra
});

test("Norsk kalenderdato skal ikke følge UTC døgngrensen", () => {
  assert.equal(lokalDato(new Date("2026-11-11T23:30:00Z")), "2026-11-12");
  assert.equal(lokalDato(new Date("2026-07-01T22:30:00Z")), "2026-07-02");
  assert.equal(dagnummer("2026-02-30"), null);
  assert.equal(dagnummer("2026-11-11") - dagnummer("2026-11-10"), 1);
});

test("Rapporten skiller aktive, kommende, utløpende og gamle notiser", () => {
  const saker = [
    lag("ny", "2026-11-11"),
    lag("snart", "2026-11-10", {expires:"2026-11-12"}),
    lag("sju", "2026-11-05", {expires:"2026-11-11"}),
    lag("gammel", "2026-11-04"),
    lag("utloept", "2026-11-10", {expires:"2026-11-10"}),
    lag("framtid", "2026-11-12")
  ];
  const r = analyseNotiser(saker, "2026-11-11");
  assert.equal(r.aktive, 3);
  assert.equal(r.utlopSnart, 2);
  assert.equal(r.utlopte, 2);
  assert.equal(r.fremtidige, 1);
  assert.equal(r.publisertIDag, 1);
  assert.equal(r.publisertIGaar, 1);
  assert.equal(r.ugyldige, 0);
  assert.deepEqual(r.saker.map(s=>s.status),
    ["aktuell","utløper snart","utløper snart","utløpt","utløpt","framtidig"]);
});

test("Rapporten gir samme tre-dagersperiode som nettleserradioen", () => {
  const note = lag("kort", "2026-11-09");
  const normal = analyseNotiser([note], "2026-11-11");
  assert.equal(normal.aktive, 1);
  assert.equal(normal.utlopSnart, 1);
  assert.equal(normal.saker[0].dagerIgjen, 0);
  assert.equal(analyseNotiser([note], "2026-11-12").utlopte, 1);
  assert.equal(analyseNotiser([{ ...note, expires:"2026-11-10" }], "2026-11-11").utlopte, 1);
  const lang = {...note, expires:"2026-11-15"};
  assert.equal(analyseNotiser([lang], "2026-11-15").aktive, 1);
  assert.equal(analyseNotiser([lang], "2026-11-16").utlopte, 1);
  const over = {...note, expires:"2026-11-30"};
  assert.equal(analyseNotiser([over], "2026-11-16").utlopte, 1);
});

test("Duplikater, manglende kilde og feil i holdbarhet er tekniske avvik", () => {
  const r=analyseNotiser([
    lag("a","2026-11-11"),
    lag("a","2026-11-11",{url:"https://example.org/nyheter/a2"}),
    lag("c","2026-11-11",{url:"http://example.org/nyheter/c"}),
    lag("d","2026-11-11",{expires:"2026-11-10"}),
    lag("e","2026-02-30"),
    lag("f","2026-11-11",{url:"https://example.org/nyheter/a"})
  ],"2026-11-11");
  assert.equal(r.ugyldige, 5);
  assert.equal(r.feil.length, 5);
  assert.match(r.feil.join(" "),/duplisert id/);
  assert.match(r.feil.join(" "),/duplisert kildelenke/);
  assert.match(r.feil.join(" "),/HTTPS/);
  assert.match(r.feil.join(" "),/utløp før publisering/);
  assert.match(r.feil.join(" "),/ugyldig publiseringsdato/);
});

test("Eldre notiser uten id rapporteres, men stoppes ikke automatisk", () => {
  const r=analyseNotiser([lag(undefined,"2026-11-11")],"2026-11-11");
  assert.equal(r.aktive, 1);
  assert.equal(r.feil.length,0);
  assert.equal(r.advarsler.length,1);
  assert.match(lagRapport(r),/Vedlikehold/);
});

test("Rapporten er lesbar uten at den godkjenner eller publiserer", () => {
  const r=analyseNotiser([lag("a","2026-11-11",{category:"Kultur"})],"2026-11-11");
  const md=lagRapport(r);
  assert.match(md,/daglig notisstatus \(2026-11-11, Oslo\)/);
  assert.match(md,/1 aktuelle/);
  assert.match(md,/Kategoridekning/);
  assert.doesNotMatch(md,/Ingen notiser datert i dag/);
  assert.match(md,/ikke en faktasjekk/);
  assert.match(md,/lager ikke nye notiser/);
});

test("Dagens notisstrøm kan analyseres uten publisering eller skriving", () => {
  const notiser=JSON.parse(fs.readFileSync(path.join(__dirname,"..","notiser.json"),"utf8"));
  const r=analyseNotiser(notiser,"2026-11-11");
  assert.equal(r.feil.length,0, r.feil.join("; "));
  assert.equal(r.totalt,notiser.length);
  assert.ok(r.aktive >= 10);
  assert.ok(r.publisertIDag >= 1);
});
