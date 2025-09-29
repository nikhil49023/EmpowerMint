// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-7694557123-a611b",
  appId: "1:1017273967743:web:bfa35ee7ad83f2be2e4b4a",
  apiKey: "AIzaSyBgHs-SMz1uWVineex7tjZBWy9steLQiCc",
  authDomain: "studio-7694557123-a611b.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1017273967743"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
