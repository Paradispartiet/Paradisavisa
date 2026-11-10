#!/usr/bin/env python3
"""Bygg en selvstendig lokal lytteside av en PRIVAT Vox-lydartifakt.

HTML-filen blir pakket som Actions-artifakt, ikke publisert til GitHub Pages.
Ingen nettverk, ingen autoplay og ingen runtime-avhengigheter.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import html
import json
import pathlib
import re

TRACK = re.compile(r"^lydproever/[A-Za-z0-9_-]+\.mp3$")
MAX_TRACKS = 12
MAX_MP3_BYTES = 1_000_000
MAX_BUNDLE_BYTES = 8_000_000


def checked_tracks(report_path: pathlib.Path) -> list[dict]:
    report = json.loads(report_path.read_text(encoding="utf-8"))
    if (not isinstance(report, dict)
            or report.get("publicPlayable") is not False
            or report.get("rightsApproved") is not False
            or report.get("qualityApproved") is not False
            or report.get("status") != "UNPUBLISHED_NEWS_VOICE_CANDIDATE"):
        raise ValueError("Kun en upublisert og ikke-godkjent stemmepilot kan brukes")
    samples = report.get("samples")
    texts = report.get("speechTexts")
    if (not isinstance(samples, list) or not 1 <= len(samples) <= MAX_TRACKS
            or report.get("audioCount") != len(samples) or not isinstance(texts, list)):
        raise ValueError("Ufullstendig eller for stor stemmepilot")
    transcription = {}
    for item in texts:
        if not isinstance(item, dict) or not isinstance(item.get("id"), str):
            raise ValueError("Ugyldig referanse til uttaletekst")
        if item["id"] in transcription:
            raise ValueError("Dobbeltført uttaletekst")
        transcription[item["id"]] = str(item.get("speechText") or "")
    seen: set[str] = set()
    size_total = 0
    checked = []
    for sample in samples:
        if not isinstance(sample, dict) or not isinstance(sample.get("file"), str):
            raise ValueError("Ugyldig MP3-post")
        filename = sample["file"]
        if not TRACK.fullmatch(filename) or filename in seen:
            raise ValueError("Utrygg eller dobbeltført MP3-filbane")
        seen.add(filename)
        path = report_path.parent / filename
        if not path.is_file() or not 5000 < path.stat().st_size < MAX_MP3_BYTES:
            raise ValueError("MP3-filen mangler eller har ugyldig størrelse")
        size_total += path.stat().st_size
        if size_total > MAX_BUNDLE_BYTES:
            raise ValueError("Lydpakken er for stor for lokalt lyttepanel")
        sound = path.read_bytes()
        if hashlib.sha256(sound).hexdigest() != sample.get("sha256"):
            raise ValueError("MP3-innholdet avviker fra testens SHA-256")
        if sample.get("id") not in transcription or not transcription[sample["id"]]:
            raise ValueError("Manglende originalt godkjent talegrunnlag")
        if sample.get("profile") not in ("normal", "nyhetsflyt"):
            raise ValueError("Ukjent taleprofil")
        checked.append({**sample, "speechText": transcription[sample["id"]],
                        "src": "data:audio/mpeg;base64," + base64.b64encode(sound).decode("ascii")})
    return checked


def build_panel(report_path: pathlib.Path, output: pathlib.Path) -> pathlib.Path:
    tracks = checked_tracks(report_path)
    cards = []
    for track in tracks:
        category = html.escape(str(track.get("sourceCategory") or "Nyhet"))
        name = "Normal" if track["profile"] == "normal" else "Nyhetsflyt"
        text = html.escape(track["speechText"])
        duration = float(track["durationSeconds"])
        status = ("Arkiv – kun uttaleprøve" if track.get("sourceClass") == "arkiv_kun_uttaletest"
                  else "Fra publisert nyhetsnotis")
        cards.append(
            "<article class='sample'>"
            f"<h2>{category} · {name}</h2>"
            f"<p class='meta'>{html.escape(status)} · {duration:.1f} sekunder</p>"
            f"<audio controls preload='none' playsinline src='{track['src']}'>"
            "Lydavspilling støttes ikke av denne nettleseren.</audio>"
            f"<details><summary>Les teksten</summary><p>{text}</p></details>"
            "</article>"
        )
    page = """<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; media-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'">
<title>Paradisradioen – privat lyttesammenligning</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#070707;color:#f4f4f4;font:16px/1.55 system-ui,-apple-system,sans-serif}
main{max-width:850px;margin:auto;padding:28px 18px 100px}h1{font-size:clamp(1.5rem,4vw,2.4rem);line-height:1.18}
.note{color:#ccc}.warning{border-left:4px solid #e3b93c;padding:12px 16px;background:#191919;margin:22px 0}
.samples{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:16px}
.sample{border:1px solid #4b4b4b;border-radius:12px;padding:18px;background:#141414;min-width:0}
.sample h2{font-size:1.05rem;margin:0 0 8px}.meta{font-size:.85rem;color:#bbb;margin:0 0 14px}
audio{width:100%;min-height:48px}details{margin-top:14px;font-size:.9rem;color:#ddd}
summary{cursor:pointer;color:#f6d365}details p{overflow-wrap:anywhere}
footer{margin-top:24px;font-size:.85rem;color:#aaa}
</style>
</head>
<body><main>
<p class="note">PARADISAVISA · ALLTID NYHETER</p>
<h1>Test av norsk bokmålsstemme</h1>
<p class="warning">Kun privat prøvelytting. Ingen av stemmene er godkjent for offentlig radio.
Innholdet kan være arkivert og er ikke en fersk nyhetssending.</p>
<p>Spill av <strong>Normal</strong> og <strong>Nyhetsflyt</strong> for samme notis.
Bruk teksten under hvert lydklipp for å kontrollere uttale, navn og tall.
Avspilling starter bare når du trykker på lydkontrollen.</p>
<div class="samples">""" + "\n".join(cards) + """</div>
<footer>Prøvefilene er innebygd i denne HTML-filen. Ingen lyd lastes fra nettet.
Lyttetest erstatter ikke rettighetskontroll.</footer>
</main>
<script>document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>{
document.querySelectorAll('audio').forEach(b=>{if(b!==a)b.pause()})}))</script>
</body></html>
"""
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page, encoding="utf-8")
    return output


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--report", type=pathlib.Path, default=pathlib.Path("vox-prove/rapport.json"))
    p.add_argument("--output", type=pathlib.Path, default=pathlib.Path("vox-prove/lyttepanel.html"))
    args = p.parse_args()
    print(build_panel(args.report, args.output))


if __name__ == "__main__":
    main()
