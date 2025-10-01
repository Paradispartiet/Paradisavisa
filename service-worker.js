// service-worker.js
self.addEventListener("install", event => {
  // Hopp rett til activate uten å vente
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  // Overta alle faner uten reload
  event.waitUntil(clients.claim());
});

// Alltid hent fra nettverket – ingen caching
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // fallback hvis offline
      return new Response("Offline – kunne ikke laste " + event.request.url, {
        status: 503,
        statusText: "Service Unavailable"
      });
    })
  );
});
