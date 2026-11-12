# Nationaltheatret på Tøyen – fjerde levende artikkelpilot

**Revidert:** 11. november 2026  
**Publisert første gang:** 10. november 2026 (beholdes).  
**Artikkel:** [Nationaltheatret får en ny adresse på Tøyen](../artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html)  
**Felles standard:** [Artikkelstandard](ARTIKKELSTANDARD.md), [Levende artikler](LEVENDE-ARTIKLER.md), [Bildehåndbok](BILDEHANDBOK.md).

## Journalistisk prinsipp

Dette er en nyhetsartikkel om en **valgt plan**, ikke et ferdig ombygd teaterhus. Hovedscenen skal flyttes midlertidig til Gamle Munch mens teaterbygningen i sentrum rehabiliteres. Etterpå planlegges biscenene videreført på Tøyen. Pressemeldingen fastsetter oppstart av forprosjekt i 2027, **ikke** dato for ferdigstillelse. Hovedbildet fra Gamle Munch er fortsatt et eldre, rettighetsdokumentert fotografi av bygget – ikke et bilde av en ferdig teaterscene.

## Oppgradering av fortellingen

1. Syv synlige kildehenvisninger under avsnitt om prosjektplan, historikk, alternativer, økonomi og reaksjoner. De eksisterende elleve nummererte kildene beholdes.
2. Et originalt, forstørrbart SVG-diagram av **midlertidig hovedscene / hovedscene tilbake i sentrum + varige biscener på Tøyen**, uttrykkelig merket skjematisk illustrasjon og ikke byggtegning.
3. Interaktiv tofaset forklaring, lesbar både med og uten JavaScript.
4. Klikkbar faktaboks om hva en biscene er, hva som er planlagt og hva som fortsatt er ukjent.
5. Firepunkts tidslinje fra Nationaltheatrets åpning i 1899, via regjeringens løsning 2025, stedvalg 2026 og **planlagt** forprosjekt 2027.
6. Ingen kunstig meningsmåling: historiske og praktiske spørsmål forklares bedre med kilder og tidslinje enn med avstemningsprosent.
7. Den versjonerte delte stilfilen `artikkel.css?v=20261111b` er tatt i bruk både her og i de tre tidligere levende artiklene, demoen og den kanoniske malen. Dette skal redusere risikoen for at tidligere stor gul «Forstørr»-knapp blir værende i nettleserens cache.

## Kildegrunnlag og reservasjoner

| Tema | Primærkilde | Redaksjonelt forbehold |
| --- | --- | --- |
| Valg av Gamle Munch, 14 tilbud, hovedscene/biscener, forprosjekt 2027 | [Kultur- og likestillingsdepartementet, 10.11.2026](https://www.regjeringen.no/no/aktuelt/regjeringa-vil-bruke-gamle-munch-pa-toyen-som-teaterhus-med-biscener-for-nationaltheatret/id3192180/) | En valgt plan er ikke et ferdigstilt prosjekt eller vedtatt sluttbudsjett |
| 2025-løsningen | [Regjeringen, 4. juli 2025](https://www.regjeringen.no/no/aktuelt/regjeringen-har-valgt-losning-for-nationaltheatret/id3114310/) | Alternativene var fortsatt gjenstand for debatt |
| Teaterets historiske åpning i 1899 | [Kulturministerens tale, 10.11.2026](https://www.regjeringen.no/no/aktuelt/et-nationaltheater-for-fremtiden/id3192189/) | Historisk opplysning, ikke ny teaterevent |
| Andre forslag under behandling | [Stortinget, Innst. 24 S](https://www.stortinget.no/no/saker-og-publikasjoner/publikasjoner/innstillinger/stortinget/2026-2027/inns-202627-024s/?all=true) | Ikke påstand om at komiteens alternativ ble valgt |
| Salgspris for eiendommen: 111 mill. kroner, i henhold til takst | [Oslo kommune, 10.11.2026](https://aktuelt.oslo.kommune.no/oslo-kommune-selger-gamle-munch) | Primærkilde: Salget må vedtas endelig av bystyret. Ikke et totalbudsjett for teaterprosjektet |
| Tøyens lokale kulturmiljøer | [Kunstavisen, mars 2026](https://kunstavisen.no/nyheter/nationalteateret-tar-over-det-gamle-munchmuseet-pa-toyen), [VårtOslo, desember 2025](https://www.vartoslo.no/bydel-gamle-oslo-bydel-grunerlokka-gamle-munch/gamle-munch-har-blitt-hjertet-pa-toyen-na-star-byradet-klare-til-a-stoppe-pulsen/1059940), [Oslo kommune, 10.11.2026](https://aktuelt.oslo.kommune.no/oslo-kommune-selger-gamle-munch) | Kommunen arbeider med erstatningslokaler, men det dokumenterer ikke at nye lokaler er sikret. Gamle reaksjoner må ikke framstilles som svar på novemberbeslutningen |

## Bilde- og teknisk kontroll

Godkjent hovedbilde forblir `Bilder/Artikler/2026-11-11-gamle-munch-arkivfoto.webp`, fotografert 18. juni 2005 av J. P. Fagerback, med [BSD-3-Clause-vilkår dokumentert](../Bilder/Artikler/2026-11-11-gamle-munch-arkivfoto-LISENS.md). Felles stil begrenser høyden uten å beskjære bildet hardt. Delingsmetadata peker fortsatt på det faktiske arkivfotoet.

Den nye forklaringsgrafikken er original SVG, uten å fremstille seg som arkitekt- eller tekniske plantegninger. Den bruker en liten, diskret «Forstørr»-lenke med presis skjermleseretikett, ikke stor gul knapp.

**Automatiske kontroller:** `node --test scripts/nationaltheatret-levende.test.cjs` og `node scripts/levende-artikkel-browser.cjs` (mobil 390 px, iPad stående 820 px, iPad liggende 1180 px, PC 1440 px og uten JavaScript). De er koblet til eksisterende GitHub Actions-flyter.

Etter merge: kontroller faktiske GitHub Pages-URL-er og at artikkelens oppdaterte CSS hentes.
