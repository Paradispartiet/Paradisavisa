#!/usr/bin/env python3
"""One-shot, SHA-256 locked image import for Paradisavisa PR #199.

Run from the repository root on its PR branch. This modifies *drafts only*.
The expected ZIP is uploaded in redaksjon/incoming/ through GitHub's UI.
"""
from __future__ import annotations

import hashlib
import html
import json
from pathlib import Path
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ZIP_REL = Path('redaksjon/incoming/PR199_Paradisavisa_bilder_2026-11-20.zip')
ZIP_SHA256 = '3be1ba5f888566fbcf7d521e5eb71e6311669c63f766694229c482c4b9f1c94d'
EXPECTED = {
    'stormaktene-fredserklaering': {
        'image': '2b4f4afd1154c19db7000dc71a3ecb77c324447290969d04a0a6d047939908d2',
        'thumbnail': '841748f71ee630e607e0d3a371fc5a099fc43779f65e631646b53e90d9a49361',
        'alt': 'Malerisk KI-illustrasjon av Donald Trump, Xi Jinping og Vladimir Putin foran nasjonale flagg, forhandlingsbord og jordklode.',
        'caption': 'KI-generert redaksjonell illustrasjon av Trump, Xi og Putin. Bildet viser ikke et faktisk øyeblikk fra toppmøtet.',
    },
    'anthropic-rekordnotering': {
        'image': 'd9baace6ae7947e6bcdf800fff91b1f01d53cbdfb599f7ced75e2f4d5f53d836',
        'thumbnail': '9e8eae13130f92f7ccc9e3571508e834e1b33563a436b621b222a7f2730e0a15',
        'alt': 'KI-illustrasjon av amerikansk børsarkitektur ved siden av en moderne datateknologibygning og lysende servere.',
        'caption': 'KI-generert redaksjonell illustrasjon av finansmarkedet og digital infrastruktur. Ikke fotografi fra Anthropics børsnotering.',
    },
    'hoyre-budsjett-frp-maling': {
        'image': '51098b246a6406c5e33c98fcc2d8f6292f6f0810e114ac70b42185feb948b3fa',
        'thumbnail': '93a4235716f5f5bec764c79f7399a03628b5f0d77390e62653a5907bfa3f8aab',
        'alt': 'KI-illustrasjon av en kvinne foran Høyres blå bakgrunn med et dokument om alternativt statsbudsjett for 2027.',
        'caption': 'KI-generert redaksjonell illustrasjon om Høyres alternative statsbudsjett. Ikke fotografi fra partiets presentasjon.',
    },
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def check(condition: bool, msg: str) -> None:
    if not condition:
        raise ValueError(msg)


def main() -> None:
    zip_path = ROOT / ZIP_REL
    check(zip_path.is_file(), f'Mangler bildepakke: {ZIP_REL}')
    archive_bytes = zip_path.read_bytes()
    check(sha(archive_bytes) == ZIP_SHA256, 'ZIP-filen har feil SHA-256: avbrutt uten endringer')

    with zipfile.ZipFile(zip_path) as archive:
        names = archive.namelist()
        expected_names = {'README.md', 'manifest.json', 'forhandsvisning.html'}
        for slug in EXPECTED:
            expected_names.update({f'{slug}-hovedbilde.webp', f'{slug}-miniatyr.webp'})
        check(set(names) == expected_names and len(names) == len(expected_names), 'ZIP inneholder uventede eller manglende filer')
        manifest = json.loads(archive.read('manifest.json'))
        records = {row['slug']: row for row in manifest['article_assets']}
        check(set(records) == set(EXPECTED), 'Bildemanifestet har feil eller dupliserte artikler')
        check(manifest.get('version') == '2026-11-20', 'Feil manifestversjon')
        payload: dict[str, bytes] = {}
        for slug, spec in EXPECTED.items():
            record = records[slug]
            check(record['dimensions'] == [1600, 900], f'Feil deklarerte bildemål: {slug}')
            for role, suffix, sha_key in [('image', 'hovedbilde', 'image_sha256'), ('thumbnail', 'miniatyr', 'thumb_sha256')]:
                name = f'{slug}-{suffix}.webp'
                data = archive.read(name)
                check(sha(data) == spec[role] == record[sha_key], f'Ugyldig bildekontrollsum: {name}')
                check(data[:4] == b'RIFF' and data[8:12] == b'WEBP', f'Ugyldig WebP: {name}')
                payload[name] = data

    queue_path = ROOT / 'utkast/artikler.json'
    queue = json.loads(queue_path.read_text(encoding='utf-8'))
    check(queue.get('arbeidsflyt') == 'fortlopende', 'Feil artikkelkø')
    changes: dict[Path, str] = {}
    for slug, spec in EXPECTED.items():
        entries = [x for x in queue['artikler'] if x.get('id') == slug]
        check(len(entries) == 1, f'Artikkel mangler eller er duplisert: {slug}')
        entry = entries[0]
        check(entry.get('status') == 'utkast' and entry.get('godkjent') is False and entry.get('publisert') is False,
              f'Artikkelen er ikke et upublisert utkast: {slug}')
        path = ROOT / f'utkast/2026-11-19/{slug}.html'
        old = path.read_text(encoding='utf-8')
        check('<meta name="robots" content="noindex, nofollow">' in old, 'Publiseringssperre mangler i ' + slug)
        original = (f'<figure class="av-figur av-hovedbilde"><img src="bilder/{slug}.svg" '
                    'width="1600" height="900" loading="eager" alt="')
        check(old.count(original) == 1, f'Finner ikke originalbildet i {slug}')
        pattern = re.compile(re.escape(original) + r'[^"<>]*"><figcaption>[^<>]*</figcaption>')
        replacement = (f'<figure class="av-figur av-hovedbilde"><img src="bilder/{slug}-hovedbilde.webp" '
                       f'width="1600" height="900" loading="eager" fetchpriority="high" '
                       f'alt="{html.escape(spec["alt"], quote=True)}"><figcaption>'
                       f'{html.escape(spec["caption"])}' + '</figcaption>')
        newer, n = pattern.subn(lambda _: replacement, old)
        check(n == 1, f'Kunne ikke oppdatere bilde/tekst i {slug}')
        newer = newer.replace('bilde er kun en foreløpig redaksjonell skisse',
                              'bildet er en KI-generert redaksjonell illustrasjon, ikke dokumentarfoto')
        check('REDAKSJONELT UTKAST – IKKE PUBLISERT' in newer, 'Utkastmerking forsvant i ' + slug)
        changes[path] = newer
        entry['bilde'] = f'utkast/2026-11-19/bilder/{slug}-hovedbilde.webp'

    changes[queue_path] = json.dumps(queue, ensure_ascii=False, indent=2) + '\n'
    for name in payload:
        destination = ROOT / 'utkast/2026-11-19/bilder' / name
        check(not destination.exists() or destination.read_bytes() == payload[name],
              f'Annen bildefil eksisterer allerede: {name}')

    # All checks have passed: only now modify local working tree. No publication.
    dest_dir = ROOT / 'utkast/2026-11-19/bilder'
    dest_dir.mkdir(parents=True, exist_ok=True)
    for name, data in payload.items():
        (dest_dir / name).write_bytes(data)
    for path, content in changes.items():
        path.write_text(content, encoding='utf-8')
    print('OK: seks verifiserte WebP-filer og tre redaksjonelle utkast oppdatert.')
    print('Alle tre er fortsatt noindex, status=utkast og publisert=false.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, zipfile.BadZipFile, json.JSONDecodeError) as error:
        print(f'Import avbrutt: {error}', file=sys.stderr)
        sys.exit(1)
