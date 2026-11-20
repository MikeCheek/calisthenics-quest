import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// What search engines read about the app (schema.org): a free web app for
// fitness, in English and Italian.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "BarQuests — Your Calisthenics Journey",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "HealthApplication",
  applicationSubCategory: "Calisthenics training",
  operatingSystem: "Any (web browser, installable as an app)",
  inLanguage: ["en", "it"],
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  featureList: [
    "Personalised calisthenics sessions from a skill check",
    "Progressions for front lever, planche, muscle-up, handstand and more",
    "XP, levels, streaks and weekly missions",
    "Train together with a friend",
    "Works offline as an installable app",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // static data, defined above
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c") }}
      />
      <LandingPage />
    </>
  );
}
