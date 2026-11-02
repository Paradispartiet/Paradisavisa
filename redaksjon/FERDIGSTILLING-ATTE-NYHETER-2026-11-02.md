# Ferdigstillingsprotokoll – Paradisavisa, åtte nyhetssaker
**Dato:** 2. november 2026  
**Oppdrag:** «Ser bra ut, fullfør» etter at PR #26, #27 og #28 var flettet inn.  
**Omfang:** Sluttkorrektur av oppdaterte nyhetsutkast, kildekontroll og publiseringsverktøyets sikkerhet. **INGEN AUTOMATISK PUBLISERING.**

## Individuelle beslutninger

| Sak | Tilstand 2.11.2026 | Hva er dokumentert? | Hva kan ikke påstås? |
| --- | --- | --- | --- |
| **1. Frankrike/Tyskland** | **Sluttredigert utkast** | Frankrikes innenriksdepartement: 320 000 ved 291 demonstrasjoner 31.10, ned fra 410 000 uken før. Tagesschau: rundt 120 000 deltakere i Tyskland **ifølge arrangørene**, tysk politi anslo 5 000 i Berlin, mot arrangørenes 10 000. | At demonstrasjonene representerer én styrt, samlet europeisk bevegelse. At alle demonstranter sto bak opptøyene. |
| **2. Binance** | **Sluttredigert forklaringssak med åpent etterforskningsforbehold** | FBIs tilskrivelse til TraderTraitor/Nord-Korea; Binance anslo 6,3 mrd. USD stjålet og oppga 95 % dekning av berørte aktiva i egne reserver 1.11. Reuters: først 3,64 mrd. USD netto kundeuttak etter 9,5 t; senere 2.11 omtrent **4,72 mrd.** i en lengre måleperiode. | At navngitte hackere er identifisert eller dømt, at initial kompromittert PC er komplett årsaksforklaring, eller at 95 % av tyvgodset er gjenfunnet. En teknisk post-mortem var ikke bekreftet publisert ved denne kontrollen. |
| **3. Trump / WSJ** | **Sluttredigert juridisk forklaring** | AP og Washington Post: føderal dommer avviste Trumps endrede søksmål 31.10 «with prejudice». Advokatene varslet anke. | At avgjørelsen autentiserer det omstridte Epstein-brevet, eller at varslet anke er registrert i domstolen. |
| **4. Serbia** | **Sluttredigert valgfortelling** | Valgkommisjonen publiserte 2.11 tall fra 8 392 stemmesteder: studentlisten 53,01 %, Vučić-listen 38,98 %. CRTAs mandatberegning etter omvalg: 140 studentmandater, 103 til Vučić-listen; Zukorlić-listen fikk etter observatørenes beregning ett mandat avgjort av om lag tolv stemmer. | At CRTAs anslag er den endelige formelle mandattildelingen, eller at stemmekjøp er bevist. |
| **5. Spania** | **Sluttredigert rekonstruksjon, foreløpig årsaksforståelse** | Spanske myndigheter, RTVE og Euronews: Urda-kollisjonen 28.10, 69 bekreftede døde og 66 identifiserte ved starten av 2.11. Myndighetenes omtrentlige tidslinje 08.36–08.53; Iryo-kilder har gitt andre klokkeslett og annen framstilling av kjøretillatelsen. | At alle klokkeslett er eksakte, at lokføreren eller trafikkledelsen er strafferettslig skyldig, eller at 40 km/t var en helt ny regel innført etter ulykken. |
| **6. Israel** | **Sluttredigert valgmatematikk** | Valgkommisjonens mandatfordeling 30.10, gjengitt av Times of Israel: 53 + 48 + 19, med 61 for flertall. | At en koalisjon er ferdig etablert eller at formell regjeringsdannelse var avgjort 2.11. |
| **9. Fiskeri** | **Sluttredigert etterforskningsreportasje** | Økokrims opplysninger via NTB 29.10: over 30 pågrepet, 20 selskaper siktet, sju varetektsfengslet. Myre Fiskemottaks advokat har i offentlig pressemelding avvist bevisst feilføring. | At siktede er funnet skyldige, at sikrede verdier er lik endelig påvist kriminalitetsbeløp, eller at alle fiskere/fiskemottak deltar i et nettverk. |
| **10. Meta** | **Sluttredigert sak om midlertidig rettslig stans** | NTB og MBL: Oslo tingrett stanset endringen i kommersielle vilkår midlertidig 28.10. MBLs tre krav er dokumentert. Metas adgang til å få rettslig kontradiksjon er omtalt. | At retten har endelig avgjort lovligheten av samtlige vilkår, eller at medienes krav allerede er pålagt Meta for all framtid. |

## Sluttendringer i denne grenen
1. **Europa:** Rettet fra et omtrentlig, ikke nærmere definert anslag om 100 000 tyske deltakere til Tagesschaus presist attribuerte opplysninger om arrangørenes 120 000, Berlinanslag og antall byer. Integrert særskilt tysk nyhetskilde.
2. **Binance:** Nye opplysninger fra 2.11: Reuters oppgir nå cirka 4,72 mrd. USD i kumulative netto kundeuttak, en senere måleperiode enn de første ni og en halv timene (3,64 mrd.). Lagt til uavhengig kilde om nyere måling. To måleperioder må ikke summeres eller forveksles med tyveriet.
3. **Publiseringsskriptet:** `scripts/publiser-artikkel.cjs` fjerner nå både «Før publisering» og «Før eventuell publisering», generelle utkastnotater og forhåndsvisningsmerking. Det kontrollerer også at de interne tekstene ikke finnes igjen i publiseringskopien. Ingen artikkel publiseres automatisk.

## Kilder brukt ved sluttføringen
- France: https://www.interieur.gouv.fr/actualites/communiques-de-presse/bilan-de-journee-de-mobilisation-du-31-octobre-2026-et-de-soiree-dhalloween
- Tyskland, ARD/Tagesschau: https://www.tagesschau.de/inland/gesellschaft/demonstration-protest-genz-100.html
- FBI: https://www.fbi.gov/investigate/cyber/alerts/2026/north-korea-responsible-for-6-billion-binance-attack
- Binance hendelsesstatus: https://www.binance.com/en-GB/support/announcement/security-incident-update-2026-10-30-c5a8729a97ac486d963784d96c5642d7
- Binance gjenoppbygging: https://www.binance.com/en-GB/support/announcement/security-incident-recovery-update-4-withdrawals-resume-in-phases-2026-11-01-73911fb819b240f88b88256bdd318eda
- Reuters nyere kundeuttak 2.11: https://www.reuters.com/business/finance/binance-sees-outflows-stabilising-exchange-returns-online-after-63-billion-heist-2026-11-02/
- Bloomberg Law 2.11: https://news.bloomberglaw.com/business-and-practice/binance-outflows-hit-4-7-billion-after-record-north-korea-hack
- AP/WSJ-dom: https://apnews.com/article/f27c9fa832044f2f9edea9b1fbbba061
- Serbia RIK 2.11: https://www.srbija.gov.rs/vest/en/290805/rik-publishes-results-from-all-8392-polling-stations.php
- CRTA-mandatberegning omtalt 2.11: https://en.vijesti.me/world-a/balkan/834332/rik-studentska-lista-5301-odsto-glasova-vucic-3898-crta-zukorlic-presao-cenzus-studentskoj-listi-mandat-manje
- Spania RTVE 2.11: https://www.rtve.es/noticias/20261102/accidente-urda-identificados-66-69-muertos/17295877.shtml
- Israels valgkommisjon gjengitt: https://www.timesofisrael.com/liveblog_entry/central-elections-committee-publishes-final-election-results-knesset-to-be-sworn-in-nov-10/
- Fiskeri NTB/Aftenposten: https://www.aftenposten.no/norge/i/OgVlrl/oekokrim-mistenker-fiskerikriminalitet-i-100-millonersklassen-30-personer-paagrepet
- Myre Fiskemottaks tilsvar via NTB: https://kommunikasjon.ntb.no/pressemelding/19123218/myre-fiskemottak-driften-gar-som-normalt-selskapet-samarbeider-med-okokrim?lang=no&publisherId=17848232
- MBL 28.10: https://www.mediebedriftene.no/artikler/2026/norske-mediehus-har-vunnet-frem-i-retten-mot-meta/

## Publiseringsvedtak – separat fase
**Alle åtte er fortsatt redaksjonelle utkast.** De kan nå leses og vurderes sammen med dette notatet, men er ikke juridisk eller journalistisk garantert komplette bare fordi kildehenvisningene er kontrollert. Utgiverens ansvar omfatter en siste kontroll av oppdateringer, originaldokumenter, tilsvar, tittel og rettigheter umiddelbart før publisering.

Dette dokumentet eller merge av en kildekontrollfil gir **ikke** tillatelse til å sette `godkjent: true`, `faktasjekk: godkjent` eller `publisert: true`. Ingen avisforside, offentlig strøm eller publisert artikkelfil er endret i denne grenen.
