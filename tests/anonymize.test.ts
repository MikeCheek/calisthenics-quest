import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ANON_NAME, anonymizeFeedItem, anonymizeParkReport, anonymizePublicProfile, anonymizeSession, anonymizeUserDoc, isAnonymized, nameFor, toDay, toMonth } from "../src/lib/anonymize";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, type SessionRecord, type UserDoc } from "../src/lib/types";
import { translate } from "../src/lib/i18n/tx";

const PII = ["Giulia", "Rossi", "giulia@example.com", "https://photo.example/g.jpg", "Europe/Rome", "tok-123", "GIU123", "Monday hill reps"];

const user = {
  uid: "u1",
  displayName: "Giulia Rossi",
  email: "giulia@example.com",
  photoURL: "https://photo.example/g.jpg",
  body: { ageYears: 31, weightKg: 58, heightCm: 165, sex: "female", experienceYears: 2, trainingDaysPerWeek: 3, trainingDaysOfWeek: [1, 3, 5], sessionLengthMinutes: 45 },
  skills: DEFAULT_SKILLS,
  skillMastery: {},
  equipment: DEFAULT_EQUIPMENT,
  goalTracks: ["frontLever"],
  onboarded: true,
  xp: 4200,
  level: 12,
  streak: 9,
  lastSessionDateISO: "2026-11-22T18:47:13.512Z",
  totalSessionsCompleted: 87,
  missions: [],
  xpHistory: [{ dateISO: "2026-11-22T18:47:13.512Z", xp: 4200 }],
  weightLog: [{ dateISO: "2026-11-01", kg: 58 }],
  customWorkouts: [{ id: "w1", name: "Monday hill reps", items: [], warmup: true, createdAt: "2026-10-01T10:00:00Z" }],
  notifications: { enabled: true, time: "18:00", tz: "Europe/Rome" },
  friendCode: "GIU123",
  createdAt: "2025-03-14T09:12:00Z",
  achievements: { "sessions-50": "2026-08-14T19:02:00Z" },
  records: { "pull-ups": { name: "Pull-ups", reps: 14, dateISO: "2026-10-02T18:00:00Z" } },
  pushTokens: ["tok-123"],
  someFieldAddedLater: "Giulia's secret",
} as unknown as UserDoc;

test("the profile keeps training numbers and nothing that identifies the person", () => {
  const a = anonymizeUserDoc(user, new Date("2026-11-23T12:00:00Z"));
  const json = JSON.stringify(a);
  for (const p of PII) assert.ok(!json.includes(p), `still has ${p}`);
  assert.ok(!json.includes("someFieldAddedLater"), "unknown fields are dropped (whitelist)");
  assert.equal(a.uid, "u1"); // links keep working
  assert.equal(a.displayName, ANON_NAME);
  assert.equal(a.email, "");
  assert.equal(a.photoURL, undefined);
  assert.deepEqual(a.body, { experienceYears: 2, trainingDaysPerWeek: 3, sessionLengthMinutes: 45 }); // no age, weight, height, sex, weekdays
  assert.equal(a.weightLog, undefined);
  assert.equal(a.customWorkouts, undefined);
  assert.deepEqual(a.notifications, { enabled: false, time: "18:00" });
  assert.equal(a.xp, 4200);
  assert.equal(a.totalSessionsCompleted, 87);
  assert.equal(a.lastSessionDateISO, "2026-11-22T00:00:00.000Z");
  assert.equal(a.createdAt, "2025-03");
  assert.equal(a.achievements!["sessions-50"], "2026-08");
  assert.equal(a.records!["pull-ups"].reps, 14);
  assert.equal(a.records!["pull-ups"].dateISO, "2026-10-02T00:00:00.000Z");
  assert.deepEqual(a.anonymized, { month: "2026-11", reason: "account-deletion" });
  assert.equal(a.globalBoard, false);
  assert.equal(a.shareActivity, false);
  assert.ok(isAnonymized(a));
  assert.ok(!isAnonymized(user));
});

test("public profile, sessions, feed and park reports lose names, notes and exact times", () => {
  const p = anonymizePublicProfile({ ...user, week: undefined });
  assert.ok(!JSON.stringify(p).includes("Giulia") && !JSON.stringify(p).includes("photo"));
  assert.equal(p.deleted, true);
  assert.equal(p.friendCode, "");

  const s = anonymizeSession({
    finishedAt: "2026-11-22T18:47:13.512Z",
    focusLabel: "Front Lever",
    xp: 150,
    exercises: [{ name: "Pull-ups", setTitle: "Strength", outcome: "done", detail: "3 x 8", fatigue: 0.4, extra: "x" } as never],
  } as SessionRecord);
  assert.equal(s.finishedAt, "2026-11-22T00:00:00.000Z");
  assert.deepEqual(s.exercises[0], { name: "Pull-ups", setTitle: "Strength", outcome: "done", detail: "3 x 8" });

  const f = anonymizeFeedItem({ uid: "u1", name: "Giulia", focusLabel: "Pull", xp: 1, exercises: 1, records: [], streak: 2, createdAtISO: "2026-11-22T18:47:13Z", kudos: { u2: "Marco" } });
  assert.equal(f.name, ANON_NAME);
  assert.deepEqual(f.kudos, { u2: "Marco" }); // kudos from others stay theirs
  assert.equal(f.createdAtISO, "2026-11-22T00:00:00.000Z");

  const r = anonymizeParkReport({ uid: "u1", name: "Giulia", kit: { pullUpBar: true, rings: false }, note: "I'm here every Monday 7am", atISO: "2026-11-20T07:03:00Z", reactions: { u2: "fire" } });
  assert.deepEqual(r, { uid: "u1", name: ANON_NAME, kit: { pullUpBar: true, rings: false }, atISO: "2026-11-20T00:00:00.000Z", reactions: { u2: "fire" } });
});

test("dates are coarsened safely", () => {
  assert.equal(toDay("2026-01-05T23:59:59Z"), "2026-01-05T00:00:00.000Z");
  assert.equal(toMonth("2026-01-05T23:59:59Z"), "2026-01");
  assert.equal(toDay("nonsense"), undefined);
  assert.equal(toDay(undefined), undefined);
});

test("the anonymous name is shown translated; real names never go through the translator", () => {
  const tx = (s: string) => translate("it", s);
  assert.equal(nameFor(ANON_NAME, tx), "Ex atleta");
  assert.equal(nameFor("Rest", tx), "Rest");
});

test("deleting an account anonymises instead of deleting the training data", () => {
  const src = readFileSync("src/lib/account.ts", "utf8");
  const body = src.slice(src.indexOf("export async function deleteAccount"), src.indexOf("async function writeInChunks"));
  assert.ok(!/deleteDoc\(doc\(db, "users", uid\)\)/.test(body), "the user doc is rewritten, not deleted");
  assert.ok(!/deleteDoc\(doc\(db, "profiles", uid\)\)/.test(body), "the public profile is rewritten, not deleted");
  assert.ok(!/"sessions"\], id/.test(body), "sessions are rewritten, not deleted");
  assert.ok(!/deleteMyFeed/.test(body), "the feed is rewritten, not deleted");
  for (const f of ["anonymizeUserDoc", "anonymizeSession", "anonymizeFeedItem", "anonymizeParkReport", "anonymizePublicProfile"]) assert.ok(body.includes(f), f);
  // relationships with other people do go
  assert.match(body, /"friends"\], id: uid/);
  assert.match(body, /"usercodes"/);
});
