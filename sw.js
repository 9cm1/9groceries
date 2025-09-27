const CACHE_NAME = '9groceries-v1';
const urlsToCache = [
  '/9groceries/',
  '/9groceries/index.html',
  '/9groceries/manifest.json',
  '/9groceries/icons/icon-192.png',
  '/9groceries/icons/icon-512.png',
  '/9groceries/sw.js'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});