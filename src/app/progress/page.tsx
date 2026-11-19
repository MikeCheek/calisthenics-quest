import { redirect } from "next/navigation";

// Progress was split up: skills and the trophy road live in Skills, the XP
// chart and session history in Me (Profile), the coach in Coach. Kept so old
// links, bookmarks and notifications still land in the right place.
const TARGET: Record<string, string> = {
  skills: "/skills",
  road: "/skills?tab=road",
  history: "/profile",
  overview: "/skills",
};

export default function ProgressRedirect({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "overview";
  redirect(TARGET[tab] ?? "/skills");
}
