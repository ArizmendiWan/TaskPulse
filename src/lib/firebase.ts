import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

function logFirebaseEnvSanity() {
  const keys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID',
  ] as const

  const present = Object.fromEntries(
    keys.map((k) => [k, Boolean(import.meta.env[k])]),
  ) as Record<(typeof keys)[number], boolean>

  // Don't print actual values (some are secrets). Just presence + a safe hint.
  console.log('[firebase] env presence', present)

  const missing = keys.filter((k) => !import.meta.env[k])
  if (missing.length) {
    console.error(
      '[firebase] missing VITE_* env vars (Firebase will break):',
      missing,
    )
  }
}

logFirebaseEnvSanity()

const envFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Fallback for local dev when `.env` isn't set up.
// Note: Firebase "web config" values are not secrets; security is enforced via Firestore rules.
const fallbackFirebaseConfig = {
  apiKey: 'AIzaSyBqgLXxxVhE7NeQMZdQB0TOl8tdqCUZ1uQ',
  authDomain: 'taskpulse-9ce68.firebaseapp.com',
  databaseURL: 'https://taskpulse-9ce68-default-rtdb.firebaseio.com',
  projectId: 'taskpulse-9ce68',
  storageBucket: 'taskpulse-9ce68.firebasestorage.app',
  messagingSenderId: '133287375648',
  appId: '1:133287375648:web:9f8d3ad0eb9059b9ffdd45',
  measurementId: 'G-Y71PXGEFW6',
}

const firebaseConfig =
  envFirebaseConfig.apiKey && envFirebaseConfig.projectId
    ? envFirebaseConfig
    : fallbackFirebaseConfig

console.log(
  '[firebase] using config source:',
  firebaseConfig === envFirebaseConfig ? 'env' : 'fallback',
)

let app
try {
  app = initializeApp(firebaseConfig)
  console.log('[firebase] initialized app')
} catch (e) {
  console.error('[firebase] initializeApp failed', e)
  throw e
}

export const db = getFirestore(app)

