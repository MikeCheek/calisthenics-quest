// ---------------------------------------------------------------------------
// Skill Check video clips, kept on this device only (IndexedDB) — never
// uploaded. A verified claim remembers the clip's key so the athlete can
// re-watch or share it as proof; if the browser's storage is cleared the
// claim stays verified, the clip is simply gone.
// ---------------------------------------------------------------------------

const DB = "barquests";
const STORE = "clips";
const MAX_SECONDS = 20;
export const CLIP_MAX_SECONDS = MAX_SECONDS;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

export async function saveClip(key: string, blob: Blob): Promise<void> {
  await tx("readwrite", (s) => s.put(blob, key));
}

export async function loadClip(key: string): Promise<Blob | undefined> {
  try {
    return (await tx<Blob | undefined>("readonly", (s) => s.get(key))) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function clearClips(): Promise<void> {
  try {
    await tx("readwrite", (s) => s.clear());
  } catch {
    // nothing stored / storage unavailable
  }
}

// The first container this browser can record (Safari: mp4; others: webm).
export function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find((m) => MediaRecorder.isTypeSupported(m));
}

export function clipExtension(mime: string): string {
  return mime.includes("mp4") ? "mp4" : "webm";
}

export function canRecordVideo(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && !!pickRecorderMime();
}
