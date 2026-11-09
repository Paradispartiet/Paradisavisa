# Paradisavisas Alltid Nyheter-radio — produksjonsplan v1

**Opprettet:** 2026-11-09  
**Status:** Plan. Ingen av punktene nedenfor er implementert ved å godkjenne dette dokumentet.  
**Driftskrav:** Behold dagens gratis GitHub Pages-løsning. Unngå betalt API, server, databasedrift og unødvendig kjøring av fullkatalogtester.

## 1. Mål og avgrensning

- Gi lytteren en norsk nyhetsradio som fortløpende leser **kun redaksjonelt godkjente, fortsatt aktuelle** notiser fra `notiser.json`.
- Behold dagens **én-knappsmeny** for (1) pause/start av tekstbåndet, (2) båndhastighet **2× / 4× / 6×** og (3) start/stopp av radio. Ikke forveksle båndhastighet med taletempo.
- Gjør nyhetsradioen bedre med fast norsk stemme, uttaleregler, lydfiler, egen radioside og mobilt mediepanel når støttet.
- Behold nettleserens Web Speech-opplesning som reserve når en lydfil mangler eller ikke kan spilles.
- Ikke påstå at en statisk nettside gir ekte direktesending eller garantert bakgrunnsavspilling. I v1 er dette en **kontinuerlig, oppdatert spilleliste** over ferske nyheter.
- Nyhetene må ikke redigeres eller oppfinnes av lydsystemet. Radiotekst er en godkjent, språklig tilrettelagt versjon av den faktiske notisen.

## 2. Bekreftet utgangspunkt

- `script.js` henter `notiser.json`, filtrerer etter `isNotisAktuell()` (datert, gyldig og under syv dager; valgfritt `expires`) og tilbyr allerede Web Speech.
- Nåværende radio bruker `SpeechSynthesisUtterance` og `speechSynthesis.getVoices()`, setter `lang = "nb-NO"`, leser i serie og sjekker kilden mellom rundene.
- Radio stoppes på `pagehide`; Web Speech er derfor **ikke** en stabil løsning ved sidetransisjon/låseskjerm.
- GitHub Pages gir statisk levering, ikke et kontinuerlig lydsignal. GitHub oppgir maks 1 GB publisert nettsted og myk månedsgrense på 100 GB trafikk (sjekk før skalering).
- Den aktive Piper-implementasjonen er `OHF-Voice/piper1-gpl` (GPL-3.0). Norsk stemmekandidat er `no_NO-talesyntese-medium`. Den konkrete modellens lisens og bruksvilkår må gjennomgås og dokumenteres før publisering. Modellkortet oppgir CC0 for treningsdatasettet, **ikke i seg selv en avklaring av alle modellrettigheter**.
- `Media Session API` kan eksponere tittel, avspilling og medietaster/låseskjermkontroller på kompatible enheter; støtte varierer mellom nettlesere.

## 3. Arkitektur

```text
Godkjente notiser (notiser.json)
    ├── Tekstbånd (eksisterende, uendret)
    ├── Web Speech fallback (valgt norsk systemstemme)
    └── Radio-produsent, GitHub Actions etter godkjent publisering
          ├── valider språk, dato, utløp og redaksjonell uttaletekst
          ├── stemmemodell + uttaleregler → norsk lyd
          ├── lydsjekk / metadata / innholds-hash
          └── radio/manifest.json + begrenset sett lydfiler
                  ↓
          radio.html + radio-player.js (HTMLAudioElement)
                  ↓
          Media Session API der nettleseren støtter det
```

- Manifestet peker kun på notiser som er aktuelle **ved avspillingstid**, ikke bare ved generering. Etter utløp skal lydfilen aldri velges, selv om den fortsatt er mellomlagret på enheten.
- Bruk stabile `id`-verdier i `notiser.json` (migreres uten å endre tidligere tekst eller kategori); valgfri `speechText` godkjennes manuelt for korrekt uttale.
- En filversjon beregnes fra `id + speechText + modell-versjon + lydinnstillinger`. Bare endrede notiser trenger ny lyd.
- Radio-manifestet kan inneholde `schemaVersion`, `generatedAt`, `voiceModel` og `items:[{id,date,expires,audioUrl,duration,contentHash}]`; kilde-URL og redaksjonell tekst ligger fortsatt i `notiser.json`.
- Feil/ikke tilgjengelig lyd: Web Speech-fallback, tydelig feilmelding eller neste notis. Ingen falsk indikasjon på «direkte».

## 4. PR-plan, i rekkefølge

### PR A — Norsk stemme og opplesningskvalitet (rask nytte)

**Berørte filer:** `script.js`, `scripts/notiser.test.cjs`, eventuelt ny `radio/uttale.json`.

1. Hent oppdatert stemmeliste med `getVoices()` + `voiceschanged`.
2. Vis norske tilgjengelige stemmer i radioskjermen/under radiovalg; behold enhetens standard dersom ingen norsk finnes. Husk brukerens stemmevalg lokalt.
3. Innfør skilt taletempo (ca. 0,9× / 1,0× / 1,1×) **uten å endre båndets 2× / 4× / 6×**.
4. Håndter pauser, talerestart, avbrudd og utløpte notiser.
5. Tilrettelegg uttale av datoer, kroner, forkortelser og navn gjennom redaksjonelle `speechText`-overstyringer. Ikke automatisk omskriving av nyhetsfakta.

**Ferdig når:** Kan velge norsk stemme der en slik finnes; radio leser første og neste notis; intet automatisk lydstart; norsk/nøytral fallback og skjermleserstatus virker; tester for tom stemmeliste, senere `voiceschanged`, stopp og utdatert innhold er grønne.

### PR B — Egen radioside og gjenbrukbar spiller

**Berørte filer:** nye `radio.html`, `radio-player.js`, `radio.css`; `script.js`, `index.html`, relevante tester.

1. Én delt radiomotor for sidens meny og den nye radiosiden (unngå to parallelle avspillinger).
2. Tydelig **Spill / pause / stopp / neste / forrige**, nåværende notis, kilde og status.
3. Behold den kompakte knappen i notisbåndet; tilby en lenke til full radioside.
4. Start radio ved **brukerklikk**, aldri automatisk ved lasting.
5. I første versjon anbefales egen radiotab for samtidig lesing; navigasjon i samme fane kan stoppe lyd inntil vedvarende appskall eventuelt bygges senere.
6. En løkke spiller redaksjonelt godkjente saker, sjekker endringer regelmessig (f.eks. maksimalt én oppfriskning per fem minutter) og tar med nye notiser neste runde. Tom aktiv liste gir en tydelig stopp, ikke repetisjon av gamle nyheter.

**Ferdig når:** Ulike spillerflater deler én korrekt tilstand; ingen dobbel avspilling, ingen uendelig hurtig-fetche-løkke; båndets pause påvirker ikke radiolyden utilsiktet; mobil og PC består nettlesertest.

### PR C — Norsk lydpilot og rettighetskontroll (beslutningsport)

**Berørte filer:** `radio/voice-license.md`, `scripts/radio/generer-lyd.*`, eventuelt testsamples på egen PR-/Actions-artifakt (ikke publiser rå modellfiler).

1. Prøv `OHF-Voice/piper1-gpl` mot norsk `no_NO-talesyntese-medium`. Registrer nøyaktig modellversjon, hash, modellkort og lisens.
2. Lag prøveopplesninger av minst 10 representative, godkjente notiser (navn, årstall, beløp, internasjonale ord). Vurder tydelighet, rytme og faktisk bokmålsuttale redaksjonelt.
3. Gjør uttaletekst til en eksplisitt godkjent redaksjonell verdi; behold originaltekst for leseren.
4. Konverter til mobilkompatibel komprimert lyd (f.eks. MP3), normaliser nivå uten klipping, måle filstørrelse og talelengde.
5. Hvis stemmen eller lisensen ikke er god nok: behold PR A/B som nyttig leveranse og velg annen forsvarlig modell. Ikke tving inn en svak stemme.

**Ferdig når:** Lisens dokumentert, lydfiler kontrollerte, og redaksjonen godkjenner kvaliteten. Ingen offentlig utsending før denne porten er bestått.

### PR D — Gratis automatisk lydpublisering

**Berørte filer:** `.github/workflows/radio-lyd.yml`, `scripts/radio/*`, `radio/manifest.json` eller generert nettstedspakke, publiseringstester.

1. Kjør lydgenerering **etter godkjent endring på main** og manuelt via `workflow_dispatch`, ikke på vilkårlige nyhetsutkast.
2. Bruk en låst modellversjon og kontroller lisens, hash, dato, `expires`, filstørrelse og den faktiske notisteksten.
3. Generer bare endret lyd; behold kun ferskt innhold i **publisert nettstedspakke** (normalt sju dager eller kortere ved `expires`).
4. Unngå å committe en stadig voksende lydhistorikk til `main`. Utred bygging av en Pages-artifakt med lyd og manifest fra Action-jobben. Migrer ikke eksisterende Pages-publisering før separat kontroll har bevist at hele avisa fortsatt leveres.
5. Ha en fungerende rollback til tidligere nettstedspakke og Web Speech som fallback hvis lydbygget feiler.
6. Mål nettstedstørrelse og trafikk; stopp og vurder annen gratis distribusjon før Pages-grenser overskrides.

**Ferdig når:** En godkjent ny notis får korrekt lyd og manifest etter deploy; redigert tekst regenererer lyd; utløpt lyd fjernes fra aktiv spilleliste; feilet generering endrer aldri tidligere godkjent publisering.

### PR E — Mobil, låseskjerm og stabilitet

**Berørte filer:** `radio-player.js`, `radio.html`, `service-worker.js` **kun hvis nødvendige** cache-endringer, nettlesertester.

1. Bruk `HTMLAudioElement` på ferdig lyd og `navigator.mediaSession` for metadata, spill/pause og neste/forrige der støttet.
2. Test Android Chrome, Android Firefox og iPad/iPhone Safari på faktisk enhet med skjerm på, skjerm låst, app i bakgrunn, Bluetooth/hodetelefoner og lydavbrudd.
3. Lagre spillerposisjon lokalt og gi en tydelig gjenoppta-knapp ved avbrutt avspilling.
4. Test sidetilbaketilgang: egen radiotab som minimum; ingen lovnad om sømløs lyd gjennom full sidenavigasjon før det faktisk virker.
5. Ingen automatisk lyd før brukergest; radioens tilgjengelighet og vanlige artikkelvisninger skal ikke forringes.

**Ferdig når:** Alle støttede funksjoner virker på dokumenterte enheter; fallbacks og begrensninger er synlige; testene er grønne. Låseskjermstøtte er mål, ikke garanti.

### PR F — Redaksjonell drift og sluttkontroll

- Redaksjonell sjekkliste: kilde, dato, `expires`, språk/uttale, lydsjekk, publisering, arkivering.
- Testmatrise: mobil/PC/iPad, Safari/Firefox/Chrome, uten Web Speech, feil lydfil, redusert bevegelse, tom liste, ny notis under sending, dårlige nettforhold, kildebytte, rollback.
- Bekreft at **gammelt stoff aldri blir opplest som nytt**, inkludert ved mellomlagring.
- Dokumenter «Alltid Nyheter» som kontinuerlig oppdatert lydspilleliste, ikke som bemannet døgnkontinuerlig direktestrøm.
- Sluttgodkjenning: GitHub Actions + faktisk nettleser + kontroll på offentlig GitHub Pages.

## 5. Prioritering og avhengigheter

| Rekkefølge | PR | Resultat | Avhengighet |
|---|---|---|---|
| 1 | A | Bedre gratis norsk tale umiddelbart | Eksisterende radio |
| 2 | B | Radioside og robust kontrollflyt | A |
| 3 | C | Dokumentert kvalitetsgodkjent norsk lyd | A |
| 4 | D | Automatisk lydpublisering uten løpende betaling | B + C |
| 5 | E | Mobil/låseskjermkontroller | D |
| 6 | F | Dokumentert v1-produksjonsklar radio | A–E |

**Stoppsignal:** Hvis rettigheter, lydkvalitet, kostnad eller Pages-deploy ikke kan godkjennes, avslutt ved forrige stabile trinn. Den nåværende radioen skal fortsatt fungere.

## 6. Sjekkliste for publisering av hver notis

- [ ] Notisen er kildekontrollert og uttrykkelig publisert i `notiser.json`.
- [ ] Stabil ID, dato og eventuell utløpsdato er validert.
- [ ] Utdaterte og udaterte notiser er utestengt fra aktiv lydspilleliste.
- [ ] Uttaleteksten er faktuelt identisk med godkjent notis og endret kun ved behov for uttale.
- [ ] Eventuell lydfil har sporbar modellversjon og samsvarende innholds-hash.
- [ ] Opplesning er prøvelyttet ved nye navn/uvanlige begreper.
- [ ] Spiller/manifest/lydfil er testet i faktisk nettleser før publisering.
- [ ] Ved feil beholdes sist verifiserte produksjon, uten automatisk publisering av usikre nyheter.

## 7. Kilder og tekniske rammer

- MDN — SpeechSynthesis og `voiceschanged`: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- MDN — Media Session API: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
- Piper (aktiv videreføring): https://github.com/OHF-Voice/piper1-gpl
- Norsk modellkort: https://huggingface.co/rhasspy/piper-voices/blob/main/no/no_NO/talesyntese/medium/MODEL_CARD
- GitHub Pages-grenser: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
