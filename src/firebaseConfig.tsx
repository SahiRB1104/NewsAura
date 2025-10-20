// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC56lNOQGSO16hDulLSLgUBQK4qbuqKMyU",
  authDomain: "newsaura-1c228.firebaseapp.com",
  projectId: "newsaura-1c228",
  storageBucket: "newsaura-1c228.firebasestorage.app",
  messagingSenderId: "983094727847",
  appId: "1:983094727847:web:c6c3ee195f5a420c737782",
  measurementId: "G-MH4G69T91Z",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Authentication and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Initialize Analytics (only if supported)
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export default app;
