import { test, expect } from "@playwright/test";
import { collectErrors } from "./helpers";

test("the skip link jumps to the page content", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.locator("h1").first()).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("nudge a friend, get a reply, complete their challenge for XP", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/friends");
  const nudge = page.getByRole("listitem").filter({ hasText: "Sam Rivera" }).getByRole("button", { name: "Nudge" });
  await nudge.click();

  // the sheet: a dialog that keeps focus, with moods and a reroll
  const sheet = page.getByRole("dialog", { name: /Nudge Sam Rivera/ });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "Challenge" }).click();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"))).toBe(true);
  }
  await sheet.getByRole("button", { name: "Send" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByText("Nudge sent to Sam Rivera!")).toBeVisible();

  // the demo friend answers, then challenges back
  await expect(page.getByText("Sam: 💪 On it!")).toBeVisible();
  const card = page.getByRole("region", { name: "Nudge from Sam" });
  await expect(card).toBeVisible({ timeout: 10_000 });
  await card.getByRole("button", { name: /Done!/ }).click();
  await expect(page.getByText(/\+\d+ XP — challenge done!/)).toBeVisible();
  await expect(card).toBeHidden();
  expect(errors).toEqual([]);
});

test("today's session opens in guided mode and keeps its place", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/dashboard");
  await page.getByRole("main").getByRole("button", { name: /Start session/ }).click();
  await expect(page.getByText(/^1 \/ \d+/)).toBeVisible();
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.getByText(/Rest before next exercise/i)).toBeVisible();
  // reload: the session is kept, behind the floating "Resume training"
  // button, and opens again where it was
  await page.reload();
  await page.getByRole("button", { name: "Resume training" }).click();
  await expect(page.getByText(/Rest before next exercise/i)).toBeVisible();
  expect(errors).toEqual([]);
});

test("the monthly community event shows everyone's total and your part", async ({ page }) => {
  await page.goto("/dashboard");
  const card = page.locator("section[aria-labelledby=event-title]");
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByRole("progressbar", { name: "Everyone together" })).toBeVisible();
  await expect(card.getByRole("progressbar", { name: "Your part" })).toBeVisible();
  await expect(card.getByText(/athletes taking part|did it together/)).toBeVisible();
});

test("number pickers work with the keyboard", async ({ page }) => {
  await page.goto("/onboarding");
  const picker = page.getByRole("spinbutton").first();
  await picker.focus();
  const before = Number(await picker.getAttribute("aria-valuenow"));
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect.poll(async () => Number(await picker.getAttribute("aria-valuenow"))).toBeGreaterThan(before);
});
