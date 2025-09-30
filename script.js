document.addEventListener("DOMContentLoaded", () => {
  includeHeader();

  if (document.querySelector("#nyheter")) {
    loadNyheter();
  }

  if (document.querySelector("#kultur")) {
    loadKategori("kultur");
  }

  if (document.querySelector("#sport")) {
    loadKategori("sport");
  }

  if (document.querySelector("#debatt")) {
    loadDebatt();
  }

  if (document.querySelector("#grafikk-feed")) {
    loadGrafikkFull();
  }

  if (document.querySelector("#nyhetshjul")) {
    loadNyhetshjul();
  }
});

// --- HEADER ---
function includeHeader() {
  fetch("header.html")
    .then(res => res.text())
    .then(html => {
      const holder = document.querySelector("#header-placeholder");
      if (holder) {
        holder.innerHTML = html;
        initNav();
      }
    })
    .catch(err => console.error("Kunne ikke laste header:", err));
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("show");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
}

// --- NYHETER ---
function loadNyheter() {
  fetch("posts.json")
    .then(res => res.json())
    .then(posts => {
      const container = document.querySelector("#nyheter");
      if (!container) return;

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3><a href="${post.url}">${post.title}</a></h3>
          <p>${post.excerpt}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Kunne ikke laste nyheter:", err));
}

// --- KATEGORI ---
function loadKategori(kategori) {
  fetch("posts.json")
    .then(res => res.json())
    .then(posts => {
      const container = document.querySelector(`#${kategori}`);
      if (!container) return;

      const filtered = posts.filter(post => post.category === kategori);
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      filtered.forEach(post => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3><a href="${post.url}">${post.title}</a></h3>
          <p>${post.excerpt}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error(`Kunne ikke laste ${kategori}:`, err));
}

// --- DEBATT ---
function loadDebatt() {
  fetch("debatt.json")
    .then(res => res.json())
    .then(debattInnlegg => {
      const container = document.querySelector("#debatt");
      if (!container) return;

      const skrivBtn = container.querySelector(".btn");

      debattInnlegg.sort((a, b) => new Date(b.date) - new Date(a.date));

      debattInnlegg.forEach(innlegg => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3><a href="${innlegg.url}">${innlegg.title}</a></h3>
          <p>Innlegg av ${innlegg.author} · ${innlegg.date}</p>
          <p>${innlegg.excerpt}</p>
        `;
        container.insertBefore(card, skrivBtn?.parentNode || null);
      });
    })
    .catch(err => console.error("Kunne ikke laste debatt:", err));
}

// --- FULL GRAFIKK (feed.html) ---
function loadGrafikkFull() {
  fetch("grafikk/grafikk.json")
    .then(res => res.json())
    .then(items => {
      const container = document.querySelector("#grafikk-feed");
      if (!container) return;

      items.sort((a, b) => new Date(b.date) - new Date(a.date));

      items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}" style="width:100%; border-radius:6px;">
          <h3>${item.title}</h3>
          <p>${item.excerpt}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Kunne ikke laste grafikk-feed:", err));
}

// --- NYHETSHJUL (forsiden, kun 3 siste) ---
function loadNyhetshjul() {
  fetch("grafikk/grafikk.json")
    .then(res => res.json())
    .then(items => {
      const container = document.querySelector("#nyhetshjul");
      if (!container) return;

      items.sort((a, b) => new Date(b.date) - new Date(a.date));

      const latest = items.slice(0, 3); // bare tre siste

      latest.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}" style="width:100%; border-radius:6px;">
          <h3>${item.title}</h3>
          <p>${item.excerpt}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Kunne ikke laste nyhetshjul:", err));
}
