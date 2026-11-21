import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteUser, reauthenticateWithPopup, signOut, User } from "firebase/auth";
import { auth, db, googleProvider } from "./firebase";
import { setGlobalBoardEntry, syncPublicProfile } from "./store";
import { monthKey } from "./events";
import { currentWeekKey } from "./missions";
import { clearClips } from "./videoProof";
import {
  DEFAULT_BODY,
  DEFAULT_EQUIPMENT,
  DEFAULT_SKILLS,
  Friend,
  UserDoc,
} from "./types";

// ---------------------------------------------------------------------------
// Account-level operations behind the profile's "Your data" and "Danger zone"
// sections, from least to most destructive. Every reset keeps identity and
// social data (name, friend code, friends, reminders, language); only
// deleteAccount removes those.
// ---------------------------------------------------------------------------

const LEARNING_FIELDS = { exerciseStats: deleteField(), skillProgress: deleteField() };

// Forget per-exercise and per-skill learning (rest/hold/difficulty memory).
// Skills, XP and verifications stay.
export async function resetTrainingMemory(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), LEARNING_FIELDS);
}

// Every claim goes back to "claimed" and gets re-checked in future sessions.
export async function resetVerifications(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { claims: deleteField() });
  await clearClips(); // the clips belonged to those verifications
}

// Wipe skill levels and send the athlete back through the assessment.
// XP, streak and history are kept.
export async function resetSkills(userDoc: UserDoc): Promise<void> {
  await clearClips();
  await updateDoc(doc(db, "users", userDoc.uid), {
    skills: DEFAULT_SKILLS,
    skillHistory: [],
    skillMastery: {},
    goalTracks: [],
    claims: deleteField(),
    onboarded: false,
    ...LEARNING_FIELDS,
  });
  if (userDoc.friendCode) await syncPublicProfile({
    uid: userDoc.uid,
    displayName: userDoc.displayName,
    photoURL: userDoc.photoURL,
    friendCode: userDoc.friendCode,
    level: 1,
    streak: userDoc.streak,
    xp: userDoc.xp,
    totalSessionsCompleted: userDoc.totalSessionsCompleted,
    skills: DEFAULT_SKILLS,
    skillMastery: {},
  }).catch(() => {});
  await clearBoardEntry(userDoc);
}

// Start over as a brand-new athlete, keeping the account and friends.
async function deleteSessionHistory(uid: string): Promise<void> {
  const snap = await getDocs(collection(db, "users", uid, "sessions"));
  await deleteInChunks(snap.docs.map((d) => ({ col: ["users", uid, "sessions"], id: d.id })));
}

export async function resetAllProgress(userDoc: UserDoc): Promise<void> {
  await clearClips();
  await updateDoc(doc(db, "users", userDoc.uid), {
    body: DEFAULT_BODY,
    skills: DEFAULT_SKILLS,
    skillHistory: [],
    skillMastery: {},
    equipment: DEFAULT_EQUIPMENT,
    goalTracks: [],
    onboarded: false,
    xp: 0,
    level: 1,
    streak: 0,
    lastSessionDateISO: deleteField(),
    totalSessionsCompleted: 0,
    missions: [],
    xpHistory: [],
    records: deleteField(),
    claims: deleteField(),
    ...LEARNING_FIELDS,
  });
  await deleteSessionHistory(userDoc.uid);
  if (userDoc.friendCode) await syncPublicProfile({
    uid: userDoc.uid,
    displayName: userDoc.displayName,
    photoURL: userDoc.photoURL,
    friendCode: userDoc.friendCode,
    level: 1,
    streak: 0,
    xp: 0,
    totalSessionsCompleted: 0,
    skills: DEFAULT_SKILLS,
    skillMastery: {},
  }).catch(() => {});
  await clearBoardEntry(userDoc);
}

// Everything stored about the athlete, as a downloadable JSON file.
export async function exportUserData(userDoc: UserDoc): Promise<void> {
  const [friendsSnap, sessionsSnap] = await Promise.all([
    getDocs(collection(db, "users", userDoc.uid, "friends")),
    getDocs(collection(db, "users", userDoc.uid, "sessions")),
  ]);
  const data = {
    exportedAt: new Date().toISOString(),
    profile: userDoc,
    friends: friendsSnap.docs.map((d) => d.data() as Friend),
    sessions: sessionsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `barquests-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function deleteInChunks(paths: { col: string[]; id: string }[]): Promise<void> {
  for (let i = 0; i < paths.length; i += 400) {
    const batch = writeBatch(db);
    for (const p of paths.slice(i, i + 400)) {
      const [first, ...rest] = p.col;
      batch.delete(doc(db, first, ...rest, p.id));
    }
    await batch.commit();
  }
}

export type DeleteStep = "reauth" | "data" | "account";

// Permanently deletes the account. Google re-authentication comes FIRST
// (Firebase refuses to delete a user who signed in long ago), so a refused
// or cancelled sign-in leaves everything untouched instead of half-deleted.
export async function deleteAccount(user: User, userDoc: UserDoc, onStep?: (s: DeleteStep) => void): Promise<void> {
  onStep?.("reauth");
  if (!user.isAnonymous) await reauthenticateWithPopup(user, googleProvider);

  onStep?.("data");
  const uid = userDoc.uid;
  const [friends, pings, sessions, pairings] = await Promise.all([
    getDocs(collection(db, "users", uid, "friends")),
    getDocs(collection(db, "users", uid, "pings")),
    getDocs(collection(db, "users", uid, "sessions")),
    getDocs(query(collection(db, "pairings"), where("hostUid", "==", uid))),
  ]);

  // remove me from my friends' lists too (the rules allow the mirrored entry)
  await deleteInChunks([
    ...friends.docs.map((d) => ({ col: ["users", d.id, "friends"], id: uid })),
    ...friends.docs.map((d) => ({ col: ["users", uid, "friends"], id: d.id })),
    ...pings.docs.map((d) => ({ col: ["users", uid, "pings"], id: d.id })),
    ...sessions.docs.map((d) => ({ col: ["users", uid, "sessions"], id: d.id })),
  ]);
  // pairings hold body stats + skills; best-effort, needs the host delete rule
  await Promise.all(pairings.docs.map((d) => deleteDoc(d.ref).catch(() => {})));
  if (userDoc.friendCode) await deleteDoc(doc(db, "usercodes", userDoc.friendCode)).catch(() => {});
  // global board entries for this and the last logged week
  await setGlobalBoardEntry(uid, null, [currentWeekKey(), ...(userDoc.week?.key ? [userDoc.week.key] : [])]).catch(() => {});
  await deleteDoc(doc(db, "events", monthKey(), "players", uid)).catch(() => {});
  await deleteDoc(doc(db, "profiles", uid));
  await deleteDoc(doc(db, "users", uid));

  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("barquests:")) localStorage.removeItem(k);
    }
  } catch {
    // storage unavailable — nothing to clean
  }

  await clearClips();
  onStep?.("account");
  try {
    await deleteUser(user);
  } catch (err) {
    // an old guest session can't re-confirm its identity; the data is gone
    // already, so just end the session
    if (user.isAnonymous) await signOut(auth);
    else throw err;
  }
}

// A reset takes the player's totals off the global board too (they come
// back with their next session if they're still opted in).
async function clearBoardEntry(userDoc: UserDoc): Promise<void> {
  if (!userDoc.friendCode || !userDoc.globalBoard) return;
  const keys = [currentWeekKey(), ...(userDoc.week?.key ? [userDoc.week.key] : [])];
  await setGlobalBoardEntry(userDoc.uid, null, keys).catch(() => {});
}
