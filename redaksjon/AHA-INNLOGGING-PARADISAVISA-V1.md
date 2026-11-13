# Paradisavisa – Logg inn med Aha (V1)

## Brukerflyt
- Den øvre høyremenyen på forside og artikkelsider har «Logg inn med Aha».
- Knappen går til Ahas eksisterende innloggingsdialog. E-postlenke og Google er håndtert av Ahas Supabase Auth, uten egen aviskonto eller nytt passord.
- Etter innlogging returnerer Ahas callback til en validert adresse under /Paradisavisa/. Standard er avisforsiden.
- En verifisert leser ser Aha-profilnavn, «Min Aha-profil», «Mine artikler» og «Logg ut».
- Utlogging bruker AHAAuth.signOut og avslutter den delte Supabase-økten som også brukes av History GO.
- Artiklene forblir gratis uten konto, og innloggingslenken fungerer som vanlig lenke uten JavaScript.

## Personvern og teknikk
- Aha og History GO bruker samme offentlige Supabase-prosjekt og delte nettstedsorigin paradispartiet.github.io.
- Avisen gjenbruker Ahas eksisterende klientkonfigurasjon, databaseklient og Auth-modul. Dette er ikke en egen autentiseringstjeneste.
- Et lokalt profilnavn, profil-ID eller token alene er ikke bevis på innlogging. Menyen viser innlogget identitet først etter auth.getUser har bekreftet en ikke-anonym bruker; profilnavn hentes fra aha_profiles.
- Retur-URL er begrenset til History GO eller Paradisavisa, og kan aldri peke til et vilkårlig eksternt domene.
- Pålogging endrer ikke samtykke for lesehistorikk og sender ikke lesedata til en konto i bakgrunnen.
- Lesebiblioteket er i denne første versjonen fortsatt lokal nettleserlagring, ikke sky-synk mellom enheter eller kontospesifikk database. Dette krever eget autentisert datalag, konto-isolering og samtykke før aktivering.

## Release-gate
- Node-tester: scripts/paradisavisa-aha-auth.test.cjs og scripts/paradisavisa-aha.test.cjs.
- Chromium-mobil/desktop: scripts/paradisavisa-aha-auth-browser.cjs bruker ekte nettsted-DOM, men simulert Aha-identitet.
- Aha-regresjon: tests/aha-paradisavisa-auth-return.test.cjs, inkludert History GO som godkjent retur.
- Før merge må ekte e-post- og Google-innlogging, retur til artikkelside, utlogging på tvers, iPhone/iPad Safari og personvern gjennomgås.
- Avis-PR og Aha-PR er avhengige av hverandre og skal ikke deployes separat.
