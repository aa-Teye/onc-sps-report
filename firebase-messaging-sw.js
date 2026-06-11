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

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || './logo.png',
    badge: './logo.png',
    data: payload.data
  });
});
