import { test } from "node:test";
import assert from "node:assert/strict";
import { libraryEntries } from "../src/lib/exerciseLibrary";
import { statKey } from "../src/lib/adaptation";
import { SPORTS, EXTRA_SPORTS, newTrack, sportExercises } from "../src/lib/sports";
import { demoUserDoc } from "../src/lib/demoMode/fixture";
import { WEIGHT_LOG_MAX } from "../src/lib/bodyweight";
import { SKILL_HISTORY_MAX } from "../src/lib/skillHistory";
import { EFFORT_HISTORY } from "../src/lib/effort";
import { LENGTH_HISTORY } from "../src/lib/sessionLength";
import { MAX_SAVED_WORKOUTS, MAX_ITEMS } from "../src/lib/customSession";
import { MAX_FAVS } from "../src/lib/parks";
import { SKILL_FIELD_LABEL, type ExerciseStat, type ExerciseBest, type UserDoc } from "../src/lib/types";

// Firestore refuses documents over 1 MiB. Everything that grows in the user
// document has a cap; this builds the worst case — every list at its cap,
// every exercise of every sport with full stats and a record — and checks it
// stays well clear of the limit. Raising a cap, or adding a list without
// one, shows up here.
const LIMIT = 1_048_576;
const BUDGET = LIMIT / 2; // keep half the room free

const iso = "2026-11-26T18:40:12.345Z";
const fullStat = (): ExerciseStat => ({ p: -2.5, done: 999, skipped: 99, tooHard: 99, rd: -1, rr: [1.12, 0.94, 1.05, 0.88, 1.2], hr: [0.82, 0.91, 0.77, 1.0, 0.95], rp: [0.9, 1.1, 1.0, 0.95, 1.05], lastSets: "12·11·10·9·8 reps", lastAt: iso, last: iso });
const fullBest = (name: string): ExerciseBest => ({ name, reps: 25, hold: 60, dateISO: iso });
const statsAndRecords = (names: string[]) => ({
  exerciseStats: Object.fromEntries(names.map((n) => [statKey(n), fullStat()])),
  records: Object.fromEntries(names.map((n) => [statKey(n), fullBest(n)])),
});

// Firestore's size: field names and string values count by their bytes, plus
// small per-field overheads — the JSON length is a close, slightly high stand-in
const size = (v: unknown) => Buffer.byteLength(JSON.stringify(v), "utf8");

test("a user document at every cap stays under half of Firestore's 1 MiB", () => {
  const cali = statsAndRecords(libraryEntries().map((e) => e.exercise.name));
  const sports = Object.fromEntries(
    EXTRA_SPORTS.map((s) => {
      const def = SPORTS[s];
      const names = sportExercises(def).map((x) => x.exercise.name);
      return [s, { ...newTrack(def, "experienced", def.skills.slice(0, 3).map((k) => k.key), 60), ...statsAndRecords(names), xp: 999999, sessions: 9999 }];
    })
  );
  const day = (i: number) => new Date(Date.UTC(2025, 0, 1) + i * 86400000).toISOString().slice(0, 10);
  const everySkill = Object.fromEntries(Object.keys(SKILL_FIELD_LABEL).map((k) => [k, "advTuck"]));
  const doc: UserDoc = {
    ...demoUserDoc(),
    ...cali,
    sports,
    weightLog: Array.from({ length: WEIGHT_LOG_MAX }, (_, i) => ({ date: day(i), kg: 72.4 })),
    skillHistory: Array.from({ length: SKILL_HISTORY_MAX }, () => ({ at: iso, skills: everySkill })),
    lengthHistory: Array.from({ length: LENGTH_HISTORY }, () => ({ at: iso, planned: 120, done: 0.67, sport: "pilates" as const })),
    effortHistory: Array.from({ length: EFFORT_HISTORY }, () => ({ at: iso, planned: 120, done: 110, tired: false })),
    customWorkouts: Array.from({ length: MAX_SAVED_WORKOUTS }, (_, i) => ({ id: `w-${i}-abcdef`, name: "My long session name here", items: Array.from({ length: MAX_ITEMS }, () => ({ name: "Archer pull-ups", sets: 5 })), warmup: true, createdAt: iso })),
    favParks: Array.from({ length: MAX_FAVS }, (_, i) => ({ id: `osm-n${1000000 + i}`, name: "Parco della Musica street workout", lat: 41.9, lon: 12.5, source: "osm" as const })),
    xpHistory: Array.from({ length: 30 }, () => ({ dateISO: iso, xp: 999999 })),
    skippedDays: Array.from({ length: 14 }, (_, i) => day(i)),
  } as UserDoc;
  const total = size(doc);
  const parts = Object.entries(doc).map(([k, v]) => [k, size(v)] as const).sort((a, b) => b[1] - a[1]).slice(0, 5);
  assert.ok(total < BUDGET, `worst-case user document is ${Math.round(total / 1024)} KiB (largest: ${parts.map(([k, v]) => `${k} ${Math.round(v / 1024)} KiB`).join(", ")})`);
  console.log(`# worst case: ${Math.round(total / 1024)} KiB — ${parts.map(([k, v]) => `${k} ${Math.round(v / 1024)}`).join(", ")}`);
});
