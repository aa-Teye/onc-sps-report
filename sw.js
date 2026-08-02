// Firebase Cloud Messaging — must be imported before any other SW code so
// Firebase can register its own internal push/message event listeners.
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyASBX11NesPvKgswxqH54r-ouf6kEHLNNE",
      authDomain: "onc-sps.firebaseapp.com",
      projectId: "onc-sps",
      storageBucket: "onc-sps.firebasestorage.app",
      messagingSenderId: "193248349969",
      appId: "1:193248349969:web:7ff0ce2f4c1492ff4e46b0"
    });
  }

  var _fcmMsg = firebase.messaging();
  var _appUrl = new URL('./', self.location.href).href;
  var _logo   = _appUrl + 'logo.png';

  _fcmMsg.onBackgroundMessage(function (payload) {
    var n = payload.notification || {};
    self.registration.showNotification(n.title || 'ONC SPS', {
      body:               n.body || '',
      icon:               n.icon || _logo,
      badge:              _logo,
      vibrate:            [200, 100, 200],
      requireInteraction: true,
      data:               Object.assign({ url: _appUrl }, payload.data || {})
    });
  });
} catch (e) {
  // Firebase scripts unavailable (offline install) — push disabled; cache still works.
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzl5Nd0kLD08Q7vowaTEHG2hjybQRlctfx97xOfB07N9e8VKUKXMQ-wCfFz5ztrmADF/exec';

// Open / focus the app when a notification is tapped.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var data = event.notification.data || {};
  var target = data.url || (self.location.origin + '/onc-sps-report/');

  // Fire-and-forget so admin can see which shepherds actually opened the push.
  if (data.notificationId && data.shepherdName) {
    fetch(SCRIPT_URL + '?action=logNotificationClick'
      + '&notificationId=' + encodeURIComponent(data.notificationId)
      + '&shepherdName=' + encodeURIComponent(data.shepherdName), { mode: 'no-cors' }).catch(function () {});
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.startsWith(target.replace(/\/$/, '')) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});

// ── Cache ────────────────────────────────────────────────────────
const CACHE_NAME = 'onc-sps-v43';
const CACHE_URLS = [
  '/onc-sps-report/',
  '/onc-sps-report/index.html',
  '/onc-sps-report/admin.html',
  '/onc-sps-report/churchData.js',
  '/onc-sps-report/logo.png',
  '/onc-sps-report/members.html',
  '/onc-sps-report/pipeline.html',
  '/onc-sps-report/schools.html',
  '/onc-sps-report/sunday.html',
  '/onc-sps-report/visitation.html'
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
    (async function () {
      var keys = await caches.keys();
      await Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
      await self.clients.claim();
      // controllerchange fires in open pages when claim() runs;
      // each page has a one-shot reload guard that picks up the new cache.
    })()
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('script.google.com')) return;
  if (event.request.url.includes('fonts.googleapis.com')) return;
  if (event.request.url.includes('fonts.gstatic.com')) return;
  if (event.request.url.includes('gstatic.com/firebasejs')) return;

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
