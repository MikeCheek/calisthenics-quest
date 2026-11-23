import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { ALL_FEATURES, FEATURE_GROUPS, isCurrent, searchFeatures } from "../src/lib/featureMap";
import { translate } from "../src/lib/i18n/tx";

test("every feature links to a real page, tab and section", () => {
  for (const f of ALL_FEATURES) {
    const [pathAndQuery, hash] = f.href.split("#");
    const [path, query] = pathAndQuery.split("?");
    const file = `src/app${path}/page.tsx`;
    assert.ok(existsSync(file), `${f.id}: no page at ${path}`);
    const src = readFileSync(file, "utf8");
    const tab = new URLSearchParams(query ?? "").get("tab");
    if (tab) assert.match(src, new RegExp(`id: "${tab}"`), `${f.id}: ${path} has no tab "${tab}"`);
    if (hash) assert.match(src, new RegExp(`id="${hash}"`), `${f.id}: ${path} has no section #${hash}`);
  }
});

test("ids are unique and every label and hint is in Italian", () => {
  const ids = ALL_FEATURES.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  // "Coach" is the same word in Italian
  for (const g of FEATURE_GROUPS.filter((g) => g.label !== "Coach")) assert.notEqual(translate("it", g.label), g.label, g.label);
  for (const f of ALL_FEATURES) assert.notEqual(translate("it", f.hint), f.hint, f.hint);
});

test("search finds features by label, hint, keyword, in either language, ignoring accents", () => {
  const ids = (q: string, tx?: (s: string) => string) => searchFeatures(q, tx).flatMap((g) => g.features.map((f) => f.id));
  assert.ok(ids("weight").includes("bodyweight"));
  assert.ok(ids("peso").includes("bodyweight")); // Italian keyword
  assert.ok(ids("parco").includes("parks"));
  assert.ok(ids("eta", (s) => translate("it", s)).includes("body")); // "Età", accent-free
  assert.ok(ids("ruota").includes("wheel"));
  assert.deepEqual(ids("zzzz"), []);
  assert.equal(searchFeatures("").length, FEATURE_GROUPS.length);
});

test("the current page (and tab) is marked", () => {
  const bodyweight = ALL_FEATURES.find((f) => f.id === "bodyweight")!;
  const achievements = ALL_FEATURES.find((f) => f.id === "achievements")!;
  assert.equal(isCurrent(bodyweight, "/profile", "?tab=activity", "#bodyweight"), true);
  assert.equal(isCurrent(achievements, "/profile", "?tab=activity", "#bodyweight"), false); // only the open section
  assert.equal(isCurrent(bodyweight, "/profile", "?tab=settings", "#bodyweight"), false);
  const skills = ALL_FEATURES.find((f) => f.id === "skills")!;
  assert.equal(isCurrent(skills, "/skills", "?tab=tree", "", ALL_FEATURES), true);
  assert.equal(isCurrent(skills, "/skills", "?tab=tree", "#block", ALL_FEATURES), true); // #block isn't a section of ?tab=tree's link
  assert.equal(isCurrent(ALL_FEATURES.find((f) => f.id === "parks")!, "/parks", ""), true);
});

test("every screen is in the menu", () => {
  const linked = new Set(ALL_FEATURES.map((f) => f.href.split(/[?#]/)[0]));
  for (const route of ["/training", "/plan", "/library", "/build", "/parks", "/wheel", "/skills", "/compare", "/profile", "/coach", "/friends", "/about"]) {
    assert.ok(linked.has(route), route);
  }
});
