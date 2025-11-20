// sw.js - AUTO-UPDATE SERVICE WORKER
const CACHE_NAME = 'campus-cart-' + Date.now();
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
  // Add other essential files here
];

// Install - cache essential files
self.addEventListener('install', event => {
  console.log('🚀 Service Worker installing...');
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching essential files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate - clean up ALL old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete ALL old caches (keep only current)
          console.log('🗑️ Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Fetch - NETWORK FIRST strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    // Try network first
    fetch(event.request)
      .then(response => {
        // Network successful - update cache
        if (event.request.url.startsWith('http')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || new Response('Offline content');
          });
      })
  );
});