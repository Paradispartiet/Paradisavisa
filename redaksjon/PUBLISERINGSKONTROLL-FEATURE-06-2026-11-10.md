# Separat redaksjonell publiseringskontroll – feature-06-bankene

**Sak:** Bankene tjener milliarder – hvem betaler?  
**Forberedt 10. november 2026**  
**Beslutning:** **IKKE GODKJENT FOR MERGE ELLER PUBLISERING.**

Denne grenen viser hvordan *bare denne artikkelen* ville se ut etter publisering. Den endrer kun én artikkelside, ett Feature-kort og den ene artikkelstatusen. Verdiene `godkjent=true` og `publisert=true` er kun en foreslått sluttstatus **på grenen**, ikke en bekreftelse på godkjenning. `main` skal beholdes uendret fram til en separat redaktørbeslutning.

## Kandidat
- Artikkelside: `artikler/2026-11-10-bankene-tjener-milliarder.html`
- Artikkelkø-ID: `feature-06-bankene`
- Hovedbilde: `Bilder/Artikler/feature06-bankene-hovedbilde-2026.webp`
- Sekundærbilde: `Bilder/Artikler/feature06-bankene-sekundaerillustrasjon-2026.webp`
- Feature-feed: nøyaktig ett nytt kort, ingen dubletter

## Åpne redaksjonelle forhold
Forbrukerrådets e-post er bakgrunn, ikke et sitat. Den offisielle rapporten *Bytteundersøkelsen 2026* oppgir feltarbeid 20. januar–7. februar **2025** samtidig som den omtaler bytteaktivitet gjennom kalenderåret 2025. Denne datokonflikten kan ikke løses ved antakelse: de tilhørende prosentsatsene er derfor fjernet fra **publiseringskandidaten**, men original rapport er fortsatt oppført i kildene. Den direkte metodeavklaringen er ikke mottatt, og oppfølgingsutkastet til Forbrukerrådet er ennå ikke sendt. DNB har bedt om informasjon om avisa; svarutkastet er heller ikke sendt. SSBs offentlige bankstatistikk og Finans Norges bransjesvar er innarbeidet.

## Sjekkliste før godkjenning
1. Bekreft faktapåstander og kilde-/sitatetikk, og innarbeid vesentlige nye kildesvar hvis de foreligger.
2. Utfør menneskelig visuell kontroll av begge originale KI-illustrasjoner i desktop- og mobilutsnitt, alt-tekst og bildetekst.
3. Oppdater `2026-11-10` i URL, HTML-publiseringsmetadata, feed, artikkelkø og kildebeskrivelse til **faktisk publiseringsdato** hvis utgivelse skjer senere.
4. Godkjenn **denne saken separat**. Et grønt CI-resultat er ikke en redaksjonell godkjenning.
5. Etter eksplisitt godkjenning: kontroller at den andre Feature-artikkelen ikke blir merget ved et uhell. Hvis en av de to PR-ene merges først, synkroniser den andres branch med nyeste `main` før videreføring.
6. Etter faktisk merge: test offentlig URL, forsidekort, delingsbilde og mobilvisning. Dokumenter eventuell feil og tilbakerulling.

**MERK:** Ikke send de to eksisterende oppfølgingsutkastene i Gmail eller presenter dem som sendt uten separat utsendingsbeslutning. Ikke publiser uten redaksjonell sign-off.
