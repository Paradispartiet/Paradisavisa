document.addEventListener("DOMContentLoaded", () => {
  // 🟡 Last notisbåndet FØRST
  loadNotiser().then(() => {
    // markerer at alt er klart → starter animasjonen i CSS
    document.body.classList.add("loaded");

    // 🟡 Deretter resten av seksjonene
    if (document.getElementById("nyhetshjul-grid")) loadNyhetshjul();
    if (document.getElementById("sportshjul-grid")) loadSportshjul();
    if (document.querySelector(".kommentar-innlegg")) loadKommentarer();
    if (document.querySelector(".debatt-innlegg")) loadDebatt();
  });
});

/* ---------- Notisbånd ---------- */
function loadNotiser() {
  return fetch("notiser.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const band = document.querySelector(".notisbånd");
      const innhold = document.querySelector(".notisinnhold");
      if (!band || !innhold) return;

      band.style.position = "fixed";
      band.style.top = "0";
      band.style.left = "0";
      band.style.zIndex = "9999";

      innhold.innerHTML = "";
      items.forEach(n => {
        const span = document.createElement("span");
        const content = `<strong>${escapeHtml(n.category)}:</strong> ${escapeHtml(n.text)}`;
        span.innerHTML = n.url ? `<a href="${n.url}">${content}</a>` : content;
        innhold.appendChild(span);
      });
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
          <a class="nyhetshjul-card" href="${item.url}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt)}</p>
          </a>`;
      });
    })
    .catch(err => console.error("Nyhetshjul feilet:", err));
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
          <a class="nyhetshjul-card sport-card" href="${item.url}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt)}</p>
          </a>`;
      });
    })
    .catch(err => console.error("Sportshjul feilet:", err));
}

/* ---------- Kommentarer ---------- */
function loadKommentarer() {
  fetch("kommentarer.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const container = document.querySelector(".kommentar-innlegg");
      if (!container || !items.length) return;
      container.innerHTML = "";
      items.forEach(k => {
        container.innerHTML += `
          <a class="card" href="${k.url}">
            <h3>${escapeHtml(k.title)}</h3>
            <p class="kommentar-meta">${escapeHtml(k.author)} · ${escapeHtml(k.date)}</p>
            <p>${escapeHtml(k.excerpt.split(' ').slice(0, 20).join(' '))}...</p>
          </a>`;
      });
    })
    .catch(err => console.error("Kommentarer feilet:", err));
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
          <a class="card" href="${innlegg.url}">
            <h3>${escapeHtml(innlegg.title)}</h3>
            <p class="debatt-meta">${escapeHtml(innlegg.author)} · ${escapeHtml(innlegg.date)}</p>
            <p class="debatt-excerpt">${escapeHtml(innlegg.excerpt.split(' ').slice(0, 14).join(' '))}...</p>
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
/* ---------- Service Worker registrering ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('🟢 Service Worker registrert:', reg.scope))
      .catch(err => console.error('🔴 Feil ved registrering av SW:', err));
  });
}
