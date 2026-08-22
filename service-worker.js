const CACHE = "lineskip-v3";

const SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/gsap.min.js",
  "/manifest.json",
  "/icon-192.png",
  "/VENUES.jpeg",
  "/mY PASSES.jpeg",
  "/dROPS.jpeg",
  "/aCCOUNT.jpeg",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

function fetchAndCache(request) {
  return fetch(request).then(res => {
    if (res.ok && (res.type === "basic" || res.type === "cors")) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(request, copy));
    }
    return res;
  });
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  const isShellAsset =
    url.origin === self.location.origin && /\.(css|js|json|webmanifest)$/.test(url.pathname);

  // HTML + CSS/JS: network first so every load gets one matching version;
  // cache is only the offline fallback. Prevents old-HTML/new-JS mixes.
  if (e.request.mode === "navigate" || isShellAsset) {
    e.respondWith(
      fetchAndCache(e.request).catch(() =>
        caches.match(e.request).then(r =>
          r || (e.request.mode === "navigate" ? caches.match("/") : Response.error())
        )
      )
    );
    return;
  }

  // images and the rest: serve cached instantly, refresh the cache in background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetchAndCache(e.request).catch(() => cached || Response.error());
      return cached || fresh;
    })
  );
});
