const VERSION = "core-pwa-1.9.0-20260716.001";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const APP_ROOT = new URL("./", self.location.href);

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/core.css",
  "./css/cinematic-theme.css",
  "./css/motion-system.css",
  "./js/app.js",
  "./sdk/storage.js",
  "./sdk/events.js",
  "./sdk/router-v180.js",
  "./sdk/themes.js",
  "./sdk/dialogs.js",
  "./sdk/pwa.js",
  "./data/module-registry.json",
  "./assets/branding/core-logo.png",
  "./assets/themes/cinematic-night.webp",
  "./assets/themes/cinematic-night-mobile.webp",
  "./assets/icons/core-192.png",
  "./assets/icons/core-512.png",
  "./assets/icons/core-maskable-512.png",
  "./modules/dashboard/dashboard.css",
  "./modules/dashboard/dashboard.js",
  "./modules/review/review.css",
  "./modules/review/review.js",
  "./modules/amendment/amendment.css",
  "./modules/amendment/amendment.js",
  "./modules/export/export.css",
  "./modules/export/export.js",
  "./modules/actions/actions.css",
  "./modules/actions/actions.js",
  "./modules/developer/developer.css",
  "./modules/developer/developer.js",
  "./modules/settings/settings.css",
  "./modules/settings/settings.js",
  "./modules/annual/annual.css",
  "./modules/annual/annual.js",
  "./modules/intelligence/intelligence.css",
  "./modules/intelligence/intelligence.js",
  "./modules/pwa/pwa.css",
  "./modules/pwa/pwa.js"
].map(path => new URL(path, APP_ROOT).href);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => Promise.allSettled(CORE_ASSETS.map(url => cache.add(url))))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if(event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if(request.method !== "GET") return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;

  if(request.mode === "navigate"){
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(new URL("./offline.html", APP_ROOT).href))
    );
    return;
  }

  const isData = url.pathname.includes("/orefinal/") || url.pathname.endsWith("module-registry.json");
  if(isData){
    event.respondWith(
      fetch(request)
        .then(response => {
          if(response.ok){
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if(response.ok){
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./#/dashboard", APP_ROOT).href;
  event.waitUntil(
    clients.matchAll({type:"window", includeUncontrolled:true}).then(list => {
      for(const client of list){
        if("focus" in client){
          client.navigate(target);
          return client.focus();
        }
      }
      return clients.openWindow(target);
    })
  );
});

self.addEventListener("push", event => {
  let payload = {title:"CORE", body:"You have a new governance notification.", url:"./#/dashboard"};
  try{ payload = {...payload, ...event.data.json()}; }catch(error){
    if(event.data) payload.body = event.data.text();
  }
  event.waitUntil(self.registration.showNotification(payload.title, {
    body:payload.body,
    icon:"assets/icons/core-192.png",
    badge:"assets/icons/core-192.png",
    tag:payload.tag || "core-governance",
    data:{url:payload.url || "./#/dashboard"}
  }));
});
