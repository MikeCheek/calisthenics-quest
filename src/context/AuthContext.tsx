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
  signInAnonymously,
  linkWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  AuthCredential,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { fetchUserDoc, createUserDoc, ensureFriendCode, updateProgress } from "@/lib/store";
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
  // Guest mode: an anonymous Firebase account, so everything works before
  // signing up; saveWithGoogle links Google to that same account.
  isGuest: boolean;
  startAsGuest: () => Promise<boolean>;
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

  const loadUserDoc = async (u: User) => {
    let doc = await fetchUserDoc(u.uid);
    if (doc && !doc.skillMastery) {
      doc = { ...doc, skillMastery: {} };
    }
    if (!doc) {
      doc = {
        uid: u.uid,
        displayName: u.displayName ?? (u.isAnonymous ? "Guest" : "Athlete"),
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
    // Guests get no friend code or public profile: those are for people
    // others can find, and guest accounts are often thrown away.
    if (u.isAnonymous) {
      setUserDoc(doc);
      return;
    }
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

  const startAsGuest = async (): Promise<boolean> => {
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
