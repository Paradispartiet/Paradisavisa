# Serbia – åttende levende artikkelreferanse
**Oppgradert:** 12. november 2026. **Opprinnelig publisert:** 2. november 2026 (beholdes).
**Kanonisk URL:** `artikler/2026-11-02-serbia-studentvalget.html`

## Redaksjonelt grep
Beholder overskrift, hovedhistorie, originalt arkivfoto og kreditering. Oppdaterer den tidligere foreløpige mandatfordelingen med RIKs **formelle resultat 5. november** og **mandatvedtak 6. november 2026**: studentlisten 140, Vučić-ledede United Serbia 103 og minoritetslister 7 av i alt 250 seter. Det er 126 seter som kreves for flertall.

## Komponenter
- Felles motor `artikkel.css` / `artikkel-interaktiv.js`; ingen ny komponentmotor.
- Skjematisk orienteringskart (Novi Sad, Beograd og Niš), med kort og diskret **Forstørr**-lenke, alt-tekst og nedlastbar SVG som no-JS-fallback. Kartet er **ikke målestokkriktig**.
- Fem klikkbare tidslinjepunkter 2024–2026.
- Tallelement med **140/103/7** mandater fra endelig RIK-rapport; ingen sammenblanding av seter og stemmeprosenter.
- Faglig utfellbar boks om mandatfordeling; fire redaksjonelle forklaringssteg (sorg, innsyn, mobilisering, valg).
- Lokal leseravstemning uten server/kollektiv statistikk. Den viser kun leserens eget svar.
- Bevarer ni opprinnelige kildeoppføringer og legger til nye, med lenker også i løpende tekst.

## Kildekontroll
- [RIK 75. sesjon, endelige resultater 5. november](https://www.rik.parlament.gov.rs/vest/en/4523/75th-session-of-the-republic-electoral-commission-.php)
- [Serbias regjering, mandatfordeling 6. november](https://www.srbija.gov.rs/vest/en/290895/mandates-allocated-to-members-of-new-parliaments-convocation.php)
- [Reuters, minnemarkeringen 1. november](https://www.reuters.com/world/serbians-mark-railway-disaster-that-led-rise-victorious-student-movement-2026-11-01/)
- [Reuters, demonstrasjonen i Niš 1. mars 2025](https://www.reuters.com/world/europe/serbians-hold-silent-protest-honour-railway-station-victims-2025-03-01/)
- [AP, ny nasjonalforsamling samles 17. november](https://apnews.com/article/c564cbe9ebef354d17ece7f60fae4b39)

## Publiseringsport
Statisk test `scripts/serbia-studentvalg-levende.test.cjs` og Chromium mobil/iPad/PC må være grønne på PR-head **før merge**. Kontroller deretter main-integritet og Pages-deploy. Ingen ny URL eller dublettforsidekort. 