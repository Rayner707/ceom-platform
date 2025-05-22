import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDfRqlF0NbcstrKSS2xF7T-eX3IFCEzpLY",
  authDomain: "ceom-platform.firebaseapp.com",
  projectId: "ceom-platform",
  storageBucket: "ceom-platform.firebasestorage.app",
  messagingSenderId: "74007746078",
  appId: "1:74007746078:web:cbf4e65f4e85cca3e4c00f",
  measurementId: "G-V6EGQYBXD2"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);