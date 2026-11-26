from pathlib import Path
import hashlib
import html
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ZIP = ROOT / "redaksjon/incoming/Paradisavisa_oljepris_tegneserier.zip"
ARTICLE = ROOT / "artikler/2026-11-05-oljeprisfall-usa-valg-norge.html"
DEST = ROOT / "Bilder/Artikler"
ZIP_SHA = "5f34c6d3a52526fbe1526fc2a5ef8aab8172629d927b7f99e0239eae5b2bb737"
SPECS = [
("01", "497ed15a903983acacd65fd12301bba556dc270e8a52eb23715098c6ba0d4fa2",
 "<section><h2>Norge påvirkes fra flere kanter</h2>",
 "Tre tegnede scener: amerikansk valg, usikkerhet om oljetransport gjennom Hormuzstredet og fallende oljepris.",
 "Fra valg til marked: forventninger om mindre geopolitisk risiko kan senke oljeprisen uten at en fredsavtale er inngått."),
("02", "4b067ece3c678130833a388eb104aa7e1217ebd31ac64dc9f3aed3c79ade79d8",
 '<section class="av-modul" data-av-explainer aria-labelledby="olje-hvorfor-tittel">',
 "Tre tegnede scener om norsk statsøkonomi, husholdningens drivstoff- og importkostnader og Norges Banks avveininger.",
 "Norske virkninger: statens oljeinntekter kan falle hvis prisfallet varer, mens drivstoff, importpriser og renter påvirkes av flere forhold."),
("03", "4c01981de815ffaf4536543511928c8b11bffc3256e81e9fb37a4dcad7498b18",
 "<section><h2>Norges Bank holdt renten på 4,5 prosent</h2>",
 "Tre tegnede scener om energietterspørsel og oljetilbud, mulige klimavirkninger og usikre følger for norsk oljeindustri.",
 "Klima og veien videre: mindre oljebehov og større oljetilbud kan begge gi prisfall, men med ulike konsekvenser for utslipp og investeringer."),
]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def require(ok, message):
    if not ok:
        raise ValueError(message)

def main():
    require(sha(ZIP.read_bytes()) == ZIP_SHA, "Feil ZIP-kontrollsum")
    names = [f"2026-11-05-oljepris-tegneserie-{i}.webp" for i, *_ in SPECS]
    payload = {}
    with zipfile.ZipFile(ZIP) as archive:
        require(sorted(archive.namelist()) == sorted(names), "Uventede ZIP-filer")
        for name, (_, expected, *_rest) in zip(names, SPECS):
            data = archive.read(name)
            require(sha(data) == expected and data[:4] == b"RIFF" and data[8:12] == b"WEBP", "Ugyldig bilde: " + name)
            require(not (DEST / name).exists() or (DEST / name).read_bytes() == data, "Vil ikke overskrive annet bilde")
            payload[name] = data
    old = ARTICLE.read_bytes().decode("utf-8")
    new = old
    for name, (_, _, anchor, alt, caption) in zip(names, SPECS):
        require(new.count(anchor) == 1, "Uklart artikkelanker: " + anchor)
        require(name not in new, "Illustrasjonen er allerede lagt inn")
        figure = ('<figure class="av-tegneseriestripe" style="margin:2rem 0">'
                  f'<a href="../Bilder/Artikler/{name}" aria-label="Åpne illustrasjonen i full størrelse">'
                  f'<img src="../Bilder/Artikler/{name}" width="1672" height="941" loading="lazy" decoding="async" '
                  f'style="display:block;width:100%;height:auto" alt="{html.escape(alt, quote=True)}"></a>'
                  f'<figcaption>{html.escape(caption)} KI-assistert redaksjonell illustrasjon. Ikke dokumentarfotografi; mulige scenarier er symbolske.</figcaption></figure>\n')
        new = new.replace(anchor, figure + anchor, 1)
    require(all(new.count(name) == 2 for name in names), "Feil antall nye bildelenker")
    stripped = re.sub(r'<figure class="av-tegneseriestripe".*?</figure>\n', '', new, flags=re.S)
    require(stripped == old, "Eksisterende artikkelinnhold ble endret")
    for name, data in payload.items():
        (DEST / name).write_bytes(data)
    ARTICLE.write_bytes(new.encode("utf-8"))
    print("OK: tre verifiserte striper lagt til; original artikkel og alle eksisterende bilder er bevart.")

if __name__ == "__main__":
    main()
