# Feature 13 – «Når noen ber om hjelp, skal de få hjelp»

**Artikkel:** `artikler/2026-11-02-nav-rettigheter-automatisk-hjelp.html`  
**Publisert:** 2. november 2026; **oppdatert:** 12. november 2026.

## Premiss
Dette er en **politisk kommentar**, ikke NAV-veiledning. Originalt synspunkt om enklere og mer automatisk inntektssikring beholdes. Endringene har som mål å gjøre leseren trygg på skillet mellom dagens regler og redaksjonens forslag.

## Gjeldende rett (bekreftet)
1. Alle kan søke om økonomisk sosialhjelp og få en **individuell vurdering**. Søknad kan kreve opplysninger og dokumentasjon. NAV fatter skriftlig vedtak som kan påklages.
2. **Sosialtjenesteloven § 17** gjelder råd og veiledning. **§ 18** gir rett til stønad når vilkårene er oppfylt. **§ 19** tillater hjelp i særlige tilfeller. **§ 20** åpner for lovlige, forholdsmessige vilkår. Dokumentasjonskrav og vilkår er ikke det samme.
3. I akutte situasjoner skal NAV gi **raskt svar**; nødhjelp kan dekke nødvendige utgifter i en begrenset periode.
4. Generelle automatiske faste tillegg for ferie, jul, møbler og hvitevarer til alle sosialhjelpsmottakere og uføretrygdede er **ikke en del av nåværende generelle lovrett** slik kommentaren foreslår.

## Artikkelmal
- Den nå felles Paradisavisa-headeren og menyen fra PR #174 bevares med fallback uten JavaScript.
- Tidligere skjult hovedtittel blir synlig, og tospaltet brødtekst er gjort til **én lesbar søyle** også på iPad.
- Det opprinnelige, godkjente satiriske bildet `Bilder/nav-satire-skopuss.jpg` beholdes med tydelig merking som allegori.
- Ny original SVG om **dagens søknadsbehandling vs. Paradisavisas forslag**. Første løp beskriver gjeldende ordning, nederste et ikke-vedtatt forslag.
- Ny original SVG om **§§ 17–20** i sosialtjenesteloven uten oppdiktede beløp, tidsløfter eller nye rettigheter.
- To kompakte forstørr-lenker, faktaboks om nødhjelp, fire klikkbare hensyn (kontakt, databehandling, hastesak, rettssikkerhet), og frivillig **lokal** leserpoll uten kollektiv statistikk.
- Samlet, tydelig dokumentasjonsseksjon og kildehenvisninger gjennom teksten.

## Primærkilder
- [NAV: økonomisk sosialhjelp](https://www.nav.no/okonomisk-sosialhjelp)
- [NAV: Har ikke penger til mat, bolig eller andre utgifter](https://www.nav.no/ikke-penger)
- [Lovdata: sosialtjenesteloven §§ 17–20](https://lovdata.no/dokument/NL/lov/2009-12-18-131/%C2%A717)
- [NAV: tolkning og dokumentasjonskrav](https://www.nav.no/samarbeidspartner/tolkning-sosialtjenesteloven)

## Tester
`scripts/nav-hjelp-levende.test.cjs` i artikkel-CI, og faktisk Chromium i `scripts/levende-artikkel-browser.cjs` på 390 px mobil, 820/1180 px iPad og 1440 px PC, samt JavaScript-avslag. Bilde, SVG, visning, ingen horisontal overflyt, kompakt zoom, fakta, interaktivitet, poll og lokal lagring skal verifiseres. Merge først etter grønne PR-kontroller; verifiser main og GitHub Pages etterpå.
