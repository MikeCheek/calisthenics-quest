import { redirect } from "next/navigation";

// Pair training moved into Friends. Keeps the query string, so pairing
// invites sent before the move (/pair?code=…) still open the right session.
export default function PairRedirect({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") q.set(k, v);
  }
  const qs = q.toString();
  redirect(qs ? `/friends?${qs}` : "/friends");
}
