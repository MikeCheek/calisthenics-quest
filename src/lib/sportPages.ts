import type { Metadata } from "next";
import { SPORT_COPY, type SportCopy } from "./sportLandingCopy";
import type { ExtraSport } from "./sports/types";
import type { Locale } from "./types";

// The sport landing pages' addresses and what search engines and link
// previews show for them.
export const sportPath = (s: ExtraSport, l: Locale) =>
  l === "it" ? `/it${SPORT_COPY[s].path}` : SPORT_COPY[s].path;
export const sportLanguages = (s: ExtraSport) => ({
  en: sportPath(s, "en"),
  it: sportPath(s, "it"),
  "x-default": sportPath(s, "en"),
});

export function sportPageMetadata(s: ExtraSport, l: Locale): Metadata {
  const c: SportCopy = SPORT_COPY[s];
  const title = c.title[l];
  const description = c.description[l];
  const url = sportPath(s, l);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: sportLanguages(s) },
    openGraph: {
      title,
      description,
      url,
      ...(l === "it" ? { locale: "it_IT", alternateLocale: ["en_US"] } : {}),
    },
    twitter: { title, description },
  };
}
