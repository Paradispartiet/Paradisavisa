"""Lyttepanel skal kunne åpnes lokalt uten nett og uten utrygge lydlenker."""
import hashlib
import importlib.util
import json
import pathlib
import tempfile
import unittest

PATH = pathlib.Path(__file__).with_name("lag_lyttepanel.py")
spec = importlib.util.spec_from_file_location("lag_lyttepanel", PATH)
panel = importlib.util.module_from_spec(spec)
spec.loader.exec_module(panel)


class PanelTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = pathlib.Path(self.tmp.name)
        (self.root / "lydproever").mkdir()
        self.mp3 = self.root / "lydproever/proeve-01-normal.mp3"
        self.mp3.write_bytes(b"FAKE MP3 FOR UNIT TEST ONLY " * 300)
        self.report = self.root / "rapport.json"
        self.payload = {
            "status": "UNPUBLISHED_NEWS_VOICE_CANDIDATE",
            "publicPlayable": False,
            "rightsApproved": False,
            "qualityApproved": False,
            "audioCount": 1,
            "samples": [{
                "id": "proeve-01",
                "profile": "normal",
                "sourceCategory": "Sport",
                "sourceClass": "aktuell",
                "durationSeconds": 15.5,
                "file": "lydproever/proeve-01-normal.mp3",
                "sha256": hashlib.sha256(self.mp3.read_bytes()).hexdigest(),
            }],
            "speechTexts": [{"id": "proeve-01", "speechText": "Nyheten gjelder <Paris> & Oslo."}]
        }

    def write(self):
        self.report.write_text(json.dumps(self.payload), encoding="utf-8")

    def test_integrert_lyd_uten_autoplay_og_eksterne_kall(self):
        self.write()
        output = self.root / "lyttepanel.html"
        panel.build_panel(self.report, output)
        html = output.read_text(encoding="utf-8")
        self.assertIn("data:audio/mpeg;base64,", html)
        self.assertIn("controls preload='none'", html)
        self.assertIn("Nyheten gjelder &lt;Paris&gt; &amp; Oslo.", html)
        self.assertNotIn("autoplay", html.lower())
        self.assertNotIn("https://", html)
        self.assertIn("Kun privat prøvelytting", html)
        self.assertIn("if(b!==a)b.pause()", html)

    def test_avviser_alle_offentlige_flager(self):
        for key in ("publicPlayable", "rightsApproved", "qualityApproved"):
            self.payload[key] = True
            self.write()
            with self.assertRaises(ValueError):
                panel.checked_tracks(self.report)
            self.payload[key] = False

    def test_hash_bytte_og_path_traversal_blir_avvist(self):
        self.payload["samples"][0]["file"] = "lydproever/../../sensitiv.mp3"
        self.write()
        with self.assertRaises(ValueError):
            panel.checked_tracks(self.report)
        self.payload["samples"][0]["file"] = "lydproever/proeve-01-normal.mp3"
        self.payload["samples"][0]["sha256"] = "0" * 64
        self.write()
        with self.assertRaises(ValueError):
            panel.checked_tracks(self.report)

    def test_ingen_lyd_uten_rapport_og_taletekst(self):
        self.payload["speechTexts"] = []
        self.write()
        with self.assertRaises(ValueError):
            panel.checked_tracks(self.report)
        self.payload["speechTexts"] = [{"id": "proeve-01", "speechText": "Tekst"}]
        self.payload["audioCount"] = 9
        self.write()
        with self.assertRaises(ValueError):
            panel.checked_tracks(self.report)


if __name__ == "__main__":
    unittest.main()
