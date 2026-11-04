/* Paradisavisa: sikker mellomlagring innenfor eget GitHub Pages-område.
   Viktig: gamle stilark og nyhetsfiler hentes fra nett først. */
const VERSION = "paradisavisa-v5-2026-11-04";
const CACHE_PREFIX = "paradisavisa-";
const SCOPE = new URL(self.registration.scope);

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names
        .filter(name => (name.startsWith(CACHE_PREFIX) || name === "v2.1.1.043") && name !== VERSION)
        .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Ikke berør andre nettsteder eller andre Pages-prosjekter.
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;

  // Safari skal alltid forsøke fersk HTML/JS/CSS fra nettet.
  // Tidligere lagret innhold brukes bare når nettverket er utilgjengelig.
  const isAppCode = request.mode === "navigate" || /\\.(?:html|css|js)$/i.test(url.pathname);
  event.respondWith(
    fetch(request, isAppCode ? { cache: "no-store" } : undefined)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(VERSION).then(cache => cache.put(request, copy))
          );
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response("Frakoblet – dette innholdet er ikke lagret for offline bruk.", {
          status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});
