import { ARM, Demo, Keyframe, LEG, Limb, Pose, Prop, Pt, SEG, along } from "./figure";

// ---------------------------------------------------------------------------
// Movement templates. Each returns a looping Demo for one family of
// exercises; `variant` picks a leg shape for the staged holds (tuck,
// advanced tuck, one leg, straddle, full). Exercise names are mapped onto
// these in catalog.ts.
// ---------------------------------------------------------------------------

export type Variant = "tuck" | "advTuck" | "oneLeg" | "straddle" | "full";

const FLOOR = 108;
const VB: Demo["viewBox"] = [0, 0, 160, 120];
const floor: Prop = { kind: "floor", y: FLOOR };
const kf = (pose: Pose, hold: number, move: number): Keyframe => ({ pose, hold, move });
const pin = (at: Pt, bend: 1 | -1 = 1): Limb => ({ at, bend });
const ang = (a: number, b: number = a): Limb => ({ ang: [a, b] });

// A straight body rising from the feet at `deg` (feet pinned).
function plankFrom(feet: Pt, deg: number) {
  const hip = along(feet, LEG, deg);
  return { hip, torso: deg, shoulder: along(hip, SEG.torso, deg) };
}

// Legs for a horizontal hold, relative to the torso direction `t` (hips ->
// shoulders). The "front" of the body is t + 90; tucks fold toward it.
function holdLegs(t: number, v: Variant): { leg: Limb; leg2?: Limb } {
  const away = t + 180; // straight legs point away from the shoulders
  const front = t + 90;
  const tuck = ang(t + 45, away); // knees pulled in to the chest (face side), shins back along the torso
  const adv = ang(front - 10, away); // thighs ~90° to the torso, shins parallel
  switch (v) {
    case "tuck":
      return { leg: tuck };
    case "advTuck":
      return { leg: adv };
    case "oneLeg":
      return { leg: ang(away), leg2: adv };
    case "straddle":
      return { leg: ang(away - 6), leg2: ang(away + 6) };
    default:
      return { leg: ang(away) };
  }
}

// Rotations around the shoulders (lever raises, skin the cat): the hips
// swing on an arc while the hands stay on the bar. Interpolating the hips
// in a straight line would pull the shoulders off that arc, so the sweep is
// cut into 30° keyframes (chord error under a unit).
function sweep(
  shoulder: Pt,
  hand: Pt,
  bend: 1 | -1,
  fromTorso: number,
  toTorso: number,
  fromLeg: Limb,
  toLeg: Limb,
  totalMs: number
): Keyframe[] {
  let delta = ((toTorso - fromTorso) % 360 + 540) % 360 - 180;
  const steps = Math.max(1, Math.ceil(Math.abs(delta) / 30));
  const out: Keyframe[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const torso = fromTorso + delta * t;
    const leg: Limb =
      "ang" in fromLeg && "ang" in toLeg
        ? { ang: [fromLeg.ang[0] + (toLeg.ang[0] - fromLeg.ang[0]) * t, fromLeg.ang[1] + (toLeg.ang[1] - fromLeg.ang[1]) * t] }
        : fromLeg;
    out.push(kf({ hip: along(shoulder, SEG.torso, torso + 180), torso, arm: pin(hand, bend), leg }, 0, totalMs / steps));
  }
  return out;
}

// The same sweep for a body that keeps its shape (a tuck stays a tuck all
// the way up): the legs are worked out from the torso at every step, so
// they rotate with it instead of drifting through other shapes.
function sweepShape(
  shoulder: Pt,
  hand: Pt,
  bend: 1 | -1,
  fromTorso: number,
  toTorso: number,
  legs: (torso: number) => { leg: Limb; leg2?: Limb },
  totalMs: number
): Keyframe[] {
  const delta = ((toTorso - fromTorso) % 360 + 540) % 360 - 180;
  const steps = Math.max(1, Math.ceil(Math.abs(delta) / 30));
  const out: Keyframe[] = [];
  for (let i = 0; i < steps; i++) {
    const torso = fromTorso + (delta * i) / steps;
    out.push(kf({ hip: along(shoulder, SEG.torso, torso + 180), torso, arm: pin(hand, bend), ...legs(torso) }, 0, totalMs / steps));
  }
  return out;
}

// ---------------- bar work ----------------
const BAR_Y = 20;
const bar = (y = BAR_Y): Prop => ({ kind: "bar", y, x1: 40, x2: 120 });

function hangPose(hand: Pt, legs: Limb = ang(88, 94)): Pose {
  const shoulder: Pt = [hand[0], hand[1] + ARM - 0.5];
  return { hip: [shoulder[0], shoulder[1] + SEG.torso], torso: -90, arm: pin(hand, 1), leg: legs };
}

export function pullUp(opts: { slowDown?: boolean; high?: boolean; lsitLegs?: boolean } = {}): Demo {
  const hand: Pt = [80, BAR_Y];
  const legs = opts.lsitLegs ? ang(-2, 0) : ang(88, 94);
  const hang = hangPose(hand, legs);
  const topY = opts.high ? BAR_Y + 3 : BAR_Y + 7;
  const top: Pose = { hip: [80, topY + SEG.torso], torso: -90, arm: pin(hand, 1), leg: legs };
  return {
    viewBox: VB,
    props: [bar()],
    frames: opts.slowDown ? [kf(hang, 300, 700), kf(top, 300, 2600)] : [kf(hang, 400, 900), kf(top, 300, 1100)],
  };
}

export function deadHang(opts: { scapula?: boolean } = {}): Demo {
  const hand: Pt = [80, BAR_Y];
  const low = hangPose(hand);
  const up: Pose = { ...low, hip: [80, low.hip[1] - 4] };
  return { viewBox: VB, props: [bar()], frames: opts.scapula ? [kf(low, 400, 700), kf(up, 400, 700)] : [kf(low, 1600, 800), kf(up, 0, 800)] };
}

export function legRaise(opts: { straight?: boolean } = {}): Demo {
  const hand: Pt = [80, BAR_Y];
  const down = hangPose(hand);
  const up: Pose = opts.straight
    ? { ...down, torso: -96, leg: ang(-30, -30) }
    : { ...down, leg: ang(-5, 85) };
  return { viewBox: VB, props: [bar()], frames: [kf(down, 300, 900), kf(up, 400, 1100)] };
}

export function row(): Demo {
  const hand: Pt = [98, 62];
  const feet: Pt = [26, FLOOR];
  // straight body; arms long at the bottom, chest to the bar at the top
  const bottom = plankFrom(feet, -24);
  const top = plankFrom(feet, -36);
  return {
    viewBox: VB,
    props: [{ kind: "bar", y: 62, x1: 70, x2: 130 }, floor],
    frames: [
      kf({ hip: bottom.hip, torso: bottom.torso, arm: pin(hand, -1), leg: pin(feet, 1) }, 300, 900),
      kf({ hip: top.hip, torso: top.torso, arm: pin(hand, -1), leg: pin(feet, 1) }, 300, 1000),
    ],
  };
}

export function muscleUp(): Demo {
  const by = 46;
  const hand: Pt = [80, by];
  const hang = hangPose(hand);
  const pull: Pose = { hip: [76, by + 8 + SEG.torso], torso: -82, arm: pin(hand, 1), leg: ang(95, 100) };
  const transition: Pose = { hip: [74, by + 12], torso: -40, arm: pin(hand, 1), leg: ang(110, 120) };
  const support: Pose = { hip: [78, by - ARM + 2 + SEG.torso], torso: -88, arm: pin(hand, -1), leg: ang(95, 100) };
  return {
    viewBox: [0, 0, 160, 150],
    props: [bar(by)],
    frames: [kf(hang, 300, 700), kf(pull, 0, 350), kf(transition, 0, 450), kf(support, 500, 1300)],
  };
}

export function germanHang(opts: { skinTheCat?: boolean } = {}): Demo {
  const by = 26;
  const hand: Pt = [80, by];
  const hang = hangPose(hand);
  // hips pass up between the arms: shoulders within arm's reach below the bar
  const inverted: Pose = { hip: [82, by - 2], torso: 92, arm: pin(hand, -1), leg: ang(-150, -40) };
  const german: Pose = { hip: [62, by + 44], torso: -40, arm: pin(hand, -1), leg: ang(110, 100) };
  if (opts.skinTheCat) {
    const sh: Pt = [hand[0], hand[1] + ARM - 0.5];
    const tucked = ang(-150, -40);
    // hang -> hips up and over (tucked) -> down the back into a German hang
    const over = sweep(sh, hand, -1, -90, 90, ang(88, 94), tucked, 1400);
    const back = sweep(sh, hand, -1, 90, 140, tucked, ang(110, 100), 900);
    const out = sweep(sh, hand, -1, 140, -90, ang(110, 100), ang(88, 94), 1600);
    over[0].hold = 300;
    back[0].hold = 150;
    out[0].hold = 700;
    return { viewBox: [0, 0, 160, 140], props: [bar(by)], frames: [...over, ...back, ...out] };
  }
  void inverted;
  return { viewBox: [0, 0, 160, 140], props: [bar(by)], frames: [kf(german, 2000, 600), kf({ ...german, hip: [64, by + 42] }, 0, 600)] };
}

// Front lever: horizontal, face up, under the bar. Raises sweep up from the hang.
export function frontLever(v: Variant, opts: { raise?: boolean } = {}): Demo {
  const hand: Pt = [80, BAR_Y];
  const shoulder: Pt = [86, BAR_Y + ARM - 1];
  const t = 180; // hips to the right of the shoulders
  const hip = along(shoulder, SEG.torso, 0);
  const hold: Pose = { hip, torso: t, arm: pin(hand, -1), ...holdLegs(t, v) };
  const breathe: Pose = { ...hold, hip: [hip[0], hip[1] + 1.5] };
  if (!opts.raise) return { viewBox: VB, props: [bar()], frames: [kf(hold, 1400, 900), kf(breathe, 0, 900)] };
  // the shape (tuck, one leg, straddle…) is held from the hang all the way up
  const shape = (torso: number) => holdLegs(torso, v);
  const up = sweepShape(shoulder, hand, -1, -90, t, shape, 1300);
  const down = sweepShape(shoulder, hand, -1, t, -90, shape, 1300);
  up[0].hold = 300;
  down[0].hold = 600;
  return { viewBox: VB, props: [bar()], frames: [...up, ...down] };
}

// Back lever: the front lever turned over — face down, hips to the left.
export function backLever(v: Variant, opts: { raise?: boolean } = {}): Demo {
  // raises start inverted (legs above the bar), so the bar sits lower
  const by = opts.raise ? 54 : BAR_Y;
  const hand: Pt = [80, by];
  const shoulder: Pt = [80, by + ARM - 1];
  const t = 0;
  const hip = along(shoulder, SEG.torso, 180);
  const hold: Pose = { hip, torso: t, arm: pin(hand, 1), ...holdLegs(t, v) };
  const breathe: Pose = { ...hold, hip: [hip[0], hip[1] + 1.5] };
  if (!opts.raise) return { viewBox: VB, props: [bar(by)], frames: [kf(hold, 1400, 900), kf(breathe, 0, 900)] };
  // from the inverted hang (hips over the shoulders), lower to horizontal
  // and pull back up
  const shape = (torso: number) => holdLegs(torso, v);
  const lower = sweepShape(shoulder, hand, 1, 90, t, shape, 1300);
  const raise = sweepShape(shoulder, hand, 1, t, 90, shape, 1300);
  const up = lower;
  const down = raise;
  up[0].hold = 300;
  down[0].hold = 600;
  return { viewBox: VB, props: [bar(by)], frames: [...up, ...down] };
}

// ---------------- floor & bars pushing ----------------
// Push-ups from the side. Archer: the far arm stays straight, reaching
// forward, while the near one bends. One-arm: the free hand on the back.
export function pushUp(opts: { decline?: boolean; slow?: boolean; archer?: boolean; oneArm?: boolean } = {}): Demo {
  const feet: Pt = opts.decline ? [24, 90] : [30, FLOOR];
  const topBody = opts.decline ? plankFrom(feet, -8) : plankFrom(feet, -28);
  const hand: Pt = [topBody.shoulder[0], FLOOR];
  // at the bottom the chest stops just above the floor (the head never
  // goes through it): body angle from the feet, by how high they are
  const botBody = opts.decline ? plankFrom(feet, 3) : plankFrom(feet, -10);
  const props: Prop[] = [floor];
  if (opts.decline) props.push({ kind: "box", x: 12, y: 90, w: 22, h: FLOOR - 90 });
  const far: Pt = [hand[0] + 24, FLOOR];
  const second = (top: boolean): Partial<Pose> =>
    opts.oneArm ? { arm2: ang(150, -60) } : opts.archer ? { arm2: top ? pin(hand, -1) : pin(far, 1) } : {};
  return {
    viewBox: VB,
    props,
    frames: [
      kf({ hip: topBody.hip, torso: topBody.torso, arm: pin(hand, -1), leg: pin(feet, 1), ...second(true) }, 300, 900),
      kf({ hip: botBody.hip, torso: botBody.torso, arm: pin(hand, -1), leg: pin(feet, 1), ...second(false) }, 200, opts.slow ? 1600 : 900),
    ],
  };
}

// Pike push-up: an inverted V, hips as high as straight legs allow; the
// head comes down between and just in front of the hands, to the floor.
export function pikePushUp(): Demo {
  const feet: Pt = [56, FLOOR];
  const hand: Pt = [106, FLOOR];
  const top: Pose = { hip: [60, FLOOR - 33], torso: 35, arm: pin(hand, -1), leg: pin(feet, -1) };
  const bottom: Pose = { hip: [70, FLOOR - 31.5], torso: 45, arm: pin(hand, -1), leg: pin(feet, -1) };
  return { viewBox: VB, props: [floor], frames: [kf(top, 300, 1000), kf(bottom, 200, 1000)] };
}

const DIP_Y = 64;
export function dip(opts: { rings?: boolean; straightBar?: boolean; slow?: boolean; hold?: boolean } = {}): Demo {
  const hand: Pt = [82, DIP_Y];
  const top: Pose = { hip: [78, DIP_Y - ARM + 1 + SEG.torso], torso: -82, arm: pin(hand, 1), leg: ang(100, 150) };
  const bottom: Pose = { hip: [72, DIP_Y - 10 + SEG.torso - 2], torso: -66, arm: pin(hand, 1), leg: ang(110, 160) };
  const props: Prop[] = opts.rings
    ? [{ kind: "rings", x: 82, y: DIP_Y, ropeTop: 0 }]
    : opts.straightBar
    ? [{ kind: "bar", y: DIP_Y, x1: 50, x2: 120 }]
    : [{ kind: "pbars", y: DIP_Y, x1: 55, x2: 115 }];
  if (opts.hold) return { viewBox: VB, props, frames: [kf(top, 1600, 700), kf({ ...top, hip: [top.hip[0], top.hip[1] + 1.5] }, 0, 700)] };
  return { viewBox: VB, props, frames: [kf(top, 300, opts.slow ? 2200 : 1000), kf(bottom, 200, 1000)] };
}

export function handstand(opts: { wall?: boolean; pushUp?: boolean; walk?: boolean; parallettes?: boolean } = {}): Demo {
  const handY = opts.parallettes ? FLOOR - 8 : FLOOR;
  const hand: Pt = [80, handY];
  const up: Pose = { hip: [80, handY - ARM + 0.5 - SEG.torso], torso: 90, arm: pin(hand, 1), leg: ang(-90) };
  const props: Prop[] = [floor];
  if (opts.parallettes) props.push({ kind: "pbars", y: handY, x1: 70, x2: 90 });
  if (opts.wall) {
    props.push({ kind: "wall", x: 64, y1: 0, y2: FLOOR });
    up.leg = ang(-97);
  }
  if (opts.pushUp) {
    const down: Pose = { ...up, hip: [80, handY - 12 - SEG.torso], arm: pin(hand, -1) };
    return { viewBox: VB, props, frames: [kf(up, 300, 1300), kf(down, 200, 1100)] };
  }
  const sway: Pose = { ...up, hip: [up.hip[0] + 1.5, up.hip[1]], leg: ang(opts.wall ? -96 : -88) };
  return { viewBox: VB, props, frames: [kf(up, 900, 800), kf(sway, 400, 800)] };
}

export function planche(v: Variant, opts: { pushUp?: boolean; parallettes?: boolean } = {}): Demo {
  const handY = opts.parallettes ? FLOOR - 8 : FLOOR;
  const hand: Pt = [76, handY];
  const shoulder: Pt = [86, handY - ARM + 3];
  const t = 0; // face down, hips behind (left of) the shoulders
  const hip = along(shoulder, SEG.torso, 180);
  const hold: Pose = { hip, torso: t, arm: pin(hand, 1), ...holdLegs(t, v) };
  const props: Prop[] = [floor];
  if (opts.parallettes) props.push({ kind: "pbars", y: handY, x1: 66, x2: 86 });
  if (opts.pushUp) {
    const low: Pose = { ...hold, hip: [hip[0] + 2, hip[1] + 10], arm: pin(hand, 1) };
    return { viewBox: VB, props, frames: [kf(hold, 300, 1100), kf(low, 200, 1100)] };
  }
  return { viewBox: VB, props, frames: [kf(hold, 1400, 900), kf({ ...hold, hip: [hip[0], hip[1] + 1.5] }, 0, 900)] };
}

// Feet on the floor, shoulders leaning past the hands; pushUp adds the bend.
export function plancheLean(opts: { pushUp?: boolean } = {}): Demo {
  const feet: Pt = [26, FLOOR];
  const body = plankFrom(feet, -26);
  const hand: Pt = [body.shoulder[0] - 8, FLOOR]; // shoulders past the hands, arms still straight
  const lean: Pose = { hip: body.hip, torso: body.torso, arm: pin(hand, 1), leg: pin(feet, 1) };
  if (opts.pushUp) {
    const low = plankFrom(feet, -12);
    return {
      viewBox: VB,
      props: [floor],
      frames: [kf(lean, 300, 1000), kf({ hip: low.hip, torso: low.torso, arm: pin(hand, -1), leg: pin(feet, 1) }, 200, 1000)],
    };
  }
  const deeper = plankFrom(feet, -24);
  return { viewBox: VB, props: [floor], frames: [kf(lean, 700, 1000), kf({ ...lean, hip: deeper.hip, torso: deeper.torso }, 900, 1000)] };
}

// L-sit: straight arms pushing down beside the hips, shoulders over the
// hands, hips just off the support and the legs level in front. Drawn on
// parallettes, so the gap under the hips and legs shows.
export function lSit(v: Variant, _opts: { parallettes?: boolean } = {}): Demo {
  const handY = FLOOR - 10;
  const t = -105; // a slight lean back keeps the shoulders over the hands
  const hip: Pt = [78, handY - 2];
  const shoulder = along(hip, SEG.torso, t);
  const hand: Pt = [shoulder[0], handY];
  const legs =
    v === "tuck" ? { leg: ang(-40, 80) } : v === "advTuck" || v === "oneLeg" ? { leg: ang(-3), leg2: ang(-40, 80) } : v === "straddle" ? { leg: ang(-8), leg2: ang(-2) } : { leg: ang(-3) };
  const hold: Pose = { hip, torso: t, arm: pin(hand, 1), ...legs };
  const props: Prop[] = [floor, { kind: "pbars", y: handY, x1: hand[0] - 10, x2: hand[0] + 10 }];
  return { viewBox: VB, props, frames: [kf(hold, 1500, 800), kf({ ...hold, hip: [hip[0], hip[1] - 1] }, 0, 800)] };
}

export function supportHold(opts: { rings?: boolean } = {}): Demo {
  return dip({ rings: opts.rings, hold: true });
}

// ---------------- legs ----------------
export function squat(opts: { jump?: boolean } = {}): Demo {
  const feet: Pt = [80, FLOOR];
  const stand: Pose = { hip: [80, FLOOR - LEG + 0.5], torso: -90, arm: ang(95, 95), leg: pin(feet, -1) };
  const bottom: Pose = { hip: [66, FLOOR - 16], torso: -62, arm: ang(-10, -10), leg: pin(feet, -1) };
  const frames = [kf(stand, 300, 1000), kf(bottom, 200, opts.jump ? 400 : 1000)];
  if (opts.jump) frames.push(kf({ ...stand, hip: [80, stand.hip[1] - 10], leg: pin([80, FLOOR - 10], -1), arm: ang(-80, -80) }, 0, 500));
  return { viewBox: VB, props: [floor], frames };
}

export function pistol(opts: { slow?: boolean; shrimp?: boolean } = {}): Demo {
  const foot: Pt = [80, FLOOR];
  const free = opts.shrimp ? ang(100, 200) : ang(60, 80);
  const stand: Pose = { hip: [80, FLOOR - LEG + 0.5], torso: -90, arm: ang(10, 0), leg: pin(foot, -1), leg2: free };
  const bottom: Pose = {
    hip: [opts.shrimp ? 70 : 66, FLOOR - (opts.shrimp ? 18 : 14)],
    torso: -58,
    arm: ang(0, 0),
    leg: pin(foot, -1),
    leg2: opts.shrimp ? ang(150, 200) : ang(0),
  };
  return { viewBox: VB, props: [floor], frames: [kf(stand, 300, opts.slow ? 2400 : 1200), kf(bottom, 200, 1200)] };
}

export function lunge(): Demo {
  const front: Pt = [96, FLOOR];
  const back: Pt = [56, FLOOR];
  const up: Pose = { hip: [76, FLOOR - 26], torso: -90, arm: ang(95, 95), leg: pin(front, -1), leg2: pin(back, -1) };
  const down: Pose = { ...up, hip: [76, FLOOR - 17] };
  return { viewBox: VB, props: [floor], frames: [kf(up, 300, 1000), kf(down, 200, 1000)] };
}

export function nordic(): Demo {
  const knee: Pt = [64, FLOOR - 3];
  const feet: Pt = [40, FLOOR - 3];
  const at = (deg: number): Pose => ({
    hip: along(knee, SEG.thigh, deg),
    torso: deg,
    arm: ang(deg + 100, deg + 80),
    leg: ang(deg + 180, 180),
  });
  void feet;
  return { viewBox: VB, props: [floor], frames: [kf(at(-90), 300, 2600), kf(at(-28), 200, 1400)] };
}

export function bridge(): Demo {
  // hips as high as the legs allow, arms long to the floor behind the head
  const hands: Pt = [41, FLOOR];
  const feet: Pt = [100, FLOOR];
  const up: Pose = { hip: [88, 77], torso: 145, arm: pin(hands, 1), leg: pin(feet, -1) };
  return { viewBox: VB, props: [floor], frames: [kf(up, 1500, 800), kf({ ...up, hip: [88, 78] }, 0, 800)] };
}

// ---------------- core ----------------
export function plank(opts: { side?: boolean } = {}): Demo {
  const feet: Pt = [30, FLOOR];
  const body = plankFrom(feet, -12);
  const elbow: Pt = [body.shoulder[0], FLOOR];
  const hold: Pose = { hip: body.hip, torso: body.torso, arm: opts.side ? pin([body.shoulder[0] + 2, FLOOR], -1) : pin(elbow, -1), leg: pin(feet, 1) };
  return { viewBox: VB, props: [floor], frames: [kf(hold, 1500, 800), kf({ ...hold, hip: [hold.hip[0], hold.hip[1] + 1] }, 0, 800)] };
}

export function hollow(opts: { rock?: boolean } = {}): Demo {
  const hold: Pose = { hip: [82, FLOOR - 4], torso: -158, arm: ang(-170, -170), leg: ang(-14) };
  const rockA: Pose = { ...hold, hip: [82, FLOOR - 5], torso: -150, leg: ang(-22) };
  const rockB: Pose = { ...hold, hip: [82, FLOOR - 5], torso: -166, leg: ang(-6) };
  return opts.rock
    ? { viewBox: VB, props: [floor], frames: [kf(rockA, 100, 600), kf(rockB, 100, 600)] }
    : { viewBox: VB, props: [floor], frames: [kf(hold, 1500, 800), kf({ ...hold, leg: ang(-12) }, 0, 800)] };
}

export function superman(): Demo {
  const hold: Pose = { hip: [76, FLOOR - 4], torso: -14, arm: ang(-12, -12), leg: ang(194) };
  return { viewBox: VB, props: [floor], frames: [kf(hold, 1500, 800), kf({ ...hold, torso: -10, leg: ang(190) }, 0, 800)] };
}

export function dragonFlag(opts: { tuck?: boolean } = {}): Demo {
  const shoulder: Pt = [44, 92];
  const grip: Pt = [32, 96];
  const at = (deg: number): Pose => {
    const hip = along(shoulder, SEG.torso, deg);
    return { hip, torso: deg + 180, arm: pin(grip, 1), leg: opts.tuck ? ang(deg - 60, deg + 60) : ang(deg) };
  };
  return {
    viewBox: VB,
    props: [{ kind: "box", x: 20, y: 96, w: 100, h: 6 }, floor],
    frames: [kf(at(-75), 300, 2200), kf(at(-18), 300, 1300)],
  };
}

export function humanFlag(v: Variant): Demo {
  const top: Pt = [60, 34];
  const bottom: Pt = [60, 64];
  const shoulder: Pt = [70, 44];
  const t = 180;
  const hip = along(shoulder, SEG.torso, 0);
  const hold: Pose = { hip, torso: t, arm: pin(top, -1), arm2: pin(bottom, 1), ...holdLegs(t, v) };
  return {
    viewBox: VB,
    props: [{ kind: "pole", x: 60, y1: 4, y2: FLOOR }, floor],
    frames: [kf(hold, 1500, 800), kf({ ...hold, hip: [hip[0], hip[1] + 1.5] }, 0, 800)],
  };
}

// Lying on the back, feet planted, hips driven up (single-leg: one leg out).
export function gluteBridge(opts: { singleLeg?: boolean } = {}): Demo {
  const feet: Pt = [98, FLOOR];
  const shoulderAt: Pt = [44, FLOOR - 3];
  const pose = (hipY: number): Pose => {
    const hip: Pt = [70, hipY];
    const torso = (Math.atan2(shoulderAt[1] - hip[1], shoulderAt[0] - hip[0]) * 180) / Math.PI;
    return { hip, torso, arm: ang(torso - 160, torso - 170), leg: pin(feet, -1), leg2: opts.singleLeg ? ang(-20) : undefined };
  };
  return { viewBox: VB, props: [floor], frames: [kf(pose(FLOOR - 6), 200, 900), kf(pose(FLOOR - 20), 500, 900)] };
}

export function calfRaise(): Demo {
  const stand: Pose = { hip: [80, FLOOR - LEG + 0.5], torso: -90, arm: ang(95, 95), leg: ang(90, 90) };
  const up: Pose = { ...stand, hip: [80, FLOOR - LEG - 4] };
  return { viewBox: VB, props: [floor], frames: [kf(stand, 200, 700), kf(up, 400, 700)] };
}
