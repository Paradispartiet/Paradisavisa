#!/usr/bin/env python3
"""Én privat, ikke-publiserbar MOSS-Nano-prøve. Ingen nye lyttepaneler."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from zoneinfo import ZoneInfo

from generer_vox_prover import select_items
from bygg_private_lyd import mp3_info

ROOT = Path(__file__).resolve().parents[2]
MODEL_REPO = "NbAiLab/nb-tts-norwegian-moss-nano-trimmed"
TOKENIZER_REPO = "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano"


def blocked(gate: dict) -> None:
    """Kjør aldri privat pilot dersom noen har åpnet offentlig lydport."""
    if (gate.get("publicAudioEnabled") is not False
            or gate.get("modelRightsStatus") != "PENDING"
            or gate.get("editorialAudioStatus") != "PENDING"):
        raise ValueError("MOSS-prøven krever publicAudioEnabled=false og PENDING/PENDING")


def assert_revision(value: str) -> str:
    if not isinstance(value, str) or not re.fullmatch(r"[0-9a-f]{40}", value):
        raise ValueError("Modell- eller tokenizer-revisjon er ikke eksakt 40-tegns SHA")
    return value


def sha256_file(path: Path) -> str:
    with path.open("rb") as f:
        return hashlib.file_digest(f, "sha256").hexdigest()


def snapshot_manifest(folder: Path) -> list[dict]:
    """Lagre SHA-256 for faktiske lokale modellfiler; aldri pakke vekter i Actions-artifakt."""
    rows = []
    for file in sorted(folder.rglob("*")):
        if not file.is_file() or ".cache" in file.parts:
            continue
        rows.append({"name": file.relative_to(folder).as_posix(),
                     "bytes": file.stat().st_size,
                     "sha256": sha256_file(file)})
    if not rows or not any(x["bytes"] > 1000000 for x in rows):
        raise ValueError("Nedlastet modellmappe mangler signifikante vektfiler")
    return rows


def command(checkpoint: Path, tokenizer: Path, text: str, wav: Path) -> list[str]:
    if not text.strip() or len(text) > 2500:
        raise ValueError("Uttaleteksten har uventet lengde")
    return [
        "moss-tts-nano", "generate", "--backend", "pytorch",
        "--checkpoint", str(checkpoint),
        "--audio-tokenizer", str(tokenizer),
        "--mode", "continuation", "--device", "cpu", "--dtype", "float32",
        "--max-new-frames", "1500", "--seed", "20261110",
        "--text", text, "--output", str(wav),
    ]


def run(date: dt.date, output: Path, count: int) -> dict:
    blocked(json.loads((ROOT / "radio/release-gate.json").read_text(encoding="utf-8")))
    if not 1 <= count <= 2:
        raise ValueError("Én prøve skal omfatte maksimalt to eksisterende notiser")

    # Samme utvalgsfunksjon og uttaletekst som den private Vox-prøven.
    items = select_items(date, count)
    if len(items) != count:
        raise ValueError("Fant ikke begge kildekontrollerte notisene")
    from huggingface_hub import model_info, snapshot_download

    model_sha = assert_revision(model_info(MODEL_REPO).sha)
    tok_sha = assert_revision(model_info(TOKENIZER_REPO).sha)
    checkpoint = Path(snapshot_download(
        repo_id=MODEL_REPO, revision=model_sha, local_dir=str(output / "_checkpoint")))
    tokenizer = Path(snapshot_download(
        repo_id=TOKENIZER_REPO, revision=tok_sha, local_dir=str(output / "_tokenizer")))
    model_files = snapshot_manifest(checkpoint)
    tok_files = snapshot_manifest(tokenizer)
    audio_dir = output / "lydproever"
    audio_dir.mkdir(parents=True, exist_ok=True)
    ffmpeg = os.environ.get("RADIO_FFMPEG_EXECUTABLE", "ffmpeg")

    rows = []
    for item in items:
        stem = item["id"]
        if not re.fullmatch(r"[a-zA-Z0-9_-]{1,80}", stem):
            raise ValueError("Uventet notis-ID; avviser filbane")
        wav = audio_dir / (stem + ".wav")
        mp3 = audio_dir / (stem + "-moss-nano.mp3")
        text = item["uttaletekst"]
        try:
            subprocess.run(command(checkpoint, tokenizer, text, wav),
                           check=True, timeout=1200)
            if not wav.is_file() or wav.stat().st_size < 20000:
                raise ValueError("MOSS genererte ikke en gyldig WAV-fil")
            subprocess.run([
                ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ac", "1", "-ar", "22050", "-c:a", "libmp3lame",
                "-b:a", "64k", str(mp3),
            ], check=True, timeout=120)
            subprocess.run([
                ffmpeg, "-v", "error", "-i", str(mp3), "-f", "null", "-"
            ], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True, timeout=60)
            info = mp3_info(mp3)
            rows.append({
                "id": item["id"], "sourceDate": item["publisert"],
                "sourceClass": item["kildeklasse"],
                "sourceCategory": item["kategori"],
                "speechText": text, "speechSha256": item["uttale_sha256"],
                "file": "lydproever/" + mp3.name,
                **info,
            })
        finally:
            wav.unlink(missing_ok=True)

    report = {
        "status": "UNPUBLISHED_NEWS_VOICE_CANDIDATE",
        "publicPlayable": False, "rightsApproved": False, "qualityApproved": False,
        "date": date.isoformat(),
        "candidate": MODEL_REPO, "modelRevision": model_sha,
        "modelFiles": model_files, "tokenizer": TOKENIZER_REPO,
        "tokenizerRevision": tok_sha, "tokenizerFiles": tok_files,
        "engineCommit": os.environ.get("MOSS_ENGINE_COMMIT", "UNRECORDED"),
        "referenceVoice": "rasmusjs/nb_NO-vox-medium",
        "referenceLock": "radio/vox-model-lock.json",
        "comparisonKey": "id + speechSha256 (kontroller mot Vox-rapport)",
        "audioCount": len(rows), "samples": rows,
    }
    (output / "rapport.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", type=dt.date.fromisoformat,
                        default=dt.datetime.now(ZoneInfo("Europe/Oslo")).date())
    parser.add_argument("--output", type=Path, default=Path("moss-prove"))
    parser.add_argument("--count", type=int, default=2)
    args = parser.parse_args()
    print(json.dumps({"audioCount": run(args.date, args.output, args.count)["audioCount"],
                      "publicPlayable": False}))


if __name__ == "__main__":
    main()
