import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhJIGCVsN8zavIcAmmRsFpZkle5lL-q_c",
  authDomain: "house-marketplace-app-fa297.firebaseapp.com",
  projectId: "house-marketplace-app-fa297",
  storageBucket: "house-marketplace-app-fa297.appspot.com",
  messagingSenderId: "98673975370",
  appId: "1:98673975370:web:9a56f6caf021c54194c6b3"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()