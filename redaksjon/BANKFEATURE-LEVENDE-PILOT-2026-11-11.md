# Bankene tjener milliarder – levende artikkelpilot

**Dato:** 11. november 2026  
**Artikkel:** [Bankene tjener milliarder – hvem betaler?](../artikler/2026-11-10-bankene-tjener-milliarder.html)  
**Sjanger:** Feature / økonomi  
**Opprinnelig publiseringsdato:** 10. november 2026. Den datoen beholdes. Dato for siste innholdsendring: 11. november 2026.

## Mandat

Ta i bruk Paradisavisas [kanoniske artikkelstandard](ARTIKKELSTANDARD.md) og [levende komponentbibliotek](LEVENDE-ARTIKLER.md) i en allerede publisert artikkel. Ikke endre nyhetskort, tittel, ingress, godkjente bilder, datointervall eller kjernepåstander. Ingen privat bakgrunnskorrespondanse legges inn som offentlig sitat.

## Nytt i artikkelen

- Kildenoter med aktive lenker rett under de faktabærende avsnittene. Relevante primærkilder er også integrert naturlig i den løpende teksten.
- Hovedbilde og sekundærbilde er beholdt som de samme WebP-filene. Begge har forklarende bildetekster og KI-merking.
- Klikkbar faktaboks om forskjellen mellom rentenetto og resultat etter skatt.
- Datagraf: resultat etter skatt **63,4 → 69,4 mrd. kr**, og netto renteinntekter **103,4 → 100,3 mrd. kr**, sammenliknet for januar–september 2025 og 2026. 2025-verdiene er **utledet** fra SSBs publiserte differanser på henholdsvis +6,0 og −3,1 mrd. kr. Grafen har felles nullbasert skala, egen tekstlig bildetekst, forstørrelse og tilgjengelig datatabell.
- Tidslinje med de kildekontrollerte rentebeslutningene: 7. mai 2026 (4,00 → 4,25), 24. september (4,25 → 4,50), og 5. november (uendret 4,50). Skiller offentliggjøring fra komitébeslutning og styringsrente fra boliglånsrente.
- Trinnvis forklaring av finansiering → utlån/drift → resultat/kapital. Den er en forenklet modell, ikke en regnskapsmessig oppstilling fra én bank.
- Lokal refleksjonsavstemning: «Hva bør veie tyngst i debatten om bankene?» med fire balanserte alternativer. **Ingen server, ingen telling, ingen offentlig pollstatistikk.** Leseren får bare sitt eget svar, eventuelt husket lokalt i nettleseren. No-JS-fallback opplyser at avstemningen ikke fungerer.

## Kontroll av tall og kilder

| Opplysning | Kilde | Grense |
| --- | --- | --- |
| 69,4 mrd. resultat etter skatt januar–september, opp 6,0 mrd. | [SSB 6.11.2026](https://www.ssb.no/bank-og-finansmarked/finansinstitusjoner-og-andre-finansielle-foretak/statistikk/banker-og-kredittforetak/artikler/bankresultat) | Akkumulert ni måneder, ikke bare tredje kvartal |
| 100,3 mrd. rentenetto, ned 3,1 mrd. | Samme SSB-kilde | Rentenetto er ikke overskudd etter skatt |
| Boliglånsrenter 5,31 og 5,30 prosent, innskuddsrente 3,16 prosent, september | [SSB renter](https://www.ssb.no/bank-og-finansmarked/finansinstitusjoner-og-andre-finansielle-foretak/statistikk/renter-i-banker-og-kredittforetak) | Månedlig utvalg; ulike produktgrupper |
| Mai: styringsrenten 4,25 % | [Norges Bank 7.5.2026](https://www.norges-bank.no/aktuelt/nyheter/Pressemeldinger/2026/2026-05-07/) | Komitémøte 6. mai |
| September: styringsrenten 4,50 % | [Norges Bank 24.9.2026](https://www.norges-bank.no/aktuelt/nyheter/Pressemeldinger/2026/2026-09-24-rente/) | Komitémøte 23. september |
| November: 4,50 % beholdes | [Norges Bank 5.11.2026](https://www.norges-bank.no/aktuelt/nyheter/Pressemeldinger/2026/2026-11-05-rente/) | Ikke ny renteheving i november |
| Bankenes soliditet og risiko | [Norges Bank – finansiell stabilitet](https://www.norges-bank.no/aktuelt/publikasjoner/Finansiell-stabilitet---rapport/2026-1-finansiell-stabilitet/nettrapport-2026-1-finansiell-stabilitet/), [Finanstilsynet](https://www.finanstilsynet.no/publikasjoner-og-analyser/finansielt-utsyn/finansielt-utsyn---juni-2026/html/2026/) | Faglige vurderinger, ikke argument for enhver rente |
| Banknæringens vurderinger | [Finans Norge 5.11.2026](https://www.finansnorge.no/artikler/2026/11/sterkt-tredje-kvartal/) | Bransjekilde, utvalg seks banker |
| Tilbud til nye boliglånskunder | [Forbrukerrådet 20.5.2026](https://www.forbrukerradet.no/rapporter/fra-styringsrente-til-utlansrente-hvor-raskt-endrer-bankene-utlansrenta/) | Kan ikke tolkes som prisendring hos eksisterende kunder |

Forbrukerrådets **Bytteundersøkelsen 2026** har en tidligere dokumentert konflikt om feltarbeidsår. Den eksisterende artiklens forbehold og avrundede beskrivelser beholdes; det settes ikke inn nye, detaljerte prosenttall fra denne undersøkelsen. Se [kildesvarloggen](KILDESVAR-FEATURE-06-07-2026-11-10.md).

## Teknisk test og publisering

- **Statiske tester:** `node --test scripts/bank-artikkel-levende.test.cjs`.
- **Ekte Chromium:** `node scripts/levende-artikkel-browser.cjs`, nå utvidet til å kontrollere publisert bankfeature i 390/820/1180/1440 px, kilder, lastede bilder, grafzoom, info, tidslinje, steg og avstemning.
- **Visuell sammenligning:** Skjermbilder fra Chromium arkiveres i CI. Testen skal avdekke sideveis overflow, døde kontroller og manglende bildefiler.
- **Automatisk validering:** Innlagt i eksisterende artikkel- og nettleser-workflows.
- **Publisering:** Endre kun eksisterende artikkel, den nye graf-SVG-en og tester/dokumentasjon. Ikke opprett en ny publiseringsdato eller et nytt forsidekort.
- **Etter merge:** Verifiser faktisk GitHub Pages-artikkel, at design og knapper fungerer. Ikke hev at bruk av denne modulen innebærer at samlede avstemningsresultater finnes.

Dette dokumentet er en produksjonslogg, ikke en ny artikkelmal.
