import { Locale } from "./types";
import { localizeDetail } from "./i18n/detail";

// ---------------------------------------------------------------------------
// Spoken coaching for guided mode, via the browser's built-in speech
// synthesis — no audio assets, works offline once the voice is installed.
// ---------------------------------------------------------------------------

const PREF_KEY = "barquests:voice";

// Turns an exercise's detail string into something that sounds natural:
// "4 x 5-6 reps" -> "4 sets of 5 to 6 reps"; "3 x 20s" -> "3 sets of 20
// seconds". Parenthetical notes are dropped — they read badly aloud.
export function speakableDetail(detail: string, locale: Locale): string {
  let s = detail.replace(/\s*\([^)]*\)/g, "").trim();
  if (locale === "it") {
    // "4 x max reps" reads as "4 serie, massimo ripetizioni"; everything else
    // goes through the shared written translation ("slow descent", "each
    // side"…) and then gets its numbers and units spelled out
    s = s.replace(/^(\d+)\s*x\s*max\s+(?!unbroken)/i, "$1 serie, massimo ");
    s = localizeDetail(s, "it")
      .replace(/\brip\. max\b/g, "massimo di ripetizioni")
      .replace(/\brip\./g, "ripetizioni")
      .replace(/\btenuta max\b/g, "tenuta massima")
      .replace(/\btentativo max\b/g, "tentativo massimo");
    s = s
      .replace(/^(\d+)\s*[x×]\s*/i, "$1 serie da ")
      .replace(/(\d+)\s*-\s*(\d+)/g, "da $1 a $2")
      .replace(/da da /g, "da ")
      .replace(/di da /g, "da ")
      .replace(/serie da (tenuta|tentativ)/g, "serie, $1")
      .replace(/(\d+)\s*s\b/g, "$1 secondi")
      .replace(/(\d+)\s*min\b/g, "$1 minuti")
      .replace(/\breps?\b/gi, "ripetizioni")
      .replace(/\bper side\b/gi, "per lato")
      .replace(/\bper minute\b/gi, "al minuto")
      .replace(/\bhold\b/gi, "tenuta")
      .replace(/\bmax\b/gi, "massimo")
      .replace(/\battempts?\b/gi, "tentativi");
  } else {
    s = s
      .replace(/^1\s*x\s*max\s+/i, "1 set, max ")
      .replace(/^(\d+)\s*x\s*max\s+/i, "$1 sets, max ")
      .replace(/^1\s*x\s*/i, "1 set of ")
      .replace(/^(\d+)\s*x\s*/i, "$1 sets of ")
      .replace(/(\d+)\s*-\s*(\d+)/g, "$1 to $2")
      .replace(/(\d+)\s*s\b/g, "$1 seconds")
      .replace(/(\d+)\s*min\b/g, "$1 minutes")
      .replace(/\bper side\b/gi, "each side");
  }
  return s.replace(/\s+/g, " ").replace(/,\s*$/, "").trim();
}

// Exercise names sometimes carry notes in parentheses ("Shoulder
// dislocates (band or stick)") that read badly aloud.
export function speakableName(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

export function voiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

// Per-device preference; on by default where speech is available.
export function voicePref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setVoicePref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // storage unavailable — the toggle still works for this session
  }
}

function pickVoice(locale: Locale): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const lang = locale === "it" ? "it" : "en";
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith(lang) && v.localService) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith(lang))
  );
}

// Speaks a cue. `interrupt` cuts off whatever is being said (for cues that
// are time-critical, like "go" or "ten seconds"); otherwise cues queue.
// Never throws: speech is a nice-to-have, and an exception here (blocked by
// a browser policy, a broken voice, ...) must not take down guided mode.
export function speak(text: string, locale: Locale, opts: { interrupt?: boolean } = {}) {
  if (!voiceSupported() || !text) return;
  try {
    const synth = window.speechSynthesis;
    if (opts.interrupt) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale === "it" ? "it-IT" : "en-US";
    const v = pickVoice(locale);
    if (v) u.voice = v;
    u.rate = 1.05;
    synth.speak(u);
  } catch {
    // stay silent
  }
}

export function stopSpeaking() {
  try {
    if (voiceSupported()) window.speechSynthesis.cancel();
  } catch {
    // nothing to stop
  }
}
