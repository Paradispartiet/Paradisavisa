"""Kun standardbibliotek: test pilotens redaksjonelle og tekniske sperrer."""
import datetime as dt
import importlib.util
import pathlib
import tempfile
import unittest
import wave
import math
import struct
import json
import subprocess
import shutil
import wave
from types import SimpleNamespace

P = pathlib.Path(__file__).with_name("generer_lydpilot.py")
spec = importlib.util.spec_from_file_location("generer_lydpilot", P)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class PilotTest(unittest.TestCase):
    def test_dato_utlop_og_framtid(self):
        d = dt.date(2026, 11, 9)
        self.assertTrue(mod.er_aktuell({"text": "Godkjent", "date": "2026-11-09"}, d))
        self.assertFalse(mod.er_aktuell({"text": "Gammel", "date": "2025-10-24"}, d))
        self.assertFalse(mod.er_aktuell({"text": "Utgått", "date": "2026-11-09", "expires": "2026-11-08"}, d))
        self.assertFalse(mod.er_aktuell({"text": "Framtid", "date": "2026-11-10"}, d))
        self.assertFalse(mod.er_aktuell({"text": "Udatert"}, d))

    def test_publisert_og_arkiv_bare_uttale(self):
        d = dt.date(2026, 11, 9)
        aktiv = [{"category": "Sport", "text": "Dette er en godkjent sportnotis om norsk landslagssamling.", "date": "2026-11-09"}]
        gamle = [{"category": "Klima", "text": f"Tidligere offentlig notis med tilstrekkelig tekst {i}."}
                 for i in range(10)]
        result = mod.velg_prover(aktiv, gamle, d, 10)
        self.assertEqual(len(result), 10)
        self.assertEqual(result[0]["kildeklasse"], "aktuell")
        self.assertTrue(all(n["kildeklasse"] == "arkiv_kun_uttaletest" for n in result[1:]))
        self.assertEqual(len({n["uttale_sha256"] for n in result}), 10)
        with self.assertRaises(ValueError):
            mod.velg_prover(aktiv, [], d, 10)

    def test_tale_er_ikke_original(self):
        item = {"text": "Norge gir 600 mill. kr, 30 % vekst.", "category": "Økonomi"}
        self.assertEqual(mod.tilpass_uttale(item), "Økonomi. Norge gir 600 millioner kr, 30 prosent vekst.")
        self.assertEqual(item["text"], "Norge gir 600 mill. kr, 30 % vekst.")
        item["speechText"] = "Tilpasset, godkjent uttale."
        self.assertEqual(mod.tilpass_uttale(item), "Økonomi. Tilpasset, godkjent uttale.")

    def test_forbered_ti_fra_faktiske_notiser(self):
        with tempfile.TemporaryDirectory() as directory:
            file = mod.lag_plan(pathlib.Path(directory), dt.date(2026, 11, 9), 10)
            data = json.loads(file.read_text(encoding="utf-8"))
            self.assertEqual(len(data["samples"]), 10)
            aktuelle = mod.les_json(mod.ROOT / "notiser.json")
            antall_ferske = sum(mod.er_aktuell(n, dt.date(2026, 11, 9)) for n in aktuelle)
            self.assertEqual(
                len([s for s in data["samples"] if s["kildeklasse"] == "aktuell"]),
                min(10, antall_ferske)
            )
            self.assertTrue(all(not s["id"].startswith("historisk") for s in data["samples"]))

    def test_setningspauser_uten_resampling(self):
        rate = 22050
        blokk = bytes(2205 * 2)  # 100 ms 16-bit mono
        chunk = SimpleNamespace(
            sample_rate=rate, sample_width=2, sample_channels=1,
            audio_int16_bytes=blokk,
        )
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / "setninger.wav"
            antall = mod.skriv_chunker_til_wave(path, [chunk, chunk])
            self.assertEqual(antall, 2)
            with wave.open(str(path), "rb") as file:
                self.assertEqual(file.getframerate(), rate)
                self.assertEqual(file.getsampwidth(), 2)
                self.assertEqual(file.getnchannels(), 1)
                self.assertEqual(file.getnframes(), 2 * 2205 + round(rate * 0.22))
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError):
                mod.skriv_chunker_til_wave(pathlib.Path(directory) / "tom.wav", [])

    def test_pilotprofil_er_fastsatt(self):
        self.assertAlmostEqual(mod.RADIO_LENGTH_SCALE, 1.08)
        self.assertAlmostEqual(mod.RADIO_NOISE_SCALE, 0.55)
        self.assertAlmostEqual(mod.RADIO_NOISE_W_SCALE, 0.65)
        self.assertAlmostEqual(mod.RADIO_SENTENCE_PAUSE_SECONDS, 0.22)

    @unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"),
                         "ffmpeg/ffprobe er ikke installert på denne testmaskinen")
    def test_mp3_med_riktig_metadata(self):
        with tempfile.TemporaryDirectory() as directory:
            out = pathlib.Path(directory) / "sample.mp3"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
                            "-i", "sine=frequency=440:duration=3", "-ar", "24000",
                            "-ac", "1", "-b:a", "64k", str(out)], check=True)
            info = mod.lydinfo(out)
            self.assertEqual(info["codec"], "mp3")
            self.assertGreater(info["durationSeconds"], 2)
            self.assertGreater(info["bytes"], 5000)


if __name__ == "__main__":
    unittest.main()
