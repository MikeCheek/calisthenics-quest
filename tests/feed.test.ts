import { test } from "node:test";
import assert from "node:assert/strict";
import { feedItemFor, firstName, kudosLine, mergeFeed, sharesActivity, type FeedItem } from "../src/lib/feed";
import type { SessionRecord } from "../src/lib/types";
import { translate } from "../src/lib/i18n/tx";

const record = {
  finishedAt: "2026-11-23T18:40:00Z",
  focusLabel: "Front Lever",
  durationMin: 41.6,
  xp: 150,
  paired: true,
  exercises: [
    { name: "Tuck front lever holds", setTitle: "Skill", outcome: "done", detail: "4 x 10s" },
    { name: "Pull-ups", setTitle: "Strength", outcome: "skipped", detail: "3 x 8" },
  ],
  records: [{ name: "Tuck front lever holds", kind: "hold", value: 14, previous: 11 }],
} as SessionRecord;

test("a finished session becomes a short feed line — nothing else", () => {
  const item = feedItemFor({ uid: "u1", displayName: "Giulia Rossi" }, record, 6);
  assert.deepEqual(item, {
    uid: "u1",
    name: "Giulia",
    focusLabel: "Front Lever",
    minutes: 42,
    xp: 150,
    exercises: 1,
    records: ["Tuck front lever holds"],
    streak: 6,
    paired: true,
    createdAtISO: "2026-11-23T18:40:00Z",
  });
  assert.equal(firstName(undefined), "Athlete");
});

test("sharing is on by default, off when turned off, and never for guests", () => {
  assert.equal(sharesActivity({ friendCode: "ABC123" }), true);
  assert.equal(sharesActivity({ friendCode: "ABC123", shareActivity: false }), false);
  assert.equal(sharesActivity({}), false);
});

const item = (uid: string, id: string, hoursAgo: number, kudos?: Record<string, string>): FeedItem => ({
  id,
  uid,
  name: uid,
  focusLabel: "Pull",
  xp: 100,
  exercises: 5,
  records: [],
  streak: 1,
  createdAtISO: new Date(Date.UTC(2026, 10, 23, 12) - hoursAgo * 3600000).toISOString(),
  kudos,
});

test("the feed: newest first, last two weeks, no duplicates", () => {
  const now = new Date(Date.UTC(2026, 10, 23, 12));
  const f = mergeFeed([[item("a", "1", 5), item("b", "1", 1), item("a", "2", 24 * 20)], [item("a", "1", 5)]], now);
  assert.deepEqual(
    f.map((i) => `${i.uid}/${i.id}`),
    ["b/1", "a/1"]
  );
});

test("who gave kudos: you first, then two names and a count", () => {
  assert.deepEqual(kudosLine(item("a", "1", 1, { x: "Lena", me: "Me", y: "Omar", z: "Yuki" }), "me"), { names: ["You", "Lena"], more: 2 });
  assert.deepEqual(kudosLine(item("a", "1", 1), "me"), { names: [], more: 0 });
});

test("feed copy is in Italian, kudos stays kudos", () => {
  assert.equal(translate("it", "{name} gave you kudos 👏", { name: "Sara" }), "Sara ti ha dato kudos 👏");
  for (const p of ["Crew activity", "Share sessions with friends", "Give {name} kudos"]) assert.notEqual(translate("it", p), p);
});

test("a yoga or Pilates session says its sport; calisthenics posts stay as they were", () => {
  const yoga = feedItemFor({ uid: "u1", displayName: "Giulia" }, { ...record, focusLabel: "Balance", sport: "yoga" } as SessionRecord, 6);
  assert.equal(yoga.sport, "yoga");
  const cali = feedItemFor({ uid: "u1", displayName: "Giulia" }, { ...record, sport: "calisthenics" } as SessionRecord, 6);
  assert.equal("sport" in cali, false);
});

test("every field a feed post can carry is allowed by the published Firestore rule", async () => {
  const { readFileSync } = await import("node:fs");
  const rules = readFileSync("README.md", "utf8");
  const line = rules.split("\n").find((l) => l.includes("hasOnly(['uid', 'name', 'focusLabel'"))!;
  const allowed = new Set([...line.matchAll(/'([a-zA-Z]+)'/g)].map((m) => m[1]));
  const full = feedItemFor({ uid: "u1", displayName: "Giulia" }, { ...record, sport: "pilates" } as SessionRecord, 6);
  const keys = [...Object.keys(full), "kudos"];
  assert.deepEqual(keys.filter((k) => !allowed.has(k)), []);
  assert.match(rules, /request\.resource\.data\.sport in \['yoga', 'pilates'\]/);
});
