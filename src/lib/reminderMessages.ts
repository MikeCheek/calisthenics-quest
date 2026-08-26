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

const STORAGE_KEY = "barquest:lastReminderIndex";

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
