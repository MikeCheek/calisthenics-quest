import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSession, exercisesForTrack } from "../src/lib/trainingGenerator";
import { adaptSession, applySkillFeedback, easierForAthlete } from "../src/lib/adaptation";
import { aboveYourStage, findEasierExercise } from "../src/lib/exerciseHierarchy";
import { parseTiming } from "../src/lib/exerciseTiming";
import { bestHoldFromLog, summarizeTimerLog } from "../src/lib/timingLearning";
import { balanceSession } from "../src/lib/effort";
import { checksPerSession, pickSkillChecks, skillsForTraining } from "../src/lib/verification";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, type ExerciseStat, type SkillProfile, type TrainingSession } from "../src/lib/types";

// An advanced athlete like the one whose exported data found these bugs:
// strong pulling, tuck planche, HSPU negatives, pike press still developing.
const athlete = {
  ...DEFAULT_SKILLS,
  pullUpMaxReps: 15,
  dipMaxReps: 20,
  pushUpMaxReps: 30,
  archerPullUp: true,
  planche: "tuck",
  frontLever: "oneLeg",
  handstand: "freestanding",
  handstandPushUp: "negative",
  pikePress: "developing",
} as unknown as SkillProfile;
const eq = { ...DEFAULT_EQUIPMENT, monkeyBars: true, resistanceBands: true };
const names = (s: TrainingSession) => s.sets.flatMap((x) => x.exercises.map((e) => e.name));
const stat = (p: number, extra: Partial<ExerciseStat> = {}): ExerciseStat => ({ p, done: 0, skipped: 0, tooHard: 4, last: "2026-11-20T00:00:00Z", ...extra });

test("one-arm chin negatives marked too hard again and again finally ease off", () => {
  assert.ok(findEasierExercise("One-arm chin negatives", eq), "the name the session uses is on the ladder");
  // a pull session with it (sessions rotate, so build one that has it)
  const s: TrainingSession = { id: "t", dateISO: "2026-11-27", focusLabel: "Pull Strength", estXp: 0, sets: [{ track: "pullStrength", title: "Main Focus — Pull Strength", exercises: exercisesForTrack("pullStrength", athlete, eq) }] };
  assert.ok(names(s).includes("One-arm chin negatives"));
  const adapted = adaptSession(s, { one_arm_chin_negatives: stat(6) }, eq, athlete);
  const all = names(adapted);
  assert.ok(!all.includes("One-arm chin negatives"), "swapped out");
  assert.equal(new Set(all).size, all.length, "and not for something already in the session");
});

test("a block never borrows an exercise above your stage in its skill", () => {
  for (const focus of ["pushStrength", "pullStrength", "handstand", "frontLever"] as const) {
    const s = generateSession(athlete, eq, focus, new Date(2026, 10, 27), 60);
    // warm-up and finisher are the same generic conditioning for everyone
    const work = s.sets.filter((x) => x.track !== "warmup" && x.track !== "finisher").flatMap((x) => x.exercises.map((e) => e.name));
    const above = work.filter((n) => aboveYourStage(n, athlete as unknown as Record<string, unknown>));
    assert.deepEqual(above, [], `${focus}: nothing above your stages`);
  }
  const push = names(generateSession(athlete, eq, "pushStrength", new Date(2026, 10, 27)));
  assert.ok(!push.includes("Planche push-ups"), "no full-planche push-ups for a tuck planche");
  const hs = names(generateSession(athlete, eq, "handstand", new Date(2026, 10, 27)));
  assert.ok(!hs.includes("Handstand push-ups (parallettes)") && !hs.includes("Handstand press or straddle-to-HS"));
});

test("too hard above your stage jumps straight to your stage, not one rung at a time", () => {
  const e = easierForAthlete("Planche push-ups", eq, { skills: athlete });
  assert.ok(e);
  assert.match(e!.name, /tuck planche/i);
});

test("a too-hard swap never duplicates an exercise already in the session", () => {
  const plain = findEasierExercise("Handstand press or straddle-to-HS", eq)!.name;
  const e = easierForAthlete("Handstand press or straddle-to-HS", eq, { taken: new Set([plain]) });
  assert.ok(!e || e.name !== plain);
});

test("too hard on work above your stage doesn't count against the skill", () => {
  const r = applySkillFeedback(athlete, {}, {}, [{ name: "Planche push-ups", outcome: "tooHard", setTitle: "Accessory — Push Strength" }]);
  assert.equal(r.progress.planche?.score ?? 0, 0);
});

test("timing: cluster sets are reps, tempo reps are reps, accumulate is per attempt", () => {
  assert.equal(parseTiming("4 x max unbroken reps, rest-pause 15s between").isTimed, false);
  assert.equal(parseTiming("3 x 6 reps, 3s down / 3s up").isTimed, false);
  assert.equal(parseTiming("3 x 4-5 reps, 4-5s descent").isTimed, false);
  const acc = parseTiming("6-8 x max attempt, accumulate 60-90s");
  assert.equal(acc.isTimed, true);
  assert.equal(acc.workSeconds, 13); // 75s over 6 attempts, not 75s each
  assert.deepEqual(parseTiming("4 x 15-20s"), { sets: 4, workSeconds: 18, isTimed: true });
  assert.equal(parseTiming("8 min, 1-2 reps per minute").workSeconds, 480);
});

test("holds past the target count in full (overtime)", () => {
  const log = { sets: [{ kind: "hold" as const, targetSec: 10, activeSec: 17, endedEarly: false, maxPauseMs: 0, hiddenMs: 0 }], rests: [], workPauses: 0 };
  assert.equal(summarizeTimerLog(log)?.holdRatio, 1.5); // well past the target (capped)
  assert.equal(bestHoldFromLog(log), 17); // and a skill check reads the full hold
});

test("a skipped rest isn't learned as a preference", () => {
  const rests = [0.25, 0.25, 0.3].map((r) => ({ plannedSec: 90, takenSec: 90 * r, maxPauseMs: 0, hiddenMs: 0 }));
  assert.equal(summarizeTimerLog({ sets: [], rests, workPauses: 0 })?.restRatio, undefined);
});

test("an overfull session drops the bonus block and accessories, not just sets", () => {
  const s = generateSession(athlete, eq, "handstand", new Date(2026, 10, 27), 60);
  const b = balanceSession(s, 30);
  assert.ok(b.trimmed > 0);
  assert.ok(!b.session.sets.some((x) => x.title.startsWith("Bonus")), "bonus block goes first");
});

test("the accessory balances the day: pulling skill → push work", () => {
  const fl = generateSession(athlete, eq, "frontLever", new Date(2026, 10, 27));
  assert.ok(fl.sets.some((x) => x.track === "pushStrength"));
  const hs = generateSession(athlete, eq, "handstand", new Date(2026, 10, 27));
  assert.ok(hs.sets.some((x) => x.track === "pullStrength"));
});

test("many unchecked claims: two one-set checks a session; a failed claim trains a stage lower", () => {
  const claimed = (value: string, status: "claimed" | "unconfirmed" = "claimed") => ({ value, status, claimedAt: "2026-11-01T00:00:00Z", fails: status === "unconfirmed" ? 1 : 0, lastAttemptAt: status === "unconfirmed" ? "2026-11-01T00:00:00Z" : undefined });
  const claims = {
    planche: claimed("tuck"),
    frontLever: claimed("oneLeg"),
    handstand: claimed("freestanding"),
    pullUpMaxReps: claimed("15"),
    dipMaxReps: claimed("20"),
    handstandPushUp: claimed("negative", "unconfirmed"),
  } as never;
  assert.equal(checksPerSession(claims), 2);
  assert.equal(pickSkillChecks(claims, eq, "frontLever", 2, new Date(2026, 10, 27)).length, 2);
  assert.equal((skillsForTraining(athlete, claims) as unknown as Record<string, string>).handstandPushUp, "none");
  assert.equal(checksPerSession({ planche: claimed("tuck") } as never), 1);
});
