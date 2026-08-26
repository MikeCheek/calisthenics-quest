import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { BodyProfile, SkillProfile, SkillTrack, TrainingEquipment, UserDoc } from "./types";

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
  goalTracks: SkillTrack[]
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { body, skills, equipment, goalTracks, onboarded: true });
}

export async function updateProgress(
  uid: string,
  fields: Partial<UserDoc>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { ...fields });
}

// ---- Pairing ----
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

export function generatePairingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createPairing(
  hostUid: string,
  hostName: string,
  hostBody: BodyProfile,
  hostSkills: SkillProfile,
  hostEquipment: TrainingEquipment
): Promise<string> {
  const code = generatePairingCode();
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
