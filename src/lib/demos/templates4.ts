import { ARM, Demo, Keyframe, LEG, Limb, Pose, Prop, Pt, SEG, along } from "./figure";

// ---------------------------------------------------------------------------
// More movements: the dynamic skills (kip-up, flips, rolls, rotations around
// the bar, the Turkish get-up), and moves that were drawn as something else
// (side planks from the front, archer work, sissy and cossack squats, wall
// walks, kick-ups…). Same conventions as templates.ts: side view faces right;
// front view's `arm`/`leg` are the figure's right side, on the screen's left.
// Rotations are cut into steps under 180°, so each turns the right way.
// ---------------------------------------------------------------------------

const FLOOR = 108;
const VB: Demo["viewBox"] = [0, 0, 160, 120];
const floor: Prop = { kind: "floor", y: FLOOR };
const kf = (pose: Pose, hold: number, move: number): Keyframe => ({ pose, hold, move });
const pin = (at: Pt, bend: 1 | -1 = 1): Limb => ({ at, bend });
const ang = (a: number, b: number = a): Limb => ({ ang: [a, b] });
const STAND_HIP = FLOOR - LEG + 0.5;
const toward = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const side = (frames: Keyframe[], props: Prop[] = [floor], viewBox: Demo["viewBox"] = VB): Demo => ({ viewBox, props, frames });
const front = (frames: Keyframe[], props: Prop[] = [floor], viewBox: Demo["viewBox"] = VB): Demo => ({ view: "front", viewBox, props, frames });

// ================= the wall, the pole, the floor =================

// Wall walk: from a push-up position with the feet on the wall, walk the
// hands in and the feet up until the chest is close to the wall.
export function wallWalk(): Demo {
  const WALL = 30;
  const at = (deg: number): Pose => {
    // a straight line from the hands up to the feet on the wall
    const r = (deg * Math.PI) / 180;
    const hand: Pt = [WALL + (ARM + SEG.torso + LEG) * Math.cos(r), FLOOR];
    const shoulder = along(hand, ARM, -(180 - deg));
    const hip = along(shoulder, SEG.torso, -(180 - deg));
    const feet = along(hip, LEG, -(180 - deg));
    return { hip, torso: deg, arm: pin(hand, 1), leg: pin([WALL, feet[1]], 1) };
  };
  const props: Prop[] = [floor, { kind: "wall", x: WALL - 1, y1: 0, y2: FLOOR }];
  return side([kf(at(12), 400, 900), kf(at(35), 150, 900), kf(at(58), 150, 900), kf(at(78), 1200, 1100), kf(at(45), 0, 1100)], props, [0, -20, 160, 140]);
}

// Kick-up: a lunge with the arms up, hinge the hands to the floor, swing the
// back leg up and push off the front one into the handstand; step back down.
export function kickUp(): Demo {
  const hands: Pt = [104, FLOOR];
  const lunge: Pose = { hip: [76, STAND_HIP + 4], torso: -98, arm: ang(-98, -98), leg: pin([90, FLOOR], -1), leg2: pin([58, FLOOR], -1) };
  const reach: Pose = { hip: [86, FLOOR - 33], torso: 38, arm: pin(hands, 1), leg: pin([92, FLOOR], -1), leg2: ang(-140, -140) };
  const hs: Pose = { hip: [hands[0], FLOOR - ARM - SEG.torso + 0.5], torso: 90, arm: pin(hands, 1), leg: ang(-92, -92), leg2: ang(-84, -84) };
  return side([kf(lunge, 300, 600), kf(reach, 0, 450), kf(hs, 900, 600), kf(reach, 0, 600)]);
}

// Holding a vertical pole with both hands, feet down, leaning away (front).
export function poleLean(): Demo {
  const POLE = 44;
  const p = (dx: number): Pose => ({
    hip: [76 + dx, 82],
    torso: -126,
    arm: pin([POLE, 50], -1),
    arm2: pin([POLE, 70], 1),
    leg: pin([88, FLOOR], 1),
    leg2: pin([98, FLOOR], -1),
  });
  return front([kf(p(0), 1400, 900), kf(p(1.5), 400, 900)], [{ kind: "pole", x: POLE, y1: 0, y2: FLOOR }, floor]);
}

// Side plank, from the front: a straight diagonal from the stacked feet to
// the shoulder over the elbow, the top arm up. Variants: hip dips, the top
// leg raised, the Copenhagen (top foot on a bench, bottom leg free).
export function sidePlank(opts: { dips?: boolean; legUp?: boolean; copenhagen?: boolean } = {}): Demo {
  const feet: Pt = opts.copenhagen ? [32, FLOOR - 14] : [32, FLOOR - 2];
  const elbowHand: Pt = [112, FLOOR];
  const at = (deg: number, legUp = false): Pose => {
    const hip = along(feet, LEG, deg);
    return {
      hip,
      torso: deg,
      arm: ang(-90, -90), // top arm (the figure's right) to the sky
      arm2: pin(elbowHand, -1), // bottom forearm on the floor, elbow under the shoulder
      leg: legUp ? ang(deg + 160, deg + 160) : pin(feet, -1),
      leg2: opts.copenhagen ? ang(deg + 200, deg + 150) : pin([feet[0], feet[1] + 1], 1),
    };
  };
  const props: Prop[] = opts.copenhagen ? [floor, { kind: "box", x: 18, y: FLOOR - 14, w: 26, h: 14 }] : [floor];
  const base = opts.copenhagen ? -4 : -16;
  if (opts.dips) return front([kf(at(base), 200, 800), kf(at(base + 9), 200, 800)], props);
  if (opts.legUp) return front([kf(at(base), 300, 800), kf(at(base, true), 900, 800)], props);
  return front([kf(at(base), 1600, 900), kf(at(base - 1), 400, 900)], props);
}

// Reverse plank: face up, heels down, hands under the shoulders, a straight
// line from heels to shoulders.
export function reversePlank(): Demo {
  const heels: Pt = [112, FLOOR];
  const p = (lift: number): Pose => {
    const hip: Pt = [82, FLOOR - 16 - lift];
    const sh = along(heels, LEG + SEG.torso, toward(heels, hip));
    return { hip, torso: toward(hip, sh), arm: pin([sh[0], FLOOR], -1), leg: pin(heels, 1) };
  };
  return side([kf(p(0), 1600, 900), kf(p(1), 300, 900)]);
}

// Lying leg raises: on the back, straight legs from the floor to vertical.
export function lyingLegRaise(): Demo {
  const p = (legs: number): Pose => ({ hip: [88, FLOOR - 4], torso: 180, arm: ang(2, 0), leg: ang(legs, legs) });
  return side([kf(p(-4), 200, 1100), kf(p(-88), 300, 1300)]);
}

// Sissy squat: up on the toes, knees travel forward and down while hips,
// torso and thighs stay in one line leaning back.
export function sissySquat(): Demo {
  const foot: Pt = [80, FLOOR];
  const top: Pose = { hip: [80, STAND_HIP], torso: -90, arm: ang(-4, -4), leg: pin(foot, -1) };
  const bottom: Pose = { hip: [81, FLOOR - 14], torso: -150, arm: ang(-6, -6), leg: pin(foot, -1) };
  return side([kf(top, 300, 1500), kf(bottom, 400, 1200)]);
}

// Cossack squat, from the front: sit deep over one leg while the other stays
// straight out to the side, toes up; pass through the middle to the other side.
export function cossack(): Demo {
  const L: Pt = [56, FLOOR];
  const R: Pt = [100, FLOOR];
  const p = (x: number, y: number): Pose => ({ hip: [x, y], torso: -88 + (x - 78) / 6, arm: ang(70, 110), leg: pin(L, x < 78 ? 1 : -1), leg2: pin(R, x > 78 ? -1 : 1) });
  return front([kf(p(66, FLOOR - 14), 500, 1000), kf(p(78, FLOOR - 29), 0, 1000), kf(p(90, FLOOR - 14), 500, 1000), kf(p(78, FLOOR - 29), 0, 1000)]);
}

// Single-leg hops, sticking the landing.
export function singleLegHop(): Demo {
  const foot: Pt = [80, FLOOR];
  const stand: Pose = { hip: [80, STAND_HIP], torso: -90, arm: ang(100, 95), leg: pin(foot, -1), leg2: ang(130, 60) };
  const dip: Pose = { hip: [78, STAND_HIP + 6], torso: -80, arm: ang(120, 110), leg: pin(foot, -1), leg2: ang(130, 60) };
  const air: Pose = { hip: [80, STAND_HIP - 10], torso: -90, arm: ang(-60, -40), leg: ang(92, 88), leg2: ang(130, 60) };
  return side([kf(stand, 200, 350), kf(dip, 0, 320), kf(air, 0, 360), kf(dip, 600, 400)]);
}

// Box jump-backs: from a squat, jump backwards, land soft in a squat.
export function jumpBack(): Demo {
  const set: Pose = { hip: [104, FLOOR - 18], torso: -60, arm: ang(140, 150), leg: pin([98, FLOOR], -1) };
  const air: Pose = { hip: [78, FLOOR - 46], torso: -96, arm: ang(-110, -120), leg: ang(95, 85) };
  const land: Pose = { hip: [56, FLOOR - 18], torso: -60, arm: ang(-10, 0), leg: pin([50, FLOOR], -1) };
  return side([kf(set, 250, 400), kf(air, 0, 400), kf(land, 600, 900)]);
}

// Turkish get-up: from lying, weight held straight up, to standing and back —
// elbow, hand, hips up, sweep the leg under to a kneel, stand.
export function getUp(opts: { half?: boolean } = {}): Demo {
  const up = ang(-90, -90); // the loaded arm stays vertical the whole way
  const lying: Pose = { hip: [92, FLOOR - 4], torso: 180, arm: up, arm2: ang(10, 4), leg: pin([114, FLOOR], -1), leg2: ang(2, 0) };
  const elbow: Pose = { hip: [92, FLOOR - 4], torso: 200, arm: up, arm2: pin([52, FLOOR], 1), leg: pin([114, FLOOR], -1), leg2: ang(2, 0) };
  const hand: Pose = { hip: [92, FLOOR - 4], torso: 235, arm: up, arm2: pin([70, FLOOR], 1), leg: pin([114, FLOOR], -1), leg2: ang(4, 0) };
  const bridge: Pose = { hip: [88, FLOOR - 16], torso: 200, arm: up, arm2: pin([58, FLOOR], 1), leg: pin([112, FLOOR], -1), leg2: ang(12, 8) };
  const kneel: Pose = { hip: [86, FLOOR - 18], torso: -100, arm: up, arm2: ang(100, 95), leg: pin([106, FLOOR], -1), leg2: ang(toward([86, FLOOR - 18], [78, FLOOR - 3]), 180) };
  const stand: Pose = { hip: [92, STAND_HIP], torso: -90, arm: up, arm2: ang(95, 92), leg: pin([96, FLOOR], -1), leg2: pin([88, FLOOR], -1) };
  const frames = opts.half
    ? [kf(lying, 400, 900), kf(elbow, 200, 800), kf(hand, 500, 900), kf(elbow, 0, 800)]
    : [kf(lying, 400, 900), kf(elbow, 150, 800), kf(hand, 150, 800), kf(bridge, 300, 900), kf(kneel, 300, 900), kf(stand, 700, 1000), kf(kneel, 200, 900), kf(bridge, 150, 800), kf(hand, 100, 800), kf(elbow, 0, 800)];
  return side(frames, [floor], [0, -10, 160, 130]);
}

// ================= rolling, kipping, flipping =================

// a tucked body at torso angle t: knees to the chest, hands on the shins
const tucked = (t: number): Pick<Pose, "leg" | "arm"> => ({ leg: ang(t + 50, t + 205), arm: ang(t + 140, t + 95) });

// Kip-up: rock back onto the shoulders, hands by the ears, then kick the
// legs up and over and push, landing in a squat and standing up. The drill
// version only rocks back and forth to the feet; "to jump" adds a jump.
export function kipUp(opts: { drill?: boolean; jump?: boolean } = {}): Demo {
  const hands: Pt = [50, FLOOR];
  const rolled: Pose = { hip: [70, FLOOR - 28], torso: 120, arm: pin(hands, 1), leg: ang(195, 120) };
  const kick: Pose = { hip: [72, FLOOR - 26], torso: 160, arm: pin(hands, 1), leg: ang(-70, -70) };
  const flight: Pose = { hip: [80, FLOOR - 30], torso: 225, arm: ang(-40, -20), leg: ang(80, 100) };
  const squat: Pose = { hip: [80, FLOOR - 14], torso: 300, arm: ang(-10, 0), leg: pin([88, FLOOR], -1) };
  const stand: Pose = { hip: [86, STAND_HIP], torso: 270, arm: ang(95, 95), leg: pin([88, FLOOR], -1) };
  const lying: Pose = { hip: [86, FLOOR - 4], torso: 180, arm: ang(4, 0), leg: ang(-30, 40) };
  if (opts.drill) {
    // rock back to the shoulders and roll forward onto the feet
    const sitting: Pose = { hip: [80, FLOOR - 4], torso: 250, arm: ang(-10, 0), leg: ang(-30, 70) };
    return side([kf(squat, 300, 700), kf(sitting, 0, 500), kf(lying, 0, 500), kf(rolled, 200, 600), kf(lying, 0, 500), kf(sitting, 0, 600)]);
  }
  const jump: Pose = { hip: [86, STAND_HIP - 12], torso: 270, arm: ang(-80, -80), leg: ang(92, 88) };
  return side([kf(lying, 300, 500), kf(rolled, 150, 400), kf(kick, 0, 330), kf(flight, 0, 360), kf(squat, 200, 600), ...(opts.jump ? [kf(jump, 0, 400)] : []), kf(stand, 700, 900)], [floor], [0, -10, 160, 130]);
}

// Back flip (back tuck) and front flip: swing, jump, tuck, turn all the way
// round in steps, open up and land in a squat.
export function flip(dir: "back" | "front"): Demo {
  const s = dir === "back" ? -1 : 1; // back: head goes back (to the left) first
  const x = 80;
  const stand: Pose = { hip: [x, STAND_HIP], torso: -90, arm: ang(100, 95), leg: pin([x, FLOOR], -1) };
  const load: Pose = { hip: [x - 2, STAND_HIP + 10], torso: -70, arm: ang(130, 150), leg: pin([x, FLOOR], -1) };
  const takeoff: Pose = { hip: [x, STAND_HIP - 14], torso: -90 + s * 8, arm: ang(-95, -95), leg: ang(92, 90) };
  const turn = (k: number, y: number): Pose => {
    const t = -90 + s * 70 * k;
    return { hip: [x, y], torso: t, ...tucked(t) };
  };
  const land: Pose = { hip: [x, FLOOR - 16], torso: -62, arm: ang(-10, 0), leg: pin([x + 6, FLOOR], -1) };
  return side(
    [
      kf(stand, 300, 450),
      kf(load, 0, 300),
      kf(takeoff, 0, 300),
      kf(turn(1, STAND_HIP - 34), 0, 240),
      kf(turn(2, STAND_HIP - 40), 0, 240),
      kf(turn(3, STAND_HIP - 38), 0, 240),
      kf(turn(4, STAND_HIP - 28), 0, 260),
      kf({ hip: [x, STAND_HIP - 10], torso: -90 + s * 360, arm: ang(-60, -40), leg: ang(88, 92) }, 0, 300),
      kf(land, 500, 900),
    ],
    [floor],
    [0, -30, 160, 150]
  );
}

// Dive roll: dive the hands to the floor, tuck the chin, roll over the
// shoulders and back to the feet.
export function diveRoll(): Demo {
  const stand: Pose = { hip: [40, STAND_HIP], torso: -90, arm: ang(100, 95), leg: pin([40, FLOOR], -1) };
  const dive: Pose = { hip: [56, FLOOR - 34], torso: -10, arm: ang(30, 40), leg: ang(170, 175) };
  const roll = (t: number, x: number): Pose => {
    const r = (t * Math.PI) / 180;
    const y = FLOOR - 6 - Math.max(0, 31.5 * Math.sin(r));
    return { hip: [x, y], torso: t, ...tucked(t) };
  };
  const squat: Pose = { hip: [116, FLOOR - 14], torso: -60, arm: ang(-10, 0), leg: pin([124, FLOOR], -1) };
  return side([kf(stand, 300, 400), kf(dive, 0, 300), kf(roll(60, 76), 0, 250), kf(roll(130, 90), 0, 250), kf(roll(200, 102), 0, 250), kf(roll(260, 110), 0, 250), kf(squat, 500, 800)], [floor], [0, -10, 160, 130]);
}

// ================= around the bar =================

const BAR: Pt = [100, 100];
const barProp: Prop = { kind: "bar", y: BAR[1], x1: 60, x2: 140 };
const BIG: Demo["viewBox"] = [0, 0, 200, 200];

// Giant swing: a straight body all the way round the bar (or part of the
// way, for the swing drills).
export function giant(opts: { partial?: boolean } = {}): Demo {
  const at = (th: number): Pose => {
    const shoulder = along(BAR, ARM - 0.5, th);
    const hip = along(shoulder, SEG.torso, th);
    return { hip, torso: th + 180, arm: pin(BAR, 1), leg: ang(th, th) };
  };
  if (opts.partial) return side([kf(at(150), 100, 700), kf(at(90), 0, 700), kf(at(30), 100, 700), kf(at(90), 0, 700)], [barProp], BIG);
  return side([90, 135, 180, 225, 270, 315, 360, 405].map((th, i) => kf(at(th), i === 0 ? 300 : 0, 260)), [barProp], BIG);
}

// Hips around the bar (hip circles, the windmill, around the world, bar
// spins): the bar sits at the hips, hands beside them, the body turns round.
export function hipCircleBar(): Demo {
  const at = (t: number): Pose => ({ hip: BAR, torso: t, arm: pin(BAR, 1), leg: ang(t + 150, t + 150) });
  return side([-90, -45, 0, 45, 90, 135, 180, 225].map((t, i) => kf(at(t), i === 0 ? 400 : 0, 280)), [barProp], BIG);
}

// Bar swings (kip swing, hollow-to-arch): hanging, the body swings forward
// hollow and back arched.
export function barSwing(): Demo {
  const hand: Pt = [80, 20];
  const at = (th: number, legs: number): Pose => {
    const shoulder = along(hand, ARM - 0.5, 90 + th);
    const hip = along(shoulder, SEG.torso, 90 + th);
    return { hip, torso: -90 + th, arm: pin(hand, 1), leg: ang(90 + th + legs, 90 + th + legs) };
  };
  return side([kf(at(-18, -14), 100, 700), kf(at(18, 12), 100, 700)], [{ kind: "bar", y: 20, x1: 40, x2: 120 }], [0, 0, 160, 130]);
}

// An L-sit while hanging: arms long, legs level in front.
export function hangingLSit(): Demo {
  const hand: Pt = [80, 20];
  const hang: Pose = { hip: [80, 20 + ARM - 0.5 + SEG.torso], torso: -90, arm: pin(hand, 1), leg: ang(-2, 0) };
  return side([kf(hang, 1500, 800), kf({ ...hang, leg: ang(2, 4) }, 300, 800)], [{ kind: "bar", y: 20, x1: 40, x2: 120 }]);
}

// Straight-arm pull-downs with a band (front): arms straight from overhead
// down to the hips.
export function pullDown(): Demo {
  const p = (a: number): Pose => ({ hip: [80, STAND_HIP], torso: -90, arm: ang(a, a), leg: ang(92, 90) });
  return front([kf(p(-112), 300, 1000), kf(p(100), 400, 1300)], [{ kind: "bar", y: 6, x1: 50, x2: 110 }, floor]);
}

// Rings: from the support, roll forward over the hands into the inverted hang.
const RING: Pt = [80, 58];
const ringsProp: Prop = { kind: "rings", x: RING[0], y: RING[1], ropeTop: 0 };
export function ringPullOut(): Demo {
  const at = (phi: number, pike: number): Pose => {
    const shoulder = along(RING, ARM - 0.5, phi);
    const hip = along(shoulder, SEG.torso, phi + 180);
    return { hip, torso: phi, arm: pin(RING, 1), leg: ang(phi + 180 + pike, phi + 180 + pike) };
  };
  return side([kf(at(-90, 0), 500, 600), kf(at(-45, 30), 0, 600), kf(at(0, 50), 0, 600), kf(at(45, 30), 0, 600), kf(at(90, 0), 800, 1400)], [ringsProp], [0, -20, 160, 150]);
}

export function invertedHang(): Demo {
  const shoulder: Pt = [RING[0], RING[1] + ARM - 0.5];
  const hold: Pose = { hip: [shoulder[0], shoulder[1] - SEG.torso], torso: 90, arm: pin(RING, 1), leg: ang(-90, -90) };
  return side([kf(hold, 1600, 900), kf({ ...hold, leg: ang(-94, -94) }, 300, 900)], [ringsProp], [0, -20, 160, 150]);
}

// ================= seated, kneeling, lying =================

// Seated rope pulls: hand over hand, reaching forward and pulling in.
export function ropePull(): Demo {
  const p = (s: 1 | -1): Pose => ({
    hip: [56, FLOOR - 3],
    torso: -80,
    arm: s > 0 ? ang(-6, -6) : ang(70, -160),
    arm2: s > 0 ? ang(70, -160) : ang(-6, -6),
    leg: ang(-6, 2),
  });
  return side([kf(p(1), 100, 500), kf(p(-1), 100, 500)], [floor, { kind: "pole", x: 130, y1: 60, y2: FLOOR }]);
}

// Shoulder opening (puppy pose on a bench): kneeling, hips over the knees,
// arms long on a bench, the chest sinking toward the floor.
export function shoulderOpening(): Demo {
  const hip: Pt = [62, FLOOR - 18];
  const p = (t: number): Pose => ({ hip, torso: t, arm: pin([116, FLOOR - 16], 1), leg: ang(toward(hip, [60, FLOOR - 1]), 180) });
  return side([kf(p(-14), 300, 1300), kf(p(10), 1600, 1300)], [floor, { kind: "box", x: 108, y: FLOOR - 16, w: 30, h: 16 }]);
}

// Windshield wipers on the floor, holding a pole (seen from above): the legs
// sweep together from one side to the other, the shoulders stay down.
export function wipers(): Demo {
  const p = (a: number): Pose => ({ hip: [80, 70], torso: -90, arm: pin([72, 26], -1), arm2: pin([88, 26], 1), leg: ang(a, a), leg2: ang(a, a) });
  return front([kf(p(150), 200, 800), kf(p(90), 0, 800), kf(p(30), 200, 800), kf(p(90), 0, 800)], [{ kind: "bar", y: 26, x1: 50, x2: 110 }], [0, 0, 160, 120]);
}
