const CACHE = "emigreren-v50";

// App shell, cached on install so the app also opens offline.
const SHELL = [
  "/emigreren/",
  "/emigreren/assets/index-DC_4gOmB.js",
  "/emigreren/assets/routes-07DcxB5z.js",
  "/emigreren/assets/styles-48lav73z.css",
  "/emigreren/emigreren/styles.css?v=187",
  "/emigreren/emigreren/data.js?v=187",
  "/emigreren/emigreren/fiscal.js?v=187",
  "/emigreren/emigreren/app.js?v=187",
  "/emigreren/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("emigreren-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Network first; keep a copy of same-origin app files for offline use.
        if (res.ok && res.type === "basic" && url.pathname.startsWith("/emigreren/")) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(event.request);
        if (hit) return hit;
        if (event.request.mode === "navigate") {
          const home = await caches.match("/emigreren/");
          if (home) return home;
        }
        return new Response("", { status: 504 });
      })
  );
});
