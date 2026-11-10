"""Test av låst Vox-pilot uten nedlasting av modeller."""
import datetime as dt
import hashlib
import importlib.util
import json
import pathlib
import tempfile
import unittest

PATH = pathlib.Path(__file__).with_name("generer_vox_prover.py")
spec = importlib.util.spec_from_file_location("generer_vox_prover", PATH)
vox = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vox)


class VoxPilotTests(unittest.TestCase):
    def create_fake(self, root: pathlib.Path,
                    readme="License: CC0\\nVoxCPM2 teacher from talesyntese base."):
        (root / (vox.MODEL_NAME + ".onnx")).write_bytes(b"synthetic unit-test weights only")
        (root / (vox.MODEL_NAME + ".onnx.json")).write_text(
            json.dumps({"num_speakers": 1, "audio": {"sample_rate": 22050}})
        )
        (root / "README.md").write_text(readme)

    def mock_lock(self, root: pathlib.Path, revision="a" * 40):
        data = vox.load_lock().copy()
        data["revision"] = revision
        data["files"] = {
            name: hashlib.sha256((root / name).read_bytes()).hexdigest()
            for name in data["files"]
        }
        return data

    def test_published_lock_matches_positive_listening_reports(self):
        lock = vox.load_lock()
        self.assertEqual(lock["repository"], "rasmusjs/nb_NO-vox-medium")
        self.assertEqual(lock["revision"], "a36ead8f7c914289997e5681a6bbf1386887efab")
        self.assertEqual(lock["files"]["nb_NO-vox-medium.onnx"],
                         "84efefd38150d87b1d81185a50874d0279d19dd8d1260b7db40091e9b11c5c1f")
        self.assertEqual(lock["publicAudioEnabled"], False)
        self.assertEqual(lock["rightsStatus"], "PENDING")
        self.assertEqual(lock["editorialStatus"], "FIRST_LISTEN_POSITIVE_NOT_FINAL")
        self.assertEqual(len(lock["files"]), 3)

    def test_model_requires_revision_config_and_lineage(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            self.create_fake(root)
            lock = self.mock_lock(root)
            model, meta = vox.check_model(root, "a" * 40, lock)
            self.assertEqual(model.name, vox.MODEL_NAME + ".onnx")
            self.assertEqual(meta["fileSha256"], lock["files"])
            self.assertEqual(meta["modelLock"], "radio/vox-model-lock.json")
            self.assertEqual(meta["baseRightsStatus"], "UNRESOLVED_TALESYNTESE_LINEAGE")
            with self.assertRaises(ValueError):
                vox.check_model(root, "main", lock)
            with self.assertRaises(ValueError):
                vox.check_model(root, "b" * 40, lock)
            # Selv om revisjonen er den samme, skal manipulert fil avvises.
            (root / "README.md").write_text("License: CC0\\nVoxCPM2 talesyntese, tampered")
            with self.assertRaises(ValueError):
                vox.check_model(root, "a" * 40, lock)
            # Semantisk sjekk i tillegg til hash.
            self.create_fake(root, "License: CC0\\nNo data provenance.")
            with self.assertRaises(ValueError):
                vox.check_model(root, "a" * 40, self.mock_lock(root))
            self.create_fake(root, "VoxCPM2 from talesyntese; no license field")
            with self.assertRaises(ValueError):
                vox.check_model(root, "a" * 40, self.mock_lock(root))

    def test_lock_is_closed_for_unexpected_files_and_permissions(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            self.create_fake(root)
            lock = self.mock_lock(root)
            for mutation in (
                {**lock, "rightsStatus": "APPROVED"},
                {**lock, "publicAudioEnabled": True},
                {**lock, "editorialStatus": "APPROVED"},
                {**lock, "revision": "main"},
                {**lock, "files": {**lock["files"], "evil.onnx": "b" * 64}},
                {**lock, "files": {**lock["files"], "README.md": "g" * 64}},
            ):
                with self.assertRaises(ValueError):
                    vox.verified_lock(mutation)

    def test_only_published_samples_and_limits(self):
        for n in (1, 2, 3):
            samples = vox.select_items(dt.date(2026, 11, 10), n)
            self.assertEqual(len(samples), n)
            self.assertTrue(all(s["kildeklasse"] in
                                {"aktuell", "arkiv_kun_uttaletest"} for s in samples))
            self.assertTrue(all(s["uttaletekst"].startswith(s["kategori"] + ". ")
                                for s in samples))
        for n in (0, 4, 100):
            with self.assertRaises(ValueError):
                vox.select_items(dt.date(2026, 11, 10), n)

    def test_two_distinct_profiles_no_publication(self):
        self.assertEqual(set(vox.PROFILES), {"normal", "nyhetsflyt"})
        self.assertGreater(vox.PROFILES["nyhetsflyt"]["sentencePauseSeconds"], 0)
        source = PATH.read_text(encoding="utf-8")
        self.assertIn('"publicPlayable": False', source)
        self.assertIn('"rightsApproved": False', source)
        self.assertIn('"qualityApproved": False', source)
        self.assertNotIn("deploy-pages", source)
        self.assertNotIn("github-pages", source)


if __name__ == "__main__":
    unittest.main()
