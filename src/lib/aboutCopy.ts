// The About page's text, in English. The page renders every entry through
// the phrase translator (lib/i18n/tx.ts); tests check each one has an
// Italian version, so editing the English here without updating
// phrases.it.ts fails the build's tests rather than silently showing English.
// Privacy wording must keep matching what the code actually does.

export const ABOUT = {
  back: "Back",
  title: "About BarQuests",
  version: "Version {v} — an independent, personal calisthenics training project.",

  whoTitle: "Who made this",
  whoBefore: "BarQuests is built and maintained by",
  whoAfter:
    ", an independent developer. It's a passion project, not a company product — if it's helped your training and you'd like to support keeping it going, a coffee is always appreciated.",
  kofi: "Support on Ko-fi",
  portfolio: "Portfolio website",

  privacyTitle: "Privacy notice",
  collectedLead: "What's collected.",
  collected:
    "When you sign in with Google, BarQuests stores your name, email address, and profile photo. If you train as a guest, none of those exist — just an anonymous account until you choose to save with Google. Beyond that, it stores what you enter or log: your body stats, which equipment you have, your skill stages and mastery, your assessment answers and which of them have been verified in Skill Checks, a history of every session you finish (exercises, sets, reps, hold times and duration), personal records, what the app has learned from your training (which exercises felt too hard, your usual rest), XP, level, streaks, missions, weekly totals, friend connections, and your notification and language preferences.",
  usedLead: "What it's used for.",
  used:
    "Exclusively to run the app: generating training sessions matched to your level, equipment and history, tracking your progress, and enabling the social features (friend codes, nudges, paired training, the weekly leaderboard) you choose to use.",
  livesLead: "Where it lives.",
  lives:
    "Your data is stored in Google Firebase (Firestore and Authentication), Google's cloud infrastructure. If you use the optional AI features, training data is sent to OpenRouter to generate the response — never your name, email, photo or body stats. For exercise tips, plan coaching and plan review that's the exercises involved and a short skill/equipment summary. For “Ask your coach” it's your skill levels, what you've verified or found hard, your equipment, your recent sessions and the questions you type; the conversation itself isn't stored on a server. A public summary of your profile is readable by other signed-in users (they find you through your friend code): name, photo, level, streak, XP, session count, skills and mastery, and this week's totals for the leaderboard (sessions, minutes, skills proven, XP) — nothing else. Only if you join the global leaderboard does your first name, last initial, photo and this week's totals appear in a list every signed-in user can see; you can leave it any time. Guests have no public profile. If you turn on notifications, a push address for each of your devices is stored with your account so reminders, nudges and invites can reach them, delivered through Google's Firebase Cloud Messaging; it's removed when you turn notifications off or sign out on that device. To keep out automated abuse, the app may use Google reCAPTCHA (through Firebase App Check), which checks your browser under Google's privacy policy. If you use the weather card or bar parks, your location is rounded to about 1 km and kept on your device; only that rounded point is sent to Open-Meteo for the forecast and to OpenStreetMap's Overpass service to find parks, and map tiles come from OpenStreetMap. Parks you add and what you report about a park's equipment (with your first name and an optional note) are visible to other signed-in users; you can remove your report any time, and deleting your account removes them.",
  controlLead: "Your control.",
  control:
    "You can remove a friend, turn off notifications, or change your language at any time from your profile. Under Me → Account you can download a copy of your data, reset parts of it, or permanently delete your account — which also removes you from your friends' lists.",

  cookieTitle: "Cookie policy",
  cookieIntro:
    "BarQuests doesn't use tracking or advertising cookies — there are no ads, no analytics trackers, and nothing here is sold or shared with advertisers.",
  localIntro: "What the app does store locally on your device — all of it functional, and none of it sent anywhere by the app:",
  localItems: [
    "Your signed-in session, via Firebase Authentication's own browser storage",
    "Your chosen language (English/Italiano), so it persists across visits",
    "Which reminder message was shown last, so they rotate instead of repeating",
    "Whether you turned voice coaching and lock-screen controls on",
    "Your “Ask your coach” conversation, only until you close the tab",
    "Skill Check videos you choose to record — kept only on this device, never uploaded",
    "The session in progress, so closing the app doesn't lose it — cleared when you finish",
    "If App Check is on, Google reCAPTCHA's own storage, used to tell real visitors from bots",
  ],
  localClear: "Clearing your browser's site data removes all of it, including any recorded videos.",

  otherTitle: "Other useful things to know",
  notMedical:
    "BarQuests isn't a substitute for professional coaching, physical therapy, or medical advice — train within your ability, warm up properly, and check with a doctor before starting a new training program if you have any health concerns.",
  builtWith:
    "Built with Next.js, Firebase, and Tailwind CSS, and installable as a Progressive Web App — add it to your home screen from your browser's share/menu button for an app-like experience with offline support for cached pages.",
  reachOut: "Found a bug or have an idea? The GitHub link above is the best place to reach out.",
} as const;

// every string on the page, for the translation-coverage test
export function allAboutStrings(): string[] {
  return Object.values(ABOUT).flatMap((v) => (Array.isArray(v) ? [...v] : [v as string]));
}
