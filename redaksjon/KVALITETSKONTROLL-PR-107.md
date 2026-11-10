# Teknisk og redaksjonell kontroll – utkast-PR #107

**Dato:** 10. november 2026 (kveld norsk tid).  
**PR:** https://github.com/Paradispartiet/Paradisavisa/pull/107  
**Status:** Teknisk gjennomgang utført. **Utkast – ikke publiseringsgodkjent.**

## Kontroller utført

| Punkt | Datasentre | Hegseth | Nationaltheatret |
| --- | --- | --- | --- |
| Norsk språk og én synlig hovedtittel | OK | OK | OK |
| Metabeskrivelse for søk og deling (kortversjon) | OK | OK | OK |
| Kanonisk artikkellenke | OK | OK | OK |
| `og:image` og `twitter:image` | OK | OK | OK |
| Delingsbildeformat 1600 × 900 og beskrivende alt | OK | OK | OK |
| Faktisk WebP-bildefil lagret i utgivelsesgrenen | OK | OK | OK |
| KI-assistert redaksjonell illustrasjon merket under bildet | OK | OK | OK |
| Alle interne referanser til kildeankre | OK | OK | OK |
| Foreslått kort i `Nyhetshjul.json` | OK | OK | OK |
| Redaksjonell endelig bildegodkjenning | **Mangler** | **Mangler** | **Mangler** |
| Aktualitetskontroll rett før publisering | **Mangler** | **Kritisk** | **Mangler** |

## Binær integritet

Disse WebP-filene er kopier av vurderingsbildene; Git-blob-SHAene er identiske med filene i `redaksjon/illustrasjoner/`.

| Bildefil | Git blob-SHA | Filstørrelse |
| --- | --- | ---: |
| `Bilder/Artikler/2026-11-10-datasentre-kraftnett.webp` | `b4a8b953d659da15043445a2b1cc5ca3beb9cd4f` | 325 626 byte |
| `Bilder/Artikler/2026-11-10-massie-hegseth.webp` | `c3a814fae01eaf46ed5950d3910358a882731560` | 226 178 byte |
| `Bilder/Artikler/2026-11-10-nationaltheatret-toyen.webp` | `0e23fa1bb41adbd17f88d6bcbf0b11500bcb1716` | 325 506 byte |

## Redaksjonell faktakontroll

**Primærkilde-sjekk 10. november:** Dokument 8:34 LS inneholder et lovforslag om unntak fra tilknytnings- og investeringsplikten for alle **nye uttakskunder over 1 MW**, samtidig som et separat anmodningsforslag er rettet mot datasentre. Artikkelen må skille disse fra hverandre. Et slikt unntak er ikke et generelt forbud mot strømforbruk. [Originaldokument](https://www.stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Representantforslag/2026-2027/dok8-202627-034ls/)

**Datasentre:** Offisielt representantforslag om midlertidig stans er fortsatt under komitébehandling, ikke vedtatt. Høringen 24. november kl. 13.15 og søknadsfristen 16. november kl. 14.00 er bekreftet av Stortinget. De tekniske tiltakene fra Statnett og regjeringens konsesjonsplan må ikke omtales som samme vedtak.  
Kilder: https://www.stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Representantforslag/2026-2027/dok8-202627-034ls/ · https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/Horing/horing/?h=10006019

**Hegseth:** Massie har fremmet åtte anklagepunkter. Hegseth avviser dem. En prosedyreavstemning er varslet til sent tirsdag kveld norsk tid. **Ikke slå sammen denne PR-en uten det offisielle resultatet** og gjennomgang av konsekvenser for ingress, datolinje og nyhetshjulkort. Ikke framstill en eventuell prosedyreavstemning som en endelig riksrettsdom.  
Kilder: https://www.reuters.com/world/pentagon-chief-hegseth-calls-moves-impeach-him-farce-that-will-fail-2026-11-10/ · https://apnews.com/article/87a78193502f716e6fb8eee5aef06ac0

**Nationaltheatret:** Regjeringens kunngjøring 10. november bekrefter Gamle Munch som midlertidig hovedscene og framtidige biscener. Hovedbygningen skal rehabiliteres. Forprosjekt varslet i 2027. Oppgitt kjøpesum på 111 millioner kommer fra Subjekt med Aftenposten som underliggende kilde og er **ikke** verifisert direkte mot kjøpsavtale.  
Kilder: https://www.regjeringen.no/no/aktuelt/regjeringa-vil-bruke-gamle-munch-pa-toyen-som-teaterhus-med-biscener-for-nationaltheatret/id3192180/ · https://subjekt.no/2026/11/10/nationaltheatret-gamle-munch-toyen/

## Praktisk publiseringsport

- [ ] Godkjenn de tre bildene redaksjonelt – de er fortsatt **vurderingsutkast**.
- [ ] Oppdater Hegseth-resultatet etter avstemning og gjør journalistisk nyvurdering.
- [ ] Sett korrekt faktisk publiseringsdato ved merge og oppdater HTML/metadata/forsidekort samlet.
- [ ] Vurder person- og stedstroverdighet i de KI-assisterte illustrasjonene.
- [ ] Kontroller responsivt utsnitt, navigasjon og delingsbilder når artikkelsidene deployeres etter merge.
- [ ] Bekreft at kilder og bakgrunn ikke er endret etter denne kontrollen.

**Ikke tolke denne kontrollrapporten som brukerens godkjenning av de tre bildene.** PR-en skal forbli et utkast til sluttsjekken er utført.
