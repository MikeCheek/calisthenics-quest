import { isExtraSport } from "./index";
import type { ExtraSport } from "./types";

// Someone who starts from a sport's landing page (/yoga, /pilates) wants
// that sport: remember it through sign-up and onboarding, and offer its
// setup once they're in.
const KEY = "barquests:start-sport";

export function rememberSportIntent(s: ExtraSport) {
  try {
    localStorage.setItem(KEY, s);
  } catch {
    /* storage blocked: they can still add it from the sport button */
  }
}

// read once: the intent is cleared as it's taken
export function takeSportIntent(): ExtraSport | null {
  try {
    const v = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return isExtraSport(v) ? v : null;
  } catch {
    return null;
  }
}
