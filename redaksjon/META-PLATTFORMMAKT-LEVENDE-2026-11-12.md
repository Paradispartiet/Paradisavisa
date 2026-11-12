# Feature 11 – Plattformmakt og journalistikkens rettigheter

**Artikkel:** `artikler/2026-11-02-meta-plattformmakt-pressefrihet.html`  
**Publisert:** 2. november 2026; **oppdatert:** 12. november 2026. Beholder samme URL, innhold og de to opprinnelige illustrasjonene.

## Redaksjonelle funn
- **6. november:** Meta bekreftet at foreslåtte endringer i fire avtaleverk er satt på pause. Vilkårene trer derfor ikke i kraft 20. november; de eksisterende gjelder fortsatt. Det er ikke en ny dom (Reuters 6.11; Nieman Lab 5.11).
- **180 og ti er to ulike roller:** Schibsted oppgir 180 selskaper bak aksjonen; NTB navngir ti begjærende foretak. Tallene må ikke summeres eller framstilles som uavhengige utvalg. Juridisk analyse fra Legal247, oppdatert 6.11, understreker at det midlertidige pålegget gjelder partene i saken.
- **Ikke kjent lovbrudd:** Midlertidig norsk forføyning er ikke en endelig kjennelse om lovlighet. CMA har en åpen granskning og understreker at intet lovbrudd er fastslått. Meta bestrider at den foreslåtte klausulen utvider selskapets rett til å hente innhold. Ikke påstå at Meta faktisk har hentet innhold bak betalingsmur med hjemmel i klausulen.
- Originalartikkelen oppgir at full rettskjennelse og endelig original ordlyd ikke er gjennomgått av redaksjonen; forbeholdet beholdes.

## Design
- Hovedtittel var tidligere visuelt skjult. Gjort synlig som tydelig serif-overskrift, samtidig som opprinnelig masthead og lesbar sort layout bevares.
- Fire illustrasjoner totalt: to godkjente originaler, én ny prinsippskisse som skiller lenking fra indeksering og viderebruk, én kildebelagt tallillustrasjon med 180/10 og riktig tolkning.
- Felles `artikkel.css` og `artikkel-interaktiv.js`; to diskrete «Forstørr»-lenker, 44px treffområder og direkte SVG-fallback uten JavaScript.
- Tidslinje med seks åpnebare steg (15.10–6.11), fire klikkbare forklaringspaneler og utfellbar rettslig faktaboks.
- Valgfri lokal poll uten server, oppdiktede tall eller kollektivt resultat.
- Endringer gjelder kun publisert artikkel, nye SVG-ressurser, tester og redaksjonsnotat.

## Kilder
1. [Schibsted – første rettslige seier, 180 selskaper](https://schibsted.com/news/schibsted-takes-meta-to-court-and-wins-first-round/)
2. [Aftenposten/NTB – 28.10 Oslo tingrett og de ti partene](https://www.aftenposten.no/norge/i/ylAk9a/norske-medier-vant-fram-med-krav-mot-meta-i-retten-forbys-aa-innfoere-endringer)
3. [Reuters – Meta satte endringene på pause 6.11](https://www.reuters.com/business/meta-pauses-planned-terms-updates-keeps-existing-rules-place-2026-11-06/)
4. [Nieman Journalism Lab – oppdatering 5.11](https://www.niemanlab.org/2026/11/meta-pulls-down-controversial-terms-of-service/)
5. [Nieman Journalism Lab – kontraktsordlyd 17.10](https://www.niemanlab.org/2026/10/legal-experts-warn-metas-new-terms-still-grant-broad-scraping-permissions-despite-language-changes/)
6. [CMA – åpen saksstatus](https://www.gov.uk/cma-cases/suspected-abuse-of-a-dominant-position-in-relation-to-metas-commercial-terms)
7. [Legal247 – juridisk gjennomgang, oppdatert 6.11](https://www.legal247.no/en/insights/meta-new-terms-publishers/)

## Testport
`node --test scripts/meta-plattformmakt-levende.test.cjs` i artikkelvalideringen. Chromium i `scripts/levende-artikkel-browser.cjs` på 390/820/1180/1440 px, no-JS fallback, kontroll av alle fire illustrasjoner, zoom, tidslinje, faktaboks, forklarer, poll + gjenlasting og ingen horisontal scrolling.

**Ikke merge før begge PR-kontrollene er grønne.** Etter merge kontroller main-kode, Pages og tilhørende visuell nettlesertest.
