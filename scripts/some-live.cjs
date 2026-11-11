"use strict";
// Vent til den NYE artikkelen og originalbildet er synlig på offentlig GitHub Pages,
// og kontroller at byte-innholdet faktisk er versjonen som ble publisert.
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const ORIGIN = "https://paradispartiet.github.io/Paradisavisa/";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function isLive(relative) {
  const local = fs.readFileSync(path.join(ROOT, relative));
  const url = new URL(relative.split("/").map(encodeURIComponent).join("/"), ORIGIN);
  url.searchParams.set("social_verify", process.env.GITHUB_SHA || "check");
  const r = await fetch(url, {headers:{"Cache-Control":"no-cache"},
    signal: AbortSignal.timeout(16000)});
  if (!r.ok) throw new Error(relative + ": HTTP " + r.status);
  const live = Buffer.from(await r.arrayBuffer());
  if (!local.equals(live)) throw new Error(relative + ": offentlig innhold avviker fra GitHub");
}
async function main() {
  if (process.argv.length !== 3) throw new Error("Bruk: node scripts/some-live.cjs <manifest.json>");
  const articles = JSON.parse(fs.readFileSync(process.argv[2],"utf8")).newArticles;
  if (!Array.isArray(articles)) throw new Error("Ugyldig SoMe-manifest");
  if (!articles.length) {
    console.log("Ingen nye artikler, ingen SoMe-meldinger.");
    return;
  }
  const files = [...new Set(articles.flatMap(a => [a.article,a.image]))];
  const attempts = 30;
  for(let attempt=1;attempt<=attempts;attempt++) {
    const errors = await Promise.all(files.map(async f=>{
      try {await isLive(f);return null;}catch(e){return e.message;}
    }));
    const failed = errors.filter(Boolean);
    if (!failed.length) {
      console.log("Alle " + articles.length + " nye artikler og bilder verifisert på offentlig nettadresse.");
      return;
    }
    if (attempt===attempts) throw new Error("Offentlig publisering ikke verifisert: "+failed.join(" | "));
    if (attempt===1 || attempt % 5===0)
      console.log("Offentlig SoMe-sperre "+attempt+"/"+attempts+": "+failed.slice(0,3).join(" | "));
    await sleep(12000);
  }
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={isLive};
