import type { Metadata } from "next";
import SportLanding from "@/components/sports/SportLanding";
import { sportPageMetadata } from "@/lib/sportPages";

const meta = sportPageMetadata("pilates", "it");
export const metadata: Metadata = { ...meta, title: meta.title };

export default function Page() {
  return <SportLanding sport="pilates" locale="it" />;
}
