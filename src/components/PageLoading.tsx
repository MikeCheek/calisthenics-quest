"use client";

import { useLanguage } from "@/context/LanguageContext";

// Full-screen placeholder while a page waits for auth or data.
export default function PageLoading() {
  const { tx } = useLanguage();
  return <main className="min-h-screen flex items-center justify-center text-zinc-400">{tx("Loading…")}</main>;
}
