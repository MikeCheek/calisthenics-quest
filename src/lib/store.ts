import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
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
  const existing = userSnap.exists() ? (userSnap.data() as UserDoc).friendCode : undefined;
  if (existing) {
    await syncPublicProfile({ uid, displayName, photoURL, friendCode: existing, level, streak });
    return existing;
  }

  // generate + reserve a unique code, retrying on the rare collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateShortCode();
    const codeSnap = await getDoc(doc(db, "usercodes", code));
    if (codeSnap.exists()) continue;
    await setDoc(doc(db, "usercodes", code), { uid });
    await updateDoc(doc(db, "users", uid), { friendCode: code });
    await syncPublicProfile({ uid, displayName, photoURL, friendCode: code, level, streak });
    return code;
  }
  throw new Error("Could not generate a unique friend code — please try again.");
}

export async function lookupUidByFriendCode(code: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "usercodes", code.toUpperCase()));
  if (!snap.exists()) return null;
  return (snap.data() as { uid: string }).uid;
}

export async function fetchPublicProfile(uid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(db, "profiles", uid));
  if (!snap.exists()) return null;
  return snap.data() as PublicProfile;
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
