
// This file is no longer the primary source for Firebase services.
// The app has been refactored to use Zoho Catalyst for authentication.
// Firestore logic remains but depends on a user ID from the new auth system.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgHs-SMz1uWVineex7tjZBWy9steLQiCc",
  authDomain: "studio-7694557123-a611b.firebaseapp.com",
  projectId: "studio-7694557123-a611b",
  storageBucket: "studio-7694557123-a611b.appspot.com",
  messagingSenderId: "1017273967743",
  appId: "1:1017273967743:web:64f163722cb5e56f2e4b4a"
};

let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);

// Auth is no longer exported from here
export { app, db };
