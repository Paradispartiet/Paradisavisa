# Paradisradioen – avsluttet teknisk tilgangskontroll av norske TTS-modeller

**Oppdatert:** 11. november 2026  
**Resultat:** Tilgangs- og sikkerhetskontrollen er ferdig. **Ingen ny radiostemme er godkjent, ingen ny MP3 er generert og offentlig lyd er AV.**

## Hva ble prøvd?

Den første private MOSS-lydjobben i PR #119 gjennomførte CPU-installasjon og sperretester, men feilet på modellhenting med **HTTP 401**. [Actions-kjøring 42917874850](https://github.com/Paradispartiet/Paradisavisa/actions/runs/42917874850). Lydfil ble ikke laget.

Vi forsøkte deretter *bare* offentlig Hugging Face-API og en HTTP HEAD på en oppgitt modellfil. Det er **ikke** en full nedlasting, lisensklarering eller lydkvalitetstest. [Siste bekreftede tilgangskjøring 42925370177](https://github.com/Paradispartiet/Paradisavisa/actions/runs/42925370177).

| Referanse | Tilgang fra anonym GitHub Actions-runner | Konklusjon |
|---|---|---|
| `NbAiLab/nb-tts-norwegian-moss-nano-trimmed` | HTTP 401 | Kan ikke brukes som testmodell uten verifisert adgang |
| `NbAiLab/nb-tts-norwegian-moss-local-trimmed` | HTTP 401 | Ikke teknisk tilgjengelig fra anonym jobb |
| `NbAiLab/nb-tts-norwegian-voices` | HTTP 401 | Ikke teknisk tilgjengelig fra anonym jobb |
| `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano` | HTTP 200 ved API + vekt-HEAD | Bare tokenizer; er ikke norsk stemme |
| `versae/nb-nst-tts` | HTTP 200 ved API + vekt-HEAD | Tilgjengelig for videre teknisk vurdering, **ikke rettighetsklarert** |

NB MOSS-Nano-kortet er offentlig søkbart og merket Apache-2.0, men direkte API henting svarte 401. Status sier derfor **tilgang ikke bekreftet**, ikke at bruk er ulovlig. Modellkortet viser en norsk finjustering på *trimmed NST*-data, men lisensklarering av treningsdata, stemmemateriale og generert lyd må dokumenteres for eksakt vektsett før offentlig radio.

## Hvorfor ikke bare bytte til SpeechT5?

[versae/nb-nst-tts](https://huggingface.co/versae/nb-nst-tts) oppgir Apache-2.0 og norsk bokmål, men modellkortet inneholder knapt mer enn lisensmetadata. Det navngir ikke dokumentert treningsdatasett, talerettigheter eller godkjent syntetisk stemme til offentlig/potensielt kommersiell bruk. SpeechT5 krever også passende vokoder og speaker embedding. Vi skal **ikke** skifte modell automatisk eller betrakte HTTP 200 som en rettighetsavgjørelse.

## Hva som faktisk er ferdig og kan merges

- `scripts/radio/probe_moss_access.py` kontrollerer offentlig metadata og en vekt-HEAD uten token, nedlasting av vekter, lydgenerering eller publisering. Alle svar rapporteres som tilgjengelighet, **aldri** som rettighet/lydkvalitet.
- `scripts/radio/test_probe_moss_access.py` tester forventet 200, blokkert 401/403, gated, ugyldig revisjon og at både norsk modell og tokenizer kreves.
- `.github/workflows/radio-moss-tilgang.yml` kjører disse testene, verifiserer uendret `release-gate.json` og skriver oversikt til Actions-sammendraget.
- Den gamle utestede MOSS-lydgeneratoren og private lydjobben fra utkastet er **fjernet fra PR-en** i stedet for å merge uverifisert syntesekode.

Dette er en ferdig avgrenset **kilde- og tilgangskontroll**, ikke en ferdig MP3-nyhetsradio. Kontrollen krever ingen betalt konto eller hemmelig token og kan brukes ved ny modellkandidat senere.

## Publiseringssperren

`radio/release-gate.json` skal fortsatt ha:
- `publicAudioEnabled=false`
- `modelRightsStatus=PENDING`
- `editorialAudioStatus=PENDING`

Den positivt prøvelyttede Vox-stemmen kan ikke offentliggjøres uten særskilt avklaring av Talesyntese/Lessac-kjeden. Se [VOX_RETTIGHETSSTATUS.md](VOX_RETTIGHETSSTATUS.md). Den eksisterende Web Speech-avspillingen påvirkes ikke.

**For å starte offentlig MP3 senere** må vi ha en faktisk nedlastbar/låst norsk stemme med dokumentert rett til modellvekter *og genererte lydutgivelser*, godkjent prøveuttale av navn og tall, sikker distribusjon og en fysisk låseskjerm-/bakgrunnstest på iPad, fulgt av særskilt produksjons-PR. Inntil da forblir offentlig MP3 deaktivert.

## Primærkilder

- [NB norsk MOSS-Nano](https://huggingface.co/NbAiLab/nb-tts-norwegian-moss-nano-trimmed)
- [OpenMOSS MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano)
- [NB Norwegian Voices](https://huggingface.co/NbAiLab/nb-tts-norwegian-voices)
- [versae/nb-nst-tts](https://huggingface.co/versae/nb-nst-tts)
- [Hugging Face SpeechT5-oppsett](https://huggingface.co/blog/speecht5)
