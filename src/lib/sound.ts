let ctx: AudioContext | null = null;

export function playBeep(frequency = 660, durationMs = 400) {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx) ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // audio not available, ignore
  }
}

// A small, deliberately-distinct sound vocabulary so a timer can be run
// eyes-free with earphones — each event has its own unmistakable shape
// rather than everything sharing one generic beep.
//
//   tick      — short, neutral, mid-pitch: the 3-2-1 countdown
//   go        — bright ascending double-beep, high register: work starts
//   rest      — a single low, sustained tone: rest starts, ease off
//   complete  — a rising three-note chime: the whole exercise is done

export function playCountdownTick() {
  playBeep(600, 110);
}

export function playGoSound() {
  playBeep(880, 130);
  setTimeout(() => playBeep(1175, 220), 140);
}

export function playRestSound() {
  playBeep(294, 480);
}

export function playCompleteSound() {
  playBeep(523, 130);
  setTimeout(() => playBeep(659, 130), 140);
  setTimeout(() => playBeep(880, 260), 280);
}
