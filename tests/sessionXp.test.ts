import { test } from "node:test";
import assert from "node:assert/strict";
import { earnedXp, plannedXp, xpRules } from "../src/lib/sessionXp";
import { levelFromXp } from "../src/lib/xp";
import { levelProgress } from "../src/lib/levelPath";
import { generateSession } from "../src/lib/trainingGenerator";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, SkillProfile } from "../src/lib/types";

const session = generateSession({ ...DEFAULT_SKILLS, frontLever: "tuck" } as SkillProfile, DEFAULT_EQUIPMENT, "frontLever");
const all = session.sets.flatMap((s) => s.exercises.map((e) => ({ name: e.name, setTitle: s.title, outcome: "done" as const, detail: e.detail })));

test("doing everything earns the planned XP; skipping earns nothing for that exercise", () => {
  assert.equal(earnedXp(session, all, { verified: 0, records: 0 }).total, plannedXp(session));
  const skipped = all.map((f, i) => (i === all.length - 2 ? { ...f, outcome: "skipped" as const } : f));
  assert.ok(earnedXp(session, skipped, { verified: 0, records: 0 }).total < plannedXp(session));
});

test("only the sets done count", () => {
  const i = all.findIndex((f) => /^\d+\s*x/.test(f.detail ?? "") && parseInt(f.detail!, 10) >= 3);
  const partial = all.map((f, j) => (j === i ? { ...f, setsDone: 1 } : f));
  assert.ok(earnedXp(session, partial, { verified: 0, records: 0 }).total < earnedXp(session, all, { verified: 0, records: 0 }).total);
});

test("harder stages earn more for the same session shape", () => {
  const harder = generateSession({ ...DEFAULT_SKILLS, frontLever: "straddle" } as SkillProfile, DEFAULT_EQUIPMENT, "frontLever");
  assert.ok(plannedXp(harder) > plannedXp(session), `${plannedXp(harder)} vs ${plannedXp(session)}`);
});

test("proving skills and records add bonuses", () => {
  const base = earnedXp(session, all, { verified: 0, records: 0 }).total;
  assert.equal(earnedXp(session, all, { verified: 1, records: 2 }).total, base + xpRules().verified + 2 * xpRules().record);
});

test("the level is experience only", () => {
  assert.equal(levelProgress(0).level, 1);
  assert.equal(levelProgress(5200).level, levelFromXp(5200));
});
