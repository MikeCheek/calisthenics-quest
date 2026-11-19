import { redirect } from "next/navigation";
// The trophy road lives under Skills — kept for old links and bookmarks.
export default function PathRedirect() {
  redirect("/skills?tab=road");
}
