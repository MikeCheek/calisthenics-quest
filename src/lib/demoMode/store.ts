// In-memory stand-in for lib/store.ts, swapped in by next.config.mjs only
// when demo mode is on (see flag.ts). Same functions and signatures; the
// data lives in this module for as long as the tab is open, starting from
// fixture.ts. Nothing is sent anywhere.
//
// tests/demoStore.test.ts checks this module exports everything store.ts
// does, so the swap can't break a screen.

import type { BodyProfile, Friend, Ping, PublicProfile, SessionRecord, SkillMastery, SkillProfile, SkillTrack, StagedSkillKey, TrainingEquipment, UserDoc } from "../types";
import type { GlobalBoardRow, GlobalBoardWrite, PairingDoc } from "../store";
import { boardName } from "../leaderboard";
import type { Metric } from "../leaderboard";
import { DEMO_FRIEND_PROFILES, DEMO_FRIENDS, DEMO_GLOBAL_BOARD, DEMO_UID, demoSessions, demoUserDoc } from "./fixture";

export type { GlobalBoardRow, PairingDoc };

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const pause = () => new Promise((r) => setTimeout(r, 120)); // feel like a network

const state = {
  users: new Map<string, UserDoc>([[DEMO_UID, demoUserDoc()]]),
  profiles: new Map<string, PublicProfile>(DEMO_FRIEND_PROFILES.map((p) => [p.uid, p])),
  friends: [...DEMO_FRIENDS] as Friend[],
  pings: [] as Ping[],
  sessions: demoSessions(),
  pairings: new Map<string, PairingDoc>(),
  // uid -> this week's totals, for players on the global board
  global: new Map<string, GlobalBoardRow>(DEMO_GLOBAL_BOARD.map((r) => [r.uid, r])),
};

const friendListeners = new Set<(f: Friend[]) => void>();
const pingListeners = new Set<(p: Ping[]) => void>();
const emitFriends = () => friendListeners.forEach((cb) => cb(clone(state.friends)));
const emitPings = () => pingListeners.forEach((cb) => cb(clone(state.pings)));

function code(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function fetchUserDoc(uid: string): Promise<UserDoc | null> {
  await pause();
  const u = state.users.get(uid);
  return u ? clone(u) : null;
}

export async function createUserDoc(partial: UserDoc): Promise<void> {
  state.users.set(partial.uid, clone(partial));
}

export async function saveProfile(
  uid: string,
  body: BodyProfile,
  skills: SkillProfile,
  equipment: TrainingEquipment,
  goalTracks: SkillTrack[],
  skillMastery: Partial<Record<StagedSkillKey, SkillMastery>>
): Promise<void> {
  await updateProgress(uid, { body, skills, equipment, goalTracks, skillMastery, onboarded: true });
}

export async function updateProgress(uid: string, fields: Partial<UserDoc>): Promise<void> {
  const u = state.users.get(uid);
  if (u) state.users.set(uid, { ...u, ...clone(fields) });
}

export const generatePairingCode = code;

export async function createPairing(
  hostUid: string,
  hostName: string,
  hostBody: BodyProfile,
  hostSkills: SkillProfile,
  hostEquipment: TrainingEquipment
): Promise<string> {
  const c = code();
  state.pairings.set(c, { code: c, hostUid, hostName, hostBody, hostSkills, hostEquipment, createdAtISO: new Date().toISOString() });
  return c;
}

export async function fetchPairing(c: string): Promise<PairingDoc | null> {
  return clone(state.pairings.get(c.toUpperCase()) ?? null);
}

export async function joinPairing(c: string, guestUid: string, guestName: string, guestBody: BodyProfile, guestSkills: SkillProfile): Promise<void> {
  const p = state.pairings.get(c.toUpperCase());
  if (p) state.pairings.set(p.code, { ...p, guestUid, guestName, guestBody, guestSkills });
}

export async function setPairingBarCount(c: string, barCount: 1 | 2): Promise<void> {
  const p = state.pairings.get(c.toUpperCase());
  if (p) state.pairings.set(p.code, { ...p, barCount });
}

export async function syncPublicProfile(profile: PublicProfile): Promise<void> {
  state.profiles.set(profile.uid, { ...(state.profiles.get(profile.uid) ?? {}), ...clone(profile) });
}

export async function ensureFriendCode(
  uid: string,
  _displayName: string,
  _photoURL: string | undefined,
  _level: number,
  _streak: number
): Promise<string> {
  return state.users.get(uid)?.friendCode || "DEMO42";
}

export async function lookupUidByFriendCode(c: string): Promise<string | null> {
  for (const p of state.profiles.values()) if (p.friendCode === c.toUpperCase()) return p.uid;
  return null;
}

export async function fetchPublicProfile(uid: string): Promise<PublicProfile | null> {
  await pause();
  const p = state.profiles.get(uid);
  return p ? clone(p) : null;
}

export async function addFriend(
  _me: { uid: string; displayName: string; photoURL?: string },
  them: { uid: string; displayName: string; photoURL?: string }
): Promise<void> {
  if (!state.friends.some((f) => f.uid === them.uid)) {
    state.friends.unshift({ uid: them.uid, displayName: them.displayName, addedAtISO: new Date().toISOString() });
    emitFriends();
  }
}

export async function removeFriend(_myUid: string, friendUid: string): Promise<void> {
  state.friends = state.friends.filter((f) => f.uid !== friendUid);
  emitFriends();
}

export function listenFriends(_uid: string, cb: (friends: Friend[]) => void): () => void {
  friendListeners.add(cb);
  cb(clone(state.friends));
  return () => friendListeners.delete(cb);
}

export async function sendPing(
  _toUid: string,
  _fromUid: string,
  _fromName: string,
  _message: string,
  _nudge?: { id: string; vars: Record<string, string | number> }
): Promise<void> {
  // the friend isn't real; nothing to deliver
}

export async function sendPairingInvite(_toUid: string, _fromUid: string, _fromName: string, _pairingCode: string): Promise<void> {}

export function listenPings(_uid: string, cb: (pings: Ping[]) => void): () => void {
  pingListeners.add(cb);
  cb(clone(state.pings));
  return () => pingListeners.delete(cb);
}

export async function dismissPing(_uid: string, pingId: string): Promise<void> {
  state.pings = state.pings.filter((p) => p.id !== pingId);
  emitPings();
}

export async function saveSessionRecord(_uid: string, record: SessionRecord): Promise<void> {
  state.sessions.unshift({ ...clone(record), id: `demo-session-${Date.now()}` });
}

export async function fetchSessionsBetween(_uid: string, fromISO: string, toISO: string): Promise<SessionRecord[]> {
  await pause();
  return clone(state.sessions.filter((s) => s.finishedAt >= fromISO && s.finishedAt < toISO)).sort((a, b) =>
    b.finishedAt.localeCompare(a.finishedAt)
  );
}

export async function setGlobalBoardEntry(uid: string, entry: GlobalBoardWrite | null, _clearWeekKeys: string[] = []): Promise<void> {
  if (!entry) {
    state.global.delete(uid);
    return;
  }
  state.global.set(uid, { uid, displayName: boardName(entry.displayName), level: entry.level, week: clone(entry.week) });
}

export async function fetchGlobalBoard(weekKey: string, metric: Metric, count: number): Promise<GlobalBoardRow[]> {
  await pause();
  return clone([...state.global.values()].filter((r) => r.week.key === weekKey))
    .sort((a, b) => b.week[metric] - a.week[metric])
    .slice(0, count);
}

export async function updateSessionRecord(_uid: string, sessionId: string, fields: Pick<SessionRecord, "exercises" | "xp">): Promise<void> {
  state.sessions = state.sessions.map((s) => (s.id === sessionId ? { ...s, ...clone(fields) } : s));
}

// demo mode never registers for push (no messaging); kept for the same API
export async function addPushToken(_uid: string, _token: string, _tz: string): Promise<void> {}
export async function removePushToken(_uid: string, _token: string): Promise<void> {}
