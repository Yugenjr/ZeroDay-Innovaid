// Import the functions you need from the SDKs you need
// @ts-ignore
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getAuth } from 'firebase/auth';
// @ts-ignore
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDE6jotQAvAbI9cMnTH-SyxGSosfv3wHyw",
  authDomain: "login-44e2b.firebaseapp.com",
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

export default app;
