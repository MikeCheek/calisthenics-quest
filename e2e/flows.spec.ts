import { test, expect } from "@playwright/test";
import { collectErrors, expectNoA11yViolations } from "./helpers";

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
  await expect(page.locator("main").getByText("THEN", { exact: false }).first()).toBeVisible();
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

test("library: search, open an exercise, do it now", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/library");
  await page.getByRole("searchbox").fill("front lever");
  await page.getByRole("button", { name: /Tuck front lever holds/ }).first().click();
  const sheet = page.getByRole("dialog", { name: "Tuck front lever holds" });
  await expect(sheet.getByText(/Needs:/)).toBeVisible();
  await sheet.getByRole("button", { name: "More sets" }).click();
  await sheet.getByRole("button", { name: "Do it now" }).click();
  await expect(page.getByText(/^1 \/ 1 ·/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("build a session: pick exercises, save it, start it", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/build");
  await page.getByRole("button", { name: "Add exercises" }).click();
  const picker = page.getByRole("dialog", { name: "Add exercises" });
  await picker.getByRole("searchbox").fill("push-ups");
  await picker.getByRole("button", { name: /^Push-ups/ }).first().click();
  await picker.getByRole("searchbox").fill("hollow");
  await picker.getByRole("button", { name: /Hollow/ }).first().click();
  await picker.getByRole("button", { name: /^Done \(2\)/ }).click();
  await page.getByLabel("Name").fill("Quick one");
  await page.getByRole("button", { name: /^Save$/ }).click();
  await expect(page.getByRole("button", { name: "Start Quick one" })).toBeVisible();
  await page.getByRole("button", { name: "Start Quick one" }).click();
  await expect(page.getByText(/^1 \/ \d+ ·/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("a training block: start it from Skills, Today leans on it", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/skills");
  await page.getByRole("button", { name: "Start a block" }).click();
  const setup = page.getByRole("dialog", { name: "Start a training block" });
  await setup.getByRole("button", { name: "Planche", exact: true }).click();
  await setup.locator("fieldset").nth(1).getByRole("button").first().click();
  await expect(setup.getByText(/\d+ weeks/)).toBeVisible();
  await setup.getByRole("button", { name: "Start the block" }).click();
  await expect(page.getByRole("heading", { name: /^Planche: .+ → .+/ })).toBeVisible();
  await page.getByRole("link", { name: "Today" }).first().click();
  await expect(page.getByText(/Week 1 of \d+/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("bodyweight: log today's weight", async ({ page }) => {
  await page.goto("/profile");
  const card = page.locator("section[aria-labelledby=bw-title]");
  await card.getByPlaceholder("Today's weight (kg)").fill("76.5");
  await card.getByRole("button", { name: "Log" }).click();
  await expect(card.getByText("76.5 kg")).toBeVisible();
});

// ---- the outside world, mocked: OpenStreetMap, its tiles and Open-Meteo ----
const HERE = { latitude: 45.4642, longitude: 9.19 };

const OSM_PARK = {
  elements: [
    { type: "way", id: 7, center: { lat: 45.4652, lon: 9.19 }, tags: { leisure: "fitness_station", sport: "calisthenics", name: "Riverside bars" } },
    { type: "node", id: 1, lat: 45.4652, lon: 9.1901, tags: { leisure: "fitness_station", fitness_station: "horizontal_bar" } },
    { type: "node", id: 2, lat: 45.4653, lon: 9.1901, tags: { leisure: "fitness_station", fitness_station: "parallel_bars" } },
  ],
};
async function mockMap(page: import("@playwright/test").Page, hits: string[] = []) {
  await page.route("https://tile.openstreetmap.org/**", (r) => r.fulfill({ status: 204 }));
  await page.route("**/api/parks/osm", (r) => {
    const body = r.request().postDataJSON() as { box?: unknown; at?: unknown };
    if (body.at) return r.fulfill({ json: { elements: [{ type: "area", id: 1, tags: { leisure: "park", name: "Giardini Pubblici" } }] } });
    hits.push(r.request().url());
    return r.fulfill({ json: OSM_PARK });
  });
  return hits;
}

test("bar parks: find one, confirm its kit, react, correct it, train there", async ({ page, context }) => {
  const errors = collectErrors(page);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(HERE);
  await mockMap(page);
  await page.goto("/parks");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByText("OpenStreetMap data · updated", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: /1 park in 5 km/ }).click(); // the list opens up from the bottom
  await page.getByRole("region", { name: "Bar parks", exact: true }).getByRole("button", { name: /Riverside bars/ }).click();
  const sheet = page.getByRole("dialog", { name: "Riverside bars" });
  await expect(sheet.getByText("Pull-up bar: there")).toBeVisible();
  await sheet.getByRole("button", { name: "Like Riverside bars" }).click();
  await expect(sheet.getByRole("button", { name: "Unlike Riverside bars" })).toHaveAttribute("aria-pressed", "true");
  await sheet.getByRole("button", { name: "Still like this" }).click();
  await expect(sheet.getByText("Thanks for confirming!")).toBeVisible();
  await sheet.getByRole("button", { name: "Thanks" }).click();
  await expect(sheet.getByRole("button", { name: "Thanks" })).toHaveAttribute("aria-pressed", "true");
  await expectNoA11yViolations(page);

  // correct the name, then the spot on the map
  await sheet.getByRole("button", { name: "Edit name" }).click();
  await sheet.getByLabel("Name of the park").fill("Riverside calisthenics");
  await sheet.getByRole("button", { name: "Save name" }).click();
  await expect(page.getByRole("dialog", { name: "Riverside calisthenics" })).toBeVisible();
  const renamed = page.getByRole("dialog", { name: "Riverside calisthenics" });
  await expect(renamed.getByText(/Name or position updated by/)).toBeVisible();
  await renamed.getByRole("button", { name: "Move the pin" }).click();
  await page.getByRole("dialog", { name: "Pick the spot" }).getByRole("button", { name: "Save position" }).click();
  await expect(page.getByRole("dialog", { name: "Riverside calisthenics" })).toBeVisible();

  await page.getByRole("dialog", { name: "Riverside calisthenics" }).getByRole("button", { name: "Train here today" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Today at Riverside calisthenics")).toBeVisible();
  expect(errors).toEqual([]);
});

test("bar parks: an area already loaded comes from the shared cache", async ({ page, context }) => {
  const errors = collectErrors(page);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(HERE);
  const hits = await mockMap(page);
  await page.goto("/parks");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByText(/1 park in 5 km/)).toBeVisible();
  expect(hits.length).toBe(1);
  await page.getByRole("button", { name: "2 km" }).click(); // inside what's cached
  await expect(page.getByText(/1 park in 2 km/)).toBeVisible();
  await expect(page.getByText("OpenStreetMap data · updated", { exact: false })).toBeVisible();
  expect(hits.length).toBe(1);
  expect(errors).toEqual([]);
});

test("bar parks: add a missing one by picking its spot on the map", async ({ page, context }) => {
  const errors = collectErrors(page);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(HERE);
  await mockMap(page);
  await page.goto("/parks");
  await page.getByRole("button", { name: "Use my location" }).click();
  await page.getByRole("button", { name: /1 park in 5 km/ }).click();
  await page.getByRole("button", { name: "Add a missing park" }).click();
  const pick = page.getByRole("dialog", { name: "Pick the spot" });
  await expect(pick).toBeVisible();
  await expectNoA11yViolations(page);
  await pick.getByRole("button", { name: "Put the park here" }).click();
  const add = page.getByRole("dialog", { name: "Add a park" });
  await expect(add.getByLabel("Name of the park")).toHaveValue("Giardini Pubblici"); // named after the park it's in
  await add.getByLabel("Name of the park").fill("School bars");
  await add.getByRole("button", { name: "Add park" }).click();
  await expect(page.getByRole("dialog", { name: "School bars" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("weather: a rainy week offers the home plan", async ({ page, context }) => {
  const errors = collectErrors(page);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(HERE);
  await page.route("https://api.open-meteo.com/**", async (r) => {
    // a week of rain, in the browser's own local days
    const days = await page.evaluate(() =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    );
    const time = days.flatMap((d) => Array.from({ length: 24 }, (_, h) => `${d}T${String(h).padStart(2, "0")}:00`));
    const all = (v: number) => time.map(() => v);
    await r.fulfill({
      json: { hourly: { time, temperature_2m: all(9), apparent_temperature: all(7), precipitation_probability: all(90), precipitation: all(2), weather_code: all(63) } },
    });
  });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Use location" }).click();
  await expect(page.getByText(/Rainy days ahead/)).toBeVisible();
  await page.getByRole("button", { name: /Use the home plan until/ }).click();
  await expect(page.getByText(/Home plan until .* \(rainy days\)/)).toBeVisible();
  await expectNoA11yViolations(page);
  await page.getByRole("button", { name: "My usual kit" }).click();
  await expect(page.getByText(/Home plan until/)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("crew feed: give a friend kudos and get some back", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/friends");
  const feed = page.getByRole("region", { name: "Crew activity" });
  const kudos = feed.getByRole("button", { name: /^Give .* kudos$/ }).first();
  await kudos.click();
  await expect(feed.getByRole("button", { name: /^Take back kudos for/ }).first()).toHaveAttribute("aria-pressed", "true");
  await expect(feed.getByText(/You.* gave kudos|Kudos/).first()).toBeVisible();
  await expect(page.getByText(/gave you kudos/).first()).toBeVisible();
  // a friend's yoga session says so
  await expect(feed.getByRole("img", { name: "Yoga" }).first()).toBeVisible();
  await expectNoA11yViolations(page);
  expect(errors).toEqual([]);
});

// ---- finding things: the feature menu, quick actions, the sidebar ----

test("phone: All features finds a feature by search and opens its section", async ({ page }) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "All features" }).click();
  const menu = page.getByRole("dialog", { name: "All features" });
  await expect(menu.getByRole("link", { name: /Bar parks near you/ })).toBeVisible();
  await expectNoA11yViolations(page);
  await menu.getByRole("searchbox").fill("weight");
  await menu.getByRole("link", { name: /^Bodyweight/ }).click();
  await expect(page).toHaveURL(/\/profile\?tab=activity#bodyweight/);
  await expect(page.locator("#bodyweight")).toBeFocused();
  // the same page, another tab: the menu switches it
  await page.getByRole("button", { name: "All features" }).click();
  await page.getByRole("dialog", { name: "All features" }).getByRole("link", { name: /^Reminders/ }).click();
  await expect(page.getByRole("tab", { name: "Settings" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#reminders")).toBeFocused();
  expect(errors).toEqual([]);
});

test("phone: quick actions open from anywhere and close with Escape", async ({ page }) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/skills");
  const fab = page.getByRole("button", { name: "Quick actions" });
  await fab.click();
  await expect(page.getByRole("link", { name: "Find a bar park" })).toBeVisible();
  await expectNoA11yViolations(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "Find a bar park" })).toHaveCount(0);
  await expect(fab).toBeFocused();
  await fab.click();
  await page.getByRole("link", { name: "Find a bar park" }).click();
  await expect(page).toHaveURL(/\/parks/);
  expect(errors).toEqual([]);
});

test("desktop: the sidebar lists every feature, with the current one marked", async ({ page }) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/friends");
  const sidebar = page.locator("#app-sidebar");
  await expect(sidebar.getByRole("link", { name: "Crew", exact: true })).toHaveAttribute("aria-current", "page");
  await sidebar.getByRole("link", { name: "Leaderboard" }).click();
  await expect(page.locator("#leaderboard")).toBeFocused();
  await sidebar.getByRole("link", { name: "Bar parks near you" }).click();
  await expect(page).toHaveURL(/\/parks/);
  await expectNoA11yViolations(page);
  expect(errors).toEqual([]);
});

test("bar parks: favourite one, then pick it before training", async ({ page, context }) => {
  const errors = collectErrors(page);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(HERE);
  await mockMap(page);
  await page.goto("/parks");
  await page.getByRole("button", { name: "Use my location" }).click();
  await page.getByRole("button", { name: /1 park in 5 km/ }).click();
  await page.getByRole("region", { name: "Bar parks", exact: true }).getByRole("button", { name: /Riverside bars/ }).click();
  const sheet = page.getByRole("dialog", { name: "Riverside bars" });
  await expect(sheet.getByText(/athletes? ha(s|ve) trained here/)).toBeVisible();
  await sheet.getByRole("button", { name: "Add Riverside bars to favourites" }).click();
  await expect(sheet.getByRole("button", { name: "Remove Riverside bars from favourites" })).toHaveAttribute("aria-pressed", "true");
  await sheet.getByRole("button", { name: "Close" }).click();

  await page.goto("/dashboard");
  await page.getByRole("button", { name: /^Start/ }).first().click();
  const ask = page.getByRole("dialog", { name: "Where are you training?" });
  await expect(ask.getByRole("button", { name: /Riverside bars/ })).toBeVisible();
  await expectNoA11yViolations(page);
  await ask.getByRole("button", { name: /Riverside bars/ }).click();
  await expect(page.getByText(/^1 \/ \d+ ·/)).toBeVisible(); // the session is running
  expect(errors).toEqual([]);
});

test("sports: start yoga, train it, switch back to calisthenics with nothing lost", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/dashboard");
  // add yoga: experience, goals, length
  await page.getByRole("banner").getByRole("button", { name: /Sport: Calisthenics/ }).click();
  const dialog = page.getByRole("dialog", { name: "Your sports" });
  const cali = (await dialog.getByRole("button", { name: /Calisthenics/ }).textContent())!;
  await dialog.getByRole("button", { name: /Yoga/ }).click();
  const setup = page.getByRole("dialog", { name: "Start Yoga" });
  await setup.getByRole("radio", { name: /Some practice/ }).click();
  await setup.getByRole("button", { name: "Crow" }).click();
  await expectNoA11yViolations(page);
  await setup.getByRole("button", { name: "Start Yoga" }).click();

  // Today is a yoga session, with its own "up next"
  await expect(page.getByRole("banner").getByRole("button", { name: /Sport: Yoga/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Up next in Yoga/ })).toBeVisible();
  await expect(page.getByRole("region", { name: /Up next in Yoga/ })).toContainText("Crow");
  await page.getByRole("main").getByRole("button", { name: /Start session/ }).click();
  for (let k = 0; k < 40; k++) {
    if (await page.getByText("Session complete!").isVisible()) break;
    const skip = page.getByRole("button", { name: "Skip rest" }).first();
    if (await skip.isVisible()) await skip.click();
    else await page.getByRole("button", { name: /^Next/ }).click();
  }
  await page.getByRole("button", { name: /Finish & log session/ }).click();
  await expect(page.getByRole("heading", { name: "Done for today" })).toBeAttached({ timeout: 5000 });
  await page.getByRole("button", { name: "Got it" }).click();

  // Skills and the library follow the sport
  // (in-app navigation: the demo data lives in memory, a reload resets it)
  await page.getByRole("navigation", { name: "Main menu" }).getByRole("link", { name: "Skills" }).filter({ visible: true }).click();
  await expect(page.locator("[data-sport-skill=crow]")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Proven" })).toHaveCount(0);
  await page.getByRole("button", { name: "All features" }).click();
  await page.getByRole("dialog", { name: "All features" }).getByRole("searchbox").fill("library");
  await page.getByRole("dialog", { name: "All features" }).getByRole("link", { name: /library/i }).first().click();
  await page.getByRole("main").getByRole("searchbox").fill("pigeon");
  await expect(page.getByText(/Pigeon/).first()).toBeVisible();

  // back to calisthenics: its level and skills are where they were
  await page.getByRole("banner").getByRole("button", { name: /Sport: Yoga/ }).click();
  await expect(dialog.getByRole("button", { name: /Calisthenics/ })).toContainText(cali.match(/Level \d+ · \d+ XP/)![0]);
  await expect(dialog.getByRole("button", { name: /Yoga/ })).toContainText(/Level \d+ · [1-9]\d* XP/);
  await dialog.getByRole("button", { name: /Calisthenics/ }).click();
  await page.getByRole("navigation", { name: "Main menu" }).getByRole("link", { name: "Skills" }).filter({ visible: true }).click();
  await expect(page.getByRole("tab", { name: "Proven" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("sports: starting from the yoga page opens yoga's setup in the app", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/yoga");
  await page.getByRole("button", { name: "Start Yoga free" }).first().click();
  await expect(page).toHaveURL(/\/dashboard/);
  const setup = page.getByRole("dialog", { name: "Start Yoga" });
  await expect(setup.getByRole("radio", { name: /New to it/ })).toBeVisible();
  await setup.getByRole("button", { name: "Start Yoga" }).click();
  await expect(page.getByRole("banner").getByRole("button", { name: /Sport: Yoga/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe("first login: pick a sport", () => {
  test.beforeEach(async ({ page }) => {
    // runs in every document, some of which (opaque-origin frames) refuse
    // storage access: guard it like the app does
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("barquests:demo-fresh", "1");
      } catch {
        /* not this document */
      }
    });
  });

  test("start with yoga: its three questions, then Today is yoga; calisthenics asks for its check when added", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: "What do you want to train?" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Main track.*Calisthenics/ })).toBeVisible();
    await expectNoA11yViolations(page);
    await page.getByRole("button", { name: /Yoga/ }).click();
    await expect(page.getByRole("heading", { name: "Start Yoga" })).toBeVisible();
    await page.getByRole("button", { name: "Crow" }).click();
    await page.getByRole("button", { name: "Start Yoga" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /Up next in Yoga/ })).toBeVisible();

    // calisthenics was never set up: adding it goes through its check
    await page.getByRole("banner").getByRole("button", { name: /Sport: Yoga/ }).click();
    const cali = page.getByRole("dialog", { name: "Your sports" }).getByRole("button", { name: /Calisthenics/ });
    await expect(cali).toContainText("Start");
    await cali.click();
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("start with calisthenics: the usual setup, with a way back to the sports", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: /Main track.*Calisthenics/ }).click();
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("heading", { name: "What do you want to train?" })).toBeVisible();
  });

  test("arriving from the Pilates page: Pilates is suggested", async ({ page }) => {
    await page.goto("/pilates");
    await page.getByRole("button", { name: "Start Pilates free" }).first().click();
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByRole("button", { name: /Pilates/ })).toHaveClass(/ring-1/);
    await expect(page.getByRole("button", { name: /Main track.*Calisthenics/ })).not.toHaveClass(/ring-1/);
  });
});

// ---- from the UX review ----

const go = (page: import("@playwright/test").Page, route: string) =>
  page.evaluate((r) => (window as unknown as { next: { router: { push: (h: string) => void } } }).next.router.push(r), route);

test.describe("started with yoga", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("barquests:demo-fresh", "1");
      } catch {
        /* not this document */
      }
    });
    await page.goto("/onboarding");
    await page.getByRole("button", { name: /Yoga/ }).click();
    await page.getByRole("button", { name: "Start Yoga" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("editing settings opens that step, returns to Me, and keeps yoga active", async ({ page }) => {
    await go(page, "/onboarding?step=3&return=/profile?tab=settings");
    await expect(page.getByText("Step 4 of 4")).toBeVisible();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/profile\?tab=settings/);
    await expect(page.getByRole("banner").getByRole("button", { name: /Sport: Yoga/ })).toBeVisible();
  });

  test("the week plan is a yoga plan, starting with today's session", async ({ page }) => {
    const errors = collectErrors(page);
    await go(page, "/plan");
    await expect(page.getByText(/Your Yoga plan/)).toBeVisible();
    await page.getByRole("button", { name: "Generate plan" }).click();
    await expect(page.getByText(/training days?/).first()).toBeVisible();
    await expect(page.getByText(/Flow|Balance|Arm balances|Backbends|Flexibility/).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("quick actions don't offer bar parks for an indoor sport; session length can change", async ({ page }) => {
    await page.getByRole("button", { name: "Quick actions" }).click();
    await expect(page.getByRole("navigation", { name: "Quick actions" }).getByRole("link", { name: "Do an exercise" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Find a bar park" })).toHaveCount(0);
    await page.keyboard.press("Escape");
    await go(page, "/skills");
    const lengths = page.getByRole("group", { name: "Session length" });
    await lengths.getByRole("button", { name: "40 min" }).click();
    await expect(lengths.getByRole("button", { name: "40 min" })).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("yoga extras", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("barquests:demo-fresh", "1");
      } catch {
        /* not this document */
      }
    });
    await page.goto("/onboarding");
    await page.getByRole("button", { name: /Yoga/ }).click();
    await page.getByRole("button", { name: "Start Yoga" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("a training block toward a stage, and the road of every stage", async ({ page }) => {
    const errors = collectErrors(page);
    await go(page, "/skills");
    const block = page.getByRole("region", { name: "Training block" });
    await block.getByLabel("Skill").selectOption("crow");
    await block.getByRole("button", { name: "2 weeks" }).click();
    await block.getByRole("button", { name: "Start block" }).click();
    await expect(block.getByText(/Crow → Crow pose|Crow →/)).toBeVisible();
    await expect(block.getByText(/Week 1 of 2/)).toBeVisible();
    await expectNoA11yViolations(page);
    await block.getByRole("button", { name: "Stop block" }).click();
    await expect(block.getByRole("button", { name: "Start block" })).toBeVisible();
    await page.getByText("Your road").click();
    await expect(page.getByText(/\d+ of \d+ reached/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stage 1" })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test("during a session the resume bubble replaces the quick-actions button", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("button", { name: "Quick actions" })).toBeVisible();
  await page.getByRole("main").getByRole("button", { name: /Start session/ }).click();
  await expect(page.getByText(/^1 \/ \d+/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume training" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Quick actions" })).toHaveCount(0);
});

test("offline, the AI coach says it needs a connection", async ({ page, context }) => {
  await page.goto("/coach");
  await context.setOffline(true);
  await page.getByPlaceholder("Ask about your training…").fill("How do I get my first muscle-up?");
  await page.getByPlaceholder("Ask about your training…").press("Enter");
  await expect(page.getByText(/You're offline — the AI coach needs a connection/)).toBeVisible();
  // the offline banner and the quick-actions button don't overlap
  const banner = (await page.getByRole("status").filter({ hasText: /Offline — training still works/ }).boundingBox())!;
  const fab = (await page.getByRole("button", { name: "Quick actions" }).boundingBox())!;
  const overlap = banner.x < fab.x + fab.width && fab.x < banner.x + banner.width && banner.y < fab.y + fab.height && fab.y < banner.y + banner.height;
  expect(overlap).toBe(false);
  await context.setOffline(false);
});

test.describe("as a guest", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("barquests:demo-guest", "1");
      } catch {
        /* not this document */
      }
    });
  });

  test("Crew shows the community event and asks to save; an invite link says so", async ({ page }) => {
    await page.goto("/friends");
    await expect(page.getByText(/Friends, nudges and training together need an account/)).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Everyone together" })).toBeVisible();
    await expectNoA11yViolations(page);
    await page.goto("/friends?code=AB12CD");
    await expect(page.getByText(/You've been invited to train together/)).toBeVisible();
  });
});
