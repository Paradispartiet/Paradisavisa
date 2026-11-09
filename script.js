document.addEventListener("DOMContentLoaded", () => {
  initAvisaMenu();
  initSharedHeader();

  // Nyhetsinnhold lastes uavhengig av notisbåndet. Nettfeil i en
  // enkelt JSON-fil skal aldri hindre andre seksjoner i å vises.
  if (document.querySelector(".notisbånd")) {
    loadNotiser();
  }
  if (document.getElementById("notisgrid")) loadNotisarkiv();
  if (document.getElementById("nyhetshjul-grid")) loadNyhetshjul();
  if (document.getElementById("nyhetshjul2-grid")) loadNyhetshjul2();
  if (document.getElementById("sportshjul-grid")) loadSportshjul();
  if (document.getElementById("kulturhjul-grid")) loadKulturhjul();
  if (document.getElementById("kommentarhjul-grid")) loadKommentarer();
  if (document.querySelector(".debatt-innlegg")) loadDebatt();
  if (document.querySelector("[data-artikkelkategori]")) loadCategoryArchive();
  document.body.classList.add("loaded");
});

/* ---------- Felles toppmeny på artikkel- og debattsider ---------- */
function initSharedHeader() {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return Promise.resolve();

  // Løs lenker fra plasseringen til script.js: samme kode fungerer for
  // både rotfiler og artikkelundersider under /artikler/ og /posts/.
  const script = Array.from(document.scripts).find(el =>
    /\/script\.js(?:\?.*)?$/.test(el.src)
  );
  const root = script ? new URL(".", script.src) : new URL("../", location.href);

  // Behold alltid en synlig vei tilbake selv om lasting feiler.
  const fallback = document.createElement("a");
  fallback.href = new URL("index.html", root).href;
  fallback.textContent = "← Til Paradisavisa";
  fallback.className = "avis-fallback-link";
  placeholder.replaceChildren(fallback);

  return fetch(new URL("header.html", root), { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Toppmenyen kunne ikke lastes");
      return response.text();
    })
    .then(html => {
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      const header = template.content.querySelector("header.avisa-shared-header");
      if (!header) throw new Error("Felles toppmeny mangler header");

      // Innholdet kommer fra prosjektets egen header.html. Normaliser alle
      // interne lenker slik at de fungerer også fra artikler/ og posts/.
      header.querySelectorAll("a[href]").forEach(link => {
        const raw = link.getAttribute("href");
        if (raw && !raw.startsWith("#")) link.href = new URL(raw, root).href;
      });
      placeholder.replaceWith(header);
      if (!document.querySelector(".notisbånd")) {
        document.body.classList.add("har-felles-header");
      }
      initAvisaMenu();
    })
    .catch(err => {
      console.error("Felles toppmeny feilet:", err);
      // Den synlige fallback-lenken beholdes.
    });
}

/* ---------- Navigasjon – tilgjengelig også med tastatur og berøring ---------- */
function initAvisaMenu() {
  const headers = document.querySelectorAll(".avis-topp");
  headers.forEach(header => {
    const button = header.querySelector(".nav-toggle");
    const nav = header.querySelector(".avisa-menu");
    if (!button || !nav) return;

    function setOpen(open) {
      nav.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Lukk meny" : "Åpne meny");
      const glyph = button.querySelector(".nav-toggle-icon");
      if (glyph) glyph.textContent = open ? "×" : "☰";
    }

    setOpen(false);
    button.hidden = false;
    document.documentElement.classList.add("avis-meny-klar");

    button.addEventListener("click", () => setOpen(nav.hidden));

    nav.addEventListener("click", e => {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("click", e => {
      if (!header.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !nav.hidden) {
        setOpen(false);
        button.focus();
      }
    });
  });
}


/* ---------- Kategoriarkiv: tydelig dato, ingen gamle saker som "ferske" ---------- */
function loadCategoryArchive() {
  const container = document.querySelector("[data-artikkelkategori]");
  if (!container) return;
  const type = container.dataset.artikkelkategori;
  if (!["nyheter", "kultur"].includes(type)) return;

  const sources = type === "kultur"
    ? ["Kulturhjul.json"]
    : ["Nyhetshjul.json", "Nyhetshjul2.json"];

  Promise.all(sources.map(path =>
    fetch(path, { cache: "no-store" }).then(response => {
      if (!response.ok) throw new Error("Kunne ikke hente " + path);
      return response.json();
    })
  )).then(groups => {
    const seen = new Set();
    const items = groups.flat()
      .filter(x => x && x.url && x.title)
      .filter(x => {
        if (seen.has(x.url)) return false;
        seen.add(x.url);
        return true;
      })
      .sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")));

    container.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("p");
      empty.textContent = "Ingen arkiverte saker i denne kategorien ennå.";
      container.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement("a");
      card.className = "hjul-card";
      card.href = item.url;
      if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = "";
        image.loading = "lazy";
        card.appendChild(image);
      }
      const heading = document.createElement("h3");
      heading.textContent = item.title;
      card.appendChild(heading);
      if (item.date) {
        const time = document.createElement("time");
        time.className = "arkiv-dato";
        time.dateTime = item.date;
        try {
          time.textContent = new Date(item.date + "T12:00:00").toLocaleDateString(
            "nb-NO", {day:"numeric",month:"long",year:"numeric"}
          );
        } catch (_) {
          time.textContent = item.date;
        }
        card.appendChild(time);
      }
      if (item.excerpt) {
        const excerpt = document.createElement("p");
        excerpt.textContent = item.excerpt;
        card.appendChild(excerpt);
      }
      container.appendChild(card);
    });
  }).catch(err => {
    console.error("Kategoriarkivet feilet:", err);
    const fallback = document.createElement("p");
    fallback.textContent = "Arkivet kunne ikke lastes. Prøv å åpne siden på nytt.";
    container.replaceChildren(fallback);
  });
}

/* ---------- Notisferskhet: ikke vis gamle eller udaterte nyheter ---------- */
function isNotisAktuell(notis, now = new Date()) {
  if (!notis || typeof notis.text !== "string" || !notis.text.trim()) return false;
  const parseDato = value => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [aar, maaned, dag] = value.split("-").map(Number);
    const dato = new Date(aar, maaned - 1, dag);
    return dato.getFullYear() === aar && dato.getMonth() === maaned - 1 &&
      dato.getDate() === dag ? dato : null;
  };
  const dato = parseDato(notis.date);
  if (!dato) return false;
  const dagnummer = value => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86400000;
  const alder = dagnummer(now) - dagnummer(dato);
  if (alder < 0 || alder >= 7) return false;
  if (notis.expires != null) {
    const utloep = parseDato(notis.expires);
    if (!utloep || dagnummer(now) > dagnummer(utloep)) return false;
  }
  return true;
}

/* ---------- Notisbånd: rolig, jevn og sømløs bevegelse ---------- */
function loadNotiser() {
  // Alle sider bruker samme kildekontrollerte og daterte notisstrøm.
  const filename = "notiser.json";
  // Bruk script.js sin katalog, slik at notiser virker også i /artikler/.
  const appScript = Array.from(document.scripts).find(el => el.src.split("?")[0].endsWith("/script.js"));
  const source = new URL(filename, appScript?.src || window.location.href);
  return fetch(source, { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Kunne ikke hente notiser");
      return response.json();
    })
    .then(items => {
      const band = document.querySelector(".notisbånd");
      const innhold = band?.querySelector(".notisinnhold");
      if (!band || !innhold || !Array.isArray(items)) return;
      const aktuelle = items.filter(isNotisAktuell);
      band.hidden = !aktuelle.length;
      if (!aktuelle.length) {
        band.style.display = "none";
        innhold.replaceChildren();
        return;
      }
      band.style.removeProperty("display");

      band.setAttribute("aria-label", "Notisbånd");
      band.setAttribute("aria-live", "off");

      // Egen klippet lesesone for teksten: pauseknappen dekker ingen ord.
      let visning = band.querySelector(".notis-visning");
      if (!visning) {
        visning = document.createElement("div");
        visning.className = "notis-visning";
        innhold.before(visning);
        visning.appendChild(innhold);
      }

      innhold.classList.remove("is-running");
      innhold.replaceChildren();
      band.querySelector(".notis-kontroller")?.remove();
      const sekvens = document.createElement("span");
      sekvens.className = "notis-sekvens";

      aktuelle.forEach(n => {
        const item = document.createElement("span");
        item.className = "notis-tekst";
        const category = document.createElement("strong");
        category.textContent = String(n.category || "") + ":";
        item.append(category, document.createTextNode(" " + String(n.text || "")));

        let wrapper = item;
        if (n.url) {
          try {
            const url = new URL(n.url, window.location.href);
            if (url.protocol === "http:" || url.protocol === "https:") {
              const link = document.createElement("a");
              link.href = url.href;
              link.appendChild(item);
              wrapper = link;
            }
          } catch (_) {
            // Notisen vises fortsatt som ren tekst ved ugyldig URL.
          }
        }

        const skille = document.createElement("span");
        skille.className = "notis-skille";
        skille.textContent = "•";
        sekvens.append(wrapper, skille);
      });

      innhold.appendChild(sekvens);

      // Gjenta korte notislister så sekvensen minst dekker synlig bredde.
      // Ekstra gjentakelser leses ikke opp av skjermlesere.
      const original = Array.from(sekvens.children).map(node => node.cloneNode(true));
      for (let n = 0; n < 24 && sekvens.getBoundingClientRect().width < visning.clientWidth + 40; n++) {
        original.forEach(node => {
          const copy = node.cloneNode(true);
          copy.setAttribute("aria-hidden", "true");
          copy.querySelectorAll("a").forEach(link => link.tabIndex = -1);
          if (copy.matches("a")) copy.tabIndex = -1;
          sekvens.appendChild(copy);
        });
      }

      // To like sekvenser og bevegelse på nøyaktig én sekvensbredde:
      // ingen blank pause eller hopp når animasjonen starter på nytt.
      const kopi = sekvens.cloneNode(true);
      kopi.setAttribute("aria-hidden", "true");
      kopi.querySelectorAll("a").forEach(link => link.tabIndex = -1);
      innhold.appendChild(kopi);

      // Fire leser-valgte hastigheter (standard 1×), husket på denne enheten.
      const fartvalg = [
        { verdi: 0.5, navn: "0,5× – rolig" },
        { verdi: 1, navn: "1× – normal" },
        { verdi: 1.5, navn: "1,5× – rask" },
        { verdi: 2, navn: "2× – ekstra rask" }
      ];
      let valgtFart = 1;
      try {
        const lagret = Number(localStorage.getItem("paradisavisa-notisfart"));
        if (fartvalg.some(valg => valg.verdi === lagret)) valgtFart = lagret;
      } catch (_) { /* Privat Safari kan blokkere lagring. */ }

      const oppdaterHastighet = () => {
        const bredde = sekvens.getBoundingClientRect().width;
        if (!bredde) return;
        const grunnfart = window.matchMedia("(max-width: 700px)").matches ? 30 : 38;
        const grunnvarighet = bredde / grunnfart;
        // Når støttet, endre playbackRate uten å hoppe tilbake til starten.
        const animasjon = innhold.getAnimations?.()[0];
        if (animasjon) {
          innhold.style.setProperty("--ticker-duration", grunnvarighet.toFixed(2) + "s");
          try {
            animasjon.playbackRate = valgtFart;
            return;
          } catch (_) { /* Fallback for eldre Safari. */ }
        }
        innhold.style.setProperty("--ticker-duration", (grunnvarighet / valgtFart).toFixed(2) + "s");
      };

      const kontroller = document.createElement("div");
      kontroller.className = "notis-kontroller";

      const pauseknapp = document.createElement("button");
      pauseknapp.type = "button";
      pauseknapp.className = "notis-pause";
      const pauseikon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5v14M17 5v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
      const startikon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
      const visPauseknapp = () => {
        const pauset = band.classList.contains("is-paused");
        pauseknapp.innerHTML = pauset ? startikon : pauseikon;
        pauseknapp.setAttribute("aria-label", pauset ? "Start notisbåndet" : "Pause notisbåndet");
        pauseknapp.setAttribute("title", pauset ? "Start" : "Pause");
        pauseknapp.setAttribute("aria-pressed", String(pauset));
      };
      pauseknapp.addEventListener("click", () => {
        band.classList.toggle("is-paused");
        visPauseknapp();
      });
      visPauseknapp();
      kontroller.appendChild(pauseknapp);

      const hastighet = document.createElement("div");
      hastighet.className = "notis-hastighet";
      const fartknapp = document.createElement("button");
      fartknapp.type = "button";
      fartknapp.className = "notis-fartknapp";
      fartknapp.setAttribute("aria-haspopup", "true");
      fartknapp.setAttribute("aria-expanded", "false");
      const meny = document.createElement("div");
      meny.className = "notis-fartmeny";
      meny.id = "notis-fartmeny";
      meny.hidden = true;
      meny.setAttribute("role", "group");
      meny.setAttribute("aria-label", "Hastighet på notisbåndet");
      fartknapp.setAttribute("aria-controls", meny.id);
      const overskrift = document.createElement("span");
      overskrift.className = "notis-fart-overskrift";
      overskrift.textContent = "Velg hastighet";
      meny.appendChild(overskrift);

      const oppdaterFartknapper = () => {
        fartknapp.textContent = String(valgtFart).replace(".", ",") + "×";
        fartknapp.setAttribute("aria-label", "Velg hastighet – nå " + fartknapp.textContent);
        fartknapp.title = "Hastighet: " + fartknapp.textContent;
        meny.querySelectorAll("button[data-fart]").forEach(button => {
          button.setAttribute("aria-pressed", String(Number(button.dataset.fart) === valgtFart));
        });
      };
      for (const valg of fartvalg) {
        const knapp = document.createElement("button");
        knapp.type = "button";
        knapp.dataset.fart = String(valg.verdi);
        knapp.textContent = valg.navn;
        knapp.addEventListener("click", () => {
          valgtFart = valg.verdi;
          try { localStorage.setItem("paradisavisa-notisfart", String(valgtFart)); }
          catch (_) { /* Valget virker selv om lagring ikke er tilgjengelig. */ }
          oppdaterFartknapper();
          oppdaterHastighet();
          meny.hidden = true;
          fartknapp.setAttribute("aria-expanded", "false");
          fartknapp.focus();
        });
        meny.appendChild(knapp);
      }
      fartknapp.addEventListener("click", () => {
        meny.hidden = !meny.hidden;
        fartknapp.setAttribute("aria-expanded", String(!meny.hidden));
      });
      document.addEventListener("click", event => {
        if (!hastighet.contains(event.target)) {
          meny.hidden = true;
          fartknapp.setAttribute("aria-expanded", "false");
        }
      });
      hastighet.addEventListener("keydown", event => {
        if (event.key === "Escape" && !meny.hidden) {
          meny.hidden = true;
          fartknapp.setAttribute("aria-expanded", "false");
          fartknapp.focus();
          event.stopPropagation();
        }
      });
      hastighet.append(fartknapp, meny);
      kontroller.appendChild(hastighet);
      band.appendChild(kontroller);
      oppdaterFartknapper();

      // Mål tekstbredden etter at typografien er klar. Da unngår vi at
      // animasjonen endrer varighet og hopper idet nettfonten lastes.
      const start = () => {
        innhold.classList.add("is-running");
        oppdaterHastighet();
      };
      if (document.fonts?.ready) {
        document.fonts.ready.then(start, start);
      } else {
        start();
      }
    })
    .catch(err => console.error("Notisbånd feilet:", err));
}

/* ---------- Nyhetshjul ---------- */
/* ---------- Nyhetshjul: datert, kildekontrollert arkiv eller ferskt stoff ---------- */
function formatArticleDate(date) {
  // En publiseringsdato i kildedataene skal være YYYY-MM-DD.
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const parts = date.split("-").map(Number);
  const timestamp = Date.UTC(parts[0],parts[1]-1,parts[2],12);
  const d = new Date(timestamp);
  if (d.getUTCFullYear() !== parts[0] ||
      d.getUTCMonth() !== parts[1]-1 ||
      d.getUTCDate() !== parts[2]) return "";
  return new Intl.DateTimeFormat("nb-NO", {
    day:"numeric",month:"long",year:"numeric",timeZone:"UTC"
  }).format(d);
}

function daysSincePublished(date) {
  // Fremtidige/superskeive datoer teller ikke som ferske.
  if (!formatArticleDate(date)) return null;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  const today = Date.parse(yyyy+"-"+mm+"-"+dd+"T12:00:00Z");
  const published = Date.parse(date+"T12:00:00Z");
  return Math.floor((today-published)/86400000);
}

function buildArticleCard(item) {
  const card = document.createElement("a");
  card.className = "hjul-card";
  // Denne lenken kommer fra redaksjonelt kontrollert JSON i repoet.
  // Avvis uventede protokoller – ikke sett inn rå HTML.
  try {
    const target = new URL(String(item.url||""), location.href);
    if (!["http:","https:"].includes(target.protocol)) return null;
    card.href = target.href;
  } catch (_) { return null; }

  if (item.image) {
    const image = document.createElement("img");
    const safePath = String(item.image);
    try {
      const src = new URL(safePath, location.href);
      if (["http:","https:"].includes(src.protocol)) {
        image.src = src.href;
        image.alt = "";
        image.loading = "lazy";
        if (typeof item.position === "string" &&
            /^(?:center|top|bottom|left|right|\d{1,3}%)(?: (?:center|top|bottom|left|right|\d{1,3}%))?$/.test(item.position.trim())) {
          image.style.objectPosition = item.position.trim();
        }
        card.appendChild(image);
      }
    } catch (_) { /* En ugyldig bildebane må ikke hindre teksten. */ }
  }
  const title = document.createElement("h3");
  title.textContent = String(item.title||"");
  card.appendChild(title);

  const dateText = formatArticleDate(item.date);
  if (dateText) {
    const time = document.createElement("time");
    time.className = "forside-dato";
    time.dateTime = item.date;
    time.textContent = dateText;
    card.appendChild(time);
  }

  if (item.excerpt) {
    const excerpt = document.createElement("p");
    excerpt.textContent = String(item.excerpt);
    card.appendChild(excerpt);
  }
  return card;
}

function displayFreshness(items, gridId) {
  const container = document.getElementById(gridId);
  if (!container) return;
  const parent = container.closest("section, main");
  const label = parent?.querySelector("[data-nyhetsstatus]");
  if (!label) return;

  const valid = items.map(item=>item.date).filter(date=>formatArticleDate(date));
  valid.sort().reverse();
  if (!valid.length) {
    label.textContent = "Publiseringsdato mangler – kontroller kilden.";
    return;
  }
  const days = daysSincePublished(valid[0]);
  const latest = formatArticleDate(valid[0]);
  label.textContent = days !== null && days >= 0 && days <= 7
    ? "Sist publisert " + latest
    : "Fra arkivet · Sist publisert " + latest;
}

function loadArticleFeed(filename, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  return fetch(filename, {cache:"no-store"})
    .then(response=>{
      if (!response.ok) throw new Error("Kunne ikke hente "+filename);
      return response.json();
    })
    .then(raw=>{
      if (!Array.isArray(raw)) throw new Error("Uventet format i "+filename);
      const items=raw
        .filter(item=>item && item.url && item.title)
        .sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
      grid.replaceChildren();
      items.forEach(item=>{
        const card=buildArticleCard(item);
        if (card) grid.appendChild(card);
      });
      if (!grid.children.length) {
        const notice=document.createElement("p");
        notice.className="seksjonsinfo";
        notice.textContent="Ingen publiserte saker i denne kategorien ennå.";
        grid.appendChild(notice);
      }
      displayFreshness(items,gridId);
    })
    .catch(err=>{
      console.error(filename+" feilet:",err);
      const notice=document.createElement("p");
      notice.className="seksjonsinfo";
      notice.textContent="Sakene kunne ikke lastes akkurat nå.";
      grid.replaceChildren(notice);
    });
}

function loadNyhetshjul() { return loadArticleFeed("Nyhetshjul.json","nyhetshjul-grid"); }
function loadNyhetshjul2() { return loadArticleFeed("Nyhetshjul2.json","nyhetshjul2-grid"); }
function loadSportshjul() { return loadArticleFeed("Sportshjul.json","sportshjul-grid"); }
function loadKulturhjul() { return loadArticleFeed("Kulturhjul.json","kulturhjul-grid"); }
function loadKommentarer() { return loadArticleFeed("kommentarer.json","kommentarhjul-grid"); }

/* ---------- Debatt ---------- */
function loadDebatt() {
  fetch("debatt.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const container = document.querySelector(".debatt-innlegg");
      if (!container || !items.length) return;

      container.innerHTML = "";

      items.forEach(innlegg => {
        container.innerHTML += `
          <a class="card debatt-card" href="${innlegg.url}">
            ${innlegg.image ? `
              <img class="debatt-img"
                   src="${innlegg.image}"
                   alt="${escapeHtml(innlegg.title)}">
            ` : ""}

            <div class="debatt-content">
              <h3>${escapeHtml(innlegg.title)}</h3>
              <p class="debatt-meta">
                ${escapeHtml(innlegg.author)} · ${escapeHtml(innlegg.date)}
              </p>
              <p class="debatt-excerpt">
                ${escapeHtml(innlegg.excerpt.split(' ').slice(0, 16).join(' '))}...
              </p>
            </div>
          </a>`;
      });
    })
    .catch(err => console.error("Debatt feilet:", err));
}

/* ---------- Hjelpefunksjon ---------- */
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, s =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s])
  );
}

/* ---------- Faktaboks ---------- */
function toggleBox(id) {
  const box = document.getElementById(id);
  if (!box) return;
  box.style.display = (box.style.display === "block") ? "none" : "block";
}

/* ---------- Notisarkiv: gamle notiser vises bare etter aktivt valg ---------- */
function loadNotisarkiv() {
  const grid = document.getElementById("notisgrid");
  const details = document.getElementById("eldre-notiser");
  const gamleGrid = document.getElementById("eldre-notisgrid");
  if (!grid || !details || !gamleGrid) return;
  const hent = filename => fetch(filename, { cache: "no-store" }).then(response => {
    if (!response.ok) throw new Error("Kunne ikke hente notiser: " + filename);
    return response.json();
  });
  const tegn = (container, entries) => {
    container.replaceChildren();
    entries.forEach((item, i) => {
      const card = document.createElement("article");
      card.className = "notis-rute " + ["liten", "mellom", "stor"][i % 3];
      const header = document.createElement("div");
      header.className = "notis-header";
      const category = document.createElement("span");
      category.className = "notis-kategori";
      category.textContent = String(item.category || "Notis");
      const date = document.createElement("time");
      date.className = "notis-dato";
      date.dateTime = String(item.date || "");
      date.textContent = String(item.date || "Udatert");
      const description = document.createElement("p");
      description.textContent = String(item.text || "");
      header.append(category, date);
      card.append(header, description);
      container.appendChild(card);
    });
  };
  Promise.all([hent("notiser.json"), hent("arkiv/notiser-2025-10.json")])
    .then(([aktive, arkiverte]) => {
      if (!Array.isArray(aktive) || !Array.isArray(arkiverte)) throw new Error("Ugyldig notisliste");
      const sorter = entries => entries.sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || "")));
      const na = new Date();
      const ferske = sorter(aktive.filter(item => isNotisAktuell(item, na)));
      const historiske = sorter([...arkiverte, ...aktive.filter(item => !isNotisAktuell(item, na))]);
      tegn(grid, ferske);
      if (!ferske.length) grid.textContent = "Ingen aktuelle notiser akkurat nå.";
      tegn(gamleGrid, historiske);
      details.hidden = !historiske.length;
      const summary = details.querySelector("summary");
      if (summary) summary.textContent = "Eldre notiser (" + historiske.length + ") – åpne arkivet";
    })
    .catch(error => {
      console.error(error);
      grid.textContent = "Notisene kunne ikke lastes. Prøv igjen senere.";
      details.hidden = true;
    });
}
