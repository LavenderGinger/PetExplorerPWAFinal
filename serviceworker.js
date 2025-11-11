const CACHE_NAME = 'pet-explorer-cache-v1';
const urlsToCache = [
  'index.html',
  'about.html',
  'contact.html',
  'dog.html',
  'cat.html',
  'fish.html',
  'guineapig.html',
  'parakeet.html',
  'rabbit.html',
  'offline.html',
  'petquiz.html',
  'src/ui/app.js',
  'src/ui/notifications.js',
  'src/firebase.js',
  'src/indexedDB.js',
  'src/sync.js',
  'materialize-v1.0.0/materialize/css/materialize.min.css',
  'materialize-v1.0.0/materialize/js/materialize.min.js',
  'images/pexels-chevanon-1108099.jpg',
  'images/pexels-crisdip-35358-128756.jpg',
  'images/pexels-frans-van-heerden-201846-1463295.jpg',
  'images/pexels-photo4passion-1828874.jpg',
  'images/pexels-pixabay-372166.jpg',
  'images/pexels-vika-glitter-392079-18011803.jpg'
];

// Install event - cache app assets
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Service worker: caching files");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames =>
       Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Fetch event - serve cached assets if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      if (event.request.method !== 'GET') {
        return fetch(event.request);
      }
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        console.error('Fetch failed; returning offline page instead.', error);
        return caches.match('offline.html');
      }
    })()
  );
});