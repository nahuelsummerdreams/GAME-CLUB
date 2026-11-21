/* WonderDays service worker: offline-first for the app shell, games and assets.
   Bump VERSION to invalidate old caches. No analytics, no third-party requests. */
const VERSION = "wd-v1";
const ROUTES = ["/", "/world", "/rewards", "/profile", "/settings",
  "/games/santas-workshop", "/games/gift-delivery", "/games/christmas-match", "/games/christmas-memory",
  "/games/bubble-pop", "/games/tree-decoration", "/games/snowman-builder", "/games/christmas-puzzle"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(ROUTES.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "reload" });
        if (!res.ok) return;
        await cache.put(url, res.clone());
        const html = await res.text();
        const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s\\)]+/g) || [])];
        await Promise.all(assets.map((a) => cache.add(a).catch(() => {})));
      } catch { /* offline during install: runtime caching will fill in */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname === "/sw.js") return;

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(url.pathname, res.clone());
        return res;
      } catch {
        return (await cache.match(url.pathname)) || (await cache.match("/")) || Response.error();
      }
    })());
    return;
  }

  // hashed build assets, fonts, icons, game chunks: cache-first, fill on miss
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: url.pathname.startsWith("/_next/static/") });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || /\.(?:woff2?|png|svg|webp)$/.test(url.pathname))) cache.put(req, res.clone());
      return res;
    } catch {
      return hit || Response.error();
    }
  })());
});
