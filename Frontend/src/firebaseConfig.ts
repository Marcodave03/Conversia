// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDjCaT7XTscEHDIS51Xp2XLk2yVhVEWrgs",
  authDomain: "conversia-7729f.firebaseapp.com",
  projectId: "conversia-7729f",
  storageBucket: "conversia-7729f.firebasestorage.app",
  messagingSenderId: "990468881493",
  appId: "1:990468881493:web:0311c1acbb31570d47a8dc",
  measurementId: "G-PDKJX5HE1Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);
