# Redaksjonell sluttkontroll – 1. november 2026

**Arbeidsdokument, ikke publiseringsvedtak.** De 15 aktive artiklene ligger fortsatt i `utkast/` med `faktasjekk: kreves`, `godkjent: false` og `publisert: false`. Én artikkel er arkivert. Tekniske tester, kildeinnhenting og redaksjonell godkjenning er forskjellige kontrolltrinn. `noindex` reduserer søkemotorindeksering, men gjør ikke en utkastside privat.

## Først: tidskritisk oppfølging

**Mandag 2. november 2026 kl. 11.00** er Helsereformutvalgets utredning annonsert overlevert. Etter faktisk offentliggjøring skal originalrapporten leses og bakgrunnssaken i [PR #17](https://github.com/Paradispartiet/Paradisavisa/pull/17) oppdateres. Vurder anbefalinger, dissenser, økonomi, pasientforløp og personellkonsekvenser. Skil forslag fra politisk vedtak. Sammenhold også rapporten med erfaringene fra Prosjekt X i PR #18.

Offisiell kilde: https://www.regjeringen.no/no/aktuelt/helsereformutvalet-legg-fram-si-utgreiing/id3178280/

## Utestående journalistiske kontroller, én sak om gangen

| PR | Artikkel | Viktigste utestående kontroll |
|---|---|---|
| [#3](https://github.com/Paradispartiet/Paradisavisa/pull/3) | NSM / cyberrisiko | Sjekk nyeste risikonivå, hendelser og NSMs presiseringer før publisering. |
| [#5](https://github.com/Paradispartiet/Paradisavisa/pull/5) | Meta og mediehusene | Les originalkjennelsen fra Oslo tingrett; kontroller eventuelle nye rettsmøter, anker, vilkår og den britiske CMA-prosessen. |
| [#6](https://github.com/Paradispartiet/Paradisavisa/pull/6) | Støre, Stubb og Putin | Kontroller original russisk uttalelse og etterfølgende forhandlingsstatus, inkludert planlagte møter i Abu Dhabi. |
| [#7](https://github.com/Paradispartiet/Paradisavisa/pull/7) | Equinors kvartalsresultat | Sjekk nye børsmeldinger og korreksjoner; hold justerte, rapporterte og etter-skatt-resultater adskilt. |
| [#8](https://github.com/Paradispartiet/Paradisavisa/pull/8) | WMO / klimagasser | Kontroller eventuelle korrigerte WMO-data; tallene gjelder måleåret 2025, publisert i 2026. |
| [#9](https://github.com/Paradispartiet/Paradisavisa/pull/9) | Norske havområder | Gå gjennom endelig OECM-kart/metode, reell bevaringseffekt og relevante innvendinger. Ikke summer ulike forskningsutvalg. |
| [#10](https://github.com/Paradispartiet/Paradisavisa/pull/10) | Bortfall av mobilnett | Sjekk nyeste DSB/Nkom-råd og kommunenes bekreftede fysiske informasjonspunkter, der det er relevant. |
| [#11](https://github.com/Paradispartiet/Paradisavisa/pull/11) | Pensjonsinformasjon | Kontroller høringsstatus og originalnotat; skill strategiforslag fra vedtatte pensjonsregler. |
| [#12](https://github.com/Paradispartiet/Paradisavisa/pull/12) | Arbeidstidsunntak | Les hele OsloMet-AFI-rapporten, kontroller metode/utvalg og vurder relevante syn fra arbeidslivets parter. Selvrapporterte unntak er ikke påviste lovbrudd. |
| [#13](https://github.com/Paradispartiet/Paradisavisa/pull/13) | MATATA / Oslo World | Bekreft faktiske spillekvelder og starttid (arrangørkilder avviker), rollebesetning og eventuell endret billettstatus. Ikke skriv anmeldelse uten egen dekning. |
| [#14](https://github.com/Paradispartiet/Paradisavisa/pull/14) | HEX / Witch Club Satan | Avklar spilletid (92/93 min) og om annonserte spesialvisninger fant sted; ikke presenter program som bekreftet gjennomføring. |
| [#15](https://github.com/Paradispartiet/Paradisavisa/pull/15) | Markens grøde | Avklar spilletid (149/155 min), oppdatert internasjonal prisstatus og eventuelle endrede kinovisninger. Skil kortliste fra nominasjon og tildelt pris. |
| [#16](https://github.com/Paradispartiet/Paradisavisa/pull/16) | Renata Flores / Oslo World | Bekreft om konserten fant sted og hva som skjedde; arrangørkilder oppga ulike tider (14/15) for samtale. Ingen konsertanmeldelse uten observasjon. |
| [#17](https://github.com/Paradispartiet/Paradisavisa/pull/17) | Helsereformutvalget | **Må oppdateres etter 2. november kl. 11.00** ut fra publisert NOU. Fram til da kun bakgrunn om mandat og spørsmål. |
| [#18](https://github.com/Paradispartiet/Paradisavisa/pull/18) | Prosjekt X / 14 helsepiloter | Les fullstendig rapport og prosjektevalueringer. Sju prosjekter hadde erfaringsgrunnlag; ikke framstill alle 14 som dokumentert virksomme. |

## Sikker arbeidsflyt

1. Bruk offisielle dokumenter og uavhengige kilder, noter hva som er kontrollert og hva som mangler.
2. Oppdater én artikkel i separat PR. Ikke endre `utkast/artikler.json` til godkjent/publisert under kildearbeidet.
3. Behold synlig `REDAKSJONELT UTKAST – IKKE PUBLISERT` og `<meta name="robots" content="noindex, nofollow">` til individuell godkjenning.
4. Krev både artikkelvalidering og nettlesertest; beståtte tester er **ikke** faktagodkjenning.
5. Før først en uttrykkelig redaksjonell beslutning, deretter eventuelt en separat publiseringsprosess for **én** artikkel.
6. Ingen e-post eller ekstern kontakt skal utføres uten ny uttrykkelig instruks.

**Status per 1. november:** 15 åpne artikkel-PR-er (#3, #5–#18) som utkast. Dette dokumentet er en arbeidsliste, ikke en publiseringsplan med automatisk tidsfrist.
