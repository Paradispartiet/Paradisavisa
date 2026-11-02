# Individuelt publiseringsvedtak – Binance
**Publiseringsdato:** 2. november 2026  
**Artikkel-ID:** `binance-hacking`  
**Redaksjonens eksplisitte ordre:** Brukeren ba i samtalen: «Ja, og publiser» etter å ha blitt spurt eksplisitt om siste publiseringskontroll av Binance som første artikkel. Dette gjelder **bare Binance**, ikke de øvrige sju nyhetssakene.

## Faktakontroll på publiseringsdagen

- **Hendelse og omfang:** FBI oppga 31. oktober at en nordkoreansk operasjon kalt *TraderTraitor* var ansvarlig for angrepet mot Binance 29. oktober, da kryptoverdier for mer enn 6 milliarder dollar ble stjålet. Binance anslår ca. 6,3 mrd. dollar. Tilskrivelsen er en myndighetsvurdering, ikke en dom mot navngitte personer.
- **Teknisk hendelsesforløp:** Binances første egenforklaring omtaler blant annet en kompromittert DevOps-PC og senere oppdagede andre angrepspunkter. Ingen fullt ferdig teknisk post-mortem var dokumentert offentlig ved denne kontrollen. Artikkelen beskriver derfor hypotese og sikkerhetsspørsmål, ikke en fastslått, full teknisk årsak.
- **Frosne midler vs. tapserstatning:** Binance anslo at ca. 3 mrd. dollar av de berørte midlene ble fryst av samarbeidsaktører. Frosset er **ikke** det samme som tilbakeført. Binance sa 1. november at rundt 95 % av de berørte valutaene var erstattet i reservene gjennom selskapets egne ressurser; dette er **ikke** 95 % tilbakelevert tyvegods. De siste 5 % var mindre likvide valutaer.
- **Ny kilde 2. november – viktig oppdatering før publisering:** Binance publiserte Recovery Update #5: Kryptografisk *proof of reserves* for et øyeblikksbilde 31. oktober er ferdig og kan brukes til å verifisere individuelle kundebeholdninger i ti store valutaer. Utvidet oversikt er varslet fra 4. november. Dette **beviser ikke** at tyveriet er oppklart, at alle midlene er gjenfunnet eller at det foreligger full revisjon. Artikkelteksten er oppdatert etter denne kunngjøringen.
- **Kundereaksjon:** Reuters rapporterte 2. november om netto 4,72 mrd. dollar i uttak siden gjenåpningen, basert på Binance-tall, sammenlignet med 3,64 mrd. i en tidligere og kortere måleperiode. Beløpene er ikke separate tyverier og kan ikke summeres.
- **Rettigheter og tilsvar:** Selskapets forklaring og løfter om å dekke tap er gjengitt som selskapets egne utsagn. FBI og analytikere er brukt for uavhengig vurdering. Ingen originalintervjuer er gjennomført; artikkelen utgir seg ikke for å ha slike. Grafisk SVG er en egen symbolillustrasjon, ikke et dokumentarfoto.

## Publiseringsomfang og kontroll
- Offentlig artikkel: `artikler/2026-11-02-binance-hacking.html`
- Offentlig illustrasjon: `Bilder/Artikler/2026-11-02-binance-hacking.svg`
- Oppdatert **bare** `Nyhetshjul.json`, med faktisk publiseringsdato 2. november 2026.
- Oppdatert **bare Binance-oppføringen** i `utkast/artikler.json`: `status: "publisert"`, `faktasjekk: "godkjent"`, `godkjent: true`, `publisert: true`, publisert dato og URL.
- Kilde- og manusoppdateringen bevares også i opprinnelig HTML-utkast, Markdown-manus og intern forhåndsvisning.
- Alle andre registrerte utkast forblir uendret. Ingen massepublisering.
- Siden har `robots=index, follow`, korrekt kildebolk, dato, stylesheets og publikumsbildelenke; interne «Før eventuell publisering»-notater er fjernet i publisert versjon.
- **Etter publisering:** Følg offentliggjøring av teknisk post-mortem, videre uttak, reserveverifisering og eventuelle korreksjoner. Vesentlige oppdateringer må datomerkes.

### Kilder kontrollert på publiseringsdagen
- FBI, 31. oktober: https://www.fbi.gov/investigate/cyber/alerts/2026/north-korea-responsible-for-6-billion-binance-attack
- Binance, teknisk foreløpig oppdatering 30. oktober: https://www.binance.com/en-GB/support/announcement/security-incident-update-2026-10-30-c5a8729a97ac486d963784d96c5642d7
- Binance, gradvis gjenåpning 1. november: https://www.binance.com/en-GB/support/announcement/security-incident-recovery-update-4-withdrawals-resume-in-phases-2026-11-01-73911fb819b240f88b88256bdd318eda
- Binance, **publisert kryptografisk reservebevis 2. november**: https://www.binance.com/en/support/announcement/detail/185bd9a4717f44088b3be70287b8237f
- Reuters, oppdatert 2. november: https://www.reuters.com/business/finance/binance-sees-outflows-stabilising-exchange-returns-online-after-63-billion-heist-2026-11-02/
- Reuters direkte i Euronext 2. november: https://live.euronext.com/en/financial-news/binance-says-customers-pulled-net-47-billion-after-hack-crypto-world-weighs-risk

**Publisering trer først i kraft når PR-en som inneholder artikkel, bilde, køstatus og nyhetsstrøm, er testet og flettet inn i `main`.**
