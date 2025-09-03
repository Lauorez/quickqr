const CACHE_NAME = 'qr-pwa-v1';
const CORE_ASSETS = [
'/',
'/index.html',
'/manifest.webmanifest',
'/icons/icon-192.png',
'/icons/icon-512.png',
];


self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
);
self.skipWaiting();
});


self.addEventListener('activate', (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
)
);
self.clients.claim();
});


// Network-first, fallback to cache
self.addEventListener('fetch', (event) => {
const req = event.request;
event.respondWith(
fetch(req)
.then((res) => {
const resClone = res.clone();
caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
return res;
})
.catch(() => caches.match(req).then((res) => res || caches.match('/index.html')))
);
});