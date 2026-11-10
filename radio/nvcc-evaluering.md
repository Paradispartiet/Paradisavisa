# Norsk stemmesammenligning – NVCC (10. november 2026)

**Status:** Privat A/B-lydpilot. **IKKE redaksjonelt godkjent for publisering.**

## Hvorfor prøve NVCC?

Den eksisterende Piper-stemmen no_NO-talesyntese-medium er finjustert fra
Lessac og har uavklarte rettigheter for en offentlig, mulig kommersiell radiosending.
Piper-prosjektets oversikt
[Commercial use](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/COMMERCIAL_USE.md)
lister **no_NO-nvcc-medium** blant stemmene trent fra bunnen av med CC0-datasett.
Den distribuerte stemmens
[MODEL_CARD](https://huggingface.co/rhasspy/piper-voices/blob/main/no/no_NO/nvcc/medium/MODEL_CARD)
oppgir *License: CC0* for datasettet og *Trained from scratch*.

**Forbehold:** Piper sier eksplisitt at prosjektet **ikke** gir lisens til modellvektene.
Lisens for treningsdata er ikke i seg selv en ubetinget modell-lisens, og Piper
fremhever juridisk usikkerhet omkring trening og avledede verk.
Den eldre checkpoint-siden kan beskrive annet treningsgrunnlag enn det distribuerte
ONNX-modellkortet; derfor skal **akkurat nedlastet revisjon og filhasher**
kontrolleres. Ikke endre radio/release-gate.json før både rettigheter og lyd er
tilstrekkelig dokumentert.

## Hva vi tester

Kilde: bare allerede publiserte notiser fra notiser.json,
eller eksplisitt merkede tidligere publiserte arkivnotiser ved mangel på ferske.
Modellrevisjon: e7229f7d33a10e145e109b886d661984201ac3c4.
Tre ulike notiser × to av modellens dokumenterte stemme-ID-er:

| Prøvegruppe | NVCC-ID | Beskrivelse |
|---|---|---|
| KNN | 0 | Modellens egen taler-kode |
| MNN | 4 | Modellens egen taler-kode |

Dette er tekniske taler-ID-er; vi tillegger dem ikke en påstått personidentitet.
Både kategori/nyhetstekst og kildeklasse/lydhash rapporteres.

Profilen tester litt jevnere uttale enn den gamle lydpiloten:
lengdeskala 1,04, noise_scale 0,60, noise_w_scale 0,68 og 0,17 s pause
mellom modellens setningschunker. Komprimert mono MP3, 64 kbit/s, 22 050 Hz,
-16 LUFS/-1,5 dBTP-mål. Ingen automatisk tekstomskriving; bare konservativt
formatfilter og eksisterende, eksplisitt redaksjonell speechText.

### Akseptkrav

- [ ] Dokumentert modellkort, eksakt kildecommit og SHA-256 for tre stemmefiler
- [ ] Seks gyldige dekodbare MP3-prøver, med kontrollert varighet og bitrate
- [ ] Ingen automatisk lyd ved åpning, ingen utgåtte notiser som ferske nyheter
- [ ] Ingen lydfil, modell eller privat rapport publisert på Pages
- [ ] Lyttestemmer vurdert for flyt, navn, årstall, beløp og forståelig norsk
- [ ] Separat rettighetsvurdering av akkurat den distribuerte modellen
- [ ] Eventuelt ny produksjons-PR med modellbytte, kontroller, rollback og offentlig mobiltest

**Testarbeidsflyt:** .github/workflows/radio-nvcc-prover.yml.
Kun GitHub Actions-artifakt med 7 dagers retensjon.
Den eksisterende opplesningen for publikum forblir uendret.

## Kilder

- https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md
- https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/COMMERCIAL_USE.md
- https://huggingface.co/rhasspy/piper-voices/blob/main/no/no_NO/nvcc/medium/MODEL_CARD
- https://huggingface.co/rhasspy/piper-voices/commit/c779b243504780560121eb5200f135b4830e6603
