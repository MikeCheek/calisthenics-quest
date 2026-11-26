import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ENGLISH_DETAIL_WORDS, localizeDetail } from "../src/lib/i18n/detail";
import { speakableDetail } from "../src/lib/voice";

// every literal prescription in the exercise data
function allDetails(): string[] {
  const dir = join(process.cwd(), "src/lib");
  const out = new Set<string>();
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    for (const m of readFileSync(join(dir, f), "utf8").matchAll(/detail:\s*"([^"]+)"/g)) out.add(m[1]);
  }
  return [...out];
}

test("typical prescriptions read naturally in Italian", () => {
  const cases: [string, string][] = [
    ["4 x 3-5 reps", "4 × 3-5 rip."],
    ["5 x max reps", "5 × rip. max"],
    ["3 x 30-40s per side", "3 × 30-40s per lato"],
    ["4 x 3-5 reps, 4-5s descent", "4 × 3-5 rip., discesa di 4-5s"],
    ["3 x 4-5 reps, slow lower", "3 × 4-5 rip., discesa lenta"],
    ["2 x 10 each direction", "2 × 10 per direzione"],
    ["3 x 5-8s hold", "3 × tenuta di 5-8s"],
    ["4 x max hold (target 15s+)", "4 × tenuta max (obiettivo 15s+)"],
    ["4 x max unbroken reps, rest-pause 15s between", "4 × rip. max senza pause, rest-pause di 15s"],
    ["8 min, 1-2 reps per minute", "8 min, 1-2 rip. al minuto"],
    ["3 x 6 reps, 3s down / 3s up", "3 × 6 rip., 3s giù / 3s su"],
    ["Up to 3 attempts at 5 clean reps", "Fino a 3 tentativi per 5 rip. pulite"],
    ["1 x 5 clean reps", "1 × 5 rip. pulite"],
    ["1 clean attempt", "1 tentativo pulito"],
    ["4 x 4-5 reps (+15-20% bodyweight)", "4 × 4-5 rip. (+15-20% peso corporeo)"],
  ];
  for (const [en, it] of cases) assert.equal(localizeDetail(en, "it"), it, en);
});

test("English keeps its words, with a real × after the set count", () => {
  assert.equal(localizeDetail("4 x 3-5 reps, slow", "en"), "4 × 3-5 reps, slow");
  assert.equal(localizeDetail("5 x max reps", "en"), "5 × max reps");
});

test("no English words survive in any prescription in the data", () => {
  const details = allDetails();
  assert.ok(details.length > 150, `found ${details.length}`);
  const leftovers = details.map((d) => [d, localizeDetail(d, "it")]).filter(([, it]) => ENGLISH_DETAIL_WORDS.test(it));
  assert.deepEqual(leftovers, []);
});

test("spoken Italian uses the same vocabulary", () => {
  assert.equal(speakableDetail("4 x max reps", "it"), "4 serie, massimo ripetizioni");
  assert.equal(speakableDetail("3 x 4-5 reps, slow descent", "it"), "3 serie da da 4 a 5 ripetizioni, discesa lenta".replace("da da", "da"));
  assert.equal(speakableDetail("3 x 30s per side", "it"), "3 serie da 30 secondi per lato");
  const leftovers = allDetails().map((d) => speakableDetail(d, "it")).filter((s) => ENGLISH_DETAIL_WORDS.test(s));
  assert.deepEqual(leftovers, []);
});
