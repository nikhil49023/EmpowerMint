
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

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

let firebaseInstances: FirebaseInstances | null = null;

function initializeFirebase(): FirebaseInstances {
  if (firebaseInstances) {
    return firebaseInstances;
  }

  let app;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  const auth = getAuth(app);
  const db = getFirestore(app);

  firebaseInstances = { app, auth, db };
  return firebaseInstances;
}

const { app, auth, db } = initializeFirebase();

export { app, auth, db, initializeFirebase };
