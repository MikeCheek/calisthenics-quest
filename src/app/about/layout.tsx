import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "What BarQuests is, who it's for, and what it isn't: a free calisthenics training companion for outdoor workouts and skill challenges, not a certified course.",
  alternates: { canonical: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
