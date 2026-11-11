/* Paradisavisa: redaksjonell tilstandsrapport for offentlig notisstrøm.
   Leser bare notiser.json. Verken henter, skriver, godkjenner eller publiserer nyheter. */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const MSONE = 86400000;
function lokalDato(now = new Date()) {
  const deler = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const p = Object.fromEntries(deler.filter(x => x.type !== "literal").map(x => [x.type, x.value]));
  return p.year + "-" + p.month + "-" + p.day;
}
function dagnummer(dato) {
  if (typeof dato !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dato)) return null;
  const [aar, maaned, dag] = dato.split("-").map(Number);
  const nummer = Date.UTC(aar, maaned - 1, dag);
  const kontroll = new Date(nummer);
  if (kontroll.getUTCFullYear() !== aar || kontroll.getUTCMonth() !== maaned - 1 ||
      kontroll.getUTCDate() !== dag) return null;
  return Math.floor(nummer / MSONE);
}
function analyseNotiser(notiser, dato = lokalDato()) {
  if (!Array.isArray(notiser)) throw new TypeError("Notisfilen må inneholde en liste.");
  const iDag = dagnummer(dato);
  if (iDag === null) throw new TypeError("Ugyldig kontrolldato.");
  const brukteIder = new Set();
  const brukteLenker = new Set();
  const feil = [];
  const advarsler = [];
  const saker = [];
  const kategorier = {};
  for (let i = 0; i < notiser.length; i++) {
    const n = notiser[i];
    const nr = i + 1;
    const problemer = [];
    if (!n || typeof n !== "object" || Array.isArray(n)) {
      feil.push("Notis " + nr + " er ikke et objekt.");
      continue;
    }
    const id = typeof n.id === "string" ? n.id.trim() : "";
    const tittel = String(n.text || "").trim();
    const kategori = String(n.category || "").trim();
    const publisert = dagnummer(n.date);
    const utlop = n.expires == null ? null : dagnummer(n.expires);
    if (!id) advarsler.push("Notis " + nr + " mangler stabil id (eldre notis).");
    else {
      if (brukteIder.has(id)) problemer.push("duplisert id");
      brukteIder.add(id);
    }
    if (!tittel) problemer.push("mangler tekst");
    if (!kategori) problemer.push("mangler kategori");
    if (publisert === null) problemer.push("ugyldig publiseringsdato");
    if (n.expires != null && utlop === null) problemer.push("ugyldig utløpsdato");
    if (utlop !== null && publisert !== null && utlop < publisert)
      problemer.push("utløp før publisering");
    let lenke = "";
    try {
      const url = new URL(n.url);
      if (url.protocol !== "https:" || !url.hostname) throw new Error("ikke HTTPS");
      lenke = url.href;
      if (brukteLenker.has(lenke)) problemer.push("duplisert kildelenke");
      brukteLenker.add(lenke);
    } catch {
      problemer.push("mangler gyldig HTTPS-kildelenke");
    }
    if (problemer.length) feil.push("Notis " + nr + ": " + problemer.join(", ") + ".");
    const alder = publisert === null ? null : iDag - publisert;
    const sisteDag = publisert === null ? null :
      Math.min(publisert + 6, utlop === null ? Infinity : utlop);
    const dagerIgjen = sisteDag === null ? null : sisteDag - iDag;
    const status = problemer.length ? "ugyldig" :
      alder < 0 ? "framtidig" :
      dagerIgjen < 0 ? "utløpt" :
      dagerIgjen <= 1 ? "utløper snart" : "aktuell";
    if (status === "aktuell" || status === "utløper snart")
      kategorier[kategori] = (kategorier[kategori] || 0) + 1;
    saker.push({nr, id, kategori, text:tittel, date:n.date, expires:n.expires || null,
      url:lenke, status, dagerIgjen, alder});
  }
  const tell = status => saker.filter(s => s.status === status).length;
  const aktive = saker.filter(s => ["aktuell","utløper snart"].includes(s.status));
  return {
    dato, totalt:saker.length, aktive:aktive.length,
    utlopSnart:tell("utløper snart"), utlopte:tell("utløpt"),
    fremtidige:tell("framtidig"), ugyldige:tell("ugyldig"),
    publisertIDag:aktive.filter(s => s.alder === 0).length,
    publisertIGaar:aktive.filter(s => s.alder === 1).length,
    kategorier, saker, feil, advarsler
  };
}
function rensCell(tekst) {
  return String(tekst || "").replace(/\|/g, " / ").replace(/[\n\r]+/g, " ").trim();
}
function lagRapport(r) {
  const nærUtlop = r.saker.filter(s => s.status === "utløper snart")
    .sort((a,b) => a.dagerIgjen - b.dagerIgjen);
  const manglendeDekning = ["Norge","Verden","Politikk","Økonomi","Kultur","Sport","Teknologi"]
    .filter(k => !(r.kategorier[k] > 0));
  const linjer = [
    "# Paradisavisa – daglig notisstatus (" + r.dato + ", Oslo)",
    "",
    "**" + r.aktive + " aktuelle** av " + r.totalt + " lagrede notiser. " +
      r.publisertIDag + " datert i dag, " + r.publisertIGaar + " i går; " +
      r.utlopSnart + " utløper innen ett døgn, " + r.utlopte + " er utløpt.",
    "",
    "## Kategoridekning",
    "",
    "| Kategori | Aktuelle notiser |",
    "|---|---:|"
  ];
  const kategorier = Object.entries(r.kategorier).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],"nb"));
  if (!kategorier.length) linjer.push("| Ingen aktuelle kategorier | 0 |");
  else for (const [kategori,antall] of kategorier)
    linjer.push("| " + rensCell(kategori) + " | " + antall + " |");
  linjer.push("", "## Redaksjonell oppfølging", "");
  if (r.aktive === 0) linjer.push("- **HASTER:** Ingen aktuelle notiser kan leses på radioen.");
  else if (r.aktive < 6) linjer.push("- **Påfyll:** Færre enn seks aktuelle notiser. Finn nye, vesentlige saker med kilder.");
  if (r.publisertIDag === 0)
    linjer.push("- **Ferskhet:** Ingen notiser datert i dag; vurder nyhetsbildet før ny publisering.");
  if (manglendeDekning.length)
    linjer.push("- **Vurder stoffbalanse:** Ingen aktuelle notiser i " +
      manglendeDekning.join(", ") + ". Ikke fyll kategorier med svake saker bare for å nå en kvote.");
  if (nærUtlop.length) {
    linjer.push("- **Følg opp utløp:**", "", "  | Notis | Dato | Dager igjen |", "  |---|---|---:|");
    for(const s of nærUtlop.slice(0,15))
      linjer.push("  | " + rensCell(s.kategori + ": " + s.text.slice(0,88)) +
        " | " + rensCell(s.date) + " | " + s.dagerIgjen + " |");
  }
  if (r.feil.length)
    linjer.push("- **Tekniske feil:** " + r.feil.join(" "));
  if (r.advarsler.length)
    linjer.push("- **Vedlikehold:** " + r.advarsler.length +
      " notiser mangler stabil ID. Kan kompletteres i en egen, kontrollert PR.");
  if (r.aktive >= 6 && r.publisertIDag > 0 && !nærUtlop.length &&
      !r.feil.length && !manglendeDekning.length)
    linjer.push("- Ingen umiddelbare oppfølgingspunkter fra den tekniske statuskontrollen.");
  linjer.push("", "## Redaksjonelle grenser", "",
    "Dette er en **lokal kontroll av metadata**, ikke en faktasjekk, nyhetsinnhenting eller godkjenning. " +
    "Sjekk fortsatt primærkilde, korrekt dato, utvikling i saken og motforestillinger. " +
    "Publisering skjer bare etter separat redaksjonell avgjørelse.",
    "",
    "Rapporten lager ikke nye notiser, endrer ikke kilder og aktiverer ikke lyd/MP3.",
    "");
  return linjer.join("\n");
}
if (require.main === module) {
  const args = process.argv.slice(2);
  const readArg = flag => { const i=args.indexOf(flag); return i >= 0 ? args[i+1] : null; };
  const file = readArg("--file") || path.join(__dirname, "..", "notiser.json");
  const dato = readArg("--date") || lokalDato();
  try {
    const notiser = JSON.parse(fs.readFileSync(file,"utf8"));
    const rapport = analyseNotiser(notiser, dato);
    const markdown = lagRapport(rapport);
    process.stdout.write(markdown + "\n");
    if (process.env.GITHUB_STEP_SUMMARY)
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + "\n", "utf8");
    for(const f of rapport.feil) process.stderr.write("::error::" + f + "\n");
    if (rapport.feil.length) process.exitCode=1;
  } catch(error) {
    process.stderr.write("Notisstatus feilet: " + error.message + "\n");
    process.exitCode=1;
  }
}
module.exports = { lokalDato, dagnummer, analyseNotiser, lagRapport };
