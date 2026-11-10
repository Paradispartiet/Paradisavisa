# Paradisavisa – bildestatus for de tre nyhetsutkastene 10. november 2026

**Dato:** 10. november 2026. **Status:** Tre selvstendige illustrasjoner er lagret som **ekte WebP-binærfiler i GitHub** og koblet til de tre `noindex`-forhåndsvisningene. **Ingen er godkjent som endelig avisbilde eller satt på forsiden.**

## Arbeidsfiler (1600 × 900 WebP)
| Sak | Bildefil i bildevurderingspakken | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| datasentre | `datasentre-vurdering-1600x900.webp` | 325626 | `8a42805ab56711737fde5c60f94e3e1592d7e7c6f2acc42fc4eecfda983ac025` |
| hegseth | `hegseth-vurdering-1600x900.webp` | 226178 | `7ea0a8736f9b2d8dabf777a91d37003fb2d38f3cf4d5afbd4e04b11408fd093e` |
| nationaltheatret | `nationaltheatret-toyen-vurdering-1600x900.webp` | 325506 | `53c26f131e190aa7f6b133fd3b33e3bb6e3d1a78c6873ed37db9b3b86c53ed01` |

**Filplassering:** Filene ligger nå under `redaksjon/illustrasjoner/` i GitHub, og vises i de redaksjonelle forhåndsvisningene. Disse adressene er **ikke godkjente offentlige artikkelbilder**. Bildene skal ikke settes i nyhetshjul, endelige artikkelsider eller delingsmetadata før redaksjonell godkjenning.

| Sak | GitHub-bildefil | Git blob-SHA |
| --- | --- | --- |
| datasentre | [`2026-11-10-datasentre-vurdering-1600x900.webp`](../redaksjon/illustrasjoner/2026-11-10-datasentre-vurdering-1600x900.webp) | `b4a8b953d659da15043445a2b1cc5ca3beb9cd4f` |
| hegseth | [`2026-11-10-hegseth-vurdering-1600x900.webp`](../redaksjon/illustrasjoner/2026-11-10-hegseth-vurdering-1600x900.webp) | `c3a814fae01eaf46ed5950d3910358a882731560` |
| teater | [`2026-11-10-nationaltheatret-toyen-vurdering-1600x900.webp`](../redaksjon/illustrasjoner/2026-11-10-nationaltheatret-toyen-vurdering-1600x900.webp) | `0e23fa1bb41adbd17f88d6bcbf0b11500bcb1716` |

**NB:** Repositoriet er offentlig. `noindex` hindrer ikke at noen åpner de direkte forhåndsvisnings- og bildeadressene.

## Redaksjonell kontroll og bildetekster

### Datasentre
- Illustrasjon av to personer i et kontrollmiljø, et lyst nettverkskart, kraftledninger og et datasenter. **Symbolsk, ikke Statnetts faktiske driftssentral eller en dokumentert teknisk situasjon.**
- Forslag til bildetekst: «KI-assistert redaksjonell illustrasjon om press på nettkapasiteten og menneskene som har ansvar for kraftsystemet. Ikke et fotografi fra Statnetts kontrollrom.»
- Alt: «To driftsingeniører i et illustrert norsk kontrollmiljø, med kraftledninger og et datasenter i bakgrunnen.»
- Sjekk før godkjenning: Eventuelle skjermdetaljer må ikke utgis for å være virkelige driftstall eller reell nettgrafikk.

### Hegseth / Massie
- Revidert selvstendig motiv viser to **adskilte symbolportretter** i ulike regjerings-/kongressmiljøer. Ikke den tidligere oppdiktede høringsscenen.
- Forslag til bildetekst: «KI-assistert redaksjonell illustrasjon av den politiske motsetningen mellom kongressrepresentant Thomas Massie og forsvarsminister Pete Hegseth. Motivene er symbolsk sammenstilt – ikke et fotografi fra et møte. Anklagene er ikke avgjort.»
- Alt: «To håndmalte portretter av Thomas Massie og Pete Hegseth i hver sine symbolske amerikanske maktmiljøer.»
- Sjekk før godkjenning: Gjenkjennelighet, korrekt personframstilling og om leseren oppfatter dette som kunstnerisk montasje.

### Nationaltheatret / Gamle Munch
- Revidert motiv viser to mennesker og en **modernistisk museumsfasade**, inspirert av Gamle Munch; det viser **ikke** en faktisk innflytting eller dokumentert arkitekturmåling.
- Forslag til bildetekst: «KI-assistert redaksjonell illustrasjon inspirert av Gamle Munch på Tøyen og planene om teaterdrift. Viser ikke en faktisk innflytting eller nøyaktig arkitekturfoto.»
- Alt: «To mennesker foran et illustrert modernistisk museumsbygg med glassoverbygg og høsttrær.»
- Sjekk før godkjenning: Den konkrete bygningen må ikke presenteres som en presis gjengivelse eller en fullført teaterombygging.

## Publiseringsstatus
- Manus og avisdesign: Klargjort som `redaksjon/forhandsvisning/` med `noindex,nofollow`. De tre faktiske vurderingsbildene er nå lagt inn som `<img>` på hver forhåndsvisning.
- Bildeutkast: Generert, samlet og kontrollert på teknisk oppløsning, **men ikke redaksjonelt godkjent**.
- GitHub-opplasting av binærfiler: **Gjennomført**, med base64-kodede Git-blobber og egne bildefiler under `redaksjon/illustrasjoner/`.
- Offentlig artikkel og `Nyhetshjul.json`: **Ikke endret** for disse tre nyhetssakene.
- Oljeartikkelen: Har fortsatt sitt tidligere godkjente menneskefokuserte hovedbilde.

## Før publisering
1. Få eksplisitt redaksjonell godkjenning av hver bildefil i faktisk full størrelse og utsnitt på mobil.
2. Etter godkjenning kopieres den **eksakt godkjente WebP** fra vurderingsmappen til `Bilder/Artikler/` på GitHub. Kontroller SHA-256 og publisert filadresse.
3. Kvalitetssikre aktuell fakta, kilder, eventuelle tilsvar og siste avstemningsresultat i Hegseth-saken.
4. Bygg publiserbare HTML-sider fra godkjent tekst og oppdater `img`, alt-tekst, bildetekst, `og:image`, `twitter:image`, forside og `Nyhetshjul.json` i én koordinert endring.
5. Verifiser faktisk GitHub Pages-utrulling og alle bildelenker.

Referanser: [Bildehåndboken](BILDEHANDBOK.md) · [Promptbiblioteket](PROMPTBIBLIOTEK-BILDER.md) · [Bildebriefene](BILDEBRIEFER-2026-11-10-FIRE-SAKER.md).
