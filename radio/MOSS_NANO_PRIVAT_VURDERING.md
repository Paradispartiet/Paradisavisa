# Paradisradioen: MOSS-TTS-Nano – privat kandidat, ikke publisert

**Vurdert 10. november 2026.** Dette er neste tekniske stemmeprøve etter Vox. Ingen offentlig lyd eller ny spiller aktiveres.

## Dokumenterte kilder

- Norsk modell: [NbAiLab/nb-tts-norwegian-moss-nano-trimmed](https://huggingface.co/NbAiLab/nb-tts-norwegian-moss-nano-trimmed). Oppgitt Apache-2.0; beskriver finjustering på *trimmed NST* og `checkpoint-last`. Modellkortet oppgir `moss_tts_nano generate --mode continuation` for ren TTS.
- Original motor: [OpenMOSS/MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano). Omtrent 100M parametere; **den opprinnelige flerspråklige modellen oppgir ikke norsk blant sine 20 språk**. Det er NB-finjusteringen vi vil teste, ikke en tilfeldig annen Nano-modell.
- Oppgitt datakilde: [NbAiLab/NST](https://huggingface.co/datasets/NbAiLab/NST), merket Apache-2.0. Språkbanken har også [NST Norwegian Dictation 22 kHz](https://www.nb.no/sprakbanken/ressurskatalog/en/oai-nb-no-sbr-14/) med CC0; disse er **ikke dokumentert identiske med den trimmete treningsvarianten**. Ikke slå dem sammen i en rettighetspåstand.
- **Mangler:** full trenings-/speakerproveniens for akkurat modellens reviderte vekter, avhengig tokenizer-modells rettigheter, og vurdering av om syntetisert nyhetsstemme er klarert for offentlig/kommersiell distribusjon.

## Privat prøve – én kjøring, ingen nye testpaneler

Manuell GitHub Actions-jobb `radio-moss-nano-privat.yml` bruker eksisterende notisutvalg fra Vox-testen. Samme `uttaletekst` og tekst-SHA brukes slik at de to modellene kan sammenlignes. Jobben henter en **konkret Hugging Face-revisjon ved kjørestart**, laster akkurat den revisjonen, og rapporterer SHA for modellfilene, tokenizer, motor-commit, MP3, dato og uttaletekst. Dette er en *evaluering*, ikke en permanent godkjent modellås.

Prøvene lages kun ved manuell igangsetting, med CPU, uten lagrede token-hemmeligheter, uten publikums-URL, uten Pages-deploy og uten noen link fra offentlig radio. WAV normaliseres til MP3 og dekodes for teknisk validering. Kun **kryptert** lyd og rapport legges i Actions-artifakt med sju dagers retensjon; GitHub Actions-artifakter i et offentlig repo er ikke privat lagring. Før privat jobb kan kjøres, må et sterkt passord settes som GitHub Actions-secret `RADIO_MOSS_AUDIO_PASSPHRASE`, og passordet må holdes utenfor repo, logger og rapport. Kryptert utpakking skjer lokalt med `openssl enc -d -aes-256-cbc -pbkdf2 -iter 300000 -in paradisradio-moss-prive.tar.gz.enc -out radio.tar.gz -pass stdin`. Et eventuelt HF-lesetoken skal ligge som `RADIO_HF_READ_TOKEN` secret, aldri som kildekode. Ved nedlastings-/kompatibilitetsfeil skal jobben feile – aldri bytte til tilfeldig modell eller markere kvalitet/rettigheter godkjent.

**Lyttebeslutning, ikke nytt panel:** To uttaletekster fra eksisterende Vox-test, én MOSS-variant hver. Sammenlign personlig mot eksisterende Vox-prøver på tydelig østnorsk bokmål, tempo, navn, tall, trofasthet mot tekst og lydfeil. Maskinell validering er *ikke* godkjent uttale.

## Beslutningsport

`radio/release-gate.json` forblir `publicAudioEnabled=false`, `modelRightsStatus=PENDING`, `editorialAudioStatus=PENDING`. Rettighetskjeden må godkjennes for en **låst versjon**, og redaksjonell sluttlytting og faktisk fysisk iPad-/låseskjermtest må bestås før en separat produksjons-PR.

Ingen påstand om at Apache-2.0-etiketten alene gir tillatelse til alle avledede lydutgivelser. Ingen automatisk publisering, uansett testresultat.

## Faktisk kjøreresultat 10. november 2026

Første Actions-prøve: [run 42917874850](https://github.com/Paradispartiet/Paradisavisa/actions/runs/42917874850). Kodekontroll, modellmotor-checkout og CPU-installasjon passerte, men `huggingface_hub.model_info("NbAiLab/nb-tts-norwegian-moss-nano-trimmed")` svarte **HTTP 401 RepositoryNotFound/Unauthorized**. Ingen MP3 eller rapport ble generert; ingen lydartifakt ble lastet opp. Modellen kan ha endret tilgangsstatus eller kreve autentisering; søkeindeksert modellkort er ikke tilstrekkelig bevis på faktisk offentlig nedlasting. Ikke omgå en eventuell modelltilgangsbegrensning; bruk tilgang innvilget av utgiveren eller velg dokumentert tilgjengelig alternativ.

**Sikkerhetsrettelse etter kjøringen:** Vanlige Actions-artifakter fra et offentlig repo regnes ikke som private. Jobben er derfor endret til kun manuell igangsetting, krever passord i GitHub Actions-secret og laster opp bare kryptert lydpakke, aldri rå MP3. Denne nye varianten er **ikke kjørt** og har fortsatt ingen godkjent lyttetest. PR #119 forblir utkast.

## Faktisk modelltilgang – GitHub Actions 10./11. november 2026

Kjørt direkte på offentlig GitHub-runner uten token og **uten å laste ned modellvekter**. [Access-run 42925370177](https://github.com/Paradispartiet/Paradisavisa/actions/runs/42925370177):

| Modell | API/vekt-HEAD | Konsekvens |
|---|---|---|
| `NbAiLab/nb-tts-norwegian-moss-nano-trimmed` | 401 | Kan ikke produsere privat lyd |
| `NbAiLab/nb-tts-norwegian-moss-local-trimmed` | 401 | Ikke tilgjengelig som reserve uten tillatt tilgang |
| `NbAiLab/nb-tts-norwegian-voices` | 401 | Ikke tilgjengelig som reserve uten tillatt tilgang |
| `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano` | 200 ved metadata + HEAD | Tokenizer tilgjengelig; norsk syntesemodell mangler |
| `versae/nb-nst-tts` | 200 ved metadata + HEAD | Teknisk nedlastbar **annen modellfamilie**; ingen lyd produsert |

`versae/nb-nst-tts` oppgir Apache-2.0 og bokmål, men README inneholder bare lisensmetadata. `config.json` oppgir `microsoft/speecht5_tts` som base og `speaker_embedding_dim=512`: bruk krever separat valgt speaker embedding og vocoder. Treningssett, faktisk stemmeopphav og retter til den genererte stemmen er ikke dokumentert nok til offentlig radio. Modellen er **ikke** blitt automatisk valgt som fallback – den er kun identifisert som en teknisk tilgjengelig kandidat.

Den lille `model-access`-jobben kontrollerer først API-metadata og en vekt-HEAD uten å laste ned store filer. Den aktiverer **aldri** MP3 eller endrer release-gate. Privat MOSS-jobb er kun manuell og skal stoppes før tung installasjon når norsk checkpoint ikke kan hentes.
