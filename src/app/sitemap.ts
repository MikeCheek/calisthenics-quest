import type { MetadataRoute } from "next";
import { LANDING_LANGUAGES, PUBLIC_PATHS, SITE_URL } from "@/lib/site";

const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const landing = { languages: Object.fromEntries(Object.entries(LANDING_LANGUAGES).map(([k, v]) => [k, abs(v)])) };
  return PUBLIC_PATHS.map((path) => ({
    url: abs(path),
    changeFrequency: "monthly",
    priority: path === "/" || path === "/it" ? 1 : 0.5,
    ...(path === "/" || path === "/it" ? { alternates: landing } : {}),
  }));
}
