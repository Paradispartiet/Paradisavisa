# Fast publiseringskrav – Paradisavisa-header og meny i alle artikler

**Vedtak / gjennomføring 12. november 2026**

Alle publiserte artikler skal starte med Paradisavisas samme grafiske toppfelt: logo/avisnavn, slagord, lenke til forsiden og **Meny** med nyhetsarkiv, feature, sport, kultur, kommentarer, debatt, notiser, radio, innlegg og kontakt. Menyen skal virke på mobil, iPad stående og liggende og desktop. Det skal være én meny, ikke én uferdig lokal variant for hver artikkel. Artikkelens egen tittel kommer under toppfeltet, ikke inne i det.

## Én redaksjonell menykilde

`header.html` er kanonisk. Artikkelsider som allerede bruker `#header-placeholder`, `styles.css` og `script.js` fortsetter med det eksisterende opplegget, som henter akkurat `header.html`.

Eldre artikkelsider får en *statisk, fungerende fallback* med `<details><summary>Meny</summary>...`, en isolert `artikkel-header.css` og et lite `artikkel-header.js`. Skriptet henter og setter inn samme `header.html` med korrekte absolutte interne lenker, og oppretter responsiv menyknapp som lukkes ved Escape og klikk utenfor. Hvis JavaScript eller henting av `header.html` feiler, forblir den statiske menyen fullt brukbar – ingen tom header.

## Port før publisering

`scripts/alle-artikler-header.test.cjs` kontrollerer **hele `artikler/*.html`-katalogen** ved hver PR og push til main. Ingen ny artikkel kan publiseres uten en av de to godkjente toppmenyvariantene. Den sjekker også at den statiske menyen har de samme navigasjonsmålene som `header.html`.

`scripts/levende-artikkel-browser.cjs` tester den faktiske innlastingen av kanonisk meny, åpning/lukking, lenker, header-bredde og 44px trykkmål på 390, 820, 1180 og 1440 px. Tester også en artikkel helt uten JavaScript.

## Viktig

- Ikke legg ekstra lokal menyrad eller ny stor toppbanner i artikkelen. Unngå doble aviser/logoer etter innlasting.
- Ikke endre eksisterende godkjente bilder, artikkeltekst, URL eller publiseringsdato for å legge til toppmenyen.
- Ikke kopier en fremmed sidemeny: alle kategoriene kommer fra `header.html`.
- Ved videre utvikling av den levende artikkelmalen skal header og meny alltid inngå og testes før merge.
