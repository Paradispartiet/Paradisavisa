document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("nyhetshjul-grid")) {
    loadNyhetshjul();
  }
  if (document.querySelector("#nyheter")) loadNyheter();
  if (document.querySelector("#kultur")) loadKategori("kultur");
  if (document.querySelector("#sport")) loadKategori("sport");
  if (document.querySelector("#debatt")) loadDebatt();
});

function loadNyhetshjul() {
  fetch("grafikk/grafikk.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      // sorter nyeste først og velg tre
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      const top3 = items.slice(0, 3);

      const grid = document.getElementById("nyhetshjul-grid");
      if (!grid) return;
      grid.innerHTML = "";

      top3.forEach(item => {
        const imgSrc = item.image.startsWith("grafikk/")
          ? item.image
          : `grafikk/${item.image}`;

        const card = document.createElement("article");
        card.className = "nyhetshjul-card";
        card.innerHTML = `
          <img src="${imgSrc}" alt="${escapeHtml(item.title || "Grafikk")}">
          <h3>${escapeHtml(item.title || "")}</h3>
          <p>${escapeHtml(item.excerpt || "")}</p>
        `;
        grid.appendChild(card);
      });
    })
    .catch(err => console.error("Nyhetshjul feilet:", err));
}

/* ---------- Nyheter / Kategorier / Debatt (uendret logikk) ---------- */
function loadNyheter() {
  fetch("posts.json")
    .then(res => res.json())
    .then(posts => {
      const container = document.querySelector("#nyheter");
      if (!container) return;
      if (!posts.length) {
        container.innerHTML = "<p>Ingen artikler publisert ennå.</p>";
        return;
      }
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
          <p>${escapeHtml(post.excerpt || "")}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Kunne ikke laste nyheter:", err));
}

function loadKategori(kategori) {
  fetch("posts.json")
    .then(res => res.json())
    .then(posts => {
      const container = document.querySelector(`#${kategori}`);
      if (!container) return;

      const filtered = posts.filter(p => p.category === kategori);
      if (!filtered.length) {
        container.innerHTML = `<p>Ingen ${kategori}-artikler publisert ennå.</p>`;
        return;
      }

      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      filtered.forEach(post => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
          <p>${escapeHtml(post.excerpt || "")}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error(`Kunne ikke laste ${kategori}-artikler:`, err));
}

function loadDebatt() {
  fetch("debatt.json")
    .then(res => res.json())
    .then(items => {
      const container = document.querySelector("#debatt");
      if (!container) return;

      const skrivBtn = container.querySelector(".btn");
      if (!items.length) {
        const msg = document.createElement("p");
        msg.textContent = "Ingen debattinnlegg publisert ennå.";
        container.insertBefore(msg, skrivBtn?.parentNode || null);
        return;
      }

      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      items.forEach(innlegg => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3><a href="${innlegg.url}">${escapeHtml(innlegg.title)}</a></h3>
          <p>Innlegg av ${escapeHtml(innlegg.author)} · ${escapeHtml(innlegg.date)}</p>
          <p>${escapeHtml(innlegg.excerpt || "")}</p>
        `;
        container.insertBefore(card, skrivBtn?.parentNode || null);
      });
    })
    .catch(err => console.error("Kunne ikke laste debatt:", err));
}

/* ---------- hjelpefunksjon ---------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]
  ));
}
