#!/usr/bin/env python3
"""Klargjør radioens godkjente notiser for lydbygget – publiserer aldri alene.

Dette er et privat byggegrunnlag for PR D. Public release krever særskilt,
dokumentert stemmelisens og redaksjonell kontroll (release-gate.json).
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import pathlib
import re
from zoneinfo import ZoneInfo

from generer_lydpilot import tilpass_uttale

ROOT = pathlib.Path(__file__).resolve().parents[2]
MODEL_REVISION = "e7229f7d33a10e145e109b886d661984201ac3c4"
SYNTHESIS_PROFILE = "no-talesyntese-medium-slower-1.08-pause-0.22-v2"
MIN_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
HTTPS = re.compile(r"^https://[^/\s]+/.+", re.I)


def oslo_dato() -> dt.date:
    return dt.datetime.now(ZoneInfo("Europe/Oslo")).date()


def streng_dato(value: str) -> dt.date:
    if not isinstance(value, str) or not MIN_DATE.fullmatch(value):
        raise ValueError("Ugyldig datoformat (YYYY-MM-DD)")
    out = dt.date.fromisoformat(value)
    if out.isoformat() != value:
        raise ValueError("Ugyldig kalendertid")
    return out


def kontroller_kilde(item: dict) -> tuple[str, str, str, dt.date, dt.date, str]:
    if not isinstance(item, dict):
        raise ValueError("Notis må være JSON-objekt")
    category = item.get("category")
    text = item.get("text")
    url = item.get("url")
    if not isinstance(category, str) or not category.strip() or len(category) > 100:
        raise ValueError("Notis mangler gyldig kategori")
    if not isinstance(text, str) or not 30 <= len(text.strip()) <= 1800:
        raise ValueError("Notis mangler gyldig tekst")
    if not isinstance(url, str) or not HTTPS.match(url):
        raise ValueError("Notis mangler HTTPS-kildelenke")
    speech_text = item.get("speechText")
    if speech_text is not None and (
        not isinstance(speech_text, str) or not 30 <= len(speech_text.strip()) <= 2200
    ):
        raise ValueError("Ugyldig redaksjonelt speechText")
    published = streng_dato(item.get("date"))
    expires = streng_dato(item["expires"]) if item.get("expires") else published + dt.timedelta(days=6)
    expires = min(expires, published + dt.timedelta(days=6))
    if expires < published:
        raise ValueError("Notisens utløpsdato er før publiseringsdato")
    return category.strip(), text.strip(), url, published, expires, tilpass_uttale(item)


def frigitt(policy: dict) -> bool:
    """To eksplisitte godkjenninger samt dokumentert redaktør kreves."""
    return (
        policy.get("publicAudioEnabled") is True
        and policy.get("modelRightsStatus") == "APPROVED"
        and policy.get("editorialAudioStatus") == "APPROVED"
        and isinstance(policy.get("approvedBy"), str)
        and bool(policy["approvedBy"].strip())
    )


def bygg_forslag(items: list, policy: dict, today: dt.date) -> dict:
    if not isinstance(items, list):
        raise ValueError("notiser.json må være en liste")
    rows = []
    ids = set()
    for item in items:
        category, original, source, date, expires, spoken = kontroller_kilde(item)
        if not (date <= today <= expires):
            continue
        identifier = hashlib.sha256(
            (date.isoformat() + "\n" + category + "\n" + source).encode("utf-8")
        ).hexdigest()[:20]
        if identifier in ids:
            raise ValueError("Kollisjon: to aktive notiser har samme kilde, dato og kategori")
        ids.add(identifier)
        content_hash = hashlib.sha256(
            (spoken + "\n" + MODEL_REVISION + "\n" + SYNTHESIS_PROFILE).encode("utf-8")
        ).hexdigest()
        rows.append({
            "id": identifier,
            "category": category,
            "date": date.isoformat(),
            "expires": expires.isoformat(),
            "source": source,
            "originalSha256": hashlib.sha256(original.encode("utf-8")).hexdigest(),
            "speechSha256": hashlib.sha256(spoken.encode("utf-8")).hexdigest(),
            "contentHash": content_hash,
            "candidateFile": "lyd/" + identifier + "-" + content_hash[:16] + ".mp3",
        })
    # Dette er *aldri* et offentlig manifest. Selv godkjent policy krever
    # separat, kontrollert byggetrinn og distribusjon på Pages.
    return {
        "schemaVersion": 1,
        "privateCandidateOnly": True,
        "publicPlayable": False,
        "status": "AVVENTER_PUBLISERINGSKONTROLL" if not frigitt(policy) else "KLAR_FOR_SEPARAT_BYGGETRINN",
        "asOfOsloDate": today.isoformat(),
        "voiceModelRevision": MODEL_REVISION,
        "profile": SYNTHESIS_PROFILE,
        "count": len(rows),
        "items": rows,
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--source", type=pathlib.Path, default=ROOT / "notiser.json")
    p.add_argument("--policy", type=pathlib.Path, default=ROOT / "radio/release-gate.json")
    p.add_argument("--out", type=pathlib.Path, default=pathlib.Path("radio-kandidat/manifest.json"))
    p.add_argument("--today", type=str, default=None)
    p.add_argument("--publish", action="store_true", help="Forbudt i denne private byggefase")
    args = p.parse_args()

    if args.publish:
        raise SystemExit("Sperret: Automatisk offentlig lydpublisering er ikke implementert")
    policy = json.loads(args.policy.read_text(encoding="utf-8"))
    items = json.loads(args.source.read_text(encoding="utf-8"))
    result = bygg_forslag(items, policy, streng_dato(args.today) if args.today else oslo_dato())
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Privat lydplan: {result['count']} aktive notiser – {result['status']}")
    print(args.out)


if __name__ == "__main__":
    main()
