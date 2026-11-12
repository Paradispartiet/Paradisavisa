# Feature 12 – Sofienberg kirke er varm. Folk fryser utenfor.

**Original:** `artikler/2026-11-03-sofienberg-kirke-varmestue.html` (publisert 3. november 2026).  
**Oppdatering:** 12. november 2026. Beholder kanonisk URL, tittel, kommentarprofil og begge originalillustrasjonene.

## Hva er dokumentert?
- Sparebankstiftelsen DNB ga i **2024** 23 175 000 kroner til infrastruktur, utstyr, prosjektering, koordinering og følgeforskning – **ikke** en gitt øremerking til drift av varmestue.
- Sofienbergprosjektets annonserte programmer inkluderer **gratis** arrangementer. Oslo Kammerkor-konsert 7. november er gratis; Kor På Sparket 6. november hadde pris 50 kr; nabolagsyoga 6. november hadde pris 150 kr. Tre eksempler kan ikke tolkes som et representativt snitt for alle tiltak.
- Prosjektets kultur- og nabolagssatsing har også vært rettet mot ungdom. Det er derfor feil å framstille kirken som gjennomgående betalingsbasert eller lukket.
- **Redaksjonell usikkerhet:** Vi har ikke bekreftet offentlig annonserte, faste åpningstider for **gratis, uorganisert opphold for voksne** om vinteren. Dette beviser verken at tilbudet finnes eller at det ikke finnes. Redaksjonen har ikke innhentet nytt tilsvar fra prosjektledelsen.
- Oslo kommune åpner for gratis utlån av skolelokaler for bestemte frivillige aktiviteter for barn og unge, men ordningen gjelder ikke automatisk alle grupper eller alle lokaler.

## Levende mal og grafikk
- To godkjente, illustrerte WebP-bilder beholdes.
- Original SVG: priseksempler **0/50/150 kr** med kildehenvisning, dato, eksplisitt ikke-representativt utvalg og tilgjengelig HTML-tabell.
- Original SVG: skille mellom **betalt aktivitet**, **gratis aktivitet** og **foreslått fri oppholdstid**. Diagrammet er en prinsippskisse, ingen offisiell plantegning eller påstand om manglende tilbud.
- Fem åpnebare tidslinjeledd, én utfellbar kildebasert faktaboks, fire klikkbare forslag til varmestuedrift og en valgfri lokal poll uten falske fellesresultater.
- Gjenbruker `artikkel.css` og `artikkel-interaktiv.js`, diskrete «Forstørr»-kontroller og full statisk fallback uten JavaScript.
- Unngår unødvendig oppdeling av redaksjonsteksten i mange ekstra mellomtitler.

## Kildeliste
- [Sparebankstiftelsen DNB – tilskudd på 23,175 mill.](https://sparebankstiftelsen.no/tildelinger/fra-kirke-til-kulturhus-pa-sofienberg-2/)
- [Sofienbergprosjektets arrangementsprogram](https://www.sofienbergprosjektet.no/)
- [Oslo Kammerkor – 7.11 gratis](https://www.sofienbergprosjektet.no/hvaskjer/oslo-kammerkor-konsert-siste-solarglad)
- [Kor På Sparket – 6.11 50 kr](https://www.sofienbergprosjektet.no/hvaskjer/kor-p-sparket)
- [Nabolagsyoga – 6.11 150 kr](https://www.sofienbergprosjektet.no/hvaskjer/narwjxn0paefa1xm3y3jvem5zzi43e-schm4)
- [Byantropologene: prosjektet 2024–2027](https://www.byantropologene.no/prosjekter/sofienbergprosjektet)
- [Oslo kommune – lån og leie av skolelokaler](https://www.oslo.kommune.no/skole-og-utdanning/lan-og-leie-av-skolelokaler)
- [Paradisavisa, 16.10.2025](../artikler/2025-10-16-kulturkirke-for-hvem.html)

## Publiseringsport
`scripts/sofienberg-varmestue-levende.test.cjs`, deretter faktisk Chromium 390 px mobil, 820/1180 px iPad, 1440 px PC. Kontroller alle fire bildene, ingen horisontal overflyt, kompakt zoom, tabell, tidslinje, forklaringsvalg, poll/gjenlasting og no-JS. Merge først når PR-testløpene er grønne. Etter merge: kontroller main, GitHub Pages og nettlesertest på hovedgrenen.
