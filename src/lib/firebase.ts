
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBgHs-SMz1uWVineex7tjZBWy9steLQiCc",
  authDomain: "studio-7694557123-a611b.firebaseapp.com",
  projectId: "studio-7694557123-a611b",
  storageBucket: "studio-7694557123-a611b.appspot.com",
  messagingSenderId: "1017273967743",
  appId: "1:1017273967743:web:64f163722cb5e56f2e4b4a"
};


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, db, auth, storage, googleProvider, githubProvider };
