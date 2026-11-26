// Firestore security rules, run against the local emulator:
//   npm run test:rules   (starts the emulator, runs this, stops it)
// Each case is something the app relies on the rules for: private data stays
// private, shared data only takes the fields and values the app writes.
import { test, before, after, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";

let env;
const db = (uid, opts) => (uid ? env.authenticatedContext(uid, opts).firestore() : env.unauthenticatedContext().firestore());
const google = (uid) => db(uid, { firebase: { sign_in_provider: "google.com" } });
const guest = (uid) => db(uid, { firebase: { sign_in_provider: "anonymous" } });
// set up data as an admin (rules off)
const seed = (fn) => env.withSecurityRulesDisabled((ctx) => fn(ctx.firestore()));

before(async () => {
  env = await initializeTestEnvironment({ projectId: "demo-barquests", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const feedItem = (uid, extra = {}) => ({ uid, name: "Giulia", focusLabel: "Balance", minutes: 30, xp: 100, exercises: 5, records: [], streak: 2, createdAtISO: "2026-11-26T10:00:00Z", ...extra });

test("a user's own data is theirs alone", async () => {
  await assertSucceeds(setDoc(doc(google("ann"), "users/ann"), { xp: 1, sports: { yoga: { xp: 1 } }, activeSport: "yoga" }));
  await assertSucceeds(setDoc(doc(google("ann"), "users/ann/sessions/s1"), { focusLabel: "Pull", sport: "yoga" }));
  await assertFails(getDoc(doc(google("bob"), "users/ann")));
  await assertFails(setDoc(doc(google("bob"), "users/ann"), { xp: 9999 }));
  await assertFails(getDoc(doc(google("bob"), "users/ann/sessions/s1")));
  await assertFails(getDoc(doc(db(null), "users/ann")));
});

test("feed posts: fixed fields, sport only yoga or Pilates, friends read, friends only touch their own kudos", async () => {
  await seed((d) => setDoc(doc(d, "users/ann/friends/bob"), { since: 1 }));
  const mine = doc(google("ann"), "users/ann/feed/p1");
  await assertSucceeds(setDoc(mine, feedItem("ann")));
  await assertSucceeds(setDoc(doc(google("ann"), "users/ann/feed/p2"), feedItem("ann", { sport: "yoga" })));
  await assertFails(setDoc(doc(google("ann"), "users/ann/feed/p3"), feedItem("ann", { sport: "crossfit" })));
  await assertFails(setDoc(doc(google("ann"), "users/ann/feed/p4"), feedItem("ann", { email: "x@y" })));
  await assertFails(setDoc(doc(google("ann"), "users/ann/feed/p5"), feedItem("ann", { records: ["a", "b", "c", "d"] })));
  // a friend reads and gives kudos as themselves, nothing else
  await assertSucceeds(getDoc(doc(google("bob"), "users/ann/feed/p1")));
  await assertSucceeds(updateDoc(doc(google("bob"), "users/ann/feed/p1"), { kudos: { bob: "Bob" } }));
  await assertFails(updateDoc(doc(google("bob"), "users/ann/feed/p1"), { kudos: { bob: "Bob", eve: "Eve" } }));
  await assertFails(updateDoc(doc(google("bob"), "users/ann/feed/p1"), { xp: 99999 }));
  // a stranger can't even read it
  await assertFails(getDoc(doc(google("eve"), "users/ann/feed/p1")));
});

test("nudges: only from a friend, as themselves, at most 200 characters", async () => {
  await seed((d) => setDoc(doc(d, "users/ann/friends/bob"), { since: 1 }));
  await assertSucceeds(setDoc(doc(google("bob"), "users/ann/pings/n1"), { fromUid: "bob", message: "Train today?" }));
  await assertFails(setDoc(doc(google("bob"), "users/ann/pings/n2"), { fromUid: "eve", message: "spoofed" }));
  await assertFails(setDoc(doc(google("bob"), "users/ann/pings/n3"), { fromUid: "bob", message: "x".repeat(201) }));
  await assertFails(setDoc(doc(google("eve"), "users/ann/pings/n4"), { fromUid: "eve", message: "hi" }));
  await assertFails(getDoc(doc(google("bob"), "users/ann/pings/n1"))); // only the recipient reads
});

test("public profiles open by id, but can't be listed", async () => {
  await assertSucceeds(setDoc(doc(google("ann"), "profiles/ann"), { displayName: "Ann" }));
  await assertSucceeds(getDoc(doc(google("bob"), "profiles/ann")));
  await assertFails(getDocs(collection(google("bob"), "profiles")));
  await assertFails(setDoc(doc(google("bob"), "profiles/ann"), { displayName: "Hacked" }));
});

test("leaderboard: Google accounts only, as themselves, with values in range", async () => {
  const entry = { name: "Ann", level: 5, sessions: 3, minutes: 120, verified: 1, xp: 500 };
  await assertSucceeds(setDoc(doc(google("ann"), "leaderboard/2026-W48/entries/ann"), entry));
  await assertFails(setDoc(doc(guest("gus"), "leaderboard/2026-W48/entries/gus"), entry));
  await assertFails(setDoc(doc(google("ann"), "leaderboard/2026-W48/entries/bob"), entry));
  await assertFails(setDoc(doc(google("ann"), "leaderboard/2026-W48/entries/ann"), { ...entry, xp: 999999 }));
  await assertFails(setDoc(doc(google("ann"), "leaderboard/not-a-week/entries/ann"), entry));
});

test("parks: likes are one per athlete, as themselves", async () => {
  await assertSucceeds(setDoc(doc(google("ann"), "parks/p1/likes/ann"), { atISO: "2026-11-26" }));
  await assertFails(setDoc(doc(google("ann"), "parks/p1/likes/bob"), { atISO: "2026-11-26" }));
  await assertFails(setDoc(doc(google("ann"), "parks/p1/likes/ann"), { atISO: "2026-11-26", count: 1000 }));
});

test("rate-limit counters are off limits to every client", async () => {
  await assertFails(getDoc(doc(google("ann"), "rateLimits/coach-chat_ann_0")));
  await assertFails(setDoc(doc(google("ann"), "rateLimits/coach-chat_ann_0"), { n: 0 }));
});
