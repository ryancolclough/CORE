const VERSION = "ore-v1.0.6-fit-pages-20260720";
const CACHE = `${VERSION}-static`;
const APP_ROOT = new URL("./", self.location.href);
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/ore.css",
  "./css/core.css",
  "./css/print.css",
  "./content/ore-data.js",
  "./js/ore.js",
  "./js/core.js",
  "./data/core-reviews.json",
  "./assests/emblem.svg",
  "./assets/emblem.svg",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/ore-192.png",
  "./assets/icons/ore-512.png",
  "./assets/icons/ore-maskable-512.png",
  "./pdf/official-bylaws-2023.pdf"
].map(path => new URL(path, APP_ROOT).href);

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url)))));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  })));
});
