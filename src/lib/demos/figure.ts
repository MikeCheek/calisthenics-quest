// ---------------------------------------------------------------------------
// A tiny 2D stick-figure rig for exercise demonstrations.
//
// Side view, SVG coordinates (y grows downward), angles in degrees with
// 0 = right, 90 = down, -90 = up. The figure faces right when upright.
//
// A pose places the hips, points the torso (hips -> shoulders), and drives
// each limb either by angles (forward kinematics) or by pinning its end to
// a point (two-bone inverse kinematics) — so hands stay on the bar and feet
// stay on the floor while the body moves between keyframes.
// ---------------------------------------------------------------------------

export type Pt = [number, number];

export const SEG = {
  torso: 28,
  neck: 4,
  head: 5.5,
  upperArm: 15,
  forearm: 14,
  thigh: 17,
  shin: 17,
};
export const ARM = SEG.upperArm + SEG.forearm;
export const LEG = SEG.thigh + SEG.shin;

// IK limb: end pinned at `at`; `bend` picks which side the joint folds to.
export type Limb = { at: Pt; bend: 1 | -1 } | { ang: [number, number] };

export interface Pose {
  hip: Pt;
  torso: number; // direction hips -> shoulders
  arm: Limb;
  arm2?: Limb; // far-side arm, when it differs
  leg: Limb;
  leg2?: Limb; // far-side leg, when it differs
}

export type Prop =
  | { kind: "bar"; y: number; x1: number; x2: number }
  | { kind: "floor"; y: number }
  | { kind: "wall"; x: number; y1: number; y2: number }
  | { kind: "pole"; x: number; y1: number; y2: number }
  | { kind: "pbars"; y: number; x1: number; x2: number } // dip bars / parallettes
  | { kind: "rings"; x: number; y: number; ropeTop: number }
  | { kind: "box"; x: number; y: number; w: number; h: number };

export interface Keyframe {
  pose: Pose;
  hold: number; // ms to stay on this pose
  move: number; // ms to travel to the next pose
}

export interface Demo {
  viewBox: [number, number, number, number];
  props: Prop[];
  frames: Keyframe[];
}

const rad = (d: number) => (d * Math.PI) / 180;
const add = (p: Pt, len: number, deg: number): Pt => [p[0] + len * Math.cos(rad(deg)), p[1] + len * Math.sin(rad(deg))];
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

// Two-bone IK: joint position for a limb rooted at `root` reaching `target`.
// Out-of-reach targets get a straight limb pointing at them.
export function solveIK(root: Pt, target: Pt, a: number, b: number, bend: 1 | -1): { joint: Pt; end: Pt; error: number } {
  const d = dist(root, target);
  const dirDeg = (Math.atan2(target[1] - root[1], target[0] - root[0]) * 180) / Math.PI;
  const dc = Math.min(a + b - 1e-6, Math.max(Math.abs(a - b) + 1e-6, d));
  const cosA = (a * a + dc * dc - b * b) / (2 * a * dc);
  const alpha = (Math.acos(Math.max(-1, Math.min(1, cosA))) * 180) / Math.PI;
  const joint = add(root, a, dirDeg + bend * alpha);
  const jointToTarget = (Math.atan2(target[1] - joint[1], target[0] - joint[0]) * 180) / Math.PI;
  const end = add(joint, b, jointToTarget);
  return { joint, end, error: dist(end, target) };
}

export interface Skeleton {
  hip: Pt;
  shoulder: Pt;
  head: Pt;
  face: Pt; // a small marker on the front of the head, so facing is readable
  arms: { joint: Pt; end: Pt; error: number }[]; // [near, far]
  legs: { joint: Pt; end: Pt; error: number }[];
}

function limbPoints(root: Pt, limb: Limb, a: number, b: number) {
  if ("at" in limb) return solveIK(root, limb.at, a, b, limb.bend);
  const joint = add(root, a, limb.ang[0]);
  return { joint, end: add(joint, b, limb.ang[1]), error: 0 };
}

export function skeleton(pose: Pose): Skeleton {
  const shoulder = add(pose.hip, SEG.torso, pose.torso);
  const head = add(shoulder, SEG.neck + SEG.head, pose.torso);
  const face = add(head, SEG.head * 0.7, pose.torso + 90); // front = torso rotated +90°
  const arm = limbPoints(shoulder, pose.arm, SEG.upperArm, SEG.forearm);
  const arm2 = pose.arm2 ? limbPoints(shoulder, pose.arm2, SEG.upperArm, SEG.forearm) : arm;
  const leg = limbPoints(pose.hip, pose.leg, SEG.thigh, SEG.shin);
  const leg2 = pose.leg2 ? limbPoints(pose.hip, pose.leg2, SEG.thigh, SEG.shin) : leg;
  return { hip: pose.hip, shoulder, head, face, arms: [arm, arm2], legs: [leg, leg2] };
}

// ---- interpolation ----
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a) % 360 + 540) % 360 - 180; // shortest way round
  return a + d * t;
};
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

function lerpLimb(a: Limb, b: Limb, t: number): Limb {
  if ("at" in a && "at" in b) return { at: lerpPt(a.at, b.at, t), bend: t < 0.5 ? a.bend : b.bend };
  if ("ang" in a && "ang" in b) return { ang: [lerpAngle(a.ang[0], b.ang[0], t), lerpAngle(a.ang[1], b.ang[1], t)] };
  return t < 0.5 ? a : b; // mixed limb types: switch halfway (templates avoid this)
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    hip: lerpPt(a.hip, b.hip, t),
    torso: lerpAngle(a.torso, b.torso, t),
    arm: lerpLimb(a.arm, b.arm, t),
    arm2: a.arm2 || b.arm2 ? lerpLimb(a.arm2 ?? a.arm, b.arm2 ?? b.arm, t) : undefined,
    leg: lerpLimb(a.leg, b.leg, t),
    leg2: a.leg2 || b.leg2 ? lerpLimb(a.leg2 ?? a.leg, b.leg2 ?? b.leg, t) : undefined,
  };
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function demoDuration(demo: Demo): number {
  return demo.frames.reduce((n, f) => n + f.hold + f.move, 0);
}

// The pose at time `ms` into the (looping) demo.
export function poseAt(demo: Demo, ms: number): Pose {
  const total = demoDuration(demo);
  if (demo.frames.length === 1 || total === 0) return demo.frames[0].pose;
  let t = ms % total;
  for (let i = 0; i < demo.frames.length; i++) {
    const f = demo.frames[i];
    if (t < f.hold) return f.pose;
    t -= f.hold;
    if (t < f.move) {
      const next = demo.frames[(i + 1) % demo.frames.length].pose;
      return lerpPose(f.pose, next, easeInOut(t / f.move));
    }
    t -= f.move;
  }
  return demo.frames[0].pose;
}

// The single most informative frame (for reduced motion / static previews):
// the one held longest, i.e. the position the exercise is about.
export function keyPose(demo: Demo): Pose {
  return [...demo.frames].sort((a, b) => b.hold - a.hold)[0].pose;
}

// ---- helpers for authoring straight-body poses ----
// A straight line from an anchored point (feet or shoulders) at `deg`.
export function along(from: Pt, len: number, deg: number): Pt {
  return add(from, len, deg);
}
export { dist };
