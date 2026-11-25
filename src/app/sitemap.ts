import type { MetadataRoute } from "next";
import { LANDING_LANGUAGES, PUBLIC_PATHS, SITE_URL } from "@/lib/site";
import { sportLanguages } from "@/lib/sportPages";
import type { ExtraSport } from "@/lib/sports/types";

const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = (m: Record<string, string>) => ({
    languages: Object.fromEntries(
      Object.entries(m).map(([k, v]) => [k, abs(v)]),
    ),
  });
  const landing = langs(LANDING_LANGUAGES);
  // a sport page in either language links both
  const sportOf = (path: string) =>
    path.replace(/^\/it/, "").slice(1) as ExtraSport;
  const isSport = (path: string) => /^(\/it)?\/(yoga|pilates)$/.test(path);
  return PUBLIC_PATHS.map((path) => ({
    url: abs(path),
    changeFrequency: "monthly",
    priority: path === "/" || path === "/it" ? 1 : 0.5,
    ...(path === "/" || path === "/it"
      ? { alternates: landing }
      : isSport(path)
        ? { alternates: langs(sportLanguages(sportOf(path))) }
        : {}),
  }));
}
