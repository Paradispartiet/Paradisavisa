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


## PR D2 — inkrementell MP3-produksjon i lukket byggeflyt (2026-11-10)

**Status:** Automatisert intern lydgenerering. **Ikke offentlig publisert.**
Arbeidsflyt: .github/workflows/radio-lydbygg-privat.yml
Generator: scripts/radio/bygg_private_lyd.py
Låst modell: radio/model-lock.json

- Ved godkjente endringer i notiser.json på main, og på endringer i byggekoden eller manuell kjøring, kan GitHub Actions lage faktiske MP3-filer **som kortvarig upublisert Actions-artifakt**.
- Kandidatlisten fra PR D1 sammenlignes på nytt med dagens notiser.json før syntese. Dato beregnes i Oslo. Gamle/fremtidige/utgåtte notiser genereres ikke.
- Hver kandidat får stabil notis-ID og innholdshash fra uttaletekst, låst modellrevisjon og den dokumenterte synteseprofilen.
- Tidligere private lydfiler gjenbrukes bare når både innholdshash, modell/profil, filens egen SHA-256 og FFprobe-kontroll stemmer. Ved tekstendring lages ny MP3.
- Stemmemodellen lastes bare når nytt eller endret innhold krever syntese. Tilgangen låses til eksakt modellrevisjon og alle tre SHA-256.
- Den forbedrede Piper-profilen fra PR #87 brukes videre: lengdeskala 1,08; støyprofil 0,55/0,65; 220 ms mellom setningene. Dette er fortsatt en kvalitetskandidat.
- Hele utdataområdet radio-private-output inneholder bare lyd for **fortsatt aktuelle saker**, et tydelig privat manifest og **ingen offentlige audioUrl-felt**.
- Python-skriptet tillater ikke å legge resultatet i offentlig radio/-mappen eller andre nettsidekataloger. GitHub-jobben har bare lesetilgang til repoet og har ingen Pages-publiseringssteg.
- Eventuell Actions-cache er kun et byggemellomlager, ikke en historisk nyhetskatalog eller godkjent utgivelsesbevis. Produksjonspublisering må ikke stole på en PR-cache uten ny verifisering.
- Både syntesejobben og artifakten kan nås fra repoets Actions-historikk; **ikke behandle dem som konfidensielle persondata**. Kun allerede publiserte notiser behandles.

### Krav før offentlig lyd

1. Konkrete rettigheter til den norske stemmemodellen og finjusteringsgrunnlaget må avklares.
2. Prøvelytt til alle ti kvalitetsprøver (inkludert ny versjon), og dokumenter redaksjonell godkjenning.
3. Gjennomfør separat produksjons-PR som legger lyd i en kontrollert Pages-byggeartifakt og verifiserer utløp, rollback og faktisk mobilavspilling. Ingen enkeltstående endring av release-gate.json skal gjøre dette mulig.
4. Koble først deretter offentlig MP3-avspilling til den ene radiomotoren og Media Session API.

Frem til dette er gjennomført bruker publikum fortsatt nettleserens Web Speech. Det finnes ingen påstand om døgnkontinuerlig direktesending eller garantert avspilling ved låst mobil.
