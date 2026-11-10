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

**Oppdatert ingress og forsidekort:** Datasentersaken omtaler nå direkte at Dokument 8:34 LS omfatter tilknytnings-/investeringsplikten for **nye uttakskunder over 1 MW**, også utenfor datasenterbransjen, og presiserer at forslaget **ikke er vedtatt**. Dette er en rettslig foreslått endring, ikke Statnetts gjeldende stopp. [Originalforslag](https://www.stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Representantforslag/2026-2027/dok8-202627-034ls/)

## Kontroll av originale kilder og lenker – 10. november kveld

- **Statnett / regjeringen:** Regjeringens pressemelding 9. november bekrefter midlertidig stans i nye reservasjoner og intensjon om konsesjonsordning. Den engelske versjonen av pressemeldingen presiserer at hovedprinsippene planlegges presentert **høsten 2027**, ikke at selve konsesjonsordningen allerede er innført. Kilder: https://www.regjeringen.no/no/aktuelt/regjeringen-vil-ha-en-kontrollert-vekst-av-samfunnsnyttige-datasentre-i-norge/id3192054/ · https://www.regjeringen.no/en/whats-new/government-seeks-controlled-growth-of-data-centres-in-norway/id3192054/
- **Lovforslaget:** Stortingets Dokument 8:34 LS foreslår et midlertidig unntak fra nettselskapenes tilknytnings- og investeringsplikt for **alle nye uttakskunder med effektbehov over 1 MW**. Tilknytningsstans rettet mot datasentre ligger i et separat anmodningsforslag. Ingen av delene er vedtatt. Kilde: https://www.stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Representantforslag/2026-2027/dok8-202627-034ls/
- **Motstemmer:** Fellesforbundets pressemelding 9. november og Norsk Datasenterindustris pressemelding samme dag er kontrollerbare kilder til deres respektive standpunkter. Tall om investeringer og arbeidsplasser må fortsatt attribueres, ikke framstilles som en egen verifikasjon. Kilder: https://kommunikasjon.ntb.no/pressemelding/19134904/datasenter-regjeringen-tar-kontroll?publisherId=17846982 · https://www.datasenterindustrien.no/ber-om-forutsigbarhet-og-tiltak-som-virker-na
- **Nationaltheatret:** Regjeringens pressemelding bekrefter midlertidig hovedscene på Gamle Munch og permanente biscener etter rehabiliteringen. Den sier at forprosjektfasen starter i 2027, men oppgir ikke samlet sluttkostnad. Kilde: https://www.regjeringen.no/no/aktuelt/regjeringa-vil-bruke-gamle-munch-pa-toyen-som-teaterhus-med-biscener-for-nationaltheatret/id3192180/
- **Tøyens kulturmiljø:** Kunstavisen/NTB sin publisering 17.–18. mars 2026 bekrefter Mobasheris eldre uttalelse; VårtOslo-innlegget er uttrykkelig et **debattinnlegg fra 5. desember 2025**, ikke en fersk reaksjon eller uavhengig analyse. Kilder: https://kunstavisen.no/nyheter/nationalteateret-tar-over-det-gamle-munchmuseet-pa-toyen · https://www.vartoslo.no/bydel-gamle-oslo-bydel-grunerlokka-gamle-munch/gamle-munch-har-blitt-hjertet-pa-toyen-na-star-byradet-klare-til-a-stoppe-pulsen/1059940
- **USA:** Massies kontor publiserer oversikt over åtte anklager. Anklagene er **påstander fra forslagsstilleren**, ikke påvist skyld. Republican Cloakroom viser prosedyreforslaget på dagsplanen 10. november, men hadde på kontrolltidspunktet ikke offentliggjort et voteringstall. Den dynamiske siden `repcloakroom.house.gov` kan endres; erstatt med **permanent offisiell roll-call-lenke** når resultatet er publisert. Kilder: https://massie.house.gov/news/documentsingle.aspx?DocumentID=395863 · https://repcloakroom.house.gov/ · https://clerk.house.gov/Votes

**Denne kildesjekken erstatter ikke oppdatering på faktisk publiseringstidspunkt. Ingen konklusjon om Hegseth-voteringen før offisielle tall foreligger.**

## Praktisk publiseringsport

- [ ] Godkjenn de tre bildene redaksjonelt – de er fortsatt **vurderingsutkast**.
- [ ] Oppdater Hegseth-resultatet etter avstemning og gjør journalistisk nyvurdering.
- [ ] Sett korrekt faktisk publiseringsdato ved merge og oppdater HTML/metadata/forsidekort samlet.
- [ ] Vurder person- og stedstroverdighet i de KI-assisterte illustrasjonene.
- [ ] Kontroller responsivt utsnitt, navigasjon og delingsbilder når artikkelsidene deployeres etter merge.
- [ ] Bekreft at kilder og bakgrunn ikke er endret etter denne kontrollen.

**Ikke tolke denne kontrollrapporten som brukerens godkjenning av de tre bildene.** PR-en skal forbli et utkast til sluttsjekken er utført.
