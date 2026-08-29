"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Locale } from "@/lib/types";
import en from "@/lib/i18n/en";
import it from "@/lib/i18n/it";
import type { TranslationDict } from "@/lib/i18n/en";

const DICTS: Record<Locale, TranslationDict> = { en, it };
const STORAGE_KEY = "barquests:locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  // Namespaced translation lookup with {placeholder} interpolation, e.g.
  // t("dashboard", "welcomeBack", { name: "Alex" }).
  t: <NS extends keyof TranslationDict>(
    namespace: NS,
    key: keyof TranslationDict[NS],
    vars?: Record<string, string | number>
  ) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "en" || stored === "it") {
      setLocaleState(stored);
      document.documentElement.lang = stored;
      return;
    }
    // No stored preference yet — fall back to the browser's language once,
    // so an Italian-language browser doesn't default to English.
    const browserLang = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en";
    if (browserLang === "it") {
      setLocaleState("it");
      document.documentElement.lang = "it";
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    }
  }, []);

  const t = useCallback(
    <NS extends keyof TranslationDict>(
      namespace: NS,
      key: keyof TranslationDict[NS],
      vars?: Record<string, string | number>
    ): string => {
      const dict = DICTS[locale] ?? en;
      const namespaceDict = (dict[namespace] ?? en[namespace]) as Record<string, string>;
      let text = namespaceDict[key as string] ?? String(key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [locale]
  );

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
