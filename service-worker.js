// service-worker.js

// Installer service worker og hopp direkte til neste steg
self.addEventListener("install", event => {
  self.skipWaiting();
});

// Aktiver service worker og overta klienter umiddelbart
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Hent alltid fra nettverket og ikke bruk cache
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Offline – kunne ikke hente " + event.request.url, {
        status: 503,
        statusText: "Service Unavailable",
      });
    })
  );
});
