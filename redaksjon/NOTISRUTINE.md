# Paradisavisa – daglig notisarbeid og Paradisradioen

**Gjelder:** `notiser.json` og den lokale Web Speech-opplesningen i Paradisradioen.
**Siste redaksjonelle oppdatering:** 11. november 2026.
**Publiseringsprinsipp:** Fortløpende, etter kontroll av **hver enkelt notis**. Ingen bundling eller faste publiseringsklokkeslett. Se `REDAKSJONSPLAN.md`.

## Formål

Hold notisbånd og radio relevant uten å gjøre dem til en automatisk nyhetsgenerator.
Den daglige statusrapporten peker på mangler i **eksisterende** notiser. Den finner ikke nye
hendelser, bekrefter ikke faktiske påstander og gir aldri publiseringsgodkjenning.

## 1. Finn saker med reell nyhetsverdi

Gjennomgå kilder når nyhetsbildet krever det, gjerne morgen og ettermiddag.
Prioriter nye, dokumenterte hendelser fremfor å fylle et antall eller opprettholde en kunstig rotasjon.
Vurder både Norge, verden, politikk, økonomi, arbeid, kultur, klima, vitenskap, teknologi og sport,
men behold sakene under presise, redaksjonelle kategorier.

Eksempler på kilder å **undersøke manuelt**:

| Tema | Mulige primærkilder | Uavhengig kontroll |
|---|---|---|
| Norsk politikk og forvaltning | regjeringen.no, Stortinget, departementer, kommuner | NRK, redaktørstyrte aviser |
| Økonomi og arbeidsliv | SSB, Norges Bank, offentlige statistikker, partenes dokumenter | Reuters, NRK, økonomiredaksjoner |
| Verden og konflikter | myndigheter, FN-organer, internasjonale organisasjoner | Reuters, AP, AFP, andre uavhengige kilder |
| Teknologi og beredskap | Nkom, NSM, NVE, DSB, virksomhetenes originalmeldinger | flere redaksjonelle medier |
| Kultur og sport | arrangør, forbund, kulturinstitusjon | redaksjonell kontroll av resultater og program |
| Klima, natur og forskning | Meteorologisk institutt, Miljødirektoratet, SSB, fagrapporter | uavhengig faglig og journalistisk kilde |

Ikke behandl en pressemelding som uavhengig bekreftelse. Ved alvorlige, usikre eller bestridte
påstander: oppgi tydelig hvem som hevder hva, og kontroller helst mot flere uavhengige kilder.
Skriv ikke som om et forslag er et vedtak, en avtale er gjennomført, eller en siktelse er en dom.

## 2. Én kildekontrollert notis om gangen

Før en notis blir en ny oppføring i `notiser.json`:

1. Les originalkilden og kontroller dato, riktig status, tall, personnavn og sted.
2. Skriv kort, etterprøvbart og forståelig. Normalt 25–55 ord; innhold veier tyngre enn kvoten.
3. Legg ved kilde som direkte HTTPS-lenke til relevant artikkel/rapport/uttalelse.
4. Legg inn **faktisk** dato i `date` (`YYYY-MM-DD`). Ikke dater en eldre nyhet på nytt.
5. Bruk stabil, unik `id` for nye notiser. Ved retting: behold samme ID og oppdater
   teksten etter kildesjekk. Endre ikke en gammel sak til en annen sak med samme ID.
6. Angi `expires` når opplysningen raskt mister aktualitet, f.eks. før en kamp,
   planlagt møte eller pågående hendelse. Utløpsdatoen er inklusive den angitte dagen.
7. Ikke lag `speechText` med andre fakta enn det redaksjonelt godkjente innholdet.
   Dersom uttale krever tilpasning, kontroller at ordlyden bevarer meningen.
8. Kontroller samme kilde, sak og dato opp mot eksisterende notiser før ny oppføring.
9. Publiser først når notisen er **redaksjonelt godkjent**, testet og merget som en
   konkret endring. Ingen CI-test erstatter faktasjekk.

**Kort eksempel på format** (fiktiv testnotis, ikke en nyhet som skal publiseres):

```json
{
  "id": "notis-eksempel-20261111",
  "category": "Samferdsel",
  "text": "Kort og dokumentert tekst om en faktisk kontrollert hendelse.",
  "date": "2026-11-11",
  "expires": "2026-11-14",
  "url": "https://example.org/originalkilde"
}
```

## 3. Les dagens statusrapport

Kjør manuelt:

```sh
node scripts/notisstatus.cjs
node --test scripts/notisstatus.test.cjs
```

For en konkret norsk dato:

```sh
node scripts/notisstatus.cjs --date 2026-11-11
```

GitHub Actions: **«Paradisavisa – daglig redaksjonell notisstatus»**
(`.github/workflows/daglig-notisstatus.yml`).

- Kjøring klokken **07:15 UTC** hver dag (08:15 om vinteren, 09:15 om sommeren i Oslo).
- Kan også startes via **Run workflow**, og kjører ved relevante PR-er og `main`-endringer.
- Se sammendraget i GitHub Actions for aktive, nye, snart utløpte og utløpte notiser,
  kategorioversikt, manglende stabile ID-er og ugyldige/dupliserte kilder.
- **Teknisk ugyldige** datoer, kilder og duplikater gjør jobben rød. **Få/ingen ferske
  notiser er redaksjonell oppfølging**, ikke feil som automatisk blokkerer avisa.
- Jobben har kun lesetilgang, kontakter ingen eksterne nyhetskilder, lager ikke PR/issue,
  sender ikke e-post og skriver aldri tilbake til `notiser.json`.
- Denne rutinen er **ikke** bakgrunnspublisering. Det finnes ingen automatisk AI-oppsummering
  eller lydpublisering knyttet til den.

## 4. Følg opp uten å forfalske arkivet

- Utløpte saker skjules av radiosidens ferskhetsfilter. Ikke oppdater `date` bare for
  å få dem tilbake i spillelisten; lag heller en *ny* notis ved en reell utvikling.
- En rettelse i samme hendelse beholder samme ID og oppdateres mot en dokumentert kilde.
- Fjern eller arkiver utløpte meldinger i en kontrollert redaksjonell endring når det er hensiktsmessig.
- Seks eldre notiser kan mangle `id`; de varsles i rapporten, men slettes ikke eller
  «oppgraderes» automatisk.
- `notiser.json` er én felles, godkjent strøm for notisbånd og radio. Ikke lag en separat
  konkurrerende nyhetsliste.

## 5. Radio og stemmer

Radioen bruker fremdeles enhetens norske systemstemme og `speechSynthesis`.
Taletempo er normalt, mens **x2/x4/x5 gjelder kun tekstbåndet**.
Vox er bevart som privat kvalitetsreferanse med uavklart offentlig modellrett, ikke aktivert.
Daglig notisarbeid må ikke endre denne beslutningen eller åpne MP3-publiseringsporten.

**Ferdigkriterium for én notis:** faktisk hendelse, riktig dato, korrekt kilde,
presis formulering, eventuelt utløp, unikt ID, redaksjonell godkjenning, grønne tester,
og kontrollert offentlig visning etter merge.
