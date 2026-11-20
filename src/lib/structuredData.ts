import type { Locale } from "./types";
import { LANDING, pick } from "./landingCopy";
import { SITE_DESCRIPTION, SITE_DESCRIPTION_IT, SITE_NAME, SITE_TITLE, SITE_TITLE_IT, SITE_URL } from "./site";

// What search engines read about the landing page (schema.org): the app
// itself, and the questions it answers — in the page's language.
export function landingStructuredData(locale: Locale) {
  const it = locale === "it";
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE_NAME,
      alternateName: it ? SITE_TITLE_IT : SITE_TITLE,
      url: it ? `${SITE_URL}/it` : SITE_URL,
      description: it ? SITE_DESCRIPTION_IT : SITE_DESCRIPTION,
      applicationCategory: "HealthApplication",
      applicationSubCategory: "Calisthenics",
      operatingSystem: "Web, Android, iOS",
      inLanguage: locale,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      featureList: LANDING.showcase.map((s) => pick(locale, s.title)),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: LANDING.faq.items.map((f) => ({
        "@type": "Question",
        name: pick(locale, f.q),
        acceptedAnswer: { "@type": "Answer", text: pick(locale, f.a) },
      })),
    },
  ];
}

// for a <script type="application/ld+json">; "<" escaped so text can't end the tag
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
