import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
// Instructions: https://console.firebase.google.com/ > Project Settings > Your apps > Web app config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if Firebase is properly configured
const isConfigured = !Object.values(firebaseConfig).some(value => 
  typeof value === 'string' && value.startsWith('YOUR_')
);

if (!isConfigured) {
  console.error('❌ Firebase is not configured! Please update /src/config/firebase.js with your Firebase credentials.');
  console.error('📖 See FIREBASE_SETUP.md for setup instructions.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Export configuration status
export const isFirebaseConfigured = isConfigured;