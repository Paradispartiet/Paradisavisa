# PR #199 – én fil for bildeimport

**Bare for PR #199-grenen. Ikke legg inn bilder på main.**

Last opp den uendrede ZIP-filen fra ChatGPT-samtalen til akkurat denne mappen via GitHub:

`redaksjon/incoming/PR199_Paradisavisa_bilder_2026-11-20.zip`

Forventet SHA-256 for hele ZIP-filen:

`3be1ba5f888566fbcf7d521e5eb71e6311669c63f766694229c482c4b9f1c94d`

Når filen er lagt inn ved en commit på PR-grenen, starter arbeidsflyten
`.github/workflows/pr199-image-import.yml` automatisk. Den leser ZIP og
kontrollerer både hele arkivet og hver av de seks WebP-filene før noen data
oppdateres. Deretter settes de tre hovedbildene inn i de respektive HTML-utkastene
og bildereferansene i `utkast/artikler.json` oppdateres.

Etter målrettede tester lager GitHub en ny commit med filene på **den samme PR-grenen**.
Den midlertidige ZIP-filen slettes fra den nye committen, men kan fortsatt ligge i
Git-historikken. Bildene og artiklene blir **ikke** lagt inn på forsiden,
publiseringsstrømmen, X eller Instagram.

Utkastene forblir `noindex`, `status=utkast`, `godkjent=false` og `publisert=false`.

Hvis GitHub Actions mangler skriverettigheter, må importens commit fullføres etter
at repoets Actions-innstilling er kontrollert; ikke gi andre tokens eller
lag nye hemmeligheter bare for denne oppgaven.

Ved fejl: kontroller bare loggen for **PR199 – importer godkjent bildepakke**.
Ikke åpne en ny PR og ikke erstatt arkivet med en omkomprimert utgave.
