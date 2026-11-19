import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, Firestore } from "firebase/firestore";
import { DEMO_MODE } from "./demoMode/flag";

const firebaseConfig = {
  // demo mode never talks to Firebase; a placeholder lets it start without a .env
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (DEMO_MODE ? "demo-mode-placeholder" : undefined),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (DEMO_MODE ? "demo-barquests" : undefined),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
// Optional fields (a guest has no photoURL, for instance) are left out of
// writes instead of failing them: Firestore rejects `undefined` values by
// default, which once silently blocked creating guest accounts.
function makeDb(): Firestore {
  try {
    return initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
  } catch {
    return getFirestore(firebaseApp); // already initialised (hot reload)
  }
}
export const db = makeDb();
export const googleProvider = new GoogleAuthProvider();
