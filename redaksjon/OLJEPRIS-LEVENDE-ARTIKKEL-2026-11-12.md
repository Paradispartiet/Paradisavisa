# Feature 10 – Oljeprisfallet med dokumenterte sluttkurser

**Artikkel:** `artikler/2026-11-05-oljeprisfall-usa-valg-norge.html`  
**Oppdatert:** 12. november 2026. **Første publisering:** 5. november (dato og URL beholdes).

## Hovedgrep
Den opprinnelige illustrasjonen `2026-11-05-oljeprisen-norge-godkjent.webp` beholdes uendret og med riktig merking som symbolsk KI-assistert motiv.

To originale SVG-grafikker:
1. **Brent-sluttkurser:** sju dokumenterte historiske oppgjørspriser for januar-termin 2., 3., 4., 5., 6., 9. og 10. november 2026. Grafen har tilgjengelig beskrivelse, tilhørende **HTML-datatabell** og y-akse med tydelig opplysning om at den starter ved 85 (ikke 0).
2. **Virkninger i Norge:** en redaksjonell årsaksforklaring med tre grener for petroleuminntekter, drivstoffpriser og klima. Ingen oppdiktede krone- eller prosentvirkninger.

## Fakta og kvalitet
Original artikkel oppga 89,65 dollar (Reuters, 10. november kl. 13.34 GMT) som et **intradagskursnivå**, korrekt merket som sådan. Sluttkursen for 10. november var **91,49 dollar** (Reuters). Grafen bruker **utelukkende sluttkurser**, ikke intradag-data.

Sluttkursene 2.–10. november i graf og tabell: 104,77 / 103,60 / 94,62 / 98,29 / 98,32 / 92,57 / 91,49 dollar fatet. Kilde: `Financial Times`, historiske Brent futures for januarlevering. To sentrale punkter kryssjekket med Reuters. Ingen konstruerte mellomverdier.

Styringsrenten på **4,50 %** ble bestemt av Norges Banks komité på møtet 4. november, offentliggjort 5. november (egen primærkilde); ikke automatisk reaksjon på prisfallet.

IEAs anslag om **1,7 millioner fat olje/dag** i fortrengt etterspørsel fra global elbilpark i 2025 beholdes. Det er ikke en målt effekt av oljeprisfallet i november.

## Levende komponenter
- Felles `artikkel.css` og `artikkel-interaktiv.js`; ingen ny motor.
- To diskrete `Forstørr`-lenker med tydelige tilgjengelige navn og SVG-fallback uten JS.
- Fem utfellbare hendelser i tidslinje med korrekte observasjonstidspunkter.
- Fire klikkbare forklaringssteg: risikopremie, etterspørsel, tilbud og norske virkninger.
- Faktaboks om forskjell på råoljepris og drivstoffpris, og frivillig lokal avstemning uten server eller oppdiktede fellestall.

## Kilder
- [FT, Brent historiske data](https://markets.ft.markitdigital.com/data/commodities/tearsheet/historical?c=Brent+Crude+Oil)
- [Reuters, 4. november](https://www.reuters.com/business/energy/oil-edges-down-investors-await-us-midterm-election-results-2026-11-04/)
- [Reuters, 10. november – intradag](https://www.reuters.com/business/energy/oil-falls-trump-downplays-prospect-escalation-with-iran-2026-11-10/)
- [Reuters, 10. november – sluttkurs](https://ca.investing.com/news/commodities-news/oil-falls-as-trump-downplays-prospect-of-escalation-with-iran-4944969)
- [Norges Bank, novemberbeslutningen](https://www.norges-bank.no/en/topics/monetary-policy/Monetary-policy-meetings/2026/november-2026/)
- [IEA, Global EV Outlook 2026](https://www.iea.org/reports/global-ev-outlook-2026/outlook-for-electric-mobility-chap-9-11)

## Publiseringsport
`scripts/oljepris-levende.test.cjs` og `scripts/levende-artikkel-browser.cjs` skal bli grønne på PR-head. Chromium dekker 390 px mobil, 820/1180 iPad, 1440 PC og no-JS. Verifiser graf, begge bilder, tabell, poll, zoom, tidslinje, faktaboks, interaksjon, ingen horisontal overflyt. **Merge først etter grønn CI**; kontroller main, Pages og publisert side etterpå.
