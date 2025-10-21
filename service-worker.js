// service-worker.js
const VERSION = "v2.1.1.20"; // endre dette hver gang du laster opp en ny versjon

self.addEventListener("install", event => {
  console.log("Service Worker installert – versjon:", VERSION);
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("Aktiverer SW versjon:", VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== VERSION) {
          console.log("Sletter gammel cache:", key);
          return caches.delete(key);
        }
      }))
    ).then(() => self.clients.claim())
  );
});

// Nettverk først, fall tilbake til cache hvis offline
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Oppdater cache samtidig
        const copy = response.clone();
        caches.open(VERSION).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)
        .then(cached => cached || new Response("Offline – kunne ikke hente " + event.request.url, {
          status: 503,
          statusText: "Service Unavailable"
        }))
      )
  );
});
