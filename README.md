# Paradisavisa

Paradisavisa er en enkel nettavis bygget på GitHub Pages. Forsiden (`index.html`) viser automatisk nyeste artikler og debattinnlegg ved å lese fra to filer: `posts.json` og `debatt.json`.

---

## 📂 Struktur

```
index.html
styles.css
script.js
header.html
posts.json
debatt.json
/posts/
   2025-09-26-legeflukt.html
   2025-09-25-paradis-modellen.html
   ...
```

- `posts/` inneholder selve artiklene som HTML-filer.  
- `posts.json` er en oversikt over artiklene (tittel, url, ingress, dato).  
- `debatt.json` er en oversikt over debattinnlegg (tittel, url, forfatter, ingress, dato).  
- `script.js` bygger forsiden automatisk basert på disse JSON-filene.  

---

## 📰 Legge til ny artikkel (`posts.json`)

1. Lag en ny HTML-side i `/posts/`  
   - Gi den navn med dato først, f.eks. `2025-10-01-bilfri-skolevei.html`.  

2. Åpne `posts.json` og legg til en ny blokk nederst i lista:

```json
{
  "title": "Gratis kollektivtransport – et realistisk grep?",
  "url": "posts/2025-10-02-gratis-kollektiv.html",
  "excerpt": "Paradismodellen ser på kollektivtrafikk som en del av grunnbehovet. Men hva koster det å gjøre den helt gratis?",
  "date": "2025-10-02"
}
```

### Viktige ting å huske
- **title**: Skal være kort og tydelig.  
- **url**: Peker til HTML-filen i `/posts/`. Bruk dato først i filnavnet.  
- **excerpt**: Kort ingress som vises på forsiden (ikke mer enn 1–2 setninger).  
- **date**: Alltid på format `YYYY-MM-DD`.  

---

## 💬 Legge til nytt debattinnlegg (`debatt.json`)

1. Lag en ny HTML-side i `/posts/`, f.eks. `2025-10-01-tid.html`.  
2. Åpne `debatt.json` og legg til en ny blokk:

```json
{
  "title": "Debatt: Hvem eier egentlig tiden vår?",
  "url": "posts/2025-10-01-tid.html",
  "author": "Mats Gran",
  "date": "2025-10-01",
  "excerpt": "Arbeidslivet tar mer og mer av vår våkne tid. Paradismodellen tilbyr en enkel løsning: felles innsats, fri tid."
}
```

### Viktige ting å huske
- **title**: Bruk formatet “Debatt: …” eller “Svar: …”.  
- **url**: Må peke til filen i `/posts/`.  
- **author**: Navn eller pseudonym.  
- **date**: På format `YYYY-MM-DD`.  
- **excerpt**: Kort ingress (1–2 setninger).  

---

## 🔄 Publisering på GitHub Pages

- Alle filer i repoet ligger på GitHub.  
- Når du gjør endringer (legger til artikler eller oppdaterer JSON), trykk **Commit changes**.  
- GitHub Pages oppdaterer automatisk nettsiden (tar som regel 1–2 minutter).  
- Nettsiden blir synlig på:  
  ```
  https://<brukernavn>.github.io/Paradisavisa/
  ```

---

## ✨ Tips

- Husk komma `,` mellom objektene i `posts.json` og `debatt.json`.  
- Nyeste innlegg vises øverst på forsiden (sorteres automatisk på `date`).  
- Du kan bruke `editor.html` (hvis du har lagt den inn) til å generere ferdige JSON-blokker for artikler og debattinnlegg.  
