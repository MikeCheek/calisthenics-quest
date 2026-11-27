// Demo mode: a fake signed-in athlete with example data, for looking at the
// signed-in screens without a Firebase account (`npm run demo`). It needs
// BOTH the flag and the development server — `next build` always runs as
// production, so a deployed app can never be in demo mode.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1" && process.env.NODE_ENV === "development";

// kept here (not in fixture.ts) so code that only checks the flag doesn't
// pull the example data into production bundles
export const DEMO_UID = "demo-athlete";

// Demo scenarios: variations of the example athlete, for trying (and
// testing) other situations. sessionStorage "barquests:demo-scenario" holds
// a comma-separated list — e2e/helpers.ts sets it with demoScenario():
//   fresh — a brand-new user: not set up, nothing logged (the first login)
//   guest — signed in as a guest (no Google account)
//   away — the example athlete, back after 12 days without training
export type DemoScenario = "fresh" | "guest" | "away";
export const DEMO_SCENARIO_KEY = "barquests:demo-scenario";

export function demoScenario(name: DemoScenario): boolean {
  try {
    return typeof window !== "undefined" && (sessionStorage.getItem(DEMO_SCENARIO_KEY) ?? "").split(",").includes(name);
  } catch {
    return false; // storage blocked: the usual example athlete
  }
}
