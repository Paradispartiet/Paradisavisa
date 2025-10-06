document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("nyhetshjul-grid")) loadNyhetshjul();
  if (document.querySelector("#nyheter")) loadNyheter();
  if (document.querySelector("#kultur")) loadKategori("kultur");
  if (document.querySelector("#sport")) loadKategori("sport");
  if (document.querySelector("#debatt")) loadDebatt();
});

/* ---------- Nyhetshjul ---------- */
function loadNyhetshjul() {
  fetch("Nyhetshjul.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      if (!items.length) return;
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      const top3 = items.slice(0, 3);

      const grid = document.getElementById("nyhetshjul-grid");
      grid.innerHTML = "";

      top3.forEach(item => {
        const card = document.createElement("a");
        card.className = "nyhetshjul-card";
        card.href = item.url;
        card.innerHTML = `
          <img src="${item.image}" alt="${escapeHtml(item.title)}">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt)}</p>
        `;
        grid.appendChild(card);
      });
    })
    .catch(err => console.error("Nyhetshjul feilet:", err));
}

/* ---------- Nyheter ---------- */
function loadNyheter() {
  fetch("posts.json").then(r => r.json()).then(posts => {
    const container = document.querySelector("#nyheter");
    if (!posts.length) return;
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    posts.forEach(post => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = post.url;
      card.innerHTML = `
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
      `;
      container.appendChild(card);
    });
  });
}

/* ---------- Kultur / Sport ---------- */
function loadKategori(kategori) {
  fetch("posts.json").then(r => r.json()).then(posts => {
    const container = document.querySelector(`#${kategori}`);
    const filtered = posts.filter(p => p.category === kategori);
    filtered.forEach(post => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = post.url;
      card.innerHTML = `
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
      `;
      container.appendChild(card);
    });
  });
}

/* ---------- Debatt ---------- */
function loadDebatt() {
  fetch("debatt.json").then(r => r.json()).then(items => {
    const container = document.querySelector("#debatt");
    items.forEach(innlegg => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = innlegg.url;
      card.innerHTML = `
        <h3>${escapeHtml(innlegg.title)}</h3>
        <p>Innlegg av ${escapeHtml(innlegg.author)} · ${escapeHtml(innlegg.date)}</p>
        <p>${escapeHtml(innlegg.excerpt)}</p>
      `;
      container.appendChild(card);
    });
  });
}

/* ---------- hjelpefunksjon ---------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]
  ));
}
