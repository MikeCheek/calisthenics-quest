// A train-together invite link (/friends?code=…) opened before signing in
// would otherwise be lost on the way through the landing page and setup:
// keep it, and send them back to it once they're in.
const KEY = "barquests:pending-invite";

export function rememberInvite(code: string) {
  try {
    localStorage.setItem(KEY, code.toUpperCase().slice(0, 12));
  } catch {
    /* storage blocked: they can open the link again */
  }
}

// read once: cleared as it's taken. The path to send them to, or null.
export function takeInvitePath(): string | null {
  try {
    const code = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return code && /^[A-Z0-9]{4,12}$/.test(code) ? `/friends?code=${code}` : null;
  } catch {
    return null;
  }
}
