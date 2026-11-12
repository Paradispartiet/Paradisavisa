# Paradisavisa – publiseringspakke for sju artikler

**Arbeidsdato:** 12. november 2026  
**Status:** Manusene er lagret som `utkast` og ikke godkjent for offentlig publisering.  
**Gjeldende arbeidskø:** `utkast/artikler.json`  
**Kilderevisjon:** PR #162, merget til `main`.  
**Kategoriprinsipp:** Én artikkel, ett offentlig kort, kun i riktig hovedstrøm. Ikke legg samme sak samtidig i Nyheter og Feature.

## Fordeling som skal brukes ved publisering

| Manus / artikkel-ID | Sjanger og kategori | Offentlig feed | Intern HTML-fil |
|---|---|---|---|
| `boligopproret-spania-20261112` | Nyheter · Verden og samfunn | `Nyhetshjul.json` | [Boligopprøret](../utkast/2026-11-12/boligopproret-spania.html) |
| `appene-som-manipulerer-20261112` | Feature · Teknologi og forbruker | `Nyhetshjul2.json` | [Manipulerende apper](../utkast/2026-11-12/appene-som-manipulerer.html) |
| `nussir-hvem-eier-kobberet-20261112` | Nyheter · Politikk og næringsliv | `Nyhetshjul.json` | [Nussir](../utkast/2026-11-12/nussir-hvem-eier-kobberet.html) |
| `smabarnsforeldre-jobbpress-20261112` | Nyheter · Arbeidsliv og familie | `Nyhetshjul.json` | [Småbarnsforeldre](../utkast/2026-11-12/smabarnsforeldre-jobbpress.html) |
| `gullbjornen-kasakhstan-20261112` | Nyheter · Forskning og historie | `Nyhetshjul.json` | [Gullbjørnen](../utkast/2026-11-12/gullbjornen-kasakhstan.html) |
| `avedon-fotografen-amerika-20261112` | Kultur · Film og fotografi | `Kulturhjul.json` | [Avedon](../utkast/2026-11-12/avedon-fotografen-amerika.html) |
| `norge-vannlekkasjer-20261112` | Nyheter · Samfunn og infrastruktur | `Nyhetshjul.json` | [Vannlekkasjer](../utkast/2026-11-12/norge-vannlekkasjer.html) |

Artikkelen om **KI og hjemmeeksamen er bevisst utelatt** fra denne produksjonsrunden.

## Hovedbilder – én tydelig billedidé per artikkel

Alle sju nåværende `utkast/2026-11-12/bilder/*.svg` er **interne skisser**, ikke ferdige hovedbilder. De skal ikke kopieres til `Bilder/Artikler/` som om de er godkjent. Bruk 16:9, normalt 1600 × 900, uten unødig beskjæring, og samme bildefil i artikkel, forsidekort og delingsmetadata.

| Artikkel | Endelig billedidé | Redaksjonell avgrensning |
|---|---|---|
| Boligopprøret | En stor demonstrasjon i regn, der kampen om retten til bolig kan leses gjennom byrommet og menneskene | Ekte foto krever dokumenterte foto-/publiseringsrettigheter. Eventuell generert scene skal tydelig merkes **KI-assistert illustrasjon, ikke foto fra protesten**. |
| Manipulerende apper | Telefon og digitale grensesnitt som trekker brukeren mellom varsler, abonnement og skjulte valg | Original illustrasjon; unngå falske faktiske skjermbilder fra navngitte apper. |
| Nussir | Fjord, mineralforekomst og industrilandskap som synliggjør konflikten mellom natur, gruve og eierskap | Dokumentarfoto må vise korrekt sted. Symbolillustrasjon skal ikke utgis for et fotografi av Nussir. |
| Småbarnsforeldre | En gjenkjennelig kveldsscene med arbeid og familieliv i samme rom | Generiske personer/illustrasjon, ikke portrett av en navngitt småbarnsfamilie. |
| Gullbjørnen | Selve arkeologiske funnet eller en tydelig merket, stilisert bjørnefigur mot jordlag | Et generert objekt er **ikke** dokumentasjon av hvordan originalartefakten ser ut; primærkilden fra Almaty gir korrekt referanse. |
| Avedon | Et atelier, studiokamera og et anonymt menneskeportrett i svart-hvitt | Fotografier tatt av Avedon eller hans portrett kan ikke brukes uten klarerte rettigheter. Ikke imiter et autentisk Avedon-fotografi. |
| Vannlekkasjer | Korrodert vannledning under gatelivet, gjerne et delvis gjennomskåret jordlag | Redaksjonell forklaringsillustrasjon, ikke kartlegging av faktisk lekkasje i en bestemt gate. |

## Kilde- og datokontroll

- **Madrid:** 120 000 er myndighetenes anslag; arrangører oppga høyere tall. Behold opphav for begge anslag. Kilder: AFP, EFE, Reuters, 11. november.
- **Digital Fairness Act:** EU-kommisjonens forslag er ikke vedtatt. Primærkilde publisert 11. november.
- **Nussir:** Planlagt oppkjøp; skille tidligere lederroller og politiske spørsmål fra dokumenterte, nåværende eierbindinger. Selskapets tilbakevisning skal beholdes. Stortingets skriftlige spørsmål er ikke besvart per kildekontrollen; oppdater ved utvikling.
- **Småbarnsforeldre:** SSBs artikkel viser 47,2 % og 37,1 %; spørsmålet måler selvrapportert jobb–privatliv-belastning, ikke diagnose eller årsakssammenheng. Artikkelsiden oppgir 10. november, forsideoversikten 11. november.
- **Gullbjørnen:** Almaty publiserte originalmeldingen 5. november; Live Science omtalte funnet 11. november. Syv mulige gravlagte er et foreløpig anslag.
- **Avedon:** Netflix oppgir premiere 11. november. Teksten er kulturhistorisk omtale, ikke en anmeldelse basert på egen visning.
- **Vann:** Regjeringen oppgir rundt 30 % vannsvinn; Norsk Vanns 411–535 mrd. er et beregnet investeringsbehov for **både vann og avløp**, ikke bare lekkasjer.

## Sikker publiseringsrekkefølge

1. Avklar endelige bildefiler, opphav/lisens og bildetekst for den enkelte artikkelen.
2. Kontroller siste hendelsesutvikling og rediger manus etter **[artikkelstandarden](ARTIKKELSTANDARD.md)**.
3. Gi hver artikkel individuell godkjenning før `status` og `faktasjekk` endres fra utkast.
4. Publiser **én artikkel om gangen**, med faktisk publiseringsdato i artikkelmetadata og **riktig** JSON-strøm fra tabellen over.
5. Bruk samme hovedbilde i artikkelen, forsidekortet og Open Graph-metadata. Ikke bruk upubliserte `utkast/`-lenker offentlig.
6. Kjør relevante målrettede kontroller, og kontroller den offentlige siden først etter vellykket deploy. Ikke send e-post eller aktiver ekstern kontopublisering.

**PR-merge av denne planen er ikke en artikkelpublisering eller bildegodkjenning.**
