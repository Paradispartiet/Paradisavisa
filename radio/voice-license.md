# Norsk radiostemme — lisens- og kildekontroll (PR C)

**Dato:** 2026-11-09  
**Status:** AVVENTER MODELLRETTIGHETS- OG LYDKVALITETSGODKJENNING  
**Bruk:** KUN INTERN LYDPILOT – IKKE PUBLISER PÅ PARADISAVISA.

## Kontrollert stemmekandidat

- Motor: [Piper fra Open Home Foundation](https://github.com/OHF-Voice/piper1-gpl), piper-tts **1.8.0**, motorlisens **GPL-3.0-or-later**. Motoren kjøres kun i GitHub Actions, ikke i nettavisens JavaScript.
- Stemme: **no_NO-talesyntese-medium**, norsk, én taler, 22 050 Hz. Modellfiler fra [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/no/no_NO/talesyntese/medium).
- [MODEL_CARD](https://huggingface.co/rhasspy/piper-voices/blob/main/no/no_NO/talesyntese/medium/MODEL_CARD) oppgir **CC0 for treningsdatasettet** (Språkbanken), og at modellen er finjustert fra engelsk lessac-medium.
- Repositoriet rhasspy/piper-voices har overordnet MIT-merke, men modellkortet har ikke en tydelig, separat lisens for **akkurat de norske modellvektene**. Datasetlisens, motorlisens og lisens for modellvekter er forskjellige forhold.

## Kvalitetsrunde 2 – tilbakemelding og tiltak (2026-11-10)

Den første teknisk gyldige Piper-prøven ble beskrevet som «litt hakkete men ok».
Det er en **foreløpig brukerobservasjon, ikke godkjenning av lydkvaliteten**.
Volum-/signalkontroll for den første sportprøven viste ca. -16,4 LUFS og -1,8 dBTP,
men utelukker ikke unaturlig rytme og prosodiske avbrudd.

Denne runden tester **én konservativ forbedringsprofil** uten å endre tekstfakta:
- Piper Python API, lengdeskala 1,08 (litt langsommere enn originalen)
- noise_scale 0,55 og noise_w_scale 0,65 (lavere variasjon)
- 0,22 sekunders setningspauser direkte i PCM uten klipping eller resampling mellom setninger
- MP3 64 kbps mono ved 22 050 Hz fra original WAV; loudnorm -16 LUFS / -1,5 dBTP
- helt fast modellrevisjon `e7229f7d33a10e145e109b886d661984201ac3c4`,
  samt SHA-256-avvikskontroll av modell, konfigurasjon og MODEL_CARD

**Sammenlign med første prøve** og evaluer særlig flyt, navn/årstall og om
setningspausene høres naturlige ut. Maskinell godkjenning er ikke en lyttegodkjenning.
Ingen gammel eller ny lyd kan publiseres før rettighetene og prøvelyttingen er godkjent.

## Beslutningsport

- [x] Kilden og modellkortet er identifisert.
- [x] Motorens GPL-lisens og datasetts CC0-status er dokumentert.
- [x] Pilotprogrammet registrerer eksakt commit-SHA og SHA-256 for ONNX, JSON og MODEL_CARD i intern rapport.
- [ ] Modellrettigheter og finjusteringsgrunnlag er særskilt avklart for offentlig radiosending.
- [ ] Minst ti eksempler er produsert og redaksjonelt prøvelyttet.
- [ ] Bokmål, stedsnavn, beløp, årstall og internasjonale navn er kvalitetsgodkjent.
- [ ] Kreditering og eventuell distribusjon av motor-/modellfiler er avklart.
- [ ] Redaktøren har godkjent overgang til PR D.

**Publiseringsregel:** Ingen lydfiler, modeller eller generator fra denne piloten legges i offentlige GitHub Pages, avisens radio-/nyhetsmanifest eller permanent main-historikk før alle beslutningspunkter er lukket. Eksisterende Web Speech beholdes.

## Gjennomføring og lydkontroller

Arbeidsflyten .github/workflows/radio-lydpilot.yml er isolert fra drift og kan kjøres på denne PR-en eller manuelt etter merge.

1. Velger **10 tidligere publiserte notiser**. Bare fortsatt aktuelle saker merkes «aktuell». Manglende prøver hentes fra arkivet og merkes **arkiv_kun_uttaletest**. Historiske saker skal aldri presenteres som dagens nyheter.
2. Bruker det redaksjonelle speechText-feltet kun ved eksplisitt godkjent overstyring. Ellers bevares publisert innhold, med konservative uttaletilpasninger.
3. Låser alle tre modellfiler til ett kilderevisjons-SHA og registrerer filhasher og motorversjon.
4. Genererer midlertidig WAV, konverterer til mono MP3 (64 kbit/s, 24 kHz) med ffmpeg loudnorm (mål -16 LUFS, true peak -1,5 dBTP, LRA 11).
5. Kontrollerer codec, varighet, filstørrelse og SHA med ffprobe. **Maskinell kontroll beviser ikke god uttale eller fravær av all klipping.**
6. Lagrer lyd og rapport som **7-dagers GitHub Actions-artifakt**, aldri som nettsider/Git-commit. 63 MB-modellen lastes bare ned i jobbens midlertidige miljø.

## Redaksjonell lyttesjekk

Lytt på alle ti MP3-filer sammen med pilot-utvalg.json.

| Område | Godkjenningskriterium |
|---|---|
| Bokmål | Naturlig forståelig norsk |
| Tall | Korrekte tallord, kronebeløp, milliard/million og prosent |
| Navn | Norske og internasjonale navn forstås |
| Trofasthet | Ingen ekstra påstander eller endrede tall |
| Rytme | Passende pauser og tempo for korte nyheter |
| Lydteknikk | Ingen hørbar skurring, klipping eller lange stillheter |
| Mobil | Prøve-MP3 spilles i relevant mobilnettleser |

Ved avvik behold dagens radio; velg eventuelt en annen dokumentert stemme. **Dette dokumentet godkjenner ikke produksjon.**

## Kilder

- [Piper motor og GPL](https://github.com/OHF-Voice/piper1-gpl)
- [Piper-CLI](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/CLI.md)
- [Stemmefiler](https://huggingface.co/rhasspy/piper-voices/tree/main/no/no_NO/talesyntese/medium)
- [Norsk modellkort og CC0-datasett](https://huggingface.co/rhasspy/piper-voices/blob/main/no/no_NO/talesyntese/medium/MODEL_CARD)
- [Piper-tts 1.8.0 på PyPI](https://pypi.org/project/piper-tts/1.8.0/)
