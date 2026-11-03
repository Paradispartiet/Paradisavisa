# Visuell sluttvurdering og kildeplan – fire publiserte nyheter

Dato: 3. november 2026  
Status: Visuell kvalitetsvurdering. **Ingen nye erstatningsbilder er godkjent eller publisert gjennom dette dokumentet.** Bildeendringene fra PR #43 er teknisk publisert og GitHub Pages-deploy kontrollert vellykket.

## Referanse

Den nåværende Støre–Stubb-artikkelen setter nivået for detaljering, dramatisk lys, oppslagspreg og romlighet. De fire nye JPG-ene til Meta, Trump, Serbia og Binance er teknisk riktige, men redaksjonens visuelle mål – fotorealistisk/filmatisk dybde – er **ikke** nådd. Det må ikke forveksles med at filene mangler eller er feilkonfigurert.

## Kvalitetsgjennomgang

| Sak | Nåværende JPG | Vurdering | Neste motiv | Etisk grense |
| --- | --- | --- | --- | --- |
| Meta og pressefrihet | `Bilder/Artikler/meta-pressefrihet-2026.jpg` | For grafisk, skjematiske linjer og figurer | En moderne redaksjon i naturlig lys foran et enormt kjølig datarom; menneskelig nærvær og tydelig avstand mellom redaksjonen og plattformen | Ikke fabriker Meta-logoer, screenshots eller påståtte kontraktsdokumenter. |
| Trump/WSJ-dommen | `Bilder/Artikler/trump-avisdom-2026.jpg` | Dommerklubbe og papirer blir enkel rettsikonikk | Et filmatisk nærbilde av en tung avisside og en rettslig saksmappe i et anonymt amerikansk rettsinteriør; kvelden utenfor vinduet | Ikke lag falskt bevismateriale, domspapirer med oppfunnet tekst eller rekonstruksjon av faktiske rettshendelser. |
| Serbia/studentbevegelsen | `Bilder/Artikler/serbia-studentbevegelse-2026.jpg` | Viktig symbolikk, men altfor flate silhuetter og bygninger | **Førstevalg:** lisensiert autentisk fotografi av protest og minnemarkering; eventuelt rikere redaksjonell illustrasjon med ekte romlig dybde | Dato og sted på faktisk foto må oppgis. Ikke bruk foto fra 2025 som om det dokumenterer valget i oktober 2026. |
| Binance/cyberangrepet | `Bilder/Artikler/binance-cyberangrep-2026.jpg` | Teknisk skjermestetikk nær infografikk | En mørk, taktil serverhall med menneskelig skala og subtile lysrefleksjoner; en låst port/bunker som bilde på digital risiko | Ikke fremstille en oppdiktet serverhall som Binance-infrastruktur eller identifisere hackere i en illustrasjon. |

## Konkret fotomulighet for Serbia

**Bildekilde:** [Wikimedia Commons – «Studentski protest Novi Sad 2025-02-01 - 7.jpg»](https://commons.wikimedia.org/wiki/File:Studentski_protest_Novi_Sad_2025-02-01_-_7.jpg)  
**Fotograf:** Никола Ђорђевић (Nikola Dyordyevich)  
**Opptaksdato:** 1. februar 2025, Novi Sad.  
**Original:** 4032 × 3024 JPG, ifølge filbeskrivelsen.  
**Lisens:** Creative Commons Attribution–ShareAlike 4.0 International, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Krever synlig kreditering, kilde- og lisenslenke samt informasjon om eventuelle endringer. Ved bearbeiding må også vilkårene om deling på samme vilkår respekteres. Fotografens egen bildekrediteringsanvisning er publisert på Commons-siden.

**Forslag til korrekt bildetekst:** «Studenter demonstrerer i Novi Sad 1. februar 2025. Arkivfoto: Никола Ђорђевић / Wikimedia Commons, CC BY-SA 4.0. Eventuelt beskåret. Bildet er fra en tidligere fase av protestbevegelsen, ikke fra valget i oktober 2026.»

**Status:** Rettigheter og kilde er undersøkt på Commons, men den originale bildefilen er **ikke lastet ned, beskåret, overført eller visuelt godkjent** i dette arbeidet. Ikke endre publisert bildekobling før en faktisk kontrollert rasterfil finnes i repositoriet og korrekt kreditering er på plass. Ikke hotlink til en ustabil mellomliggende bildeside.

## Produksjons- og kvalitetsport

1. Lever hvert motiv som selvstendig 16:9-bilde, minst 1600 × 900 piksler. Ingen innbakt overskrift, logo eller påstått faktadokument.
2. Se på hvert motiv i både artikkelens hero-plass og forsidekort. Hvis det bare ser ut som et ikon i et større bilde, er det fortsatt ikke godt nok.
3. For foto: sjekk dato, sted, fotograf og full lisens eller avtale. For KI: bruk synlig etikett, og unngå at bildet kan oppfattes som dokumentarfoto fra en bestemt hendelse.
4. Hold artikkeltekst, dato og andre opplysninger urørt ved bildebytte. Oppdater `<img>`, `alt`, `<figcaption>`, `og:image`, `twitter:image` og `Nyhetshjul.json` atomisk.
5. Kontroller at bildefilen faktisk ligger i repoet før merge, og at GitHub Pages har fullført utrulling og visuell nettlesertest etterpå.

## Prioritet

**Serbia → Trump/WSJ → Meta → Binance.** Serbia har en konkret, kildekontrollert fotomulighet som kan erstatte det flate motivet. De øvrige bør produseres med konsistent høy detaljering, ikke bare pyntes med filtre eller oppskaleres fra dagens enklere tegninger.

**Redaksjonell sperre:** Ingen publiserte bildebytter på grunnlag av en mockup, et eksternt bilde uten dokumentert bruksvilkår eller en generert illustrasjon som ikke faktisk passer saken.
