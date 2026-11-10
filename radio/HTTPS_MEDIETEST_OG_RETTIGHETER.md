# Paradisradioen – HTTPS-test av mobilavspilling og rettighetskontroll

**Dato:** 10. november 2026
**Status:** Offentlig teknisk test med syntetiske originaltoner – Vox-lyd er IKKE publisert.
**Testside:** qa/radio-media-session.html
**Forventet Pages-URL etter vellykket deploy:** https://paradispartiet.github.io/Paradisavisa/qa/radio-media-session.html

## Hvorfor en egen test?
Lokalt åpnet HTML oppfører seg ikke alltid som en HTTPS-side i iPad-Safari.
En Vox-testlydfil kan ikke legges ut på Pages før alle rettigheter er avklart.
Testsiden lager derfor to nye originaltoner direkte i nettleseren med WAV PCM
og midlertidige blob-URL-er. Ingen Vox-modell, talesyntese, privat MP3-rapport,
nyhetsopplesning, lydtjeneste eller tredjepartsinnhold brukes. Dette tester
medieknapper og låseskjerm, ikke stemmens bokmålsuttale.

## Sikkerhetskrav
- Ingen automatisk lyd; bruker må selv trykke Spill.
- En HTMLAudioElement og valgfri Media Session API med play, pause, stop, nexttrack, previoustrack.
- Ingen nettverkskall eller eksterne lydkilder; Content-Security-Policy tillater kun blob-lyd.
- Noindex, nofollow, noarchive – dette er ikke en nyhetsside.
- Ingen oppdatering av den offentlige radioen eller publiseringsporten.
- Chromium-test på 390px og 1024px bredde – IKKE fysisk iPad-godkjenning.

## Praktisk test på iPad
1. Åpne HTTPS-siden i Safari etter bekreftet Pages-deploy.
2. Trykk Spill, Pause, Spill, Neste, Forrige og Stopp.
3. Start en testlyd, lås skjermen og prøv avspilling og hodetelefonknapper.
4. Bytt app og gå tilbake. Les og kopier den lokale testloggen.
5. Rapporter iOS-versjon og eventuelle avbrudd; vi kan ikke registrere
   fysisk låseskjermtest som bestått uten en observasjon fra enheten.

## Vox-rettighetskjeden
| Komponent | Dokumentert status | Beslutning |
|---|---|---|
| Piper-motor | GPL-3.0-or-later | Gratis CI-verktøy, ikke distribuert |
| Vox-studentvekter | Utgiveren erklærer CC0 | Ikke full lisensavklaring |
| Teacher VoxCPM2 | Utgiver oppgir Apache 2.0 | Kontroller kilde/revisjon før bruk |
| NbAiLab norsk piper-trimmed | Oppgitt base, Apache 2.0-merket, delvis utilgjengelig for åpen kontroll | Uavklart |
| Talesyntese epoch 3459 | Oppgitt som checkpoint-opphav på Vox-modellkortet | Nøyaktig grunnmodellkjede uavklart |
| Lessac | Pipers lisensguide oppgir restriksjoner for kommersiell bruk av syntetisk tale | Mulig blokkering |
| Kvalitet | Positiv første lyttetest («Høres bra ut») | Krever flere uttalekontroller |
| Offentlig MP3 | publicAudioEnabled=false, PENDING/PENDING | Sperret |

Pipers lisensveiledning forklarer at datasetts CC0 ikke i seg selv klarerer
alle tidligere finjusteringssteg eller modeller. Den sier at Lessac-kjeden
kan ha kommersielle begrensninger. Vox-modellkortet oppgir det konkrete
Talesyntese-checkpointet som basemodell. Et Apache- eller CC0-merke på
den nyere avledningen er derfor ikke tilstrekkelig bevis for hele kjeden.

**Konklusjon:** Vox er fortsatt foretrukket kandidat, men offentlig
utgivelse forblir blokkert inntil modellopphav og redaksjonell uttalekvalitet
er kontrollert. En eventuell utgivelse krever separat, revidert PR med rollback.

### Kilder
- https://huggingface.co/rasmusjs/nb_NO-vox-medium
- https://huggingface.co/NbAiLab/nb-tts-norwegian-piper-trimmed
- https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md
- https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/COMMERCIAL_USE.md
