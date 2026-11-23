import { test } from "node:test";
import assert from "node:assert/strict";
import { areaScore, compareAreas, compareExercises, compareSkills, exerciseArea, exerciseHistory, exerciseLines, headline, periodsFor, stagesFor, stagesTrained } from "../src/lib/compare";
import { nextSkillHistory, skillsAt, SKILL_HISTORY_MAX } from "../src/lib/skillHistory";
import { DEFAULT_SKILLS, type ExerciseRecord, type SessionRecord, type SkillProfile } from "../src/lib/types";
import { translate } from "../src/lib/i18n/tx";

const ex = (name: string, extra: Partial<ExerciseRecord> = {}) => ({ name, setTitle: "Strength", outcome: "done", detail: "3 x 8 reps", ...extra }) as ExerciseRecord;
const session = (finishedAt: string, exercises: ExerciseRecord[], xp = 50, durationMin = 40) => ({ finishedAt, exercises, xp, durationMin }) as SessionRecord;

test("exercise lines use logged sets, else the plan (marked estimated)", () => {
  const lines = exerciseLines([
    session("2026-10-01T10:00:00Z", [ex("Pull-ups", { sets: [{ reps: 6 }, { reps: 5 }, { reps: 4 }] }), ex("Negative pull-ups", { detail: "3 x 5 reps, 4s descent" })]),
    session("2026-10-03T10:00:00Z", [ex("Pull-ups", { sets: [{ reps: 7 }, { reps: 6 }] }), ex("Wrist circles", { setTitle: "Warm-Up" })]),
  ]);
  const p = lines.get([...lines.keys()].find((k) => lines.get(k)!.name === "Pull-ups")!)!;
  assert.equal(p.best, 7);
  assert.equal(p.perSet, 6);
  assert.equal(p.sessions, 2);
  assert.equal(p.setsPerSession, 2.5);
  assert.equal(p.estimated, false);
  const n = [...lines.values()].find((l) => l.name === "Negative pull-ups")!;
  assert.equal(n.kind, "reps"); // a tempo in seconds doesn't make it a hold
  assert.equal(n.best, 5);
  assert.equal(n.estimated, true);
  assert.ok(![...lines.values()].some((l) => l.name === "Wrist circles")); // warm-ups don't count
});

test("same exercise: best and typical set change in %", () => {
  const then = exerciseLines([session("2026-09-01T10:00:00Z", [ex("Pull-ups", { sets: [{ reps: 5 }, { reps: 4 }] })])]);
  const now = exerciseLines([session("2026-11-15T10:00:00Z", [ex("Pull-ups", { sets: [{ reps: 10 }, { reps: 8 }, { reps: 8 }] }), ex("Archer pull-ups", { sets: [{ reps: 3 }] })])]);
  const c = compareExercises(then, now);
  assert.equal(c.both.length, 1);
  assert.equal(c.both[0].bestChange, 100);
  assert.equal(c.both[0].setsChange, 1);
  assert.deepEqual(c.added.map((a) => a.name), ["Archer pull-ups"]);
});

test("moving to a harder variation counts as stronger, even with fewer reps", () => {
  const then = exerciseLines([session("2026-09-01T10:00:00Z", [ex("Tuck front lever holds", { sets: [{ holdSec: 15 }] })])]);
  const now = exerciseLines([session("2026-11-15T10:00:00Z", [ex("Straddle front lever holds", { sets: [{ holdSec: 6 }] })])]);
  const [statics] = compareAreas(then, now).filter((a) => a.area === exerciseArea("Tuck front lever holds"));
  assert.ok(statics.now > 0 && statics.then > 0);
  assert.ok((statics.change ?? 0) > 0, `change ${statics.change}`);
});

test("muscle groups come from the skill each exercise belongs to", () => {
  assert.equal(exerciseArea("Tuck front lever holds"), "statics");
  assert.equal(exerciseArea("Pull-ups"), "pull");
  assert.equal(exerciseArea("Bodyweight squats"), "legs");
  assert.equal(areaScore([]), 0);
});

test("skills: stages gained, only real skills, unknown when not trained then", () => {
  const changes = compareSkills({ frontLever: "tuck" }, { frontLever: "straddle", backLever: "tuck" } as never, false);
  const fl = changes.find((c) => c.skill === "frontLever")!;
  assert.ok(fl.steps >= 2, String(fl.steps));
  const bl = changes.find((c) => c.skill === "backLever")!;
  assert.equal(bl.from, "unknown");
  assert.equal(bl.steps, 0);
  // rep counts stored on the profile aren't skills
  assert.ok(!compareSkills({}, { pullUpMaxReps: "5" } as never).length);
});

test("stages trained come from the hardest exercise done", () => {
  const st = stagesTrained([session("2026-11-01T10:00:00Z", [ex("Tuck front lever holds"), ex("Straddle front lever holds"), ex("Full front lever holds", { outcome: "skipped" })])]);
  assert.equal(st.frontLever, "straddle");
});

test("the skill history: a snapshot per change, a baseline at the start, capped", () => {
  const s0 = { ...DEFAULT_SKILLS, frontLever: "tuck" } as SkillProfile;
  const h1 = nextSkillHistory({ skills: DEFAULT_SKILLS }, s0, "2026-09-01T00:00:00Z")!;
  assert.equal(h1.length, 1);
  assert.equal(nextSkillHistory({ skills: s0, skillHistory: h1 }, s0), undefined); // unchanged: nothing
  const s1 = { ...s0, frontLever: "advancedTuck" } as SkillProfile;
  const h2 = nextSkillHistory({ skills: s0, skillHistory: h1 }, s1, "2026-10-01T00:00:00Z")!;
  assert.equal(h2.length, 2);
  assert.equal(skillsAt(h2, "2026-09-15T00:00:00Z")?.frontLever, "tuck");
  assert.equal(skillsAt(h2, "2026-10-15T00:00:00Z")?.frontLever, "advancedTuck");
  assert.equal(skillsAt(h2, "2026-08-01T00:00:00Z"), undefined); // before the history starts
  let h = h2;
  for (let i = 0; i < SKILL_HISTORY_MAX + 10; i++) h = nextSkillHistory({ skillHistory: h }, { ...s1, lSit: i % 2 ? "tuck" : "oneLeg" } as SkillProfile, `2026-11-${String(1 + (i % 28)).padStart(2, "0")}T00:00:00Z`)!;
  assert.equal(h.length, SKILL_HISTORY_MAX);
});

test("history gives exact stages when it reaches back far enough", () => {
  const history = [{ at: "2026-09-01T00:00:00Z", skills: { frontLever: "tuck" } }];
  const r = stagesFor({ from: "2026-09-02T00:00:00Z", to: "2026-09-16T00:00:00Z" }, [], { skillHistory: history, skills: DEFAULT_SKILLS }, false);
  assert.equal(r.exact, true);
  assert.equal(r.stages.frontLever, "tuck");
  const older = stagesFor({ from: "2026-08-01T00:00:00Z", to: "2026-08-15T00:00:00Z" }, [session("2026-08-02T00:00:00Z", [ex("Tuck front lever holds")])], { skillHistory: history, skills: DEFAULT_SKILLS }, false);
  assert.equal(older.exact, false);
});

test("periods: two-week windows that never overlap", () => {
  const now = new Date("2026-11-21T12:00:00Z");
  const p = periodsFor("start", { startedAt: "2026-06-01T00:00:00Z", now });
  assert.equal(p.then.from.slice(0, 10), "2026-06-01");
  assert.equal(p.then.to.slice(0, 10), "2026-06-15");
  assert.equal(p.now.to, now.toISOString());
  const short = periodsFor("start", { startedAt: "2026-11-10T00:00:00Z", now });
  assert.ok(short.then.to <= short.now.from);
  const custom = periodsFor("custom", { startedAt: "2026-06-01T00:00:00Z", thenDate: "2026-08-01", nowDate: "2026-10-01" });
  assert.equal(custom.then.from.slice(0, 10), "2026-08-01");
  assert.equal(custom.now.to.slice(0, 10), "2026-10-02"); // up to and including the day picked
});

test("headline: sessions a week and the level back then (approximate)", () => {
  const then = { from: "2026-09-01T00:00:00Z", to: "2026-09-15T00:00:00Z" };
  const now = { from: "2026-11-07T00:00:00Z", to: "2026-11-21T00:00:00Z" };
  const all = [session("2026-09-02T00:00:00Z", [], 40), session("2026-09-09T00:00:00Z", [], 40), ...Array.from({ length: 6 }, (_, i) => session(`2026-11-${10 + i}T00:00:00Z`, [], 100))];
  const h = headline({ xp: 2000 }, all, then, now);
  assert.deepEqual(h.sessionsPerWeek, [1, 3]);
  assert.ok(h.levelThen < h.levelNow);
});

test("the comparison screen speaks Italian", () => {
  for (const s of ["Then vs now", "Strength by muscle group", "Exercises you did in both", "New in your training", "Since you started", "Pulling", "+1 stage"]) {
    assert.notEqual(translate("it", s), s, s);
  }
});

test("strength score: harder variations weigh more than extra reps", async () => {
  const { effortScore } = await import("../src/lib/compare");
  const pct = (a: number, b: number) => Math.round(((b - a) / a) * 100);
  const tuck = effortScore({ difficulty: 1.8, kind: "hold", perSet: 15 });
  const straddle = effortScore({ difficulty: 3, kind: "hold", perSet: 6 });
  assert.ok(pct(tuck, straddle) > 100, String(pct(tuck, straddle)));
  // doubling reps on the same exercise is progress, but less than doubling strength
  const g = pct(effortScore({ difficulty: 1.75, kind: "reps", perSet: 5 }), effortScore({ difficulty: 1.75, kind: "reps", perSet: 10 }));
  assert.ok(g > 30 && g < 60, String(g));
});

test("one exercise over time: a point per session, oldest first", () => {
  const h = exerciseHistory(
    [
      session("2026-10-03T10:00:00Z", [ex("Pull-ups", { sets: [{ reps: 7 }, { reps: 6 }] })]),
      session("2026-10-01T10:00:00Z", [ex("Pull-ups", { sets: [{ reps: 6 }, { reps: 5 }] })]),
      session("2026-10-02T10:00:00Z", [ex("Dips")]),
      session("2026-10-05T10:00:00Z", [ex("pull-ups")]),
    ],
    "Pull-ups"
  );
  assert.deepEqual(h.map((p) => p.best), [6, 7, 8]);
  assert.deepEqual(h.map((p) => p.estimated), [false, false, true]);
  assert.equal(h[0].kind, "reps");
});
