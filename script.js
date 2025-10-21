document.addEventListener("DOMContentLoaded", () => {
  // 🟡 Last notisbåndet først
  loadNotiser().then(() => {
    setTimeout(() => {
      document.body.classList.add("loaded");
    }, 300);

    // 🟡 Deretter hjul og seksjoner
    if (document.getElementById("nyhetshjul-grid")) loadNyhetshjul();
    if (document.getElementById("sportshjul-grid")) loadSportshjul();
    if (document.getElementById("kulturhjul-grid")) loadKulturhjul();
    if (document.getElementById("kommentarhjul-grid")) loadKommentarer();
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

      // bygg notiser
      innhold.innerHTML = "";
      items.forEach((n, i) => {
        const span = document.createElement("span");
        const content = `<strong>${escapeHtml(n.category)}:</strong> ${escapeHtml(n.text)}`;
        span.innerHTML = n.url ? `<a href="${n.url}">${content}</a>` : content;
        innhold.appendChild(span);

        // legg til et lite grått mellomroms-symbol mellom notiser
        if (i < items.length - 1) {
          const sep = document.createElement("span");
          sep.textContent = " • ";
          sep.style.color = "#666";      // nøytral grå
          sep.style.fontSize = "0.9em";  // litt mindre
          sep.style.marginRight = "1.5rem";
          innhold.appendChild(sep);
        }
      });

      // dynamisk fart basert på tekstlengde
      const totalLength = innhold.textContent.length;
      const speed = Math.max(10, totalLength / 4);
      innhold.style.animationDuration = `${speed}s`;

      // start animasjonen
      document.body.classList.add("loaded");
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
          <a class="hjul-card" href="${item.url}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}">
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
            <img src="${item.image}" alt="${escapeHtml(item.title)}">
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
            <img src="${item.image}" alt="${escapeHtml(item.title)}">
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

/* ---------- Faktaboks ---------- */
function toggleBox(id) {
  const box = document.getElementById(id);
  if (!box) return;
  box.style.display = (box.style.display === "block") ? "none" : "block";
}
