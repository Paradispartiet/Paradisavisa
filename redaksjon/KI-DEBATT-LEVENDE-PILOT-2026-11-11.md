# KI-debatt – levende artikkelpilot, 11. november 2026

**Artikkel:** [Når maskinene lærer å skrive, mister de lærde sitt monopol](../artikler/2026-11-11-maskinene-laerer-aa-skrive.html)  
**Sjanger:** Debattinnlegg, av Paradispartiet  
**Første publisering:** 11. november 2026 – skal ikke gis ny publiseringsdato ved denne revisjonen.  
**Felles standard:** [Artikkelstandard](ARTIKKELSTANDARD.md), [Levende artikler](LEVENDE-ARTIKLER.md), [Bildehåndbok](BILDEHANDBOK.md).

## Hva er oppgradert?

- Opprinnelig tittel, ingress, hovedargument og forfatter/avsender er beholdt. **Den eksakt godkjente høyoppløselige tegneserieillustrasjonen av Bernhard Ellefsen er uendret**: `Bilder/debatt/2026-11-11-ellefsen-ai-skriving-hires.webp`; verken fotografisk framstilling eller påstand om faktisk hendelse.
- Hovedbildets skjermhøyde reguleres nå av felles artikkelstil på iPad/mobil, med `object-fit:contain` – ingen brutal beskjæring av det kvadratiske motivet.
- Fem diskrete kildenoter i og nær faktabærende avsnitt, med naturlig integrerte lenker til originalinnlegg og faglitteratur. Fullstendig kildeoversikt nederst.
- Korrigert nyanse: Maria Kjos Fonn snakket spøkefullt om bekymring for egen karriere i en omtale fra 2025, ikke som ubestridt erklært karrieretap.
- Korrigert nyanse: Aftenpostens KI-detektorutslag er ikke direkte bevis på opphavsmannskap. Horsts tilsvar og Holts kritikk er gjengitt med lenker. Forskning på KI-detektorers feilmarginer gjelder andre verktøy, ikke automatisk Skrivera.
- Klikkbar faktaboks om hva KI-detektorer kan og ikke kan vise.
- Original, selvstendig forklaringsgrafikk som viser idé → KI-forslag → menneskelig kontroll, tydelig merket som normativ skisse. Bildet kan forstørres og har egen alt-tekst/bildetekst. Det erstatter ikke godkjent hovedillustrasjon.
- En trinnvis interaktiv forklaring om en ansvarlig skriveprosess, lesbar også uten JavaScript.
- Frivillig lokal refleksjonsavstemning om forventninger til forfatteres KI-bruk. Ingen server, ingen felles stemmetall eller prosentframstilling; svar lagres eventuelt bare lokalt.

## Kildekontekst og redaksjonell presisjon

| Påstand/tema | Dokumentasjon | Forbehold |
| --- | --- | --- |
| Bernhard Ellefsens kritiske kommentarer om KI | [Morgenbladet, 5. juni 2026](https://www.morgenbladet.no/kultur/ja-hvordan-synes-vi-denne-ki-bruken-gar-da-dere/10378196) | En kritisk kommentar er ikke i seg selv dokumentasjon for skribentens påståtte motiv eller ønske om monopol |
| Maria Kjos Fonn om KI-novelle | [Samtiden, 20. mars 2025](https://www.samtiden.no/notiser/ny-ki-modell-gjor-forfattere-nervose/1311594) | Omtalen opplyser at karrierebekymringen ble uttrykt spøkefullt |
| Aftenpostens KI-detektortest | [Ingunn Øklands kommentar, 6. november 2026](https://www.aftenposten.no/kultur/kommentar/i/Wg49kL/aftenposten-avsloerer-73-prosent-av-innholdet-i-den-siste-saken-av-joern-lier-horst-er-ki-generert) | Utslag fra et verktøy er ikke sikker dokumentasjon på forfatterskap |
| Horsts arbeidsmetode og tilsvar | [Aftenposten, 7. november 2026](https://www.aftenposten.no/meninger/debatt/i/g3PGm0/joern-lier-horst-om-ki-bruk-jeg-har-skrevet-alle-boekene-mine-selv) | Horst er part i saken, men skal få gjengitt eget syn |
| Anne Holts kritikk | [VG, 9. november 2026](https://www.vg.no/nyheter/i/GP1EJ6/paafallende-at-min-krimkollega-ikke-forstaar) | Kommentar/debattinnlegg, ikke uavhengig bevis for Horsts arbeidsform |
| Detektorer kan ta feil | [Weber-Wulff mfl., 2023](https://arxiv.org/abs/2306.15666), [Liang mfl., 2023](https://arxiv.org/abs/2304.02819) | Ingen av disse studiene validerer Skrivera spesifikt |
| Generisk språk, feil og menneskelig kontroll | [UNESCO-nettstedet, signert fagkommentar, 2025](https://www.unesco.org/en/articles/ai-and-great-linguistic-flattening) | Forfatterens analyse, ikke en offisiell UNESCO-godkjenning av en bestemt arbeidsmåte |

## Debattstil og kildeansvar

Artikkelen argumenterer politisk og retorisk for at KI kan demokratisere avansert skriving. Formuleringer om «kunnskapsmonopol» er uttrykkelig merket som **Paradispartiets tolkning**, ikke dokumenterte private motiver hos navngitte kritikere. Ingen oppdiktede sitater eller fakta er lagt til. Motforestillinger om opphavsrett, transparens, språkstandardisering og kildekontroll er fortsatt en del av teksten.

## Kontrollport

- `node --test scripts/ki-debatt-levende.test.cjs` – tittel, byline, originalillustrasjon, kildepresisjon, nye moduler og lokalt poll-forbehold.
- `node scripts/levende-artikkel-browser.cjs` – ekte Chromium-kontroll av mobil, iPad stående og liggende, PC og uten JavaScript. Verifiserer lastet originalillustrasjon/ny grafikk, avsnittslenker, dialog, faktaboks, trinnvise paneler, lokal avstemning og ingen horisontal side-scroll.
- Utkast og annen publisering berøres ikke. Ingen forsidekort eller publiseringsdato endres. Ingen nye serverfunksjoner er tatt i bruk.
- Etter merge bekreft faktisk GitHub Pages og at leserne ser samme innhold. Automatisk CI kan ikke erstatte journalistisk kildesjekk.

**Denne produksjonsloggen innfører ingen ny konkurrerende artikkelmal.**
