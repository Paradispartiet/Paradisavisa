#!/usr/bin/env python3
"""Intern lydpilot: bare offentlig publiserte notiser, aldri automatisk publisering."""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]


def les_json(sti: pathlib.Path) -> list[dict]:
    data = json.loads(sti.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError(f"Forventet JSON-liste i {sti}")
    return data


def er_aktuell(notis: dict, idag: dt.date) -> bool:
    try:
        publisert = dt.date.fromisoformat(notis["date"])
        if (idag - publisert).days not in range(7):
            return False
        if notis.get("expires") and idag > dt.date.fromisoformat(notis["expires"]):
            return False
        return bool(str(notis.get("text", "")).strip())
    except (TypeError, ValueError, KeyError):
        return False


def tilpass_uttale(notis: dict) -> str:
    # Eksplisitt godkjent speechText er eneste mulighet til fritekstomskriving.
    original = notis.get("speechText") or notis.get("text") or ""
    tekst = str(original).strip()
    tekst = re.sub(r"(\d+(?:[.,]\d+)?)\s*%", r"\1 prosent", tekst)
    tekst = re.sub(r"(\d+(?:[.,]\d+)?)\s*kr\b", r"\1 kroner", tekst, flags=re.I)
    tekst = re.sub(r"\b(mrd|mill)\.",
                   lambda m: "milliarder" if m.group(1).lower() == "mrd" else "millioner",
                   tekst, flags=re.I)
    return f'{str(notis.get("category") or "Nyheter").strip()}. {tekst}'


def velg_prover(aktive: list[dict], arkiv: list[dict], idag: dt.date, antall: int = 10) -> list[dict]:
    if antall < 1 or antall > 10:
        raise ValueError("Piloten er begrenset til 1–10 lydprøver")
    valgte: list[dict] = []
    sett: set[str] = set()
    for kilde, kandidater in (("aktuell", aktive), ("arkiv_kun_uttaletest", arkiv)):
        for notis in kandidater:
            if not isinstance(notis, dict) or not str(notis.get("text", "")).strip():
                continue
            if kilde == "aktuell" and not er_aktuell(notis, idag):
                continue
            tekst = tilpass_uttale(notis)
            if len(tekst) < 40 or len(tekst) > 1800:
                continue
            finger = hashlib.sha256(tekst.encode("utf-8")).hexdigest()
            if finger in sett:
                continue
            sett.add(finger)
            valgte.append({
                "id": f"proeve-{len(valgte)+1:02d}",
                "kildeklasse": kilde,
                "kategori": str(notis.get("category") or "Nyheter"),
                "publisert": str(notis.get("date") or ""),
                "original_sha256": hashlib.sha256(str(notis["text"]).encode("utf-8")).hexdigest(),
                "uttale_sha256": finger,
                "uttaletekst": tekst,
                "redaksjonelt_uttalefelt": bool(notis.get("speechText")),
            })
            if len(valgte) >= antall:
                return valgte
    raise ValueError(f"Fant bare {len(valgte)} egnete publiserte prøver; trenger {antall}")


def lag_plan(dest: pathlib.Path, idag: dt.date, antall: int) -> pathlib.Path:
    levende = les_json(ROOT / "notiser.json")
    gamle = les_json(ROOT / "arkiv/notiser-2025-10.json")
    utvalg = velg_prover(levende, gamle, idag, antall)
    dest.mkdir(parents=True, exist_ok=True)
    fil = dest / "pilot-utvalg.json"
    fil.write_text(json.dumps({"pilot": True, "today": idag.isoformat(),
                               "samples": utvalg}, ensure_ascii=False, indent=2) + "\n",
                   encoding="utf-8")
    return fil


def kjør(*args: str) -> None:
    subprocess.run(list(args), check=True)


def lydinfo(sti: pathlib.Path) -> dict:
    result = subprocess.run(["ffprobe", "-v", "error", "-print_format", "json",
                             "-show_streams", "-show_format", str(sti)],
                            check=True, capture_output=True, text=True)
    data = json.loads(result.stdout)
    lydspor = [s for s in data.get("streams", []) if s.get("codec_type") == "audio"]
    if len(lydspor) != 1 or lydspor[0].get("codec_name") != "mp3":
        raise ValueError(f"Ugyldig MP3-spor: {sti}")
    sekunder = float(data["format"]["duration"])
    if not 2.0 < sekunder < 240.0 or not 5000 < sti.stat().st_size < 2_000_000:
        raise ValueError(f"Usannsynlig varighet eller filstørrelse: {sti}")
    return {"durationSeconds": round(sekunder, 2), "bytes": sti.stat().st_size,
            "codec": "mp3", "sampleRate": int(lydspor[0]["sample_rate"]),
            "sha256": hashlib.sha256(sti.read_bytes()).hexdigest()}


def syntetiser(dest: pathlib.Path, model: pathlib.Path, config: pathlib.Path,
                modellinfo: pathlib.Path) -> pathlib.Path:
    if not model.is_file() or not config.is_file() or not modellinfo.is_file():
        raise FileNotFoundError("Modell, config og kilderevisjon må finnes lokalt")
    plan = json.loads((dest / "pilot-utvalg.json").read_text(encoding="utf-8"))
    meta = json.loads(modellinfo.read_text(encoding="utf-8"))
    mp3_dir = dest / "lydproever"
    mp3_dir.mkdir(parents=True, exist_ok=True)
    rapport: list[dict] = []
    for proeve in plan["samples"]:
        base = proeve["id"]
        wav = dest / (base + ".wav")
        mp3 = mp3_dir / (base + ".mp3")
        kjør(sys.executable, "-m", "piper", "--model", str(model),
             "--config", str(config), "-f", str(wav), "--", proeve["uttaletekst"])
        kjør("ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
             "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ac", "1", "-ar", "24000",
             "-c:a", "libmp3lame", "-b:a", "64k", str(mp3))
        wav.unlink(missing_ok=True)
        rapport.append({"id": base, "kildeklasse": proeve["kildeklasse"],
                       "uttale_sha256": proeve["uttale_sha256"], **lydinfo(mp3)})
    rapportfil = dest / "rapport.json"
    rapportfil.write_text(json.dumps({
        "status": "KUN_INTERN_PILOT_IKKE_GODKJENT_FOR_PUBLISERING",
        "voice": meta, "samples": rapport, "antall": len(rapport),
        "neste": "Lisensgodkjenning og manuell prøvelytting kreves før PR D",
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return rapportfil


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["prepare", "render"])
    parser.add_argument("--output", type=pathlib.Path, default=pathlib.Path("pilot-lyd"))
    parser.add_argument("--today", type=dt.date.fromisoformat, default=dt.date.today())
    parser.add_argument("--count", type=int, default=10)
    parser.add_argument("--model", type=pathlib.Path)
    parser.add_argument("--config", type=pathlib.Path)
    parser.add_argument("--model-info", type=pathlib.Path)
    args = parser.parse_args()
    if args.mode == "prepare":
        print(lag_plan(args.output, args.today, args.count))
    else:
        if not args.model or not args.config or not args.model_info:
            parser.error("render krever --model, --config og --model-info")
        print(syntetiser(args.output, args.model, args.config, args.model_info))


if __name__ == "__main__":
    main()
