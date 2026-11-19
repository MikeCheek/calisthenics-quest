import type { Exercise, ExerciseFeedback, TrainingSession } from "./types";
import type { TimerLog } from "./timingLearning";

// ---------------------------------------------------------------------------
// The training session in progress, kept on this device so closing the tab,
// a reload or the phone killing the app doesn't lose it. Saved as the
// athlete goes; cleared when the session is finished or discarded. Old
// sessions (> 12 h) and other accounts' sessions are ignored.
//
// Timers are saved as end times, not seconds left, so a rest that was running
// when the app closed has really moved on when it's reopened.
// ---------------------------------------------------------------------------

const KEY = "barquests:activeSession";
const TIMER_KEY = "barquests:activeTimer";
export const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export interface GuidedProgress {
  index: number;
  completed: number[];
  skipped: number[];
  overrides: Record<number, Exercise>;
  tooHard: ExerciseFeedback[];
  timerLogs: Record<number, TimerLog>;
  checkResults: Record<number, number | boolean | undefined>;
  checkVideos: Record<number, string | undefined>;
  restEndsAt: number | null; // between-exercise rest, when one is running
  restLeft: number | null; // …or the seconds left when it was paused
  earlyStops?: Record<number, number>; // step -> sets done when stopped early
  fatigueAt?: Record<number, number>; // step -> fatigue when skipped
  tiredAt?: number | null; // effort done when "I'm tired" was pressed
}

export interface SavedSession {
  v: 1;
  uid: string;
  savedAt: number;
  startedAt: number | null;
  session: TrainingSession;
  paused: boolean;
  guided?: GuidedProgress;
}

// One exercise timer at a time is active in guided mode.
export interface SavedTimer {
  sessionId: string;
  step: number;
  set: number;
  phase: "work" | "rest";
  endsAt: number | null; // running
  secondsLeft: number | null; // paused
  log: TimerLog;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — the session still works, just isn't kept
  }
}

export function isRestorable(saved: SavedSession | null, uid: string, now = Date.now()): saved is SavedSession {
  return !!saved && saved.v === 1 && saved.uid === uid && now - saved.savedAt < MAX_AGE_MS && !!saved.session?.sets?.length;
}

export function loadActiveSession(uid: string, now = Date.now()): SavedSession | null {
  const saved = read<SavedSession>(KEY);
  return isRestorable(saved, uid, now) ? saved : null;
}

export function saveActiveSession(s: Omit<SavedSession, "v" | "savedAt">) {
  const prev = read<SavedSession>(KEY);
  const keepGuided = prev && prev.session?.id === s.session.id ? prev.guided : undefined;
  write(KEY, { v: 1, savedAt: Date.now(), ...s, guided: s.guided ?? keepGuided });
}

export function saveGuidedProgress(sessionId: string, guided: GuidedProgress) {
  const prev = read<SavedSession>(KEY);
  if (!prev || prev.session?.id !== sessionId) return;
  write(KEY, { ...prev, savedAt: Date.now(), guided });
}

export function clearActiveSession() {
  write(KEY, null);
  write(TIMER_KEY, null);
}

export function loadTimer(sessionId: string, step: number): SavedTimer | null {
  const t = read<SavedTimer>(TIMER_KEY);
  return t && t.sessionId === sessionId && t.step === step ? t : null;
}

export function saveTimer(t: SavedTimer | null) {
  write(TIMER_KEY, t);
}

// What's left of a saved countdown: from its end time if it was running.
export function secondsLeftOf(endsAt: number | null, pausedLeft: number | null, now = Date.now()): number | null {
  if (endsAt !== null) return Math.max(0, Math.ceil((endsAt - now) / 1000));
  return pausedLeft;
}
