# Åtte nyhetssaker – overføring til artikkelkø
**Dato:** 2. november 2026  
**Status:** UNDER REDAKSJONELL KONTROLL / IKKE PUBLISERT

## Bakgrunn
PR #26 er tidligere merget til `main` og inneholder åtte journalistiske arbeidsmanus i `redaksjon/utkast/`. Arbeid i denne PR-en gjør neste praktiske del av prosessen: gjør sju ikke-registrerte manus til ordinære, upubliserte HTML-utkast under `utkast/2026-11-02/`, med grafiske symbolillustrasjoner og registrering i `utkast/artikler.json`.

**Den åttende saken om Meta** finnes allerede som `utkast/2026-10-28/medier-meta.html`, registrert som `medier-meta`. Ingen dublett er laget. Den nyeste Meta-analysen ligger også som arbeidsutkast i `redaksjon/utkast/2026-11-02-meta-mediehus-forfoyning.md`, og skal samordnes med den eksisterende utkastfilen ved en eventuell individuell artikkeloppdatering.

## De sju nye registrerte utkastene
| Sak | Artikkel | Bilde |
| --- | --- | --- |
| 1 | `utkast/2026-11-02/europa-protester.html` | `bilder/protester.svg` |
| 2 | `utkast/2026-11-02/binance-hacking.html` | `bilder/binance.svg` |
| 3 | `utkast/2026-11-02/trump-wsj-dom.html` | `bilder/trump-wsj.svg` |
| 4 | `utkast/2026-11-02/serbia-studentvalget.html` | `bilder/serbia.svg` |
| 5 | `utkast/2026-11-02/spania-togulykke.html` | `bilder/spania.svg` |
| 6 | `utkast/2026-11-02/israel-valget.html` | `bilder/israel.svg` |
| 9 | `utkast/2026-11-02/fiskeri-okokrim.html` | `bilder/fiskeri.svg` |

Alle nye illustrasjoner er **originale, symbolske SVG-illustrasjoner** som ikke utgir seg for å være pressebilder av personene eller hendelsene. De har ikke eksterne fotorettigheter.

## Kildekontroll som fortsatt kreves
- **Binance:** Fullstendig teknisk post-mortem; hva «95 % oppfylt» dekker; faktisk tilbakeføring av fryste midler. FBI tilskriver angrepet TraderTraitor, ikke navngitte personer.
- **Serbia:** Kontroller den endelige mandatfordelingen fra RIK mot CRTAs etter-omvalg-beregning. Ikke likestill meldinger om valgfusk med påviste lovbrudd.
- **Spania:** Offisiell havarirapport, presis tidslinje og Renfes/Adifs operative regler; ulike kilder oppgir forskjellige kollisjonstider.
- **Fiskeri:** Dokumentasjon på etterforskningen og direkte tilsvar. Det eksisterende publiserte tilsvaret fra et fiskemottaks advokat er inkludert i arbeidsmanuset; skyld er ikke avgjort.
- **Trump:** Føderal dommeravgjørelse og ankestatus.
- **Israel:** Nye opplysninger fra pågående forhandlinger før eventuell publisering.
- **Protestene:** Dokumenterte krav og organisering i Frankrike og Tyskland; unngå en udokumentert felles bevegelse.
- **Meta:** Rettens kjennelse, original avtaletekst og Metas tilsvar må fortsatt sammenholdes med eksisterende `medier-meta.html`.

## Sikkerhet og publiseringsstatus
Alle sju nye registeroppføringer har `status: "utkast"`, `faktasjekk: "kreves"`, `godkjent: false` og `publisert: false`. Meta-oppføringen er ikke endret. Ingen artikler flyttes til `artikler/`, ingen offentlig nyhetsfeed eller forside endres, og det er ikke gitt publiseringsgodkjenning.

**Merk:** `noindex` begrenser søkemotorindeksering, men gjør ikke utkast private. GitHub- og nettadresser kan være tilgjengelige for dem som kjenner dem. Avgjørelsen om å eksponere upubliserte artikler på en offentlig nettside må tas særskilt.

## Før neste steg
Vent på teknisk validering av PR-en. Hvert enkelt manus må få **journalistisk** faktakontroll og redaktørgodkjenning før publisering. `REDAKSJONSPLAN.md` forutsetter at ferdige, godkjente saker publiseres enkeltvis, ikke som en automatisk pakke.
