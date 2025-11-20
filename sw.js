// sw.js - SIMPLE & RELIABLE
const CACHE_NAME = 'campus-cart-v1';

// Install - cache only the essential app files
self.addEventListener('install', event => {
  console.log('🚀 Service Worker installing...');
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icons/icon-192.png',
        '/icons/icon-512.png'
        // NOTE: We're NOT caching product images here
      ]))
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Fetch - SMART HANDLING
self.addEventListener('fetch', event => {
  // FOR IMAGES: Always go directly to network (no caching)
  if (event.request.destination === 'image') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // FOR APP FILES: Network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses (except images)
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(event.request);
      })
  );
});