import { test } from "node:test";
import assert from "node:assert/strict";
import { comeback, BREAK_DAYS } from "../src/lib/comeback";

const NOW = new Date(2026, 10, 27, 10); // Friday 27 November
const ago = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

test("a week or more off is a comeback; less isn't", () => {
  assert.equal(comeback({ lastSessionDateISO: ago(BREAK_DAYS - 1), streak: 3 }, NOW), null);
  assert.deepEqual(comeback({ lastSessionDateISO: ago(12), streak: 6 }, NOW), { days: 12, streakEnded: 6 });
  assert.equal(comeback({ lastSessionDateISO: ago(9), streak: 1 }, NOW)!.streakEnded, undefined, "a one-week streak isn't worth a word");
  assert.equal(comeback({ lastSessionDateISO: undefined, streak: 0 }, NOW), null, "never trained: not a comeback");
  // stored as a plain day too
  assert.equal(comeback({ lastSessionDateISO: "2026-11-15", streak: 0 }, NOW)!.days, 12);
});
