"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

const KEY = "barquests:openedPages";

const read = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

// Offline, a page this phone has never opened can't load (its code was never
// downloaded): a tap on a link to one stays where it is and says why, instead
// of an empty or signed-out screen. Pages opened before work offline.
export default function OfflineNavGuard() {
  const pathname = usePathname();
  const toast = useToast();
  const { tx } = useLanguage();

  // remember the pages this phone has opened (their code is cached now)
  useEffect(() => {
    if (!pathname) return;
    const seen = read();
    if (seen.includes(pathname)) return;
    try {
      localStorage.setItem(KEY, JSON.stringify([...seen, pathname].slice(-50)));
    } catch {
      /* storage blocked: the guard just lets the tap through */
    }
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navigator.onLine || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (read().includes(url.pathname)) return;
      e.preventDefault();
      e.stopPropagation();
      toast.info(tx("That page needs a connection the first time — Today and your session work offline."));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [toast, tx]);

  return null;
}
