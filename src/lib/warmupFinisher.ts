import { Exercise, TrainingEquipment } from "./types";

export const WARMUP_POOL: Exercise[] = [
  { name: "Arm circles", detail: "2 x 15 each direction", restSeconds: 15 },
  { name: "Scapula pulls (hang or support)", detail: "2 x 10", restSeconds: 30 },
  { name: "Cat-cow spinal rocks", detail: "2 x 10", restSeconds: 15 },
  { name: "Bodyweight squats", detail: "2 x 12", restSeconds: 20 },
  { name: "Jumping jacks", detail: "2 x 30s", restSeconds: 20 },
  { name: "Wrist circles & stretch", detail: "2 x 10 each direction", restSeconds: 15 },
  { name: "Band pull-aparts (or arm swings)", detail: "2 x 15", restSeconds: 20 },
  { name: "Leg swings", detail: "2 x 10 each leg", restSeconds: 15 },
  { name: "Dead hang", detail: "2 x 15-20s", restSeconds: 30 },
  { name: "Hip circles", detail: "2 x 10 each direction", restSeconds: 15 },
];

export const FINISHER_POOL: Exercise[] = [
  { name: "Burpees", detail: "3 x 10", restSeconds: 45 },
  { name: "Mountain climbers", detail: "3 x 20 (10 per side)", restSeconds: 30 },
  { name: "Hollow body rocks", detail: "3 x 15", restSeconds: 30 },
  { name: "Jump squats", detail: "3 x 10", restSeconds: 30 },
  { name: "Plank to push-up", detail: "3 x 10", restSeconds: 30 },
  { name: "High knees", detail: "3 x 30s", restSeconds: 30 },
];

const RING_FINISHER: Exercise = { name: "Ring support hold burnout", detail: "3 x max hold", restSeconds: 45 };
const BAR_FINISHER: Exercise = { name: "Max-rep pull-ups", detail: "2 x max reps", restSeconds: 60 };

// Simple deterministic string hash so the same day always gets the same
// warm-up/finisher pick (stable across re-renders) while still varying
// day to day.
function seededIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}

export function pickWarmup(dateISO: string, count = 3): Exercise[] {
  const start = seededIndex(dateISO + "warmup", WARMUP_POOL.length);
  const picked: Exercise[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(WARMUP_POOL[(start + i) % WARMUP_POOL.length]);
  }
  return picked;
}

export function pickFinisher(dateISO: string, equipment: TrainingEquipment): Exercise {
  const pool = [...FINISHER_POOL];
  if (equipment.rings) pool.push(RING_FINISHER);
  if (equipment.pullUpBar) pool.push(BAR_FINISHER);
  const idx = seededIndex(dateISO + "finisher", pool.length);
  return pool[idx];
}
