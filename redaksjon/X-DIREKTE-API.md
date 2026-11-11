# Paradisavisa – direkte X-publisering (uten Metricool)

## Status

GitHub Actions er programmert for automatisk X-publisering av **nye, offentlig verifiserte** artikler. Funksjonen står **AV** inntil eieren har autorisert X-kontoen og satt på GitHub-variabelen X_AUTOPUBLISH_ENABLED=true. Den sender bare tekst med en direkte artikkellenke, ikke Instagram-bilde eller gammelt arkivstoff.

Offisiell dokumentasjon:
- Opprett innlegg: https://docs.x.com/x-api/posts/create-post
- API-priser og forbruksgrenser: https://docs.x.com/x-api/getting-started/pricing
- GitHub Actions Secrets: https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions

X oppgir per 11.11.2026 **USD 0,20 for å opprette innlegg med URL**. Pris kan endres. Integrasjonen begrenser seg selv til **10 slike innlegg per UTC-måned**, cirka USD 2 ved denne prisen. Andre API-kall er ikke inkludert i denne lokale rammen. Sett separat grense i X Developer Console og unngå automatisk påfyll om ønskelig.

## Kontoens engangsoppsett

1. Logg inn på https://console.x.com med den X-kontoen som skal publisere, og opprett en Developer App med tillatelsen **Read and Write**.
2. Under **Keys and Tokens** aktiverer/genererer du **OAuth 1.0a User Access Token & Secret** med skrivetillatelse. Dersom du endret tillatelsene, må nye bruker-tokens ofte genereres. App-only Bearer Token alene kan ikke publisere på en brukers konto.
3. Åpne https://github.com/Paradispartiet/Paradisavisa/settings/secrets/actions og lag følgende fire **Repository secrets**, med verdiene direkte fra X Developer Console:

   - X_API_KEY – API Key / Consumer Key
   - X_API_SECRET – API Key Secret / Consumer Secret
   - X_ACCESS_TOKEN – kontoens Access Token
   - X_ACCESS_TOKEN_SECRET – kontoens Access Token Secret

   Ikke del hemmelighetene i chat eller legg dem i kode. GitHub stiller sitt eget GITHUB_TOKEN til rådighet for å oppdatere den interne engangsloggen.

4. Lag en **Repository variable** med navnet **X_EXPECTED_USERNAME** og verdien av X-kontoens eksakte brukernavn **uten @**. Før hvert forsøk sjekker integrasjonen kontoen mot GET /2/users/me (et betalt API-oppslag). Feil konto eller manglende brukernavn blokkerer all sending.
5. Kontroller tillatelser, forventet konto, API-pris og forbruksgrense. Lag deretter en **Repository variable** under samme GitHub Actions-innstillingsside: navn **X_AUTOPUBLISH_ENABLED**, verdi **true**. Mangler variabelen, eller er den ikke nøyaktig true, sendes ikke et eneste X-innlegg.
6. Vent til **neste nye publiserte artikkel** for første ekte publisering. Aktivering sender ikke gamle artikler på nytt.

## Hvilke filer styrer dette?

- scripts/x-autopubliser.cjs – OAuth1-signering, manifest-sjekk, X API, månedstak.
- scripts/x-autopubliser.test.cjs – enhetstester uten nettverk eller reelle X-kostnader.
- .github/workflows/some-artikler.yml – produserer pakken etter at artikkelen er offentlig verifisert, og starter en separat, valgfritt aktivert X-jobb.
- redaksjon/SOME-PUBLISERING.md – felles rutine for Instagram og X.

## Trygghet og duplikatvern

X-jobben jobber én om gangen på tvers av workflow-runs. Før ethvert betalt API-kall må den skrive status **claimed** til det separate GitHub-registeret på grenen **x-publiseringslogg**, i redaksjon/x-publiseringslogg.json. Bare etter en eksplisitt bekreftelse fra X registreres status **published** og X-innleggets ID.

Ved feil, avbrudd eller tapt respons må redaksjonen kontrollere X manuelt. Kravet ligger fortsatt i registeret, og **automatisk retry er sperret**, siden en ukjent respons kan bety at X publiserte innlegget. Ikke slett disse oppføringene uten dokumentert kontroll. Grenen x-publiseringslogg skal ikke merges inn i main eller slettes.

Hvis den offentlige artikkelen eller artikkelbildet ikke er tilgjengelig, stoppes SoMe-kjeden før X-kallet. Et eventuelt feilende X-kall endrer ikke den publiserte artikkelen i avisa.

## Instagram

Instagram-kortet skal fortsatt ha godkjent bilde, stor hvit overskrift, ingress på svart felt og kun ordet **PARADISAVISA** nederst. Instagram har separat publisering og omfattes ikke av Xs betaling eller X-autorisering.