"""Tester A/B-stemmetesten uten nedlasting av store modeller."""
import datetime as dt
import importlib.util
import json
import pathlib
import tempfile
import unittest
from unittest.mock import patch

PATH = pathlib.Path(__file__).with_name("test_nvcc_voice.py")
spec = importlib.util.spec_from_file_location("test_nvcc_voice", PATH)
nvcc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nvcc)


class NVCCVoiceTest(unittest.TestCase):
    def _fake_model(self, root: pathlib.Path, *, card: str = "License: CC0\nTrained from scratch.\n",
                    speaker_ok: bool = True) -> None:
        base = root / nvcc.VOICE_BASE
        base.mkdir(parents=True, exist_ok=True)
        (base / (nvcc.VOICE_NAME + ".onnx")).write_bytes(b"dummy onnx in unit test")
        config = {
            "num_speakers": 10,
            "speaker_id_map": {"KNN": 0, "MNN": 4 if speaker_ok else 9},
            "audio": {"sample_rate": 22050},
        }
        (base / (nvcc.VOICE_NAME + ".onnx.json")).write_text(json.dumps(config))
        (base / "MODEL_CARD").write_text(card)

    def test_krever_cc0_og_from_scratch_samt_10_stemmer(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            self._fake_model(root)
            model, provenance = nvcc.verify_nvcc(root)
            self.assertTrue(model.is_file())
            self.assertEqual(provenance["speakers"], {"KNN": 0, "MNN": 4})
            self.assertEqual(len(provenance["sha256"]), 3)
            self.assertEqual(provenance["modelRightsStatus"], "UNDER_REDAKSJONELL_VURDERING")

            self._fake_model(root, card="License: CC0\nFine-tuned from lessac.\n")
            with self.assertRaises(ValueError):
                nvcc.verify_nvcc(root)
            self._fake_model(root, card="License: CC BY-NC-SA\nTrained from scratch.\n")
            with self.assertRaises(ValueError):
                nvcc.verify_nvcc(root)
            self._fake_model(root, speaker_ok=False)
            with self.assertRaises(ValueError):
                nvcc.verify_nvcc(root)

    def test_antall_og_kildefilter(self):
        today = dt.date(2026, 11, 10)
        samples = nvcc.select_samples(today, 3)
        self.assertEqual(len(samples), 3)
        self.assertTrue(all(s["uttaletekst"].startswith(s["kategori"] + ". ") for s in samples))
        self.assertTrue(all(s["kildeklasse"] in {"aktuell", "arkiv_kun_uttaletest"} for s in samples))
        self.assertEqual(set(nvcc.SPEAKERS.values()), {0, 4})
        for count in [0, 6, 99]:
            with self.assertRaises(ValueError):
                nvcc.select_samples(today, count)

    def test_utfall_settes_aldri_offentlig_av_kode(self):
        source = PATH.read_text(encoding="utf-8")
        self.assertIn('"publicPlayable": False', source)
        self.assertIn('"qualityApproved": False', source)
        self.assertIn("voice.synthesize", source)
        self.assertNotIn("github-pages", source)
        self.assertNotIn("actions/deploy-pages", source)


if __name__ == "__main__":
    unittest.main()
