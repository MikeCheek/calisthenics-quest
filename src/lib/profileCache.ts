import type { User } from "firebase/auth";
import type { UserDoc } from "./types";

// ---------------------------------------------------------------------------
// Instant start: the signed-in profile kept on this device, so the app can
// show it before Firebase has answered. It's only ever this device's own
// account, it's replaced by the fresh copy as soon as that arrives, it's
// dropped if Firebase reports a different account or none, and signing out
// clears it. Old copies (over 30 days) aren't used.
// ---------------------------------------------------------------------------

const KEY = "barquests:profile-cache";
const MAX_AGE_MS = 30 * 86400000;

interface Stored {
  v: 1;
  savedAt: number;
  user: { uid: string; isAnonymous: boolean; displayName: string | null; email: string | null; photoURL: string | null };
  doc: UserDoc;
}

export function writeProfileCache(u: Pick<User, "uid" | "isAnonymous" | "displayName" | "email" | "photoURL">, doc: UserDoc) {
  try {
    const value: Stored = {
      v: 1,
      savedAt: Date.now(),
      user: { uid: u.uid, isAnonymous: u.isAnonymous, displayName: u.displayName, email: u.email, photoURL: u.photoURL },
      // push tokens are for the server only; no need to keep them here
      doc: { ...doc, pushTokens: undefined } as UserDoc,
    };
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage full or blocked: just no instant start */
  }
}

export function readProfileCache(now = Date.now()): { user: User; doc: UserDoc } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    if (s.v !== 1 || !s.user?.uid || !s.doc?.uid || s.doc.uid !== s.user.uid || now - s.savedAt > MAX_AGE_MS) return null;
    // a stand-in until Firebase restores the real user: the same uid and
    // profile fields; anything needing a token waits for the real one
    return { user: s.user as unknown as User, doc: s.doc };
  } catch {
    return null;
  }
}

export function clearProfileCache() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
