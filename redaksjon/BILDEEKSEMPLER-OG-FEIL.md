# Paradisavisa – bildeeksempler, feil og læringspunkter
**Versjon:** 1.0 · **Dato:** 6. november 2026

Dette er en læringsliste og godkjenningsveiledning. Trump- og Grønland-bildene er nå overført i JPEG-form til GitHub; oljemotivet avventer fortsatt visuell godkjenning.

## 1. Støre–Stubb: eksisterende publisert kvalitetsreferanse
- **Artikkel:** [Støre–Stubb – Den diplomatiske muligheten og risikoen](../artikler/2026-11-02-store-stubb-diplomatisk-mulighet.html)
- **Publisert hovedbilde:** [store-stubb-geopolitisk-1600x900.jpg](../Bilder/Artikler/store-stubb-geopolitisk-1600x900.jpg)
- **Hvorfor referanse:** Romlig montasje, gjennomtenkt lys, bredt 16:9-format, menneskelig skala, informativ bildetekst, riktig bilde også i metadata.
- **Viktig:** Bildet er tydelig merket KI-generert redaksjonell montasje, ikke et dokumentarfotografi.

## 2. Trump og det amerikanske topartisystemet
- **Status 6. november:** Det faktisk godkjente, detaljerte hovedbildet er overført til GitHub som **[2026-11-05-usa-ludo-politisk-satire.jpg](../Bilder/Artikler/2026-11-05-usa-ludo-politisk-satire.jpg)** (1600 × 900, 566 155 byte). Bildet er en JPEG-versjon av den godkjente bildegenereringen i samtalen; det er ikke den forenklede SVG-en.
- **Godkjent motiv:** Trump som synlig hovedfigur og oppmerksomhetens illusjonist; mediene, penger og begge partier som støttefortelling. Ludo, ikke sjakk.
- **Publisering:** Artikkelens `img`, `og:image`, `twitter:image` og `Nyhetshjul.json` viser nå JPEG-motivet. Original-SVG er bevart som arkiv.
- **Feil å unngå:** Uklare nasjonsflagg, tilfeldig krigsdekor, for mye gull og skjematisk ikonplakat. Fotomontasjen er **satire**, ikke dokumentasjon på faktisk handling.
- **Teknisk integritet:** Git blob SHA-1 `df217d18d67963da2fdf9c6f07bdb02f09f12de2`, SHA-256-prefiks `dc99169b45e906f3`.

## 3. Grønland i Oslo: konkret lokalhendelse
- **Status 6. november:** Den detaljerte, nøkterne illustrasjonen er overført til GitHub som **[2026-11-05-gronland-fjernvarme.jpg](../Bilder/Artikler/2026-11-05-gronland-fjernvarme.jpg)** (1600 × 900, 582 774 byte). Dette er ikke den forenklede SVG-en.
- **Godkjent motiv:** Reparasjonsteam, avsperring, fjernvarmerør og moderat damp; ingen gispende tilskuere som hovedmotiv.
- **Publisering:** Artikkelens `img`, `og:image`, `twitter:image` og `Nyhetshjul.json` viser nå JPEG-motivet. Original-SVG er bevart som arkiv.
- **Etikk:** Kunstig konstruert scene; ikke dokumentarfoto fra Grønland eller bevis for nøyaktig sted og mannskaper.
- **Teknisk integritet:** Git blob SHA-1 `673ac7cd78686fb0249fcec79f1da8fbd51ae28d`, SHA-256-prefiks `1e3d8aea71a99770`.

## 4. Oljepris og norsk økonomi
- **Status 10. november 2026:** Brukeren har valgt et detaljert, tegnet motiv med tre personer ved en norsk kysthavn. Den eksakte brukerleverte PNG-en er tilpasset til WebP (1600 × 900) og publisert som `Bilder/Artikler/2026-11-05-oljeprisen-norge-godkjent.webp`. Filen er **ikke** en ny SVG-tegning. Git blob-SHA: `785823ffcf7ed2ad4e05a24886de10bffc435e9f`.
- **Bildetype:** KI-assistert redaksjonell illustrasjon. Motivets personer og miljø er fiktive, ikke dokumentarfotografi fra en bestemt hendelse.
- **Redaksjonelt valg:** Menneskene bærer fortellingen om Norges sårbarhet ved et oljeprisfall; symboler og markedskurver er utelatt. De eldre SVG- og fotomontasjeforslagene er ikke i bruk som artikkelens hovedbilde.
- **Hovedpoeng:** Fallende oljepris kan være resultat av fallende oljeetterspørsel (potensielt god klimaeffekt), men også av økt tilbud eller lavere risikopremie (som kan stimulere fossilbruk). Bildet må ikke automatisk likestille prisfall med grønne utslippskutt.
- **Feil å unngå:** Diagram/plakat med en rekke piler, oljeplattform, krone, elbil, bensinpumpe og hus som konkurrerende like store ikoner.
- **God retning:** Norsk oljeplattform som ett hovedmotiv; menneskelig og miljømessig dilemma formidlet gjennom scenografi, lys og noen få presise elementer.

## 5. Andre generelle feil
| Feil | Hva vi gjør i stedet |
| --- | --- |
| For mange karakterer eller tilskuere | Ett hovedmotiv; resten understøtter historien. |
| Overskrifter og slagord i rasterbildet | Legg tekst i HTML, bildets symboler må bære idéen. |
| Feil flagg, kart eller uniformsmerker | Fjern eller verifiser motivet før godkjenning. |
| Gull, kontanter eller eksplosjoner uten funksjon | Fjern dekor; behold bare meningsbærende elementer. |
| Flat SVG byttet inn for godkjent fotomontasje | Bruk faktisk godkjent fil; ellers rapporter blokkert. |
| Bildet kan se ut som ekte nyhetsfoto av noe som ikke skjedde | Tydelig redaksjonell stil og synlig KI-merking. |
| Originalfoto uten sikker lisens | Dokumenter fotograf, lisens, kilde, dato og bearbeiding. |
| «Publisert» uten kontroll av faktisk nettside | Sjekk fil-URL, artikkel, kort, Open Graph og deploy. |

## 6. Eksempel på sign-off før bildebytte
- [ ] Sak, sjanger og bildebrief samsvarer.
- [ ] Selve bildefilen er inspisert i full størrelse.
- [ ] Hovedmotiv og alle symboler er korrekte.
- [ ] Personen, stedet og hendelsen framstilles ikke misvisende.
- [ ] Opphav/rettighet og eventuell KI-merking er på plass.
- [ ] Bildet er teknisk riktig og lest i 16:9, mobil og forsidekort.
- [ ] Samme godkjente bildefil ligger i repositoriet.
- [ ] Artikkel, forsidekort og delingsmetadata bruker bildefilen.
- [ ] Visuell kontroll og GitHub Pages-deploy er bekreftet.

**Fortsatt relevant intern historikk:** [Bildeplan hovedbilder](BILDEPLAN-HOVEDBILDER-2026-11-03.md), [Visuell sluttvurdering](BILDEVURDERING-PUBLISERTE-NYHETER-2026-11-03.md), [Oppgraderte bilder](OPPGRADERTE-BILDER-PUBLISERTE-NYHETER-2026-11-03.md).
