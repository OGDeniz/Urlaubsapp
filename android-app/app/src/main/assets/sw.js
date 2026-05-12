const CACHE_NAME = 'urlaubsapp-v1';

const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icon.svg',
  './modules/accommodation.js',
  './modules/countdown.js',
  './modules/documents.js',
  './modules/flight.js',
  './modules/list.js',
  './modules/maps.js',
  './modules/places.js',
  './modules/storage.js',
  './modules/trip.js',
];

const NETWORK_ONLY = [
  'overpass-api.de',
  'nominatim.openstreetmap.org',
  'wikipedia.org',
];

const CACHE_FIRST_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'tile.openstreetmap.org',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { url } = event.request;
  const hostname = new URL(url).hostname;

  if (NETWORK_ONLY.some((h) => hostname.includes(h))) {
    return;
  }

  if (CACHE_FIRST_HOSTS.some((h) => hostname.includes(h))) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached ?? fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached ?? fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
    )
  );
});
