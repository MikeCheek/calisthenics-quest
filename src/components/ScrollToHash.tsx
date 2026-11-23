"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { URL_EVENT } from "@/lib/featureMap";

// Links like /profile?tab=activity#bodyweight: once the section has
// rendered (pages load data first), scroll to it and move focus there.
export default function ScrollToHash() {
  const pathname = usePathname();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let handled = "";
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id || window.location.href === handled) return;
      handled = window.location.href;
      let tries = 0;
      const attempt = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
          if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
          el.focus({ preventScroll: true });
          el.classList.add("section-flash");
          setTimeout(() => el.classList.remove("section-flash"), 1600);
        } else if (tries++ < 40) timer = setTimeout(attempt, 100); // up to 4 s while the page loads
      };
      attempt();
    };
    go();
    window.addEventListener(URL_EVENT, go);
    const onHash = () => {
      handled = "";
      go();
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener(URL_EVENT, go);
      window.removeEventListener("hashchange", onHash);
    };
  }, [pathname]);
  return null;
}
