const CACHE_NAME = 'photo-widget-cache-v2'; // Updated version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/service-worker.js' // Include self-reference for updates
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) return response;
        
        // Clone request for network fetch
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(responseNetwork => {
          // Check if response is valid
          if (!responseNetwork || responseNetwork.status !== 200 || 
              responseNetwork.type !== 'basic') {
            return responseNetwork;
          }
          
          // Cache new responses
          const responseToCache = responseNetwork.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
            
          return responseNetwork;
        });
      })
  );
});
