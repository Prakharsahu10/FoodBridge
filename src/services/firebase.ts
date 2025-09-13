// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase project configuration
// TODO: Replace with actual Firebase project values from console.firebase.google.com
const firebaseConfig = {
  apiKey: "demo-api-key-replace-with-real",
  authDomain: "foodbridge-demo.firebaseapp.com",
  projectId: "foodbridge-demo",
  storageBucket: "foodbridge-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with error handling
let auth;
try {
  // Try initializeAuth first (better for React Native)
  auth = initializeAuth(app);
} catch (error) {
  // Fallback to getAuth if already initialized
  console.log("Using getAuth fallback:", error);
  auth = getAuth(app);
}

// Initialize Firestore database
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export { auth };
export default app;
