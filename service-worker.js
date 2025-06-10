const CACHE_NAME = 'dinesh-portfolio-cache-v5'; // Incremented cache version for new resume asset
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
    // Add your resume PDF to the cache if you want it to be available offline
    // Make sure the path is correct!
    '/resume/Dinesh_Krishnamoorthy_Resume.pdf'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW Install: Opened cache:', CACHE_NAME);
                const criticalAssetRequests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
                return cache.addAll(criticalAssetRequests)
                    .catch(err => { // Catch errors from addAll specifically for individual files
                        console.error('SW Install: Failed to cache one or more URLs:', err);
                        // Attempt to cache URLs individually if addAll fails for some reason (e.g., resume not found yet)
                        // This is a more robust fallback but makes the install event longer.
                        // For simplicity, the primary addAll is often sufficient.
                        // If resume is critical for offline, ensure it's present before deploying.
                    });
            })
            .catch(err => {
                console.error('SW Install: Failed to open cache:', err);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('SW Activate: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return; 
    }

    // Strategy for HTML: Network first, then cache
    if (event.request.mode === 'navigate' || event.request.headers.get('Accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.ok) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => { 
                    return caches.match(event.request)
                        .then(cachedResponse => {
                            return cachedResponse || caches.match('/index.html'); // Fallback to cached index.html
                        })
                        .catch(() => { // If even index.html isn't cached, provide a very basic offline message
                             return new Response("Network error: You are offline and the content is not cached.", { 
                                status: 503, 
                                statusText: "Service Unavailable",
                                headers: { 'Content-Type': 'text/plain' }
                            });
                        });
                })
        );
        return;
    }

    // Strategy for non-HTML (CSS, JS, Images, PDF): Cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse; 
                }
                return fetch(event.request).then(
                    networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    }
                ).catch(error => {
                    console.warn('SW Fetch: Failed for asset:', event.request.url, error);
                    // For images, you could return a placeholder image from cache here
                    // For other assets, just letting the browser handle the error is usually fine
                });
            })
    );
});