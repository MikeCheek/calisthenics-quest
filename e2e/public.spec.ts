import { test, expect } from "@playwright/test";
import { collectErrors, expectNoA11yViolations } from "./helpers";

// The public pages, on a regular (not demo) server with placeholder
// Firebase settings: Firebase's own complaints about them are expected.
const FIREBASE_PLACEHOLDER = /Firebase|API key|auth\/|installations/i;

test("landing page: the overview, both calls to action, accessible", async ({ page }) => {
  const errors = collectErrors(page, FIREBASE_PLACEHOLDER);
  await page.goto("/");
  await expect(page).toHaveTitle("BarQuests — Your Calisthenics Journey");
  await expect(page.getByRole("heading", { level: 1, name: "BarQuests" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start free — no account needed" }).first()).toBeVisible();
  for (const h of ["Why it's different", "Your session, ready in one tap", "Better with friends", "Questions"]) {
    await expect(page.getByRole("heading", { name: h })).toBeAttached();
  }
  await expectNoA11yViolations(page);
  expect(errors).toEqual([]);
});

test("landing page: search engines get both languages and the structured data", async ({ page }) => {
  await page.goto("/");
  const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((ls) => ls.map((l) => `${l.getAttribute("hreflang")} ${new URL(l.getAttribute("href")!).pathname}`));
  expect(alternates).toEqual(expect.arrayContaining(["en /", "it /it", "x-default /"]));
  const data = await page.locator('script[type="application/ld+json"]').first().textContent();
  const types = (JSON.parse(data!) as { "@type": string }[]).map((d) => d["@type"]);
  expect(types).toEqual(["WebApplication", "FAQPage"]);
});

test("/it is the landing page in Italian", async ({ page }) => {
  await page.goto("/it");
  await expect(page).toHaveTitle("BarQuests — Il tuo percorso calisthenics");
  await expect(page.locator('div[lang="it"]')).toBeAttached();
  await expect(page.getByRole("heading", { name: "Cosa lo rende diverso" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Inizia gratis — senza account" }).first()).toBeVisible();
  await expectNoA11yViolations(page);
});

test("an Italian browser is sent to /it", async ({ browser }) => {
  const context = await browser.newContext({ locale: "it-IT" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/it$/);
  await context.close();
});

test("About is accessible", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("h1").first()).toBeVisible();
  await expectNoA11yViolations(page);
});

test("robots.txt and the sitemap list the public pages", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /api/");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const p of ["/it", "/about", "/yoga", "/it/pilates"]) expect(sitemap).toContain(p);
  expect(sitemap).toContain('hreflang="it"');
});

test("landing page: a short word on yoga and Pilates, linking to their pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Rainy day? Train at home — or try yoga and Pilates" })).toBeVisible();
  await page.getByRole("link", { name: /Yoga.*Discover Yoga/ }).click();
  await expect(page).toHaveURL(/\/yoga$/);
  await expect(page.getByRole("heading", { level: 1, name: /Yoga/ })).toBeVisible();
});

for (const [path, title, h, start] of [
  ["/yoga", "Yoga on BarQuests — skills, stage by stage", "What you'll learn", "Start Yoga free"],
  ["/pilates", "Pilates on BarQuests — mat work, stage by stage", "What you'll learn", "Start Pilates free"],
  ["/it/yoga", "Yoga su BarQuests — skill, livello dopo livello", "Cosa imparerai", "Inizia Yoga gratis"],
  ["/it/pilates", "Pilates su BarQuests — a corpo libero, livello per livello", "Cosa imparerai", "Inizia Pilates gratis"],
] as const) {
  test(`${path}: its own page, both languages linked, accessible`, async ({ page }) => {
    const errors = collectErrors(page, FIREBASE_PLACEHOLDER);
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
    await expect(page.getByRole("button", { name: start }).first()).toBeVisible();
    const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((ls) => ls.map((l) => `${l.getAttribute("hreflang")} ${new URL(l.getAttribute("href")!).pathname}`));
    const s = path.replace("/it", "");
    expect(alternates).toEqual(expect.arrayContaining([`en ${s}`, `it /it${s}`]));
    await expectNoA11yViolations(page);
    expect(errors).toEqual([]);
  });
}
