self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("lineskip-v1").then(cache => 
      cache.addAll(["/", "/style.css", "/manifest.json"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== "lineskip-v1" ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => 
      cached || fetch(e.request)
    )
  );
});
