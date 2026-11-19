// Demo mode: a fake signed-in athlete with example data, for looking at the
// signed-in screens without a Firebase account (`npm run demo`). It needs
// BOTH the flag and the development server — `next build` always runs as
// production, so a deployed app can never be in demo mode.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1" && process.env.NODE_ENV === "development";

// kept here (not in fixture.ts) so code that only checks the flag doesn't
// pull the example data into production bundles
export const DEMO_UID = "demo-athlete";
