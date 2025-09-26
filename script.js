document.addEventListener("DOMContentLoaded", () => {
  includeHeader();
  loadNyheter();
  loadDebatt();
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

      // sorter nyeste først
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

function loadDebatt() {
  fetch("debatt.json")
    .then(res => res.json())
    .then(debattInnlegg => {
      const container = document.querySelector("#debatt");
      if (!container) return;

      const skrivBtn = container.querySelector(".btn"); // skriv-innlegg-knappen

      if (!debattInnlegg.length) {
        const msg = document.createElement("p");
        msg.textContent = "Ingen debattinnlegg publisert ennå.";
        container.insertBefore(msg, skrivBtn.parentNode);
        return;
      }

      // sorter nyeste først
      debattInnlegg.sort((a, b) => new Date(b.date) - new Date(a.date));

      debattInnlegg.forEach(innlegg => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3><a href="${innlegg.url}">${innlegg.title}</a></h3>
          <p>Innlegg av ${innlegg.author} · ${innlegg.date}</p>
          <p>${innlegg.excerpt}</p>
        `;
        container.insertBefore(card, skrivBtn.parentNode);
      });
    })
    .catch(err => console.error("Kunne ikke laste debatt:", err));
}
