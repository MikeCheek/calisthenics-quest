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

test("bonus wheel: bet, spin, land on an exercise you can do", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/wheel");
  // only skills this equipment allows are offered
  await page.getByRole("button", { name: /Skill/ }).click();
  const sheet = page.getByRole("dialog", { name: "Pick a skill" });
  await expect(sheet.getByRole("button", { name: /Surprise me/ })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /Bet on 2 — pays 2 to 1/ }).click();
  await expect(page.getByRole("button", { name: /Spin — 5 XP on 2/ })).toBeVisible();
  await page.getByRole("button", { name: /Spin — 5 XP on 2/ }).click();
  await expect(page.getByText(/Landed on/).first()).toBeAttached({ timeout: 15_000 });

  // a ★ opens the bonus round first
  const card = page.getByRole("button", { name: "Card 1" });
  if (await card.isVisible().catch(() => false)) await card.click();
  await expect(page.getByRole("heading", { level: 2 }).filter({ hasNot: page.locator("#bet-title") }).last()).toBeVisible();
  await expect(page.getByText(/Complete it to collect \d+ XP/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Bet (won|lost)/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("a session that can't be done today can be cancelled without logging", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/dashboard");
  await page.getByRole("main").getByRole("button", { name: /Start session/ }).click();
  await page.getByRole("button", { name: "More options" }).click();
  await page.getByRole("dialog", { name: "Options" }).getByRole("button", { name: /Cancel session/ }).click();
  const confirm = page.getByRole("dialog", { name: "Cancel this session?" });
  // "Keep training" leaves it running
  await confirm.getByRole("button", { name: "Keep training" }).click();
  await expect(page.getByRole("button", { name: "More options" })).toBeVisible();
  await page.getByRole("button", { name: "More options" }).click();
  await page.getByRole("dialog", { name: "Options" }).getByRole("button", { name: /Cancel session/ }).click();
  await page.getByRole("dialog", { name: "Cancel this session?" }).getByRole("button", { name: "Cancel session" }).click();
  await expect(page.getByText("Session cancelled — nothing was logged.")).toBeVisible();
  await expect(page.getByRole("main").getByRole("button", { name: /Start session/ })).toBeVisible();
  // and it stays gone after a reload
  await page.reload();
  await expect(page.getByRole("main").getByRole("button", { name: /Start session/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Resume training" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("then vs now: from Skills, switch ranges, pick custom dates", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/skills");
  await page.getByRole("link", { name: /Then vs now/ }).click();
  await expect(page).toHaveURL(/\/compare$/);
  await expect(page.getByRole("heading", { name: "Strength by muscle group" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Exercises you did in both" })).toBeVisible();

  await page.getByRole("button", { name: "1 month" }).click();
  await expect(page.getByRole("button", { name: "1 month" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Custom" }).click();
  const from = page.getByLabel("Then — from");
  await expect(from).toBeVisible();
  const d = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);
  await from.fill(d);
  await expect(page.getByText("THEN", { exact: false }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("after the last exercise: cool-down stretches for the muscles worked", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/dashboard");
  await page.getByRole("main").getByRole("button", { name: /Start session/ }).click();
  for (let k = 0; k < 40; k++) {
    if (await page.getByText("Session complete!").isVisible()) break;
    const skip = page.getByRole("button", { name: "Skip rest" }).first();
    if (await skip.isVisible()) await skip.click();
    else await page.getByRole("button", { name: /^Next/ }).click();
  }
  await page.getByRole("button", { name: /Cool-down stretches · ~\d+ min/ }).click();
  const flow = page.getByRole("dialog", { name: "Cool-down" });
  await expect(flow.getByText(/Stretch 1 of \d/)).toBeVisible();
  for (let k = 0; k < 8; k++) {
    if (await flow.getByText("Cool-down done").isVisible()) break;
    await flow.getByRole("button", { name: /^(Next stretch|Next|Finish)/ }).click();
  }
  await expect(flow.getByText("Cool-down done")).toBeVisible();
  expect(errors).toEqual([]);
});

test("offline: a session can be finished and logged without a connection", async ({ page, context }) => {
  const errors = collectErrors(page);
  await page.goto("/dashboard");
  await page.getByRole("main").getByRole("button", { name: /Start session/ }).click();
  await context.setOffline(true);
  await expect(page.getByText(/Offline — training still works/)).toBeVisible();
  for (let k = 0; k < 40; k++) {
    if (await page.getByText("Session complete!").isVisible()) break;
    const skip = page.getByRole("button", { name: "Skip rest" }).first();
    if (await skip.isVisible()) await skip.click();
    else await page.getByRole("button", { name: /^Next/ }).click();
  }
  await page.getByRole("button", { name: /Finish & log session/ }).click();
  await expect(page.getByText(/Saved on this phone/)).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("heading", { name: "Done for today" })).toBeAttached();
  await context.setOffline(false);
  await expect(page.getByText(/Offline — training still works/)).toBeHidden();
  expect(errors).toEqual([]);
});

test("Me shows the achievements grid", async ({ page }) => {
  await page.goto("/profile");
  const grid = page.locator("#achievements");
  await expect(grid.getByRole("heading", { name: "Achievements" })).toBeVisible();
  await grid.getByRole("button", { name: /Century/ }).click();
  await expect(grid.getByText(/of 100 so far/)).toBeVisible();
});
