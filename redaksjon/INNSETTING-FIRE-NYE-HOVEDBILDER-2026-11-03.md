# Innsettingsplan: fire nye KI-assisterte hovedbilder

**Dato:** 3. november 2026  
**Status:** Bildene er produsert lokalt og kodet inn i fire utkast og redaksjonelle forhåndsvisninger på grenen `design/fire-nye-hovedbilder-20261103`. **De fire faktiske JPG-filene mangler fortsatt i GitHub og må lastes opp før denne endringen kan flettes inn i `main`.**

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

## Før merge / publisering av bildene

1. Last opp de fire JPG-filene fra ChatGPT-bildepakken **på PR-grenen, ikke direkte på main**, nøyaktig som filbanene ovenfor.
2. Kontroller at GitHub faktisk viser alle fire filene, hver med JPEG-signatur og riktige mål.
3. Kontroller at hver interne forhåndsvisning viser **ett riktig bilde** og at bildet skaleres riktig på mobil; gamle SVG-er beholdes som reserve.
4. Merk bildene som **KI-generert redaksjonell illustrasjon**. Ikke presenter dem som fotografier fra hendelsene; ingen av de fiktive ansiktene, togene eller fiskerivirksomhetene skal knyttes til identifiserbare aktører.
5. Gi redaksjonell bilde- og publiseringsgodkjenning per sak. **Bildegodkjenning er ikke godkjenning av den journalistiske artikkelteksten.**
6. Først når filene finnes og forhåndsvisningene er kontrollert, kan billedendringene flettes inn. Artiklenes `publisert=false` skal fortsatt bestå inntil egne publiseringsvedtak.

## Teknisk verifisering

- Avtalt bildeforhold: 16:9, klargjort til 1600×900
- Sidevisningen bruker eksisterende redaksjonell CSS med `width:100%;height:auto`
- Verifiser `utkast/artikler.json` og tre forskjellige kilder: artikkel-HTML, redaksjonell forhåndsvisning og bildelager
- Ingen referanser til midlertidige ChatGPT-sandbox-lenker i kildekoden
