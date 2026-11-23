import { test } from "node:test";
import assert from "node:assert/strict";
import { advise, hoursOf, isWet, roundCoord, tipFor, trainingHour, type Forecast } from "../src/lib/weather";
import { floorOnly } from "../src/lib/todayEquipment";
import { DEFAULT_EQUIPMENT } from "../src/lib/types";
import { translate } from "../src/lib/i18n/tx";

// a day of hours; `wet` hours get 80% rain
function day(opts: { wet?: number[]; feels?: number } = {}): Forecast {
  const hrs = Array.from({ length: 24 }, (_, h) => h);
  return {
    hourly: {
      time: hrs.map((h) => `2026-11-23T${String(h).padStart(2, "0")}:00`),
      temperature_2m: hrs.map(() => 14),
      apparent_temperature: hrs.map(() => opts.feels ?? 13),
      precipitation_probability: hrs.map((h) => (opts.wet?.includes(h) ? 80 : 5)),
      precipitation: hrs.map((h) => (opts.wet?.includes(h) ? 1.2 : 0)),
      weather_code: hrs.map((h) => (opts.wet?.includes(h) ? 63 : 2)),
    },
  };
}
const at = { day: "2026-11-23", hour: 18, from: 9, minutes: 45 };

test("dry at the usual hour", () => {
  const a = advise(day(), at)!;
  assert.equal(a.kind, "dry");
  assert.equal(a.at.hour, 18);
});

test("rain at the usual hour: the closest dry hour, earlier or later", () => {
  const earlier = advise(day({ wet: [17, 18, 19, 20, 21] }), at)!;
  assert.equal(earlier.kind, "moveEarlier");
  assert.equal((earlier as { window: { hour: number } }).window.hour, 16);
  const later = advise(day({ wet: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18] }), at)!;
  assert.equal(later.kind, "moveLater");
  assert.equal(later.kind === "moveLater" && later.window.hour, 19);
});

test("wet all day ahead: indoors", () => {
  assert.equal(advise(day({ wet: Array.from({ length: 24 }, (_, h) => h) }), at)!.kind, "indoors");
  // dry earlier this morning doesn't count once it's past
  assert.equal(advise(day({ wet: Array.from({ length: 15 }, (_, h) => h + 9) }), { ...at, from: 12 })!.kind, "indoors");
});

test("a long session needs every hour dry", () => {
  const a = advise(day({ wet: [19] }), { ...at, minutes: 90 })!;
  assert.notEqual(a.kind, "dry");
});

test("past the usual hour: looks from now", () => {
  const a = advise(day(), { ...at, hour: 7, from: 15 })!;
  assert.equal(a.at.hour, 15);
});

test("tips for heat and cold", () => {
  assert.equal(tipFor({ feels: 33 }), "hot");
  assert.equal(tipFor({ feels: 2 }), "cold");
  assert.equal(tipFor({ feels: 18 }), undefined);
  assert.equal(advise(day({ feels: 34 }), at)!.kind === "dry" && (advise(day({ feels: 34 }), at) as { tip?: string }).tip, "hot");
});

test("wet means likely or measurable rain", () => {
  assert.equal(isWet({ rainChance: 20, rainMm: 0, code: 2 }), false);
  assert.equal(isWet({ rainChance: 70, rainMm: 0, code: 3 }), true);
  assert.equal(isWet({ rainChance: 10, rainMm: 0.5, code: 61 }), true);
  assert.equal(hoursOf(day(), "2026-11-24").length, 0);
});

test("the training hour: reminder, else last session's start, else 18", () => {
  assert.equal(trainingHour({ notifications: { enabled: true, time: "07:30" } }), 7);
  const end = new Date(2026, 10, 20, 19, 10);
  assert.equal(trainingHour({ notifications: { enabled: false, time: "07:30" }, lastSessionDateISO: end.toISOString(), body: { sessionLengthMinutes: 60 } }), 18);
  assert.equal(trainingHour({}), 18);
});

test("only rounded coordinates leave the device; floor-only keeps bands and weights", () => {
  assert.equal(roundCoord(45.464211), 45.46);
  const f = floorOnly({ ...DEFAULT_EQUIPMENT, resistanceBands: true });
  assert.equal(f.pullUpBar, false);
  assert.equal(f.parallelBars, false);
  assert.equal(f.resistanceBands, true);
});

test("weather copy is in Italian", () => {
  for (const p of ["Train indoors today", "Today: indoors, floor only", "Use location", "Hide the weather"]) assert.notEqual(translate("it", p), p);
  assert.equal(translate("it", "Rain likely at {t} ({p}%)", { t: "18:00", p: 70 }), "Pioggia probabile alle 18:00 (70%)");
});
