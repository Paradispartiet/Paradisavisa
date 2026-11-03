# Paradisavisa – bildeplan for fem hovedsaker

**Utarbeidet:** 3. november 2026  
**Status:** Redaksjonell produksjonsbrief. Ingen bilder er produsert, erstattet eller publisert gjennom dette dokumentet. **Viktig avklaring 3. november:** Brukeren opplyser at et bedre Støre–Stubb-bilde allerede ble laget tidligere, men ikke kom inn i artikkelen. Dette bildet skal gjenfinnes og tas i bruk, ikke gjenskapes uten videre.  
**Layoutmal:** [Støre–Stubb: Den diplomatiske muligheten – og risikoen](https://paradispartiet.github.io/Paradisavisa/artikler/2026-11-02-store-stubb-diplomatisk-mulighet.html).

## Hvorfor dette må endres

Gjennomgang av faktiske bildefiler i repositoriet viser et stilbrudd. Eldre artikler benytter JPG/PNG-baserte hovedmotiver og scener, blant annet `Nyhetshjul/Anne_Hidalgo.JPG`, `Nyhetshjul/paris_gate.JPG`, `Nyhetshjul/Isbjornene.PNG`, `Nyhetshjul/Forside_arets_hage.PNG` og `Bilder/Kultur/Nobelprisen.PNG`. Nyere nyhetsutkast bruker derimot `spania.svg`, `israel.svg`, `protester.svg`, `fiskeri.svg`: omtrent 1,3–1,5 KB store SVG-filer med nær identisk svart/gul bakgrunn, kategoriord og én linjeikonfigur. Det begrenser atmosfære, særpreg og redaksjonell troverdighet. Støre–Stubb-sidens eksisterende `Bilder/store-stubb-diplomati-2026.svg` er mer detaljert, men fortsatt kart- og linjesymbolikk.

**Beslutning:** Behold Støre–Stubb-artikkelens layout, spesielt `.story-cover img` med 16:9-format, mørkt bakteppe, nøktern bildetekst og stor serif-tittel. Bytt den visuelle logikken fra ikonplakat til **gjennomarbeidet redaksjonell scenografi**, med en unik billedidé for hver artikkel. Det er ikke et krav at hvert bilde er blått eller mørkt: hver sak skal kunne kjennes igjen på sitt eget lys og sin egen fargeverden.

## Felles bilde-DNA og spesifikasjoner

- **Uttrykk:** Fotografisk dybde + kunstnerisk redaksjonell tolkning. Tenk et gjennomarbeidet magasinoppslag eller en filmstill, ikke ikon, infografikk, generisk KI-kollasj eller tilfeldig stock.
- **Komposisjon:** Ett motiv som leses umiddelbart i liten størrelse, men har dybde i stort format. Bruk forgrunn, mellomgrunn og bakgrunn bevisst. Arbeid med lys, materiale, rom, perspektiv og meningsbærende detaljer. Ikke lag for mange små motiv-elementer.
- **Variasjon:** Bildene skal kunne stå ved siden av hverandre på forsiden uten å oppfattes som samme mal. Varier kameravinkel, menneskelig nærvær, fargetemperatur og motivskala.
- **Format:** Master i 16:9, anbefalt minst **2400 × 1350 px**. Lever en optimalisert **WebP på 1920 × 1080 px**, og gjerne JPEG-reserve på samme format for bred kompatibilitet. Ved behov særskilt utsnitt 1:1 eller 4:3 til andre kortformater. Hold hovedmotivet innenfor sentrale 70 % av bredden, og kontroller faktisk utsnitt i forsidekort.
- **Tekst:** Ikke generer overskrifter, logotyper, flaggtekst, tall eller falske dokumenter som lesbar tekst i selve rasterbildet. Avisen eier typografien. Eventuelle tall som 53/48/19 legges som ekte HTML/SVG-typografi i separate, verifiserte grafikker – **ikke** som upålitelig KI-tekst.
- **Etikk:** Redaksjonelle KI-genererte scener må ikke se ut som ekte dokumentasjon fra en spesifikk hendelse eller et påstått møte. Ingen kunstige bilder av omkomne, kollisjonsøyeblikket, pågrepne, spesifikke protestdeltakere eller identifiserbare mistenkte. Bruk korrekt bildetekst: «KI-assistert redaksjonell illustrasjon. Ikke et dokumentarfotografi.»
- **Teknisk:** Bruk meningsfull `alt`-tekst på selve motivet, synlig bildetekst og oppdatert `og:image`. Sjekk mobilt 360–430 px, desktop 1440 px, kontrast mot svart side, lastetid og at ingen ansikter/fokuspunkt kuttes. Ingen bytte av bilder i `artikler/` uten godkjent ferdigfil og presseetisk gjennomgang.
- **Navngivning:** `Bilder/redaksjon/2026-11-03/store-stubb-diplomati.webp`, `spania-togkatastrofe.webp`, `israel-regjeringsdannelse.webp`, `europa-ungdomsprotester.webp`, `fiskeri-papirspor.webp`. Dette er planlagte destinasjoner, **ikke filer som allerede finnes**.

## 01. Støre–Stubb – bruk det allerede produserte bildet

**Originalbildet er nå mottatt i ChatGPT 3. november 2026:** En detaljrik redaksjonell montasje med nordiske flagg, en politisk samtalesituasjon, europakart, EU-symbol og ukrainsk krigsmotiv. Kildeformat: PNG 1670 × 942. En JPG for nettpublisering er klargjort i 1600 × 900 og skal legges i `Bilder/Artikler/store-stubb-geopolitisk-1600x900.jpg`. GitHub-tilkoblingen i denne økten kan redigere UTF-8-filer, men kan ikke overføre den lokale binære bildefilen direkte. Derfor er artikkelkoblingene klargjort i et *utkast til pull request*, men **endringen må ikke merges før den faktiske JPG-filen er lastet opp til grenen og visuelt verifisert**.

**Bilde må hentes frem, ikke genereres på nytt.** Et bedre Støre–Stubb-hovedbilde ble ifølge brukeren allerede produsert, men kom ikke inn på artikkelsiden. Bildet er foreløpig ikke funnet i `main`-grenen, de relevante redaksjonsgrenene, samtalens tilgjengelige bildefiler eller tilkoblet Drive. Originalfilen må leveres/identifiseres før integrasjon. Artikkelen viser nå `Bilder/store-stubb-diplomati-2026.svg`, en kartinspirert SVG med lyslinjer, og både `<img src>` og `og:image` peker på denne filen.

**Implementering når originalbildet er tilgjengelig:** Kontroller identitet, motiv, kvalitet, rettigheter og korrekt bildeetikett. Last opp den ekte eksisterende bildefilen (fortrinnsvis WebP/JPEG med passende dimensjoner) i `Bilder/redaksjon/2026-11-03/`; oppdater `<img src>`, `width`/`height`, `alt`, `<figcaption>`, `og:image` og `kommentarer.json` samt andre faktiske forside-/feedhenvisninger som bruker SVG-en. Verifiser at lenkene peker til bildet og at det faktisk vises både i artikkelen og på forsiden. Behold det gamle SVG-bildet for tilbakerulling. Ikke erklær oppgaven fullført før bildeopplasting og visning er kontrollert.

**Reservespesifikasjon – bruk bare dersom originalen ikke kan gjenfinnes og brukeren ber om nyproduksjon.**

**Eksisterende publisert bilde:** `Bilder/store-stubb-diplomati-2026.svg`; viser et kartinspirert mørkt rom, lyslinjer og forbindelser.  
**Ny visuell idé:** «Samtalen som ikke er et gjennombrudd.» Et stort, mørkt nordisk møterom; i forgrunnen en enslig analog telefon og en tom stol, et bord med varsomt reflektert lys; gjennom vinduet skimtes Helsinkis vinterblå skumring eller et abstrakt nordisk kystlandskap. I bakgrunnen et nesten usynlig kartprojisert lys, uten flaggkollasj. Det skal kommunisere avstand og diplomatisk usikkerhet – **ikke** at akkurat dette rommet eller denne telefonen ble brukt.

**Komposisjon:** 3/4-kameravinkel mot bordets ende; telefon i nedre venstre tredel, tom stol i midtre tredel, kaldt vinduslys fra høyre. Stor rolig negativ flate rundt motivet.  
**Palett:** nattblå `#0D1C2B`, skifer `#34475B`, støvet messing `#B89562`, hvitt lys `#D7E3E9`.  
**Stil/lys:** Fotorealistisk malerisk uttrykk, høy materialitet i tre, glass og tekstil; subtil filmgrain; dempet volumetrisk lys. **Ingen genererte ansikter av Støre, Stubb, Putin eller Zelenskyj.**

**Genereringsbrief (engelsk):**
> Premium editorial magazine cover illustration, cinematic painterly realism, empty Nordic diplomatic meeting room at blue hour, an old telephone resting on a polished dark wood conference table, one unoccupied chair, understated reflected brass lamp light, vast cold window overlooking an abstract northern waterfront, distant out-of-focus city lights, restrained geopolitical tension conveyed by emptiness and distance, impeccably detailed materials, sophisticated chiaroscuro, tactile atmosphere, muted navy and slate blue with subtle warm amber, editorial art direction, 16:9 horizontal hero image, central subject safe for crop, no people, no text, no emblems, not a documentary photo, no visual clutter.

**Bildetekst:** «Redaksjonell KI-assistert illustrasjon av diplomati og avstand. Motivet viser ikke rommet der samtalen fant sted.»  
**Alt:** «Mørkt møterom med telefon på et bord og en tom stol foran et kaldt blått vindu.»

## 02. Spania – 17 minutter

**Eksisterende bilde:** `utkast/2026-11-02/bilder/spania.svg`; gult togikon og teksten «TOGULYKKE».  
**Ny visuell idé:** «Sekundene som ikke kan tas tilbake.» Morgentåke over et tomt spansk høyhastighetsspor, sett nedenfra i svak diagonal, der en enkelt rød signalindikator lyser langt borte. I forgrunnen sviller, skinner og en diskret kabel/teknisk signaldetalj; sporene forsvinner mot et urolig horisontlys. **Ingen togkollisjon, skadde eller katastroferester.**

**Komposisjon:** Kraftig ledende linjer og dybdeperspektiv; rødt lys lite, men synlig og sentralt; lavt kamera langs sporet.  
**Palett:** kald stålblå `#23384B`, lys grå `#BCC6C9`, tørr terrakotta `#A86E4D`, signalrød `#C83931`.  
**Stil/lys:** Lyrisk dokumentarisk landskapsillustrasjon, lavt morgensollys, atmosfærisk tåke, høy detaljering i metallet. Ikke et bilde som skal kunne forveksles med opptak fra Urda.

**Genereringsbrief:**
> Sophisticated European newspaper editorial illustration about railway safety and investigation, cinematic painterly realism, low-angle view down empty high-speed railway tracks through a wide rural Spanish landscape at misty dawn, intricate wet steel rails and sleepers in foreground, distant solitary red signal light, subtle technical infrastructure and electrical cables, vanishing point creates tension, early autumn sky in cold steel blue and pale warm ochre, exquisitely nuanced atmosphere, somber and respectful, strong leading lines, 16:9 hero composition, central crop safe, no train collision, no wreckage, no casualties, no people, no text, no logos, not an actual disaster photo.

**Bildetekst:** «KI-assistert redaksjonell illustrasjon av jernbanespor og signalsikkerhet. Ikke fotografi fra ulykkesstedet.»  
**Alt:** «Tomme jernbanespor gjennom morgentåke med et rødt signallys i det fjerne.»

## 03. Israel – Makten som mangler 61

**Eksisterende bilde:** `utkast/2026-11-02/bilder/israel.svg`; gul mandatsirkel med tallet 61.  
**Ny visuell idé:** «Et parlament uten samlende flertall.» En stor parlamentarisk sal sett på skrå ovenfra, med flere adskilte øyer av belyste seterekker og en tom talerstol. Arkitektur og rom skal være inspirert av parlamentarisme, **ikke** en påstått eksakt rekonstruksjon av det israelske Knesset. Tre lyssoner kan antyde politiske blokker, men ingen av dem vises som en allerede inngått allianse.

**Komposisjon:** Midtstilt tom talerstol i avstand, lett asymmetrisk organisering av rom og seter; lys mot mørke.  
**Palett:** elfenben `#D2C9B7`, sandstein `#AA9073`, dyp marine `#16283E`, oksidert bronse `#806E54`.  
**Stil/lys:** Arkitektonisk redaksjonell realisme, grafisk skyggebruk, rolig men ladet. Ingen portretter eller politiske figurer; ingen falske mandattall inn i motivet.

**Genereringsbrief:**
> Premium political analysis illustration, painterly cinematic architecture, an empty modern parliamentary chamber with curving rows of seats arranged in subtly separated islands, elegant geometric lines, a lonely unoccupied speaker's podium at the distant center, three distinct soft pools of light across the room, unresolved political balance, no identifiable real chamber, warm sandstone and muted ivory against deep navy shadow, editorial photography depth, thoughtful asymmetry, contemplative atmosphere, sophisticated magazine cover art, 16:9 horizontal hero, central subject safe for crop, no politicians, no national flags, no numbers, no text, no propaganda, not documentary photography.

**Bildetekst:** «KI-assistert redaksjonell illustrasjon av en fastlåst parlamentarisk situasjon. Viser ikke Knesset eller en faktisk samling.»  
**Alt:** «Tom parlamentssal med oppdelte seterekker og en ubemannet talerstol.»

## 04. Europa – To gater, mange krav

**Eksisterende bilde:** `utkast/2026-11-02/bilder/protester.svg`; gule skilt og fem sirkelformede hoder.  
**Ny visuell idé:** «To byrom, ikke én bevegelse.» Et elegant visuelt dobbeltperspektiv som antyder en fransk og en tysk europeisk gate, med fredelige demonstranter i utydelig silhuett og plakater uten lesbar tekst. Samme kveldssol treffer begge byrommene, men menneskene og bevegelsesretningene er forskjellige. Bør oppleves dynamisk, ikke som én påstått koordinert aksjon.

**Komposisjon:** Diagonal gateakse og menneskelige silhuetter, et klart frontmotiv med to eller tre personfigurer sett bakfra, detaljer i byarkitektur og lys. Figurene er fiktive, ikke avbildninger av demonstranter fra identifiserbare protester.  
**Palett:** aubergine `#352A47`, kobber `#CF824D`, urbant blått `#304B61`, kremlys `#D6C9A8`.  
**Stil/lys:** Journalistisk illustrert gatefotografi, raffinert korn, lysende vinduer, bevegelsesuskarphet i folkemengden, menneskelig nærvær. **Ingen ild, vold, politiangrep eller skarpt gjenkjennelige personer.**

**Genereringsbrief:**
> Sophisticated editorial magazine illustration about diverse youth protests in France and Germany, dual-city visual narrative blended subtly through perspective without implying one joint march, European urban boulevard at late blue hour with warm shop-window light, small groups of peaceful fictional young demonstrators seen mostly from behind carrying blank placards, layered silhouettes, wet cobblestones reflecting violet and warm copper light, strong cinematic depth and humane observational mood, dynamic but dignified, subtle motion blur, refined painterly photographic texture, 16:9 hero, one foreground group as clear focal point, crop safe, no legible text, no recognizable real protestors, no flames, no violence, no logos, not a documentary photo.

**Bildetekst:** «KI-assistert redaksjonell illustrasjon av ungdomsprotester i europeiske byrom. Viser ikke en bestemt demonstrasjon.»  
**Alt:** «Unge demonstranter med plakater går gjennom en stemningsfull europeisk bygate i skumringen.»

## 05. Fiskeri – Fangsten på papiret

**Eksisterende bilde:** `utkast/2026-11-02/bilder/fiskeri.svg`; fiskesymbol og rektangulære linjer.  
**Ny visuell idé:** «Fysisk fisk, digitalt papirspor.» Et nordnorsk fiskemottak før soloppgang: kasser med sølvskimrende fisk, vann på betonggulv, veiing i mellomgrunnen og et anonymt, uleselig registreringsark under en transparent dokumentbeskytter i forgrunnen. Et nøkternt menneskelig arbeidsmiljø, ikke arrestasjon eller indikasjon på at den viste virksomheten har brutt loven.

**Komposisjon:** Taktilt nærbilde med skarp fiskekasse i venstre tredel, arbeidsbord/blankt skjema i høyre, havn og skip mykt ute av fokus bak.  
**Palett:** petroleum `#183E4A`, havgrå `#708D97`, isblå `#C5D8DD`, industriell gul `#C99A44`.  
**Stil/lys:** Nordisk industriell reportasjeestetikk, naturtro våte overflater, diskret kjølig lys, trygt mennesketomt eller anonyme arbeidsfigurer uten identifiserbar virksomhet. Ingen politi-/Økokrim-logoer, feilaktige skjema- eller personopplysninger.

**Genereringsbrief:**
> High-end investigative journalism editorial illustration, cinematic painterly realism of a generic Norwegian fishing harbor processing facility before dawn, tactile wooden and plastic crates filled with silver fish in the foreground, wet concrete and cold air, anonymous weighing station and unmarked blank paperwork in a transparent sleeve near the crates, blurred fishing vessels and industrial harbor lights in the background, subtle tension between real catch and administrative documentation, deep petroleum blue, frosty silver and restrained industrial amber, precise detail and dignified documentary atmosphere, 16:9 landscape hero, central crop safe, no readable documents, no company names, no logos, no police raid, no identifiable suspects, not a photograph of a real implicated company.

**Bildetekst:** «KI-assistert redaksjonell illustrasjon av fangstregistrering ved et fiskemottak. Ikke bilde fra Økokrims etterforskning.»  
**Alt:** «Fiskekasser og registreringspapirer ved et fiskemottak med havn i bakgrunnen.»

## Produksjonsrekkefølge

1. **Støre–Stubb: hent og monter eksisterende bilde.** Finn frem tidligere generert original, kontroller bildefilen, koble den til artikkel/forside/`og:image`, og test i den publiserte 16:9-malen. Ingen ny generering av denne saken før originalen er avklart.
2. **Spania og fiskeri.** Høy nyhetsalvorlighet: få etisk riktig, troverdig illustrasjon før offentlig bruk.
3. **Israel og Europa.** Sterk variasjon i rom, folkemengde, lys og farger så forsiden ikke blir ensformig.
4. **Visuell QA i to visninger:** `1440 px` desktop og `390 px` mobil; test hero, eventuell forside-thumbnail, lesbarhet og den synlige KI-etiketten.
5. **Godkjenning og teknisk implementering:** Redaktør godkjenner ferdig motiv, tilhørende bildetekst, lisens/bruksvilkår og nøktern dokumentasjonsstatus. Deretter byttes riktig filreferanse i artikkel, `og:image`, eventuelle JSON-feed-felter og forsiderelaterte kilder. Bevar originalfilen og rollback-mulighet.

## Godkjenningskriterier

- Motivet fungerer på ett sekund, og tåler nærmere lesning i full bredde.
- Minst ett interessant rom-, lys- eller materialelement som ikke kan gjengis med et enslig ikon.
- Ingen detalj som påstår en spesifikk faktisk hendelse, identitet, skyld eller politisk avtale som ikke er dokumentert.
- De fem motivene ser ut som en **kurert redaksjonell serie**, men ikke fem varianter av samme mørke plakat.
- Bilder i selve avisens 16:9-maler og kort er undersøkt før endelig godkjenning.

## Lenker til eksisterende filer

- [Layoutmal / publisert Støre–Stubb](../artikler/2026-11-02-store-stubb-diplomatisk-mulighet.html)
- [Eksisterende Støre–Stubb-illustrasjon](../Bilder/store-stubb-diplomati-2026.svg)
- [Spania-utkast](../utkast/2026-11-02/spania-togulykke.html)
- [Israel-utkast](../utkast/2026-11-02/israel-valget.html)
- [Europa-utkast](../utkast/2026-11-02/europa-protester.html)
- [Fiskeri-utkast](../utkast/2026-11-02/fiskeri-okokrim.html)
