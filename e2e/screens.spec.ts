import { test, expect } from "@playwright/test";
import { collectErrors, expectNoA11yViolations, useLanguage } from "./helpers";

// Every screen of the app (demo mode): it loads, has its own title and a
// main heading, throws nothing, and passes the accessibility scan.
const SCREENS: [path: string, title: RegExp][] = [
  ["/dashboard", /^Today · BarQuests$/],
  ["/training", /^Training session · BarQuests$/],
  ["/plan", /^Week plan · BarQuests$/],
  ["/skills", /^Skills · BarQuests$/],
  ["/coach", /^Coach · BarQuests$/],
  ["/wheel", /^Exercise wheel · BarQuests$/],
  ["/friends", /^Crew · BarQuests$/],
  ["/profile", /^Me · BarQuests$/],
  ["/onboarding", /^Get started · BarQuests$/],
];

for (const [path, title] of SCREENS) {
  test(`${path} loads, is labelled and accessible`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page).toHaveTitle(title);
    await expectNoA11yViolations(page);
    expect(errors).toEqual([]);
  });
}

test("Italian: menu, titles and screens switch language", async ({ page }) => {
  await useLanguage(page, "it");
  await page.goto("/friends");
  await expect(page.getByRole("navigation", { name: "Menu principale" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Squadra" }).first()).toBeVisible();
  await expect(page).toHaveTitle(/^Squadra · BarQuests$/);
  await expectNoA11yViolations(page);
});
