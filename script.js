document.addEventListener("DOMContentLoaded", () => {
  includeHeader();

  if (document.querySelector("#nyheter")) {
    loadNyheter(); // for index.html
  }

  if (document.querySelector("#kultur")) {
    loadKategori("kultur");
  }

  if (document.querySelector("#sport")) {
    loadKategori("sport");
  }

  if (document.querySelector("#grafikk")) {
    loadGrafikk();
  }

  if (document.querySelector("#debatt")) {
    loadDebatt();
  }
});

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
          <h3><a href="${post.url}">${post.title}</a></h3>
          <p>${post.excerpt}</p>
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

      const filtered = posts.filter(post => post.category === kategori);
      if (!filtered.length) {
        container.innerHTML = `<p>Ingen ${kategori}-artikler publisert ennå.</p>`;
        return;
      }

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
    .catch(err => console.error(`Kunne ikke laste ${kategori}-artikler:`, err));
}

function loadGrafikk() {
  fetch("grafikk.json")
    .then(res => res.json())
    .then(items => {
      const container = document.querySelector("#grafikk");
      if (!container) return;

      if (!items.length) {
        container.innerHTML = "<p>Ingen grafikker publisert ennå.</p>";
        return;
      }

      items.sort((a, b) => new Date(b.date) - new Date(a.date));

      items.forEach(g => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${g.image}" alt="${g.title}" style="max-width:100%; border-radius:6px;">
          <h3>${g.title}</h3>
          <p>${g.caption || ""}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Kunne ikke laste grafikk:", err));
}

function loadDebatt() {
  fetch("debatt.json")
    .then(res => res.json())
    .then(debattInnlegg => {
      const container = document.querySelector("#debatt");
      if (!container) return;

      const skrivBtn = container.querySelector(".btn");

      if (!debattInnlegg.length) {
        const msg = document.createElement("p");
        msg.textContent = "Ingen debattinnlegg publisert ennå.";
        container.insertBefore(msg, skrivBtn?.parentNode || null);
        return;
      }

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
