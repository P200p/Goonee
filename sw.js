// @ts-nocheck
/* Service Worker for Hacker Console assets */
const VERSION = 'v1.0.2';
const CACHE_NAME = `hc-cache-${VERSION}`;
const CORE = [
  '/',            // for Netlify root fallback (optional)
  '/index.html',  // helpful when visiting origin directly
  '/__tests__ex/guide.html', // embedded manual
  '/console.js',  // main console
  '/loader.js',
  '/main.js',
  '/style.css',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE).catch(()=>{}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k.startsWith('hc-cache-') && k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate for JS/CSS, Cache-First for images/fonts
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Always serve index.html from cache if offline for root or /index.html
  if ((url.pathname === '/' || url.pathname === '/index.html') && req.method === 'GET') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.match('/index.html');
      })
    );
    return;
  }

  // Cache-first for manual page when offline
  if (url.pathname === '/__tests__ex/guide.html' && req.method === 'GET') {
    event.respondWith(cacheFirst(req));
    return;
  }

  const accept = req.headers.get('accept') || '';
  const isAsset = /text\/css|application\/javascript|application\/json/.test(accept) ||
                  req.destination === 'script' || req.destination === 'style';

  if (isAsset) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  if (req.destination === 'image' || req.destination === 'font') {
    event.respondWith(cacheFirst(req));
    return;
  }
  // default: SW pass-through
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((res) => {
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  return cached || networkPromise;
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && res.status === 200) cache.put(request, res.clone());
  return res;
}
