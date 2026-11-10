# Hegseth – eneste gjenstående sak i PR #107

**Status: UTKAST – ikke slå sammen.**  
Oppdatert 10. november 2026, etter publisering av to andre artikler via PR #118.

Datasenterartikkelen og Nationaltheatret-saken ble publisert via [PR #118](https://github.com/Paradispartiet/Paradisavisa/pull/118). **Denne PR-en gjelder nå bare den amerikanske Hegseth-saken.** Ingen endringer i de to publiserte artiklene er foreslått.

## Filer i denne PR-en

- `artikler/2026-11-10-massie-hegseth-riksrettsforslag.html` – foreslått artikkel.
- `Bilder/Artikler/2026-11-10-massie-hegseth.webp` – KI-assistert redaksjonell illustrasjon.
- `Nyhetshjul.json` – ett nytt forsidekort når resultatet er verifisert.
- `scripts/tre-saker-2026-11-10.test.cjs` og `valider-artikler.yml` – teknisk kontroll som også verifiserer de to allerede publiserte artiklene.

## Publiseringssperrer

- [ ] **Offisielt resultat fra Representantenes hus er dokumentert**, med rett prosedyre, stemmetall, dato og kilde til permanent House-roll-call.
- [ ] Tittel, ingress, brødtekst, nyhetskort og eventuelle anslag justeres etter hva som faktisk skjedde.
- [ ] Beskyldninger og tilsvar er balansert, og en prosedyreavstemning framstilles ikke som dom eller avsettelse.
- [ ] Bildet vurderes endelig for personlikhet og et symbolsk, ikke-dokumentarisk uttrykk. Brukerens generelle «Kjør på» var klarsignal for de to andre sakene; Hegseth-bildet gis ikke automatisk status som publisert.
- [ ] Oppdater faktisk publiseringsdato i `<time>`, `article:published_time` og `Nyhetshjul.json`.
- [ ] Kjør QA/visuell sjekk på nytt etter faktauppdateringen og merge først etter redaksjonell kontroll.

## Offisielle utgangspunkter

- [Massies fremleggelse](https://massie.house.gov/news/documentsingle.aspx?DocumentID=395863)
- [Representantenes hus, dagsorden](https://www.majorityleader.gov/schedule/default.aspx)
- [Clerk of the House – avstemninger](https://clerk.house.gov/Votes)
- [Reuters om riksrettsprosedyren](https://www.reuters.com/legal/government/how-would-impeaching-pentagon-chief-hegseth-work-2026-11-10/)

**Ikke bruk gamle uttrykk som «avstemning ventes» etter at det offisielle resultatet foreligger.**
