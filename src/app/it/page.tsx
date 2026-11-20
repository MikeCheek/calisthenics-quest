import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { LANDING_LANGUAGES, SITE_DESCRIPTION_IT, SITE_TITLE_IT } from "@/lib/site";
import { jsonLd, landingStructuredData } from "@/lib/structuredData";

// The landing page in Italian, rendered on the server so search engines
// read it in Italian (the app itself switches language in the browser).
export const metadata: Metadata = {
  title: { absolute: SITE_TITLE_IT },
  description: SITE_DESCRIPTION_IT,
  alternates: { canonical: "/it", languages: LANDING_LANGUAGES },
  openGraph: { title: SITE_TITLE_IT, description: SITE_DESCRIPTION_IT, url: "/it", locale: "it_IT", alternateLocale: ["en_US"] },
  twitter: { title: SITE_TITLE_IT, description: SITE_DESCRIPTION_IT },
};

export default function HomeIt() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(landingStructuredData("it")) }} />
      <LandingPage locale="it" />
    </>
  );
}
