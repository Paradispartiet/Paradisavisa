# Bildeoppgradering av fire publiserte nyhetssaker – 3. november 2026

**Formål:** Erstatte enkle hovedillustrasjoner i fire allerede publiserte saker, uten å endre nyhetstekst, kildeopplysninger eller publiseringsdato.

## Omfang

| Artikkel | Ny fil | Forholdet til fakta |
| --- | --- | --- |
| Meta: plattformmakt og pressefrihet | `Bilder/Artikler/meta-pressefrihet-2026.jpg` | Redaksjon og dataplattform er symbolske, ingen dokumentarisk avbildning |
| Trump/Wall Street Journal-dommen | `Bilder/Artikler/trump-avisdom-2026.jpg` | Generisk domstol og papirark, ikke den aktuelle rettssalen eller sakens dokumenter |
| Serbia: studentbevegelsen | `Bilder/Artikler/serbia-studentbevegelse-2026.jpg` | Kveldsillustrasjon med lys og demonstranter; ingen påstand om at motivet er fra en bestemt markering |
| Binance: kryptotyveriet | `Bilder/Artikler/binance-cyberangrep-2026.jpg` | Fiktivt datasenter og digitalt hvelv; ingen påstand om hackingens faktiske metode eller gjerningspersoner |

**Produksjon:** Nye, selvstendige illustrasjoner er laget for redaksjonell bruk med skriptbasert digital tegning, lag, lys og tekstur, med KI-assistert bildedesign. Ingen eksterne fotografier, illustrasjoner eller logoer er brukt i filene. Bildene er ikke pressefotografier. Hver fil er 1600 × 900 piksler (16:9), JPEG. Opprinnelige SVG-filer beholdes for tilbakerulling.

**Gjennomført i arbeidsgrenen:** 4 JPG-bilder, 4 artikkelfiler og `Nyhetshjul.json`. Hver artikkel viser nytt hovedbilde med presis alt-tekst og synlig merking «KI-assistert redaksjonell illustrasjon». `og:image` og `twitter:image` bruker samme fil. For Meta er det bare hovedbildet som er byttet; den andre forklaringsillustrasjonen inne i teksten er uendret.

## Visuell kontroll før publisering

- Filene skal finnes under `Bilder/Artikler/` i samme gren/commit som HTML-endringene
- Hver fil må være lesbar JPEG og ha forventet format 1600 × 900
- `Nyhetshjul.json`, `<img src>`, `og:image` og `twitter:image` må være konsistente
- Sjekk mobilvisning, desktop, utsnitt i forsidekort og at synlig billedtekst ikke mistolkes som dokumentarfoto
- Bekreft at eksisterende tekst og publiseringsdato ikke er endret
- Verifiser GitHub Pages-utrulling og faktiske bildelenker etter fletteoperasjon

## Kvalitetsvurdering

Bildene er ment som **redaksjonelle illustrasjoner**, med mer dybde og egen motividé enn én strekfigur på mørk bakgrunn. De er imidlertid ikke fotorealistiske, og er ikke visuelt identiske med den mer fotomontasjebaserte Støre–Stubb-illustrasjonen. Skulle redaksjonen foretrekke fotorealisme, kan disse erstattes senere med fotografier med dokumenterte bruksrettigheter eller nyproduserte fotomontasjer.

Ingen bilder brukt her gir grunnlag for faktiske slutninger om den spesifikke domstolen, demonstrasjonen, serverinfrastrukturen eller plattformen.
