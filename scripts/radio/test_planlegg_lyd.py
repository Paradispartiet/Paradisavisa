"""Ingen offentlig lyd skal lekke fra radioens automatiske forhåndsbygg."""
import datetime as dt
import importlib.util
import json
import pathlib
import tempfile
import unittest

P = pathlib.Path(__file__).with_name("planlegg_lyd.py")
spec = importlib.util.spec_from_file_location("planlegg_lyd", P)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
ROOT = P.parents[2]
POLICY = json.loads((ROOT / "radio/release-gate.json").read_text(encoding="utf-8"))


def sample(text="En offentlig notis om dagens nyheter fra Oslo."):
    return {
        "category": "Nyheter",
        "text": text,
        "date": "2026-11-10",
        "url": "https://www.example.org/nyheter/test",
    }


class PlanleggLydTest(unittest.TestCase):
    def test_sperre_er_av_og_dato_er_norsk(self):
        self.assertFalse(module.frigitt(POLICY))
        self.assertIsInstance(module.oslo_dato(), dt.date)
        self.assertEqual(module.streng_dato("2026-11-10"), dt.date(2026, 11, 10))
        for bad in ["2026-11-1", "2026-02-30", "2026/11/10", ""]:
            with self.assertRaises(ValueError):
                module.streng_dato(bad)

    def test_alle_statusfelter_ma_godkjennes(self):
        approved = {
            "publicAudioEnabled": True,
            "modelRightsStatus": "APPROVED",
            "editorialAudioStatus": "APPROVED",
            "approvedBy": "Redaksjonen",
        }
        self.assertTrue(module.frigitt(approved))
        for key in approved:
            d = dict(approved)
            d[key] = None
            self.assertFalse(module.frigitt(d))

    def test_aktive_notiser_og_gammel_ekskludert(self):
        current = sample()
        outdated = {**sample(), "date": "2026-11-03", "url": "https://www.example.org/old"}
        future = {**sample(), "date": "2026-11-11", "url": "https://www.example.org/new"}
        expired = {**sample(), "expires": "2026-11-09", "url": "https://www.example.org/exp"}
        expired["date"] = "2026-11-08"
        result = module.bygg_forslag([current, outdated, future, expired], POLICY, dt.date(2026, 11, 10))
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["items"][0]["date"], "2026-11-10")
        self.assertEqual(result["items"][0]["expires"], "2026-11-16")
        self.assertTrue(result["privateCandidateOnly"])
        self.assertFalse(result["publicPlayable"])
        self.assertNotIn("audioUrl", result["items"][0])
        self.assertNotIn("speechText", result["items"][0])

    def test_tekstendring_beholder_id_men_fornyer_lydhash(self):
        first = sample()
        second = {**first, "text": first["text"] + " Oppdatert etter kildekontroll."}
        a = module.bygg_forslag([first], POLICY, dt.date(2026, 11, 10))["items"][0]
        b = module.bygg_forslag([second], POLICY, dt.date(2026, 11, 10))["items"][0]
        self.assertEqual(a["id"], b["id"])
        self.assertNotEqual(a["contentHash"], b["contentHash"])
        self.assertNotEqual(a["candidateFile"], b["candidateFile"])

    def test_ugyldig_kilde_og_duplikater_stoppes(self):
        with self.assertRaises(ValueError):
            module.bygg_forslag([{**sample(), "url": "javascript:alert(1)"}], POLICY,
                                dt.date(2026, 11, 10))
        with self.assertRaises(ValueError):
            module.bygg_forslag([sample(), sample()], POLICY, dt.date(2026, 11, 10))
        with self.assertRaises(ValueError):
            module.bygg_forslag([{**sample(), "speechText": "kort"}], POLICY,
                                dt.date(2026, 11, 10))

    def test_faktiske_notiser_blir_kun_private(self):
        items = json.loads((ROOT / "notiser.json").read_text(encoding="utf-8"))
        result = module.bygg_forslag(items, POLICY, dt.date(2026, 11, 10))
        self.assertTrue(result["count"] >= 1)
        self.assertTrue(all("candidateFile" in item and "audioUrl" not in item for item in result["items"]))
        self.assertTrue(all(item["date"] <= "2026-11-10" <= item["expires"] for item in result["items"]))


if __name__ == "__main__":
    unittest.main()
