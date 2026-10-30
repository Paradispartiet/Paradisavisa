document.addEventListener("DOMContentLoaded", () => {
  initAvisaMenu();
  initSharedHeader();

  // Nyhetsinnhold lastes uavhengig av notisbåndet. Nettfeil i en
  // enkelt JSON-fil skal aldri hindre andre seksjoner i å vises.
  if (document.querySelector(".notisbånd")) loadNotiser();
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

/* ---------- Notisbånd: rolig, jevn og sømløs bevegelse ---------- */
function loadNotiser() {
  // Sportsiden bruker sitt eget notisutvalg, alle andre sider notiser.json.
  const source = document.querySelector(".sport-banner") ? "sport-notiser.json" : "notiser.json";
  return fetch(source, { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Kunne ikke hente notiser");
      return response.json();
    })
    .then(items => {
      const band = document.querySelector(".notisbånd");
      const innhold = band?.querySelector(".notisinnhold");
      if (!band || !innhold || !Array.isArray(items)) return;

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
      band.querySelector(".notis-pause")?.remove();
      if (!items.length) return;

      const sekvens = document.createElement("span");
      sekvens.className = "notis-sekvens";

      items.forEach(n => {
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

      const oppdaterHastighet = () => {
        const bredde = sekvens.getBoundingClientRect().width;
        if (bredde > 0) {
          // Mobil: 30 px/s. Større skjermer: 38 px/s.
          // Hastigheten er konstant gjennom hele løkken.
          const fart = window.matchMedia("(max-width: 700px)").matches ? 30 : 38;
          innhold.style.setProperty("--ticker-duration", (bredde / fart).toFixed(2) + "s");
        }
      };

      const knapp = document.createElement("button");
      knapp.type = "button";
      knapp.className = "notis-pause";
      knapp.textContent = "Pause";
      knapp.setAttribute("aria-label", "Pause notisbåndet");
      knapp.setAttribute("aria-pressed", "false");
      knapp.addEventListener("click", () => {
        const stoppet = band.classList.toggle("is-paused");
        knapp.textContent = stoppet ? "Start" : "Pause";
        knapp.setAttribute("aria-label", stoppet ? "Start notisbåndet" : "Pause notisbåndet");
        knapp.setAttribute("aria-pressed", String(stoppet));
      });
      band.appendChild(knapp);

      // Mål tekstbredden etter at typografien er klar. Da unngår vi at
      // animasjonen endrer varighet og hopper idet nettfonten lastes.
      const start = () => {
        oppdaterHastighet();
        innhold.classList.add("is-running");
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
function loadNyhetshjul() {
  fetch("Nyhetshjul.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const grid = document.getElementById("nyhetshjul-grid");
      if (!items.length || !grid) return;
      grid.innerHTML = "";
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      items.forEach(item => {
        grid.innerHTML += `
          <a class="hjul-card" href="${item.url}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}"
                 style="object-position:${item.position || 'center center'};">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt)}</p>
          </a>`;
      });
    })
    .catch(err => console.error("Nyhetshjul feilet:", err));
}

function loadNyhetshjul2() {
  fetch("Nyhetshjul2.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const grid = document.getElementById("nyhetshjul2-grid");
      if (!items.length || !grid) return;
      grid.innerHTML = "";
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      items.forEach(item => {
        grid.innerHTML += `
          <a class="hjul-card" href="${item.url}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}"
                 style="object-position:${item.position || 'center center'};">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt)}</p>
          </a>`;
      });
    })
    .catch(err => console.error("Nyhetshjul2 feilet:", err));
}
/* ---------- Sportshjul ---------- */
function loadSportshjul() {
  fetch("Sportshjul.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const grid = document.getElementById("sportshjul-grid");
      if (!items.length || !grid) return;
      grid.innerHTML = "";
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      items.forEach(item => {
        grid.innerHTML += `
          <a class="hjul-card" href="${item.url}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}"
                 style="object-position:${item.position || 'center center'};">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt)}</p>
          </a>`;
      });
    })
    .catch(err => console.error("Sportshjul feilet:", err));
}

/* ---------- Kulturhjul ---------- */
function loadKulturhjul() {
  fetch("Kulturhjul.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const grid = document.getElementById("kulturhjul-grid");
      if (!items.length || !grid) return;
      grid.innerHTML = "";
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      items.forEach(item => {
        grid.innerHTML += `
          <a class="hjul-card" href="${item.url}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}"
                 style="object-position:${item.position || 'center center'};">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt)}</p>
          </a>`;
      });
    })
    .catch(err => console.error("Kulturhjul feilet:", err));
}

/* ---------- Kommentarhjul ---------- */
function loadKommentarer() {
  fetch("kommentarer.json", { cache: "no-store" })
    .then(r => r.json())
    .then(data => {
      const grid = document.getElementById("kommentarhjul-grid");
      if (!data.length || !grid) return;
      grid.innerHTML = "";
      data.forEach(item => {
        grid.innerHTML += `
          <a class="hjul-card" href="${item.url}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}"
                 style="object-position:${item.position || 'center center'};">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt)}</p>
          </a>`;
      });
    })
    .catch(err => console.error("Kommentarhjul feilet:", err));
}

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
