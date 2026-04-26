// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCldjsVJEFBUyS24m9as0himAmwwm3s52M",
  authDomain: "dayscore-1fcf7.firebaseapp.com",
  projectId: "dayscore-1fcf7",
  storageBucket: "dayscore-1fcf7.firebasestorage.app",
  messagingSenderId: "462173583846",
  appId: "1:462173583846:web:77feb85600a62ccc417e27",
  measurementId: "G-HXHB9EJQQC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Analytics
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Connect to emulators in development (optional)
if (process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true' && process.env.NODE_ENV === 'development') {
  try {
    // Connect to Authentication emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('⚠️ Emulator connection failed:', error);
  }
}

console.log('✅ Firebase initialized successfully');

export default app;