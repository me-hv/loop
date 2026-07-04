import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const isValidConfig = 
  !!(firebaseConfig.apiKey && firebaseConfig.projectId)

let app
if (isValidConfig) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
} else {
  if (typeof window !== 'undefined') {
    console.warn(
      'Firebase API key or Project ID missing in environment variables. Running in offline/mock mode.'
    )
  }
}

export const firebaseApp = app
export const firebaseAuth = app ? getAuth(app) : null

// Enable Persistent Local Cache for multi-tab offline support
export const firebaseDb = app 
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  : null

export const googleAuthProvider = new GoogleAuthProvider()
