import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.replace("#", "").slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const BACKGROUNDS = { page: "#09090b", panel: "#18181b", raised: "#27272a" };
const AA_SMALL_TEXT = 4.5;

test("the muted text color meets WCAG AA on every background it's used on", () => {
  const config = readFileSync(join(process.cwd(), "tailwind.config.ts"), "utf8");
  const muted = config.match(/muted:\s*"(#[0-9a-fA-F]{6})"/)?.[1];
  assert.ok(muted, "muted color defined in tailwind.config.ts");
  for (const [name, bg] of Object.entries(BACKGROUNDS)) {
    const ratio = contrast(muted!, bg);
    assert.ok(ratio >= AA_SMALL_TEXT, `muted on ${name} is ${ratio.toFixed(2)}:1`);
  }
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.(tsx?|css)$/.test(f) ? [p] : [];
  });
}

test("no failing grey text or sub-12px text sneaks back in", () => {
  const offenders: string[] = [];
  for (const file of sourceFiles(join(process.cwd(), "src"))) {
    const src = readFileSync(file, "utf8");
    // zinc-500 measures 3.7:1 and zinc-600 2.3:1 on panels — both below AA
    for (const m of src.matchAll(/\btext-zinc-(500|600)\b|text-\[(?:[0-9]|1[01])px\]/g)) {
      offenders.push(`${file.replace(process.cwd() + "/", "")}: ${m[0]}`);
    }
  }
  assert.deepEqual(offenders, []);
});
