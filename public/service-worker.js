const CACHE_NAME = 'chip-locked-cache-v1.0.2'; // Increment the version number
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png', // Update with your actual logo path
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    // Add other core files here, including new or updated ones
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching new assets');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // If the request is in the cache, return it
            if (response) {
                return response;
            }

            // If not, fetch from the network
            return fetch(event.request).then((response) => {
                // Cache the new response if it's valid
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            });
        })
    );
});