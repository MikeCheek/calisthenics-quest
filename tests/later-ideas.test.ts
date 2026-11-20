import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCoachContext, MAX_CONTEXT_CHARS } from "../src/lib/coachContext";
import { addToWeek, rankBoard, weeklyChallenge, weekNumber, BoardEntry, boardName, plausibleWeek } from "../src/lib/leaderboard";
import { buildTcx, canExportTcx, tcxFileName } from "../src/lib/workoutExport";
import { silentWavDataUri } from "../src/lib/mediaSession";
import { clipExtension } from "../src/lib/videoProof";
import { DEFAULT_BODY, DEFAULT_EQUIPMENT, DEFAULT_SKILLS, SessionRecord, UserDoc } from "../src/lib/types";

const user = {
  uid: "u1", displayName: "Alex Rivera", email: "alex@example.com", photoURL: "https://x/photo.jpg",
  body: { ...DEFAULT_BODY, ageYears: 31, weightKg: 77 }, skills: { ...DEFAULT_SKILLS, frontLever: "tuck" }, skillMastery: { frontLever: 4 },
  equipment: DEFAULT_EQUIPMENT, goalTracks: ["frontLever"], onboarded: true, xp: 1800, level: 12, streak: 4,
  totalSessionsCompleted: 20, missions: [], xpHistory: [], notifications: { enabled: false, time: "18:00" }, friendCode: "ABC234", createdAt: "",
  claims: { frontLever: { value: "tuck", status: "verified", claimedAt: "", fails: 0 } },
  exerciseStats: { archer_pull_ups: { p: 3, done: 0, skipped: 1, tooHard: 2, last: "" } },
} as unknown as UserDoc;

const session: SessionRecord = {
  finishedAt: "2026-11-18T18:40:00.000Z", focusLabel: "Front Lever", durationMin: 3, xp: 120,
  exercises: [
    { name: "Tuck front lever holds", setTitle: "Main Focus — Front Lever", outcome: "done", sets: [{ holdSec: 12 }] },
    { name: "Archer pull-ups", setTitle: "Accessory — Pull Strength", outcome: "tooHard" },
    { name: "Rows <ring> & bar", setTitle: "Accessory — Pull Strength", outcome: "done" },
  ],
};

test("coach context carries training data, never identity or body stats", () => {
  const ctx = buildCoachContext(user, [session]);
  assert.match(ctx, /Front Lever: Tuck/);
  assert.match(ctx, /Proven in training: Front Lever \(tuck\)/);
  assert.match(ctx, /too hard: Archer pull-ups/);
  assert.match(ctx, /archer pull ups/); // learned struggle
  for (const secret of ["Alex", "alex@example.com", "photo.jpg", "77", "31", "ABC234"]) {
    assert.ok(!ctx.includes(secret), `context leaked ${secret}`);
  }
  assert.ok(buildCoachContext(user, Array(50).fill(session)).length <= MAX_CONTEXT_CHARS);
});

test("weekly totals accumulate and reset on a new week", () => {
  const w1 = addToWeek(undefined, { minutes: 40, xp: 120, verified: 1 }, "2026-W47");
  const w2 = addToWeek(w1, { minutes: 30, xp: 100 }, "2026-W47");
  assert.deepEqual(w2, { key: "2026-W47", sessions: 2, minutes: 70, verified: 1, xp: 220 });
  assert.deepEqual(addToWeek(w2, { minutes: 10 }, "2026-W48"), { key: "2026-W48", sessions: 1, minutes: 10, verified: 0, xp: 0 });
});

test("the challenge rotates by week", () => {
  assert.equal(weekNumber("2026-W47"), 47);
  const seen = new Set(["2026-W44", "2026-W45", "2026-W46", "2026-W47"].map((w) => weeklyChallenge(w).metric));
  assert.equal(seen.size, 4);
});

test("leaderboard: stale weeks count as zero, ties share a rank", () => {
  const wk = "2026-W47";
  const entries: BoardEntry[] = [
    { uid: "a", name: "Ana", isMe: false, week: { key: wk, sessions: 3, minutes: 90, verified: 1, xp: 300 } },
    { uid: "b", name: "Ben", isMe: false, week: { key: "2026-W46", sessions: 9, minutes: 400, verified: 5, xp: 900 } },
    { uid: "me", name: "You", isMe: true, week: { key: wk, sessions: 3, minutes: 60, verified: 2, xp: 250 } },
    { uid: "c", name: "Cy", isMe: false },
  ];
  const board = rankBoard(entries, "sessions", wk);
  assert.deepEqual(board.map((e) => [e.name, e.value, e.rank]), [["You", 3, 1], ["Ana", 3, 1], ["Ben", 0, 3], ["Cy", 0, 3]]);
  assert.equal(rankBoard(entries, "verified", wk)[0].name, "You");
});

test("TCX export: real duration, escaped notes, safe file name", () => {
  const tcx = buildTcx(session);
  assert.ok(tcx.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.match(tcx, /<Id>2026-11-18T18:37:00Z<\/Id>/);
  assert.match(tcx, /<TotalTimeSeconds>180<\/TotalTimeSeconds>/);
  assert.equal((tcx.match(/<Trackpoint>/g) ?? []).length, 4); // minute 0..3
  assert.ok(tcx.includes("Rows &lt;ring&gt; &amp; bar"));
  assert.ok(!tcx.includes("Archer pull-ups")); // only completed work is listed
  assert.equal(tcxFileName(session), "barquests-2026-11-18-front-lever.tcx");
  assert.equal(canExportTcx({ ...session, durationMin: undefined }), false);
});

test("silent keep-alive audio is a valid WAV", () => {
  const b64 = silentWavDataUri().split(",")[1];
  const bytes = Buffer.from(b64, "base64");
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WAVE");
  assert.equal(bytes.readUInt32LE(40), 8000); // 1s of 8 kHz samples
  assert.ok(bytes.subarray(44).every((b) => b === 128)); // silence
});

test("clip file extensions follow the recorded container", () => {
  assert.equal(clipExtension("video/mp4"), "mp4");
  assert.equal(clipExtension("video/webm"), "webm");
});

// ---- global leaderboard ----

test("global board: names shortened for strangers", () => {
  assert.equal(boardName("Michele Pulvirenti"), "Michele P.");
  assert.equal(boardName("Anna Maria de luca"), "Anna L.");
  assert.equal(boardName("Sam"), "Sam");
  assert.equal(boardName("  "), "Athlete");
});

test("global board hides weeks no real athlete could log", () => {
  assert.equal(plausibleWeek({ sessions: 5, minutes: 240, verified: 2, xp: 980 }), true);
  assert.equal(plausibleWeek({ sessions: 80, minutes: 240, verified: 2, xp: 980 }), false);
  assert.equal(plausibleWeek({ sessions: 5, minutes: 9000, verified: 2, xp: 980 }), false);
  assert.equal(plausibleWeek({ sessions: 5, minutes: 240, verified: 2, xp: 999999 }), false);
  assert.equal(plausibleWeek({ sessions: -1, minutes: 0, verified: 0, xp: 0 }), false);
  assert.equal(plausibleWeek({ sessions: Number.NaN, minutes: 0, verified: 0, xp: 0 }), false);
});

test("security rules: nothing private is listable, and the board rules match the app's limits", () => {
  const { readFileSync } = require("node:fs") as typeof import("node:fs");
  const readme = readFileSync("README.md", "utf8");
  const rules = readme.slice(readme.indexOf("rules_version"), readme.indexOf("```", readme.indexOf("rules_version")));
  const block = (name: string) => rules.slice(rules.indexOf(`match /${name}/`), rules.indexOf("match /", rules.indexOf(`match /${name}/`) + 1));
  for (const c of ["profiles", "usercodes", "pairings"]) {
    assert.ok(!/allow read\b/.test(block(c)), `${c} must not allow "read" (that includes listing)`);
    assert.match(block(c), /allow get:/, c);
  }
  assert.match(block("pairings"), /allow list: if request\.auth != null && resource\.data\.hostUid == request\.auth\.uid/);
  const { BOARD_LIMITS } = require("../src/lib/leaderboard") as typeof import("../src/lib/leaderboard");
  for (const [k, max] of Object.entries(BOARD_LIMITS)) {
    assert.ok(rules.includes(`count(request.resource.data.${k}, ${max})`), `rules limit for ${k} should be ${max}`);
  }
  // the developer notes carry the same rules
  const notes = readFileSync("docs/DEVELOPER_NOTES.md", "utf8");
  assert.ok(notes.includes(rules.trim().slice(0, 2000)), "docs/DEVELOPER_NOTES.md rules differ from the README's");
});

test("every reminder line has an Italian version", () => {
  const { REMINDER_LINES } = require("../src/lib/reminderMessages") as typeof import("../src/lib/reminderMessages");
  const { translate } = require("../src/lib/i18n/tx") as typeof import("../src/lib/i18n/tx");
  for (const line of REMINDER_LINES) assert.notEqual(translate("it", line), line, line);
});
