import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCm8-5zNwZW44BXIeyHwBDfWvst6vBjipM",
  authDomain: "weshare-c1834.firebaseapp.com",
  projectId: "weshare-c1834",
  storageBucket: "weshare-c1834.appspot.com", // ✅ fixed
  messagingSenderId: "696075099543",
  appId: "1:696075099543:web:dae492b0023ee4ff8cf8d2",
  measurementId: "G-PZEZ68XJQG",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ add this
