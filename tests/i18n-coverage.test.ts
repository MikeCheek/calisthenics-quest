import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { translate } from "../src/lib/i18n/tx";

// Every text the app shows through tx("…") or a toast (which translates its
// message), anywhere in src/, has an Italian version — one test instead of
// one per screen. Strings that are the same in Italian are listed below with
// the reason, so a missing translation can't hide among them.
const SAME_IN_ITALIAN = new Set([
  "Coach", "Bonus", "Bonus / malus", "Skill", "Skill check", "Skill check.", "Skill Check", "Record", "Kudos", "No", // words Italian uses as they are
  "Focus:", "In {place}", "Test: {skill} {stage}", "{skill} → {stage}", "{n} min", "~{n} min", // the same once filled in
]);

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sources(p) : /\.tsx?$/.test(f) ? [p] : [];
  });
}

test("every tx() and toast text in the app has Italian", () => {
  const call = /\b(?:tx|toast\.(?:success|error|info|warning))\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  const missing = new Map<string, string>();
  let checked = 0;
  for (const file of sources("src")) {
    if (file.includes(`${"i18n"}`)) continue;
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(call)) {
      const text = JSON.parse(m[1].startsWith("'") ? `"${m[1].slice(1, -1).replace(/"/g, '\\"')}"` : m[1]) as string;
      if (!/[a-z]{2}/i.test(text) || SAME_IN_ITALIAN.has(text)) continue;
      // IndexedDB transaction modes, not text (a variable there is called tx)
      if (text === "readwrite" || text === "readonly") continue;
      checked++;
      if (translate("it", text) === text && !missing.has(text)) missing.set(text, file);
    }
  }
  assert.ok(checked > 500, `only ${checked} strings found — is the pattern still right?`);
  assert.deepEqual([...missing].map(([t, f]) => `${f}: ${t}`), []);
});

test("the same-in-Italian list stays honest: each entry is really used and really untranslated", () => {
  const all = sources("src").map((f) => readFileSync(f, "utf8")).join("\n");
  for (const s of SAME_IN_ITALIAN) {
    assert.ok(all.includes(JSON.stringify(s)), `"${s}" isn't used any more — drop it from the list`);
    assert.equal(translate("it", s), s, `"${s}" has an Italian version now — drop it from the list`);
  }
});
