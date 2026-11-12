#!/usr/bin/env python3
"""Produser sju originale redaksjonelle WebP-kandidater fra lokale SVG-kilder.

Ingen nettverk, bilder fra tredjeparter eller eksterne ressurser. Bevarer utkaststatus.
Kjør: python scripts/generer-sju-artikkelbilder.py
"""
from __future__ import annotations
import hashlib, io, json, pathlib, re, sys
import xml.etree.ElementTree as ET
import cairosvg
from PIL import Image, ImageStat

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "redaksjon/illustrasjoner/2026-11-12"
OUTPUT = ROOT / "utkast/2026-11-12/bilder"
SLUGS = (
    "boligopproret-spania",
    "appene-som-manipulerer",
    "nussir-hvem-eier-kobberet",
    "smabarnsforeldre-jobbpress",
    "gullbjornen-kasakhstan",
    "avedon-fotografen-amerika",
    "norge-vannlekkasjer",
)
DESCRIPTIONS = {
  "boligopproret-spania": "Redaksjonell illustrasjon: boligprotest i et generisk, Madrid-inspirert byrom i regnvær. Ikke foto fra demonstrasjonen.",
  "appene-som-manipulerer": "Redaksjonell illustrasjon: mobilgrensesnitt, gjentatte varsler og digitale valgfeller. Ingen virkelig appskjerm.",
  "nussir-hvem-eier-kobberet": "Redaksjonell illustrasjon av et generisk nordnorsk fjord- og gruvelandskap. Ikke geografisk dokumentasjon av Nussir.",
  "smabarnsforeldre-jobbpress": "Redaksjonell illustrasjon av en familiekveld med barn og arbeid ved kjøkkenbordet. Personene er oppdiktede.",
  "gullbjornen-kasakhstan": "Symbolillustrasjon av et gullornament i arkeologisk jord. Ikke foto eller eksakt rekonstruksjon av funnet.",
  "avedon-fotografen-amerika": "Redaksjonell illustrasjon av et fotografistudio. Ingen originalfotografi av Richard Avedon er gjengitt.",
  "norge-vannlekkasjer": "Redaksjonell snittillustrasjon av vannledning med lekkasje under en bygate. Ikke foto eller måling fra en bestemt kommune.",
}

def sha256(blob: bytes) -> str:
    return hashlib.sha256(blob).hexdigest()

def convert(slug: str) -> dict:
    source = SOURCE / f"{slug}-original.svg"
    destination = OUTPUT / f"{slug}.webp"
    svg = source.read_bytes()
    if not svg.strip().startswith(b"<svg"):
        raise ValueError(f"{slug}: feil SVG-start")
    root = ET.fromstring(svg)
    if root.tag != "{http://www.w3.org/2000/svg}svg":
        raise ValueError(f"{slug}: uventet SVG-rot")
    if root.attrib.get("width") != "1600" or root.attrib.get("height") != "900":
        raise ValueError(f"{slug}: feil originalstørrelse")
    if re.search(rb'<(?:image|script|foreignObject)\\b', svg, re.I):
        raise ValueError(f"{slug}: ekstern ressurs eller script i SVG")
    if b"http://" in svg or b"https://" in svg.replace(b"http://www.w3.org/2000/svg", b""):
        raise ValueError(f"{slug}: uventet ekstern URL i SVG")
    png = cairosvg.svg2png(bytestring=svg, output_width=1600, output_height=900)
    im = Image.open(io.BytesIO(png)).convert("RGB")
    if im.size != (1600, 900):
        raise ValueError(f"{slug}: feil dekodet størrelse {im.size}")
    deviations = ImageStat.Stat(im.resize((100, 56))).stddev
    if max(deviations) < 9:
        raise ValueError(f"{slug}: bildet er nesten ensfarget")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    im.save(destination, format="WEBP", quality=85, method=6)
    webp = destination.read_bytes()
    if not (webp[:4] == b"RIFF" and webp[8:12] == b"WEBP" and len(webp) > 10000):
        raise ValueError(f"{slug}: ugyldig eller for liten WebP")
    return {
      "slug": slug,
      "source": source.relative_to(ROOT).as_posix(),
      "source_sha256": sha256(svg),
      "file": destination.relative_to(ROOT).as_posix(),
      "webp_sha256": sha256(webp),
      "bytes": len(webp),
      "width": 1600,
      "height": 900,
      "status": "redaksjonell illustrasjonskandidat; ikke godkjent for publisering",
      "caption": DESCRIPTIONS[slug],
    }

def main() -> None:
    entries = [convert(slug) for slug in SLUGS]
    manifest = {
      "date": "2026-11-12",
      "purpose": "Sju originalillustrasjoner for kildekontrollerte artikkelutkast",
      "publication_approved": False,
      "image_use": "Utkast. Kontroller og godkjenn enkeltvis før publisering.",
      "items": entries,
    }
    output = SOURCE / "manifest.json"
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for entry in entries:
        print(f"{entry['slug']}: {entry['width']}x{entry['height']} WebP, {entry['bytes']} byte, SHA-256={entry['webp_sha256']}")
    print("7/7 gyldige originale WebP-bildekandidater. Ingen publisering.")

if __name__ == "__main__":
    main()
