const CACHE_NAME = 'bravepresso-v8';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './shop.html',
    './about.html',
    './contact.html',
    './reviews.html',
    './privacy.html',
    './terms.html',
    './refund.html',
    './shipping.html',
    './style.css',
    './script.js',
    './manifest.json',
    './lion-logo.png',
    './product.png',
    './product-back.png',
    './hero.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) return response;
            // Try matching without query string for versioned assets
            const url = new URL(event.request.url);
            const noQuery = url.origin + url.pathname;
            return caches.match(noQuery).then((r) => r || fetch(event.request));
        }).catch(() => {
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});

