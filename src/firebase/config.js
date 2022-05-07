import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "REMOVED_API_KEY",
  authDomain: "instapets-a12eb.firebaseapp.com",
  projectId: "instapets-a12eb",
  storageBucket: "instapets-a12eb.appspot.com",
  messagingSenderId: "41406871388",
  appId: "REMOVED_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);