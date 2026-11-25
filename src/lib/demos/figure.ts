// ---------------------------------------------------------------------------
// A tiny 2D stick-figure rig for exercise demonstrations.
//
// Two views, picked per exercise for whichever shows the movement best:
// - "side" (default): the figure faces right when upright; the near limbs
//   are drawn bright, the far ones dimmer;
// - "front": facing the viewer, with shoulders and hips apart, for
//   movements that happen side to side (wide pull-ups, the flag, the
//   cross, jumping jacks, arm circles…). `arm`/`leg` are the figure's
//   right side (on the left of the screen), `arm2`/`leg2` its left.
// SVG coordinates (y grows downward), angles in degrees with 0 = right,
// 90 = down, -90 = up.
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
// front view: half the distance between the shoulders / the hip joints
export const SHOULDER_HALF = 8;
export const HIP_HALF = 5;

export type View = "side" | "front";

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
  view?: View; // "side" unless stated
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
  shoulders: [Pt, Pt]; // where each arm starts (the same point from the side)
  hips: [Pt, Pt]; // where each leg starts
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

export function skeleton(pose: Pose, view: View = "side"): Skeleton {
  const shoulder = add(pose.hip, SEG.torso, pose.torso);
  const head = add(shoulder, SEG.neck + SEG.head, pose.torso);
  if (view === "front") {
    // the figure's right side is on the left of the screen
    const shoulders: [Pt, Pt] = [add(shoulder, SHOULDER_HALF, pose.torso - 90), add(shoulder, SHOULDER_HALF, pose.torso + 90)];
    const hips: [Pt, Pt] = [add(pose.hip, HIP_HALF, pose.torso - 90), add(pose.hip, HIP_HALF, pose.torso + 90)];
    const arm = limbPoints(shoulders[0], pose.arm, SEG.upperArm, SEG.forearm);
    const arm2 = limbPoints(shoulders[1], pose.arm2 ?? mirror(pose.arm, pose.torso, shoulders), SEG.upperArm, SEG.forearm);
    const leg = limbPoints(hips[0], pose.leg, SEG.thigh, SEG.shin);
    const leg2 = limbPoints(hips[1], pose.leg2 ?? mirror(pose.leg, pose.torso, hips), SEG.thigh, SEG.shin);
    return { hip: pose.hip, shoulder, shoulders, hips, head, face: head, arms: [arm, arm2], legs: [leg, leg2] };
  }
  const face = add(head, SEG.head * 0.7, pose.torso + 90); // front = torso rotated +90°
  const arm = limbPoints(shoulder, pose.arm, SEG.upperArm, SEG.forearm);
  const arm2 = pose.arm2 ? limbPoints(shoulder, pose.arm2, SEG.upperArm, SEG.forearm) : arm;
  const leg = limbPoints(pose.hip, pose.leg, SEG.thigh, SEG.shin);
  const leg2 = pose.leg2 ? limbPoints(pose.hip, pose.leg2, SEG.thigh, SEG.shin) : leg;
  return { hip: pose.hip, shoulder, shoulders: [shoulder, shoulder], hips: [pose.hip, pose.hip], head, face, arms: [arm, arm2], legs: [leg, leg2] };
}

// front view: the other side, mirrored across the body's midline
function mirror(limb: Limb, torso: number, roots: [Pt, Pt]): Limb {
  const axis = torso; // the midline's direction
  const reflect = (deg: number) => 2 * axis - deg;
  if ("ang" in limb) return { ang: [reflect(limb.ang[0]), reflect(limb.ang[1])] };
  // reflect the anchor across the line through the midpoint of the roots
  const mid: Pt = [(roots[0][0] + roots[1][0]) / 2, (roots[0][1] + roots[1][1]) / 2];
  const dx = limb.at[0] - mid[0], dy = limb.at[1] - mid[1];
  const ux = Math.cos(rad(axis)), uy = Math.sin(rad(axis));
  const along = dx * ux + dy * uy;
  return { at: [mid[0] + 2 * along * ux - dx, mid[1] + 2 * along * uy - dy], bend: (limb.bend * -1) as 1 | -1 };
}

// ---- interpolation ----
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a) % 360 + 540) % 360 - 180; // shortest way round
  return a + d * t;
};
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// The joint angles a limb actually has in a pose: the upper segment's and
// the lower segment's direction.
const segAngles = (root: Pt, l: { joint: Pt; end: Pt }): [number, number] => [
  (Math.atan2(l.joint[1] - root[1], l.joint[0] - root[0]) * 180) / Math.PI,
  (Math.atan2(l.end[1] - l.joint[1], l.end[0] - l.joint[0]) * 180) / Math.PI,
];

// Between two keyframes each joint travels on its own:
// - a hand or foot pinned in both, folding the same way, slides between
//   its two anchors (so it stays on the bar or the floor);
// - otherwise the shoulder/hip and elbow/knee angles are interpolated, so
//   the limb bends and straightens through the move instead of jumping
//   from one form to the other halfway.
function lerpLimb(a: Limb, b: Limb, t: number, rootA: Pt, rootB: Pt, la: { joint: Pt; end: Pt }, lb: { joint: Pt; end: Pt }): Limb {
  if ("at" in a && "at" in b && a.bend === b.bend) return { at: lerpPt(a.at, b.at, t), bend: a.bend };
  const [a0, a1] = "ang" in a ? a.ang : segAngles(rootA, la);
  const [b0, b1] = "ang" in b ? b.ang : segAngles(rootB, lb);
  return { ang: [lerpAngle(a0, b0, t), lerpAngle(a1, b1, t)] };
}

export function lerpPose(a: Pose, b: Pose, t: number, view: View = "side"): Pose {
  const sa = skeleton(a, view), sb = skeleton(b, view);
  const two = (x?: Limb, y?: Limb) => !!(x || y);
  return {
    hip: lerpPt(a.hip, b.hip, t),
    torso: lerpAngle(a.torso, b.torso, t),
    arm: lerpLimb(a.arm, b.arm, t, sa.shoulders[0], sb.shoulders[0], sa.arms[0], sb.arms[0]),
    arm2: two(a.arm2, b.arm2) || view === "front" ? lerpLimb(a.arm2 ?? limbFrom(sa, "arm"), b.arm2 ?? limbFrom(sb, "arm"), t, sa.shoulders[1], sb.shoulders[1], sa.arms[1], sb.arms[1]) : undefined,
    leg: lerpLimb(a.leg, b.leg, t, sa.hips[0], sb.hips[0], sa.legs[0], sb.legs[0]),
    leg2: two(a.leg2, b.leg2) || view === "front" ? lerpLimb(a.leg2 ?? limbFrom(sa, "leg"), b.leg2 ?? limbFrom(sb, "leg"), t, sa.hips[1], sb.hips[1], sa.legs[1], sb.legs[1]) : undefined,
  };
}

// the far/left limb as angles, read off a skeleton (when a pose left it implied)
function limbFrom(s: Skeleton, kind: "arm" | "leg"): Limb {
  return kind === "arm" ? { ang: segAngles(s.shoulders[1], s.arms[1]) } : { ang: segAngles(s.hips[1], s.legs[1]) };
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
      return lerpPose(f.pose, next, easeInOut(t / f.move), demo.view);
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
