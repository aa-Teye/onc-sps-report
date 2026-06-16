// Handles push subscriptions still tied to this SW registration.
// New devices register to sw.js (merged). This file keeps existing
// subscriptions working until devices re-open the app and re-register.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyASBX11NesPvKgswxqH54r-ouf6kEHLNNE",
  authDomain: "onc-sps.firebaseapp.com",
  projectId: "onc-sps",
  storageBucket: "onc-sps.firebasestorage.app",
  messagingSenderId: "193248349969",
  appId: "1:193248349969:web:7ff0ce2f4c1492ff4e46b0"
});

const messaging = firebase.messaging();
const APP_URL = new URL('./', self.location.href).href;
const LOGO_URL = APP_URL + 'logo.png';

messaging.onBackgroundMessage(function (payload) {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || 'ONC SPS', {
    body:               n.body || '',
    icon:               n.icon || LOGO_URL,
    badge:              LOGO_URL,
    vibrate:            [200, 100, 200],
    requireInteraction: true,
    data:               Object.assign({ url: APP_URL }, payload.data || {})
  });
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url) || APP_URL;
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
