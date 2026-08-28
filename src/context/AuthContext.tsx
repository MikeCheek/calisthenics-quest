"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { fetchUserDoc, createUserDoc, ensureFriendCode } from "@/lib/store";
import { useToast } from "@/context/ToastContext";
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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserDoc = async (u: User) => {
    let doc = await fetchUserDoc(u.uid);
    if (doc && !doc.skillMastery) {
      doc = { ...doc, skillMastery: {} };
    }
    if (!doc) {
      doc = {
        uid: u.uid,
        displayName: u.displayName ?? "Athlete",
        email: u.email ?? "",
        photoURL: u.photoURL ?? undefined,
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
    // Backfills a friend code + public profile for pre-existing accounts too,
    // and keeps the public profile's level/streak in sync on every load.
    try {
      const code = await ensureFriendCode(doc.uid, doc.displayName, doc.photoURL, doc.level, doc.streak);
      doc = { ...doc, friendCode: code };
    } catch {
      // non-fatal — friends features degrade gracefully without a code yet
    }
    setUserDoc(doc);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadUserDoc(u);
      } else {
        setUserDoc(null);
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

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      toast.error("Couldn't sign out — try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userDoc, loading, refreshUserDoc, signIn, signOut }}
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
