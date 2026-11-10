#!/usr/bin/env python3
"""Inkrementell, KUN PRIVAT produksjon av radio-MP3. Ingen Pages-distribusjon.

Bruk:
  python scripts/radio/bygg_private_lyd.py inspect --candidate radio-kandidat/manifest.json
  python scripts/radio/bygg_private_lyd.py render  --candidate radio-kandidat/manifest.json

Manifest og lyd legges BARE i privat Actions-artifakt, aldri i offentlige filer.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys

from generer_lydpilot import (
    RADIO_LENGTH_SCALE, RADIO_NOISE_SCALE, RADIO_NOISE_W_SCALE,
    lydinfo, skriv_chunker_til_wave,
)
from planlegg_lyd import (
    MODEL_REVISION, SYNTHESIS_PROFILE, bygg_forslag,
    kontroller_kilde, streng_dato, oslo_dato,
)

ROOT = pathlib.Path(__file__).resolve().parents[2]
CANDIDATE_RE = re.compile(r"^lyd/[0-9a-f]{20}-[0-9a-f]{16}\.mp3$")


def load_json(path: pathlib.Path) -> dict | list:
    return json.loads(path.read_text(encoding="utf-8"))


def file_sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_lock(lock: dict) -> None:
    if not isinstance(lock, dict):
        raise ValueError("Manglende modellås")
    if lock.get("revision") != MODEL_REVISION or lock.get("synthesisProfile") != SYNTHESIS_PROFILE:
        raise ValueError("Modellrevisjon/profil samsvarer ikke med privat kandidatplan")
    if lock.get("engineVersion") != "1.8.0" or lock.get("rightsStatus") != "PENDING":
        raise ValueError("Intern lydbygger krever låst Piper-versjon og PENDING modellrettigheter")
    if lock.get("sourceRepository") != "rhasspy/piper-voices":
        raise ValueError("Uventet modellkilde")
    files = lock.get("files")
    if not isinstance(files, dict) or len(files) != 3:
        raise ValueError("Ufullstendig modellås")
    for key, value in files.items():
        if not isinstance(key, str) or not key.startswith("no/no_NO/talesyntese/medium/"):
            raise ValueError("Ugyldig modellfilbane")
        if not isinstance(value, str) or not re.fullmatch(r"[0-9a-f]{64}", value):
            raise ValueError("Ugyldig modellfilhash")


def kontrollert_plan(candidate: dict, source: list, policy: dict, lock: dict) -> tuple[list[dict], dict]:
    """Verifiser hele kandidatmanifestet mot NYE kildedata – aldri stol på artifakten."""
    check_lock(lock)
    if policy.get("publicAudioEnabled") is not False:
        raise ValueError("Intern bygging stoppet: offentlig gate må være eksplisitt AV")
    if not isinstance(candidate, dict) or candidate.get("privateCandidateOnly") is not True:
        raise ValueError("Kandidat må være eksplisitt privat")
    if candidate.get("publicPlayable") is not False:
        raise ValueError("Kandidat peker på offentlig lyd")
    today = streng_dato(candidate.get("asOfOsloDate"))
    # Både gamle og fremtidige notiser filtreres FØR syntese.
    expected = bygg_forslag(source, policy, today)
    if candidate != expected:
        raise ValueError("Kandidatlisten avviker fra kildekontrollerte notiser")
    mapping = {}
    for item in source:
        cat, original, url, published, expires, spoken = kontroller_kilde(item)
        if not published <= today <= expires:
            continue
        identifier = hashlib.sha256(
            (published.isoformat() + "\n" + cat + "\n" + url).encode("utf-8")
        ).hexdigest()[:20]
        mapping[identifier] = spoken
    selected = []
    for row in candidate["items"]:
        filename = row.get("candidateFile")
        if not isinstance(filename, str) or not CANDIDATE_RE.fullmatch(filename):
            raise ValueError("Utrygg eller uventet lydfilbane")
        if row["id"] not in mapping:
            raise ValueError("Ingen kildekontrollert tekst til lydfil")
        if not (row["date"] <= today.isoformat() <= row["expires"]):
            raise ValueError("Utdatert notis i radioens lydplan")
        selected.append({"item": row, "speechText": mapping[row["id"]]})
    if len(selected) > 50:
        raise ValueError("Maksimalt 50 aktive notiser per lydjobb – vurder kildedata")
    return selected, expected


def cached_audio(cache: pathlib.Path, item: dict, lock: dict) -> dict | None:
    basename = pathlib.PurePosixPath(item["candidateFile"]).name
    file = cache / basename
    meta_path = cache / (basename + ".json")
    if not file.is_file() or not meta_path.is_file():
        return None
    try:
        meta = load_json(meta_path)
        if (meta.get("contentHash") != item["contentHash"]
                or meta.get("voiceRevision") != lock["revision"]
                or meta.get("profile") != lock["synthesisProfile"]):
            return None
        info = lydinfo(file)
        if info["sha256"] != meta.get("audioSha256"):
            return None
        return info
    except (OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError):
        return None


def classify(selected: list[dict], cache: pathlib.Path, lock: dict) -> tuple[list[dict], list[dict]]:
    hits, missing = [], []
    for row in selected:
        (hits if cached_audio(cache, row["item"], lock) else missing).append(row)
    return hits, missing


def verify_models(model_root: pathlib.Path, lock: dict) -> pathlib.Path:
    check_lock(lock)
    files = lock["files"]
    for filename, wanted in files.items():
        path = model_root / filename
        if not path.is_file() or file_sha256(path) != wanted:
            raise ValueError("Modell, konfigurasjon eller lisensdokument er ikke verifisert: " + filename)
    models = [model_root / key for key in files if key.endswith(".onnx")]
    if len(models) != 1:
        raise ValueError("Manglende entydig ONNX-modell")
    return models[0]


def synthesize_missing(missing: list[dict], cache: pathlib.Path,
                       model_root: pathlib.Path, lock: dict) -> None:
    if not missing:
        return
    # Last modellen nøyaktig én gang, ikke én gang per notis.
    model = verify_models(model_root, lock)
    from piper import PiperVoice, SynthesisConfig

    voice = PiperVoice.load(str(model))
    config = SynthesisConfig(
        length_scale=RADIO_LENGTH_SCALE,
        noise_scale=RADIO_NOISE_SCALE,
        noise_w_scale=RADIO_NOISE_W_SCALE,
        normalize_audio=False,
    )
    cache.mkdir(parents=True, exist_ok=True)
    for row in missing:
        item = row["item"]
        basename = pathlib.PurePosixPath(item["candidateFile"]).name
        mp3 = cache / basename
        temp_mp3 = cache / (basename + ".part.mp3")
        wav = cache / (basename + ".wav")
        try:
            chunks = voice.synthesize(row["speechText"], syn_config=config)
            count = skriv_chunker_til_wave(wav, chunks)
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ac", "1", "-ar", "22050", "-c:a", "libmp3lame",
                "-b:a", "64k", str(temp_mp3),
            ], check=True)
            info = lydinfo(temp_mp3)
            if count < 1 or info["durationSeconds"] <= 2:
                raise ValueError("For kort, tom eller ufullstendig lyd")
            # Skriv metadata etter teknisk bestått lydkontroll, atomisk filbytte.
            temp_mp3.replace(mp3)
            meta = {
                "contentHash": item["contentHash"],
                "voiceRevision": lock["revision"],
                "profile": lock["synthesisProfile"],
                "audioSha256": info["sha256"],
                "sentences": count,
            }
            (cache / (basename + ".json")).write_text(
                json.dumps(meta, sort_keys=True) + "\n", encoding="utf-8"
            )
        finally:
            wav.unlink(missing_ok=True)
            temp_mp3.unlink(missing_ok=True)


def publish_private(selected: list[dict], cache: pathlib.Path,
                    output: pathlib.Path, lock: dict, reused: int) -> dict:
    """Kun til Actions-artifakt. Navnet betyr IKKE offentlig publisering."""
    # I repository checkout er bare den dedikerte og upubliserte
    # radio-private-output-mappen lov; andre utdata må ligge helt utenfor repoet.
    output_resolved = output.resolve()
    root_resolved = ROOT.resolve()
    if output_resolved.is_relative_to(root_resolved) and output_resolved != (ROOT / "radio-private-output").resolve():
        raise ValueError("Privat lyd må ikke legges i offentlige nettsidekataloger")
    (output / "lyd").mkdir(parents=True, exist_ok=True)
    items = []
    for row in selected:
        item = row["item"]
        basename = pathlib.PurePosixPath(item["candidateFile"]).name
        original = cache / basename
        info = cached_audio(cache, item, lock)
        if info is None:
            raise ValueError("Lydfil mangler eller har feil hash: " + basename)
        shutil.copyfile(original, output / "lyd" / basename)
        items.append({**item, "durationSeconds": info["durationSeconds"],
                      "bytes": info["bytes"], "audioSha256": info["sha256"]})
    result = {
        "schemaVersion": 1,
        "status": "UNPUBLISHED_INTERNAL_AUDIO_ONLY",
        "privateCandidateOnly": True,
        "publicPlayable": False,
        "voiceModelRevision": lock["revision"],
        "profile": lock["synthesisProfile"],
        "count": len(items),
        "reused": reused,
        "rendered": len(items) - reused,
        "items": items,
    }
    (output / "manifest.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return result


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("mode", choices=["inspect", "render"])
    p.add_argument("--candidate", type=pathlib.Path, default=pathlib.Path("radio-kandidat/manifest.json"))
    p.add_argument("--source", type=pathlib.Path, default=ROOT / "notiser.json")
    p.add_argument("--policy", type=pathlib.Path, default=ROOT / "radio/release-gate.json")
    p.add_argument("--lock", type=pathlib.Path, default=ROOT / "radio/model-lock.json")
    p.add_argument("--cache", type=pathlib.Path, default=pathlib.Path("radio-cache"))
    p.add_argument("--output", type=pathlib.Path, default=pathlib.Path("radio-private-output"))
    p.add_argument("--model-root", type=pathlib.Path, default=pathlib.Path("pilot-modell"))
    args = p.parse_args()

    candidate = load_json(args.candidate)
    source = load_json(args.source)
    policy = load_json(args.policy)
    lock = load_json(args.lock)
    # En lagret artifakt fra i går må ikke brukes til å lage dagens sending.
    if candidate.get("asOfOsloDate") != oslo_dato().isoformat():
        raise SystemExit("Kandidatlisten har feil norsk dato; bygg fersk lydplan først")
    selected, _ = kontrollert_plan(candidate, source, policy, lock)
    cached, missing = classify(selected, args.cache, lock)

    if args.mode == "inspect":
        print(json.dumps({"count": len(selected), "cached": len(cached),
                          "missing": len(missing), "publicPlayable": False}))
        return

    synthesize_missing(missing, args.cache, args.model_root, lock)
    output = publish_private(selected, args.cache, args.output, lock, len(cached))
    print(json.dumps({"count": output["count"], "reused": output["reused"],
                      "rendered": output["rendered"], "publicPlayable": False}))


if __name__ == "__main__":
    main()
