import type { Metadata } from "next";

// part of the signed-in app: a title for the tab, kept out of search results
export const metadata: Metadata = { title: "Bar parks near you", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
