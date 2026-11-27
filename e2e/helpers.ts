import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";

const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

// WCAG 2.1 A/AA plus best practices; the demo badge is left out (it only
// exists in demo mode).
export async function expectNoA11yViolations(page: Page) {
  // let one-off animations (fade-ins) finish, or contrast is measured
  // mid-fade; endless ones (pulses, the wheel's lights) are left running
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined))
    )
  );
  await page.addScriptTag({ content: AXE });
  const violations = await page.evaluate(async () => {
    const w = window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } };
    const r = await w.axe.run({ exclude: [['[aria-label="Demo data"]']] }, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] });
    return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
  });
  expect(violations).toEqual([]);
}

export async function useLanguage(page: Page, locale: "en" | "it") {
  await page.addInitScript((l) => localStorage.setItem("barquests:locale", l), locale);
}

// Uncaught errors in the page, collected for the test to check at the end.
export function collectErrors(page: Page, ignore: RegExp = /^$/): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => !ignore.test(e.message) && errors.push(e.message));
  return errors;
}

// Demo scenarios (src/lib/demoMode/flag.ts): start the example app as a
// brand-new user ("fresh") and/or a guest ("guest"). Set before the first
// page load; it lasts for the tab.
export async function demoScenario(page: Page, ...names: ("fresh" | "guest" | "away")[]) {
  await page.addInitScript((value) => {
    try {
      sessionStorage.setItem("barquests:demo-scenario", value);
    } catch {
      /* documents without storage (opaque-origin frames): nothing to set */
    }
  }, names.join(","));
}
