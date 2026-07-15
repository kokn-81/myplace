import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQ_R1iqyydELfFZ4JzMMuf4iAFlKuLi08",
  authDomain: "myplace-cc527.firebaseapp.com",
  projectId: "myplace-cc527",
  storageBucket: "myplace-cc527.firebasestorage.app",
  messagingSenderId: "402471654929",
  appId: "1:402471654929:web:c72c0793fff8ab5a00c3b0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase auth persistence failed:", error);
});

export const db = getFirestore(app);
export const storage = getStorage(app);
