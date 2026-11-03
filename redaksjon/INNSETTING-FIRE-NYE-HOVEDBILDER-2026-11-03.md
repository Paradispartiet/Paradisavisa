# Innsettingsplan: fire nye KI-assisterte hovedbilder

**Dato:** 3. november 2026  
**Status:** Bildene er produsert lokalt og kodet inn i fire utkast og redaksjonelle forhåndsvisninger på grenen `design/fire-nye-hovedbilder-20261103`. **De fire faktiske JPG-filene er nå lastet opp til GitHub-grenen og verifisert mot originalfilenes Git SHA-1.** Artikkelutkastene er fortsatt upubliserte; ingen publiseringsgodkjenning følger av bildekontrollen.

## Bildene som skal legges inn

Bildene er levert i ZIP-pakke fra ChatGPT-samtalen. Det følger også med WebP-alternativer med samme navn. GitHub-koden er foreløpig konfigurert til JPG-versjonene nedenfor:

| Artikkel | Eksakt filbane som må fylles | Motiv |
|---|---|---|
| Spania: 17 minutter | `utkast/2026-11-02/bilder/spania-togkatastrofe-2026.jpg` | To fiktive tog på separate spor med rødt signallys, dramatisk morgenhimmel |
| Israel: Regjeringsdannelse | `utkast/2026-11-02/bilder/israel-regjeringsdannelse-2026.jpg` | Symbolsk parlamentssal med israelsk flagg |
| Europa: Ungdomsprotester | `utkast/2026-11-02/bilder/europa-ungdomsprotester-2026.jpg` | Fiktive ungdommer i et kveldsbelyst europeisk byrom med fransk og tysk flagg |
| Fiskeri: Fangsten på papiret | `utkast/2026-11-02/bilder/fiskeri-papirspor-2026.jpg` | Symbolsk norsk fiskemottak med fiskekasser, båter og registreringsark |

**Opprinnelse:** Fire utsnitt fra en KI-generert redaksjonell komposisjon, tilrettelagt og eksportert som individuelle 1600×900 JPG-er og WebP-bilder. Motivene er illustrasjoner, ikke dokumentarfotografier. Det finnes ikke sikre primærkilder som knytter de avbildede personene, togene eller virksomhetene til de faktiske hendelsene.

## Endringer allerede utført i PR-grenen

- Fire artikkelutkast: oppdatert `<img src>`, `width`, `height`, beskrivende `alt` og etisk presis bildetekst
- Fire interne forhåndsvisninger: lagt inn samme bilde etter ingressen, med beskrivende `alt` og bildetekst
- `utkast/artikler.json`: oppdatert `bilde` for de fire sakene
- **Ingen endring i `publisert`, `godkjent`, `faktasjekk` eller `status`.** Artiklene er fremdeles upubliserte utkast; `noindex, nofollow` er beholdt i begge HTML-variantene

## Bildeintegritet bekreftet 3. november 2026

Alle fire JPEG-er finnes i GitHub-grenen og har samme Git-blob-SHA som de lokalt produserte originalene (1600 × 900 piksler):

- Spania: `344805` byte · `cd8be1ad1d256accbebf16e39d2e967533855ebc`
- Israel: `328179` byte · `ecfbff87d1cf5acb009ae323495884f1d330f8fa`
- Europa: `299530` byte · `82e207aef921d1d0f13ab69711b3ca5208d5d006`
- Fiskeri: `335440` byte · `0b9ffb7fc3c3d64d19391e0f4c0dc72dce9a3938`

Kontroll av de fire artikkelutkastene og fire interne forhåndsvisningene bekrefter korrekte relative JPG-stier, 1600 × 900-dimensjoner, bildetekster, `noindex` og `IKKE PUBLISERT`. Redaksjonskøens fire oppføringer er fortsatt `status: utkast`, `godkjent: false`, `publisert: false` og `faktasjekk: kreves`. Visuell nettlesersjekk av publisert GitHub Pages er ikke utført som del av denne integritetskontrollen.

## Fullføringskontroll (bildeendring, ikke artikkelpublisering)

1. **Fullført:** Fire JPG-filer lastet opp på PR-grenen med eksakte filbaner som over.
2. **Fullført:** GitHub viser alle fire filene; kontrollert mot lokalt identiske JPEG-bildebytes, opprinnelig produsert i 1600 × 900.
3. Kontroller at hver interne forhåndsvisning viser **ett riktig bilde** og at bildet skaleres riktig på mobil; gamle SVG-er beholdes som reserve.
4. Merk bildene som **KI-generert redaksjonell illustrasjon**. Ikke presenter dem som fotografier fra hendelsene; ingen av de fiktive ansiktene, togene eller fiskerivirksomhetene skal knyttes til identifiserbare aktører.
5. Gi redaksjonell bilde- og publiseringsgodkjenning per sak. **Bildegodkjenning er ikke godkjenning av den journalistiske artikkelteksten.**
6. Først når filene finnes og forhåndsvisningene er kontrollert, kan billedendringene flettes inn. Artiklenes `publisert=false` skal fortsatt bestå inntil egne publiseringsvedtak.

## Teknisk verifisering

- Avtalt bildeforhold: 16:9, klargjort til 1600×900
- Sidevisningen bruker eksisterende redaksjonell CSS med `width:100%;height:auto`
- Verifiser `utkast/artikler.json` og tre forskjellige kilder: artikkel-HTML, redaksjonell forhåndsvisning og bildelager
- Ingen referanser til midlertidige ChatGPT-sandbox-lenker i kildekoden
