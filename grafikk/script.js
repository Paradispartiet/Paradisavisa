document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("#nyheter")) loadNyheter();
  if (document.querySelector("#kultur")) loadKategori("kultur");
  if (document.querySelector("#sport")) loadKategori("sport");
  if (document.querySelector("#feed")) loadFeed();
  if (document.querySelector("#debatt")) loadDebatt();
});

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
        card.innerHTML = `<h3><a href="${post.url}">${post.title}</a></h3><p>${post.excerpt}</p>`;
        container.appendChild(card);
      });
    });
}

function loadKategori(kategori) {
  fetch("posts.json")
    .then(res => res.json())
    .then(posts => {
      const container = document.querySelector(`#${kategori}`);
      if (!container) return;
      const filtered = posts.filter(p => p.category === kategori);
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      filtered.forEach(post => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h3><a href="${post.url}">${post.title}</a></h3><p>${post.excerpt}</p>`;
        container.appendChild(card);
      });
    });
}

function loadFeed() {
  fetch("grafikk/grafikk.json")
    .then(res => res.json())
    .then(items => {
      const container = document.querySelector("#feed");
      if (!container) return;
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="grafikk/${item.image}" alt="${item.title}" style="max-width:100%; border-radius:6px;">
          <h3>${item.title}</h3>
          <p>${item.excerpt}</p>
        `;
        container.appendChild(card);
      });
    });
}

function loadDebatt() {
  fetch("debatt.json")
    .then(res => res.json())
    .then(innlegg => {
      const container = document.querySelector("#debatt");
      const skrivBtn = container.querySelector(".btn");
      innlegg.sort((a, b) => new Date(b.date) - new Date(a.date));
      innlegg.forEach(post => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3><a href="${post.url}">${post.title}</a></h3>
          <p>Innlegg av ${post.author} · ${post.date}</p>
          <p>${post.excerpt}</p>
        `;
        container.insertBefore(card, skrivBtn.parentNode);
      });
    });
}
