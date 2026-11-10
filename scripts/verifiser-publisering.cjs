"use strict";
const fs = require("node:fs");

const origin = "https://paradispartiet.github.io/Paradisavisa/";
const sha = process.env.GITHUB_SHA || "manual";
const eventPath = process.env.GITHUB_EVENT_PATH;
const required = ["index.html", "styles.css", "avisdesign.css",
  "qa/radio-media-session.html",
  "script.js", "service-worker.js", "notiser.json", "Nyhetshjul.json",
  "Sportshjul.json",
  "artikler/2026-11-05-ronaldo-landslagsavskjed.html",
  "Bilder/Artikler/2026-11-07-ronaldo-hovedbilde-portrett.webp",
  "Bilder/Artikler/2026-11-06-ronaldo-symbolmettet-analyse.webp"];
const changed = [];

if (eventPath && fs.existsSync(eventPath)) {
  try {
    const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
    for (const commit of event.commits || []) {
      changed.push(...(commit.added || []), ...(commit.modified || []));
    }
  } catch (error) {
    console.warn("Kunne ikke lese endringslisten:", error.message);
  }
}

const candidates = [...new Set([...required, ...changed])].filter(file => {
  if (!/\.(?:html|css|js|json|xml|txt|svg|png|jpe?g|webp|webmanifest)$/i.test(file)) return false;
  if (file.split("/").some(part => part.startsWith("."))) return false;
  if (file.startsWith("scripts/") || file.startsWith("node_modules/")) return false;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  return fs.statSync(file).size <= 2_000_000;
});

if (candidates.length === 0) {
  console.error("Ingen offentlige filer å verifisere – kontrollen kan ikke godkjennes.");
  process.exit(1);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkFile(file, attempt) {
  const relativeUrl = file.split("/").map(encodeURIComponent).join("/");
  const url = new URL(relativeUrl, origin);
  url.searchParams.set("verify", sha + "-" + attempt);
  const response = await fetch(url, {
    headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
    signal: AbortSignal.timeout(18000)
  });
  if (!response.ok) return file + ": HTTP " + response.status;
  const deployed = Buffer.from(await response.arrayBuffer());
  const source = fs.readFileSync(file);
  if (!source.equals(deployed)) return file + ": offentlig innhold er ikke siste versjon";
  return null;
}

(async () => {
  const maxAttempts = 48; // Gir Pages tid til bygging og CDN-oppdatering.
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const errors = [];
    for (const file of candidates) {
      try {
        const error = await checkFile(file, attempt);
        if (error) errors.push(error);
      } catch (error) {
        errors.push(file + ": " + error.message);
      }
    }
    if (errors.length === 0) {
      console.log("PUBLISERT: Offentlig GitHub Pages matcher main (" + sha + ")");
      console.log("Verifiserte filer: " + candidates.join(", "));
      process.exit(0);
    }
    if (attempt === maxAttempts) {
      console.error("PUBLISERING IKKE VERIFISERT: " + errors.join(" | "));
      process.exit(1);
    }
    if (attempt === 1 || attempt % 5 === 0) {
      console.log("Forsøk " + attempt + "/" + maxAttempts + ": " + errors.slice(0, 3).join(" | "));
    }
    await delay(12000);
  }
})().catch(error => {
  console.error("Publiseringskontroll feilet:", error);
  process.exit(1);
});
