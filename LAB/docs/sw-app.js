const CACHE = 'lab-app-v1';
const FILES = [
  '/docs/GamblingAPI_lab.html','/docs/gambling-lab.js','/docs/lab.css','/docs/LAB_SLIDES.html','/docs/WORKSHEET_GamblingLAB.md'
];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/docs/')) {
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }
});
