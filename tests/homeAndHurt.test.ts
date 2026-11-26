import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSession } from "../src/lib/trainingGenerator";
import { adaptSession, applyExerciseFeedback, gentlerFor, HURT_REST_DAYS } from "../src/lib/adaptation";
import { atHome } from "../src/lib/todayEquipment";
import { findEasierExercise } from "../src/lib/exerciseHierarchy";
import { demoFor } from "../src/lib/demos/catalog";
import { guideIdFor } from "../src/lib/guides/index";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, type ExerciseStat } from "../src/lib/types";

const home = atHome({ ...DEFAULT_EQUIPMENT });
const names = (s: ReturnType<typeof generateSession>) => s.sets.flatMap((x) => x.exercises.map((e) => e.name));

test("at home with no bar, the session still pulls — door, towel and table rows", () => {
  for (const pullUpMaxReps of [0, 6, 15]) {
    const s = generateSession({ ...DEFAULT_SKILLS, pullUpMaxReps }, home, "legs", new Date(2026, 10, 26));
    const pull = s.sets.find((x) => x.track === "pullStrength");
    assert.ok(pull, `a pulling block at ${pullUpMaxReps} pull-ups`);
    assert.ok(pull.exercises.some((e) => /door frame rows|towel door rows|table rows/i.test(e.name)), pull.exercises.map((e) => e.name).join(", "));
    assert.ok(!names(s).some((n) => /pull-up|dead hang/i.test(n)), "nothing that needs a bar");
  }
  // a bar at home: no stand-ins needed
  const withBar = generateSession(DEFAULT_SKILLS, atHome({ ...DEFAULT_EQUIPMENT, homeBar: true }), "legs", new Date(2026, 10, 26));
  assert.ok(!names(withBar).some((n) => /door frame rows|towel door rows|table rows/i.test(n)));
});

test("home rows and chair dips have a ladder, an animation and a guide", () => {
  assert.equal(findEasierExercise("Table rows", home)?.name, "Towel door rows");
  assert.equal(findEasierExercise("Towel door rows", home)?.name, "Door frame rows");
  for (const n of ["Door frame rows", "Towel door rows", "Table rows", "Single-arm door frame rows", "Chair dips"]) {
    assert.ok(demoFor(n), `${n} demo`);
    assert.ok(guideIdFor(n), `${n} guide`);
  }
  assert.equal(guideIdFor("Chair dips"), "chairDip");
  assert.equal(guideIdFor("Towel door rows"), "homeRow");
});

const at = (iso: string) => `${iso}T12:00:00.000Z`;

test("this hurts: rested two weeks with a gentler rung, then back with a careful note", () => {
  const eq = { ...DEFAULT_EQUIPMENT };
  const stats = applyExerciseFeedback({}, [{ name: "Pull-ups", outcome: "skipped", hurt: true, setTitle: "Accessory — Pull Strength" }], at("2026-11-01"));
  const s = stats[Object.keys(stats)[0]] as ExerciseStat;
  assert.equal(s.hurt, at("2026-11-01"));
  assert.equal(s.skipped, 0, "pain isn't counted as a skip");
  assert.equal(s.p, 0, "or as too hard");

  const session = (day: string) => ({ id: "x", dateISO: day, focusLabel: "Pull", estXp: 0, sets: [{ track: "pullStrength" as const, title: "Accessory — Pull Strength", exercises: [{ name: "Pull-ups", detail: "5 x max reps", restSeconds: 120 }] }] });
  const during = adaptSession(session("2026-11-05"), stats, eq).sets[0].exercises[0];
  assert.notEqual(during.name, "Pull-ups");
  assert.equal(during.adaptedFrom, "Pull-ups");
  assert.match(during.adaptNote ?? "", /it hurt recently/);

  const after = adaptSession(session("2026-11-20"), stats, eq).sets[0].exercises[0];
  assert.equal(after.name, "Pull-ups");
  assert.match(after.adaptNote ?? "", /Back after a break/);

  const later = adaptSession(session("2027-01-10"), stats, eq).sets[0].exercises[0];
  assert.equal(later.adaptNote, undefined, "after the watch period it's an ordinary exercise again");

  // done cleanly after the break: the pain flag is cleared
  const cleared = applyExerciseFeedback(stats, [{ name: "Pull-ups", outcome: "done", setTitle: "Accessory — Pull Strength" }], at("2026-11-20"));
  assert.equal(cleared[Object.keys(cleared)[0]].hurt, undefined);
  assert.ok(HURT_REST_DAYS >= 14);
});

test("the gentler swap skips rungs that hurt recently too", () => {
  const eq = { ...DEFAULT_EQUIPMENT };
  const one = findEasierExercise("Pull-ups", eq)!.name;
  const stats = applyExerciseFeedback({}, [{ name: one, outcome: "skipped", hurt: true, setTitle: "Accessory — Pull Strength" }], at("2026-11-01"));
  const g = gentlerFor("Pull-ups", eq, stats, at("2026-11-03"));
  assert.ok(g);
  assert.notEqual(g!.name, one);
});

test("a skill check is one set, like a test — not a whole exercise", async () => {
  const { checkExercise } = await import("../src/lib/verification");
  const { localizedDescription } = await import("../src/lib/exerciseTiming");
  const hold = checkExercise({ key: "planche", kind: "hold", target: 5, label: "Tuck planche" });
  assert.equal(hold.detail, "1 x 5s");
  const reps = checkExercise({ key: "muscleUp", kind: "reps", target: 3, label: "Muscle-up" });
  assert.equal(reps.detail, "1 x 3 clean reps");
  const pass = checkExercise({ key: "handstand", kind: "pass", target: 1, label: "Freestanding handstand" });
  assert.equal(pass.detail, "1 clean attempt");
  for (const e of [hold, reps, pass]) {
    assert.doesNotMatch(e.detail, /^[2-9] x|attempts/);
    assert.match(localizedDescription(e, "it") ?? "", /^Verifica la tua dichiarazione/);
  }
});
