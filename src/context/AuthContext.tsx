"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  linkWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  AuthCredential,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { DEMO_MODE, DEMO_UID } from "@/lib/demoMode/flag";
import { fetchUserDoc, createUserDoc, ensureFriendCode, updateProgress, fetchSessionsBetween } from "@/lib/store";
import { streakFromSessions } from "@/lib/weekStreak";
import { useToast } from "@/context/ToastContext";
import { disablePush } from "@/lib/pushClient";
import { isAnonymized } from "@/lib/anonymize";
import { clearProfileCache, readProfileCache, writeProfileCache } from "@/lib/profileCache";
import {
  DEFAULT_BODY,
  DEFAULT_EQUIPMENT,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_SKILLS,
  UserDoc,
} from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  refreshUserDoc: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  // Guest mode: an anonymous Firebase account, so everything works before
  // signing up; saveWithGoogle links Google to that same account.
  isGuest: boolean;
  startAsGuest: () => Promise<boolean>;
  setupFailures: number;
  saveWithGoogle: () => Promise<SaveResult>;
  switchToExistingAccount: () => Promise<void>;
}

// "exists": that Google account already has BarQuests progress — the
// caller asks before switching (the guest progress can't be merged in).
export type SaveResult = "saved" | "exists" | "cancelled" | "error";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCredential, setPendingCredential] = useState<AuthCredential | null>(null);
  // bumped whenever loading/creating the account's data fails, so screens
  // waiting on it (the landing page's guest button) can stop waiting
  const [setupFailures, setSetupFailures] = useState(0);
  // the auth listener below is registered once; read the toast through a ref
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const loadUserDoc = async (u: User) => {
    let doc = await fetchUserDoc(u.uid);
    // this account was deleted (its data anonymised) but removing the sign-in
    // didn't finish: never bring it back to life, just sign out
    if (isAnonymized(doc)) {
      clearProfileCache();
      await firebaseSignOut(auth).catch(() => {});
      setUserDoc(null);
      return;
    }
    if (doc && !doc.skillMastery) {
      doc = { ...doc, skillMastery: {} };
    }
    if (!doc) {
      doc = {
        uid: u.uid,
        displayName: u.displayName ?? (u.isAnonymous ? "Guest" : "Athlete"),
        email: u.email ?? "",
        ...(u.photoURL ? { photoURL: u.photoURL } : {}),
        body: DEFAULT_BODY,
        skills: DEFAULT_SKILLS,
        skillMastery: {},
        equipment: DEFAULT_EQUIPMENT,
        goalTracks: [],
        xpHistory: [],
        notifications: DEFAULT_NOTIFICATIONS,
        friendCode: "",
        onboarded: false,
        xp: 0,
        level: 1,
        streak: 0,
        totalSessionsCompleted: 0,
        missions: [],
        createdAt: new Date().toISOString(),
      };
      await createUserDoc(doc);
    }
    // streaks used to count days: count weeks from the session history, once
    if (doc.streakUnit !== "week" && doc.totalSessionsCompleted > 0) {
      try {
        const now = new Date();
        const sessions = await fetchSessionsBetween(doc.uid, new Date(now.getTime() - 2 * 365 * 86400000).toISOString(), new Date(now.getTime() + 60000).toISOString());
        const streak = streakFromSessions([...sessions.map((x) => x.finishedAt), ...(doc.lastSessionDateISO ? [doc.lastSessionDateISO] : [])], now);
        await updateProgress(doc.uid, { streak, streakUnit: "week" });
        doc = { ...doc, streak, streakUnit: "week" };
      } catch {
        // offline: try again next time
      }
    }
    // Backfills a friend code + public profile for pre-existing accounts too,
    // and keeps the public profile's level/streak in sync on every load.
    // Guests get no friend code or public profile: those are for people
    // others can find, and guest accounts are often thrown away.
    if (u.isAnonymous) {
      setUserDoc(doc);
      writeProfileCache(u, doc);
      return;
    }
    try {
      const code = await ensureFriendCode(doc.uid, doc.displayName, doc.photoURL, doc.level, doc.streak);
      doc = { ...doc, friendCode: code };
    } catch {
      // non-fatal — friends features degrade gracefully without a code yet
    }
    setUserDoc(doc);
    writeProfileCache(u, doc);
  };

  useEffect(() => {
    // the inline NODE_ENV check lets production builds drop this branch entirely
    if (process.env.NODE_ENV === "development" && DEMO_MODE) {
      // example athlete, no Firebase (see lib/demoMode)
      const demoUser = {
        uid: DEMO_UID,
        // sessionStorage "barquests:demo-guest" = "1": a guest, to try what guests see
        isAnonymous: (() => {
          try {
            return sessionStorage.getItem("barquests:demo-guest") === "1";
          } catch {
            return false;
          }
        })(),
        displayName: "Alex Demo",
        email: "demo@example.com",
        photoURL: null,
        providerData: [],
        getIdToken: async () => "",
      } as unknown as User;
      setUser(demoUser);
      loadUserDoc(demoUser).finally(() => setLoading(false));
      return;
    }
    // instant start: the profile kept on this device from last time shows
    // straight away; Firebase confirms the account and the fresh copy
    // replaces it a moment later (lib/profileCache.ts)
    const cached = readProfileCache();
    if (cached) {
      setUser(cached.user);
      setUserDoc(cached.doc);
      setLoading(false);
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        clearProfileCache();
        setUser(null);
        setUserDoc(null);
        setLoading(false);
        return;
      }
      // a different account than the one kept on the device
      const sameAccount = cached?.user.uid === u.uid;
      if (!sameAccount && cached) {
        clearProfileCache();
        setUserDoc(null);
        setLoading(true);
      }
      setUser(u);
      try {
        await loadUserDoc(u);
      } catch (err) {
        console.error("Couldn't load or create the account's data", err);
        if (sameAccount) {
          // offline: keep showing what's on the device
          toastRef.current.info("You're offline — showing your last saved data.");
        } else {
          setUserDoc(null);
          setSetupFailures((n) => n + 1);
          toastRef.current.error("Couldn't set up your account — check your connection and try again.");
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const refreshUserDoc = async () => {
    if (user) await loadUserDoc(user);
  };

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      // a cancelled/closed popup isn't worth alarming someone about —
      // only surface genuine failures (blocked popup, network, etc.)
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      toast.error("Couldn't sign in — check your connection and try again.");
    }
  };

  const startAsGuest = async (): Promise<boolean> => {
    // a guest account whose data couldn't be created last time: retry that
    // instead of making another anonymous account
    const current = auth.currentUser;
    if (current?.isAnonymous && !userDoc) {
      try {
        await loadUserDoc(current);
        return true;
      } catch {
        toast.error("Couldn't set up your account — check your connection and try again.");
        return false;
      }
    }
    try {
      await signInAnonymously(auth);
      return true;
    } catch (err) {
      const code = (err as { code?: string })?.code;
      toast.error(
        code === "auth/operation-not-allowed" || code === "auth/admin-restricted-operation"
          ? "Guest mode isn't enabled on this server yet — sign in with Google instead."
          : "Couldn't start a guest session — check your connection and try again."
      );
      return false;
    }
  };

  // Links Google to the guest account: same uid, so every bit of progress
  // simply stays where it is — nothing to copy.
  const saveWithGoogle = async (): Promise<SaveResult> => {
    if (!auth.currentUser) return "error";
    try {
      const result = await linkWithPopup(auth.currentUser, googleProvider);
      const g = result.user.providerData.find((p) => p.providerId === "google.com");
      await updateProgress(result.user.uid, {
        displayName: g?.displayName ?? result.user.displayName ?? "Athlete",
        email: g?.email ?? result.user.email ?? "",
        ...(g?.photoURL ? { photoURL: g.photoURL } : {}),
      });
      await result.user.reload();
      setUser(auth.currentUser);
      if (auth.currentUser) await loadUserDoc(auth.currentUser); // now gets a friend code too
      toast.success("Progress saved to your Google account.");
      return "saved";
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "cancelled";
      if (code === "auth/credential-already-in-use" || code === "auth/email-already-in-use") {
        setPendingCredential(GoogleAuthProvider.credentialFromError(err as never));
        return "exists";
      }
      toast.error("Couldn't link your Google account — check your connection and try again.");
      return "error";
    }
  };

  // The Google account already had BarQuests progress: switch to it. The
  // guest progress on this device is left behind (it can't be merged).
  const switchToExistingAccount = async () => {
    if (!pendingCredential) return;
    try {
      await signInWithCredential(auth, pendingCredential);
      setPendingCredential(null);
      toast.success("Signed in to your existing account.");
    } catch {
      toast.error("Couldn't sign in — check your connection and try again.");
    }
  };

  const signOut = async () => {
    try {
      // this device stops getting this account's pushes
      if (auth.currentUser) await disablePush(auth.currentUser.uid);
      clearProfileCache();
      await firebaseSignOut(auth);
    } catch {
      toast.error("Couldn't sign out — try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        refreshUserDoc,
        signIn,
        signOut,
        isGuest: !!user?.isAnonymous,
        startAsGuest,
        setupFailures,
        saveWithGoogle,
        switchToExistingAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
