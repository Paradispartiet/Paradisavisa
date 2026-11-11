"""Ren enhetstest av MOSS-tilgang uten nettverk eller modellnedlasting."""
from __future__ import annotations

import importlib.util
import io
import json
from pathlib import Path
import unittest
from urllib.error import HTTPError

SCRIPT = Path(__file__).with_name("probe_moss_access.py")
SPEC = importlib.util.spec_from_file_location("probe_moss_access", SCRIPT)
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


class FakeResponse:
    def __init__(self, data=None, status=200):
        self.data = json.dumps(data or {}).encode("utf-8")
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self, limit=None):
        return self.data


def model(revision="a" * 40, gated=False):
    return {
        "sha": revision,
        "private": False,
        "gated": gated,
        "siblings": [{"rfilename": "README.md"},
                     {"rfilename": "model.safetensors"}],
    }


class AccessTests(unittest.TestCase):
    def test_model_metadata_and_weight_head_both_required(self):
        seen = []
        def opener(request, timeout):
            seen.append((request.full_url, request.get_method()))
            if "/api/models/" in request.full_url:
                return FakeResponse(model())
            return FakeResponse(status=200)
        row = mod.check(mod.PRIMARY, opener=opener)
        self.assertEqual(row["access"], "PUBLIC_HEAD_OK")
        self.assertEqual(row["revision"], "a" * 40)
        self.assertEqual(seen[1][1], "HEAD")
        self.assertEqual(len(seen), 2)
        self.assertFalse(row["rightsApproved"])
        self.assertFalse(row["qualityApproved"])

    def test_http_401_is_not_treated_as_permission(self):
        def opener(request, timeout):
            raise HTTPError(request.full_url, 401, "Unauthorized", None, None)
        row = mod.check(mod.PRIMARY, opener=opener)
        self.assertEqual(row["access"], "ACCESS_DENIED_HTTP_401")
        self.assertNotIn("revision", row)

    def test_403_weight_does_not_validate_metadata(self):
        def opener(request, timeout):
            if "/api/models/" in request.full_url:
                return FakeResponse(model())
            raise HTTPError(request.full_url, 403, "Forbidden", None, None)
        row = mod.check(mod.PRIMARY, opener=opener)
        self.assertEqual(row["access"], "WEIGHTS_ACCESS_DENIED_HTTP_403")

    def test_gated_and_invalid_revision_fail_closed(self):
        for meta, expected in (
            (model(gated="auto"), "GATED"),
            (model(revision="main"), "MISSING_EXACT_REVISION"),
            ({"sha": "a"*40, "siblings": []}, "NO_WEIGHT_FILE_LISTED"),
        ):
            row = mod.check(mod.PRIMARY, opener=lambda request, timeout: FakeResponse(meta))
            self.assertEqual(row["access"], expected)

    def test_both_primary_and_tokenizer_required(self):
        rows = [{"repository": x, "access": "PUBLIC_HEAD_OK"} for x in mod.REPOSITORIES]
        self.assertTrue(mod.evaluate(rows))
        for missing in (mod.PRIMARY, mod.TOKENIZER):
            replacement = [dict(x) for x in rows]
            next(row for row in replacement if row["repository"] == missing)["access"] = "ACCESS_DENIED_HTTP_401"
            self.assertFalse(mod.evaluate(replacement))


if __name__ == "__main__":
    unittest.main()
