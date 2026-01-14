import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBqgLXxxVhE7NeQMZdQB0TOl8tdqCUZ1uQ",
  authDomain: "taskpulse-9ce68.firebaseapp.com",
  databaseURL: "https://taskpulse-9ce68-default-rtdb.firebaseio.com",
  projectId: "taskpulse-9ce68",
  storageBucket: "taskpulse-9ce68.firebasestorage.app",
  messagingSenderId: "133287375648",
  appId: "1:133287375648:web:9f8d3ad0eb9059b9ffdd45",
  measurementId: "G-Y71PXGEFW6"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

