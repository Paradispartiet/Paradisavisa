# Publiseringsvurdering: Binance og Serbia
**Kildestatus:** 2. november 2026  
**Status:** Ferdige og kildejusterte utkast til individuell publiseringsbeslutning. **Ingen publiseringsgodkjenning eller publisering utført.**

## Konklusjon

**Binance:** Saken kan omtale selve tyveriet, FBIs tilskrivelse, Binances *foreløpige* tekniske beskrivelse og selskapets egne opplysninger om dekning nå, **uten** å hevde at etterforskningen eller gjenfinningen er avsluttet. Den endelige tekniske rapporten trengs **før** man kan trekke sikre konklusjoner om årsak og sikkerhetssvikt, men fraværet gjør ikke den avgrensede nyhetssaken ugyldig. Anbefalt redaksjonell prioritet **1**.

**Serbia:** Valgresultatet er dokumentert på stemmenivå med alle valglokalene i RIKs publiserte oversikt 2. november. Den studentstøttede listen fikk **53,01 %**, Vučić-listen **38,98 %**, og deltakelsen var **68,89 % (4 444 310 avgitte stemmer)**. Et mandatanslag på **140 av 250** kommer fra uavhengige valgobservatører og uavhengig utregning, **ikke** den formelt vedtatte mandatprotokollen. Påstanden om mulig stemmekjøp er fjernet fra leserteksten i mangel av selvstendig dokumentasjon og samtidig tilsvar. Anbefalt prioritet **2**.

## Tre regnskap i Binance-saken – må aldri slås sammen

| Spørsmål | Kildebelagt informasjon 2.11 | Ikke utled dette |
|---|---|---|
| Hva ble stjålet? | Binance anslår **ca. 6,3 mrd. USD** | Ikke fastslått rettslig total eller identifiserte gjerningspersoner |
| Hvor mye er fryst? | Binance sa 30.10 **ca. 3 mrd. USD fryst i kryptonettverk** | Ikke penger returnert til kunder |
| Hvem dekker tapet? | Binance sa 1.11 at **ca. 95 % av berørte aktiva** var dekket gjennom tilførsel av reserveeiendeler | Ikke 95 % av tyvegodset tilbakeført; ikke 100 % dekning |
| Reaksjon fra kundene | Reuters 2.11: først 3,64 mrd. USD netto uttak i de første 9,5 timene, senere 4,72 mrd. USD i en **lengre måleperiode** | Ikke enda et hackerangrep eller to uavhengige beløp som kan summeres |

FBIs tilskrivelse er en myndighetsvurdering, **ikke en dom**. Binances forklaring om kompromittert DevOps-datamaskin er foreløpig; flere angrepspunkter undersøkes. Sjekk gjenåpnede uttaksnettverk og nye reserve-/post-mortem-oppdateringer umiddelbart før publisering.

## Serbia – valgresultat kontra mandatutregning

- RIK/serbiske myndigheter 2.11 har offentliggjort stemmer fra **8 392 av 8 392 valglokaler**, etter omvalg ved 53 valglokaler.
- **53,01 %** til Student List; **38,98 %** til United Serbia; valgdeltakelse **68,89 %**.
- **140 mandater** er en foreløpig uavhengig beregning etter omvalget; **141 mandater** ble rapportert i tidligere, ikke endelig telling.
- Endelig fordeling må leses i **offisiell mandatprotokoll** før tallet skrives som vedtatt.
- Ingen stemmekjøpsanklager skal framsettes som fakta uten selvstendig dokumentasjon og reell mulighet for berørte til å svare.

## Før faktisk publisering av hver artikkel

1. Kontroller nyeste opplysninger og kildeoppdateringer på den faktiske publiseringsdagen.
2. Sjekk originalkilder, alle konkrete tall, hva som er påstand, motpartenes tilsvar, overskrift og omtalen av ansvar.
3. Gjennomgå faktiske HTML-utkast og deres billedtekster (symbolillustrasjoner, ikke dokumentarfoto).
4. Godkjenn **én** artikkel eksplisitt i redaksjonen, med `faktasjekk: "godkjent"` og `godkjent: true` **bare dersom kravene er oppfylt**.
5. Kjør `scripts/publiser-artikkel.cjs` for **den ene godkjente artikkelen**, oppdater riktig nyhetsstrøm, kontroller CI, og flett først etter egen publiseringsbeslutning.

**Dette dokumentet er ikke selv en slik godkjenning.** Utkastene er tilgjengelige i GitHub og artikkelkøen, men ingen offentlig side, metadataflagg eller nyhetsstrøm er endret.

## Sentrale kilder
- FBI (31.10): https://www.fbi.gov/investigate/cyber/alerts/2026/north-korea-responsible-for-6-billion-binance-attack
- Binance (30.10): https://www.binance.com/en-GB/support/announcement/security-incident-update-2026-10-30-c5a8729a97ac486d963784d96c5642d7
- Binance (1.11): https://www.binance.com/en-GB/support/announcement/security-incident-recovery-update-4-withdrawals-resume-in-phases-2026-11-01-73911fb819b240f88b88256bdd318eda
- Reuters (2.11): https://www.reuters.com/business/finance/binance-sees-outflows-stabilising-exchange-returns-online-after-63-billion-heist-2026-11-02/
- Serbias valgkommisjon via regjeringen (2.11): https://www.srbija.gov.rs/vest/en/290805/rik-publishes-results-from-all-8392-polling-stations.php
- CRTA (26.10, foreløpig valgobservasjon): https://crta.rs/en/the-crta-election-observation-mission-presented-its-preliminary-assessment-of-election-day-mobilization-against-electoral-engineering/
- Hina/Jutarnji (2.11, mandatanslag etter omvalget): https://www.jutarnji.hr/vijesti/svijet/studentskoj-listi-jedan-mandat-manje-u-parlament-ulazi-manjinska-lista-spp-15761608
