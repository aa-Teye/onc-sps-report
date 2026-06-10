const CACHE_NAME = 'onc-sps-v11';
const CACHE_URLS = [
  '/onc-sps-report/',
  '/onc-sps-report/index.html',
  '/onc-sps-report/churchData.js',
  '/onc-sps-report/logo.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('script.google.com')) return;
  if (event.request.url.includes('fonts.googleapis.com')) return;
  if (event.request.url.includes('fonts.gstatic.com')) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<style>body{font-family:sans-serif;text-align:center;padding:60px 20px;background:#0f2044;color:white;}</style></head>' +
          '<body><div style="font-size:64px;margin-bottom:16px;">📴</div>' +
          '<h2 style="font-size:24px;font-weight:900;margin-bottom:12px;">You\'re Offline</h2>' +
          '<p style="opacity:0.7;font-size:15px;">Please check your connection and try again.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      });
    })
  );
});
