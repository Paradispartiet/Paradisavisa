#!/usr/bin/env python3
"""Privat prøvelytting av norsk VoxCPM-distillert Piper-stemme.

PRØVE: Verken rettighetsgodkjenning, redaksjonell godkjenning eller offentlig publisering.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
import pathlib
import re
import subprocess
from zoneinfo import ZoneInfo

from generer_lydpilot import ROOT, les_json, velg_prover, skriv_chunker_til_wave
from bygg_private_lyd import mp3_info

MODEL_REPO = "rasmusjs/nb_NO-vox-medium"
MODEL_NAME = "nb_NO-vox-medium"
PROFILES = {
    "normal": {"lengthScale": 1.0, "noiseScale": 0.55,
               "noiseWScale": 0.65, "sentencePauseSeconds": 0.0},
    "nyhetsflyt": {"lengthScale": 1.02, "noiseScale": 0.52,
                  "noiseWScale": 0.60, "sentencePauseSeconds": 0.12},
}


def check_model(root: pathlib.Path, commit_sha: str) -> tuple[pathlib.Path, dict]:
    if not re.fullmatch(r"[0-9a-f]{40}", commit_sha):
        raise ValueError("Modellen er ikke låst til en eksakt kildecommit")
    model = root / (MODEL_NAME + ".onnx")
    config = root / (MODEL_NAME + ".onnx.json")
    readme = root / "README.md"
    for path in (model, config, readme):
        if not path.is_file() or not path.stat().st_size:
            raise ValueError("Mangler modell, konfigurering eller modellkort: " + str(path))
    cfg = json.loads(config.read_text(encoding="utf-8"))
    if cfg.get("num_speakers") != 1 or cfg.get("audio", {}).get("sample_rate") != 22050:
        raise ValueError("Uventet arkitektur: stemme eller samplerate stemmer ikke")
    card = readme.read_text(encoding="utf-8")
    if "CC0" not in card or "VoxCPM2" not in card or "talesyntese" not in card.lower():
        raise ValueError("Modellkortet mangler erklært lisens eller modellhistorikk")
    provenance = {
        "model": MODEL_NAME,
        "repo": MODEL_REPO,
        "revision": commit_sha,
        "fileSha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                       for p in (model, config, readme)},
        "claimedWeightLicense": "CC0-1.0 (utgiverens modellkort)",
        "baseRightsStatus": "UNRESOLVED_TALESYNTESE_LINEAGE",
        "editorialQualityStatus": "UNREVIEWED",
    }
    return model, provenance


def select_items(today: dt.date, count: int = 2) -> list[dict]:
    if not 1 <= count <= 3:
        raise ValueError("En stemmepilot bruker 1–3 publiserte notiser")
    return velg_prover(
        les_json(ROOT / "notiser.json"),
        les_json(ROOT / "arkiv/notiser-2025-10.json"),
        today, count,
    )


def render(model_dir: pathlib.Path, output: pathlib.Path, revision: str,
           today: dt.date, count: int) -> dict:
    from piper import PiperVoice, SynthesisConfig

    model, provenance = check_model(model_dir, revision)
    samples = select_items(today, count)
    output.mkdir(parents=True, exist_ok=True)
    audio = output / "lydproever"
    audio.mkdir(exist_ok=True)
    voice = PiperVoice.load(str(model))
    ffmpeg = os.environ.get("RADIO_FFMPEG_EXECUTABLE", "ffmpeg")
    files = []
    for item in samples:
        for profile_name, settings in PROFILES.items():
            wav = output / f"{item['id']}-{profile_name}.wav"
            mp3 = audio / f"{item['id']}-{profile_name}.mp3"
            cfg = SynthesisConfig(
                length_scale=settings["lengthScale"],
                noise_scale=settings["noiseScale"],
                noise_w_scale=settings["noiseWScale"],
                normalize_audio=False,
            )
            try:
                count_chunks = skriv_chunker_til_wave(
                    wav, voice.synthesize(item["uttaletekst"], syn_config=cfg),
                    pause_seconds=settings["sentencePauseSeconds"],
                )
                subprocess.run([
                    ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
                    "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                    "-ac", "1", "-ar", "22050", "-c:a", "libmp3lame",
                    "-b:a", "64k", str(mp3)
                ], check=True)
                # Validér at hele filen kan dekodes, ikke bare MP3-headeren.
                subprocess.run([
                    ffmpeg, "-v", "error", "-i", str(mp3), "-f", "null", "-"
                ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
                info = mp3_info(mp3)
                files.append({
                    "id": item["id"],
                    "profile": profile_name,
                    "sourceCategory": item["kategori"],
                    "sourceDate": item["publisert"],
                    "sourceClass": item["kildeklasse"],
                    "speechSha256": item["uttale_sha256"],
                    "sentenceChunks": count_chunks,
                    "file": "lydproever/" + mp3.name,
                    **info,
                })
            finally:
                wav.unlink(missing_ok=True)
    result = {
        "status": "UNPUBLISHED_NEWS_VOICE_CANDIDATE",
        "publicPlayable": False,
        "rightsApproved": False,
        "qualityApproved": False,
        "date": today.isoformat(),
        "model": provenance,
        "profiles": PROFILES,
        "sampleCount": len(samples),
        "audioCount": len(files),
        "samples": files,
        "speechTexts": [
            {"id": item["id"], "speechText": item["uttaletekst"],
             "sourceClass": item["kildeklasse"]}
            for item in samples
        ]
    }
    (output / "rapport.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return result


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--model-root", type=pathlib.Path, required=True)
    p.add_argument("--revision", required=True)
    p.add_argument("--output", type=pathlib.Path, default=pathlib.Path("vox-prove"))
    p.add_argument("--today", type=dt.date.fromisoformat,
                   default=dt.datetime.now(ZoneInfo("Europe/Oslo")).date())
    p.add_argument("--count", type=int, default=2)
    args = p.parse_args()
    report = render(args.model_root, args.output, args.revision, args.today, args.count)
    print(json.dumps({"audioCount": report["audioCount"],
                      "sampleCount": report["sampleCount"],
                      "publicPlayable": False}))


if __name__ == "__main__":
    main()
