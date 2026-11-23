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
import { pickNudge, renderNudge } from "../nudges";
import type { ParkReport, Reaction, UserParkDoc } from "../parks";
import type { FeedItem } from "../feed";

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
  skillMastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  extra: Partial<UserDoc> = {}
): Promise<void> {
  await updateProgress(uid, { body, skills, equipment, goalTracks, skillMastery, onboarded: true, ...extra });
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

// The demo friend answers your nudge, then challenges you back — so replies
// and the incoming-nudge card can be tried without a second account.
export async function sendPing(
  toUid: string,
  _fromUid: string,
  _fromName: string,
  _message: string,
  _nudge?: { id: string; vars: Record<string, string | number> }
): Promise<void> {
  const friend = state.friends.find((f) => f.uid === toUid);
  if (!friend) return;
  const first = friend.displayName.split(" ")[0];
  const at = () => new Date().toISOString();
  setTimeout(() => {
    state.pings = [{ id: `demo-ping-${Date.now()}`, fromUid: toUid, fromName: first, message: "💪 On it!", reply: "on-it", kind: "nudge_reply", createdAtISO: at() }, ...state.pings];
    emitPings();
  }, 1500);
  setTimeout(() => {
    const me = state.users.get(DEMO_UID);
    const ctx = { sender: first, name: (me?.displayName ?? "Alex").split(" ")[0], senderWeek: { sessions: 0, xp: 0 }, friendWeek: { sessions: 0, xp: 0 }, senderStreak: 0, friendStreak: 0, friendLevel: 1 };
    const nudge = pickNudge(ctx, { mood: "challenge" });
    state.pings = [{ id: `demo-ping-${Date.now()}`, fromUid: toUid, fromName: first, message: renderNudge("en", nudge) ?? "", nudge, kind: "nudge", createdAtISO: at() }, ...state.pings];
    emitPings();
  }, 4000);
}

export async function sendNudgeReply(_toUid: string, _fromUid: string, _fromName: string, _reply: string, _englishText: string): Promise<void> {
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

// a lively community for the month's event; your own part is added on top
const demoEvent = new Map<string, number>();
export async function setEventContribution(_eventKey: string, uid: string, value: number): Promise<void> {
  demoEvent.set(uid, value);
}
export async function fetchEventTotals(_eventKey: string): Promise<{ total: number; players: number }> {
  await pause();
  const mine = [...demoEvent.values()].reduce((a, b) => a + b, 0);
  return { total: 287 + mine, players: 41 + demoEvent.size };
}

// demo mode never registers for push (no messaging); kept for the same API
export async function addPushToken(_uid: string, _token: string, _tz: string): Promise<void> {}
export async function removePushToken(_uid: string, _token: string): Promise<void> {}

// ---- bar parks: in memory for the visit ----
const demoParks = new Map<string, UserParkDoc>();
const demoReports = new Map<string, Map<string, ParkReport>>();
const reportsOf = (id: string) => demoReports.get(id) ?? demoReports.set(id, new Map()).get(id)!;

export async function fetchUserParks(cells: string[]): Promise<UserParkDoc[]> {
  await pause();
  return [...demoParks.values()].filter((p) => cells.includes(p.cell)).map(clone);
}
export async function addUserPark(park: Omit<UserParkDoc, "id">): Promise<string> {
  const id = `u-${code().toLowerCase()}`;
  demoParks.set(id, { ...clone(park), id });
  return id;
}
export async function fetchParkReports(parkId: string): Promise<ParkReport[]> {
  await pause();
  const mine = [...reportsOf(parkId).values()];
  // a friend has been there before you, so the park isn't empty
  const seed: ParkReport[] = reportsOf(parkId).has("demo-friend-park")
    ? []
    : [{ uid: "demo-friend-park", name: "Giulia", kit: { pullUpBar: true, parallelBars: true }, note: "Bars are solid, a bit busy after 6pm.", atISO: new Date(Date.now() - 4 * 86400000).toISOString() }];
  return clone([...mine, ...seed].sort((a, b) => b.atISO.localeCompare(a.atISO)));
}
export async function saveParkReport(parkId: string, report: Omit<ParkReport, "reactions">): Promise<void> {
  const prev = reportsOf(parkId).get(report.uid);
  reportsOf(parkId).set(report.uid, { ...clone(report), reactions: prev?.reactions });
}
export async function deleteParkReport(parkId: string, uid: string): Promise<void> {
  reportsOf(parkId).delete(uid);
}
export async function reactToParkReport(parkId: string, authorUid: string, reactorUid: string, reaction: Reaction | null): Promise<void> {
  const r = reportsOf(parkId).get(authorUid) ?? (authorUid === "demo-friend-park" ? (await fetchParkReports(parkId)).find((x) => x.uid === authorUid) : undefined);
  if (!r) return;
  const reactions = { ...(r.reactions ?? {}) };
  if (reaction) reactions[reactorUid] = reaction;
  else delete reactions[reactorUid];
  reportsOf(parkId).set(authorUid, { ...r, reactions });
}

// ---- the crew's feed: friends' recent sessions, plus yours ----
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const demoFeed = new Map<string, FeedItem[]>(
  DEMO_FRIENDS.map((f, i) => {
    const name = f.displayName.split(" ")[0];
    const items: FeedItem[] = [
      { id: `f${i}a`, uid: f.uid, name, focusLabel: ["Front Lever", "Handstand", "Muscle-up"][i % 3], minutes: 38 + i * 6, xp: 140 + i * 20, exercises: 7, records: i === 0 ? ["Tuck front lever holds"] : [], streak: 4 + i, createdAtISO: hoursAgo(3 + i * 9), kudos: i === 0 ? { "demo-g-lena": "Lena" } : {} },
      { id: `f${i}b`, uid: f.uid, name, focusLabel: ["Pull", "Legs", "Core"][i % 3], minutes: 30, xp: 110, exercises: 6, records: [], streak: 3 + i, createdAtISO: hoursAgo(30 + i * 14) },
    ];
    return [f.uid, items];
  })
);
export async function addFeedItem(uid: string, item: Omit<FeedItem, "id">): Promise<void> {
  const list = demoFeed.get(uid) ?? [];
  demoFeed.set(uid, [{ ...clone(item), id: `me-${Date.now()}` }, ...list]);
}
export async function fetchFeed(friendUids: string[], sinceISO: string): Promise<FeedItem[]> {
  await pause();
  return clone(friendUids.flatMap((u) => (demoFeed.get(u) ?? []).filter((i) => i.createdAtISO >= sinceISO)));
}
export async function setKudos(authorUid: string, itemId: string, giverUid: string, giverName: string | null): Promise<void> {
  const item = demoFeed.get(authorUid)?.find((i) => i.id === itemId);
  if (!item) return;
  const kudos = { ...(item.kudos ?? {}) };
  if (giverName) kudos[giverUid] = giverName;
  else delete kudos[giverUid];
  item.kudos = kudos;
}
export async function sendKudosPing(toUid: string, _fromUid: string, _fromName: string): Promise<void> {
  // the friend gives kudos back, so the toast shows in the demo
  const friend = state.friends.find((f) => f.uid === toUid);
  if (!friend) return;
  setTimeout(() => {
    state.pings = [{ id: `demo-ping-${Date.now()}`, fromUid: toUid, fromName: friend.displayName.split(" ")[0], message: "gave you kudos", kind: "kudos", createdAtISO: new Date().toISOString() }, ...state.pings];
    emitPings();
  }, 1500);
}
export async function deleteMyFeed(uid: string): Promise<void> {
  demoFeed.delete(uid);
}
