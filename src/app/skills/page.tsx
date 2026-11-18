import { redirect } from "next/navigation";

// Skills now live under Progress — kept so old links and bookmarks still work.
export default function SkillsRedirect() {
  redirect("/progress?tab=skills");
}
