import { defineConfig, devices } from "@playwright/test";

// Browser tests (e2e/): the app in demo mode (example data, no Firebase),
// plus the public pages on a regular dev server with placeholder Firebase
// settings — they don't need a real project to render.
//
//   npm run e2e            (starts both servers itself)
//
// In this repository's cloud sessions Chromium is preinstalled; elsewhere
// run `npx playwright install chromium` once.

const DEMO_PORT = 3301;
const PUBLIC_PORT = 3302;
const firebasePlaceholders = Object.fromEntries(
  ["API_KEY", "AUTH_DOMAIN", "PROJECT_ID", "STORAGE_BUCKET", "MESSAGING_SENDER_ID", "APP_ID"].map((k) => [`NEXT_PUBLIC_FIREBASE_${k}`, "placeholder"])
);

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Pixel 7"],
    // phone-sized Chromium; the tests set their own language
    locale: "en-GB",
    trace: "off",
  },
  projects: [
    { name: "app", testIgnore: /public\.spec/, use: { baseURL: `http://localhost:${DEMO_PORT}` } },
    { name: "public", testMatch: /public\.spec/, use: { baseURL: `http://localhost:${PUBLIC_PORT}` } },
  ],
  webServer: [
    {
      command: `npx next dev -p ${DEMO_PORT}`,
      url: `http://localhost:${DEMO_PORT}/about`,
      env: { NEXT_PUBLIC_DEMO_MODE: "1", NEXT_DIST_DIR: ".next-e2e-demo", ...firebasePlaceholders },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: `npx next dev -p ${PUBLIC_PORT}`,
      url: `http://localhost:${PUBLIC_PORT}/about`,
      env: { NEXT_DIST_DIR: ".next-e2e-public", ...firebasePlaceholders },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
