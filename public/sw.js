const CACHE_NAME = 'my-sista-v1';
const PRECACHE_ASSETS = ['/', '/logo.svg', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { const clone = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)); return response; })));
    return;
  }
  event.respondWith(fetch(request).then((response) => { const clone = response.clone(); caches.open(CACHE_NAME).then(() => cache.put(requestcache, clone)); return response; }).catch(() => caches.match(request)));
});
