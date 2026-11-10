#!/usr/bin/env python3
"""Billig, offentlig metadata-/vekt-HEAD-sjekk før MOSS-Nano-lydjobb.

Bruker aldri innlogging eller modellvekter. HTTP 200 for metadata alene er
ikke lisens-, vekt- eller lydkvalitetsgodkjenning.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

PRIMARY = "NbAiLab/nb-tts-norwegian-moss-nano-trimmed"
ALTERNATIVES = (
    "NbAiLab/nb-tts-norwegian-moss-local-trimmed",
    "NbAiLab/nb-tts-norwegian-voices",
)
TOKENIZER = "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano"
REPOSITORIES = (PRIMARY,) + ALTERNATIVES + (TOKENIZER,)
WEIGHT_ENDINGS = (".safetensors", ".bin", ".pt", ".pth", ".onnx")
HEADERS = {"User-Agent": "Paradisradioen-public-model-access-check/1.0"}
SHA = re.compile(r"^[a-f0-9]{40}$")


def request_json(repo: str, opener=urlopen) -> dict:
    url = "https://huggingface.co/api/models/" + repo
    request = Request(url, headers={**HEADERS, "Accept": "application/json"})
    with opener(request, timeout=12) as response:
        raw = response.read(1000000)
    result = json.loads(raw.decode("utf-8"))
    if not isinstance(result, dict):
        raise ValueError("Uventet metadataformat")
    return result


def response_code(request: Request, opener=urlopen) -> int:
    with opener(request, timeout=12) as response:
        return int(response.status)


def failure_status(exc: Exception) -> str:
    if isinstance(exc, HTTPError):
        if exc.code in (401, 403):
            return "ACCESS_DENIED_HTTP_" + str(exc.code)
        if exc.code == 404:
            return "NOT_FOUND_HTTP_404"
        if exc.code == 429:
            return "RATE_LIMITED_HTTP_429"
        return "HTTP_" + str(exc.code)
    if isinstance(exc, (TimeoutError, URLError, OSError)):
        return "NETWORK_UNVERIFIED"
    return "METADATA_UNVERIFIED"


def check(repo: str, opener=urlopen) -> dict:
    row = {"repository": repo, "access": "UNVERIFIED",
           "rightsApproved": False, "qualityApproved": False}
    try:
        data = request_json(repo, opener=opener)
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
        row["access"] = failure_status(exc)
        return row

    if data.get("private") is True:
        row["access"] = "PRIVATE"
        return row
    if data.get("gated") not in (None, False):
        row["access"] = "GATED"
        return row

    revision = data.get("sha")
    if not isinstance(revision, str) or not SHA.fullmatch(revision):
        row["access"] = "MISSING_EXACT_REVISION"
        return row
    row["revision"] = revision

    siblings = [x.get("rfilename") for x in data.get("siblings", [])
                if isinstance(x, dict)]
    weights = sorted(x for x in siblings if isinstance(x, str)
                     and x.lower().endswith(WEIGHT_ENDINGS))
    if not weights:
        row["access"] = "NO_WEIGHT_FILE_LISTED"
        return row

    # HEAD er metadata-tilgang, ikke selve nedlastingen. Ingen lyd og ingen vekter lagres.
    weight = weights[0]
    url = ("https://huggingface.co/" + repo + "/resolve/"
           + revision + "/" + quote(weight, safe="/"))
    try:
        code = response_code(Request(url, method="HEAD", headers=HEADERS),
                             opener=opener)
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        row["access"] = "WEIGHTS_" + failure_status(exc)
        return row
    row["access"] = "PUBLIC_HEAD_OK" if code == 200 else "WEIGHTS_HTTP_" + str(code)
    row["exampleWeight"] = weight
    return row


def evaluate(rows: list[dict]) -> bool:
    lookup = {row["repository"]: row for row in rows}
    # Ren modellpilot krever både norsk checkpoint og tilhørende tokenizer.
    return (lookup[PRIMARY]["access"] == "PUBLIC_HEAD_OK"
            and lookup[TOKENIZER]["access"] == "PUBLIC_HEAD_OK")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-primary", action="store_true",
                        help="Stopp den manuelle lydjobben før stor installasjon")
    args = parser.parse_args()

    rows = [check(repo) for repo in REPOSITORIES]
    ready = evaluate(rows)
    print(json.dumps({"canAttemptPrivateMoss": ready, "models": rows},
                     ensure_ascii=False, indent=2))
    msg = ("MOSS-Nano: metadata og vekt-HEAD svarer, men ingen rettigheter er godkjent."
           if ready else
           "MOSS-Nano: nødvendig modell/tokenizer ikke offentlig verifiserbar. Ingen lydjobb.")
    print(("::notice::" if ready else "::warning::") + msg)

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as output:
            output.write("\n### Paradisradioen – modelltilgang (ikke stemmelisens)\n")
            for row in rows:
                output.write("- `" + row["repository"] + "`: **" + row["access"] + "**\n")
            output.write("\n" + msg + "\n")

    return 2 if args.require_primary and not ready else 0


if __name__ == "__main__":
    sys.exit(main())
