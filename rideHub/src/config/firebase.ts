import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Consolidated Firebase configuration (with env overrides and robust defaults)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBEES0mQ2-h8R8-dH8vfl-orCr-yyZTz20",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ridehub-391c2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ridehub-391c2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ridehub-391c2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1018995602168",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1018995602168:web:984ce43f21d7043946c10d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-66BQSW8ETH"
};

// Initialize or reuse Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
try {
  auth.useDeviceLanguage();
} catch {
  // Ignored in non-browser environments
}

// Optional Analytics initialization
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {});
}

export interface GoogleAuthResult {
  success: boolean;
  user?: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  };
  error?: string;
}

/**
 * Initiates Google Sign-In via Firebase popup
 */
export async function googleSignIn(): Promise<GoogleAuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return {
      success: true,
      user: {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      }
    };
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      return { success: false, error: "Sign-in cancelled. Popup was closed." };
    }
    if (error.code === "auth/popup-blocked") {
      return { success: false, error: "Popup was blocked by the browser. Please allow popups." };
    }
    return {
      success: false,
      error: error.message || "Google Sign-In failed. Please try again."
    };
  }
}

export async function firebaseSignOut(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error("Firebase sign-out error:", error);
  }
}

export default app;
