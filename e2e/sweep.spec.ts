import { test, expect, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";

// Every signed-in screen, with each sport active: it renders, logs no
// errors and fits the phone's width. In-app navigation keeps the demo data
// (it lives in memory) so the sport stays switched.
const ROUTES = [
  "/dashboard",
  "/skills",
  "/skills?tab=proven",
  "/skills?tab=road",
  "/training",
  "/coach",
  "/friends",
  "/profile",
  "/profile?tab=activity",
  "/profile?tab=settings",
  "/library",
  "/build",
  "/plan",
  "/path",
  "/progress",
  "/compare",
  "/wheel",
  "/pomodoro",
  "/parks",
  "/pair",
];

async function go(page: Page, route: string) {
  await page.evaluate(
    (r) =>
      (
        window as unknown as { next: { router: { push: (h: string) => void } } }
      ).next.router.push(r),
    route,
  );
  await page.waitForURL(
    (u) =>
      u.pathname + u.search === route || u.pathname === route.split("?")[0],
    { timeout: 15_000 },
  );
  await expect(page.locator("main#main, main").first()).toBeVisible();
  await page.waitForTimeout(400);
}

for (const sport of ["Calisthenics", "Yoga"] as const) {
  test(`every screen works with ${sport} active`, async ({ page }) => {
    test.setTimeout(180_000);
    const errors = collectErrors(page);
    const consoleErrors: string[] = [];
    page.on(
      "console",
      (m) =>
        m.type() === "error" &&
        !/overpass|tile|Failed to load resource|favicon/i.test(m.text()) &&
        consoleErrors.push(m.text()),
    );
    await page.goto("/dashboard");
    await expect(page.locator("h1").first()).toBeVisible();
    if (sport === "Yoga") {
      await page
        .getByRole("banner")
        .getByRole("button", { name: /Sport: Calisthenics/ })
        .click();
      await page
        .getByRole("dialog", { name: "Your sports" })
        .getByRole("button", { name: /Yoga/ })
        .click();
      await page
        .getByRole("dialog", { name: "Start Yoga" })
        .getByRole("button", { name: "Start Yoga" })
        .click();
      await expect(
        page.getByRole("banner").getByRole("button", { name: /Sport: Yoga/ }),
      ).toBeVisible();
    }
    const wide: string[] = [];
    for (const r of ROUTES) {
      await go(page, r);
      const [sw, vw] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        window.visualViewport?.width ?? window.innerWidth,
      ]);
      if (sw > vw + 1) wide.push(`${r}: ${sw} > ${vw}`);
      if (sport === "Yoga")
        await expect(
          page.getByRole("banner").getByRole("button", { name: /Sport: Yoga/ }),
          r,
        ).toBeVisible();
    }
    expect(wide).toEqual([]);
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}
