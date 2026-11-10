"""Rettighetsporten til den nye MOSS-prøven skal aldri åpne offentlig lyd."""
import importlib.util
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("lag_moss_prover", pathlib.Path(__file__).with_name("lag_moss_prover.py"))
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


class MossPilotSafetyTest(unittest.TestCase):
    def test_real_policy_is_not_public(self):
        gate = json.loads((ROOT / "radio/release-gate.json").read_text(encoding="utf-8"))
        mod.blocked(gate)

    def test_fail_closed_if_any_gate_is_approved(self):
        gate = {"publicAudioEnabled": False, "modelRightsStatus": "PENDING",
                "editorialAudioStatus": "PENDING"}
        for field, value in (
            ("publicAudioEnabled", True),
            ("modelRightsStatus", "APPROVED"),
            ("editorialAudioStatus", "APPROVED"),
        ):
            with self.assertRaises(ValueError):
                mod.blocked({**gate, field: value})

    def test_requires_exact_model_revisions(self):
        assert mod.assert_revision("a" * 40) == "a" * 40
        for bad in ("main", "abc", "A" * 40, "", "../escape"):
            with self.assertRaises(ValueError):
                mod.assert_revision(bad)

    def test_workflow_never_uploads_raw_audio(self):
        flow = (ROOT / ".github/workflows/radio-moss-nano-privat.yml").read_text(encoding="utf-8")
        self.assertIn("RADIO_MOSS_AUDIO_PASSPHRASE", flow)
        self.assertIn("openssl enc -aes-256-cbc", flow)
        self.assertIn("paradisradio-moss-prive.tar.gz.enc", flow)
        self.assertIn("retention-days: 7", flow)
        self.assertNotIn("moss-prove/lydproever/*.mp3", flow)
        self.assertNotIn("pull_request:", flow)
        self.assertIn("publicAudioEnabled", flow)

    def test_subprocess_uses_literal_arguments_and_private_continuation(self):
        arguments = mod.command(
            pathlib.Path("/tmp/nb_model"), pathlib.Path("/tmp/tokenizer"),
            'Navnet "Oslo"; med 25 prosent.', pathlib.Path("/tmp/out.wav"))
        self.assertEqual(arguments[0:2], ["moss-tts-nano", "generate"])
        self.assertEqual(arguments[arguments.index("--mode") + 1], "continuation")
        self.assertEqual(arguments[arguments.index("--checkpoint") + 1], "/tmp/nb_model")
        self.assertIn('Navnet "Oslo"; med 25 prosent.', arguments)
        self.assertNotIn("shell", arguments)
        with self.assertRaises(ValueError):
            mod.command(pathlib.Path("/a"), pathlib.Path("/b"), " ", pathlib.Path("/c"))


if __name__ == "__main__":
    unittest.main()
