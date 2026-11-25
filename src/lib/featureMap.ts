// ---------------------------------------------------------------------------
// Every feature of the app in one place, grouped by what it's for. The
// sidebar (desktop), the "All features" sheet (phones) and the quick-actions
// button all read from here, so nothing is reachable only by knowing which
// tab hides it. Links can point inside a page: ?tab= picks a page's own tab
// and #id scrolls to the section (see ScrollToHash).
// ---------------------------------------------------------------------------

export type FeatureIcon =
  | "play" | "calendar" | "book" | "list" | "map" | "dice"
  | "layers" | "target" | "badge" | "trophy" | "compare" | "award" | "scale" | "sigma" | "history" | "trend"
  | "chat" | "bulb"
  | "users" | "activity" | "medal" | "flag" | "handshake"
  | "ruler" | "dumbbell" | "bell" | "globe" | "vibrate" | "shield" | "info";

export interface Feature {
  id: string;
  label: string; // English; Italian in phrases.it.ts
  hint: string;
  href: string;
  icon: FeatureIcon;
  keywords?: string; // extra words the search matches (English and Italian)
}

export interface FeatureGroup {
  id: "train" | "progress" | "coach" | "crew" | "settings";
  label: string;
  features: Feature[];
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "train",
    label: "Train",
    features: [
      { id: "today", label: "Today's session", hint: "Your session for today, ready to start", href: "/training", icon: "play", keywords: "workout start allenamento sessione oggi" },
      { id: "plan", label: "Week plan", hint: "The sessions ahead this week", href: "/plan", icon: "calendar", keywords: "schedule settimana piano" },
      { id: "library", label: "Exercise library", hint: "Every exercise, how to do it, do it now", href: "/library", icon: "book", keywords: "exercises esercizi libreria how to" },
      { id: "build", label: "Build a session", hint: "Pick exercises and save your own", href: "/build", icon: "list", keywords: "custom workout crea sessione" },
      { id: "parks", label: "Bar parks near you", hint: "Outdoor bars on the map, with their kit", href: "/parks", icon: "map", keywords: "park outdoor parco mappa map street workout" },
      { id: "wheel", label: "Bonus wheel", hint: "Spin for an extra exercise and XP", href: "/wheel", icon: "dice", keywords: "spin ruota bonus bet scommessa" },
    ],
  },
  {
    id: "progress",
    label: "Progress",
    features: [
      { id: "skills", label: "Skill tree", hint: "Every skill and the stage you're at", href: "/skills?tab=tree", icon: "layers", keywords: "skills stages livelli albero" },
      { id: "block", label: "Training block", hint: "Aim for a stage in a few weeks", href: "/skills?tab=tree#block", icon: "target", keywords: "goal obiettivo blocco program" },
      { id: "timeline", label: "Skill timeline", hint: "When your next stages should come", href: "/skills?tab=tree#timeline", icon: "trend", keywords: "eta previsione quando" },
      { id: "proven", label: "Proven skills", hint: "What you've verified in Skill Checks", href: "/skills?tab=proven", icon: "badge", keywords: "verified verificate radar wall" },
      { id: "road", label: "Trophy road", hint: "Milestones level by level", href: "/skills?tab=road", icon: "trophy", keywords: "levels livelli milestone traguardi" },
      { id: "compare", label: "Then vs now", hint: "Two periods side by side", href: "/compare", icon: "compare", keywords: "confronto prima dopo progress" },
      { id: "achievements", label: "Achievements", hint: "Badges you've earned and the next ones", href: "/profile?tab=activity#achievements", icon: "award", keywords: "badge trofei medaglie" },
      { id: "bodyweight", label: "Bodyweight", hint: "Log your weight, see the trend", href: "/profile?tab=activity#bodyweight", icon: "scale", keywords: "weight peso kg bilancia" },
      { id: "totals", label: "Your totals", hint: "Reps and time per exercise", href: "/profile?tab=activity#totals", icon: "sigma", keywords: "volume totali reps" },
      { id: "history", label: "Session history", hint: "Every session with its sets", href: "/profile?tab=activity#history", icon: "history", keywords: "log diario calendario storico calendar xp" },
    ],
  },
  {
    id: "coach",
    label: "Coach",
    features: [
      { id: "chat", label: "Ask your coach", hint: "Questions about your own training", href: "/coach#chat", icon: "chat", keywords: "ai chat domanda allenatore" },
      { id: "insights", label: "Coach insights", hint: "What the app has learned from you", href: "/coach#insights", icon: "bulb", keywords: "consigli adattamento rest recupero" },
    ],
  },
  {
    id: "crew",
    label: "Crew",
    features: [
      { id: "friends", label: "Friends and nudges", hint: "Add friends by code, nudge them", href: "/friends#friends", icon: "users", keywords: "amici codice spronata nudge" },
      { id: "together", label: "Train together", hint: "A shared session at two levels", href: "/friends#friends", icon: "handshake", keywords: "pair insieme coppia" },
      { id: "feed", label: "Crew activity", hint: "Friends' sessions, with kudos", href: "/friends#activity", icon: "activity", keywords: "feed kudos attività" },
      { id: "board", label: "Leaderboard", hint: "This week's ranking", href: "/friends#leaderboard", icon: "medal", keywords: "classifica ranking global" },
      { id: "event", label: "Community event", hint: "This month's shared goal", href: "/friends#event", icon: "flag", keywords: "evento mese sfida challenge" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    features: [
      { id: "body", label: "Body & schedule", hint: "Age, weight, training days", href: "/profile?tab=settings#body", icon: "ruler", keywords: "giorni età altezza" },
      { id: "equipment", label: "Where you train", hint: "The equipment you have", href: "/profile?tab=settings#equipment", icon: "dumbbell", keywords: "attrezzatura sbarra anelli equipment" },
      { id: "reminders", label: "Reminders", hint: "A daily nudge to train", href: "/profile?tab=settings#reminders", icon: "bell", keywords: "notifiche promemoria notifications push" },
      { id: "language", label: "Language", hint: "English or Italiano", href: "/profile?tab=settings#language", icon: "globe", keywords: "lingua italiano english" },
      { id: "prefs", label: "Vibration and sharing", hint: "Haptics and what friends see", href: "/profile?tab=settings#preferences", icon: "vibrate", keywords: "vibrazione condivisione haptics" },
      { id: "account", label: "Your data and account", hint: "Export, reset or delete", href: "/profile?tab=account", icon: "shield", keywords: "export esporta elimina reset privacy gdpr" },
      { id: "about", label: "About & privacy", hint: "Who made it, privacy notice", href: "/about", icon: "info", keywords: "info privacy ko-fi" },
    ],
  },
];

export const ALL_FEATURES = FEATURE_GROUPS.flatMap((g) => g.features);

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// search by the label and hint in the reader's language, plus keywords
export function searchFeatures(q: string, tx: (s: string) => string = (s) => s): FeatureGroup[] {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return FEATURE_GROUPS;
  return FEATURE_GROUPS.map((g) => ({
    ...g,
    features: g.features.filter((f) => {
      const hay = fold([f.label, tx(f.label), f.hint, tx(f.hint), tx(g.label), f.keywords ?? ""].join(" "));
      return words.every((w) => hay.includes(w));
    }),
  })).filter((g) => g.features.length);
}

// a feature's link is "current" when you're on its page, its tab (if any)
// and its section (if any) — a section link only when that section was
// opened; a whole-page link only when no section of it is
export function isCurrent(f: Pick<Feature, "href">, pathname: string, search: string, hash = "", all: Pick<Feature, "href">[] = []): boolean {
  const [beforeHash, section = ""] = f.href.split("#");
  const [path, query = ""] = beforeHash.split("?");
  if (pathname !== path) return false;
  const tab = new URLSearchParams(query).get("tab");
  if (tab && new URLSearchParams(search).get("tab") !== tab) return false;
  const here = hash.replace(/^#/, "");
  if (section) return here === section;
  // a page link stays current unless a section link of the same page is
  return !here || !all.some((o) => o.href.startsWith(beforeHash + "#") && o.href.endsWith("#" + here));
}

// the same page with a different ?tab or #section: Next doesn't remount, so
// pages and the scroller listen for this
export const URL_EVENT = "barquests:urlchange";
export const announceUrlChange = () => {
  if (typeof window === "undefined") return;
  // after the router has updated the address bar (a soft navigation can
  // take a moment); listeners ignore repeats
  for (const ms of [50, 250, 800]) setTimeout(() => window.dispatchEvent(new Event(URL_EVENT)), ms);
};
