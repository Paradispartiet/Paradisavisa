document.addEventListener("DOMContentLoaded", () => {
  // 🟡 Last notisbåndet først
  loadNotiser().then(() => {
    setTimeout(() => {
      document.body.classList.add("loaded");
    }, 300);

    // 🟡 Deretter hjul og seksjoner
    if (document.getElementById("nyhetshjul-grid")) loadNyhetshjul();
    if (document.getElementById("nyhetshjul2-grid")) loadNyhetshjul2();
    if (document.getElementById("sportshjul-grid")) loadSportshjul();
    if (document.getElementById("kulturhjul-grid")) loadKulturhjul();
    if (document.getElementById("kommentarhjul-grid")) loadKommentarer();
    if (document.querySelector(".debatt-innlegg")) loadDebatt();
  });
});

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
          // Ca. 38 bildepunkter per sekund, uansett antall notiser.
          innhold.style.setProperty("--ticker-duration", (bredde / 38).toFixed(2) + "s");
        }
      };
      oppdaterHastighet();
      if (document.fonts?.ready) document.fonts.ready.then(oppdaterHastighet);

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
      innhold.classList.add("is-running");
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
