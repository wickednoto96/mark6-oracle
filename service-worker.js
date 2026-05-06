// Mark Six Oracle — Service Worker
// Caches all app files so it works fully offline

const CACHE_NAME = 'mark6-oracle-v1';

// Core assets — must cache, app won't work without these
const CORE_ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Optional assets — cache if possible, not fatal if they fail
const OPTIONAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=Crimson+Text:ital,wght@0,400;1,400&display=swap'
];

// Install: cache core files, attempt optional ones
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Core files must succeed
      return cache.addAll(CORE_ASSETS).then(() => {
        // Optional files — fail silently
        return Promise.allSettled(
          OPTIONAL_ASSETS.map(url => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
