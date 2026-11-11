#!/usr/bin/env python3
"""Render one original, readable Instagram card per NEW article in a SoMe manifest.
No publishing API calls or account mutations.
"""
from __future__ import annotations
import argparse
import io
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
W, H = 1080, 1350
PHOTO_H = 745
MARGIN = 64
TEXT_BOTTOM = 1250


def font(bold: bool, size: int):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    location = Path("/usr/share/fonts/truetype/dejavu") / name
    return ImageFont.truetype(str(location) if location.is_file() else name, size)


def load_art(image_path: Path):
    if image_path.suffix.lower() == ".svg":
        import cairosvg
        png = cairosvg.svg2png(url=str(image_path), output_width=1920)
        return Image.open(io.BytesIO(png)).convert("RGB")
    with Image.open(image_path) as original:
        return ImageOps.exif_transpose(original).convert("RGB")


def wrap(draw, text, face):
    result = []
    line = ""
    for word in text.split():
        if draw.textlength(word, font=face) > W - 2 * MARGIN:
            raise ValueError("Enkeltord passer ikke i Instagram-kortet: " + word)
        candidate = (line + " " + word).strip()
        if line and draw.textlength(candidate, font=face) > W - 2 * MARGIN:
            result.append(line)
            line = word
        else:
            line = candidate
    if line:
        result.append(line)
    return result


def fitted(draw, text, bold, start, minimum, max_lines, max_height):
    for size in range(start, minimum - 1, -2):
        face = font(bold, size)
        lines = wrap(draw, text, face)
        step = round(size * (1.16 if bold else 1.24))
        if len(lines) <= max_lines and len(lines) * step <= max_height:
            return face, lines, step
    raise ValueError("Teksten er for lang for et lesbart kort: " + text[:95])


def create_card(record, root: Path, out_dir: Path):
    image_rel = record["image"]
    image_path = (root / image_rel).resolve()
    if not image_path.is_relative_to(root.resolve()) or not image_path.is_file():
        raise ValueError("Illustrasjonen mangler eller er utenfor repositoriet: " + image_rel)
    if image_path.stat().st_size > 20 * 1024 * 1024:
        raise ValueError("Bilde over 20 MB: " + image_rel)
    photo = load_art(image_path)
    # Respect image focal point when the article has a supported percent position.
    horizontal, vertical = .5, .5
    position = str(record.get("position", "center"))
    percentages = [int(n)/100 for n in re.findall(r"(\d{1,3})%", position)]
    if len(percentages) >= 2:
        horizontal, vertical = percentages[:2]
    elif len(percentages) == 1:
        vertical = percentages[0]
    elif "top" in position:
        vertical = 0
    elif "bottom" in position:
        vertical = 1
    if not 0 <= horizontal <= 1 or not 0 <= vertical <= 1:
        raise ValueError("Ugyldig bildeposisjon")
    art = ImageOps.fit(photo, (W, PHOTO_H), method=Image.Resampling.LANCZOS,
                       centering=(horizontal, vertical))
    card = Image.new("RGB", (W, H), "#090a0c")
    card.paste(art, (0, 0))
    draw = ImageDraw.Draw(card)
    y = PHOTO_H + 49
    face, lines, step = fitted(draw, record["instagram"]["cardTitle"],
                               True, 69, 46, 4, 295)
    for line in lines:
        draw.text((MARGIN,y), line, font=face, fill="#fafafa")
        y += step
    y += 22
    face, lines, step = fitted(draw, record["instagram"]["cardIngress"],
                               False, 37, 27, 5, TEXT_BOTTOM-y)
    for line in lines:
        draw.text((MARGIN,y), line, font=face, fill="#c6c8cd")
        y += step
    if y > TEXT_BOTTOM:
        raise ValueError("Ingress utenfor kortet")
    draw.text((MARGIN, 1299), "PARADISAVISA", font=font(False, 27),
              fill="#e1b35b", anchor="lm")
    out_dir.mkdir(parents=True, exist_ok=True)
    output = out_dir / (record["id"] + ".png")
    card.save(output, format="PNG", optimize=True)
    with Image.open(output) as check:
        if check.size != (W,H) or check.format != "PNG":
            raise ValueError("Kortet ble ikke en gyldig Instagram-PNG")
    return output


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    out_dir = Path(args.out).resolve()
    payload = json.loads(Path(args.manifest).read_text(encoding="utf8"))
    records = payload["newArticles"]
    for record in records:
        output = create_card(record, ROOT, out_dir)
        record["instagram"]["localPng"] = str(output)
        record["instagram"]["mediaBytes"] = output.stat().st_size
        print("Kort kontrollert:", output.name)
    Path(args.manifest).write_text(json.dumps(payload, ensure_ascii=False, indent=2)+"\n",
                                  encoding="utf8")
    print("Antall genererte Instagram-kort:", len(records))


if __name__ == "__main__":
    main()
