// Firebase configuration and initialization for FoodBridge app
import { initializeApp, getApp, FirebaseError } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVwMJ1BJaeyyUcZVjBmb4BucmAQmpGGmc",
  authDomain: "foodbridge-f4eb7.firebaseapp.com",
  projectId: "foodbridge-f4eb7",
  storageBucket: "foodbridge-f4eb7.firebasestorage.app",
  messagingSenderId: "988963447459",
  appId: "1:988963447459:web:0c5d50c62112be2dd0d516",
  measurementId: "G-DR218TTTKV",
};

// Initialize Firebase app with duplicate check
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If app already exists, get the existing instance
  const e = error as FirebaseError;
  if (e.code === "app/duplicate-app") {
    app = getApp();
  } else {
    throw error;
  }
}

// Initialize Firebase services
export const auth = getAuth(app);
// Use long polling for React Native environments to avoid WebChannel issues
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}); // Firestore database
export const storage = getStorage(app); // Cloud storage for images

export default app;
