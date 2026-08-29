/* Lap Log service worker — cache-first, pinned.
   Bump CACHE when you deploy a new version. The app will NOT pick it up
   until someone taps "Check for update" and reloads. That is deliberate:
   a push to the repo must never swap the code mid-race. */
const CACHE = "lap-log-v2.0.0";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Never touch the sheet sync — it must go straight to the network.
  if (url.origin !== self.location.origin) return;
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;                       // cache first, always
      return fetch(e.request)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html")); // offline fallback
    })
  );
});