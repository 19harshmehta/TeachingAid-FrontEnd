// Define a unique cache name for this version of your app
const CACHE_NAME = 'pollsync-cache-v1';

// List all the core files that make up the "shell" of your application
const urlsToCache = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/src/index.css',
  '/src/main.tsx',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

// Event listener for the "install" event
// This is where we cache the core application files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event listener for the "fetch" event
// This serves cached files when the user is offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If the file is in the cache, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch it from the network.
        return fetch(event.request);
      })
  );
});