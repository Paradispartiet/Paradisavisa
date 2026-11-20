# PR #199 – Bildeleveranse og publiseringsport
**Dato:** 20. november 2026
**Status:** Tre eksporterte hovedillustrasjoner og tre miniatyrer er levert i samtalen som en ZIP-pakke. Filene er **ikke** lagt inn i GitHub gjennom denne PR-en. PR #199 forblir utkast fram til de faktiske WebP-filene er lastet opp og godkjent.

## Artikkelbilder
Alle hovedbilder: **1600 × 900 WebP**, alle miniatyrer: **512 × 288 WebP**.
Bildene er originalt KI-genererte eller bearbeidet fra KI-generert redaksjonelt motiv. Ingen av motivene er dokumentarfotografier fra hendelsene.

| Artikkel | Hovedbilde | SHA-256 |
| --- | --- | --- |
| Stormaktene | `stormaktene-fredserklaering-hovedbilde.webp` | `2b4f4afd1154` (kortprefiks) |
| Anthropic | `anthropic-rekordnotering-hovedbilde.webp` | `d9baace6ae79` (kortprefiks) |
| Høyre | `hoyre-budsjett-frp-maling-hovedbilde.webp` | `51098b246a64` (kortprefiks) |

Tilhørende miniatyrer erstatter `-hovedbilde.webp` med `-miniatyr.webp`.
Fullstendige kontrollsummer, dimensjoner, alt-tekst og bildetekster ligger i `manifest.json` i leveransepakken.

### Innhold og etikett
- **Stormaktene:** Malerisk montasje med Trump, Xi og Putin foran nasjonale flagg og et forhandlingsbord. Bildetekst: *KI-generert redaksjonell illustrasjon av de tre lederne. Ikke dokumentarfoto fra toppmøtet.*
- **Anthropic:** Kontrast mellom klassisk børsarkitektur og serverrom bak glass i storbylandskap. Bildetekst: *KI-generert redaksjonell illustrasjon om finans og KI-infrastruktur. Ikke foto av Anthropics børsnotering.*
- **Høyre:** Illustrert person på blå Høyre-bakgrunn med dokument merket «Alternativt statsbudsjett 2027». Bildetekst: *KI-generert redaksjonell illustrasjon av budsjettdebatten. Ikke foto fra budsjettpresentasjonen.* Unngå å navngi personen som et konkret portrett uten verifisert identitet.

## Automatisk bildeimport fra iPad (foretrukket)
Bildepakken leveres som **én uendret ZIP-fil**, ikke seks enkeltfiler. Den lokale importtesten er bestått med den faktiske pakken.

1. Last ned `PR199_Paradisavisa_bilder_2026-11-20.zip` fra den tilhørende ChatGPT-samtalen.
2. Åpne `redaksjon/incoming/` i den **eksisterende PR #199-grenen**, velg GitHubs «Add file» → «Upload files», og last opp ZIP-filen med nøyaktig dette navnet.
3. Velg **Commit directly to the redaksjon/nyhetsbolk-2026-11-19-stormakter-ki-budsjett branch**, ikke `main`.
4. GitHub Actions-jobben **PR199 – importer godkjent bildepakke** kontrollerer ZIP SHA-256 `3be1ba5f888566fbcf7d521e5eb71e6311669c63f766694229c482c4b9f1c94d`, alle seks bildefiler, bildetekstene, HTML-strukturen og redaksjonelle utkast-sperrer. Ved grønn kontroll legger jobben bildene og HTML-endringene inn i PR #199 og fjerner ZIP-filen fra den nye committen.
5. Ingen produksjonspublisering eller SoMe-utsending skjer. Artiklene forblir `noindex`, `status=utkast`, `godkjent=false` og `publisert=false`.

Importkode: `scripts/pr199_import_images.py`. GitHub-jobb: `.github/workflows/pr199-image-import.yml`.
Mottaksmappe: `redaksjon/incoming/README.md`.

## Manuell reserve hvis Github Actions ikke kan skrive til PR-grenen
1. Last opp de tre WebP-hovedbildene **uendret** fra ZIP til `utkast/2026-11-19/bilder/` i **den eksisterende PR #199-grenen**. Miniatyrene kan ligge samme sted. Kontroller full SHA-256 mot `manifest.json`.
2. Erstatt midlertidig `<img src="bilder/<slug>.svg">` i hver av de tre HTML-filene med `bilder/<slug>-hovedbilde.webp`; behold korrekt `alt`, 1600 × 900 og presis bildetekst. Utkastfilen er fortsatt `noindex`.
3. Oppdater `utkast/artikler.json` til `utkast/2026-11-19/bilder/<slug>-hovedbilde.webp`. Ved faktisk publisering kopieres godkjente bilder til `Bilder/Artikler/` og artikkelens offentlige bildebane, Open Graph og Twitter-bilde oppdateres. Det eksisterende `scripts/publiser-artikkel.cjs` støtter foreløpig bare SVG; bruk ikke dette skriptet for WebP-artikler uten egen justering og test.
4. Kjør `node scripts/valider-artikler.cjs` og `node --test scripts/nyhetsbolk-2026-11-19.test.cjs`, helst én avgrenset nettleserkontroll av disse tre artikkelsidene. Begge kontrollene støtter WebP i utkastmappen. Ikke krev full visuell forside-regresjon for et rent bildefilbytte i et upublisert utkast.
5. Kontroller kildene på nytt **samme dag som publisering** og godkjenn hver artikkel separat etter `REDAKSJONSPLAN.md`. Oppdater kun riktig nyhetshjul. Først etter offentlig publisering klargjøres og sendes Instagram/X etter den eksisterende SoMe-rutinen.

## SoMe-tekster (foreløpige, ikke sendt)
**Stormaktene — X:** Trump, Xi og Putin lover dialog om atomrisiko og FN-reform. Men ingen konkret plan for Ukraina kom fra toppmøtet. Les analysen i Paradisavisa.

**Anthropic — X:** Anthropic hentet rundt 81 milliarder dollar i rekordnoteringen. Aksjen steg først kraftig, men sluttet på 97,17 dollar. Hva sier det om KI-boomen? Les Paradisavisa.

**Høyre — X:** Høyre vil omprioritere 42,3 milliarder kroner i alternativt budsjett. Samtidig måles Frp til 33 prosent og Høyre til 12,8. Hva betyr tallene? Les Paradisavisa.

**Instagram:** Bruk den godkjente artikkelillustrasjonen øverst; nedenfor svart felt med hvit overskrift, kort grå ingress og kun avsenderen «paradisavisa». Ingen `http` i grafikken. Inntil bilder og publiserte URL-er finnes, er også Instagram-kortene bare kladder.

## Kjente urelaterte CI-avvik
På PR #199 har ordinær artikkel-CI tidligere feilet i `2026-11-17-fritt-valg-av-nav-kontor.html` (felles header). Den generelle forside-nettlesertesten har stoppet på tidsgrense. Ingen av dem er begrunnet i endringene i de tre utkastene. Den særskilte PR199-testen har bestått.
