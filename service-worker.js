const CACHE_NAME = 'portineria-pacchi-cache-v1770195821';
const PRECACHE = [
  './',
  './index.html',
  './storico.html',
  './manifest.webmanifest',
  './service-worker.js',
  './logo.jpg',
  './apple-touch-icon.png',
  './rubrica_portineria.xlsx',
  './icons/icon-192x192.png',
  './icons/icon-256x256.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((res) => {
        // Cache successful responses
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => {
        // offline fallback
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', {status: 503, statusText: 'Offline'});
      });
    })
  );
});
