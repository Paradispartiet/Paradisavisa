"""Offline iPad/Media Session-panelet må være privat og ikke kjøre automatisk."""
from __future__ import annotations
import hashlib
import importlib.util
import json
import pathlib
import re
import subprocess
import tempfile
import unittest

PATH = pathlib.Path(__file__).with_name("lag_mobil_lyttepanel.py")
spec = importlib.util.spec_from_file_location("lag_mobil_lyttepanel", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class MobilePanelTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = pathlib.Path(self.tmp.name)
        (self.root / "lydproever").mkdir()
        self.mp3 = self.root / "lydproever/proeve-01-normal.mp3"
        self.mp3.write_bytes(b"FAKE AUDIO - NOT A REAL MP3 FILE " * 270)
        self.report = self.root / "rapport.json"
        self.record = {
            "status": "UNPUBLISHED_NEWS_VOICE_CANDIDATE",
            "publicPlayable": False,
            "rightsApproved": False,
            "qualityApproved": False,
            "audioCount": 1,
            "samples": [{
                "id": "proeve-01", "profile": "normal",
                "sourceCategory": "Sport",
                "sourceClass": "arkiv_kun_uttaletest",
                "durationSeconds": 15.2,
                "file": "lydproever/proeve-01-normal.mp3",
                "sha256": hashlib.sha256(self.mp3.read_bytes()).hexdigest(),
            }],
            "speechTexts": [{"id": "proeve-01", "speechText": "Sport. <Test> & 20 prosent."}],
        }
        self.write()

    def write(self):
        self.report.write_text(json.dumps(self.record), encoding="utf-8")

    def test_single_audio_media_session_and_no_network(self):
        output = self.root / "ipad.html"
        mod.build_mobile_panel(self.report, output)
        page = output.read_text(encoding="utf-8")
        self.assertEqual(page.count("<audio "), 1)
        self.assertIn("data:audio/mpeg;base64,", page)
        self.assertIn("media.setActionHandler", page)
        self.assertIn("previoustrack", page)
        self.assertIn("nexttrack", page)
        self.assertIn('document.addEventListener("visibilitychange"', page)
        self.assertIn('id="log"', page)
        self.assertIn("Sikker kontekst", page)
        self.assertNotIn('src="http', page)
        self.assertNotIn("autoplay", page.lower())
        self.assertIn("arkiv_kun_uttaletest", page)
        self.assertNotIn("<Test>", page)
        self.assertIn("\\u003cTest\\u003e", page)

        # Uttaletekst og lyd ligger i JSON; JS må være syntaktisk gyldig.
        scripts = re.findall(r"<script(?: [^>]*)?>(.*?)</script>", page, re.S)
        self.assertEqual(len(scripts), 2)
        result = subprocess.run(
            ["node", "--check", "-"], input=scripts[1], text=True, capture_output=True
        )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_all_public_flags_still_blocked(self):
        for flag in ("publicPlayable", "rightsApproved", "qualityApproved"):
            self.record[flag] = True
            self.write()
            with self.assertRaises(ValueError):
                mod.build_mobile_panel(self.report, self.root / "test.html")
            self.record[flag] = False

    def test_hash_protection_and_no_traversal(self):
        self.record["samples"][0]["sha256"] = "0" * 64
        self.write()
        with self.assertRaises(ValueError):
            mod.build_mobile_panel(self.report, self.root / "test.html")
        self.record["samples"][0]["file"] = "../secrets.mp3"
        self.write()
        with self.assertRaises(ValueError):
            mod.build_mobile_panel(self.report, self.root / "test.html")


if __name__ == "__main__":
    unittest.main()
