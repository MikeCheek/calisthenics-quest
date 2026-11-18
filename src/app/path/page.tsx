import { redirect } from "next/navigation";

// The trophy road now lives under Progress — kept for old links and bookmarks.
export default function PathRedirect() {
  redirect("/progress?tab=road");
}
