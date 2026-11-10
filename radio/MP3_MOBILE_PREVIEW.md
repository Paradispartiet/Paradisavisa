# Paradisradioen – privat MP3- og Media Session-motor

**Dato:** 10. november 2026  
**Status:** Isolert spillermotor, ikke aktivert på den offentlige radiosiden.  
**Implementasjon:** scripts/radio/mp3_preview_player.cjs  
**Tester:** scripts/radio/mp3_preview_player.test.cjs

## Implementert

- Godtar bare D2-manifest UNPUBLISHED_INTERNAL_AUDIO_ONLY med privateCandidateOnly=true og publicPlayable=false.
- Krever en stengt release-gate: publicAudioEnabled=false, og både modell- og redaksjonsgodkjenning PENDING.
- Spiller aldri lyd ved innlasting. play() må kalles eksplisitt fra en brukerhandling i separat testflate.
- Godtar kun relative MP3-baner lyd/hash.mp3, og avviser audioUrl, dubletter og katalogtraversering.
- Stopper gamle, fremtidige og utgåtte notiser. Kontrollerer Oslo-dato før avspilling og ved tidsoppdatering.
- Bruker én HTMLAudioElement for start, pause, stopp og automatisk neste/forrige.
- Knytter valgfritt Media Session til play, pause, stop, nexttrack, previoustrack og metadata.
- Feil i lydfil/avspilling stopper den private motoren; offentlig Web Speech-radio endres ikke.

## Testavgrensning

Node-testene simulerer HTMLAudioElement og Media Session. De tester
autoplay-sperre, utløp, dato over midnatt, navigasjon, feil, metadata,
ugyldige manifest og opprettholdt publiseringssperre.
**Dette er ikke en faktisk test av lyd på låst iPad.**

Koden er ikke importert av den offentlige paradisradio.html eller script.js.
Ingen MP3-filer publiseres, og ingen produksjonsstemmer er godkjent.

## Sjekkliste før produksjon

- [ ] Test på faktisk iPad med låseskjerm og i Safari samt Android Chrome.
- [ ] Kontroller avspillingsstart fra brukertrykk, pause, stopp, neste/forrige.
- [ ] Kontroller låseskjerm/hodetelefonknapper, fanebytte og lydavbrudd.
- [ ] Test nettverksbrudd, lydfeil, utløp og fall tilbake til Web Speech.
- [ ] Gjennomfør sluttlytting av norske navn, årstall og kronebeløp.
- [ ] Avklar rettighetene til akkurat Vox-modellen og dens checkpoint-opphav.
- [ ] Publiser kun gjennom en separat, kontrollert Pages-PR med rollback.

## Oppdatert stemmekjede og rettigheter

Utgiverens [Vox-modellkort](https://huggingface.co/rasmusjs/nb_NO-vox-medium)
oppgir CC0 1.0 for den distribuerte finjusteringen og angir
NbAiLab/nb-tts-norwegian-piper-trimmed som basis.
[Base-modellens kort](https://huggingface.co/NbAiLab/nb-tts-norwegian-piper-trimmed)
er merket Apache-2.0, men gir ikke dokumentasjon nok til å avklare
modellens fullstendige avledningshistorie. Det opprinnelige
[Talesyntese-kortet](https://huggingface.co/rhasspy/piper-voices/blob/main/no/no_NO/talesyntese/medium/MODEL_CARD)
oppgir at den stammen fra Lessac. Vi må verifisere om den eksakte
checkpointen arver disse restriksjonene. Inntil da: PENDING.

## Teknisk dokumentasjon

- [MDN Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)
- [MDN setActionHandler](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler)

Nettleserstøtte er ikke garanti for bakgrunnslyd: funksjonen må testes i virkeligheten.


## Mobiltest – 10. november 2026

Det nye skriptet scripts/radio/lag_mobil_lyttepanel.py bygger en **privat
offline HTML-side** med de fire upubliserte Vox-lydprøvene innebygd.
Den bruker én HTMLAudioElement med store Spill/Pause/Stopp/Neste/Forrige-
kontroller. Den forsøker også Media Session-handlingene for låseskjerm,
hodetelefoner og medietaster der dette er tilgjengelig.

- Ingen avspilling før brukertrykk; ingen offentlige MP3-lenker.
- Lokal testlogg viser knapper, mediehandlinger, skjermsynlighet og feil.
- Siden opplyser om Media Session og sikker kontekst finnes på enheten.
- Eksisterende lydrapport, SHA-256, rettighetsflagg og trygge filbaner
  må valideres før HTML med lyd kan genereres.
- Dette er historiske **stemmeprøver**, ikke dagsferske radiosaker.

### Slik kontrolleres den på faktisk iPad

1. Last ned Actions-artifakten med ipad-mobiltest.html og åpne HTML-filen
   i Safari der dette er mulig. Filer-appen kan åpne en begrenset forhåndsvisning.
2. Trykk Spill, Pause, Spill, Neste og Forrige. Kontroller at kun én lyd går.
3. Lås skjermen under avspilling, og prøv låseskjerm- og hodetelefonknapper.
4. Åpne igjen, sjekk om Media Session og sikker kontekst var tilgjengelige,
   og kopier eller les loggen.
5. Hvis dette ikke virker som lokal fil, kan det skyldes filviseren; en
   faktisk HTTPS-test krever separat, rettighetsgodkjent staging.

Den positive første lytteprøven for Vox beholdes som kandidat. Modellkortet
oppgir CC0 for vektene, og basemodellen NbAiLab/nb-tts-norwegian-piper-trimmed
er merket Apache 2.0, men fullstendige rettigheter til modellstammen
er fortsatt ikke tilstrekkelig dokumentert. Offentlig MP3 forblir sperret.
