# «Staten skal lage ting som varer» – sjette levende artikkelpilot

**Revisjon:** 12. november 2026  
**Første publisering:** 6. november 2026 (opprinnelig dato beholdes)  
**Artikkel:** [Staten skal lage ting som varer](../artikler/2026-11-06-staten-bor-lage-ting-som-varer.html)  
**Sjanger:** Kommentar, av Paradispartiet. **Ikke en nyhetsmelding om vedtatt statlig program.**

## Redaksjonelt valg

Dette er en politisk kommentar som argumenterer for et offentlig grunnsortiment: varige TV-er, telefoner, verktøy, datamaskiner, programvare og enkelte fellestjenester. Utfordringen er å forklare forskjellen mellom politisk styring, faktisk utviklingsansvar, uavhengig forskning og offentlig kontroll **uten** å gi inntrykk av at en statlig fabrikk eller UiO-avtale allerede eksisterer.

Den opprinnelige godkjente heroillustrasjonen `Bilder/Artikler/2026-11-06-offentlig-grunnsortiment.svg` beholdes uendret, også i sosiale delingsmetadata. En ny, tydelig **skjematisk** figur `Bilder/Artikler/2026-11-12-staten-grunnsortiment-ansvarsdeling.svg` viser fire foreslåtte ansvarsledd, ikke organisasjonskartet til en eksisterende etat.

## Endringer

- Behold overskrift, ingress, avsender, hovedargument og opprinnelig publiseringsdato. Legg til riktig revidertdato 12. november.
- Innfør felles `artikkel.css?v=20261112a` og `artikkel-interaktiv.js` i den eksisterende sidens design i stedet for å introdusere en separat kommentar-motor.
- Fjern tre overflødige mellomtitler og behold orienterende titler ved reelle temaskifter.
- Syv diskrete kildenoter under faktabærende avsnitt, i tillegg til synlig samlet kildeoversikt.
- Tydelig merket originaldiagram, med skjermleserbeskrivelse og den lille, tilgjengelige «Forstørr»-lenken. Klikk åpner eksisterende bilde-dialog, uten JavaScript åpner lenken selve SVG-filen.
- Tretrinns interaktiv forklarmodell for demokratisk prioritering, offentlig utvikling og uavhengig kontroll. Dette er et **tenkt beslutningsløp**, ikke en vedtatt ansvarsfordeling.
- Klikkbar faktaboks om offentlig alternativ kontra monopol, og uavklarte kostnader/kvalitetskrav.
- Lokal refleksjonsavstemning om hva som eventuelt bør testes først, inkludert «Ingen offentlig produktordning foreløpig». Ingen felles stemmetall, stemmeserver eller politisk profilering.

## Kildeskille

| Tema | Kilde | Begrensning |
| --- | --- | --- |
| Paradispartiets BasicMarked og økonomiske modell | [Partiets økonomiske modell](https://paradispartiet.github.io/Paradispartiet/okonomisk-modell.html) og [politikk](https://paradispartiet.github.io/Paradispartiet/politikk.html) | Partikilder. Dokumenterer partiets forslag, ikke faktisk eksisterende offentlig vareprogram |
| AHA-prosjektet | [AHA-EchoNet på GitHub](https://github.com/Paradispartiet/AHA-EchoNet) | Prosjektets egen beskrivelse, ikke ekstern vurdering eller dokumentasjon på UiO-samarbeid |
| Institutt for informatikk, UiO | [Instituttets forskning](https://www.mn.uio.no/ifi/forskning/index.html) | Verifiserer at fagmiljøet forsker innen informatikk, **ikke** at instituttet støtter politikken |
| Retten til reparasjon | [EU-kommisjonen om direktiv (EU) 2024/1799](https://commission.europa.eu/law/law-topic/consumer-protection-law/directive-repair-goods_en) | Europeisk reparasjonsramme som kontekst; ikke bevis for gjennomført norsk statlig produksjonsordning |
| Personvern som grunnkrav | [Datatilsynet – grunnleggende personvernprinsipper](https://www.datatilsynet.no/rettigheter-og-plikter/personvernprinsippene/grunnleggende-personvernprinsipper/) og [innebygd personvern](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/innebygd-personvern-og-personvern-som-standard/hva-er-innebygd-personvern/) | Et krav til enhver virksomhet som behandler data, uansett offentlig/privat eierskap |

## Kontroll og publiseringsport

- `node --test scripts/staten-varer-levende.test.cjs`: bevarer avsender, publiseringsdato og hero; verifiserer kildeskille, ny illustrasjon og interaktive kontroller.
- `node scripts/levende-artikkel-browser.cjs`: faktisk Chromium på 390/820/1180/1440 px og uten JavaScript, med kontroll av bilder, lenkenes størrelse, zoom, faktaboks, tre trinn, lokal avstemning og ingen horisontal scroll.
- Samlet artikkel-CI og visuell workflow må være **grønne** før merge.
- Etter merge: kontroller GitHub Pages-deploy og offentlig artikkel samt kommentarer-kortet. Ikke endre `kommentarer.json` dersom originalt kort fortsatt er riktig.
