# Paradisradioen — ny bokmålsstemme, intern Vox-test (10.11.2026)

**Status:** POSITIV FØRSTE LYTTETILBAKEMELDING – fortsatt IKKE godkjent for offentlig MP3. Offentlig radio bruker uendret Web Speech.

## Lyttervurdering – 10. november 2026

Etter avspilling av de fire Vox-prøvene i lyttepanelet har lytteren meldt
**«Høres bra ut»**. Dette er en positiv kvalitetsvurdering av
`nb_NO-vox-medium`, i kontrast til NVCC KNN/MNN som ble avvist.
Det er ikke angitt hvilken av de to profilene – **Normal** eller
**Nyhetsflyt** – som foretrekkes. Vi velger derfor ikke profil på
bakgrunn av en antagelse.

**Vurderingsstatus:** Stemmen beholdes som førstevalg for videre utvikling.
Den positive tilbakemeldingen er ikke en full redaksjonell godkjenning av alle
navn, tall, uttaler og lyttemiljøer; dette krever egen sluttkontroll.
Den offentlige lydporten `radio/release-gate.json` skal fortsatt være
`publicAudioEnabled: false`, `modelRightsStatus: PENDING` og
`editorialAudioStatus: PENDING`.

**Prioritert arbeid:** Sammenlign Normal/Nyhetsflyt på navn og beløp,
avklar modellvektenes arv fra Talesyntese/Lessac og treningsdataene,
og test sikker mobil-/låseskjermavspilling i en separat PR med rollback.
Ikke bytt offentlig stemme på grunnlag av denne tilbakemeldingen alene.

**Siste redaksjonelle avgjørelse:** NVCC KNN og MNN avvist som snøvlete og uønsket dialekt.

## Hvorfor denne modellen?

[rasmusjs/nb_NO-vox-medium](https://huggingface.co/rasmusjs/nb_NO-vox-medium)
er en liten Piper-stemme for norsk bokmål med VoxCPM2-basert syntetisk taletrening.
Utgiveren oppgir 63,5 MB modell, 22 050 Hz, og tester på navn, datoer og årstall.
Modellkortet oppgir ca. 12,5 % ordfeilrate på 100 holdte norske Wikipedia-setninger,
men dette er **utgiverens evalueringsresultat, ikke vår test av stemmekvaliteten**.

Dette er mest realistisk å kjøre gratis på GitHub Actions av de undersøkte
modellene. Stemmen er ikke lyttet til av redaksjonen ennå.

## Rettigheter – to nivåer må skilles

- Utgiveren har merket sine finjusterte vekter **CC0 1.0** og oppgir at syntetisk
  tale kan brukes kommersielt.
- Stemmen bygger på en eldre norsk Talesyntese-grunnmodell, finjustert med lyd
  fra VoxCPM2. Det er **ikke dokumentert her at alle underliggende modellarv-
  og output-rettigheter er avklart**, særlig ettersom Talesyntese-stemmen i vår
  forrige pilot ble sporet til Lessac.
- Datasettene som ligger bak teksttreningen har forskjellige lisenser, blant
  annet CC BY-SA og CC BY. Utgiveren distribuerer ikke disse lyd-/tekstfilene,
  men rettighetene skal fortsatt vurderes før offentlig radiobruk.
- Piper-motoren GPL-3.0-or-later kjøres kun privat som byggeverktøy.

**Beslutning:** Kan prøvelyttes privat. Offentlig publisering må fortsatt stoppe
på release-gate.json (publicAudioEnabled=false). Et lisensmerke alene gjør
ikke stemmens lyd eller underliggende rettighetskjede godkjent.

## Privat sammenligning

Test: to kildekontrollerte, allerede publiserte notiser. Om nødvendig
hentes tidligere publiserte notiser fra arkivet, og de markeres tydelig
som **arkiv_kun_uttaletest**, aldri som ferske nyheter.

For hver notis lages to MP3-filer:

| Profil | Syntese | Hensikt |
|---|---|---|
| normal | length_scale 1,0, pause 0 s | Grunnstemmens naturlige rytme |
| nyhetsflyt | length_scale 1,02, pause 0,12 s | Litt roligere og tydeligere nyhetsrytme |

Begge bruker samme modell og samme godkjente nyhetstekst. Pilotjobben
registrerer modellens eksakte Hugging Face-revisjon og SHA-256 for
ONNX-/JSON-/README-filer og kontrollerer alle MP3-ene ved full dekoding.
Ingen WAV eller modellfil publiseres i Git.

### Kriterier før vi går videre

- [x] Modellen kjører teknisk og produserer fire MP3-prøver uten avbrudd.
- [ ] Brukerprøvelytting: nøytral, forståelig norsk bokmålsuttale.
- [ ] Ingen snøvling, unaturlig dialektprofil, hakkete overgang eller
      feil i navn, årstall, prosent og kronebeløp.
- [ ] Godkjenningsgrunnlag for modellvekter og grunnmodell er gjennomgått.
- [ ] Ingen lydfiler eller manifest publisert på GitHub Pages.
- [ ] Separat PR for offentlig opplesning med mobiltest og rollback.

## Andre aktuelle modeller

- [versae/nb-nst-tts](https://huggingface.co/versae/nb-nst-tts) oppgir
  Apache-2.0, men SpeechT5 trenger en separat vocoder og
  speaker embeddings. Modellkortet har knapt dokumentasjon, så
  den er ikke et dokumentert kvalitetsvalg ennå.
- [NbAiLab/nb-tts-norwegian-voices](https://huggingface.co/NbAiLab/nb-tts-norwegian-voices)
  fra Nasjonalbibliotekets AI-lab har to norske stemmer og Apache 2.0,
  men er basert på et langt tyngre MOSS-TTS-oppsett med egen kode.
  Aktuell for neste forsøk hvis ingen lettvektsstemme blir godkjent.
- [heiertech/Prat-9B](https://huggingface.co/heiertech/Prat-9B) hevder Oslo-
  profil, men er en 9B-modell i forhåndsversjon. Ikke praktisk
  som førstevalg på gratis GitHub Actions-CPU.

**Sikkerhet:** Koden i scripts/radio/generer_vox_prover.py endrer
ingen produksjonssider, radioens spiller eller release-gate.json.
Lyd blir kun private test-artifakter med sju dagers retensjon.

## Offline lyttepanel for iPad – 10. november

For å unngå feil ved åpning av individuelle MP3-lenker produseres nå i tillegg
**`lyttepanel.html`** med alle de fire lydprøvene innebygd (Base64/data-URI).
HTML-filen kan åpnes separat lokalt i en nettleser, uten GitHub-innlogging,
servertilgang eller nye lydnedlastinger. Den inneholder tekst for hver prøve,
Normal/Nyhetsflyt-kontroller og pause av øvrige klipp når et nytt startes.

Lyttepanel-scriptet `scripts/radio/lag_lyttepanel.py` godtar bare
upublisert, ikke-godkjent pilotrapport, verifiserer lydfilenes SHA-256,
forbyr katalogtraversering og har filstørrelsesgrense. MP3-data skrives bare
i **privat GitHub Actions-artifakt**, ikke inn i GitHub Pages-koden.

Dette **løser ikke stemmekvalitet eller lisensavklaring**: menneskelig
prøvelytting og rettighetskontroll gjenstår før noen modell velges.
