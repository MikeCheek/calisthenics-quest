"use client";

import { useLanguage } from "@/context/LanguageContext";

// First thing a keyboard user reaches: jumps past the header and menu
// straight to the page's <main id="main">.
export default function SkipLink() {
  const { tx } = useLanguage();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[300] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-orange-500 focus:text-zinc-950 focus:font-medium"
    >
      {tx("Skip to content")}
    </a>
  );
}
