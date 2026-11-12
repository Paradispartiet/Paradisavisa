# Digital suverenitet – sjuende levende artikkelpilot

**Oppdatert:** 12. november 2026  
**Opprinnelig publisering:** 10. november 2026 (beholdes)  
**Artikkel:** [Kan Norden frigjøre seg fra teknologigigantene?](../artikler/2026-11-10-norden-teknologigigantene.html)  
**Sjanger:** Feature / teknologi og samfunn

## Redaksjonelt mål

Denne artikkelen skal forklare digital suverenitet som **praktisk handlingsrom**, ikke som en konkurranse om hvor serverne står. Ministererklæringen er et vedtatt **politisk dokument**, men ikke en vedtatt finansiert nordisk skytjeneste, KI-modell eller kontorpakke. Digdirs faglige anbefalinger om leverandørbytte er ikke nye forskriftskrav. Digdirs veileder for åpen kildekode er fortsatt et **utkast** med innspillsfrist 8. desember 2026.

Hovedbildet `feature07-nordisk-digital-suverenitet-hovedbilde-2026.webp` og den godkjente sekundærillustrasjonen `feature07-nordisk-digital-suverenitet-sekundaerillustrasjon-2026.webp` beholdes uten regenerering, også i artikkelens eksisterende delingsmetadata. De er merket som KI-assisterte symbolske illustrasjoner, ikke dokumentarbilder.

## Ny utforming

- Gjenbruker én felles komponentmotor: `artikkel.css?v=20261112a`, `artikkel-interaktiv.js`. Ingen spesialkomponenter eller nye globale arkitekturer.
- Fire overflødige mellomtitler fjernet, men de faktabærende avsnittene er beholdt.
- Ni diskrete kildehenvisninger under faktapåstander, i tillegg til originalens tolv kilder.
- Original SVG-forklaringsgrafikk: fire områder som må fungere ved leverandørbytte: **data**, **identitet**, **systemer og integrasjon**, **drift og beredskap**. Dette er **Paradisavisas pedagogiske firepunktsmodell**, ikke de offisielle elleve punktene fra Digdir.
- Grafikken har beskrivende alt-tekst, originalfil for forstørring, liten «Forstørr»-lenke med skjermleserbeskrivelse og nedgradert visning som vanlig bilde og direkte fil-lenke uten JS.
- Interaktiv forklaring av de fire punktene, detaljboks om åpen kildekode kontra standarder og kontroll, samt fempunkts tidslinje fra august 2026 til planlagt innspillsfrist desember 2026.
- En lokal refleksjonsavstemning om hva kommunen bør teste først. Ingen server, ingen felles resultater, ingen oppdiktet meningsmåling.
- Ingen tallgrafikk om kostnad, låsing eller markedsandeler: Det finnes ikke tallgrunnlag i de godkjente kildene for en meningsfull kvantitativ sammenligning.

## Kilder og status

| Påstand/tema | Kilde | Presisering |
| --- | --- | --- |
| Felles digital suverenitetsambisjon vedtatt 6. november | [Nordisk ministerråds erklæring](https://www.norden.org/en/declaration/common-nordic-and-baltic-approach-digital-sovereignty) | Vedtatt politisk uttalelse – ikke ferdige løsninger |
| Norges formannskap og prioritering av KI i 2027 | [Regjeringen, 6. november](https://www.regjeringen.no/no/aktuelt/nordisk-baltisk-samarbeid-om-digital-suverenitet-norge-vil-prioritere-trygg-ki/id3191990/) | Politisk prioritering – ikke anskaffelsesbeslutning |
| Skate-rapport om leverandørbytte | [Digdir – Skiftende skydekke, 18. august](https://www.digdir.no/digitalisering-og-samordning/skiftende-skydekke/8337) | Fagrapport om endringsevne, ikke universell garanti for at enhver tjeneste kan flyttes |
| 11 anbefalte punkter for exit-strategi | [Digdir, 30. september 2026](https://www.digdir.no/digitalisering-og-samordning/ny-rapport-dette-bor-en-god-exit-strategi-fra-skytjenester-inneholde/8428) | Ikke det samme som de fire redaksjonelle forklaringspunktene |
| Felles utspill om åpne standarder og innkjøpsmakt | [Forbrukerrådet, Tekna og NITO, 23. juni](https://www.forbrukerradet.no/?p=54996) | Organisasjonenes anbefalinger, ikke vedtatt norsk policy |
| Digdirs utkast til veileder | [Digdir, 28. oktober](https://www.digdir.no/digitalisering-og-samordning/gi-oss-innspill-hvordan-skal-offentlig-sektor-forholde-seg-til-apen-kildekode/8494) | Utkast, frist 8. desember |
| Kritisk digital infrastruktur | [Nordisk råds strategi, 28. oktober](https://pub.norden.org/politiknord2026-717/5-digital-resilience-and-information-security.html) | Sikkerhetsanbefalinger, ikke allerede implementert beredskapsløsning |
| Forbrukerrådets skriftlige svar og departementets svar | Redaksjonell kildekorrespondanse arkivert i Paradisavisa | Gjengis i originalen med tydelig avsender, kildekarakter og forbehold; ikke fritt oppdiktede intervjuer |

## Tester og publiseringsport

`scripts/norden-digital-levende.test.cjs` er lagt til artikkel-CI og sjekker originalt innhold, to bevarte bilder, ni kildenoter, publikasjonstidspunkt, statusforskjeller og interaktive moduler.

`scripts/levende-artikkel-browser.cjs` sjekker på Chromium-mobil 390 px, iPad stående 820 px, iPad liggende 1180 px og PC 1440 px: ingen sideveis rulling, bilder faktisk lastet, kompakt zoom, forklaringssteg, tidslinje, lokal avstemning og reload. En egen kontroll tester no-JS-fallback.

**Ingen merge før begge GitHub Actions-testene er faktisk grønne på PR-head.** Etter merge kontrolleres innholdet i `main`, deploy og eventuell offentlig visning. Artikkelen oppdateres i eksisterende URL; ingen duplisert versjon eller nytt forsidekort.
