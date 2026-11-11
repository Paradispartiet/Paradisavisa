# Ronaldo – femte levende artikkelpilot (sport)

**Artikkel:** [Ronaldo var en gigant. Men hvem tok løpene for ham?](../artikler/2026-11-05-ronaldo-landslagsavskjed.html)  
**Sjanger:** Sport / analyse  
**Opprinnelig publiseringsdato:** 5. november 2026. Behold denne, merk bare design-/kildeoppdateringen 11. november 2026.  
**Kanonisk standard:** [ARTIKKELSTANDARD](ARTIKKELSTANDARD.md), [LEVENDE-ARTIKLER](LEVENDE-ARTIKLER.md), [BILDEHANDBOK](BILDEHANDBOK.md).

## Redaksjonelt valg

Dette er første sportsanalyse med levende moduler. Den sentrale tesen – stor målscorer, men begrensninger i det kollektive presspillet – beholdes som argument, ikke opphøyes til et målt vitenskapelig faktum. **Ingen påfunn om antall pressløp, kilometer løpt eller xG.** Der tall finnes, oppgis kilde og måleperiode.

## Modulene

- **Kildenoter:** Syv avsnitt er utstyrt med klikkbare henvisninger under faktapåstandene, samt eksisterende kildeliste. Det redaksjonelle vurderingsspråket er fortsatt tydelig gjenkjennelig som analyse.
- **Nøkkeltall:** 234 landskamper, 146 mål, seks VM-sluttspill med scoring, tre store landslagstitler (EM 2016, Nations League 2019 og 2025). Dette er dokumentert av FIFA.
- **Taktikkillustrasjon:** original SVG med to skjematiske baner: samordnet høyt press vs. spiss som skjermes. Pilene er pedagogiske, **ikke kart fra en faktisk kamp**. Den kan forstørres med liten lenke og er tilgjengelig via alt-tekst og bildetekst.
- **Karrieretidslinje:** 2003, 2016, 2019/2025, disiplinærreaksjonen i oktober 2026, og avskjeden 5. november. Hendelsene er ikke blandet sammen.
- **Trinnvis forklaring:** pressutløser, stenge pasningsvei, hjelpe gjenvinning. Skiller fotballteori fra Ronaldo-spesifikke kampdata.
- **Lokal leseravstemning:** «Hva bør veie tyngst i Ronaldos ettermæle?» med ulike svaralternativer. Det finnes **ingen** offentlig stemmeopptelling eller prosenter; leseren ser bare sitt eget valg, eventuelt lagret lokalt.
- **Originalbilder:** høyoppløselig godkjent illustrasjon `2026-11-07-ronaldo-hovedbilde-portrett.webp` og symbolmettet sekundærillustrasjon `2026-11-06-ronaldo-symbolmettet-analyse.webp` beholdes, med «ikke dokumentarfotografi»-merking.

## Kilde- og forbeholdsmatrise

| Tema | Kilde | Vurdering |
| --- | --- | --- |
| Avskjed 5. november, 234 kamper, 146 mål, EM og Nations League | [FIFA 5. november 2026](https://www.fifa.com/en/tournaments/mens/worldcup/articles/cristiano-ronaldo-portugal-retirement) | Primærkilde til kunngjøring og statistikk |
| Debut 20. august 2003, VM-historikk | [FIFAs karriereoversikt](https://www.fifa.com/en/tournaments/mens/worldcup/articles/cristiano-ronaldo-portugal-retirement-career-tribute) | Historisk kamp- og rekordgrunnlag |
| Pressfilosofi og Rangnicks kritikk i 2022 | [The Guardian, 21. mai 2022](https://www.theguardian.com/football/2022/may/21/manchester-united-were-unable-to-play-pressing-game-admits-ralf-rangnick) | Rangnick mente flere spillere og trenerteamets begrensninger bidro; sitatet er **ikke** sporingsdata |
| Utskiftningskonflikt mot Tottenham i 2022 | [BBC Sport, 21. oktober 2022](https://www.bbc.co.uk/sport/football/63345292) | Konkret hendelse, ikke spekulasjon om personlighet |
| Skattesaken i Spania | [Euronews/Reuters, 22. januar 2019](https://www.euronews.com/2019/01/22/cristiano-ronaldo-and-xabi-alonso-appear-in-court-for-tax-fraud-in-spain) | Omfattende men presis omtale av avtale/betinget straff; ikke karakterdom |
| Inntekter i 2026: 300 mill. USD, herav 235 mill. fotballinntekter | [Forbes, 23. mai 2026](https://www.forbes.com.au/news/sport/the-worlds-10-highest-paid-athletes-2026/) | **Anslag** i tolvmånedersperioden fram til mai, før skatt/agenthonorarer, ikke kontraktfestet årslønn |
| Saudi-Arabia og sportsvasking | [Amnesty International, 4. januar 2023](https://www.amnesty.org/en/latest/news/2023/01/saudi-arabia-at-al-nassr-cristiano-ronaldo-should-draw-attention-to-human-rights-issues/) | Organisasjonens kritikk, ikke bevis på Ronaldos egne politiske motiver |
| Landslagssamling og 30 dagers utestengelse | [Reuters, 19. oktober 2026](https://www.reuters.com/sports/soccer/ronaldo-handed-30-day-ban-leaving-portugal-camp-following-coach-jesus-rift-2026-10-19/) | Skilles fra den senere beslutningen om å avslutte landslagskarrieren |

## Design og test

Bruker samme `artikkel.css?v=20261111b` og `artikkel-interaktiv.js` som de tre tidligere publiserte referanseartiklene. En liten, understrøket «Forstørr»-lenke med tilgjengelig tekst erstatter stor gul hovedknapp. Originale bilder endres ikke.

- `node --test scripts/ronaldo-levende.test.cjs`: eksisterende publiseringsdato/bilder, kildehenvisninger, fakta/tall, diagram, tidslinje, lokal avstemning.
- `node scripts/levende-artikkel-browser.cjs`: Chromium på mobil 390 px, iPad stående 820 px, iPad liggende 1180 px, PC 1440 px og uten JavaScript. Sjekk at alle tre bilder lastes, zoom åpner/lukker, tidslinje og steg fungerer, lokalt svar beholdes og sideveis overflow ikke oppstår.
- Kvalitetssperre: **Ikke merge før de nødvendige testene har faktiske grønne resultater.** Pågående GitHub Actions-kø for PR #153 innebærer ikke at en ny PR automatisk er grønn. Denne PR-en får egen teststatus.
