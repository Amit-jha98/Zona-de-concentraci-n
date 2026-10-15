const CACHE = "edubrowse-shell-v1";
const SHELL = [
  "/",
  "/app-icon.svg",
  "/favicon.svg",
  "/manifest.webmanifest",
  "/gate-topic-videos.json",
  "/CS_GATE2027_Syllabus.pdf",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(SHELL);
      const html = await (await cache.match("/")).text();
      const assets = [
        ...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g),
      ].map((match) => match[1]);
      await cache.addAll(assets);
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await Promise.all(
        (await caches.keys())
          .filter((key) => key.startsWith("edubrowse-shell-") && key !== CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  // API responses, credentials and downloaded media never enter the shell cache.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok)
            (await caches.open(CACHE)).put("/", response.clone());
          return response;
        })
        .catch(() => caches.match("/")),
    );
  } else if (
    url.pathname.startsWith("/assets/") ||
    SHELL.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then(async (response) => {
            if (response.ok)
              (await caches.open(CACHE)).put(request, response.clone());
            return response;
          }),
      ),
    );
  }
});
