// ---------------------------------------------------------------------------
// The app's public address and the words search engines and link previews
// show. SITE_URL: NEXT_PUBLIC_SITE_URL if set (e.g. a custom domain), else
// the production address Vercel provides at build time, else localhost.
// ---------------------------------------------------------------------------

function siteUrl(env: Record<string, string | undefined> = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL || "localhost:3000";
  const withScheme = /^https?:\/\//.test(raw) ? raw : `${raw.startsWith("localhost") ? "http" : "https"}://${raw}`;
  return withScheme.replace(/\/+$/, "");
}

export const SITE_URL = siteUrl();
export { siteUrl };

export const SITE_NAME = "BarQuests";
export const SITE_TITLE = "BarQuests — Your Calisthenics Journey";
export const SITE_DESCRIPTION =
  "Free calisthenics training app for the outdoor bars: personalised workouts from a quick skill check, progressions for front lever, planche, muscle-up and handstand, XP, streaks and challenges with friends.";
export const SITE_KEYWORDS = [
  "calisthenics",
  "calisthenics app",
  "calisthenics workout",
  "bodyweight training",
  "street workout",
  "outdoor workout",
  "pull-up bar",
  "front lever progression",
  "planche progression",
  "muscle-up",
  "handstand",
  "calisthenics skills",
  "workout tracker",
  "allenamento calisthenics",
];

// Pages people can find from a search engine; everything else is the
// signed-in app and is kept out of the index.
export const PUBLIC_PATHS = ["/", "/about"];
