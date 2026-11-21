// ---------------------------------------------------------------------------
// Saving while offline. Firestore keeps a copy of your data on the phone
// (persistent cache, firebase.ts) and queues writes made without a
// connection, sending them when it's back. But a write's promise only
// settles once the server has it — so waiting on it offline would hang the
// screen. settleWrite waits only while online (and not forever), and says
// whether the save reached the server or is queued on the device.
// ---------------------------------------------------------------------------

export type WriteState = "saved" | "queued";

export const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

let queuedSinceOnline = false;
export const hadQueuedWrites = () => queuedSinceOnline;
export const clearQueuedWrites = () => {
  queuedSinceOnline = false;
};

export async function settleWrite<T>(write: Promise<T>, waitMs = 6000): Promise<WriteState> {
  if (isOffline()) {
    queuedSinceOnline = true;
    write.catch((e) => console.warn("[offline] queued write failed", e));
    return "queued";
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const slow = new Promise<WriteState>((resolve) => {
    timer = setTimeout(() => {
      queuedSinceOnline = true;
      resolve("queued");
    }, waitMs);
  });
  try {
    // a rejection (e.g. refused by the rules) still fails the caller
    return await Promise.race([write.then(() => "saved" as const), slow]);
  } finally {
    clearTimeout(timer);
  }
}
