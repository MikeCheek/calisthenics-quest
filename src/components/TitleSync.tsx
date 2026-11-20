"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

// Page titles come from each route's metadata, in English. In Italian the
// page name part ("Skills · BarQuests") is translated here, after Next has
// set it; the brand stays as is.
export default function TitleSync() {
  const { locale, tx } = useLanguage();
  const pathname = usePathname();
  useEffect(() => {
    if (locale === "en") return;
    const id = requestAnimationFrame(() => {
      const [page, ...rest] = document.title.split(" · ");
      if (rest.length) document.title = [tx(page), ...rest].join(" · ");
      else if (page === "BarQuests — Your Calisthenics Journey") document.title = tx(page);
    });
    return () => cancelAnimationFrame(id);
  }, [locale, pathname, tx]);
  return null;
}
