import { redirect } from "next/navigation";

// The standalone focus timer was retired; training has its own timers.
export default function PomodoroRedirect() {
  redirect("/training");
}
