import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCardSvg, cardFileName, esc, wrap, ShareCard, CardFormat } from "../src/lib/shareCards";
import { translate } from "../src/lib/i18n/tx";
import { SessionRecord } from "../src/lib/types";

const record: SessionRecord = {
  finishedAt: "2026-11-18T18:00:00Z",
  focusLabel: "Front Lever",
  durationMin: 42,
  xp: 146,
  exercises: [
    { name: "Tuck front lever holds", setTitle: "Main Focus — Front Lever", outcome: "done", sets: [{ holdSec: 12 }] },
    { name: "Pull-ups", setTitle: "Accessory — Pull Strength", outcome: "done", sets: [{ reps: 12 }] },
    { name: "Archer pull-ups", setTitle: "Accessory — Pull Strength", outcome: "tooHard" },
  ],
  records: [{ name: "Pull-ups", kind: "reps", value: 12, previous: 10 }],
};

const CARDS: ShareCard[] = [
  { kind: "session", record },
  { kind: "verified", label: "Tuck Front Lever", result: "8s", dateISO: record.finishedAt, skill: "frontLever", stage: "tuck" },
  { kind: "verified", label: "Max push-ups", result: "14 reps", dateISO: record.finishedAt },
  { kind: "record", record: record.records![0], dateISO: record.finishedAt },
  {
    kind: "progress",
    fromISO: "2026-08-01T00:00:00Z",
    dateISO: record.finishedAt,
    strength: 38,
    stages: 3,
    levels: [8, 14],
    skills: [{ name: "Front Lever", from: "Tuck", to: "One leg", skill: "frontLever", stage: "oneLeg" }],
    exercises: [{ name: "Pull-ups", from: "5 reps", to: "12 reps", change: 140 }],
  },
];

const ctx = (format: CardFormat, locale: "en" | "it" = "en", name?: string) => ({
  format, level: 14, verified: 3, verifiedTotal: 9, streak: 6, name, locale,
  tx: (e: string, v?: Record<string, string | number>) => translate(locale, e, v),
});

test("every card kind renders at the right size with no missing values", () => {
  for (const format of ["story", "square"] as CardFormat[]) {
    for (const card of CARDS) {
      const svg = buildCardSvg(card, ctx(format));
      const [w, h] = format === "story" ? [1080, 1920] : [1080, 1080];
      assert.ok(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"`));
      assert.ok(!/undefined|NaN|\[object/.test(svg), `${card.kind}/${format} has a missing value`);
    }
  }
});

test("the right numbers land on the card", () => {
  const session = buildCardSvg(CARDS[0], ctx("story"));
  assert.match(session, /42′/);
  assert.match(session, /2\/3/); // exercises done / main exercises
  assert.match(session, /\+146/);
  assert.match(session, /10 → 12 reps/);
  assert.match(buildCardSvg(CARDS[1], ctx("story")), />8s</);
  assert.match(buildCardSvg(CARDS[2], ctx("story")), />14 reps</);
});

test("cards illustrate with the stick figure when an exercise has a demo", () => {
  assert.match(buildCardSvg(CARDS[1], ctx("story")), /<svg x=/); // nested figure
  assert.match(buildCardSvg(CARDS[3], ctx("story")), /<svg x=/);
});

test("the name only appears when the athlete opts in", () => {
  assert.ok(!buildCardSvg(CARDS[0], ctx("story")).includes("Alex"));
  assert.ok(buildCardSvg(CARDS[0], ctx("story", "en", "Alex")).includes(">Alex<"));
});

test("text is XML-escaped (names can contain & < > quotes)", () => {
  assert.equal(esc(`Tom & "Jerry" <3 'x'`), "Tom &amp; &quot;Jerry&quot; &lt;3 &#39;x&#39;");
  const svg = buildCardSvg({ ...CARDS[3], record: { ...record.records![0], name: "Rows <ring> & bar" } } as ShareCard, ctx("story"));
  assert.ok(svg.includes("Rows &lt;ring&gt; &amp; bar"));
  assert.ok(!svg.includes("<ring>"));
});

test("long titles wrap and truncate cleanly", () => {
  assert.deepEqual(wrap("Advanced tuck back lever raises", 16, 2), ["Advanced tuck", "back lever…"]);
  assert.deepEqual(wrap("Planche", 16, 2), ["Planche"]);
});

test("cards are translated", () => {
  const it = buildCardSvg(CARDS[3], ctx("story", "it"));
  assert.match(it, /NUOVO RECORD PERSONALE/);
  assert.match(it, /10 → 12 ripetizioni/);
  assert.match(it, /Livello 14/);
});

test("file names are safe", () => {
  assert.equal(cardFileName(CARDS[1]), "barquests-verified-tuck-front-lever.png");
});

test("the progress card leads with the strength change, then skills and exercises", () => {
  const svg = buildCardSvg(CARDS[4], ctx("story"));
  assert.ok(svg.includes("+38% stronger"));
  assert.ok(svg.includes("Tuck → One leg"));
  assert.ok(svg.includes("5 reps → 12 reps"));
  assert.ok(svg.includes("THEN VS NOW"));
  const it = buildCardSvg(CARDS[4], ctx("story", "it"));
  assert.ok(it.includes("+38% più forte"));
  assert.equal(cardFileName(CARDS[4]), "barquests-then-vs-now-2026-11-18.png");
  // no strength number: stages, then levels
  const noStrength = { ...(CARDS[4] as Extract<ShareCard, { kind: "progress" }>), strength: null };
  assert.ok(buildCardSvg(noStrength, ctx("square")).includes("+3 skill stages"));
  assert.ok(buildCardSvg({ ...noStrength, stages: 0 }, ctx("square")).includes("Level 8 → 14"));
});
