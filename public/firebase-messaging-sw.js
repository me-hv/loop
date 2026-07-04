// Firebase Cloud Messaging compat Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.15.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.15.0/firebase-messaging-compat.js')

// Initialize the Firebase app in the service worker
// Note: In production, the actual credentials will match the Firebase Console
const firebaseConfig = {
  apiKey: "placeholder-api-key",
  authDomain: "placeholder-project.firebaseapp.com",
  projectId: "placeholder-project",
  storageBucket: "placeholder-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:123456"
}

try {
  firebase.initializeApp(firebaseConfig)
  
  const messaging = firebase.messaging()
  
  // Background message listener
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background messaging payload: ', payload)
    
    if (payload.notification) {
      const notificationTitle = payload.notification.title || 'Loop Reminder'
      const notificationOptions = {
        body: payload.notification.body || 'Stay in the loop.',
        icon: '/logo.png', // site logo
        badge: '/badge.png', // visual badge icon
        data: payload.data
      }
      
      self.registration.showNotification(notificationTitle, notificationOptions)
    }
  })
} catch (err) {
  console.warn('Background Messaging Service Worker failed to start:', err)
}
