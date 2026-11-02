# Researchnotat – kryptotyveriet fra Binance (29. oktober 2026)
**Status: VERIFISERT STARTGRUNNLAG / IKKE ARTIKKEL / IKKE GODKJENT**  
**Researchdato: 2. november 2026**

## Brukerbestilt hovedspørsmål
**Hvem gjorde det, hvordan kunne det skje, og hvordan dekkes tapet?** Artikkelen skal fortelles slik at en leser uten kryptokunnskap forstår forskjellen mellom tyveri, frys, gjenfinning og erstatning.

## 1. Hvem står bak?
- Den amerikanske FBI publiserte 31. oktober en offisiell melding som *tilskriver* tyveriet til Nord-Korea, med operasjonen kjent som **TraderTraitor**. Dette er en myndighetstilskrivelse; den identifiserer ikke offentlig enkeltpersoner.
- FBI opplyser at aktører konverterer tyvgodset hovedsakelig til ether (ETH), og advarer om videre hvitvasking gjennom desentraliserte tjenester og byttetjenester.
- Skill myndighetenes tilskrivelse fra en endelig dom. Ikke gjengi mistenktes identitet uten dokumentasjon.

**Primærkilde:** https://www.fbi.gov/investigate/cyber/alerts/2026/north-korea-responsible-for-6-billion-binance-attack

## 2. Hvordan kunne det skje?
- Ifølge Binance begynte de uautoriserte uttakene rundt **29. oktober kl. 20.05 UTC** fra såkalte **hot wallets** (nettilkoblede kryptolommebøker), med anslått tap omkring **6,3 milliarder USD**.
- Selskapets første redegjørelse pekte på en **kompromittert bærbar PC tilhørende en DevOps-ingeniør**, og at angriper kunne få tilgang til en tjenestekonteiner og sende uautoriserte uttakstransaksjoner.
- Binances påfølgende oppdatering understreket at etterforskningen hadde funnet **ytterligere bruddpunkter**. Den fulle angrepskjeden er IKKE bekreftet; forklar ikke alt som én laptop. Binance sier det ikke foreløpig finnes tegn til lekkede private wallet-nøkler.
- Utred hvilke tilgangskontroller og transaksjonsgodkjenninger som faktisk sviktet før man konkluderer med systemårsak. Detaljert post-mortem må hentes når den publiseres.

**Primærkilder:** https://www.binance.bh/en-NG/support/announcement/detail/c5a8729a97ac486d963784d96c5642d7 ; https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751

## 3. Hvordan blir tapet dekket?
**Tre regnskap må holdes atskilt:**

| Størrelse | Sist bekreftede opplysning | Hva dette *ikke* betyr |
| --- | --- | --- |
| Stjålne eiendeler | Omkring **6,3 mrd. USD** (Binance) | Ikke et tall for kontantpenger eller endelig etterforskningsregnskap |
| Erstattede eiendeler i selskapets reserver | Binance opplyste **31.10 at ca. 90 % av berørte eiendeler var replenished**, tilsvarende ca. 6 mrd. USD | Ikke at 90 % av tyvegodset er gjenfunnet eller at alle brukere kan ta ut alt |
| Midler fryst på blokkjeden | Binance sa **30.10 at ca. 3 mrd. USD var fryst on-chain** | Ikke nødvendigvis tilbakeført, eiet eller tilgjengelig for Binance |

- Binance sier at erstatningen skal finansieres av **Secure Asset Fund for Users (SAFU)**, **Futures Insurance Fund** og **selskapets egne midler/treasury**. 31. oktober oppga selskapet at ti navngitte store token var 100 % reservert; de siste ca. 10 % var knyttet til mindre likvide token.
- Binance planla en oppdatert **Proof of Reserves**, men full kryptografisk kontroll skulle etter selskapets opplysninger først være tilgjengelig 3. november. Dette var en forventning per researchdato, ikke dokumentert fullført.
- Bekreft status for kundeuttak før publisering: tidligere kunngjøringer om gjenåpning er ikke i seg selv bevis for at uttak fungerer.
- Det som fryses eller eventuelt gjenfinnes, må ikke telles som *separat dekning* i tillegg til midler selskapet har kjøpt inn, uten tydelig regnskapsavstemming.

**Primærkilder:** https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751 ; https://www.binance.com/en/square/post/383244799724069  
**Uavhengig nyhetsdekning:** https://www.reuters.com/legal/government/binance-says-90-stolen-assets-replenished-2026-10-31/

## Forslag til scene- og artikkelstruktur
1. **Ingress:** Nesten 6,3 milliarder dollar forsvant gjennom uautoriserte transaksjoner, mens kundene ventet på svar om egen beholdning.
2. **Det FBI sier om gjerningsmennene:** TraderTraitor, statlig tilskrivelse, pengespor, usikkerheter.
3. **Slik ble sikkerheten brutt:** hot wallets, den første PC-hypotesen og de nye bruddpunktene.
4. **Hvem tar regningen?** SAFU, forsikringsfondet, selskapets egne midler; legg inn en enkel forklaringsboks.
5. **Er pengene tilbake?** 90 % reservert versus 3 milliarder dollar fryst; kundens reelle uttaksmuligheter.
6. **De åpne spørsmålene:** post-mortem, uavhengig reserverevisjon, faktisk tilbakeføring og rettsforfølgning.

## Åpne spørsmål før redaksjonell godkjenning
- Har Binance publisert teknisk post-mortem etter 31.10?
- Er tilskrivelsen til TraderTraitor uavhengig underbygget av flere sikkerhetsmiljøer?
- Hva viser kjedeanalysenes transaksjonsdata, og hva vet vi *ikke*?
- Hvor mye er juridisk fryst, hvor mye er faktisk tilbakeført, og hvem kontrollerer midlene?
- Hva viser ny Proof of Reserves, og kan vanlige brukere ta ut midlene?
- Hvor mye kapital har Binance belastet SAFU, Futures Insurance Fund og treasury separat, uten dobbelttelling?
- Har selskapet svart på hvilke interne kontrollmekanismer som sviktet?

**Klar for skriving:** Etter godkjent vinkel; researchnotatet skal oppdateres på publiseringsdato.  
**Ingen publisering eller endring i `main`.**
