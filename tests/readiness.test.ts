import { test } from "node:test";
import assert from "node:assert/strict";
import { adaptSession } from "../src/lib/adaptation";
import { inSwitch, plateauVariant, trackPlateaus, PLATEAU_SESSIONS, SWITCH_DAYS } from "../src/lib/plateau";
import { applyReadiness, lighterActive, lighterDay, nextLighterWeek, scaleSets, tiredSignal, LIGHTER_EVERY, type LighterWeek } from "../src/lib/readiness";
import { translate } from "../src/lib/i18n/tx";
import { DEFAULT_EQUIPMENT, type ExerciseBest, type ExerciseFeedback, type ExerciseStat, type TrainingSession } from "../src/lib/types";

const DAY = 86_400_000;
const at = (d: string) => `${d}T18:00:00.000Z`;
const plus = (d: string, n: number) => new Date(Date.parse(`${d}T12:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const stat = (extra: Partial<ExerciseStat> = {}): ExerciseStat => ({ p: 0, done: 8, skipped: 0, tooHard: 0, last: at("2026-11-01"), ...extra });
const done = (name: string): ExerciseFeedback => ({ name, outcome: "done", setTitle: "Main Focus — Front Lever" });
const one = (name: string, detail: string): TrainingSession => ({
  id: "t",
  dateISO: "2026-12-10",
  focusLabel: "x",
  estXp: 0,
  sets: [{ track: "frontLever", title: "Main Focus — Front Lever", exercises: [{ name, detail, restSeconds: 120 }] }],
});

// ---- plateaus ----

test("no new best for three weeks of training: a two-week switch starts", () => {
  const records: Record<string, ExerciseBest> = { tuck_front_lever_holds: { hold: 14, dateISO: at("2026-11-01") } };
  let stats: Record<string, ExerciseStat> = { tuck_front_lever_holds: stat() };
  let day = "2026-11-08";
  // six sessions three days apart: the last is 22 days after the best
  for (let i = 0; i <= PLATEAU_SESSIONS; i++) {
    stats = trackPlateaus(stats, records, [done("Tuck front lever holds")], new Set(), at(day));
    day = plus(day, 3);
  }
  const s = stats.tuck_front_lever_holds;
  assert.ok(s.pl, "switch started");
  assert.ok(inSwitch(s, at(plus(s.pl!.slice(0, 10), SWITCH_DAYS - 1))));
  assert.ok(!inSwitch(s, at(plus(s.pl!.slice(0, 10), SWITCH_DAYS))), "two weeks, then back");
});

test("a new best resets it; a few sessions or a recent best don't start one", () => {
  const records: Record<string, ExerciseBest> = { pull_ups: { reps: 12, dateISO: at("2026-11-25") } };
  let stats: Record<string, ExerciseStat> = { pull_ups: stat({ sb: 9 }) };
  stats = trackPlateaus(stats, records, [done("Pull-ups")], new Set(), at("2026-11-28"));
  assert.equal(stats.pull_ups.pl, undefined, "the best is only three days old");
  stats = trackPlateaus({ pull_ups: stat({ sb: 4, pl: at("2026-11-20") }) }, records, [done("Pull-ups")], new Set(["pull_ups"]), at("2026-11-28"));
  assert.equal(stats.pull_ups.sb, 0);
  assert.equal(stats.pull_ups.pl, undefined, "a new best ends the switch");
});

test("the switch: band or clustered holds, weighted or slow-negative reps", () => {
  const hold = { name: "Tuck front lever holds", detail: "4 x max hold", restSeconds: 120 };
  assert.equal(plateauVariant(hold, { ...DEFAULT_EQUIPMENT, resistanceBands: true }, { hold: 14 })!.detail, "4 x 18s with a band");
  const cluster = plateauVariant(hold, { ...DEFAULT_EQUIPMENT, resistanceBands: false }, { hold: 14 })!;
  assert.equal(cluster.detail, "8 x 7s");
  assert.ok(cluster.restSeconds < hold.restSeconds);
  const reps = { name: "Pull-ups", detail: "4 x 8-10 reps", restSeconds: 90 };
  assert.equal(plateauVariant(reps, { ...DEFAULT_EQUIPMENT, weights: true }, undefined)!.detail, "4 x 5-7 reps, weighted");
  assert.equal(plateauVariant(reps, { ...DEFAULT_EQUIPMENT, weights: false }, undefined)!.detail, "4 x 4-5 reps, 5s lower");
  assert.equal(plateauVariant({ ...reps, detail: "4 x 5 reps, 4s descent" }, DEFAULT_EQUIPMENT, undefined), null, "already slow");

  // generation reads it, with a note that says why
  const stats = { pull_ups: stat({ pl: at("2026-12-05") }) };
  const ex = adaptSession(one("Pull-ups", "4 x 8-10 reps"), stats, { ...DEFAULT_EQUIPMENT, weights: false }).sets[0].exercises[0];
  assert.equal(ex.detail, "4 x 4-5 reps, 5s lower");
  assert.equal(ex.adaptNote, "No new best in three weeks — slow negatives for two weeks");
  assert.equal(translate("it", ex.adaptNote!), "Nessun record da tre settimane — negative lente per due settimane");
});

// ---- readiness ----

const session = (): TrainingSession => ({
  id: "t",
  dateISO: "2026-12-10",
  focusLabel: "x",
  estXp: 0,
  sets: [
    { track: "warmup", title: "Warm-Up", exercises: [{ name: "Arm circles", detail: "2 x 30s", restSeconds: 0 }] },
    {
      track: "frontLever",
      title: "Main Focus — Front Lever",
      exercises: [
        { name: "Tuck front lever holds", detail: "4 x max hold", restSeconds: 120 },
        { name: "Front lever pulls", detail: "3 x 5 reps", restSeconds: 90 },
        { name: "Scapula pulls (hang)", detail: "3 x 8 reps", restSeconds: 60 },
      ],
    },
    { track: "pushStrength", title: "Accessory — Push Strength", exercises: [{ name: "Dips", detail: "4 x 8-10 reps", restSeconds: 90 }, { name: "Plank", detail: "60s", restSeconds: 30 }] },
  ],
});
const details = (s: TrainingSession) => s.sets.map((x) => x.exercises.map((e) => e.detail));

test("tired: about a quarter fewer sets (never under two, warm-up untouched)", () => {
  const s = applyReadiness(session(), "tired");
  assert.deepEqual(details(s), [["2 x 30s"], ["3 x max hold", "2 x 5 reps", "2 x 8 reps"], ["3 x 8-10 reps", "60s"]]);
  assert.equal(s.sets[1].exercises[0].adaptNote, "Easier today — you said you're tired");
});

test("strong: one more set on the key work; OK changes nothing", () => {
  const s = applyReadiness(session(), "strong");
  assert.deepEqual(details(s)[1], ["5 x max hold", "4 x 5 reps", "3 x 8 reps"]);
  assert.deepEqual(details(s)[2], ["4 x 8-10 reps", "60s"]);
  assert.deepEqual(applyReadiness(session(), "ok"), session());
  assert.deepEqual(applyReadiness(session(), null), session());
});

// ---- lighter weeks ----

const effort = (ratio: number, tired = false) => ({ at: at("2026-12-01"), planned: 100, done: 100 * ratio, tired });

test("the tired signal: pressing I'm tired, doing well under the plan, or saying so", () => {
  assert.ok(tiredSignal([effort(0.6, true), effort(0.7, true), effort(1), effort(0.5, true)], []));
  assert.ok(tiredSignal([effort(0.5), effort(0.55), effort(0.5), effort(0.9)], []));
  assert.ok(!tiredSignal([effort(1), effort(0.9), effort(0.95), effort(0.5)], []), "one short session isn't a trend");
  assert.ok(tiredSignal([], [{ d: "1", r: "tired" }, { d: "2", r: "tired" }, { d: "3", r: "ok" }, { d: "4", r: "tired" }]));
});

test("a lighter week starts tomorrow when the signs pile up, or after enough sessions — not inside a training block", () => {
  const tired = [effort(0.5, true), effort(0.5, true), effort(0.5, true), effort(0.5, true)];
  let w: LighterWeek | undefined;
  for (let i = 0; i < 5; i++) w = nextLighterWeek(w, tired, [], "2026-12-01", false);
  assert.deepEqual(w, { sessions: 5 }, "needs some training first");
  w = nextLighterWeek(w, tired, [], "2026-12-01", false);
  assert.deepEqual(w, { from: "2026-12-02", sessions: 0, why: "tired" });
  assert.ok(lighterActive(w, "2026-12-08") && !lighterActive(w, "2026-12-09"));
  assert.equal(lighterDay(w as LighterWeek & { from: string }, "2026-12-07"), 6);
  // sessions during it don't restart it, and the count begins again once it's over
  assert.deepEqual(nextLighterWeek(w, tired, [], "2026-12-05", false), w);
  assert.deepEqual(nextLighterWeek(w, [], [], "2026-12-10", false), { sessions: 1 });

  let due: LighterWeek | undefined;
  for (let i = 0; i < LIGHTER_EVERY; i++) due = nextLighterWeek(due, [], [], "2026-12-01", false);
  assert.equal(due!.why, "due");
  assert.deepEqual(nextLighterWeek({ sessions: 30 }, tired, [], "2026-12-01", true), { sessions: 31 }, "a block has its own deload week");
});

test("a lighter week is about 60% of the sets", () => {
  const s = scaleSets(session(), 0.6, "Lighter week: recovering on purpose");
  assert.deepEqual(details(s)[1], ["2 x max hold", "2 x 5 reps", "2 x 8 reps"]);
  assert.equal(translate("it", s.sets[1].exercises[0].adaptNote!), "Settimana leggera: recupero voluto");
});
