// Import the functions you need from the SDKs you need
// @ts-ignore
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getAuth } from 'firebase/auth';
// @ts-ignore
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import { getStorage } from 'firebase/storage';
// @ts-ignore
import { getDatabase } from 'firebase/database';
// @ts-ignore
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDE6jotQAvAbI9cMnTH-SyxGSosfv3wHyw",
  authDomain: "login-44e2b.firebaseapp.com",
  databaseURL: "https://login-44e2b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "login-44e2b",
  storageBucket: "login-44e2b.firebasestorage.app",
  messagingSenderId: "496576990787",
  appId: "1:496576990787:web:f2b6da878dc3222e7d0ef6",
  measurementId: "G-VNCTPEW026"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Firebase Realtime Database and get a reference to the service
export const realtimeDb = getDatabase(app);

// Initialize Firebase Analytics
export const analytics = getAnalytics(app);

export default app;
