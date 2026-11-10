"""Test at privat lydbygg ikke kan aktivere offentlig avspilling."""
import datetime as dt
import hashlib
import importlib.util
import json
import pathlib
import tempfile
import unittest
from unittest import mock

from planlegg_lyd import bygg_forslag

P = pathlib.Path(__file__).with_name("bygg_private_lyd.py")
spec = importlib.util.spec_from_file_location("bygg_private_lyd", P)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
ROOT = P.parents[2]
POLICY = json.loads((ROOT / "radio/release-gate.json").read_text(encoding="utf-8"))
LOCK = json.loads((ROOT / "radio/model-lock.json").read_text(encoding="utf-8"))
DAY = dt.date(2026, 11, 10)


def item(text="Denne godkjente notisen gjelder norsk nyhetsradio og dagens samfunnsnyheter.",
         date="2026-11-10", url="https://www.example.org/nyheter/1"):
    return {"category": "Nyheter", "text": text, "date": date, "url": url}


class PrivateBuildTest(unittest.TestCase):
    def setUp(self):
        self.source = [
            item(),
            item(date="2026-11-03", url="https://www.example.org/nyheter/2"),
            item(date="2026-11-11", url="https://www.example.org/nyheter/3"),
            {**item(date="2026-11-09", url="https://www.example.org/nyheter/4"),
             "expires": "2026-11-09"},
        ]
        self.candidate = bygg_forslag(self.source, POLICY, DAY)

    def test_modellaas_og_sikker_plan(self):
        selected, expected = mod.kontrollert_plan(self.candidate, self.source, POLICY, LOCK)
        self.assertEqual(expected, self.candidate)
        self.assertEqual(len(selected), 1)
        self.assertEqual(selected[0]["item"]["date"], DAY.isoformat())
        self.assertEqual(selected[0]["speechText"], "Nyheter. " + self.source[0]["text"])
        self.assertFalse(self.candidate["publicPlayable"])
        self.assertEqual(self.candidate["items"][0]["candidateFile"].split("/")[0], "lyd")

    def test_avvis_endret_manifest_og_dato(self):
        broken = json.loads(json.dumps(self.candidate))
        broken["items"][0]["contentHash"] = "0" * 64
        with self.assertRaises(ValueError):
            mod.kontrollert_plan(broken, self.source, POLICY, LOCK)
        broken = json.loads(json.dumps(self.candidate))
        broken["items"][0]["candidateFile"] = "../../rapport.mp3"
        with self.assertRaises(ValueError):
            mod.kontrollert_plan(broken, self.source, POLICY, LOCK)
        broken = json.loads(json.dumps(self.candidate))
        broken["asOfOsloDate"] = "2026-11-11"
        with self.assertRaises(ValueError):
            mod.kontrollert_plan(broken, self.source, POLICY, LOCK)

    def test_offentlig_gate_er_alltid_sperret(self):
        policy = {**POLICY, "publicAudioEnabled": True,
                  "modelRightsStatus": "APPROVED",
                  "editorialAudioStatus": "APPROVED", "approvedBy": "Redaktør"}
        candidate = bygg_forslag(self.source, policy, DAY)
        with self.assertRaises(ValueError):
            mod.kontrollert_plan(candidate, self.source, policy, LOCK)
        changed = {**LOCK, "rightsStatus": "APPROVED"}
        with self.assertRaises(ValueError):
            mod.check_lock(changed)

    def test_bare_endrede_lydfiler_og_gjenbruk_med_sha(self):
        with tempfile.TemporaryDirectory() as temp:
            cache = pathlib.Path(temp) / "cache"
            output = pathlib.Path(temp) / "delivery"
            cache.mkdir()
            current = self.candidate["items"][0]
            basename = pathlib.PurePosixPath(current["candidateFile"]).name
            audio = cache / basename
            audio.write_bytes(b"valid fake audio in test only")
            meta = {
                "contentHash": current["contentHash"],
                "voiceRevision": LOCK["revision"],
                "profile": LOCK["synthesisProfile"],
                "audioSha256": mod.file_sha256(audio),
            }
            (cache / (basename + ".json")).write_text(json.dumps(meta), encoding="utf-8")
            def simulated_probe(path):
                return {"durationSeconds": 9.0, "bytes": path.stat().st_size,
                        "codec": "mp3", "sha256": mod.file_sha256(path)}
            with mock.patch.object(mod, "lydinfo", side_effect=simulated_probe):
                selected, _ = mod.kontrollert_plan(self.candidate, self.source, POLICY, LOCK)
                hits, missing = mod.classify(selected, cache, LOCK)
                self.assertEqual((len(hits), len(missing)), (1, 0))
                result = mod.publish_private(selected, cache, output, LOCK, len(hits))
                self.assertFalse(result["publicPlayable"])
                self.assertTrue(result["privateCandidateOnly"])
                self.assertEqual(result["rendered"], 0)
                self.assertEqual(result["reused"], 1)
                self.assertNotIn("audioUrl", str(result))
                self.assertTrue((output / "lyd" / basename).is_file())
                audio.write_bytes(b"tampered byte stream")
                self.assertIsNone(mod.cached_audio(cache, current, LOCK))

    def test_lydfil_kan_ikke_skrives_i_offentlig_radio_mappe(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaises(ValueError):
                mod.publish_private([], pathlib.Path(temp), ROOT / "radio" / "lyd", LOCK, 0)

    def test_modellfilene_ma_ha_eksakt_hash(self):
        with tempfile.TemporaryDirectory() as temp:
            root = pathlib.Path(temp)
            lock = json.loads(json.dumps(LOCK))
            files = {}
            for name in lock["files"]:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(name.encode("utf-8"))
                files[name] = hashlib.sha256(path.read_bytes()).hexdigest()
            lock["files"] = files
            model = mod.verify_models(root, lock)
            self.assertTrue(model.name.endswith(".onnx"))
            model.write_bytes(b"CORRUPT")
            with self.assertRaises(ValueError):
                mod.verify_models(root, lock)

    def test_ikke_lag_tale_for_utlopt_notis(self):
        tomorrow = dt.date(2026, 11, 18)
        candidate = bygg_forslag(self.source, POLICY, tomorrow)
        selected, _ = mod.kontrollert_plan(candidate, self.source, POLICY, LOCK)
        self.assertEqual(len(selected), 0)


if __name__ == "__main__":
    unittest.main()
