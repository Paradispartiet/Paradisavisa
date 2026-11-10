#!/usr/bin/env python3
"""Privat A/B-stemmetest av no_NO-nvcc-medium. Aldri offentlig avspilling.

Kjører på publiserte, kildekontrollerte notiser. Historiske notiser brukes
bare som eksplisitt merket uttaletest om dagsferske prøver mangler.
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

from generer_lydpilot import (
    ROOT, les_json, velg_prover, skriv_chunker_til_wave,
)
from bygg_private_lyd import mp3_info

VOICE_REPOSITORY = "rhasspy/piper-voices"
VOICE_REVISION = "e7229f7d33a10e145e109b886d661984201ac3c4"
VOICE_BASE = "no/no_NO/nvcc/medium"
VOICE_NAME = "no_NO-nvcc-medium"
SPEAKERS = {"KNN": 0, "MNN": 4}  # Entydige Piper-ID-er, ikke påstått kjønn.
PILOT_PROFILE = {"lengthScale": 1.04, "noiseScale": 0.60,
                 "noiseWScale": 0.68, "sentencePauseSeconds": 0.17}


def verify_nvcc(model_dir: pathlib.Path) -> tuple[pathlib.Path, dict]:
    """Kontroller nøyaktig nedlastet kilde, datakort og stemme-ID-er."""
    prefix = model_dir / VOICE_BASE
    model = prefix / f"{VOICE_NAME}.onnx"
    config_path = prefix / f"{VOICE_NAME}.onnx.json"
    card_path = prefix / "MODEL_CARD"
    for file in (model, config_path, card_path):
        if not file.is_file() or file.stat().st_size == 0:
            raise ValueError("Modell, konfigurasjon eller MODEL_CARD mangler")
    card = card_path.read_text(encoding="utf-8")
    if not re.search(r"License:\s*CC0\b", card, re.I):
        raise ValueError("Norsk datalisens stemmer ikke med CC0-kilde")
    if not re.search(r"Trained\s+from\s+scratch", card, re.I):
        raise ValueError("Stemmen stammer ikke fra oppgitt fra-bunnen-trening")
    cfg = json.loads(config_path.read_text(encoding="utf-8"))
    if cfg.get("num_speakers") != 10 or cfg.get("audio", {}).get("sample_rate") != 22050:
        raise ValueError("Uventet antall talere eller samplerate")
    mapping = cfg.get("speaker_id_map") or {}
    if any(mapping.get(name) != value for name, value in SPEAKERS.items()):
        raise ValueError("Stemme-ID-ene samsvarer ikke med modellens konfigurasjon")
    provenance = {
        "model": VOICE_NAME,
        "repository": VOICE_REPOSITORY,
        "revision": VOICE_REVISION,
        "sha256": {
            file.name: hashlib.sha256(file.read_bytes()).hexdigest()
            for file in (model, config_path, card_path)
        },
        "datasetLicense": "CC0 (MODEL_CARD, ikke egen modellvektlisens)",
        "training": "Trained from scratch (distribuert MODEL_CARD)",
        "modelRightsStatus": "UNDER_REDAKSJONELL_VURDERING",
        "speakers": SPEAKERS,
    }
    return model, provenance


def select_samples(today: dt.date, count: int = 3) -> list[dict]:
    if not (1 <= count <= 5):
        raise ValueError("A/B-pilot er begrenset til maksimalt fem notiser")
    return velg_prover(
        les_json(ROOT / "notiser.json"),
        les_json(ROOT / "arkiv/notiser-2025-10.json"),
        today,
        count,
    )


def render(model_dir: pathlib.Path, dest: pathlib.Path, today: dt.date,
           count: int = 3) -> dict:
    from piper import PiperVoice, SynthesisConfig

    model, provenance = verify_nvcc(model_dir)
    chosen = select_samples(today, count)
    dest.mkdir(parents=True, exist_ok=True)
    audio_dir = dest / "lydproever"
    audio_dir.mkdir(exist_ok=True)
    ffmpeg = os.environ.get("RADIO_FFMPEG_EXECUTABLE", "ffmpeg")

    voice = PiperVoice.load(str(model))
    entries = []
    for sample in chosen:
        for label, speaker_id in SPEAKERS.items():
            wav = dest / f"{sample['id']}-{label}.wav"
            mp3 = audio_dir / f"{sample['id']}-{label}.mp3"
            syn_cfg = SynthesisConfig(
                speaker_id=speaker_id,
                length_scale=PILOT_PROFILE["lengthScale"],
                noise_scale=PILOT_PROFILE["noiseScale"],
                noise_w_scale=PILOT_PROFILE["noiseWScale"],
                normalize_audio=False,
            )
            try:
                count_chunks = skriv_chunker_til_wave(
                    wav,
                    voice.synthesize(sample["uttaletekst"], syn_config=syn_cfg),
                    pause_seconds=PILOT_PROFILE["sentencePauseSeconds"],
                )
                subprocess.run([
                    ffmpeg, "-v", "error", "-y", "-i", str(wav),
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                    "-ar", "22050", "-ac", "1",
                    "-c:a", "libmp3lame", "-b:a", "64k", str(mp3),
                ], check=True)
                # Test full MP3 decoding, not only metadata.
                subprocess.run(
                    [ffmpeg, "-v", "error", "-i", str(mp3), "-f", "null", "-"],
                    check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
                )
                metadata = mp3_info(mp3)
                entries.append({
                    "id": sample["id"], "voice": VOICE_NAME,
                    "speaker": label, "speakerId": speaker_id,
                    "sourceCategory": sample["kategori"],
                    "sourceDate": sample["publisert"],
                    "sourceClass": sample["kildeklasse"],
                    "speechSha256": sample["uttale_sha256"],
                    "wavChunks": count_chunks,
                    "file": str(pathlib.PurePosixPath("lydproever") / mp3.name),
                    **metadata,
                })
            finally:
                wav.unlink(missing_ok=True)
    report = {
        "status": "KUN_INTERNE_NVCC_PROEVER_IKKE_OFFENTLIG_PUBLISERT",
        "publicPlayable": False,
        "qualityApproved": False,
        "today": today.isoformat(),
        "profile": PILOT_PROFILE,
        "provenance": provenance,
        "sampleCount": len(chosen),
        "audioCount": len(entries),
        "samples": [{**entry, "uttaletekst": sample["uttaletekst"]}
                    for sample in chosen for entry in entries
                    if entry["id"] == sample["id"]],
    }
    (dest / "rapport.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return report


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--model-root", type=pathlib.Path, required=True)
    p.add_argument("--output", type=pathlib.Path, default=pathlib.Path("nvcc-prove"))
    p.add_argument("--today", type=dt.date.fromisoformat,
                   default=dt.datetime.now(ZoneInfo("Europe/Oslo")).date())
    p.add_argument("--count", type=int, default=3)
    args = p.parse_args()
    report = render(args.model_root, args.output, args.today, args.count)
    print(json.dumps({
        "model": VOICE_NAME,
        "numSamples": report["sampleCount"],
        "numAudio": report["audioCount"],
        "publicPlayable": False,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
