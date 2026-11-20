import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { siteUrl, SITE_DESCRIPTION, SITE_TITLE } from "../src/lib/site";

const ROOT = join(__dirname, "..", "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const walk = (dir: string): string[] =>
  readdirSync(join(ROOT, dir)).flatMap((f) => {
    const p = join(dir, f);
    return statSync(join(ROOT, p)).isDirectory() ? walk(p) : [p];
  });

test("the site address: override, Vercel's, then localhost — always with a scheme, no trailing slash", () => {
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://barquests.app/" }), "https://barquests.app");
  assert.equal(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "barquests.vercel.app" }), "https://barquests.vercel.app");
  assert.equal(siteUrl({}), "http://localhost:3000");
});

test("title and description fit what search results show", () => {
  assert.ok(SITE_TITLE.length <= 60, SITE_TITLE);
  assert.ok(SITE_DESCRIPTION.length >= 120 && SITE_DESCRIPTION.length <= 230, String(SITE_DESCRIPTION.length));
});

test("pinch-zoom is never turned off", () => {
  assert.doesNotMatch(read("src/app/layout.tsx"), /^\s*(maximumScale|userScalable)\s*:/m);
});

test("every app route has a title of its own", () => {
  const routes = readdirSync(join(ROOT, "src/app")).filter(
    (d) => d !== "api" && statSync(join(ROOT, "src/app", d)).isDirectory() && existsSync(join(ROOT, "src/app", d, "page.tsx"))
  );
  const hasTitle = (r: string) =>
    ["layout.tsx", "page.tsx"].some((f) => existsSync(join(ROOT, "src/app", r, f)) && /title:/.test(read(`src/app/${r}/${f}`)));
  const missing = routes.filter((r) => !hasTitle(r));
  assert.deepEqual(missing, []);
});

test("every <main> is the skip link's target", () => {
  const bad = walk("src")
    .filter((f) => f.endsWith(".tsx"))
    .flatMap((f) => (read(f).match(/<main\b[^>]*>/g) ?? []).filter((m) => !m.includes('id="main"')).map(() => f));
  assert.deepEqual(bad, []);
});

test("aria-labels go through translation, not hard-coded English", () => {
  const bad = walk("src")
    .filter((f) => f.endsWith(".tsx") && !f.endsWith("DemoBadge.tsx"))
    .flatMap((f) => (read(f).match(/aria-label="[A-Za-z][^"]*"/g) ?? []).map((m) => `${f}: ${m}`));
  assert.deepEqual(bad, []);
});

test("the landing page says everything in both languages", async () => {
  const { LANDING } = await import("../src/lib/landingCopy");
  const texts: { en: string; it: string }[] = [];
  const walkCopy = (v: unknown) => {
    if (v && typeof v === "object") {
      if ("en" in v && "it" in v) texts.push(v as { en: string; it: string });
      else Object.values(v).forEach(walkCopy);
    }
  };
  walkCopy(LANDING);
  assert.ok(texts.length > 60, String(texts.length));
  const untranslated = texts.filter((t) => !t.it.trim() || (t.it === t.en && !/^[A-Z][a-z]+$/.test(t.en) && !t.en.includes("English")));
  assert.deepEqual(untranslated, []);
});

test("every landing screenshot exists in both languages", async () => {
  const { LANDING } = await import("../src/lib/landingCopy");
  const ids = ["today", "skills", "crew", ...LANDING.showcase.map((s) => s.id)];
  const missing = ids.flatMap((id) => ["en", "it"].map((l) => `public/landing/${l}-${id}.webp`)).filter((f) => !existsSync(join(ROOT, f)));
  assert.deepEqual(missing, []);
});
