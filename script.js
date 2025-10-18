document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("nyhetshjul-grid")) loadNyhetshjul();
  if (document.querySelector("#nyheter")) loadNyheter();
  if (document.querySelector("#debatt")) loadDebatt();
  loadNotiser();
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
      card.innerHTML = `<h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p>`;
      container.appendChild(card);
    });
  });
}

/* ---------- Debatt ---------- */
function loadDebatt() {
  fetch("debatt.json").then(r => r.json()).then(items => {
    const container = document.querySelector(".debatt-innlegg");
    items.forEach(innlegg => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = innlegg.url;
      card.innerHTML = `
        <h3>${escapeHtml(innlegg.title)}</h3>
        <p class="debatt-meta">${escapeHtml(innlegg.author)} · ${escapeHtml(innlegg.date)}</p>
        <p class="debatt-excerpt">${escapeHtml(innlegg.excerpt.split(' ').slice(0, 14).join(' '))}...</p>
      `;
      container.appendChild(card);
    });
  });
}

/* ---------- Notisbånd ---------- */
function loadNotiser() {
  fetch("notiser.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const innhold = document.querySelector(".notisinnhold");
      if (!innhold) return;
      innhold.innerHTML = "";
      items.forEach(n => {
        const span = document.createElement("span");
        const content = `<strong>${n.category}:</strong> ${n.text}`;
        span.innerHTML = n.url ? `<a href="${n.url}">${content}</a>` : content;
        innhold.appendChild(span);
      });
    })
    .catch(err => console.error("Notisbånd feilet:", err));
}

/* ---------- Hjelpefunksjon ---------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s])
  );
}
