
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgHs-SMz1uWVineex7tjZBWy9steLQiCc",
  authDomain: "studio-7694557123-a611b.firebaseapp.com",
  projectId: "studio-7694557123-a611b",
  storageBucket: "studio-7694557123-a611b.appspot.com",
  messagingSenderId: "1017273967743",
  appId: "1:1017273967743:web:64f163722cb5e56f2e4b4a"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

// No longer exporting initializeFirebase as it's run directly here.
export { app, auth, db };
