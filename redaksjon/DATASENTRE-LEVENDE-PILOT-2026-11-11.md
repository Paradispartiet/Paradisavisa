# Datasentre og kraft – tredje levende artikkelpilot

**Dato:** 11. november 2026  
**Artikkel:** [Hvem skal få Norges strøm? Nå setter Statnett bremsene på datasentrene](../artikler/2026-11-10-hvem-skal-fa-norges-strom.html)  
**Opprinnelig publiseringsdato:** 10. november 2026 – bevart.  
**Sjangeren:** Nyhetsanalyse, ikke en politisk kampanje eller dokumentar fra en faktisk driftssentral.

## Redaksjonelt siktemål

Dette er tredje enkeltartikkel som tar i bruk [Paradisavisas artikkelstandard](ARTIKKELSTANDARD.md) og [biblioteket for levende artikler](LEVENDE-ARTIKLER.md). Brødteksten og det godkjente 1600×900-hovedbildet beholdes. Det skal være mulig å forstå saken uten å betjene modulene.

Særlig viktig: **Statnetts tiltak**, **regjeringens konsesjonsplan** og **representantforslaget på Stortinget** er ikke samme beslutning.

## Kilder kontrollert 11. november

| Tema | Kilde | Må ikke forveksles med |
| --- | --- | --- |
| Kapasitetskø: 800 MW tilknyttet, 4 200 MW reservert, 9 100 MW i kø, 18 000 MW ytterligere forespørsler | [Statnett, 9. november 2026](https://www.statnett.no/om-statnett/nyheter-og-pressemeldinger/nyhetsarkiv-2026/midlertidige-tiltak-for-fortsatt-forsvarlig-systemdrift/) | Ferdig utbygde eller samtidige faktiske effektuttak, årlig TWh eller et samlet framtidsforbruk |
| Tiltakets virkeområde og forventet varighet | Samme Statnett-pressemelding | Full generell stans i alle datasentre eller automatisk overføring av køkapasitet til annen industri |
| Planlagt konsesjonsordning, samfunnsnytte og mulig statlig eierskap | [Regjeringen, 9. november 2026](https://www.regjeringen.no/no/aktuelt/regjeringen-vil-ha-en-kontrollert-vekst-av-samfunnsnyttige-datasentre-i-norge/id3192054/) | Vedtatt lov eller en publisert fordelingsmatrise |
| Lovforslag om midlertidig unntak fra tilknytnings-/investeringsplikten for nye uttakskunder over 1 MW | [Dokument 8:34 LS](https://www.stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Representantforslag/2026-2027/dok8-202627-034ls/) | Ferdig vedtatt generelt forbud mot å kjøpe strøm |
| Bjørnar Moxnes’ skriftlige spørsmål om omfang og unntak | [Stortinget, spørsmål 15:568](https://www.stortinget.no/no/Saker-og-publikasjoner/Sporsmal/Skriftlige-sporsmal-og-svar/Skriftlig-sporsmal/?qnid=130177) | Et offentliggjort svar – svaret var fortsatt ikke tilgjengelig ved kontrollen 11. november |
| Høring 24. november kl. 13.15, påmeldingsfrist 16. november kl. 14.00 | [Stortingets høringsside](https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/Horing/horing/?h=10006019) | Høring som allerede er gjennomført |
| Arbeidstakere versus datasenternæring | [Fellesforbundet](https://kommunikasjon.ntb.no/pressemelding/19134904/datasenter-regjeringen-tar-kontroll?publisherId=17846982) og [Norsk Datasenterindustri](https://www.datasenterindustrien.no/ber-om-forutsigbarhet-og-tiltak-som-virker-na) | Uavhengige konsekvensanalyser, sikre rangeringer av samfunnsnytte |

## Nye innholdselementer

- Ni synlige kildenoter under konkrete avsnitt, i tillegg til eksisterende nummererte kilder. Noen moduler har egne kildehenvisninger, og en samlet kildeliste beholdes.
- Original SVG-graf `Bilder/Artikler/2026-11-11-datasentre-kraftko-graf.svg`: fire tydelige, **ikke-stablede** stolper med felles nullpunkt og kategoriforklaringer. Egen datatabell og forstørrbar original.
- Original SVG-forklaring `Bilder/Artikler/2026-11-11-datasentre-tre-beslutningsspor.svg`: tre parallelle beslutningsløp med ulik rettslig status; dette er redaksjonell sammenstilling, ikke bilde av et faktisk myndighetsvedtak.
- Klikkbar forklaringsboks om MW, MWh og TWh, uten å bruke en ubegrunnet antakelse om årsforbruk.
- Trinnvis forklaring (effektbehov, teknisk nettsikkerhet, samfunnsnytte) som tydelig er en **pedagogisk modell**, ikke vedtatt offentlig tildelingsprosedyre.
- Interaktiv tidslinje med 3., 9. og planlagt 24. november. Framtidig høring er eksplisitt merket «planlagt».
- Lokal refleksjonsavstemning med fem balanserte svaralternativer. Ingen stemmer sendes inn, og ingen offentlige prosenter vises. `localStorage` kan brukes av nettleseren, men ingen brukerdata innhentes på serveren.

## Publiseringssikkerhet

- Behold eksakt opprinnelig godkjent hovedbilde: `Bilder/Artikler/2026-11-10-datasentre-kraftnett.webp`. Ingen regenerering, ingen SVG-erstatning av hovedbildet.
- Behold tittel, ingress, kort, URL og publiseringsdato 10. november. Sett bare oppdateringsdato 11. november i metadata og synlig byline.
- Ingen nye intervjuer eller sitater er oppdiktet.
- Ikke endre allerede publiserte notiser, arkivkort eller andre artikler.

## QA

`node --test scripts/datasentre-levende.test.cjs` sjekker de oppgitte tallene, kildene, forskjellen mellom vedtak og forslag, bildebevaring og modulstrukturen.

`node scripts/levende-artikkel-browser.cjs` kontrollerer med faktisk Chromium både mobil (390 px), iPad stående (820 px), iPad liggende (1180 px), PC (1440 px) og nedgradert visning uten JavaScript: grafikk lastes, tabellen finnes, faktaboks og tidslinje åpnes, trinn velges, lokal avstemning fungerer og modal kan lukkes.

**Mergesperre:** Begge arbeidsflytene må være grønne. Etter merge skal offentlig GitHub Pages-kontroll gjøres; CI alene beviser ikke at siste deploy er tilgjengelig.
