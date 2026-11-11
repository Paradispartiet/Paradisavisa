"""Test at SoMe-kortet faktisk blir riktig størrelse, og at lange titler ikke skjules."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from PIL import Image

SCRIPT = Path(__file__).parent / "some-kort.py"
spec = importlib.util.spec_from_file_location("some_kort", SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class SoMeKortTest(unittest.TestCase):
    def test_rasterkort_1080x1350(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            imagefile = root / "Bilder" / "Artikler" / "test.png"
            imagefile.parent.mkdir(parents=True)
            Image.new("RGB", (1600, 900), "#245577").save(imagefile)
            item = {"id":"test-kort", "image":"Bilder/Artikler/test.png",
                    "position":"center 40%",
                    "instagram":{"cardTitle":"En viktig nyhet om byen",
                                 "cardIngress":"Dette er en kort, etterprøvbar ingress som viser hva saken handler om."}}
            result = mod.create_card(item, root, root / "ut")
            self.assertTrue(result.is_file())
            with Image.open(result) as check:
                self.assertEqual(check.size, (1080, 1350))
                self.assertEqual(check.format, "PNG")
                # Svart felt under fotografiet.
                self.assertEqual(check.convert("RGB").getpixel((1070, 1300)), (9, 10, 12))

    def test_tittel_uten_plass_avvises(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "Bilder" / "Artikler" / "test.png"
            source.parent.mkdir(parents=True)
            Image.new("RGB", (1600, 900), "#245577").save(source)
            item = {"id":"lang", "image":"Bilder/Artikler/test.png",
                    "instagram":{"cardTitle":"Et svært langt og altfor tett ordvalg " * 20,
                                 "cardIngress":"Normal ingress om saken."}}
            with self.assertRaises(ValueError):
                mod.create_card(item, root, root / "ut")


if __name__ == "__main__":
    unittest.main()
