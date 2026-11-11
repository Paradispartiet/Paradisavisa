#!/usr/bin/env python3
"""Lag Paradisavisas seks Instagram-tekstkort fra godkjente artikkelbilder.

Kjør i repo-roten: python3 scripts/generer-instagramkort.py
Krever Pillow. Resultatet er PNG 1080 x 1350 (4:5).
Oppdater aldri originalbildene; tekst settes i et eget svart felt.
"""
from __future__ import annotations

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "Bilder" / "Instagram"
W, H = 1080, 1350
PHOTO_H = 745
MARGIN = 64
FOOTER_Y = 1299
TEXT_BOTTOM = 1250
BLACK = "#090a0c"
WHITE = "#fafafa"
GRAY = "#c6c8cd"
GOLD = "#e1b35b"

POSTS = [
    {
        "id": "store-stubb-diplomati",
        "image": "Bilder/Artikler/store-stubb-geopolitisk-1600x900.jpg",
        "title": "Diplomati – eller en ny risiko?",
        "excerpt": "Støre og Stubb har snakket med Putin. Gir kontakten rom for forhandlinger – eller større risiko for splittelse i Europa?",
        "ig_url": "https://www.instagram.com/p/DfVm2OhikEA/",
        "center": [0.51, 0.5],
        "image_credit": "KI-assistert redaksjonell illustrasjon. Ikke dokumentarfotografi.",
    },
    {
        "id": "binance-kryptotyveri",
        "image": "Bilder/Artikler/binance-cybersikkerhet-fotomontasje-2026.jpg",
        "title": "6,3 milliarder dollar borte",
        "excerpt": "Et omfattende kryptotyveri setter Binance i søkelyset. Hvordan kunne det skje – og hvem skal dekke tapet?",
        "ig_url": "https://www.instagram.com/p/DfVmvIRCAcc/",
        "center": [0.53, 0.5],
        "image_credit": "Redaksjonell fotomontasje, ikke fra hendelsen.",
    },
    {
        "id": "serbia-studentbevegelse",
        "image": "Bilder/Artikler/serbia-studentprotest-novi-sad-2025-arkivfoto.jpg",
        "title": "Fra protest til valgseier",
        "excerpt": "Tragedien i Novi Sad utløste studentprotester. Nå utfordrer bevegelsen makthaverne gjennom valg.",
        "ig_url": "https://www.instagram.com/p/DfVmncljfSB/",
        "center": [0.49, 0.5],
        "image_credit": "Arkivfoto fra studentprotest i 2025 – ikke fra valget. Lisens i kildefil.",
    },
    {
        "id": "trump-wsj-rettssak",
        "image": "Bilder/Artikler/trump-wsj-dom-fotomontasje-2026.jpg",
        "title": "Trumps milliardsøksmål avvist",
        "excerpt": "En føderal dommer har avvist Trumps søksmål. Retten har ikke avgjort om det omstridte brevet er ekte.",
        "ig_url": "https://www.instagram.com/p/DfVmgK0iMaj/",
        "center": [0.46, 0.5],
        "image_credit": "Redaksjonell fotomontasje, ikke fra rettsbehandlingen.",
    },
    {
        "id": "meta-journalistikk",
        "image": "Bilder/Artikler/meta-plattformmakt-redaksjon-kiillustrasjon-2026.jpg",
        "title": "Hvem bestemmer over journalistikken?",
        "excerpt": "Norske mediehus har fått midlertidig stanset omstridte Meta-vilkår. Striden om pressefrihet og rettigheter fortsetter.",
        "ig_url": "https://www.instagram.com/p/DfVmY56CtBZ/",
        "center": [0.55, 0.5],
        "image_credit": "KI-assistert redaksjonell illustrasjon. Ikke dokumentarfotografi.",
    },
    {
        "id": "sofienberg-kirke",
        "image": "Bilder/Artikler/sofienberg-pingpong-hd.webp",
        "title": "Sofienberg kirke er varm. Folk fryser utenfor.",
        "excerpt": "Konserter, kor og aktiviteter fyller kirken. Men hvem får et gratis, varmt sted å være?",
        "ig_url": "https://www.instagram.com/p/DfVmSNzCKbO/",
        "center": [0.5, 0.5],
        "image_credit": "KI-assistert redaksjonell illustrasjon. Ikke dokumentarfotografi.",
    },
]


def font(bold: bool, size: int) -> ImageFont.FreeTypeFont:
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    paths = [
        Path("/usr/share/fonts/truetype/dejavu") / name,
        Path("/usr/local/share/fonts") / name,
    ]
    for path in paths:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.truetype(name, size)


def wrap(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines = []
    line = ""
    for word in text.split():
        if draw.textlength(word, font=face) > width:
            raise ValueError(f"Ord kan ikke brekkes uten kutt: {word!r}")
        candidate = f"{line} {word}" if line else word
        if line and draw.textlength(candidate, font=face) > width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def fit(draw: ImageDraw.ImageDraw, text: str, bold: bool, size: int, minimum: int,
        maxlines: int, maxheight: int) -> tuple[ImageFont.FreeTypeFont, list[str], int]:
    for sz in range(size, minimum - 1, -1):
        face = font(bold, sz)
        lines = wrap(draw, text, face, W - 2 * MARGIN)
        lineheight = round(sz * (1.24 if not bold else 1.16))
        if len(lines) <= maxlines and len(lines) * lineheight <= maxheight:
            return face, lines, lineheight
    raise ValueError(f"Teksten er for lang: {text[:100]!r}")


def render(post: dict) -> dict:
    source = ROOT / post["image"]
    if not source.is_file():
        raise FileNotFoundError(f"Mangler godkjent originalbilde: {source}")
    with Image.open(source) as original:
        original = ImageOps.exif_transpose(original).convert("RGB")
        art = ImageOps.fit(original, (W, PHOTO_H), method=Image.Resampling.LANCZOS,
                           centering=tuple(post["center"]))

    output = Image.new("RGB", (W, H), BLACK)
    output.paste(art, (0, 0))
    draw = ImageDraw.Draw(output)

    y = PHOTO_H + 49
    hface, hlines, hstep = fit(draw, post["title"], bold=True, size=69,
                              minimum=46, maxlines=4, maxheight=295)
    for line in hlines:
        draw.text((MARGIN, y), line, font=hface, fill=WHITE, stroke_width=0)
        y += hstep
    y += 22

    maxbody = TEXT_BOTTOM - y
    if maxbody < 80:
        raise ValueError(f"Ikke plass til ingress etter overskrift for {post['id']}")
    bface, blines, bstep = fit(draw, post["excerpt"], bold=False, size=37,
                              minimum=28, maxlines=5, maxheight=maxbody)
    for line in blines:
        draw.text((MARGIN, y), line, font=bface, fill=GRAY)
        y += bstep
    if y > TEXT_BOTTOM:
        raise ValueError(f"Ingress overskrider nedre grense for {post['id']}")

    draw.text((MARGIN, FOOTER_Y), "https://paradispartiet.github.io/Paradisavisa/",
              font=font(False, 27), fill=GOLD, anchor="lm")

    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{post['id']}.png"
    output.save(dest, format="PNG", optimize=True)
    # Maskinelt sikret format + separat tekstfelt; kontroll av innhold skjer før publisering.
    with Image.open(dest) as check:
        if check.size != (W, H) or check.format != "PNG":
            raise RuntimeError(f"Ugyldig publiseringsfil: {dest}")
    return {"id": post["id"], "image": post["image"], "output": dest.relative_to(ROOT).as_posix(),
            "instagram_original": post["ig_url"], "title": post["title"],
            "excerpt": post["excerpt"], "credit": post["image_credit"],
            "width": W, "height": H, "bytes": dest.stat().st_size}


def main() -> None:
    items = [render(post) for post in POSTS]
    report = OUT / "kilderegister.json"
    report.write_text(json.dumps({"format": "Instagram 4:5 med tekst",
                                  "reference": "redaksjon/INSTAGRAM-KORT.md",
                                  "items": items}, ensure_ascii=False, indent=2) + "\n",
                      encoding="utf-8")
    for item in items:
        print(f"OK {item['output']} ({item['bytes']} bytes)")
    print("MERK: Bare bildefiler. Ingen Instagram-innlegg er endret eller publisert.")


if __name__ == "__main__":
    main()
