import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { boardName, Metric } from "./leaderboard";
import { db } from "./firebase";
import {
  BodyProfile,
  Friend,
  Ping,
  PublicProfile,
  SkillProfile,
  SkillTrack,
  SkillMastery,
  StagedSkillKey,
  TrainingEquipment,
  UserDoc,
  DEFAULT_SKILLS,
  SessionRecord,
  WeekStats,
} from "./types";

export async function fetchUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

export async function createUserDoc(partial: UserDoc): Promise<void> {
  await setDoc(doc(db, "users", partial.uid), partial);
}

export async function saveProfile(
  uid: string,
  body: BodyProfile,
  skills: SkillProfile,
  equipment: TrainingEquipment,
  goalTracks: SkillTrack[],
  skillMastery: Partial<Record<StagedSkillKey, SkillMastery>>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { body, skills, equipment, goalTracks, skillMastery, onboarded: true });
}

export async function updateProgress(
  uid: string,
  fields: Partial<UserDoc>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { ...fields });
}

function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ---- Pairing (one-off training-together codes) ----
export interface PairingDoc {
  code: string;
  hostUid: string;
  hostName: string;
  hostBody: BodyProfile;
  hostSkills: SkillProfile;
  hostEquipment: TrainingEquipment; // the shared training spot's equipment
  guestUid?: string;
  guestName?: string;
  guestBody?: BodyProfile;
  guestSkills?: SkillProfile;
  createdAtISO: string;
  // How many pull-up bars the two of you actually have between you — with
  // just one, sessions are adjusted so you alternate turns on it instead
  // of both training the same bar-dependent exercise at once.
  barCount?: 1 | 2;
}

export const generatePairingCode = generateShortCode;

export async function createPairing(
  hostUid: string,
  hostName: string,
  hostBody: BodyProfile,
  hostSkills: SkillProfile,
  hostEquipment: TrainingEquipment
): Promise<string> {
  const code = generateShortCode();
  const pairing: PairingDoc = {
    code,
    hostUid,
    hostName,
    hostBody,
    hostSkills,
    hostEquipment,
    createdAtISO: new Date().toISOString(),
  };
  await setDoc(doc(db, "pairings", code), pairing);
  return code;
}

export async function fetchPairing(code: string): Promise<PairingDoc | null> {
  const snap = await getDoc(doc(db, "pairings", code.toUpperCase()));
  if (!snap.exists()) return null;
  return snap.data() as PairingDoc;
}

export async function joinPairing(
  code: string,
  guestUid: string,
  guestName: string,
  guestBody: BodyProfile,
  guestSkills: SkillProfile
): Promise<void> {
  await updateDoc(doc(db, "pairings", code.toUpperCase()), {
    guestUid,
    guestName,
    guestBody,
    guestSkills,
  });
}

export async function setPairingBarCount(code: string, barCount: 1 | 2): Promise<void> {
  await updateDoc(doc(db, "pairings", code.toUpperCase()), { barCount });
}

// ---- Public profile + permanent friend code ----
// profiles/{uid} holds only what's safe to show any signed-in user (name,
// photo, level, streak, friend code) — skills/equipment/body stay private
// in users/{uid}. usercodes/{code} -> uid is a reverse lookup so a friend
// code can be resolved without scanning all users.

export async function syncPublicProfile(profile: PublicProfile): Promise<void> {
  await setDoc(doc(db, "profiles", profile.uid), profile, { merge: true });
}

export async function ensureFriendCode(
  uid: string,
  displayName: string,
  photoURL: string | undefined,
  level: number,
  streak: number
): Promise<string> {
  const userSnap = await getDoc(doc(db, "users", uid));
  const userData = userSnap.exists() ? (userSnap.data() as UserDoc) : undefined;
  const existing = userData?.friendCode;
  const extra = {
    xp: userData?.xp ?? 0,
    totalSessionsCompleted: userData?.totalSessionsCompleted ?? 0,
    skills: userData?.skills ?? DEFAULT_SKILLS,
    skillMastery: userData?.skillMastery ?? {},
  };
  if (existing) {
    await syncPublicProfile({ uid, displayName, photoURL, friendCode: existing, level, streak, ...extra });
    return existing;
  }

  // generate + reserve a unique code, retrying on the rare collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateShortCode();
    const codeSnap = await getDoc(doc(db, "usercodes", code));
    if (codeSnap.exists()) continue;
    await setDoc(doc(db, "usercodes", code), { uid });
    await updateDoc(doc(db, "users", uid), { friendCode: code });
    await syncPublicProfile({ uid, displayName, photoURL, friendCode: code, level, streak, ...extra });
    return code;
  }
  throw new Error("Could not generate a unique friend code — please try again.");
}

export async function lookupUidByFriendCode(code: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "usercodes", code.toUpperCase()));
  if (!snap.exists()) return null;
  return (snap.data() as { uid: string }).uid;
}

// Profiles written before `PublicProfile` grew xp/totalSessionsCompleted/
// skills/skillMastery (any friend who hasn't logged in since) won't have
// those fields in Firestore yet — defaulting them here, once, means every
// consumer of this function gets a complete, safe object rather than each
// screen needing its own fallback (and rather than crashing on
// `undefined.frontLever` the way the friend profile page did before this).
export async function fetchPublicProfile(uid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(db, "profiles", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<PublicProfile>;
  return {
    uid: data.uid ?? uid,
    displayName: data.displayName ?? "Athlete",
    photoURL: data.photoURL,
    friendCode: data.friendCode ?? "",
    level: data.level ?? 1,
    streak: data.streak ?? 0,
    xp: data.xp ?? 0,
    totalSessionsCompleted: data.totalSessionsCompleted ?? 0,
    skills: data.skills ?? DEFAULT_SKILLS,
    skillMastery: data.skillMastery ?? {},
    week: data.week,
  };
}

// ---- Friends (mutual — adding writes both sides) ----
export async function addFriend(
  me: { uid: string; displayName: string; photoURL?: string },
  them: { uid: string; displayName: string; photoURL?: string }
): Promise<void> {
  const batch = writeBatch(db);
  const addedAtISO = new Date().toISOString();
  batch.set(doc(db, "users", me.uid, "friends", them.uid), {
    uid: them.uid,
    displayName: them.displayName,
    photoURL: them.photoURL ?? null,
    addedAtISO,
  });
  batch.set(doc(db, "users", them.uid, "friends", me.uid), {
    uid: me.uid,
    displayName: me.displayName,
    photoURL: me.photoURL ?? null,
    addedAtISO,
  });
  await batch.commit();
}

export async function removeFriend(myUid: string, friendUid: string): Promise<void> {
  await deleteDoc(doc(db, "users", myUid, "friends", friendUid));
  // the friend's mirrored entry is left for them to remove on their side too,
  // since we can't write into their subcollection without their own action
  // once the relationship is one-sided — this keeps the security rules simple.
}

export function listenFriends(uid: string, cb: (friends: Friend[]) => void): () => void {
  const q = query(collection(db, "users", uid, "friends"), orderBy("addedAtISO", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as Friend));
  });
}

// ---- Pings (lightweight "come train" nudges between friends) ----
export async function sendPing(toUid: string, fromUid: string, fromName: string, message: string): Promise<void> {
  await addDoc(collection(db, "users", toUid, "pings"), {
    fromUid,
    fromName,
    message,
    createdAtISO: new Date().toISOString(),
    kind: "nudge",
  });
}

// A pairing invite is still a ping, but a distinct kind — the listener
// shows it as an Accept/Decline card rather than a passing toast, since
// there's a real action attached rather than just an FYI.
export async function sendPairingInvite(
  toUid: string,
  fromUid: string,
  fromName: string,
  pairingCode: string
): Promise<void> {
  await addDoc(collection(db, "users", toUid, "pings"), {
    fromUid,
    fromName,
    message: "wants to train together",
    createdAtISO: new Date().toISOString(),
    kind: "pairing_invite",
    pairingCode,
  });
}

export function listenPings(uid: string, cb: (pings: Ping[]) => void): () => void {
  const q = query(collection(db, "users", uid, "pings"), orderBy("createdAtISO", "desc"), limit(10));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Ping, "id">) })));
  });
}

export async function dismissPing(uid: string, pingId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "pings", pingId));
}

// ---- session history (users/{uid}/sessions) ----
// Firestore rejects undefined values, so optional fields are stripped first.
function withoutUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function saveSessionRecord(uid: string, record: SessionRecord): Promise<void> {
  await addDoc(collection(db, "users", uid, "sessions"), withoutUndefined(record));
}

// Sessions finished in [fromISO, toISO), newest first.
export async function fetchSessionsBetween(uid: string, fromISO: string, toISO: string): Promise<SessionRecord[]> {
  const q = query(
    collection(db, "users", uid, "sessions"),
    where("finishedAt", ">=", fromISO),
    where("finishedAt", "<", toISO),
    orderBy("finishedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SessionRecord) }));
}

// ---- global weekly leaderboard (opt-in) ----
// leaderboard/{weekKey}/entries/{uid}: only what the board shows — a
// shortened name, level and the week's totals — in its own collection, so
// the board can be listed without making profiles listable. The security
// rules check the numbers are plausible (see README).
export interface GlobalBoardRow {
  uid: string;
  displayName: string; // already shortened ("Michele P.")
  level: number;
  week: WeekStats;
}

export interface GlobalBoardWrite {
  displayName: string; // full name; shortened before it's written
  level: number;
  week: WeekStats;
}

const boardDoc = (weekKey: string, uid: string) => doc(db, "leaderboard", weekKey, "entries", uid);

// Writes this week's entry (or none with `null`) and removes the entries for
// the given weeks, so past weeks don't linger.
export async function setGlobalBoardEntry(uid: string, entry: GlobalBoardWrite | null, clearWeekKeys: string[] = []): Promise<void> {
  const keep = entry?.week.key;
  await Promise.all(
    [...new Set(clearWeekKeys)].filter((k) => k !== keep).map((k) => deleteDoc(boardDoc(k, uid)).catch(() => {}))
  );
  if (entry) {
    const { week } = entry;
    await setDoc(boardDoc(week.key, uid), {
      name: boardName(entry.displayName),
      level: entry.level,
      sessions: week.sessions,
      minutes: week.minutes,
      verified: week.verified,
      xp: week.xp,
    });
  }
}

export async function fetchGlobalBoard(weekKey: string, metric: Metric, count: number): Promise<GlobalBoardRow[]> {
  const snap = await getDocs(query(collection(db, "leaderboard", weekKey, "entries"), orderBy(metric, "desc"), limit(count)));
  return snap.docs.map((d) => {
    const e = d.data() as { name?: string; level?: number; sessions: number; minutes: number; verified: number; xp: number };
    return {
      uid: d.id,
      displayName: e.name ?? "Athlete",
      level: e.level ?? 1,
      week: { key: weekKey, sessions: e.sessions, minutes: e.minutes, verified: e.verified, xp: e.xp },
    };
  });
}

// Corrects a logged session (e.g. a "too hard" that was really done).
export async function updateSessionRecord(uid: string, sessionId: string, fields: Pick<SessionRecord, "exercises" | "xp">): Promise<void> {
  await updateDoc(doc(db, "users", uid, "sessions", sessionId), withoutUndefined(fields));
}

// ---- push notification tokens (one per device) ----
// Kept in the user's private document; only the server (with its service
// account) reads them, to send pushes. The time zone lets reminders arrive
// at the athlete's own local time.
export async function addPushToken(uid: string, token: string, tz: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { pushTokens: arrayUnion(token), "notifications.tz": tz });
}

export async function removePushToken(uid: string, token: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { pushTokens: arrayRemove(token) });
}
