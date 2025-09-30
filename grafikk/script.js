document.addEventListener("DOMContentLoaded", () => {
  includeHeader();
  loadNyheter();
  loadDebatt();
  loadGrafikk(); // <-- NY
});

function loadGrafikk() {
  fetch("grafikk.json")
    .then(res => res.json())
    .then(items => {
      const container = document.querySelector("#grafikk");
      if (!container) return;

      if (!items.length) {
        container.innerHTML = "<p>Ingen grafikk publisert ennå.</p>";
        return;
      }

      // nyeste først
      items.sort((a, b) => new Date(b.date) - new Date(a.date));

      items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${item.img}" alt="${item.title}" style="max-width:100%; border-radius:6px;">
          <h3>${item.title}</h3>
          <p>${item.caption}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Kunne ikke laste grafikk:", err));
}
