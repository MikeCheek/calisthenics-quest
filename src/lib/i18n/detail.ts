import type { Locale } from "../types";

// ---------------------------------------------------------------------------
// Exercise prescriptions ("4 x 3-5 reps, slow descent") in the athlete's
// language. The data stays in English — the timer, the set adjuster and the
// session fitter all parse it — and only the displayed (and spoken) text is
// translated, at render time. Phrases are matched longest first, so
// "max reps" becomes "rip. max" rather than "max rip.".
// ---------------------------------------------------------------------------

const IT: [RegExp, string][] = [
  [/^Up to 3 attempts at (\d+) clean reps?$/i, "Fino a 3 tentativi per $1 rip. pulite"],
  [/^Up to 3 attempts$/i, "Fino a 3 tentativi"],
  [/\bmax unbroken reps\b/gi, "rip. max senza pause"],
  [/\brest-pause (\d+s) between\b/gi, "rest-pause di $1"],
  [/\bmax reps\b/gi, "rip. max"],
  [/\bmax hold\b/gi, "tenuta max"],
  [/\bmax attempts?\b/gi, "tentativo max"],
  [/\breps per minute\b/gi, "rip. al minuto"],
  [/\bper minute\b/gi, "al minuto"],
  [/\bslow (?:descent|lower)\b/gi, "discesa lenta"],
  [/(\d+(?:-\d+)?s) descent\b/gi, "discesa di $1"],
  [/(\d+s) negative\b/gi, "negativa di $1"],
  [/(\d+s) down \/ (\d+s) up\b/gi, "$1 giù / $2 su"],
  [/\bcontrol the turnover\b/gi, "controlla la rotazione"],
  [/(\d+(?:-\d+)?s) hold\b/gi, "tenuta di $1"],
  [/\b(?:per|each) side\b/gi, "per lato"],
  [/\b(?:per|each) direction\b/gi, "per direzione"],
  [/\beach leg\b/gi, "per gamba"],
  [/\beach position\b/gi, "per posizione"],
  [/\beach\b/gi, "ciascuno"],
  [/\btarget\b/gi, "obiettivo"],
  [/\baccumulate\b/gi, "accumula"],
  [/\bbodyweight\b/gi, "peso corporeo"],
  [/\bassisted\b/gi, "assistito"],
  [/\bascent\b/gi, "salita"],
  [/\bslow\b/gi, "lento"],
  [/\bhold\b/gi, "tenuta"],
  [/\breps?\b/gi, "rip."],
  [/\battempts\b/gi, "tentativi"],
  [/\battempt\b/gi, "tentativo"],
  [/\bsteps\b/gi, "passi"],
  [/\blaps\b/gi, "giri"],
];

export function localizeDetail(detail: string, locale: Locale): string {
  if (!detail) return detail;
  // a real multiplication sign after the set count, in every language (the
  // font only draws one between two digits, so "5 x max reps" kept its x)
  let s = detail.replace(/^(\d+(?:-\d+)?)\s*x\s+/i, "$1 × ");
  if (locale !== "it") return s;
  for (const [re, to] of IT) s = s.replace(re, to);
  return s;
}

// English words that should never survive translation (used by the tests).
export const ENGLISH_DETAIL_WORDS = /\b(reps?|side|each|slow|hold|attempts?|descent|lower|direction|leg|position|target|accumulate|bodyweight|assisted|ascent|steps|laps|minute|unbroken|between|negative|down|up|clean)\b/i;
