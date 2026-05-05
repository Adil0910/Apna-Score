const CACHE_NAME = "cricket-v3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// 🚀 IMPORTANT: only cache basic files
self.addEventListener("fetch", (event) => {
  // ❌ DO NOT cache JS/CSS dynamically
  if (event.request.destination === "document") {
    event.respondWith(fetch(event.request));
  }
});