import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { LANDING_LANGUAGES } from "@/lib/site";
import { jsonLd, landingStructuredData } from "@/lib/structuredData";

export const metadata: Metadata = { alternates: { canonical: "/", languages: LANDING_LANGUAGES } };

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(landingStructuredData("en")) }} />
      <LandingPage locale="en" />
    </>
  );
}
