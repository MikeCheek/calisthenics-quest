import { test } from "node:test";
import assert from "node:assert/strict";
import {
  balanceSession,
  easeUpTarget,
  effortCapacity,
  exerciseDifficulty,
  exerciseEffort,
  feedbackWeight,
  planEaseUp,
  setLoad,
  stepsOf,
  totalEffort,
} from "../src/lib/effort";
import { generateSession } from "../src/lib/trainingGenerator";
import { applyExerciseFeedback, statKey } from "../src/lib/adaptation";
import { exerciseVolume } from "../src/lib/volumeTotals";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, Exercise, SkillProfile } from "../src/lib/types";

test("harder exercises and bigger sets weigh more", () => {
  assert.equal(exerciseDifficulty("Wrist circles & stretch", "Warm-Up"), 0.5);
  assert.equal(exerciseDifficulty("Burpees", "Final Hits"), 1.5);
  assert.ok(setLoad("3 x 15 reps") > setLoad("3 x 5 reps"));
  assert.ok(setLoad("3 x 30s") > setLoad("3 x 10s"));
  assert.ok(setLoad("3 x 10 per side") > setLoad("3 x 10"));
  // a low-rep set of a hard exercise is still a full set
  assert.equal(setLoad("2 x 3-5 reps"), 1);
  assert.equal(setLoad("3 x 5s"), 1);
  // a later stage on the road outweighs an earlier one of the same skill
  const skills = { ...DEFAULT_SKILLS, frontLever: "tuck" } as SkillProfile;
  const harder = { ...DEFAULT_SKILLS, frontLever: "straddle" } as SkillProfile;
  const main = (s: SkillProfile) => generateSession(s, DEFAULT_EQUIPMENT, "frontLever").sets.find((x) => x.title.startsWith("Main"))!.exercises[0];
  assert.ok(exerciseDifficulty(main(harder).name, "Main") > exerciseDifficulty(main(skills).name, "Main"));
  assert.equal(exerciseEffort({ name: "Burpees", detail: "4 x 8" }, "Final Hits"), 4 * 1.5 * 1);
  assert.equal(exerciseEffort({ name: "Burpees", detail: "4 x 8" }, "Final Hits", 2), 2 * 1.5 * 1);
});

test("feedback counts in full when fresh, about a third when spent", () => {
  assert.equal(feedbackWeight(undefined), 1);
  assert.equal(feedbackWeight(0.1), 1);
  assert.equal(feedbackWeight(0.4), 1);
  assert.ok(feedbackWeight(0.6) < 1 && feedbackWeight(0.6) > 0.35);
  assert.equal(feedbackWeight(0.9), 0.35);
});

const ex = (name: string, detail: string): Exercise => ({ name, detail, restSeconds: 60 });
const plan = [
  { setTitle: "Warm-Up", exercise: ex("Wrist circles & stretch", "2 x 10") },
  { setTitle: "Main Focus — X", exercise: ex("Hard thing", "4 x 8 reps") },
  { setTitle: "Main Focus — X", exercise: ex("Other hard thing", "4 x 8 reps") },
  { setTitle: "Accessory — Y", exercise: ex("Accessory", "3 x 10 reps") },
  { setTitle: "Final Hits", exercise: ex("Burpees", "3 x 10") },
];
// stand-in easier rungs: lighter (fewer sets) than what they replace
const easier = (name: string) => (name.startsWith("Easier") ? null : ex(`Easier ${name}`, "2 x 8 reps"));

test("I'm tired: cuts more the earlier it is, and never the warm-up", () => {
  assert.ok(easeUpTarget(0.1) > easeUpTarget(0.5) && easeUpTarget(0.5) > easeUpTarget(0.9));
  const early = planEaseUp(plan, 1, 0.1, easier);
  const late = planEaseUp(plan, 1, 0.9, easier);
  // close to the target (it stops at 2 sets rather than cut everything to one)
  assert.ok(early.cut >= early.target * 0.8, JSON.stringify(early));
  assert.ok(late.cut >= late.target * 0.8, JSON.stringify(late));
  assert.ok(early.cut > late.cut);
  // late in a session the skill work isn't downgraded, only shortened
  assert.ok(late.changes.every((c) => c.kind === "fewerSets" && !c.exercise.name.startsWith("Easier")), JSON.stringify(late.changes));
  // early on, easier rungs come in
  assert.ok(early.changes.some((c) => c.exercise.name.startsWith("Easier")));
  assert.ok(early.changes.every((c) => c.index > 0));
  // early on, nothing drops below 2 sets
  assert.ok(early.changes.every((c) => parseInt(c.exercise.detail, 10) >= 2), JSON.stringify(early.changes));
  // the Skill Check is never touched
  const withCheck = [...plan.slice(0, 1), { setTitle: "Skill Check", exercise: { ...ex("Skill check: Tuck planche", "3 x 5s"), check: { key: "planche" as const, kind: "hold" as const, target: 5, label: "Tuck planche" } } }, ...plan.slice(1)];
  assert.ok(planEaseUp(withCheck, 1, 0.1, easier).changes.every((c) => c.index !== 1));
  const fromWarmup = planEaseUp(plan, 0, 0.1, easier);
  assert.ok(fromWarmup.changes.every((c) => c.index !== 0));
});

test("capacity needs two tired sessions, and full sessions raise it", () => {
  const s = (done: number, tired: boolean) => ({ at: "", planned: 100, done, tired });
  assert.equal(effortCapacity([s(60, true)]), null);
  assert.equal(effortCapacity([s(60, true), s(70, true)]), 65);
  assert.equal(effortCapacity([s(60, true), s(70, true), s(90, false)]), 90);
});

test("balancing trims accessory sets first, keeps skill work and checks", () => {
  const session = generateSession({ ...DEFAULT_SKILLS, frontLever: "tuck" } as SkillProfile, DEFAULT_EQUIPMENT, "frontLever", new Date(), 60);
  const planned = totalEffort(stepsOf(session));
  assert.deepEqual(balanceSession(session, null).trimmed, 0);
  assert.equal(balanceSession(session, planned * 2).trimmed, 0);
  const { session: lighter, trimmed } = balanceSession(session, planned * 0.6);
  assert.ok(trimmed > 0, `trimmed ${trimmed}`);
  assert.ok(totalEffort(stepsOf(lighter)) < planned);
  const warm = (x: typeof session) => x.sets.find((s) => s.track === "warmup")!.exercises.map((e) => e.detail);
  assert.deepEqual(warm(lighter), warm(session));
  const firstMain = (x: typeof session) => x.sets.find((s) => s.title.startsWith("Main"))!.exercises[0].detail;
  assert.equal(firstMain(lighter), firstMain(session));
});

// ---- fatigue in the learning ----

test("too hard late in a session moves the exercise less than when fresh", () => {
  const fb = (fatigue?: number) => [{ name: "Muscle-up negatives", outcome: "tooHard" as const, setTitle: "Main Focus — Muscle-Up", fatigue }];
  const fresh = applyExerciseFeedback({}, fb(0.1))[statKey("Muscle-up negatives")];
  const spent = applyExerciseFeedback({}, fb(0.9))[statKey("Muscle-up negatives")];
  const unknown = applyExerciseFeedback({}, fb(undefined))[statKey("Muscle-up negatives")];
  assert.equal(fresh.p, 2);
  assert.equal(unknown.p, 2);
  assert.ok(spent.p < 1 && spent.p > 0, `spent ${spent.p}`);
  assert.equal(spent.tooHard, 1); // still remembered, just weighted
});

test("stopping early counts as done, with a small signal, and only the sets done add up", () => {
  const s = applyExerciseFeedback({}, [
    { name: "Pull-ups", outcome: "done" as const, setTitle: "Accessory — Pull", setsDone: 2, detail: "4 x 8 reps", fatigue: 0.2 },
  ])[statKey("Pull-ups")];
  assert.equal(s.done, 1);
  assert.equal(s.p, 0.5);
  assert.equal(exerciseVolume({ outcome: "done", detail: "4 x 8 reps", setsDone: 2 }).reps, 16);
});
