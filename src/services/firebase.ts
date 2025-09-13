// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBVwMJ1BJaeyyUcZVjBmb4BucmAQmpGGmc",
  authDomain: "foodbridge-f4eb7.firebaseapp.com",
  projectId: "foodbridge-f4eb7",
  storageBucket: "foodbridge-f4eb7.firebasestorage.app",
  messagingSenderId: "988963447459",
  appId: "1:988963447459:web:0c5d50c62112be2dd0d516",
  measurementId: "G-DR218TTTKV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
