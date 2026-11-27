import { test } from "node:test";
import assert from "node:assert/strict";
import { addLoad, easeTired, groupsOf, restAwareFocus, sessionLoad, shiftDay, tiredGroups, volumeAccessory, weekLoad, LOAD_DAYS, type LoadDay } from "../src/lib/muscleLoad";
import { generateSession, availableFocuses, FOCUS_LABEL } from "../src/lib/trainingGenerator";
import { applyExerciseFeedback } from "../src/lib/adaptation";
import { translate } from "../src/lib/i18n/tx";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, type ExerciseFeedback, type ExerciseStat, type SkillProfile, type SkillTrack, type TrainingSet } from "../src/lib/types";

const skills = { ...DEFAULT_SKILLS, pullUpMaxReps: 12, dipMaxReps: 15, pushUpMaxReps: 30, frontLever: "advancedTuck", planche: "tuck", handstand: "wall" } as unknown as SkillProfile;
const eq = { ...DEFAULT_EQUIPMENT, resistanceBands: true };
const label = (t: SkillTrack) => FOCUS_LABEL[t];
const TODAY = "2026-12-10";

test("exercises map to the muscles they load", () => {
  assert.deepEqual(groupsOf("Pull-ups"), ["pull"]);
  assert.deepEqual(groupsOf("Tuck front lever holds"), ["pull", "core"]);
  assert.deepEqual(groupsOf("Pseudo planche push-ups"), ["push", "wrists"]);
  assert.deepEqual(groupsOf("Hanging leg raises (straight legs)"), ["core"], "hanging, but it's core work");
  assert.deepEqual(groupsOf("Pike compression holds"), ["core"]);
  assert.deepEqual(groupsOf("Pike push-ups"), ["push"]);
  assert.deepEqual(groupsOf("Bulgarian split squats"), ["legs"]);
  assert.deepEqual(groupsOf("Wall handstand holds"), ["push", "wrists"]);
});

test("every library exercise loads some muscle group", async () => {
  const { allExercises } = await import("../src/lib/exerciseHierarchy");
  const none = allExercises().map((x) => x.exercise.name).filter((n) => groupsOf(n).length === 0);
  assert.deepEqual(none, []);
});

test("a session's load: done work only, counted in sets; yoga and Pilates at half", () => {
  const fb: ExerciseFeedback[] = [
    { name: "Pull-ups", outcome: "done", setTitle: "Main Focus — Pull Strength", detail: "4 x 6-8 reps" },
    { name: "Australian / inverted rows", outcome: "done", setTitle: "Main Focus — Pull Strength", detail: "3 x 10 reps", setsDone: 2 },
    { name: "Wall walks", outcome: "skipped", setTitle: "Accessory — Push Strength", detail: "3 x 3 reps" },
    { name: "Scapula pulls (hang)", outcome: "done", setTitle: "Warm-Up", detail: "2 x 8 reps" },
  ];
  assert.deepEqual(sessionLoad(fb), { pull: 6 });
  assert.deepEqual(sessionLoad([{ name: "Crow pose", outcome: "done", setTitle: "Arm balances", detail: "4 x 15s" }], "yoga"), { push: 2, wrists: 2, });
});

test("the log merges a day's sessions and keeps two weeks", () => {
  let log: LoadDay[] = [];
  for (let i = 0; i < 20; i++) log = addLoad(log, shiftDay(TODAY, i - 19), { pull: 2 });
  log = addLoad(log, TODAY, { pull: 3, core: 2 });
  assert.equal(log.length, LOAD_DAYS);
  assert.deepEqual(log.at(-1), { d: TODAY, g: { pull: 5, core: 2 } });
  assert.equal(weekLoad(log, TODAY).pull, 6 * 2 + 5);
});

test("a hard pulling day yesterday: today's front lever moves to a goal that trains something else", () => {
  const log = addLoad([], shiftDay(TODAY, -1), { pull: 12, core: 3 });
  assert.equal(tiredGroups(log, TODAY).get("pull"), 12);
  const options = availableFocuses(eq);
  const moved = restAwareFocus("frontLever", options, ["frontLever", "planche"], log, TODAY, label);
  assert.equal(moved.focus, "planche");
  assert.equal(moved.why, "Planche instead of Front Lever — Pulling: 12 hard sets yesterday, it rests today");
  // two days later it's fine again
  assert.equal(restAwareFocus("frontLever", options, ["frontLever"], log, shiftDay(TODAY, 1), label).focus, "frontLever");
  // a light pulling day doesn't move anything
  assert.equal(restAwareFocus("frontLever", options, [], addLoad([], shiftDay(TODAY, -1), { pull: 4 }), TODAY, label).focus, "frontLever");
});

test("nothing fresh to move to: the same focus, a set lighter where it's tired", () => {
  const log = addLoad([], shiftDay(TODAY, -1), { pull: 12 });
  const sets: TrainingSet[] = [
    { track: "pullStrength", title: "Main Focus — Pull Strength", exercises: [{ name: "Pull-ups", detail: "4 x 6-8 reps", restSeconds: 90 }, { name: "Hollow body rocks", detail: "3 x 20 reps", restSeconds: 60 }, { name: "Scapula pulls (hang)", detail: "2 x 8 reps", restSeconds: 60 }] },
  ];
  const [eased] = easeTired(sets, log, TODAY);
  assert.deepEqual(eased.exercises.map((e) => e.detail), ["3 x 6-8 reps", "3 x 20 reps", "2 x 8 reps"], "never under two sets, and core is fresh");
  assert.equal(eased.why, "Lighter today — Pulling: 12 hard sets yesterday");
});

test("the accessory goes where the week is short, never to what's tired or what the focus trains", () => {
  const avail = availableFocuses(eq);
  // plenty of pushing and core this week, no legs yet
  const log = [{ d: shiftDay(TODAY, -3), g: { push: 14, core: 8, pull: 4 } }];
  const pick = volumeAccessory("frontLever", avail, log, TODAY)!;
  assert.equal(pick.track, "legs");
  assert.equal(pick.why, "Legs: 0 of 8 hard sets this week");
  // a hard push day yesterday: not pushing, even if it's the shortest
  const tired = [{ d: shiftDay(TODAY, -1), g: { push: 9 } }, { d: shiftDay(TODAY, -2), g: { legs: 10, core: 10 } }];
  assert.notEqual(volumeAccessory("frontLever", avail, tired, TODAY)!.track, "pushStrength");
  assert.notEqual(volumeAccessory("frontLever", avail, [], TODAY)!.track, "pullStrength", "never the focus's own group");
});

test("generated sessions use the log, and say why", () => {
  const stats: Record<string, ExerciseStat> = applyExerciseFeedback({}, [{ name: "Tuck front lever holds", outcome: "done", setTitle: "Main Focus — Front Lever" }], "2026-11-20T18:00:00.000Z");
  const log = [{ d: shiftDay(TODAY, -3), g: { push: 14, core: 8, pull: 10 } }];
  const s = generateSession(skills, eq, "frontLever", new Date(`${TODAY}T10:00:00Z`), 60, { stats, load: log });
  const acc = s.sets.find((x) => x.title.startsWith("Accessory"))!;
  assert.equal(acc.title, "Accessory — Legs");
  assert.equal(acc.why, "Legs: 0 of 8 hard sets this week");
  const main = s.sets.find((x) => x.title.startsWith("Main Focus"))!;
  assert.match(main.why!, /^The key exercise every time; the rest rotate · .+: (new for you|last done \d+ days ago)$/);
  assert.match(s.sets.find((x) => x.title.startsWith("Strength for"))!.why!, /^Builds the strength Front Lever needs/);
  // and it still varies, nothing twice
  const names = s.sets.filter((x) => x.track !== "warmup" && x.track !== "finisher").flatMap((x) => x.exercises.map((e) => e.name));
  assert.equal(new Set(names).size, names.length);
});

test("the reasons read in Italian", () => {
  const t = translate;
  assert.equal(t("it", "Legs: 0 of 8 hard sets this week"), "Gambe: 0 di 8 serie dure questa settimana");
  assert.equal(t("it", "Lighter today — Pulling: 12 hard sets yesterday"), "Più leggero oggi — Tirata: 12 serie dure ieri");
  assert.equal(t("it", "The key exercise every time; the rest rotate · Pull-ups: last done 9 days ago"), "L'esercizio chiave ogni volta; gli altri ruotano · Pull-ups: ultima volta 9 giorni fa");
});
