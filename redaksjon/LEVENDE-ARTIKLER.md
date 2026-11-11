# Paradisavisa – levende artikler og komponentbibliotek

**Versjon 1.0 · 11. november 2026 · Redaksjonell standard**

> Paradisavisas artikler skal være lette å lese som gode tekster, men rikere å utforske enn en tradisjonell nettavis. **Interaktivitet må tjene forståelsen.** Den skal ikke konkurrere med fortellingen eller kamuflere ubekreftede opplysninger.

**Autoritet og avgrensning:**
- [ARTIKKELSTANDARD.md](ARTIKKELSTANDARD.md) bestemmer oppbygging, kilder og skrivekvalitet.
- [BILDEHANDBOK.md](BILDEHANDBOK.md) bestemmer visuell fortelling, bilderettigheter og merking.
- [REDAKSJONSPLAN.md](../REDAKSJONSPLAN.md) bestemmer saksgang og publiseringsgodkjenning.
- **Dette dokumentet** bestemmer hva de levende modulene skal kunne gjøre og når de skal brukes. Det er ikke en ny konkurrerende artikkelmal.
- **Kode:** [Maler/mal-artikkel.html](../Maler/mal-artikkel.html), [artikkel.css](../artikkel.css) og [artikkel-interaktiv.js](../artikkel-interaktiv.js).
- **Full, fungerende komponentdemonstrasjon:** [artikkel-demo.html](artikkel-demo.html). Den er noindex, inneholder oppdiktede demoverdier og må aldri legges i en offentlig nyhetsstrøm.

## 1. Identitet: et rolig og levende format

Hver artikkel har likt grunnskjelett: sjangermerke, H1, ingress, byline med dato, relevant hovedbilde med bildetekst, løpende kildebelagt brødtekst, eventuelt velvalgte levende moduler, og kilder/videre lesning. Artiklene skal se ut som samme avis på iPhone, iPad og datamaskin.

- Stor, lesbar avisoverskrift i serif; luft mellom avsnittene; én rolig hovedspalte, ca. 46rem i brødtekst.
- Sort bakgrunn, varme lyse tekstfarger og gule, tydelig understrekede lenker.
- Figurer kan være bredere enn tekstspalten, men ikke slik at leseren må zoome hele siden.
- Små kildenoter under faktabærende avsnitt. Alle kildenoter har beskrivende klikkbare lenker; kildeoversikt nederst beholdes.
- Ingen automatisk løpende animasjon, videolyd, pop-up, konstruert teller eller uoppfordrede varsler.
- Virkemidler i artikkelen er **valgfri fordypning**: leseren skal forstå hovedpoenget ved bare å lese avsnittene.
- Artikler trenger ikke se identiske ut på detaljnivå, men alle deler de samme komponentene, skrifttypene, avstandene, kontrastreglene og navigasjonen.

## 2. Byggeklosser og publiseringskrav

| Modul | Når den brukes | Hva redaksjonen må levere | Hva den ikke skal gjøre |
| --- | --- | --- | --- |
| **Kildenote** | Etter faktabærende avsnitt | Direkte kilde, navn, dato, vurdering av kvalitet | Lenke til tilfeldig forside eller udokumentert KI-sammendrag |
| **Hovedbilde** | Som normal regel | Godkjent fil, alt, bildetekst, opphav/rettigheter og ev. KI-merking | Ta hele iPad-skjermen uten grunn |
| **Sekundærbilde** | Når ny informasjon eller symbolsk analyse tilføres | Eget motiv og bildetekst, separat bildesjekk | Dekor uten funksjon |
| **Faktaboks** | Begrep, metode, bakgrunn, spørsmål/svar | Få presise fakta og kilder | Skjule avgjørende informasjon leseren må se |
| **Avstemning** | Redaksjonelt begrunnet meningsspørsmål | Nøytral problemstilling, klart alternativsett, tids-/statusinfo | Presentere lokalt svar som nasjonalt representativt resultat |
| **Graf** | Sammenlignbare dokumenterte tall | Originalkilde, enhet, tidsperiode, metode og datatabell | Skjult akse, feil skala, oppdiktede data |
| **Tidslinje** | Dokumenterte hendelser i bestemt rekkefølge | Dato/klokkeslett, hendelse, kilde, hva som er omstridt | Blande prognoser med hendelser |
| **Forklaringsgrafikk** | Mekanisme, årsak–virkning eller prosess | Tydelig modell, faste trinn, kort tekst, kilde/forbehold | Gi inntrykk av en etablert årsak der den er usikker |
| **Sitatkort** | Dokumentert presist sitat som trenger løft | Nøyaktig ordlyd, person, kilde, dato | Tillegge oppdiktede sitater til mennesker |
| **Nøkkeltall** | Høyst 2–4 helt sentrale tall | Enhet, kildedato, sammenlignbar definisjon | Store tall uten definisjon |
| **Sammenligning** | Kontraster to faktiske alternativer | Like kriterier, kilder og forbehold | Falsk balanse eller urettferdige skalaer |
| **Relatert lesning** | Dokumentert redaksjonell sammenheng | Faktisk publisert internlenke, relevant utdrag | Lede til utkast eller tomme sider |

Alle valgfrie moduler må kunne fjernes uten at artikkelens hovedresonnement kollapser. Ikke gjør artikkelpublisering avhengig av mange komponenter.

## 3. Interaktive avstemninger – først lokal, deretter eventuelt offentlig

### Nåværende versjon, uten server

På GitHub Pages er det **ingen innebygd database for stemmer**. Den ferdige modulen viser tre eller flere svaralternativer, lar leseren velge og endre svaret, og kan huske valget i lokal nettleserlagring. Den registrerer **ikke** andres stemmer og viser **ikke** samlede prosenter. Dette må stå tydelig i modulen.

- Be om frivillig svar; ingen forhåndsvalgt mening.
- Bruk `<fieldset>`, `<legend>`, radio-knapper og en tydelig knapp.
- Unik ID for hvert meningsspørsmål, så lagring ikke blandes mellom artikler.
- Opplys at lokal lagring kan være utilgjengelig ved privat nettlesning; ingen annen bruker ser svaret.
- Ikke kall dette en «meningsmåling» eller publiser resultatdiagrammer med mindre det finnes en verifiserbar felles opptelling.
- Ingen tredjepartssporing, ingen personopplysninger og ingen politisk profilering.

### Hvis avisa skal samle reelle stemmer senere

Dette er en **separat funksjon som ikke er aktivert**: redaksjonen må godkjenne en backend/tjeneste med POST-endepunkt, integritetskontroll, anti-spam, rate limiting, dataminimering, personvernerklæring, regler for avstemningsperiode og offentlig forklaring om at svarene er selvselektive og ikke representative. Resultater må vise antall stemmer, oppdatert tidspunkt, metode og eventuell modereringspraksis. Ikke fremstille anonyme nettavstemninger som vitenskapelige målinger. Det kreves en egen teknisk beslutning før denne modusen tas i bruk.

## 4. Grafikk og forstørrbare grafer

- Bruk ekte dataserier med **kilde, siste oppdatering, enheter, avgrensning og eventuelle definisjoner**. Når prosent brukes, oppgi prosent av hva.
- Y-aksen starter normalt på null i stolpediagram når lengde uttrykker mengde; enhver annen skala må forklares, ikke gjemmes.
- Oppgi forskjell mellom absolutte og relative tall. Unngå dobbel y-akse der den kan villede.
- Grafen må fungere på liten skjerm, med kontrast og synlige etiketter. Interaktive forbedringer kan aldri være den eneste måten å få tak i tallene på.
- **Forstørrelse:** Hver graf har en klar lenke «Forstørr grafen». JavaScript åpner et tilgjengelig dialogvindu med samme bilde. Uten JavaScript åpnes originalgrafikken via vanlig lenke.
- **Datatabell:** Legg en klikkbar «Vis tallene som tabell» under grafen. Tabellen har `caption`, kolonneoverskrifter og rader som kan leses av skjermleser.
- Alternativtekst beskriver hva grafen faktisk viser, men erstatter ikke kilde og datatabell.
- En graf må ikke automatisk erstattes av KI-generert bilde. Visuell forklaringsgrafikk kan være original tegning, mens faktiske datapunkter må komme fra kontrollert materiale.
- Dato, enhet og kilde skal leses i samme visning som grafen, også når grafen er forstørret. I `<figcaption>` må dette derfor være tydelig.

## 5. Tidslinjer og forklaringsforløp

**Tidslinjer** bygges som kronologiske lister med ett `<details>` per hendelse, slik at hver dato kan åpnes individuelt. Overskriften skal identifisere hva som skjedde, utdypningen skal forklare konsekvens og kilde. Skill «planlagt», «foreslått», «besluttet» og «utført».

**Forklaringsforløp** bygges som 2–5 nummererte trinn. Hvert trinn skal ha en helsetning om det den forklarer, ikke bare et ikon. Knappene er fokuserbare og kan også betjenes med piltaster, Home og End. Uten JavaScript er alle trinns tekst synlig. Vis gjerne en tilhørende kontrollert illustrasjon – den må gi mening også uten animasjon.

For mer sammensatt forklaringsgrafikk kan en statisk illustrasjon ledsages av interaktiv trinnvis lesning. Ikke krev at leseren fysisk drar, zoomer eller sveiper for å forstå poenget.

## 6. Infobokser som hjelper, ikke overtar

Bruk native `<details><summary>` for begrepsforklaringer, korte kildesammendrag, metode, spørsmål og svar, eller begrenset kontekst. Etiketten skal fortelle hva boksen åpner, for eksempel «Hvordan er tallene beregnet?» og ikke bare «Les mer». Innholdet kan inneholde tekst, punktliste eller direkte kildelenker. Nøkkelfakta som er nødvendige for å forstå nyheten, bør stå i ordinær tekst.

## 7. Sjangerprofiler – samme oppsett, ulikt journalistisk tempo

| Sjanger | Foretrukket fortelling | Ofte nyttige moduler | Bør normalt unngås |
| --- | --- | --- | --- |
| **Kort nyhet** | Hendelse → betydning → oppfølging | Kilde i avsnitt, ett bilde, én faktaboks | Fire grafer og poll som distraherer fra hendelsen |
| **Dyp nyhet/feature** | Scene → forklaring → konsekvenser og spørsmål | Tidslinje, graf, faktaboks, kildeoversikt | Oppdiktet dramatisering |
| **Analyse** | Premiss → mekanisme → andre forklaringer → vurdering | Graf, sammenligning, forklaringssteg | Diagram som utgir uenighet for avgjort |
| **Politisk kommentar** | Tese → dokumentert begrunnelse → motargument → konklusjon | Nøkkeltall, symbolsk sekundærillustrasjon, faktaboks | Poll brukt som bevis for redaksjonens tese |
| **Debattinnlegg** | Forfatterens tese → argument → innvendinger → avslutning | Kildenoter, forklaringsboks, evt. meningsspørsmål | Å fremstille forfatterens motivpåstander som dokumentert |
| **Kultur** | Verk/uttrykk → kontekst → opplevelse og analyse | Bildegalleri, tidslinje, sitater | Oppdiktet verk eller feil bilde-/sitatrettighet |
| **Sport** | Prestasjon/hendelse → spillmessig forklaring → konsekvenser | Kampforløp, statistikkgraf, tidslinje | Tall uten sesong/turnering og ubegrunnet karikatur |
| **Forklarer** | Et spørsmål → trinnvis svar → begrensninger | Forklaringssteg, graf, ordliste/faktaboks | Avsnitt som bare gjentar trinnkortene |

### Anbefalt vekt, ikke mekaniske kvoter

- Kort nyhet: helst 0–1 levende modul, fordi leseren vil ha nyheten raskt.
- Middels artikkel: oftest én eller to relevante moduler; hovedbilde og ev. sekundærbilde etter tekstens behov.
- Lang feature eller forklarende artikkel: flere moduler kan brukes, men hvert brudd i teksten må kunne begrunnes journalistisk.
- Avstemninger passer bare når et konkret spørsmål faktisk er relevant. **Ingen automatisk poll i hver artikkel.**

## 8. Tilgjengelighet, iPad og kvalitet

- Native semantiske elementer der mulig: `article`, `figure`, `figcaption`, `details`, `summary`, `table`, `fieldset`, `dialog`, `button`.
- Touch-targets minst omtrent 44 px; tydelig fokusmarkering, sterke kontraster, understrekede lenker, skalerbare fonter.
- Tastaturnavigasjon fungerer på alle moduler, også grafdialog og trinnvis forklaring.
- Ingen automatisk bevegelse; respekter redusert bevegelse. Ingen modul krever hover.
- iPad stående og liggende må ikke gi horisontal side-scroll; brede tabeller kan rulles lokalt.
- Bruk optimaliserte bilder med eksplisitte dimensjoner og lazy loading under første skjerm; bevar godkjent bildefil.
- Moduler skal virke forståelig med deaktivert JavaScript: tidslinjer og faktabokser åpnes normalt; grafer kan åpnes som originalfil; forklaringssteg er synlige. Lokal avstemning krever JavaScript og skal vise en tydelig forklaring dersom den ikke fungerer.
- Test i minst smal mobil, iPad stående, iPad liggende og datamaskin. Kontrollér også at modal lukker på Escape, og at fokus går tilbake til utgangspunktet.

## 9. Produksjonsløp og ansvar

1. **Journalistisk arbeid:** Skriv hele artikkelen først; lag en faktaliste med kildelenker og risiko.
2. **Redaksjonell plan:** Marker hvilke avsnitt som trenger kildenote, og hvilke spørsmål det kan lønne seg å forklare visuelt.
3. **Velg moduler:** Velg kun de som forbedrer historien. Tegn en enkel leserytme: tekst → utdypning → tekst.
4. **Bilder:** Velg hovedbilde og ev. sekundærbilde i tråd med bildehåndboken; godkjenn eksakt fil.
5. **Grafer og data:** Legg inn kildekontrollerte tall, riktig metode, datatabell og alt-tekst. Ingen illustrative demodata i publisert artikkel.
6. **Interaktivitet:** Test åpne/lukke, skjermleser, tastatur, mobil og uten JavaScript. Demonstrasjonsavstemning skal aldri vise falske fellestall.
7. **Redaksjonell godkjenning:** Kontrollér all tekst, bilder, dokumentlenker, sitater og tekniske deler. Hver artikkel godkjennes enkeltvis.
8. **Publisering:** Oppdater riktig nyhetsstrøm, metadata og faktiske URL-er. Utkast er `noindex`; forhåndsvisning er ikke publisering.
9. **Etterkontroll:** Åpne publisert artikkel på GitHub Pages og prøv alle moduler. Registrer vesentlige rettelser og vedlikehold datagrunnlaget.

## 10. Eksempel og gjenbruk

**Arbeidspraksis:** Lag en ny artikkel fra [Maler/mal-artikkel.html](../Maler/mal-artikkel.html), og **kopier bare de modulblokkene** som er redaksjonelt begrunnet fra [artikkel-demo.html](artikkel-demo.html). Ikke kopier demoens tall, spørsmål eller grafikk til en faktisk nyhet. Komponentenes CSS/JS er allerede delt og skal ikke dupliseres i hver artikkel.

Den felles demon viser følgende funksjoner med ekte HTML og ferdig atferd: klikkbar begrepsboks; lokal avstemning med valg og endring; graf med forstørrelse og talltabell; tidslinje med utvidbare hendelser; trinnvis forklaring; inline kildehenvisning og komplett kildeoversikt.

**Publiseringssperre:** Ingen interaktiv modul er et argument for å publisere en sak med ufullstendige kilder eller uavklart bildebruk.
