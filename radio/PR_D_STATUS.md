# PR D — automatisk lydplan, første leveranse (2026-11-10)

**Status:** Grunnmur levert. Offentlig lydproduksjon og distribusjon er fortsatt BLOKKERT.

## Hva er satt opp?

Ved endringer i den publiserte kilden notiser.json på main (eller manuell workflow_dispatch) kjører GitHub Actions:

- Leser kildekontrollerte notiser fra samme fil som nettavisa bruker.
- Validerer kategori, tekst, dato, HTTPS-kilde og eventuelt redaksjonelt speechText.
- Tar bare med notiser som fortsatt er aktuelle **på norsk lokal dato** (Europe/Oslo), maks syv kalenderdager og eventuelt kortere ved expires.
- Lager stabile notis-ID-er fra kategori/dato/kilde. Endringer i uttaletekst gir ny **contentHash** og nytt filnavn for lyden, men beholder samme ID.
- Bruker låst stemmerevisjon og versjonert kvalitetsprofil, slik at skifte av stemme eller synteseoppsett gir nye lydfiler.
- Produserer bare **privat kandidatliste** (radio-kandidat/manifest.json) lagret som GitHub Actions-artifakt i syv dager.
- Tester at offentlig lydpublisering IKKE kan kjøres med denne arbeidsflyten.

**Hva er ikke gjort?** Ingen automatisk offentlig MP3-produksjon, ingen egen radiostrøm, ingen endringer i Paradisradioens offentlige spilleliste, ingen garanti om bakgrunnsspilling på mobil.

## Sikkerhetsport

Regelsettet er i radio/release-gate.json. Begge rettighets- og lydkvalitetskontroller er PENDING og publicAudioEnabled er false. Selv om en feilaktig bruker endrer flaggene, vil planlegg_lyd.py fortsatt bare lage et privat ikke-spillbart kandidatskjema. Parameteren --publish avslås alltid.

Frigivelse krever **egen PR med rettighetsbevis, redaksjonell prøvelytting, mobiltest, faktisk oppsett av lydpublisering og rollback**. Ikke aktiver dette bare ved å endre ett flagg.

## Anbefalte neste handlinger

1. Sammenlign lyden fra PR #83 og PR #87. Godkjenn eller avvis stemmekvaliteten.
2. Avklar spesifikt om norsk Piper-modell og finjusteringsgrunnlaget tillater offentlig generert lyd, eller velg en tydelig lisensiert alternativ stemme.
3. Lag og test selve endringsbaserte lydgeneratoren: bare for dagens notiser og godkjente uttaletekster; aldri hent fra arkivet.
4. Publiser lyd gjennom en isolert GitHub Pages-artefakt med rollback og tester – uten å legge hundrevis av MP3-er i Git-historikken.
5. Først da kobles ferdig lyd til radiospillerens Media Session-kontroller.

**Lavkost-prinsipp:** Denne leveransen bruker bare standard Python i én liten Actions-jobb. Den installerer ikke Piper eller laster ned modellen for hver notisendring. Dermed unngår vi å bruke gratis Actions-tid unødvendig før publiseringsporten er åpnet.
