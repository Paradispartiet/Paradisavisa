# Paradisavisa – én SoMe-rutine for nye artikler

**Status 11. november 2026:** Automatisk registrering, klargjøring, bildeproduksjon og offentlig verifikasjon er implementert i GitHub. **Automatisk utsending til Instagram/X er ennå ikke aktivert**, fordi den krever egen Metricool API-tilgang og tilkobling av X-kontoen.

## Redaksjonell hovedregel

**Når en artikkel godkjennes og publiseres i avisa, skal den også distribueres på relevante sosiale medier én gang, med artikkelspesifikk tekst og riktig hovedbilde.** Ikke lag parallelle manuelle rutiner for Instagram og X. Distribusjonen baseres på én kanonisk artikkel-URL.

## Kanalformat

- **Instagram:** Ferdig kort 1080 × 1350 px med godkjent hovedbilde øverst, hvit overskrift og grå ingress på svart felt under. Nederst skal det **bare stå PARADISAVISA** – ingen HTTP, www, QR-kode eller lenke i bildet. Instagram-teksten skal omtale saken, kreditere foto/lisens/KI-illustrasjon og henvise til lenke i bio. Følg [Instagram-standarden](INSTAGRAM-KORT.md).
- **X/Twitter:** Kort, men presis tekst på maks 280 tegn, med overskrift, forklarende utdrag og **direkte lenke til artikkelen**. X-innlegget bruker egen tekst, ikke et skjermbilde av Instagram.
- **Andre kanaler:** Kan senere bruke samme publiseringshendelse. De må tilkobles og kvalitetssikres enkeltvis.

## Automatiske steg

1. Artikkelen kildekontrolleres, bildegodkjennes og publiseres etter [artikkelstandarden](ARTIKKELSTANDARD.md).
2. Artikler legges i offisiell strømfil: Nyhetshjul, Nyhetshjul2, Sportshjul, Kulturhjul, kommentarer, debatt eller posts.
3. Ved en push til main sammenligner GitHub Actions strømfilene med **forrige commit**. Bare nye artikkel-URL-er er kandidater. Endringer i eksisterende sak og flytting mellom strømmer lager ikke nytt innlegg.
4. Artikkel og hovedbilde må eksistere og være publisert; ingen noindex- eller utkastfiler aksepteres. Artikkelen og bildet må samsvare **byte-for-byte** med den offentlige GitHub Pages-versjonen. Ved feil stoppes SoMe-produksjonen.
5. Instagram-kortet rendres med godkjent bilde og lesbar tekst. Det skal ikke kuttes tekst for å få et kort «ferdig».
6. X-versjonen skrives separat med artikkelens direkte URL. Doble oppføringer i flere nyhetshjul gir bare én pakke.
7. En komplett pakke med manifest.json og PNG-kort blir tilgjengelig som GitHub Actions-artefakt i 30 dager.

**Direkte utsending:** Når en sikker Metricool-integrasjon finnes, kan pakken overføres til SoMe etter offentlig verifikasjon. Dette krever gyldig API-token, kanaltilkobling og et varig register over sendte saker; en CI-retry må aldri kunne skape to innlegg. Inntil dette er verifisert, lager rutinen pakker – den **publiserer ikke** på Instagram/X automatisk.

## Implementerte filer

- [Oppdagelse av nye artikler, X-tekst og Instagram-ingress](../scripts/some-pakke.cjs)
- [Instagram-kortgenerator](../scripts/some-kort.py)
- [Bekreftelse av offentlig publisering](../scripts/some-live.cjs)
- [GitHub Actions-arbeidsflyt](../.github/workflows/some-artikler.yml)
- [Tester for oppdagelse, duplikatvern og tegnlengde](../scripts/some-pakke.test.cjs)

## Tilkoblingsstatus

Metricool-merkevaren paradispartiet (blogId 7885193) har Instagram @paradispartiet, men ikke X, ifølge sist kontrollerte kontoinnstillinger 11. november. ChatGPT-tilkoblingen til Metricool er **ikke** en tilgjengelig GitHub Actions API-nøkkel. Metricools egen HTTP API krever Advanced-/Custom-plan og token som oppbevares som GitHub Secret – aldri i repoet. [Offisiell Metricool API-veiledning](https://help.metricool.com/basic-guide-for-api-integration-r97af).

X-profilbilde, toppbilde, biografi, lenke og festet innlegg endres gjennom egen profiloppdatering, uavhengig av artiklenes SoMe-rutine.

## Faste sperrer

- Ingen historisk massepublisering eller utsending fra gamle artikkel-URL-er.
- Ingen dobbeltpublisering ved CI-retries, rebase, oppdaterte artikler eller omplassering i feed.
- Ingen automatisk republisering av korrigerte saker.
- Bilderettigheter, lisens, fotografkreditering og KI-merking må bevares ved distribusjon. Kort automatisk bildetekst er ikke alltid tilstrekkelig for lisenskrav; dette må være på plass før autopublisering.
- Feil i SoMe må ikke blokkere korrekt publisering av selve avisa, men registreres som ufullført distribusjon.
- En opprettet planlagt post eller et utkast er ikke det samme som bekreftet publisering.
