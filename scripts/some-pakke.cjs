"use strict";
/* Oppdag bare NYE, faktisk publiserte artikler. Forandringer i eldre saker
   eller redistribusjon mellom forsidehjul utløser aldri SoMe-innlegg. */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const cp = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const BASE = "https://paradispartiet.github.io/Paradisavisa/";
const FEEDS = [
  ["debatt.json", "Debatt"],
  ["kommentarer.json", "Kommentar"],
  ["Sportshjul.json", "Sport"],
  ["Kulturhjul.json", "Kultur"],
  ["Nyhetshjul.json", "Nyheter"],
  ["Nyhetshjul2.json", "Nyheter"],
  ["posts.json", "Artikkel"]
];

function clean(s) {
  return String(s || "")
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function shorten(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1).lastIndexOf(" ");
  if (cut < Math.floor(max * 0.45)) throw new Error("Uforholdsmessig langt enkeltord");
  return text.slice(0, cut).trimEnd() + "…";
}
function checkedRelative(p, prefix, extension) {
  if (typeof p !== "string" || !p.startsWith(prefix) ||
      p.includes("..") || p.includes("\\") || p.includes("?") ||
      p.includes("#") || /[\u0000-\u001f]/.test(p) || !extension.test(p))
    throw new Error("Ugyldig publiseringsbane: " + String(p).slice(0, 100));
  return p;
}
function loadList(filename, cwd = ROOT) {
  const data = JSON.parse(fs.readFileSync(path.join(cwd, filename), "utf8"));
  if (!Array.isArray(data)) throw new Error("Forventet artikkelstrøm: " + filename);
  return data;
}
function oldList(filename, before, cwd = ROOT) {
  if (!/^[a-f0-9]{40}$/.test(before) || /^0+$/.test(before))
    throw new Error("Mangler gyldig forrige commit – kan ikke identifisere nye saker sikkert");
  try {
    const text = cp.execFileSync("git", ["show", before + ":" + filename],
      {cwd, encoding: "utf8", maxBuffer: 8_000_000, stdio: ["ignore", "pipe", "pipe"]});
    const rows = JSON.parse(text);
    if (!Array.isArray(rows)) throw new Error("Ugyldig forrige JSON: " + filename);
    return rows;
  } catch (e) {
    if (e.message.startsWith("Ugyldig")) throw e;
    throw new Error("Kunne ikke lese " + filename + " i forrige commit; ingen automatisk utsending");
  }
}
function getPublished(articles, fileReader) {
  const result = [];
  for (const a of articles) {
    const url = checkedRelative(a.url, "artikler/", /\.html$/i);
    const image = checkedRelative(a.image, "", /\.(?:webp|jpe?g|png|svg)$/i);
    if (!a.title || !a.excerpt || !a.date ||
        !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) throw new Error("Ufullstendig artikkel: " + url);
    const html = fileReader(url, "utf8");
    if (/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ||
        /REDAKSJONELT UTKAST/i.test(html))
      throw new Error("Utkast ble feilaktig lagt i offentlig strøm: " + url);
    fileReader(image);
    result.push(a);
  }
  return result;
}
function diffFeeds(previousByFeed, currentByFeed, reader) {
  const previous = new Set();
  for (const [feed] of FEEDS) {
    for (const item of (previousByFeed[feed] || [])) {
      if (item && typeof item.url === "string") previous.add(item.url);
    }
  }
  const seen = new Set();
  const result = [];
  for (const [feed, category] of FEEDS) {
    for (const item of (currentByFeed[feed] || [])) {
      if (!item || typeof item.url !== "string" || previous.has(item.url) || seen.has(item.url)) continue;
      // En sak som finnes i flere strømmer produseres én gang.
      seen.add(item.url);
      const [verified] = getPublished([item], reader);
      const title = clean(verified.title);
      const excerpt = clean(verified.excerpt);
      if (title.length < 5 || excerpt.length < 10) throw new Error("For svak overskrift/ingress: " + verified.url);
      const permalink = new URL(verified.url, BASE).href;
      const tag = crypto.createHash("sha256").update(verified.url).digest("hex").slice(0, 12);
      const slug = path.basename(verified.url, ".html").replace(/[^a-zA-Z0-9-]/g, "-");
      const id = slug + "-" + tag;
      const xLink = permalink;
      const xMax = 268; // Reserver plass under vanlig 280-tegnsgrense.
      const xTitle = shorten(title, Math.min(100, xMax - xLink.length - 20));
      const xRoom = xMax - xTitle.length - xLink.length - 6;
      const xBody = xRoom >= 35 ? shorten(excerpt, xRoom) : "";
      const xText = xTitle + (xBody ? "\n" + xBody : "") + "\n" + xLink;
      if (xText.length > 280) throw new Error("X-innlegg er for langt: " + verified.url);
      result.push({
        id, article:verified.url, title, excerpt, date:verified.date,
        image:verified.image, category, permalink,
        instagram: {
          card: "Bilder/SoMe/" + id + ".png",
          cardTitle: shorten(title, 105),
          cardIngress: shorten(excerpt, 145),
          caption: title + "\n\n" + excerpt + "\n\nLes hele saken i Paradisavisa – lenke i bio.",
          footer:"PARADISAVISA"
        },
        x:{text:xText, url:permalink}
      });
    }
  }
  return result;
}
function generate(before, cwd = ROOT) {
  const oldFeeds = {}, newFeeds = {};
  for (const [feed] of FEEDS) {
    oldFeeds[feed] = oldList(feed, before, cwd);
    newFeeds[feed] = loadList(feed, cwd);
  }
  const articles = diffFeeds(oldFeeds, newFeeds,
    (rel, encoding) => fs.readFileSync(path.join(cwd, rel), encoding));
  return {schema:1, site:BASE, sourceCommit:process.env.GITHUB_SHA || "",
    generatedAt:new Date().toISOString(), newArticles:articles};
}
if (require.main === module) {
  const args = process.argv.slice(2);
  const beforeArg = args.indexOf("--before"), outArg = args.indexOf("--out");
  if (beforeArg < 0 || outArg < 0 || !args[beforeArg+1] || !args[outArg+1]) {
    console.error("Bruk: node scripts/some-pakke.cjs --before <40-tegn-commit> --out <json>");
    process.exit(2);
  }
  try {
    const output = generate(args[beforeArg+1]);
    const file = path.resolve(args[outArg+1]);
    fs.mkdirSync(path.dirname(file), {recursive:true});
    fs.writeFileSync(file, JSON.stringify(output, null, 2) + "\n");
    console.log("Nyhetsartikler i SoMe-pakke: " + output.newArticles.length);
    output.newArticles.forEach(a => console.log(a.article));
  } catch (e) {
    console.error("SoMe-pakke stoppet: " + e.message);
    process.exit(1);
  }
}
module.exports = {FEEDS, BASE, clean, shorten, checkedRelative, diffFeeds, generate};
