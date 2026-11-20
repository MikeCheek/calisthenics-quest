import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { translate } from "../src/lib/i18n/tx";
import { RANK_TITLES } from "../src/lib/xp";

// Product decision: rank titles, skill names and exercise names stay in
// English whatever the language (the calisthenics community uses the English
// names: "handstand", "tuck", "skill"). This
// fails if a phrase-table entry ever turns one of them into Italian.

const EXERCISE_FILES = [
  "trainingData.ts",
  "advancedSkills.ts",
  "advancedSkills2.ts",
  "bandBonus.ts",
  "exerciseHierarchy.ts",
  "warmupFinisher.ts",
];

function exerciseNames(): string[] {
  const names = new Set<string>();
  for (const f of EXERCISE_FILES) {
    const src = readFileSync(join(process.cwd(), "src/lib", f), "utf8");
    for (const m of src.matchAll(/\bname:\s*"([^"]+)"/g)) names.add(m[1]);
  }
  return [...names];
}

test("rank titles stay English in Italian", () => {
  for (const { title } of RANK_TITLES) assert.equal(translate("it", title), title);
});

// Exercise names are never passed through the translator on their own; they
// only reach it inside generated notes, via {ex} placeholders (checked
// below). A few are spelled exactly like a translated skill name, which is
// fine as long as those notes use {ex}. This list makes any new overlap a
// deliberate choice.
const SHARED_WITH_SKILL_NAMES = ["Freestanding HSPU", "Handstand walk", "Pike press to handstand"];

test("no other exercise name collides with a translated phrase", () => {
  const names = exerciseNames();
  assert.ok(names.length > 100, `found only ${names.length} exercise names`);
  const translated = names.filter((n) => translate("it", n) !== n && !SHARED_WITH_SKILL_NAMES.includes(n));
  assert.deepEqual(translated, []);
});

test("generated notes that carry exercise names use {ex}", () => {
  const src = ["adaptation.ts"].map((f) => readFileSync(join(process.cwd(), "src/lib", f), "utf8")).join("\n");
  const notes = [...src.matchAll(/adaptNote: `([^`]*\$\{ex\.name\}[^`]*)`/g)];
  assert.ok(notes.length >= 2, `found ${notes.length} notes`);
  for (const m of notes) {
    const sample = m[1].replace("${ex.name}", "Handstand walk").replace(/\$\{why\}/, "skipped it");
    const it = translate("it", sample);
    assert.notEqual(it, sample, sample);
    assert.ok(it.includes("Handstand walk"), it);
  }
});

test("exercise names inside generated notes stay English, the rest is translated", () => {
  // "Handstand walk" is both an exercise and a (translated) side-skill name
  assert.equal(
    translate("it", "Eased from Handstand walk — you skipped it recently"),
    "Alleggerito da Handstand walk — di recente l'hai saltato"
  );
  assert.equal(translate("it", "Stepped up from Pike press to handstand — you've been nailing it"), "Salito da Pike press to handstand — lo stai dominando");
  // the specific "Swapped in" toasts aren't swallowed by the general form
  assert.equal(translate("it", "Swapped in Handstand walk — one step easier."), "Sostituito con Handstand walk — un gradino più facile.");
  assert.equal(
    translate("it", "Swapped in Wall walk. Noted for future sessions."),
    "Sostituito con Wall walk. Ne terremo conto nelle prossime sessioni."
  );
  assert.equal(translate("it", "Swapped in {ex}", { ex: "Handstand walk" }), "Sostituito con Handstand walk");
});

test("skill and stage names stay English in Italian too", () => {
  for (const name of ["Handstand", "Handstand walk", "Human flag", "Human Flag", "Back flip", "Clap push-up", "Wall walk", "Tuck", "Tuck cross"]) {
    assert.equal(translate("it", name), name);
  }
  assert.equal(translate("it", "Adv. tuck"), "Tuck avanzato");
});

test("Italian uses the words athletes use: skill, streak, spronata — not abilità, serie di giorni, stimolo", () => {
  const src = ["i18n/phrases.it.ts", "i18n/it.ts", "landingCopy.ts", "site.ts", "i18n/exerciseDescriptions.it.ts", "skillDescriptions.it.ts"]
    .map((f) => readFileSync(join(process.cwd(), "src/lib", f), "utf8"))
    .join("\n");
  for (const awkward of [/\babilità\b/i, /serie di giorni/i, /\bstimol/i, /\bbandiera\b/i, /lever raccolt/i]) {
    assert.doesNotMatch(src, awkward);
  }
});
