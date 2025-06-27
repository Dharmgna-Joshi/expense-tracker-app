// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 🔧 Your Firebase config object — must be accurate
const firebaseConfig = {
  apiKey: "AIzaSyB2DF6O34IsKFQ--0L7bn_ebGUv_Ssy-7k",
  authDomain: "expense-tracker-app-bed13.firebaseapp.com",
  projectId: "expense-tracker-app-bed13",
  storageBucket: "expense-tracker-app-bed13.appspot.com",
  messagingSenderId: "538526118242",
  appId: "1:538526118242:web:e8184829220468efb163c3b"
};

// 🚀 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🔑 Auth, Google, Firestore exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
