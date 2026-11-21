import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, Firestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { DEMO_MODE } from "./demoMode/flag";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";

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

// App Check: set up first, so Firestore and Auth requests carry its token
// too. Uses Google Cloud Fraud Defense (formerly reCAPTCHA Enterprise) with
// NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_KEY — the recommended provider, since
// classic reCAPTCHA is deprecated — or classic reCAPTCHA v3 with
// NEXT_PUBLIC_RECAPTCHA_SITE_KEY. Only in the browser, never in demo mode.
// For local development, NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN can hold a debug
// token registered in the Firebase console.
function makeAppCheck(): AppCheck | null {
  const enterpriseKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_KEY;
  const v3Key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (typeof window === "undefined" || (!enterpriseKey && !v3Key) || DEMO_MODE) return null;
  const debug = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;
  if (debug) (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN = debug;
  const provider = enterpriseKey ? new ReCaptchaEnterpriseProvider(enterpriseKey) : new ReCaptchaV3Provider(v3Key!);
  try {
    return initializeAppCheck(firebaseApp, { provider, isTokenAutoRefreshEnabled: true });
  } catch {
    return null; // already initialised (hot reload) or unsupported
  }
}
export const appCheck = makeAppCheck();

export const auth = getAuth(firebaseApp);
// Optional fields (a guest has no photoURL, for instance) are left out of
// writes instead of failing them: Firestore rejects `undefined` values by
// default, which once silently blocked creating guest accounts.
function makeDb(): Firestore {
  try {
    return initializeFirestore(firebaseApp, {
      ignoreUndefinedProperties: true,
      // a copy of your data on the device: the app works offline, and
      // writes made without a connection are sent when it's back
      // (offlineWrites.ts). Browser only; the server keeps the default.
      ...(typeof window !== "undefined" && !DEMO_MODE ? { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) } : {}),
    });
  } catch {
    return getFirestore(firebaseApp); // already initialised (hot reload)
  }
}
export const db = makeDb();
export const googleProvider = new GoogleAuthProvider();
