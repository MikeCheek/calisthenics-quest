import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSession } from "../src/lib/trainingGenerator";
import { fitSessionToMinutes } from "../src/lib/sessionFit";
import { addSkillCheck, checkSpecFor } from "../src/lib/verification";
import { estimateSessionMinutes } from "../src/lib/exerciseTiming";
import { plausibleDuration, recordLastTimes, detectRecords, buildSessionRecord } from "../src/lib/sessionHistory";
import { cleanSets, formatSets, TimerLog } from "../src/lib/timingLearning";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, ExerciseFeedback, SkillTrack } from "../src/lib/types";

const skills = { ...DEFAULT_SKILLS, frontLever: "tuck" as const };
const FOCUSES: SkillTrack[] = ["handstand", "frontLever", "legs", "core", "pushStrength"];

test("sessions fit the chosen length (within the tolerance band)", () => {
  for (const focus of FOCUSES) {
    for (const minutes of [15, 30, 45, 60, 90]) {
      const s = generateSession(skills, DEFAULT_EQUIPMENT, focus, new Date("2026-11-18"), minutes);
      const { minutesAfter } = fitSessionToMinutes(s, minutes);
      assert.ok(
        minutesAfter <= Math.ceil(minutes * 1.15) && minutesAfter >= Math.floor(minutes * 0.8),
        `${focus} @ ${minutes} min gave ${minutesAfter}`
      );
    }
  }
});

test("fitting never removes the Skill Check or the warm-up, and keeps 2+ main exercises", () => {
  const s = addSkillCheck(generateSession(skills, DEFAULT_EQUIPMENT, "frontLever"), checkSpecFor("handstand", "wall"));
  const fitted = fitSessionToMinutes(s, 15).session;
  assert.ok(fitted.sets.some((x) => x.title === "Skill Check"));
  assert.ok(fitted.sets.some((x) => x.title === "Warm-Up"));
  assert.ok(fitted.sets.find((x) => x.title.startsWith("Main Focus"))!.exercises.length >= 2);
  assert.ok(fitted.estXp < s.estXp, "fewer exercises, less estimated XP");
});

test("no preference leaves the session untouched", () => {
  const s = generateSession(skills, DEFAULT_EQUIPMENT, "core");
  const r = fitSessionToMinutes(s, undefined);
  assert.equal(r.session, s);
  assert.equal(r.minutesAfter, estimateSessionMinutes(s));
});

test("durations outside 3–240 min are treated as unknown", () => {
  const now = Date.now();
  assert.equal(plausibleDuration(now - 45 * 60000, now), 45);
  assert.equal(plausibleDuration(now - 60000, now), undefined);
  assert.equal(plausibleDuration(now - 10 * 3600000, now), undefined);
  assert.equal(plausibleDuration(null, now), undefined);
});

test("only trustworthy sets are kept for history", () => {
  const log: TimerLog = {
    workPauses: 0,
    rests: [],
    sets: [
      { kind: "reps", targetSec: null, activeSec: 30, endedEarly: false, maxPauseMs: 0, hiddenMs: 0, reps: 12, targetReps: 8 },
      { kind: "reps", targetSec: null, activeSec: 1, endedEarly: false, maxPauseMs: 0, hiddenMs: 0, reps: 10, targetReps: 8 },
      { kind: "reps", targetSec: null, activeSec: 30, endedEarly: false, maxPauseMs: 0, hiddenMs: 60000, reps: 11, targetReps: 8 },
      { kind: "reps", targetSec: null, activeSec: 30, endedEarly: false, maxPauseMs: 0, hiddenMs: 0, reps: 10, targetReps: 8 },
    ],
  };
  assert.deepEqual(cleanSets(log), [{ reps: 12 }, { reps: 10 }]);
  assert.equal(formatSets(cleanSets(log)), "12·10 reps");
  assert.equal(formatSets([{ holdSec: 8 }, { holdSec: 7 }]), "8s·7s");
});

const done = (name: string, sets?: { reps?: number; holdSec?: number }[], detail = "3 x 8-10 reps"): ExerciseFeedback => ({
  name,
  setTitle: "Main Focus — Pull Strength",
  outcome: "done",
  sets,
  detail,
});

test("'last time' remembers sets, or the prescribed detail without timer data", () => {
  const stats = recordLastTimes({}, [done("Pull-ups", [{ reps: 12 }, { reps: 11 }]), done("Body rows", undefined, "3 x 10-12 reps")]);
  assert.equal(stats["pull_ups"].lastSets, "12·11 reps");
  assert.equal(stats["body_rows"].lastSets, "3 x 10-12 reps");
  const warm = recordLastTimes({}, [{ ...done("Arm circles"), setTitle: "Warm-Up" }]);
  assert.deepEqual(warm, {});
});

test("records: the first time sets the bar, beating it is a record", () => {
  const first = detectRecords({}, [done("Pull-ups", [{ reps: 10 }])]);
  assert.equal(first.newRecords.length, 0);
  assert.equal(first.records["pull_ups"].reps, 10);
  const second = detectRecords(first.records, [done("Pull-ups", [{ reps: 9 }, { reps: 12 }])]);
  assert.deepEqual(second.newRecords, [{ name: "Pull-ups", kind: "reps", value: 12, previous: 10 }]);
  const same = detectRecords(second.records, [done("Pull-ups", [{ reps: 12 }])]);
  assert.equal(same.newRecords.length, 0);
});

test("a session record captures exercises, outcomes and records", () => {
  const session = generateSession(skills, DEFAULT_EQUIPMENT, "pullStrength");
  const rec = buildSessionRecord(session, [done("Pull-ups", [{ reps: 12 }]), { ...done("Body rows"), outcome: "skipped" }], {
    xp: 120,
    durationMin: 41,
    records: [{ name: "Pull-ups", kind: "reps", value: 12, previous: 10 }],
  });
  assert.equal(rec.focusLabel, session.focusLabel);
  assert.equal(rec.exercises.length, 2);
  assert.equal(rec.exercises[1].outcome, "skipped");
  assert.equal(rec.durationMin, 41);
  assert.equal(rec.records?.length, 1);
});
