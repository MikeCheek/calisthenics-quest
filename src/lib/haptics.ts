// ---------------------------------------------------------------------------
// Haptic timer cues: the phone vibrates at the same moments the timer
// sounds (countdown, go, rest, done), so it can stay in a pocket. Each cue
// has its own pattern. Android browsers support it; iPhones don't let web
// apps vibrate, so there the switch isn't shown. The choice is kept on the
// device and is on by default.
// ---------------------------------------------------------------------------

const KEY = "barquests:haptics";

export const hapticsSupported = () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export function hapticsOn(): boolean {
  if (!hapticsSupported()) return false;
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setHaptics(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* not important */
  }
}

export const PATTERNS = {
  tick: [30], // countdown: a tap
  go: [70, 60, 70], // work starts: two firm pulses
  rest: [250], // rest starts: one long, calm buzz
  complete: [60, 50, 60, 50, 180], // exercise done: a little flourish
} as const;

export function buzz(kind: keyof typeof PATTERNS) {
  if (!hapticsOn()) return;
  try {
    navigator.vibrate([...PATTERNS[kind]]);
  } catch {
    /* not available */
  }
}
