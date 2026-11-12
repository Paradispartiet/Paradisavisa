# Feature 09 – Norges vei til Moskva, levende utenriksanalyse

**Oppgradert 12. november 2026.** Eksisterende publisert sak beholder sin URL, tittel, publiseringsdato (11. november), originalillustrasjon og kildebevissthet.

## Redaksjonell verdi
Artikkelens distinksjon mellom **direkte trepartssamtaler** (USA, Ukraina, Russland), **europeiske konsultasjoner** (EU/land/NATO med Ukraina og USA, uten Russland) og **norsk-finsk telefonkontakt** (27. oktober) visualiseres i en original SVG. Diagrammet viser møtestrukturer, ikke geografiske ruter, formelle delegasjonsmandater eller antatte resultater.

**Oppdatering 12. november:** Amerikanske utsendinger er kommet til Moskva etter Abu Dhabi. Prinsipiell enighet om fangeutveksling må ikke forveksles med en gjennomført utveksling; ingen fredsavtale er oppnådd.

## Bevar og forbedre
- Behold tittel, URL, opprinnelig hovedillustrasjon og dagens kildeposisjoner 1–10. Tilføy AP 12. november som kilde 11.
- Bruk `artikkel.css` og `artikkel-interaktiv.js` med tilpasset layout. Rett samtidig ugyldig HTML ved å lukke article-elementet før faktasidepanelet.
- Skjermleserbeskrevet grafikk med diskret «Forstørr»-lenke og direkte fil-lenke uten JavaScript.
- Tidslinje med seks utfellbare hendelser (1826, 2010, 2022, fiskeriavtale, telefonkontakt, Abu Dhabi og Moskva).
- Kildebasert faktaboks om mandat og rolle. Fire interaktive forklaringssteg om kontakt, forhandling, avtale og gjennomføring som *redaksjonell modell*, ikke et offisielt diplomatisk rammeverk.
- Lokal leseravstemning, ingen server eller oppdiktet meningsmåling.
- Ikke legg inn kvantitativ graf over «diplomatisk innflytelse»: den har ikke etterprøvbart datagrunnlag.

## Verifiserte kilder
- [SMK 27. oktober](https://www.regjeringen.no/no/aktuelt/president-stubb-og-statsminister-store-i-telefonsamtale-med-president-putin/id3183597/)
- [EU, 10. november](https://www.consilium.europa.eu/en/press/press-releases/2026/11/10/statement-on-today-s-meeting-in-abu-dhabi-between-the-eu-france-germany-italy-united-kingdom-ukraine-united-states-and-nato/)
- [Reuters 11. november](https://www.reuters.com/world/europe/us-russia-ukraine-start-second-day-abu-dhabi-peace-talks-2026-11-11/)
- [AP 12. november](https://apnews.com/article/683810203340077f33611fd1d1757b23)
- [Delelinjeavtalen 2010](https://www.regjeringen.no/no/tema/utenrikssaker/folkerett/innsikt_delelinje/avtale-med-russland-om-maritim-avgrensning-i-barentshavet-og-polhavet/id2008645/)
- [Fiskeriavtale 2027](https://www.regjeringen.no/no/aktuelt/enighet-om-norsk-russisk-fiskeriavtale-for-2027/id3181971/)

## Publiseringsport
Node-test `scripts/diplomati-norge-russland-levende.test.cjs` og faktisk Chromium-test for mobil, iPad (begge orienteringer) og PC må bestå. Kontrollér brutt media, horisontal scroll, zoom, tidslinje, faktaboks, forklarer, lokal poll og no-JS fallback.

Ingen merge før grønne tester på PR-head. Etter merge: main-integritet, oppdatert Pages-deploy og ny nettleserkontroll.
