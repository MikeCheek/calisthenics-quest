import { test } from "node:test";
import assert from "node:assert/strict";
import { nextUnlocks, nextMilestones, stageStates } from "../src/lib/skillTree";
import { DEFAULT_SKILLS, SkillProfile } from "../src/lib/types";

test("up next: goals first, then what's reachable at your level before far-off stages", () => {
  const skills: SkillProfile = { ...DEFAULT_SKILLS, frontLever: "tuck", handstand: "wall", lSit: "tuck" };
  // freestanding handstand sits at ~level 44 on the road; one-leg L-sit at ~13
  const next = nextUnlocks(skills, { frontLever: 2, handstand: 5, lSit: 4 }, ["frontLever"], {}, 20);
  assert.equal(next.length, 3);
  assert.deepEqual(
    next.map((u) => [u.skill, u.toStage]),
    [["frontLever", "advancedTuck"], ["lSit", "advanced"], ["handstand", "freestanding"]]
  );
  assert.equal(next[0].isGoal, true);
});

test("at a level where both are reachable, the higher-mastery skill comes first", () => {
  const skills: SkillProfile = { ...DEFAULT_SKILLS, handstand: "wall", lSit: "tuck" };
  const next = nextUnlocks(skills, { handstand: 5, lSit: 3 }, [], {}, 50);
  assert.deepEqual(next.slice(0, 2).map((u) => u.skill), ["handstand", "lSit"]);
});

test("skills at their final stage are never 'next'", () => {
  const next = nextUnlocks({ ...DEFAULT_SKILLS, handstand: "freestanding" }, { handstand: 5 }, [], {}, 30, 50);
  assert.ok(!next.some((u) => u.skill === "handstand"));
});

test("a beginner gets reachable first stages, not elite ones", () => {
  const next = nextUnlocks(DEFAULT_SKILLS, {}, [], {}, 1);
  assert.ok(next.length > 0);
  assert.ok(next.every((u) => u.fromStage === "none" && u.requiredLevel <= 4), JSON.stringify(next));
});

test("verified current stages are flagged", () => {
  const next = nextUnlocks({ ...DEFAULT_SKILLS, frontLever: "tuck" }, { frontLever: 4 }, ["frontLever"], {
    frontLever: { value: "tuck", status: "verified", claimedAt: "", fails: 0 },
  }, 16);
  assert.equal(next[0].verified, true);
});

test("milestones are the next nodes above your level, in order", () => {
  const m = nextMilestones(12);
  assert.equal(m.length, 3);
  assert.ok(m.every((n) => n.level > 12));
  assert.deepEqual(m.map((n) => n.level), [...m.map((n) => n.level)].sort((a, b) => a - b));
});

test("stage chain marks done / current / next / locked", () => {
  assert.deepEqual(
    stageStates("frontLever", "advancedTuck").map((s) => s.state),
    ["done", "current", "next", "locked", "locked"]
  );
  assert.deepEqual(stageStates("frontLever", "none").map((s) => s.state)[0], "next");
});
