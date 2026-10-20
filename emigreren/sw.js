const CACHE = "emigreren-v48";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
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
    fetch(event.request).catch(async () => {
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
