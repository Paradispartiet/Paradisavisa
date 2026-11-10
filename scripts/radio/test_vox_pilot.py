"""Enhetstester for privat bokmålsstemme-pilot, ingen modellnedlasting."""
import datetime as dt
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
    def create_fake(self, root: pathlib.Path, readme="License: CC0\nVoxCPM2 teacher from talesyntese base."):
        (root / (vox.MODEL_NAME + ".onnx")).write_bytes(b"synthetic weight unit test only")
        (root / (vox.MODEL_NAME + ".onnx.json")).write_text(
            json.dumps({"num_speakers": 1, "audio": {"sample_rate": 22050}})
        )
        (root / "README.md").write_text(readme)

    def test_model_requires_revision_config_and_provenance(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            self.create_fake(root)
            model, meta = vox.check_model(root, "a" * 40)
            self.assertEqual(model.name, vox.MODEL_NAME + ".onnx")
            self.assertEqual(len(meta["fileSha256"]), 3)
            self.assertEqual(meta["baseRightsStatus"], "UNRESOLVED_TALESYNTESE_LINEAGE")
            with self.assertRaises(ValueError):
                vox.check_model(root, "main")
            self.create_fake(root, readme="CC0 with no lineage")
            with self.assertRaises(ValueError):
                vox.check_model(root, "a" * 40)
            self.create_fake(root, readme="VoxCPM2 based on talesyntese; no license field")
            with self.assertRaises(ValueError):
                vox.check_model(root, "a" * 40)

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
