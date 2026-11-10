# Paradisradioen: MOSS-TTS-Nano – privat kandidat, ikke publisert

**Vurdert 10. november 2026.** Dette er neste tekniske stemmeprøve etter Vox. Ingen offentlig lyd eller ny spiller aktiveres.

## Dokumenterte kilder

- Norsk modell: [NbAiLab/nb-tts-norwegian-moss-nano-trimmed](https://huggingface.co/NbAiLab/nb-tts-norwegian-moss-nano-trimmed). Oppgitt Apache-2.0; beskriver finjustering på *trimmed NST* og `checkpoint-last`. Modellkortet oppgir `moss_tts_nano generate --mode continuation` for ren TTS.
- Original motor: [OpenMOSS/MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano). Omtrent 100M parametere; **den opprinnelige flerspråklige modellen oppgir ikke norsk blant sine 20 språk**. Det er NB-finjusteringen vi vil teste, ikke en tilfeldig annen Nano-modell.
- Oppgitt datakilde: [NbAiLab/NST](https://huggingface.co/datasets/NbAiLab/NST), merket Apache-2.0. Språkbanken har også [NST Norwegian Dictation 22 kHz](https://www.nb.no/sprakbanken/ressurskatalog/en/oai-nb-no-sbr-14/) med CC0; disse er **ikke dokumentert identiske med den trimmete treningsvarianten**. Ikke slå dem sammen i en rettighetspåstand.
- **Mangler:** full trenings-/speakerproveniens for akkurat modellens reviderte vekter, avhengig tokenizer-modells rettigheter, og vurdering av om syntetisert nyhetsstemme er klarert for offentlig/kommersiell distribusjon.

## Privat prøve – én kjøring, ingen nye testpaneler

Manuell GitHub Actions-jobb `radio-moss-nano-privat.yml` bruker eksisterende notisutvalg fra Vox-testen. Samme `uttaletekst` og tekst-SHA brukes slik at de to modellene kan sammenlignes. Jobben henter en **konkret Hugging Face-revisjon ved kjørestart**, laster akkurat den revisjonen, og rapporterer SHA for modellfilene, tokenizer, motor-commit, MP3, dato og uttaletekst. Dette er en *evaluering*, ikke en permanent godkjent modellås.

Prøvene lages kun ved manuell igangsetting, med CPU, uten lagrede token-hemmeligheter, uten publikums-URL, uten Pages-deploy og uten noen link fra offentlig radio. WAV normaliseres til MP3 og dekodes for teknisk validering. Lyd og rapport forsvinner fra Actions-artifakten etter sju dager. Ved nedlastings-/kompatibilitetsfeil skal jobben feile – aldri bytte til tilfeldig modell eller markere kvalitet/rettigheter godkjent.

**Lyttebeslutning, ikke nytt panel:** To uttaletekster fra eksisterende Vox-test, én MOSS-variant hver. Sammenlign personlig mot eksisterende Vox-prøver på tydelig østnorsk bokmål, tempo, navn, tall, trofasthet mot tekst og lydfeil. Maskinell validering er *ikke* godkjent uttale.

## Beslutningsport

`radio/release-gate.json` forblir `publicAudioEnabled=false`, `modelRightsStatus=PENDING`, `editorialAudioStatus=PENDING`. Rettighetskjeden må godkjennes for en **låst versjon**, og redaksjonell sluttlytting og faktisk fysisk iPad-/låseskjermtest må bestås før en separat produksjons-PR.

Ingen påstand om at Apache-2.0-etiketten alene gir tillatelse til alle avledede lydutgivelser. Ingen automatisk publisering, uansett testresultat.
