const CACHE_NAME = 'chip-locked-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png', // Or whatever your main logo file is called
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    // You might need to add other core CSS and JS files here
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response; // Return from cache
                }
                return fetch(event.request); // Fallback to network
            })
    );
});