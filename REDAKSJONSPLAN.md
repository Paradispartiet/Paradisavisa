# Paradisavisa – fortløpende redaksjonell publisering

**Motto: «Objektivt sett, fra vår synsvinkel.»**

## Slik skal avisa fungere

**Vi publiserer hver artikkel fortløpende når den er ferdig, dokumentert og godkjent.** Det finnes ingen mandags-, onsdags- eller fredagsutgaver, ingen faste slippetider og ingen plikt til å vente på andre artikler.

Nyhetshjulene på forsiden oppdateres når en enkelt sak publiseres. De viser faktiske publiseringsdatoer, og tidligere artikler beholdes som arkivstoff. Ikke gi eldre tekst ny dato bare fordi siden bygges om.

Paradisavisa er en selvstendig nettavis, ikke et partiorgan. Stoffvalg kan ha et gjenkjennelig redaksjonelt blikk, men nyheter skal bygge på etterprøvbare fakta – ikke på Paradispartiets standpunkter. Kommentarer, analyser og debattinnlegg merkes tydelig.

## Løpende arbeidsflyt – én sak om gangen

1. **Finn en reell nyhet.** Følg utviklingen i relevante primærkilder og flere redaktørstyrte medier. Prioriter etter vesentlighet, relevans og dokumentasjon.
2. **Lag ett utkast.** Skriv presis overskrift, dekkende ingress og forklarende hovedtekst i Paradisavisas stil. Oppgi kildegrunnlaget og skill mellom hva som er bekreftet, omstridt og uavklart.
3. **Kontroller kilder.** Les originalrapporter, vedtak, regnskap og pressemeldinger. Suppler med uavhengige kilder og relevante motforestillinger; gi omtalte parter mulighet til å svare på alvorlig kritikk.
4. **Lag bilde.** Bruk eget eller lovlig lisensiert bilde. Originale/AI-genererte illustrasjoner merkes som **Illustrasjon**, ikke dokumentarfotografi. Ikke oppfinn intervjuer eller beskrivelser fra en hendelse vi ikke har observert.
5. **Sjekk ferskhet.** Før publisering må datoer, sakens status, tall og eventuelle nye hendelser kontrolleres på nytt. Særlig konsertomtaler, domstolsavgjørelser og planlagte rapporter kan bli utdatert raskt.
6. **Godkjenn enkeltvis.** Kontroller kvalitet, kildehenvisninger, bildebruk, balanse, tittel og korrektur for akkurat den saken. Ingen annen artikkel må være ferdig først.
7. **Publiser én sak.** Etter uttrykkelig redaksjonell beslutning flyttes den godkjente artikkelen fra `utkast/` til `artikler/`. Bruk reelle lenker til bilder og CSS. Oppgi faktisk publiseringsdato i relevant JSON-strøm (`Nyhetshjul.json`, `Kulturhjul.json` osv.). Ikke publiser et helt mappesett samlet.
8. **Følg opp.** Korriger feil åpent, merk vesentlige endringer og dater oppdateringer. Arkivstoff skal ikke framstå som nytt.

## Redaksjonell arbeidskø

- `utkast/artikler.json` er **den ene oversikten** over de individuelle utkastene. Den inneholder tittel, kategori, filbane, bilde, arbeidsmappens dato, status, faktasjekk og godkjenning.
- `utkast/index.html` viser denne artikkelkøen med søk, aktive og arkiverte tekster og kontrollstatus. Den er `noindex` og er **ikke** en offentlig avisforside eller en publiseringsknapp.
- Eksisterende arbeidsmapper `utkast/2026-10-28/`, `utkast/2026-10-30/` og `utkast/2026-11-02/` beholdes fordi de inneholder artikler, illustrasjoner og kilder. **Dato i mappen er ikke en utgave- eller publiseringsdato.**
- Den eldre Ibsen-teksten er merket arkivert, men ikke slettet. Andre artikler står som aktive utkast. Ingen av dem har automatisk publiseringsgodkjenning.

Et utkast kan ha disse statusene: `utkast` (under arbeid), `arkivert` (ikke prioritert), `godkjent` (redaksjonelt klar) og `publisert` (lagt ut). Status og publisering må stemme med faktiske filer; oppdater aldri `publisert` uten å gjennomføre publiseringen.

**Praktisk eksempel:** Hvis Meta-saken er faktasjekket klokken 10.15, kan den publiseres da. Kulturstoffet trenger ikke være ferdig, og ingen annen utgave må «komme ut» samme dag.

## Sikker klargjøring av en godkjent artikkel

Skriptet `scripts/publiser-artikkel.cjs` klargjør **én** artikkel i en lokal arbeidskopi. Det publiserer **ikke** automatisk på GitHub og kjører aldri over alle utkast.

1. Gjør ferdig journalistisk faktakontroll og korrektur. Ingen metadataflagg kan erstatte dette arbeidet.
2. Godkjenn individuelt i `utkast/artikler.json`: `status: "godkjent"`, `godkjent: true`, `faktasjekk: "godkjent"`. De øvrige sakene skal beholde sine statuser.
3. Se planen uten endringer: `node scripts/publiser-artikkel.cjs <artikkel-id> 2026-11-02`. Bruk riktig faktisk publiseringsdato.
4. Klargjør bare denne saken: `node scripts/publiser-artikkel.cjs <artikkel-id> 2026-11-02 --publiser`.
5. Kontroller de nye filene i `artikler/` og `Bilder/Artikler/`, samt den relevante JSON-strømmen og artikkelkøen. Skriptet oppdaterer lenker, dato, illustrasjon og synlig kildeoversikt.
6. Kontroller `node scripts/valider-artikler.cjs` og nettleservisning. Commit og merge/publisering må fortsatt skje som en eksplisitt handling.

**Sperrer:** Skriptet avviser ukontrollerte utkast, tidligere publiserte saker, ugyldige datoer, dupliserte artikler og direkte lenker til andre upubliserte artikkelutkast. Samtidig publisering av flere saker er ikke nødvendig.

## Spesielle oppfølgingspunkter i eksisterende utkast

- **Helsereformutvalget:** Rapporten er varslet 2. november 2026 kl. 11.00. Den forberedte bakgrunnsteksten må kontrolleres etter offentliggjøringen før den eventuelt omtaler konklusjoner. Kilde: https://www.regjeringen.no/no/aktuelt/helsereformutvalet-legg-fram-si-utgreiing/id3178280/
- **Prosjekt X:** Skill opplevd bedre samarbeid fra uavhengig dokumenterte resultater og politiske vedtak. Suppler med partenes vurderinger der det er relevant.
- **Meta:** Kontroller siste rettslige status og eventuelle uttalelser fra begge parter.
- **Kultur:** Kontroller program, billetter og om arrangementet har funnet sted; en forhåndsomtale blir ikke automatisk en anmeldelse.
- **Beredskap og cyberrisiko:** Oppgi datoen for myndighetenes varsel og skill mulige risikoer fra dokumenterte hendelser.

## Teknisk kontroll

- Kjør `node scripts/valider-artikler.cjs`. Den kontrollerer nå **enkeltartikler** i `utkast/artikler.json`, lenker, bildebaner, kildeavsnitt, utkastmerking, farger og at upubliserte sider ikke finnes i offentlige JSON-strømmer.
- `scripts/visuell-sjekk.cjs` kjører en faktisk Chromium-kontroll av mobil/PC, stor klassisk avisoverskrift, diskret meny, nyhetshjul og søkbar artikkelkø.
- GitHub Actions lagrer testresultater og skjermbilder. Et godkjent testresultat bekrefter tekniske forhold – **ikke** at teksten er journalistisk faktasjekket.
- Inntil den enkelte sak er godkjent skal artikkelen ligge som tydelig merket utkast med `noindex`.

Det er aldri nødvendig å vente til en bestemt ukedag for å publisere en ferdig, kontrollert artikkel.
