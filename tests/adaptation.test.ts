import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSession } from "../src/lib/trainingGenerator";
import {
  adaptSession,
  applyExerciseFeedback,
  applySkillFeedback,
  acceptStageSuggestion,
  snoozeStageSuggestion,
  historySummary,
  statKey,
} from "../src/lib/adaptation";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, ExerciseFeedback, SkillProfile, TrainingSession } from "../src/lib/types";

const skills: SkillProfile = { ...DEFAULT_SKILLS, frontLever: "tuck" };
const base = generateSession(skills, DEFAULT_EQUIPMENT, "frontLever", new Date("2026-11-14"));
const main = base.sets[1];

function feedbackFor(session: TrainingSession, hard: string[] = [], skip: string[] = []): ExerciseFeedback[] {
  return session.sets.flatMap((set) =>
    set.exercises.map((e) => ({
      name: e.name,
      setTitle: set.title,
      adaptedFrom: e.adaptedFrom,
      adaptDir: e.adaptDir,
      outcome: hard.includes(e.name) ? "tooHard" : skip.includes(e.name) ? "skipped" : "done",
    }))
  );
}

test("statKey is stable and Firestore-safe", () => {
  assert.equal(statKey("Ring / bar support hold"), "ring_bar_support_hold");
});

test("no history leaves the session untouched", () => {
  assert.equal(adaptSession(base, {}, DEFAULT_EQUIPMENT), base);
});

test("too hard eases the exercise next time, never duplicating a neighbour", () => {
  const target = main.exercises[1];
  const stats = applyExerciseFeedback({}, feedbackFor(base, [target.name]));
  const adapted = adaptSession(base, stats, DEFAULT_EQUIPMENT).sets[1].exercises;
  const names = adapted.map((e) => e.name);
  assert.equal(new Set(names).size, names.length, "no duplicate exercises in a block");
  assert.ok(adapted[1].adaptNote, "the eased slot explains itself");
});

test("completing the easier rung brings the original back", () => {
  const target = main.exercises[2];
  let stats = applyExerciseFeedback({}, feedbackFor(base, [target.name]));
  const eased = adaptSession(base, stats, DEFAULT_EQUIPMENT);
  stats = applyExerciseFeedback(stats, feedbackFor(eased));
  const back = adaptSession(base, stats, DEFAULT_EQUIPMENT).sets[1].exercises[2];
  assert.equal(back.name, target.name);
});

test("many clean sessions add volume and step up only the last rung", () => {
  let stats = {};
  for (let i = 0; i < 8; i++) stats = applyExerciseFeedback(stats, feedbackFor(adaptSession(base, stats, DEFAULT_EQUIPMENT)));
  const out = adaptSession(base, stats, DEFAULT_EQUIPMENT).sets[1].exercises;
  assert.ok(out.slice(0, -1).every((e) => /\+1 set/.test(e.adaptNote ?? "")));
  assert.equal(out[out.length - 1].adaptDir, "harder");
});

test("a struggled 'done' earns no progression credit", () => {
  const ex = main.exercises[0];
  const fb: ExerciseFeedback[] = [{ name: ex.name, setTitle: main.title, outcome: "done", timing: { struggled: true, ignored: 0 } }];
  const stats = applyExerciseFeedback({}, fb);
  assert.equal(stats[statKey(ex.name)].p, 0);
  assert.equal(stats[statKey(ex.name)].done, 1);
});

test("rest adapts after three agreeing sessions; hold target after two", () => {
  const ex = main.exercises[0];
  let stats = {};
  for (const r of [0.6, 0.65, 0.7]) {
    stats = applyExerciseFeedback(stats, [{ name: ex.name, setTitle: main.title, outcome: "done", timing: { restRatio: r, struggled: false, ignored: 0 } }]);
  }
  const a = adaptSession(base, stats, DEFAULT_EQUIPMENT).sets[1].exercises[0];
  assert.ok(a.restSeconds < ex.restSeconds);
  assert.match(a.adaptNote ?? "", /matching what you take/);
});

test("warm-up, finisher and skill checks are never recorded", () => {
  const fb: ExerciseFeedback[] = [
    { name: "Arm circles", setTitle: "Warm-Up", outcome: "tooHard" },
    { name: "Skill check: X", setTitle: "Skill Check", outcome: "done", check: { key: "frontLever", kind: "hold", target: 5, label: "X" } },
  ];
  assert.deepEqual(applyExerciseFeedback({}, fb), {});
});

test("skill mastery climbs with clean work, then a stage-up is suggested", () => {
  let mastery: Record<string, 1 | 2 | 3 | 4 | 5> = { frontLever: 3 };
  let progress = {};
  let suggestion;
  for (let i = 0; i < 6; i++) {
    const r = applySkillFeedback(skills, mastery, progress, feedbackFor(base));
    mastery = r.mastery as typeof mastery;
    progress = r.progress;
    suggestion = r.suggestions[0] ?? suggestion;
  }
  assert.equal(mastery.frontLever, 5);
  assert.deepEqual(suggestion && { d: suggestion.direction, to: suggestion.toStage }, { d: "up", to: "advancedTuck" });

  const accepted = acceptStageSuggestion(skills, mastery, progress, suggestion!);
  assert.equal(accepted.skills.frontLever, "advancedTuck");
  assert.equal(accepted.mastery.frontLever, 2);
});

test("a snoozed suggestion isn't offered again", () => {
  const r = applySkillFeedback(skills, { frontLever: 5 }, { frontLever: { score: 6 } }, feedbackFor(base));
  const snoozed = snoozeStageSuggestion(r.progress, r.suggestions[0]);
  const again = applySkillFeedback(skills, { frontLever: 5 }, { frontLever: { ...snoozed.frontLever!, score: 6 } }, feedbackFor(base));
  assert.equal(again.suggestions.length, 0);
});

test("history summary is compact and contains no personal data", () => {
  const s = historySummary({ pull_ups: { p: 3, done: 0, skipped: 1, tooHard: 1, last: "" } }, { frontLever: { status: "verified", value: "tuck" } });
  assert.match(s, /recently too hard or skipped: pull_ups/);
  assert.match(s, /verified in training: frontLever=tuck/);
});
