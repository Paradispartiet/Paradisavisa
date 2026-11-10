"""Kontroller dokumentert Vox-opphav og blokker offentlig lyd ved uavklart Lessac-kjede.

Dette er IKKE juridisk vurdering og skal ikke automatisk godkjenne noen stemme.
Testen er bevisst lukket: senere rettighetsavklaring krever eksplisitt code review
og egen godkjent utgivelses-PR, ikke bare endring av et JSON-flagg.
"""
from __future__ import annotations

import json
import pathlib
import unittest
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
AUDIT = ROOT / "radio" / "vox-rights-audit.json"
LOCK = ROOT / "radio" / "vox-model-lock.json"
GATE = ROOT / "radio" / "release-gate.json"

SOURCES = {
    "vox_card",
    "checkpoint",
    "talesyntese_card",
    "lessac_license",
    "piper_policy",
}


def validate(audit: dict, lock: dict, gate: dict) -> None:
    if audit.get("schemaVersion") != 1:
        raise ValueError("Rettighetsrapportens versjon mangler")
    voice = audit.get("voice", {})
    if (voice.get("model") != lock.get("model")
            or voice.get("repository") != lock.get("repository")
            or voice.get("revision") != lock.get("revision")
            or voice.get("releaseCandidate") != "INTERNAL_ONLY"):
        raise ValueError("Rettighetsrapport og faktisk låst stemme er ikke samme revisjon")

    if (audit.get("status") != "HOLD_PENDING_RIGHTS_CLEARANCE"
            or audit.get("legalConclusion") != "NOT_DETERMINED"
            or audit.get("publicAudioAuthorized") is not False):
        raise ValueError("Vox har ikke godkjent rettighetskjede: offentlig lyd må sperres")

    expected = audit.get("publicGateExpected", {})
    if expected != {
        "publicAudioEnabled": False,
        "modelRightsStatus": "PENDING",
        "editorialAudioStatus": "PENDING",
    }:
        raise ValueError("Rettighetsrapporten kan ikke erklære offentlig godkjenning")

    for key, value in expected.items():
        if gate.get(key) is not value if isinstance(value, bool) else gate.get(key) != value:
            raise ValueError("Publiseringsporten ble endret uten rettighetsklarering")

    if (lock.get("rightsStatus") != "PENDING"
            or lock.get("editorialStatus") != "FIRST_LISTEN_POSITIVE_NOT_FINAL"
            or lock.get("publicAudioEnabled") is not False):
        raise ValueError("Stemmelåsen gir ikke rett til offentlig publisering")

    facts = audit.get("facts", [])
    if len(facts) < len(SOURCES) or {f.get("id") for f in facts} != SOURCES:
        raise ValueError("Ufullstendig rettighetskjede")

    for fact in facts:
        url = fact.get("source")
        if not (isinstance(url, str)
                and urlparse(url).scheme == "https"
                and urlparse(url).hostname in {
                    "github.com", "huggingface.co", "www.cstr.ed.ac.uk"
                }
                and fact.get("claim") and fact.get("evidenceType")):
            raise ValueError("Rettighetsbevis mangler kilde eller forklaring")

    if len(audit.get("knownGaps", [])) < 3:
        raise ValueError("Åpne avklaringspunkter kan ikke falle bort uten vurdering")


class VoxRightsAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        cls.lock = json.loads(LOCK.read_text(encoding="utf-8"))
        cls.gate = json.loads(GATE.read_text(encoding="utf-8"))

    def test_real_review_remains_fully_blocked(self):
        validate(self.audit, self.lock, self.gate)

    def test_different_model_revision_is_rejected(self):
        changed = {**self.lock, "revision": "f" * 40}
        with self.assertRaises(ValueError):
            validate(self.audit, changed, self.gate)

    def test_no_approval_by_flags_or_cc0_label_alone(self):
        for key, value in {
            "publicAudioAuthorized": True,
            "status": "APPROVED",
            "legalConclusion": "CLEARED",
        }.items():
            with self.assertRaises(ValueError):
                validate({**self.audit, key: value}, self.lock, self.gate)

        for key, value in {
            "publicAudioEnabled": True,
            "modelRightsStatus": "APPROVED",
            "editorialAudioStatus": "APPROVED",
        }.items():
            with self.assertRaises(ValueError):
                validate(self.audit, self.lock, {**self.gate, key: value})

    def test_missing_lessac_or_checkpoint_evidence_fails(self):
        bad = {**self.audit, "facts": [
            fact for fact in self.audit["facts"]
            if fact["id"] not in {"lessac_license", "checkpoint"}
        ]}
        with self.assertRaises(ValueError):
            validate(bad, self.lock, self.gate)

    def test_untrusted_http_or_missing_source_fails(self):
        changed = [dict(x) for x in self.audit["facts"]]
        changed[0]["source"] = "http://example.invalid/not-a-license"
        with self.assertRaises(ValueError):
            validate({**self.audit, "facts": changed}, self.lock, self.gate)


if __name__ == "__main__":
    unittest.main()
