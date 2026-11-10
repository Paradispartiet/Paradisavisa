# Paradisradioen – beslutning om Vox-rettigheter

**Gjennomgått:** 10. november 2026  
**Beslutning:** HOLD – ingen offentlig Vox-lyd. Dette er ikke en juridisk konklusjon om ulovlighet.
**Maskinlesbart bevisregister:** `radio/vox-rights-audit.json`.

## Hva vi faktisk har funnet

1. `rasmusjs/nb_NO-vox-medium` oppgir at den er finjustert fra norsk
   `talesyntese` på `epoch=3459-step=2052250.ckpt`. Nye Vox-vekter
   er merket CC0 av utgiveren. Denne beskrivelsen gjelder oppgitt
   modellopphav; vi har ikke uavhengig verifisert hele ONNX-avledningen
   mot den opprinnelige checkpoint-filen.
2. Den eldre `rhasspy/piper-checkpoints`-historikken dokumenterer nøyaktig
   det norske checkpointet og originalt modellkort. Kortet sier eksplisitt
   at Talesyntese ble finjustert fra *U.S. English Lessac medium*.
3. Det norske talesyntese-datasettet er merket CC0. **Det gjelder ikke
   automatisk hele modellkjeden.**
4. Lessac/Voice Factory-materialet fra Blizzard 2013 har en
   forskningslisens med begrensninger på kommersiell bruk av materialet.
5. Piper sier at det **ikke selv gir modellvektlisens** og at
   rettsstatusen til avledede vekter og syntetisert lyd er uavklart.
   For kommersiell anvendelse råder prosjektet til egen rettslig vurdering.

Modellkortet for `NbAiLab/nb-tts-norwegian-piper-trimmed` har i dag et annet
modellnavn for sin eksport og merkelappen Apache-2.0. Vi skal **ikke**
behandle denne etiketten som dokumentasjon på at akkurat Vox-stammens
gamle checkpoint er trent uten Lessac eller at utgiver har rettighet
til å relisensiere alle eventuelle avledede rettigheter.

## Konsekvens for utgivelse

- Vox er fortsatt **foretrukket teknisk og redaksjonell kandidat** etter
  positiv lyttetilbakemelding. Vi har ikke valgt Normal eller Nyhetsflyt.
- Vi konkluderer **ikke** med at publisering er ulovlig i alle situasjoner;
  det krever vurdering av modell- og treningsrettigheter.
- Det finnes foreløpig **ikke positiv dokumentasjon nok for å frigjøre**
  lyd for Paradisradioen, særlig med mulig kommersiell bruk.
- `radio/release-gate.json` forblir `publicAudioEnabled=false`
  og PENDING/PENDING. `radio/vox-model-lock.json` forblir internt.
- Nettavis og eksisterende Web Speech kan brukes videre; ingen
  Vox-MP3 legges i Pages-artefakter eller offentlig repository.
- Testfilen `qa/radio-media-session.html` benytter bare originalsyntetiske
  toner for å undersøke låseskjerm-/mediekontroller på iPad.

## Hva som kan oppheve sperren

**Spor A – rettighetsklarering av samme stemme.** Dokumentert konkret
tillatelse eller juridisk avklaring som dekker akkurat modellkjeden
og genererte lydfiler ved offentlig, potensielt kommersiell radio.
Eventuelle vilkår og rettighetshavere må navngis og knyttes til filrevisjonen.

**Spor B – ny, uavhengig stemme.** En tilsvarende bokmålsstemme trent fra
bunnen av med lovlig kommersielt anvendelige data og dokumentert rett
til vekter og lyd, med egen prøvelytting av navn, årstall, tall og uttale.
Særlig viktig: samme stemmenavn er ikke nok, hasher må følge checkpoint.

**Begge spor krever deretter** produksjons-PR med plan for rollback og
bekreftet låseskjerm-/bakgrunnslyd på fysisk iPad før publisering.

## Presise spørsmål til modellutgiver / rettighetshaver

Dette er et utkast til forespørsel, **ikke sendt**:

> Vi vurderer offentlig norsk nyhetsopplesning med
> `rasmusjs/nb_NO-vox-medium`, revisjon
> `a36ead8f7c914289997e5681a6bbf1386887efab`.
> Modellkortet oppgir Talesyntese-checkpoint
> `epoch=3459-step=2052250.ckpt` som base. Dette
> checkpointets dokumentasjon sier at det ble finjustert fra
> `en_US-lessac-medium`, som er basert på Blizzard 2013-materiale.
> Kan dere dokumentere den eksakte modell-/treningskjeden,
> og eventuelle særskilte tillatelser som omfatter offentlig
> distribusjon av generert tale, også i et reklame- eller
> abonnementsfinansiert redaksjonelt produkt?
> Hvis kjeden er retrent fra bunnen av uten Lessac,
> kan dere oppgi modellrevisjon, kontrollhasher og kildebevis?

Dette skal ikke tolkes som at vi har fått noen tillatelse.

## Primærkilder

- Vox-kort: https://huggingface.co/rasmusjs/nb_NO-vox-medium
- Talesyntese-checkpoint, endring 12.6.2023: https://huggingface.co/datasets/rhasspy/piper-checkpoints/commit/5cce5725aebb1b0d3ee2d4ae2080669dee2f82c1
- Talesyntese-modellkort: https://huggingface.co/rhasspy/piper-voices/blob/main/no/no_NO/talesyntese/medium/MODEL_CARD
- Original Lessac-datalisens: https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html
- Piper lisensveiledning: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md
- Piper kommersiell oversikt: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/COMMERCIAL_USE.md
- NbAiLab trimmet norsk Piper: https://huggingface.co/NbAiLab/nb-tts-norwegian-piper-trimmed
