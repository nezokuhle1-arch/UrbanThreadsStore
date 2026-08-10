// firebase-config.js
// Central Firebase initialization — every other JS module imports db/auth from here.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCetNg_2wQeHUSOxCYvOZtzt4HLOiB2L1s",
  authDomain: "urbanthreadsstore-73209.firebaseapp.com",
  projectId: "urbanthreadsstore-73209",
  storageBucket: "urbanthreadsstore-73209.firebasestorage.app",
  messagingSenderId: "231865756442",
  appId: "1:231865756442:web:d72254f28f9bb2df0d5aa3",
  measurementId: "G-7GP9TZW6NT"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();