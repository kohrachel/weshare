// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Can Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCm8-5zNwZW44BXIeyHwBDfWvst6vBjipM",
  authDomain: "weshare-c1834.firebaseapp.com",
  projectId: "weshare-c1834",
  storageBucket: "weshare-c1834.firebasestorage.app",
  messagingSenderId: "696075099543",
  appId: "1:696075099543:web:dae492b0023ee4ff8cf8d2",
  measurementId: "G-PZEZ68XJQG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
