# Publiseringspakke – tre saker fra 10. november 2026

**Status: UTKAST I EGEN GREN. Ikke slå sammen denne PR-en uten redaksjonell sluttkontroll.**  
Opprettet: 10. november 2026. Denne grenen inneholder foreslåtte offentlige artikkelsider, kopier av de faktiske WebP-bildene og en oppdatert `Nyhetshjul.json`. Ingen av endringene er på `main` før PR-en merges.

## Artikler til gjennomgang

1. [Hvem skal få Norges strøm?](../artikler/2026-11-10-hvem-skal-fa-norges-strom.html) — [bilde](../Bilder/Artikler/2026-11-10-datasentre-kraftnett.webp)
2. [Republikaner utfordrer Trumps forsvarsminister](../artikler/2026-11-10-massie-hegseth-riksrettsforslag.html) — [bilde](../Bilder/Artikler/2026-11-10-massie-hegseth.webp)
3. [Nationaltheatret får biscener på Tøyen](../artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html) — [bilde](../Bilder/Artikler/2026-11-10-nationaltheatret-toyen.webp)

## Betydningsfulle skiller

- **Datasentre:** Statnetts tekniske midlertidige stans, regjeringens planlagte konsesjonsordning og Stortingets representantforslag er tre ulike prosesser. Høringen 24. november klokken 13.15 er bekreftet. Statnett stanser ikke all tilknytning. [Statnett](https://www.statnett.no/om-statnett/nyheter-og-pressemeldinger/nyhetsarkiv-2026/midlertidige-tiltak-for-fortsatt-forsvarlig-systemdrift/) · [Stortingets høring](https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/Horing/horing/?h=10006019)
- **Hegseth:** Per 10. november før kveldens ventede votering er riksrettsforslaget **ikke avgjort**. Artikkelens prosedyreavsnitt og eventuelt også tittel/ingress **MÅ oppdateres etter voteringen**. En prosedyreavstemning er ikke det samme som dom eller avsettelse. [House schedule](https://www.majorityleader.gov/schedule/default.aspx)
- **Tøyen:** Gamle Munch er valgt for bruk under rehabiliteringen og som permanente biscener. Hovedscenen ved Studenterlunden rehabiliteres. Rapportert kjøpesum 111 millioner kroner er ikke totalbudsjett, og lokale kulturaktørers framtidige plass er uavklart. [Regjeringen](https://www.regjeringen.no/no/aktuelt/regjeringa-vil-bruke-gamle-munch-pa-toyen-som-teaterhus-med-biscener-for-nationaltheatret/id3192180/) · [Subjekt](https://subjekt.no/2026/11/10/nationaltheatret-gamle-munch-toyen/)

## Må gjøres før PR-merge

- [ ] Redaktør har sett og godkjent **alle tre eksakte WebP-bildene** i full størrelse og mobil-/forsideutsnitt.
- [ ] Kontroller at illustrasjonene ikke framstilles som ekte foto eller autentiske situasjoner; les bildetekstene.
- [ ] Oppdater Hegseth-saken mot **offisielt voteringstall** etter at avstemningen er gjennomført. Hvis nyhetsbildet endres, oppdater også overskrift, ingress, forsidekort og datofelt.
- [ ] Kontroller om publiseringsdato skal være 10. eller 11. november, og juster `article:published_time`, synlig datolinje og `Nyhetshjul.json`.
- [ ] Kontroller kildehenvisningene; ingen intervjuer er gjennomført direkte av Paradisavisa.
- [ ] Verifiser at alle bilde-SHAene er identiske med vurderingsfilene; ingen SVG eller regenerering.
- [ ] Forhåndsvisning i PR; test mobil, desktop, `og:image`, `twitter:image` og lenkene fra forsiden.
- [ ] **Først etter alt dette:** merge PR til `main`; sjekk GitHub Pages-deploy og nyhetshjulet.

**Viktig:** Sidene og forsidekortene er lagt i denne grenen kun for redaksjonell review. Denne utgaven av `Nyhetshjul.json` blir aktiv **først hvis** grenen merges. Den levende forsiden er uendret.
