import { test } from "node:test";
import assert from "node:assert/strict";
import { applyExerciseFeedback, adaptSession, statKey } from "../src/lib/adaptation";
import { applyProgression, judgeSets, parseTarget } from "../src/lib/progression";
import { freshest, preference, exerciseByName } from "../src/lib/variety";
import { doneShare, habitualMinutes, lengthSample, type LengthSample } from "../src/lib/sessionLength";
import { DEFAULT_EQUIPMENT, type ExerciseFeedback, type ExerciseStat, type TrainingSession } from "../src/lib/types";

const at = (d: string) => `${d}T18:00:00.000Z`;
const done = (name: string, detail: string, sets: number[], unit: "reps" | "s" = "reps"): ExerciseFeedback => ({
  name,
  outcome: "done",
  setTitle: "Main Focus — Pull Strength",
  detail,
  sets: sets.map((v) => (unit === "reps" ? { reps: v } : { holdSec: v })),
});
const session = (name: string, detail: string): TrainingSession => ({
  id: "t",
  dateISO: "2026-12-10",
  focusLabel: "Pull Strength",
  estXp: 0,
  sets: [{ track: "pullStrength", title: "Main Focus — Pull Strength", exercises: [{ name, detail, restSeconds: 90 }] }],
});

// ---- progressing from logged numbers ----

test("parses prescriptions it can progress", () => {
  assert.deepEqual(parseTarget("4 x 6-8 reps"), { sets: 4, lo: 6, hi: 8, unit: "reps" });
  assert.deepEqual(parseTarget("3 x 10 reps per side"), { sets: 3, lo: 10, hi: 10, unit: "reps" });
  assert.deepEqual(parseTarget("4 x 15-20s"), { sets: 4, lo: 15, hi: 20, unit: "s" });
  assert.equal(parseTarget("4 x max hold"), null);
  assert.equal(parseTarget("8 min, 1-2 reps per minute"), null);
});

test("hit the top on every set → one more rep next time; holds get a couple of seconds", () => {
  assert.equal(judgeSets("4 x 6-8 reps", [{ reps: 8 }, { reps: 9 }, { reps: 8 }, { reps: 8 }]), "top");
  assert.equal(judgeSets("4 x 6-8 reps", [{ reps: 8 }, { reps: 8 }, { reps: 7 }, { reps: 8 }]), "steady");
  assert.equal(judgeSets("4 x 6-8 reps", [{ reps: 8 }, { reps: 8 }, { reps: 8 }]), "steady", "every set, not three of four");
  assert.equal(judgeSets("4 x 6-8 reps", [{ reps: 4 }, { reps: 5 }, { reps: 5 }, { reps: 6 }]), "short");
  assert.equal(judgeSets("5 x 4-6 reps, 3s lower", [{ reps: 6 }, { reps: 6 }, { reps: 6 }, { reps: 6 }, { reps: 6 }]), null, "tempo work is about control");

  let stats: Record<string, ExerciseStat> = {};
  stats = applyExerciseFeedback(stats, [done("Pull-ups", "4 x 6-8 reps", [8, 8, 9, 8])], at("2026-12-01"));
  assert.equal(stats.pull_ups.up, 1);
  const next = adaptSession(session("Pull-ups", "4 x 6-8 reps"), stats, DEFAULT_EQUIPMENT).sets[0].exercises[0];
  assert.equal(next.detail, "4 x 7-9 reps");
  assert.match(next.adaptNote!, /\+1 rep — you hit the top/);

  // and again, from what was actually on screen
  stats = applyExerciseFeedback(stats, [done("Pull-ups", "4 x 7-9 reps", [9, 9, 10, 9])], at("2026-12-04"));
  assert.equal(stats.pull_ups.up, 2);

  let h: Record<string, ExerciseStat> = {};
  h = applyExerciseFeedback(h, [done("Tuck front lever holds", "4 x 10-15s", [15, 16, 15, 15], "s")], at("2026-12-01"));
  assert.equal(applyProgression("4 x 10-15s", h.tuck_front_lever_holds.up), "4 x 12-17s");
});

test("short twice in a row gives a step back; too hard gives one back at once", () => {
  let stats: Record<string, ExerciseStat> = { pull_ups: { p: 0, done: 5, skipped: 0, tooHard: 0, last: at("2026-11-20"), up: 2 } };
  stats = applyExerciseFeedback(stats, [done("Pull-ups", "4 x 8-10 reps", [6, 6, 7, 6])], at("2026-12-01"));
  assert.equal(stats.pull_ups.up, 2, "one bad day isn't a trend");
  stats = applyExerciseFeedback(stats, [done("Pull-ups", "4 x 8-10 reps", [6, 7, 6, 6])], at("2026-12-04"));
  assert.equal(stats.pull_ups.up, 1);
  stats = applyExerciseFeedback(stats, [{ name: "Pull-ups", outcome: "tooHard", setTitle: "Main Focus — Pull Strength", detail: "4 x 7-9 reps" }], at("2026-12-07"));
  assert.equal(stats.pull_ups.up, undefined);
});

test("progression is capped, and replaces the extra set while it climbs", () => {
  let stats: Record<string, ExerciseStat> = {};
  for (let i = 0; i < 9; i++) {
    const shown = applyProgression("3 x 8-10 reps", stats.dips?.up);
    const hi = parseTarget(shown)!.hi;
    stats = applyExerciseFeedback(stats, [done("Dips", shown, [hi, hi, hi])], at(`2026-12-${String(i + 1).padStart(2, "0")}`));
  }
  assert.equal(stats.dips.up, 5);
  const ex = adaptSession(session("Dips", "3 x 8-10 reps"), stats, DEFAULT_EQUIPMENT).sets[0].exercises[0];
  assert.ok(ex.detail.startsWith("3 x 13-15 reps") || ex.adaptedFrom, `reps went up, not sets: ${ex.detail}`);
});

// ---- learning what you like ----

const stat = (extra: Partial<ExerciseStat>): ExerciseStat => ({ p: 0, done: 0, skipped: 0, tooHard: 0, last: at("2026-11-01"), ...extra });

test("only skips you chose count against an exercise — not what you didn't reach", () => {
  let stats: Record<string, ExerciseStat> = {};
  const skip = (chosen: boolean, fatigue?: number): ExerciseFeedback => ({ name: "Wall walks", outcome: "skipped", setTitle: "Accessory — Push Strength", chosen, fatigue });
  stats = applyExerciseFeedback(stats, [skip(false), skip(false), skip(false)], at("2026-12-01"));
  assert.equal(preference(stats.wall_walks), null, "a session ended early isn't dislike");
  stats = applyExerciseFeedback(stats, [skip(true, 0.95)], at("2026-12-02"));
  assert.equal(stats.wall_walks.sk, undefined, "a skip at the very end, when tired, isn't dislike either");
  stats = applyExerciseFeedback(stats, [skip(true), skip(true)], at("2026-12-03"));
  assert.equal(preference(stats.wall_walks), "disliked");
  assert.equal(preference(stat({ done: 4, lastAt: at("2026-11-01") })), "liked");
  assert.equal(preference(stat({ done: 4, sk: 1 })), null);
});

test("the rotation brings back what you like sooner and what you skip later", () => {
  const names = ["Pull-ups", "Wide-grip rows", "Scapula pulls (hang)"];
  const cands = names.map((n) => exerciseByName(n)!);
  // all done on the same day; one always finished, one always skipped on purpose
  const stats: Record<string, ExerciseStat> = {
    [statKey("Pull-ups")]: stat({ done: 5, lastAt: at("2026-12-01") }),
    [statKey("Wide-grip rows")]: stat({ done: 1, lastAt: at("2026-12-01") }),
    [statKey("Scapula pulls (hang)")]: stat({ done: 1, skipped: 3, sk: 3, lastAt: at("2026-12-01") }),
  };
  for (const day of ["2026-12-05", "2026-12-06", "2026-12-07", "2026-12-08"]) {
    const order = freshest(cands, 3, { stats }, day).map((e) => e.name);
    assert.deepEqual(order, ["Pull-ups", "Wide-grip rows", "Scapula pulls (hang)"], day);
  }
  // a skipped exercise still comes back eventually: not done in a month beats one done yesterday
  const later = { ...stats, [statKey("Scapula pulls (hang)")]: stat({ done: 1, sk: 3, skipped: 3, lastAt: at("2026-10-20") }), [statKey("Pull-ups")]: stat({ done: 5, lastAt: at("2026-12-07") }) };
  assert.equal(freshest(cands, 3, { stats: later }, "2026-12-08")[2].name, "Pull-ups");
});

// ---- planning around the session you get through ----

const sample = (planned: number, done: number, sport?: "yoga"): LengthSample => ({ at: at("2026-12-01"), planned, done, ...(sport ? { sport } : {}) });

test("sessions usually cut short are planned shorter; done in full, they stay that way", () => {
  assert.deepEqual(habitualMinutes(60, [sample(60, 0.65), sample(60, 0.7), sample(60, 0.6)]), { minutes: 40, chosen: 60, shorter: true });
  // then 40-minute plans done in full: still 40, it doesn't swing back and forth
  assert.equal(habitualMinutes(60, [sample(60, 0.65), sample(60, 0.7), sample(40, 1), sample(40, 1), sample(40, 1)])!.minutes, 40);
  // and when you start doing more again, it follows
  assert.equal(habitualMinutes(60, [sample(40, 1), sample(60, 1), sample(60, 0.95), sample(60, 1)])!.shorter, false);
});

test("never longer than chosen, never under 20 min, and needs a few sessions to go on", () => {
  assert.equal(habitualMinutes(60, [sample(60, 0.6), sample(60, 0.6)])!.shorter, false, "two sessions aren't a habit");
  assert.equal(habitualMinutes(45, [sample(60, 1), sample(60, 1), sample(60, 1)])!.minutes, 45);
  assert.equal(habitualMinutes(30, [sample(30, 0.2), sample(30, 0.3), sample(30, 0.2)])!.minutes, 20);
  assert.equal(habitualMinutes(undefined, [sample(60, 0.5)]), null);
  // per sport: yoga's short sessions don't shorten calisthenics
  assert.equal(habitualMinutes(60, [sample(60, 0.5, "yoga"), sample(60, 0.5, "yoga"), sample(60, 0.5, "yoga")])!.shorter, false);
  assert.equal(habitualMinutes(60, [sample(60, 0.5, "yoga"), sample(60, 0.5, "yoga"), sample(60, 0.5, "yoga")], "yoga")!.shorter, true);
});

test("a sample counts the session's own work, not the warm-up or what came twice", () => {
  const s: TrainingSession = {
    id: "t",
    dateISO: "2026-12-01",
    focusLabel: "x",
    estXp: 0,
    sets: [
      { track: "warmup", title: "Warm-Up", exercises: [{ name: "Arm circles", detail: "1 x 30s", restSeconds: 0 }] },
      { track: "pullStrength", title: "Main Focus — Pull Strength", exercises: ["A", "B", "C", "D"].map((name) => ({ name, detail: "3 x 8 reps", restSeconds: 60 })) },
    ],
  };
  const fb = (name: string, outcome: "done" | "skipped"): ExerciseFeedback => ({ name, outcome, setTitle: "Main Focus — Pull Strength" });
  assert.equal(doneShare(s, [fb("A", "done"), fb("B", "done"), fb("C", "done"), fb("D", "skipped"), { name: "Arm circles", outcome: "done", setTitle: "Warm-Up" }]), 0.75);
  assert.deepEqual(lengthSample(s, [fb("A", "done"), fb("B", "done")], 52.4, "x"), { at: "x", planned: 52, done: 0.5 });
  assert.equal(lengthSample(s, [], 5), null, "a two-exercise 'Do it now' isn't a session length");
});
