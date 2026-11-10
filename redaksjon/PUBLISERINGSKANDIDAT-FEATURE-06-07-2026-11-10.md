# Feature 06–07 – publiseringskandidat, ikke godkjent

**Opprettet:** 10. november 2026  
**Status:** Kun for utkast-PR. **IKKE MERGE uten en uttrykkelig separat redaksjonell publiseringsbeslutning for hver sak.**

Denne grenen simulerer sluttilstanden ved en faktisk publisering. Den inneholder to offentlige artikkelfiler, to nye Feature-kort og endret artikkelkø. Disse endringene finnes **bare på grenen** fram til PR-en eventuelt blir godkjent og slått sammen. I `main` er begge sakene fortsatt upubliserte utkast, og dette skal ikke rapporteres som endret før en faktisk merge er bekreftet.

## Kandidat 06
- Forslag til offentlig URL: `artikler/2026-11-10-bankene-tjener-milliarder.html`
- Hovedmotiv: `Bilder/Artikler/feature06-bankene-hovedbilde-2026.webp`
- Analyseillustrasjon: `Bilder/Artikler/feature06-bankene-sekundaerillustrasjon-2026.webp`
- Faktagrunnlag: SSB ni-månedersresultat og renter; Norges Bank rentebeslutninger; Finans Norges bransjeforklaring; Forbrukerrådets offentlige bytte- og rentetiming-rapporter
- Sitatetikk: Forbrukerrådets e-post var bakgrunnsinformasjon og brukes ikke som offentlig sitat. Rapportens avvikende metodeår er ikke videreført som et sikkert faktum på publiseringskandidatsiden
- Utestående: Svar på metodeavklaring, eventuelt DNBs tilleggskommentar, siste bildegodkjenning og redaksjonell sign-off
- Redaktørbeslutning: **IKKE GITT**

## Kandidat 07
- Forslag til offentlig URL: `artikler/2026-11-10-norden-teknologigigantene.html`
- Hovedmotiv: `Bilder/Artikler/feature07-nordisk-digital-suverenitet-hovedbilde-2026.webp`
- Analyseillustrasjon: `Bilder/Artikler/feature07-nordisk-digital-suverenitet-sekundaerillustrasjon-2026.webp`
- Faktagrunnlag: Nordisk-baltisk ministererklæring, offisiell norsk omtale, Digdirs/Skates rapport *Skiftende skydekke*, Tekna/NITO/Forbrukerrådets offentlige innspill
- Kildeetikk: Departementet har ikke gitt ytterligere kommentar; dette gir ikke grunnlag for å påstå at de avviser ministererklæringen
- Utestående: Svar fra offentlig IT- og sikkerhetsfaglig kilde, siste bildegodkjenning og redaksjonell sign-off
- Redaktørbeslutning: **IKKE GITT**

## Betingelser før noen trykker merge
1. Redaktør godkjenner sak 06 og sak 07 **hver for seg**. Hvis bare én godkjennes, deles PR-en i to og bare én artikkel/kort/køstatus tas videre.
2. De **usendte** oppfølgingsutkastene til DNB og Forbrukerrådet skal ikke omtales som sendt. Hvis det kommer nye svar, kontroller og innarbeid dem først.
3. Kontroller at alle fakta, lenker, kildedatoer, alt-tekster og de fire originale illustrasjonene fremdeles stemmer.
4. Oppdater filnavn, alle publiseringsdatoer, kanoniske URL-er og feed-kort **til faktisk utgivelsesdag** dersom merge skjer etter 10. november 2026. Ikke tilbakedater.
5. Behold den redaksjonelle arbeidskopien og kildeloggen. Oppdater `utkast/artikler.json` i samme commit som eventuelle publiserte artikler og kort.
6. Alle automatiske kontroller må være grønne. En grønn teknisk test erstatter **ikke** redaksjonell godkjenning.
7. Etter merge: kontroller faktisk offentlig URL, forsidekort, delingsbilder og mobilvisning. Rull tilbake hvis sidene ikke fungerer.

**Merk:** `godkjent=true` og `publisert=true` på denne grenen viser kun den foreslåtte tilstanden **etter** en eventuell godkjent publisering. Disse feltene må ikke brukes som bevis for at sakene allerede er publisert eller redaksjonelt godkjent.
