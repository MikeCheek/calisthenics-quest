import { test } from "node:test";
import assert from "node:assert/strict";
import { nextUnlocks, nextMilestones, stageStates } from "../src/lib/skillTree";
import { DEFAULT_SKILLS, SkillProfile } from "../src/lib/types";

test("up next: closest to the next stage first, then nearest your level — goals don't jump the queue", () => {
  const skills: SkillProfile = { ...DEFAULT_SKILLS, frontLever: "tuck", handstand: "wall", lSit: "tuck" };
  // at level 20: one-leg L-sit sits at ~13 on the road, freestanding
  // handstand at ~44, advanced-tuck front lever at ~40
  const next = nextUnlocks(skills, { frontLever: 2, handstand: 5, lSit: 4 }, ["frontLever"], {}, 20);
  assert.deepEqual(
    next.map((u) => [u.skill, u.toStage]),
    [["lSit", "advanced"], ["handstand", "freestanding"], ["frontLever", "advancedTuck"]]
  );
  assert.equal(next[2].isGoal, true);
});

test("a goal breaks a tie between otherwise equal skills", () => {
  const skills: SkillProfile = { ...DEFAULT_SKILLS, frontLever: "tuck", backLever: "tuck" };
  const plain = nextUnlocks(skills, { frontLever: 3, backLever: 3 }, [], {}, 45);
  const withGoal = nextUnlocks(skills, { frontLever: 3, backLever: 3 }, ["backLever"], {}, 45);
  assert.equal(withGoal[0].skill, "backLever");
  assert.ok(plain.length >= 2);
});

test("a verified stage moves up; a missed Skill Check moves down and is flagged", () => {
  const skills: SkillProfile = { ...DEFAULT_SKILLS, frontLever: "tuck", backLever: "tuck" };
  const claim = (status: "verified" | "unconfirmed") => ({ value: "tuck", status, claimedAt: "", fails: status === "unconfirmed" ? 1 : 0 });
  const verifiedBack = nextUnlocks(skills, { frontLever: 3, backLever: 3 }, [], { backLever: claim("verified") }, 45);
  assert.equal(verifiedBack[0].skill, "backLever");
  const missedFront = nextUnlocks(skills, { frontLever: 4, backLever: 3 }, [], { frontLever: claim("unconfirmed") }, 45);
  assert.equal(missedFront[0].skill, "backLever");
  assert.equal(missedFront.find((u) => u.skill === "frontLever")?.unconfirmed, true);
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
