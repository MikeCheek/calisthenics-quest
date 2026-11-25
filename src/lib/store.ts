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
  getAggregateFromServer,
  getDocFromCache,
  getDocsFromCache,
  type DocumentData,
  sum,
  count,
  deleteField,
  serverTimestamp,
  documentId,
  increment,
} from "firebase/firestore";
import type { CachedPark, OsmCell, ParkReport, ParkStats, Reaction, UserParkDoc } from "./parks";
import { FEED_PER_FRIEND, type FeedItem } from "./feed";
import { boardName, Metric } from "./leaderboard";
import { db } from "./firebase";
import { isOffline } from "./offlineWrites";
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

// Offline, read the copy on the device (it includes saves still waiting to
// be sent); asking the server could hang until the connection is back.
const readDoc = <T,>(ref: Parameters<typeof getDoc<T, DocumentData>>[0]) => (isOffline() ? getDocFromCache(ref) : getDoc(ref));
const readDocs = <T,>(q: Parameters<typeof getDocs<T, DocumentData>>[0]) => (isOffline() ? getDocsFromCache(q) : getDocs(q));

export async function fetchUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await readDoc(doc(db, "users", uid));
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
  skillMastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  extra: Partial<UserDoc> = {}
): Promise<void> {
  await updateDoc(doc(db, "users", uid), withoutUndefined({ body, skills, equipment, goalTracks, skillMastery, onboarded: true, ...extra }));
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
export async function sendPing(
  toUid: string,
  fromUid: string,
  fromName: string,
  message: string,
  nudge?: { id: string; vars: Record<string, string | number> }
): Promise<void> {
  await addDoc(collection(db, "users", toUid, "pings"), {
    fromUid,
    fromName,
    message,
    ...(nudge ? { nudge } : {}),
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

// A one-tap answer to a friend's nudge (NUDGE_REPLIES in nudges.ts).
export async function sendNudgeReply(toUid: string, fromUid: string, fromName: string, reply: string, englishText: string): Promise<void> {
  await addDoc(collection(db, "users", toUid, "pings"), {
    fromUid,
    fromName,
    message: englishText,
    reply,
    createdAtISO: new Date().toISOString(),
    kind: "nudge_reply",
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
  const snap = await readDocs(q);
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

// ---- monthly community events (events.ts) ----
// One number per player per month; the total is summed by Firestore, so
// nobody downloads anyone else's entry.
export async function setEventContribution(eventKey: string, uid: string, value: number): Promise<void> {
  await setDoc(doc(db, "events", eventKey, "players", uid), { value, updatedAtISO: new Date().toISOString() });
}

export async function fetchEventTotals(eventKey: string): Promise<{ total: number; players: number }> {
  const snap = await getAggregateFromServer(query(collection(db, "events", eventKey, "players"), where("value", ">", 0)), {
    total: sum("value"),
    players: count(),
  });
  return { total: snap.data().total ?? 0, players: snap.data().players ?? 0 };
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

// ---- bar parks (parks.ts) ----
// parks/{id} holds parks athletes added (OpenStreetMap ones need no doc);
// parks/{id}/reports/{uid} is each athlete's one report of what's there.

export async function fetchUserParks(cells: string[]): Promise<UserParkDoc[]> {
  const chunks = Array.from({ length: Math.ceil(cells.length / 10) }, (_, i) => cells.slice(i * 10, i * 10 + 10));
  const snaps = await Promise.all(chunks.map((c) => getDocs(query(collection(db, "parks"), where("cell", "in", c)))));
  return snaps.flatMap((snap) => snap.docs.map((d) => ({ ...(d.data() as Omit<UserParkDoc, "id">), id: d.id })));
}

// a park's name or position, changed by an athlete: an added park's own
// doc, or a doc of edits laid over an OpenStreetMap park
export async function saveParkEdit(
  park: { id: string; source: "user" | "osm" },
  fields: { name: string; lat: number; lon: number; cell: string },
  editor: { uid: string; name: string }
): Promise<void> {
  const ref = doc(db, "parks", park.id);
  const edit = { ...fields, editedBy: editor.uid, editedByName: editor.name, editedAtISO: new Date().toISOString() };
  // Firestore checks the rules before it knows a doc is missing, so an
  // update of a doc that isn't there fails as "permission denied", not
  // "not found": look first, then create or update
  const exists = (await getDoc(ref)).exists();
  if (exists) await updateDoc(ref, edit);
  else if (park.source === "osm") await setDoc(ref, { ...edit, source: "osm", createdBy: editor.uid, createdAtISO: edit.editedAtISO });
  else throw new Error("park not found");
}

// ---- park likes, visits and their public counts ----
// parks/{id}/likes/{uid} and parks/{id}/trained/{uid} are one per athlete;
// parkStats/{id} holds the counts ({ likes, people }) so lists can show them
// without counting. A count changes in the same batch as the like or visit,
// and the rules only allow +1/−1 that matches it.

export async function fetchParkStats(ids: string[]): Promise<Record<string, ParkStats>> {
  const out: Record<string, ParkStats> = {};
  const unique = [...new Set(ids)];
  for (let i = 0; i < unique.length; i += 10) {
    const snap = await getDocs(query(collection(db, "parkStats"), where(documentId(), "in", unique.slice(i, i + 10)))).catch(() => null);
    snap?.docs.forEach((d) => (out[d.id] = { likes: Math.max(0, d.data().likes ?? 0), people: Math.max(0, d.data().people ?? 0) }));
  }
  return out;
}

// whether you like a park, and how many sessions you've logged there
export async function fetchMyPark(parkId: string, uid: string): Promise<{ liked: boolean; sessions: number }> {
  const [like, visit] = await Promise.all([getDoc(doc(db, "parks", parkId, "likes", uid)).catch(() => null), getDoc(doc(db, "parks", parkId, "trained", uid)).catch(() => null)]);
  return { liked: !!like?.exists(), sessions: visit?.exists() ? visit.data().sessions ?? 0 : 0 };
}

export async function setParkLike(parkId: string, uid: string, on: boolean): Promise<void> {
  const ref = doc(db, "parks", parkId, "likes", uid);
  const had = (await getDoc(ref)).exists();
  if (had === on) return;
  const batch = writeBatch(db);
  if (on) batch.set(ref, { atISO: new Date().toISOString() });
  else batch.delete(ref);
  batch.set(doc(db, "parkStats", parkId), { likes: increment(on ? 1 : -1) }, { merge: true });
  await batch.commit();
}

// a session logged at a park: one visit per athlete, counted once
export async function recordParkVisit(parkId: string, uid: string): Promise<void> {
  const ref = doc(db, "parks", parkId, "trained", uid);
  const now = new Date().toISOString();
  const snap = await getDoc(ref);
  const batch = writeBatch(db);
  if (snap.exists()) batch.update(ref, { sessions: increment(1), lastISO: now });
  else {
    batch.set(ref, { sessions: 1, firstISO: now, lastISO: now });
    batch.set(doc(db, "parkStats", parkId), { people: increment(1) }, { merge: true });
  }
  await batch.commit();
}

// ---- the shared OpenStreetMap cache (parks.ts: loadOsmParks) ----
export async function fetchOsmCells(cells: string[]): Promise<OsmCell[]> {
  const snaps = await Promise.all(cells.map((c) => getDoc(doc(db, "osmCache", c)).catch(() => null)));
  return snaps.flatMap((snap) => {
    const d = snap?.exists() ? (snap.data() as { parks: CachedPark[]; fetchedAt?: { toDate(): Date } }) : null;
    return d && snap ? [{ cell: snap.id, parks: d.parks ?? [], fetchedAtISO: d.fetchedAt?.toDate().toISOString() ?? new Date(0).toISOString() }] : [];
  });
}

export async function saveOsmCells(cells: OsmCell[]): Promise<void> {
  // one by one: the rules refuse a cell refreshed in the last day, and that
  // mustn't stop the others
  await Promise.all(cells.map((c) => setDoc(doc(db, "osmCache", c.cell), { cell: c.cell, parks: c.parks.slice(0, 400), fetchedAt: serverTimestamp() }).catch(() => {})));
}

export async function addUserPark(park: Omit<UserParkDoc, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "parks"), park);
  return ref.id;
}

export async function fetchParkReports(parkId: string): Promise<ParkReport[]> {
  const snap = await getDocs(query(collection(db, "parks", parkId, "reports"), orderBy("atISO", "desc"), limit(30)));
  return snap.docs.map((d) => d.data() as ParkReport);
}

// your report replaces your last one; reactions others left on it are kept
export async function saveParkReport(parkId: string, report: Omit<ParkReport, "reactions">): Promise<void> {
  await setDoc(doc(db, "parks", parkId, "reports", report.uid), withoutUndefined(report), { merge: true });
}

export async function deleteParkReport(parkId: string, uid: string): Promise<void> {
  await deleteDoc(doc(db, "parks", parkId, "reports", uid));
}

export async function reactToParkReport(parkId: string, authorUid: string, reactorUid: string, reaction: Reaction | null): Promise<void> {
  await updateDoc(doc(db, "parks", parkId, "reports", authorUid), { [`reactions.${reactorUid}`]: reaction ?? deleteField() });
}

// ---- the crew's activity feed (feed.ts) ----
// users/{uid}/feed: your finished sessions, readable by your friends.

export async function addFeedItem(uid: string, item: Omit<FeedItem, "id">): Promise<void> {
  await addDoc(collection(db, "users", uid, "feed"), withoutUndefined(item));
}

export async function fetchFeed(friendUids: string[], sinceISO: string): Promise<FeedItem[]> {
  const lists = await Promise.all(
    friendUids.slice(0, 30).map((f) =>
      getDocs(query(collection(db, "users", f, "feed"), where("createdAtISO", ">=", sinceISO), orderBy("createdAtISO", "desc"), limit(FEED_PER_FRIEND)))
        .then((snap) => snap.docs.map((d) => ({ ...(d.data() as Omit<FeedItem, "id">), id: d.id })))
        .catch(() => [] as FeedItem[]) // a friend who removed you, or who turned sharing off
    )
  );
  return lists.flat();
}

export async function setKudos(authorUid: string, itemId: string, giverUid: string, giverName: string | null): Promise<void> {
  await updateDoc(doc(db, "users", authorUid, "feed", itemId), { [`kudos.${giverUid}`]: giverName ?? deleteField() });
}

export async function sendKudosPing(toUid: string, fromUid: string, fromName: string): Promise<void> {
  await addDoc(collection(db, "users", toUid, "pings"), {
    fromUid,
    fromName,
    message: "gave you kudos",
    createdAtISO: new Date().toISOString(),
    kind: "kudos",
  });
}

export async function deleteMyFeed(uid: string): Promise<void> {
  const snap = await getDocs(collection(db, "users", uid, "feed"));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
