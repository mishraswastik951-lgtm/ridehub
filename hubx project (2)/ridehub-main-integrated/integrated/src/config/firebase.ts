import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEES0mQ2-h8R8-dH8vfl-orCr-yyZTz20",
  authDomain: "ridehub-391c2.firebaseapp.com",
  projectId: "ridehub-391c2",
  storageBucket: "ridehub-391c2.firebasestorage.app",
  messagingSenderId: "1018995602168",
  appId: "1:1018995602168:web:984ce43f21d7043946c10d",
  measurementId: "G-66BQSW8ETH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
auth.useDeviceLanguage();

// Initialize Analytics (optional, only runs in browser environments)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}
