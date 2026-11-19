import { Locale } from "../types";
import IT_PHRASES from "./phrases.it";

// ---------------------------------------------------------------------------
// Phrase-level translation for UI text and generated messages.
//
// Keys are the English text itself (templates may contain {placeholders}),
// so components stay readable and untranslated text gracefully falls back
// to English. Templates also translate *generated* strings: "Eased from
// Pull-ups — you skipped it recently" matches "Eased from {x} — you skipped
// it recently" and is rebuilt in Italian, with captured values translated
// too when they're known phrases (stage names etc.) — except {ex}
// placeholders, which hold exercise names: those stay English whatever the
// language (a product decision, like rank titles), even when an exercise
// shares its name with a skill that is translated.
// ---------------------------------------------------------------------------

const exact = new Map<string, string>(IT_PHRASES);

interface Template {
  re: RegExp;
  names: string[];
  it: string;
}

const templates: Template[] = IT_PHRASES.filter(([en]) => /\{\w+\}/.test(en)).map(([en, it]) => {
  const names: string[] = [];
  const pattern = en
    .split(/(\{\w+\})/)
    .map((part) => {
      const m = part.match(/^\{(\w+)\}$/);
      if (m) {
        names.push(m[1]);
        return "(.+?)";
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("");
  return { re: new RegExp(`^${pattern}$`), names, it };
});

function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

function translateIt(s: string): string {
  const hit = exact.get(s);
  if (hit !== undefined) return hit;
  // composite notes, e.g. "+1 set — consistently completed · rest 90s → 60s, …"
  if (s.includes(" · ")) return s.split(" · ").map(translateIt).join(" · ");
  for (const t of templates) {
    const m = s.match(t.re);
    if (!m) continue;
    const vars: Record<string, string> = {};
    t.names.forEach((n, i) => (vars[n] = n === "ex" ? m[i + 1] : exact.get(m[i + 1]) ?? m[i + 1]));
    return fill(t.it, vars);
  }
  return s;
}

export function translate(locale: Locale, text: string, vars?: Record<string, string | number>): string {
  const base = locale === "it" ? translateIt(text) : text;
  return vars ? fill(base, vars) : base;
}
