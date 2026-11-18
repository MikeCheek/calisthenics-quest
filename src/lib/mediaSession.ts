// ---------------------------------------------------------------------------
// Lock-screen / notification controls for guided training via the Media
// Session API. Phones only show media controls while audio is playing, so
// this keeps a silent loop going while enabled — which on some phones
// (notably iPhone) pauses the athlete's own music. Hence it's opt-in.
// ---------------------------------------------------------------------------

const PREF_KEY = "barquests:lockscreen";

// 1 second of 8 kHz, 8-bit mono silence as a WAV data URI.
export function silentWavDataUri(seconds = 1): string {
  const rate = 8000;
  const n = rate * seconds;
  const bytes = new Uint8Array(44 + n);
  const view = new DataView(bytes.buffer);
  const str = (o: number, s: string) => [...s].forEach((c, i) => (bytes[o + i] = c.charCodeAt(0)));
  str(0, "RIFF");
  view.setUint32(4, 36 + n, true);
  str(8, "WAVEfmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  str(36, "data");
  view.setUint32(40, n, true);
  bytes.fill(128, 44); // 8-bit silence is the midpoint
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return "data:audio/wav;base64," + btoa(bin);
}

export function mediaSessionSupported(): boolean {
  return typeof navigator !== "undefined" && "mediaSession" in navigator;
}

export function lockScreenPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
}

export function setLockScreenPref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // storage unavailable — applies to this session only
  }
}

let audio: HTMLAudioElement | null = null;

// Must be called from a user gesture (the "Start Training" tap), or the
// browser won't allow playback.
export function startKeepAlive() {
  if (typeof Audio === "undefined") return;
  try {
    if (!audio) {
      audio = new Audio(silentWavDataUri());
      audio.loop = true;
    }
    audio.play().catch(() => {});
  } catch {
    // no lock-screen controls this time
  }
}

export function stopKeepAlive() {
  try {
    audio?.pause();
    if (mediaSessionSupported()) {
      navigator.mediaSession.metadata = null;
      for (const a of ["play", "pause", "nexttrack", "previoustrack"] as MediaSessionAction[]) {
        navigator.mediaSession.setActionHandler(a, null);
      }
    }
  } catch {
    // nothing to stop
  }
}

export function updateLockScreen(
  info: { title: string; subtitle: string; paused: boolean },
  handlers: { togglePause: () => void; next: () => void; previous: () => void }
) {
  if (!mediaSessionSupported()) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: info.title, artist: info.subtitle, album: "BarQuests" });
    navigator.mediaSession.playbackState = info.paused ? "paused" : "playing";
    navigator.mediaSession.setActionHandler("play", handlers.togglePause);
    navigator.mediaSession.setActionHandler("pause", handlers.togglePause);
    navigator.mediaSession.setActionHandler("nexttrack", handlers.next);
    navigator.mediaSession.setActionHandler("previoustrack", handlers.previous);
  } catch {
    // some browsers reject individual actions; the rest still work
  }
}
