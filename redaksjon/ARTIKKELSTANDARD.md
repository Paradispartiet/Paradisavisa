# Paradisavisa – kanonisk artikkelstandard

**Status:** Gjeldende redaksjonell utformingsstandard fra 11. november 2026.

**Én kilde til sannhet:** Denne veilederen fastsetter **artikkelens oppbygning, kildeplassering og lesbarhet**. Den operative HTML-malen er [Maler/mal-artikkel.html](../Maler/mal-artikkel.html), med [artikkel.css](../artikkel.css). Bildets motiv, etikk, produksjon og godkjenning følger [BILDEHANDBOK.md](BILDEHANDBOK.md). [REDAKSJONSPLAN.md](../REDAKSJONSPLAN.md) styrer faktakontroll, redaksjonell godkjenning og publisering. Ingen av disse dokumentene erstatter de andre.

Eldre filer som article.html, Maler/mal-nyhet.html, Maler/mal-sport.html, Maler/mal-kultur.html og posts/innlegg-mal.html er **historiske eksempler**, ikke nye konkurrerende produksjonsmaler. Allerede publiserte artikler endres ikke automatisk når malen oppdateres. Kategoriene nyhet, feature, kultur, sport, kommentar, analyse og debatt bruker samme tekniske grunnstruktur, men sjanger og fortellerstil er forskjellige.

## 1. Redaksjonell stemme

- Først innhold, deretter bilde, deretter publisert kort. Skriv en tydelig påstand, hendelse eller problemstilling. Tittelen skal ikke love mer enn brødteksten dokumenterer.
- Vis hva som er **fakta**, hva som er **tolkning**, og hva som er **uavklart**. Nyheter etterprøves nøkternt. Kommentar og debatt er meningsstoff med korrekt sjangermerking og dokumenterte faktapremisser.
- Skriv sammenhengende prosa med god rytme. **Ikke lag mellomtittel for hvert annet avsnitt.** Bruk mellomtitler bare ved reelt skifte av tema eller i lange fordypninger der orientering trengs.
- Unngå oppblåste ingressser, kunstig dramaturgi, gjentakelser, spekulative sitater og generisk KI-språk.
- Navngitte personer skal ikke få motiver tillagt uten dokumentasjon. Alvorlige anklager krever presis kilde, kontekst og relevant tilsvarsarbeid.

## 2. Fast lesestruktur

1. **Sjanger/kategori:** Nyhet, Kultur, Sport, Kommentar, Analyse, Debatt eller Feature. Vises tydelig.
2. **Overskrift og ingress:** Én H1 og en ingress på helst én til tre setninger, uten å gjenta overskriften.
3. **Byline og dato:** Forfatter/avsender, faktisk publiseringsdato; «oppdatert» og endringshistorikk når relevant. Ikke endre opprinnelig dato ved en designrettelse.
4. **Hovedillustrasjon:** Relevant, ferdig godkjent bilde med alt-tekst, forklarende bildetekst og rettigheter/KI-merking. Hovedbildet skal ikke sluke lesesiden.
5. **Brødtekst:** Lesbar énspaltet fortelling med relevante lenker og korte kildehenvisninger under faktabærende avsnitt.
6. **Mellombilder:** Normalt ett eller to for en lengre artikkel, noen ganger flere når de gjør konkret journalistisk arbeid. Bilder er ikke fyll. Ved lange artikler kan bildene gi naturlige pustepauser.
7. **Kilder og videre lesning:** Full oversikt med direkte URL, tittel, utgiver og helst dato. Oversikten supplerer – erstatter ikke – kildene i teksten.
8. **Merknad ved behov:** Hva er ukjent? Hvor kommer tallene fra? Hva er redaksjonens egen tolkning?

## 3. Slik fletter vi kilder inn i teksten

**To nivåer brukes sammen:**

- **Integrerte lenker:** Knytt lenken til meningsbærende ord (rapportnavn, vedtak, uttalelse, undersøkelse eller konkret påstand), ikke til «klikk her».
- **Kildenote rett under avsnittet:** Kort, diskré, men godt lesbar og klikkbar. Den skal stå **nær påstanden** og ikke forveksles med brødtekst.

Eksempel (illustrasjon av utforming, ikke et ferdig faktasjekket avsnitt):

~~~html
<div class="av-avsnitt">
  <p>I den offentliggjorte <a href="DIREKTE_LENKE_TIL_RAPPORT">rapporten</a>
     beskriver utvalget hvordan ordningen virker.</p>
  <p class="av-kilde-note">Kilde:
     <a href="DIREKTE_LENKE_TIL_RAPPORT">Utvalgets rapport, tittel, dato</a>.
  </p>
</div>
~~~

En meningsytring eller overgang uten etterprøvbare nye påstander trenger ikke ny kilde påtvunget. Et avsnitt med viktige fakta, tall, omstridte opplysninger, sitater eller alvorlige beskyldninger trenger derimot tilstrekkelig dokumentasjon. Ikke bruk samme kilde under hvert avsnitt hvis leseren tydelig forstår hvilket avsnitt den dekker; men ikke la flere kildeavhengige avsnitt stå uklare.

**Kildekvalitet:** Lenken skal helst gå til det konkrete originaldokumentet, ikke institusjonens forside. Prioriter offentlig dokumentasjon, originalrapport, forskning, intervju eller førstehåndskilde; suppler med uavhengig dekning. En presseomtale av en påstand er ikke automatisk bevis for påstanden. Les og sjekk lenkene før publisering. Ikke lag oppfunne referanser, oppdiktede sitater eller fiktive sidetall.

**Interesse og presisjon:** Identifiser hvem kilden er, og om det er en partskilde. Ved kildekonflikt forklares uenigheten, ikke skjules. Rettslig mistanke og dokumentert skyld er forskjellige ting. KI-assistert research fritar aldri redaksjonen fra ansvar.

**Lesbarhet:** Notene skal være i sans-serif omtrent 13–14 px på vanlig skjerm, kontraststerke nok på sort bakgrunn og lenkene skal være understreket, synlig fokuserbare og ha beskrivende tekst. Ikke vis kildehenvisninger som miniatyrfotnoter.

## 4. Bilderegler gjennom hele saken

- **Hovedbilde:** Én klar scene, person, hendelse eller metafor. Normalt 16:9; godkjent portrett/kvadrat kan brukes uten hard beskjæring. På iPad og mobil begrenses den synlige høyden med responsiv CSS, slik at teksten kommer tidligere.
- **Sekundærbilde:** I analyse, kommentar og debatt kan det være en **symbolmettet, men samlet illustrasjon** som knytter konflikt, årsaker, konsekvenser og kontekst sammen. Dette prinsippet er definert i bildehåndboken og trenger ingen rivaliserende bildepremiss her.
- **Andre bilder:** Dokumentert sted, arkivbilde, grafikk, gjenstand, detalj eller tidslinje – bare når det gjør saken bedre å forstå. Ikke dupliser hovedmotivet.
- **Plassering:** Mellom naturlige tekstbolker, ofte etter noen innledende avsnitt, ikke en vegg av bilder før første argument. Ikke plasser samme motiv på topp og midt i saken.
- **Alle bilder:** Egen meningsbærende alt-tekst, bildetekst som tilfører kontekst, navngitt opphav/kilde, lisens der nødvendig og presis merking av KI-generert illustrasjon eller satire. Oppdiktet scene er aldri «arkivfoto».
- **Rettigheter:** Offentlig tilgjengelig bilde er ikke automatisk fritt å bruke. Velg lisensiert materiale eller lag original illustrasjon. Behold bildebevis ved behov.
- **Teknikk:** Responsivt og raskt; lazy loading på mellombilder, bildeformat/dimensjoner og kontroll i mobil/iPad liggende/stående/PC. Samme godkjente fil i artikkel, forsidekort og delingsmetadata; ingen stille erstatning.

## 5. Utforming

- Sort bakgrunn, varm lys brødtekst, gule tydelige lenker. Lesebredde cirka **46rem**; aldri tett, bred avisspalte over full iPad-bredde.
- Seriffont i brødtekst/overskrift; sans-serif i byline, bildetekst og små kildenoter. Luft mellom avsnitt, ikke kunstig mange underoverskrifter.
- H1 stor, men begrenset på mobil. Ingress tydelig skilt fra ordinær brødtekst.
- Bilde og bildetekst hører sammen i HTML figure/figcaption. Bildeteksten må ikke bli en fullskjermseksjon.
- Bruk ordentlige lenker og semantisk HTML; ikke javascript-aktiverte falske lenker.
- Illustrasjoner er del av artikkelens innhold, ikke pynt som får leseren til å miste fortellingen.

## 6. Sjangerprofiler uten egne konkurrerende maler

| Sjanger | Innfallsvinkel | Særlig kontroll |
| --- | --- | --- |
| Nyhet | Hva har skjedd, hvem berøres, hva er kjent? | Kilder, dato, kontradiksjon, ingen meningspåstand forkledd som nyhet |
| Feature | Hvordan virker det, hvorfor er dette viktig? | Flere uavhengige kilder, forklarende bilder, forsiktig med årsaksforklaringer |
| Kultur | Verk, opplevelse, kontekst og vurdering | Skill verkbeskrivelse fra kritikervurdering; korrekte rettigheter |
| Sport | Hendelse, prestasjon, konsekvens og sammenheng | Verifiser score, tidspunkt, turnering og sitater |
| Analyse | Tolkning som bygger på klarlagt fakta | Vis premisser, alternative tolkninger og usikkerhet |
| Kommentar | Redaksjonell vurdering med argumenter | Merk som kommentar; fakta kan dokumenteres |
| Debatt | Identifiserbar avsender med tydelig standpunkt | Merk som debatt; la påstander være etterprøvbare, skille mening fra fakta |

## 7. Publiseringsport (hver enkelt artikkel)

- [ ] Teksten er gjennomlest og kildekontrollert; direkte lenker åpnes og samsvarer med det de skal støtte.
- [ ] Sentrale dokumenter/tall har lenker **i riktig avsnitt** og eventuelt korte kildenoter under.
- [ ] Kildeoversikten er fullstendig og speiler faktisk brukte kilder.
- [ ] Hovedbilde og eventuelle mellombilder er relevante, godkjente og rettighetsavklart; alt/figcaption/merking finnes.
- [ ] Bildene vises riktig uten forstyrrende beskjæring på iPad og mobil.
- [ ] Én H1, god ingress, riktig sjanger/byline/dato og ikke overdreven bruk av mellomtitler.
- [ ] Metadata (canonical, og:title, og:image, twitter:image, publiseringsdato) peker på artikkel og **samme hovedbilde**.
- [ ] Ingen plassholdere, utkastmarkører eller interne notater i offentlig artikkel. Utkast har noindex.
- [ ] Redaksjonell godkjenning er eksplisitt; deretter oppdateres riktig JSON-strøm/Artikkelkø uten massepublisering.
- [ ] Ferdig nettside kontrolleres etter deploy, ikke bare i kode.

**Ikke bakovermigrer alle gamle artikler ukritisk.** Start med nye saker, og oppgrader publiserte artikler enkeltvis når faktiske kilde- og bildefiler er kontrollert.
