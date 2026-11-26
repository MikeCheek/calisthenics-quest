import { SPORTS, SPORT_META, activeSportOf, isExtraSport, upNext } from "./sports";
import { blockStatus } from "./sports/extras";

// A big pool of short, playful reminder lines. One is picked at random each
// time, avoiding an immediate repeat of the last one shown (tracked in
// localStorage — see notifications.ts).

export const REMINDER_LINES: string[] = [
  "Your pull-up bar called. It misses you.",
  "The park bars don't judge. Come find out for yourself.",
  "Skipping today? Your front lever is taking notes.",
  "5 minutes of skill work beats 0 minutes of excuses.",
  "Somewhere out there, your rival is doing one more rep.",
  "Streaks don't maintain themselves. You do.",
  "Your future self called — they said thanks for today's session.",
  "Gravity is undefeated. Go argue with it for 20 minutes.",
  "Plot twist: the hardest part is just showing up.",
  "That planche isn't going to hold itself.",
  "Bars are patient. Your excuses are getting old though.",
  "One more day of consistency, one step closer to that skill.",
  "Warning: skipping today may cause regret tomorrow.",
  "Your muscles just texted. They want a workout, not a rest day.",
  "Champions train. Everyone else watches from the bench.",
  "Today's a great day to be slightly better than yesterday.",
  "The bar is calling and you must go.",
  "Small sessions, big gains. Let's go.",
  "Your streak is currently judging your life choices.",
  "Nobody regrets a workout. Everybody regrets skipping one.",
  "The only bad session is the one that didn't happen.",
  "Your goals are patient, but not THAT patient.",
  "Fun fact: consistency beats motivation every time.",
  "Today's session is shorter than the time you'll spend deciding not to do it.",
  "Your body is ready. Is your willpower?",
  "The grind doesn't care about your mood. Show up anyway.",
  "Somewhere, a pull-up bar is collecting dust because of you.",
  "You vs. you. Today's round starts now.",
  "Discipline > motivation. Let's prove it.",
  "That skill you want isn't coming to you. Go get it.",
];

const STORAGE_KEY = "barquests:lastReminderIndex";

export function pickReminderLine(): string {
  let lastIndex = -1;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) lastIndex = Number(stored);
  } catch {
    // localStorage unavailable — fine, just skip repeat-avoidance
  }

  let idx = Math.floor(Math.random() * REMINDER_LINES.length);
  if (REMINDER_LINES.length > 1) {
    while (idx === lastIndex) {
      idx = Math.floor(Math.random() * REMINDER_LINES.length);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, String(idx));
  } catch {
    // ignore
  }

  return REMINDER_LINES[idx];
}

// ---- reminders that know your sport ----
// Lines for yoga and Pilates ({sport} is filled in), and personal ones about
// a block or a skill close to its next stage. Calisthenics keeps the pool
// above. Each is a template plus values, for translate(locale, text, vars).

export const SPORT_REMINDER_LINES: string[] = [
  "Your mat is waiting. Even 15 minutes of {sport} counts.",
  "A little {sport} today keeps your streak and your spine happy.",
  "Roll out the mat — today's {sport} session is ready.",
  "Breathe, move, done. Your {sport} session takes less time than you think.",
  "Consistency beats intensity. A short {sport} session today?",
];

export interface Reminder {
  text: string;
  vars?: Record<string, string | number>;
}

type ReminderUser = {
  activeSport?: import("./sports/types").SportId;
  sports?: import("./types").UserDoc["sports"];
};

// The reminder for this person now. `rnd` picks between a personal line and
// a general one (and which general one), so both stay in rotation.
export function reminderFor(user: ReminderUser | null | undefined, rnd: () => number = Math.random): Reminder {
  const sport = activeSportOf(user as never);
  const track = isExtraSport(sport) ? user?.sports?.[sport] : undefined;
  if (!isExtraSport(sport) || !track) return { text: pickReminderLine() };
  const def = SPORTS[sport];
  const name = SPORT_META[sport].name;
  if (rnd() < 0.5) {
    const status = blockStatus(track);
    const bsk = status ? def.skills.find((s) => s.key === status.block.skill) : undefined;
    if (status && bsk && !status.overdue)
      return { text: "Your {sport} block: {skill} → {stage}, week {a} of {b}. A session today keeps it on track.", vars: { sport: name, skill: bsk.name, stage: bsk.stages[status.block.target]?.label ?? "", a: status.week, b: status.weeks } };
    const next = upNext(def, track, 1)[0];
    if (next?.next) return { text: "{sport} today? {skill} is close to {stage}.", vars: { sport: name, skill: next.skill.name, stage: next.next.label } };
  }
  return { text: SPORT_REMINDER_LINES[Math.floor(rnd() * SPORT_REMINDER_LINES.length) % SPORT_REMINDER_LINES.length], vars: { sport: name } };
}
