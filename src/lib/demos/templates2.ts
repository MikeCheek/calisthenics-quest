import { ARM, Demo, Keyframe, LEG, Limb, Pose, Prop, Pt, SEG, SHOULDER_HALF, HIP_HALF, along } from "./figure";

// ---------------------------------------------------------------------------
// More movement templates: the front-view ones (for movements that happen
// side to side) and the warm-up, mobility and conditioning moves.
//
// Front view: `arm`/`leg` are the figure's RIGHT side, drawn on the left of
// the screen; the left side mirrors it unless given (`arm2`/`leg2`).
// Angles: 0 = right, 90 = down, 180 = left, -90 = up.
// ---------------------------------------------------------------------------

const FLOOR = 108;
const VB: Demo["viewBox"] = [0, 0, 160, 120];
const floor: Prop = { kind: "floor", y: FLOOR };
const kf = (pose: Pose, hold: number, move: number): Keyframe => ({ pose, hold, move });
const pin = (at: Pt, bend: 1 | -1 = 1): Limb => ({ at, bend });
const ang = (a: number, b: number = a): Limb => ({ ang: [a, b] });
const BAR_Y = 20;
const bar = (x1 = 40, x2 = 120, y = BAR_Y): Prop => ({ kind: "bar", y, x1, x2 });
const CX = 80;
const STAND_HIP = FLOOR - LEG + 0.5;
const toward = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
// a kneeling leg: the thigh down to the knee on the floor, the shin flat behind (or `shin` angle)
const kneel = (hip: Pt, knee: Pt, shin = 180): Limb => ang(toward(hip, knee), shin);

// ================= front view =================

// standing, facing you; `arm` angles for the right arm (left mirrors)
const standFront = (arm: Limb = ang(96, 92), leg: Limb = ang(91, 90)): Pose => ({ hip: [CX, STAND_HIP], torso: -90, arm, leg });

// Pull-ups from the front: the elbows drive down and out, chin over the bar.
export function pullUpFront(opts: { wide?: boolean; narrow?: boolean; slowDown?: boolean; oneArm?: boolean; hang?: boolean; scapula?: boolean } = {}): Demo {
  const half = opts.wide ? 22 : opts.narrow ? 12 : 17;
  const hand: Pt = [CX - half, BAR_Y];
  const hand2: Pt = [CX + half, BAR_Y];
  const dx = half - SHOULDER_HALF;
  const hangY = BAR_Y + Math.sqrt(ARM * ARM - dx * dx) - 0.05; // shoulders, arms straight
  const legs = ang(92, 91);
  // elbows fold outward and down (away from the body): bend -1 on the right arm, +1 on the left
  const down: Pose = { hip: [CX, hangY + SEG.torso], torso: -90, arm: pin(hand, -1), arm2: pin(hand2, 1), leg: legs };
  if (opts.hang || opts.scapula) {
    // shoulders pulled down, the body rises a touch — the arms stay straight
    const up: Pose = { ...down, hip: [CX, hangY + SEG.torso - (opts.scapula ? 1.6 : 0.8)] };
    return { view: "front", viewBox: VB, props: [bar()], frames: opts.scapula ? [kf(down, 400, 700), kf(up, 400, 700)] : [kf(down, 1600, 800), kf(up, 0, 800)] };
  }
  if (opts.oneArm) {
    // one hand on the bar, the other down by the side; the body turns a little under it
    // the body sits under the hand: shoulders shifted toward it
    const s1 = Math.sqrt(ARM * ARM - 1) - 0.05;
    const one: Pose = { hip: [hand[0] + SHOULDER_HALF + 1, BAR_Y + s1 + SEG.torso], torso: -90, arm: pin(hand, -1), arm2: ang(84, 90), leg: legs };
    const top: Pose = { hip: [hand[0] + SHOULDER_HALF + 6, BAR_Y + 11 + SEG.torso], torso: -92, arm: pin(hand, -1), arm2: ang(80, 95), leg: legs };
    return { view: "front", viewBox: VB, props: [bar()], frames: opts.slowDown ? [kf(top, 300, 2600), kf(one, 500, 900)] : [kf(one, 500, 1300), kf(top, 300, 1300)] };
  }
  const top: Pose = { hip: [CX, BAR_Y + 10 + SEG.torso], torso: -90, arm: pin(hand, -1), arm2: pin(hand2, 1), leg: legs };
  return { view: "front", viewBox: VB, props: [bar()], frames: opts.slowDown ? [kf(down, 300, 700), kf(top, 300, 2600)] : [kf(down, 400, 900), kf(top, 300, 1100)] };
}

// Human flag from the front: the body sticks out sideways from the pole,
// top arm pulling, bottom arm pushing.
export function humanFlagFront(v: "tuck" | "straddle" | "full" | "advTuck" | "oneLeg", opts: { raise?: boolean } = {}): Demo {
  const POLE = 44;
  // hands far apart on the pole, so both arms can be straight
  const top: Pt = [POLE, 14];
  const low: Pt = [POLE, 72];
  const legsFor = (torso: number): { leg: Limb; leg2?: Limb } => {
    const away = torso + 180;
    if (v === "tuck") return { leg: ang(away - 70, away + 40), leg2: ang(away + 70, away - 40) };
    if (v === "advTuck") return { leg: ang(away - 25, away + 70), leg2: ang(away + 25, away - 70) };
    if (v === "oneLeg") return { leg: ang(away - 4), leg2: ang(away + 40, away - 50) };
    if (v === "straddle") return { leg: ang(away - 22), leg2: ang(away + 22) };
    return { leg: ang(away - 3), leg2: ang(away + 3) };
  };
  // torso 180: hips to the right of the shoulders, body horizontal
  const flag = (torso: number, sx: number, sy = 43): Pose => {
    const shoulder: Pt = [sx, sy];
    return { hip: along(shoulder, SEG.torso, torso + 180), torso, arm: pin(low, 1), arm2: pin(top, 1), ...legsFor(torso) };
  };
  const hold = flag(180, POLE + 19.5);
  const props: Prop[] = [{ kind: "pole", x: POLE, y1: 0, y2: FLOOR }, floor];
  if (!opts.raise) return { view: "front", viewBox: VB, props, frames: [kf(hold, 1800, 900), kf(flag(186, POLE + 15), 600, 900)] };
  const low2 = flag(215, POLE + 9, 37); // hanging down-right (both arms still reach: checked numerically)
  return { view: "front", viewBox: VB, props, frames: [kf(low2, 500, 1500), kf(hold, 900, 1500)] };
}

// Iron cross (rings), front view: arms straight out to the sides.
export function ironCross(v: "tuck" | "straddle" | "full" | "advTuck" | "oneLeg", opts: { fromSupport?: boolean; inverted?: boolean } = {}): Demo {
  const ringY = 40;
  const span = 36; // hand to body centre
  const handR: Pt = [CX - span, ringY];
  const handL: Pt = [CX + span, ringY];
  const props: Prop[] = [
    { kind: "rings", x: handR[0], y: ringY, ropeTop: 0 },
    { kind: "rings", x: handL[0], y: ringY, ropeTop: 0 },
  ];
  const legs = (torso: number): { leg: Limb; leg2?: Limb } => {
    const away = torso + 180;
    if (v === "tuck") return { leg: ang(away - 60, away + 40), leg2: ang(away + 60, away - 40) };
    if (v === "straddle") return { leg: ang(away + 18), leg2: ang(away - 18) };
    return { leg: ang(away + 2), leg2: ang(away - 2) };
  };
  if (opts.inverted) {
    // upside down, arms out: shoulders level with the rings
    const inv: Pose = { hip: [CX, ringY - 2 - SEG.torso], torso: 90, arm: pin(handR, 1), arm2: pin(handL, -1), ...legs(90) };
    const dip: Pose = { ...inv, hip: [CX, ringY + 14 - SEG.torso] };
    return { view: "front", viewBox: VB, props, frames: [kf(dip, 400, 1600), kf(inv, 1400, 900)] };
  }
  const cross: Pose = { hip: [CX, ringY + 3 + SEG.torso], torso: -90, arm: pin(handR, -1), arm2: pin(handL, 1), ...legs(-90) };
  if (!opts.fromSupport) return { view: "front", viewBox: VB, props, frames: [kf(cross, 1800, 900), kf({ ...cross, hip: [CX, cross.hip[1] + 2] }, 400, 900)] };
  // negatives / presses: the body lowers from above the rings (arms angled
  // down to them) into the cross, slowly — the rings stay put
  const high: Pose = { ...cross, hip: [CX, cross.hip[1] - 16] };
  return { view: "front", viewBox: VB, props, frames: [kf(high, 500, 2600), kf(cross, 900, 1200)] };
}

// Jumping jacks: arms and legs out and in together.
export function jumpingJack(): Demo {
  const closed = standFront(ang(94, 92), ang(91));
  const open: Pose = { hip: [CX, STAND_HIP + 2], torso: -90, arm: ang(-150, -115), leg: ang(110, 108) };
  return { view: "front", viewBox: VB, props: [floor], frames: [kf(closed, 80, 330), kf(open, 80, 330)] };
}

// Arm circles: arms out to the sides, small circles.
export function armCircles(): Demo {
  const at = (a: number): Pose => standFront(ang(180 + a, 180 + a));
  return { view: "front", viewBox: VB, props: [floor], frames: [-14, 0, 14, 0].map((a) => kf(at(a), 0, 300)) };
}

// Band pull-aparts / shoulder dislocates: arms straight, from in front to wide.
export function pullApart(opts: { overhead?: boolean } = {}): Demo {
  if (opts.overhead) {
    // shoulder dislocates: wide straight arms travel from the hips, over the head, and back
    const frames = [120, 170, -150, -110, -150, 170].map((a) => kf(standFront(ang(a)), 0, 450));
    return { view: "front", viewBox: VB, props: [floor], frames };
  }
  const front = standFront(ang(150, 155)); // hands close, arms forward-ish (foreshortened)
  const wide = standFront(ang(180, 180));
  return { view: "front", viewBox: VB, props: [floor], frames: [kf(front, 200, 700), kf(wide, 300, 700)] };
}

// Hip circles: hands on hips, the hips draw a circle (seen as a sway).
export function hipCircles(): Demo {
  const hands = (dx: number): Pose => ({ hip: [CX + dx, STAND_HIP + 1], torso: -90 - dx * 1.4, arm: ang(135, 40), leg: ang(91 - dx, 90 - dx) });
  return { view: "front", viewBox: VB, props: [floor], frames: [0, 5, 0, -5].map((d) => kf(hands(d), 0, 450)) };
}

// ================= side view: warm-up, mobility, conditioning =================

// on hands and knees (thighs straight down, shins flat behind); `lift` tips
// the chest up (cow, negative) or down (cat), `reach` moves the other arm
function quadruped(lift = 0, reach?: Limb): Pose {
  const hand: Pt = [96, FLOOR];
  return { hip: [60, FLOOR - SEG.thigh - 1], torso: -2 + lift, arm: pin(hand, 1), ...(reach ? { arm2: reach } : {}), leg: ang(90, 180) };
}

// Cat-cow: on hands and knees, the chest sinks then the back rounds up.
export function catCow(opts: { reach?: boolean } = {}): Demo {
  if (opts.reach) {
    // thread the needle / thoracic rotation: one arm reaches under, then up to the sky
    return {
      viewBox: VB,
      props: [floor],
      frames: [kf(quadruped(0, ang(100, 120)), 300, 900), kf(quadruped(-4, ang(-70, -80)), 500, 900)],
    };
  }
  return { viewBox: VB, props: [floor], frames: [kf(quadruped(8), 500, 1100), kf(quadruped(-10), 500, 1100)] };
}

// Child's pose: from kneeling tall, sit back to the heels, arms long on the floor.
export function childsPose(): Demo {
  const knee: Pt = [72, FLOOR - 1];
  const tallHip: Pt = [72, FLOOR - 1 - SEG.thigh];
  const tall: Pose = { hip: tallHip, torso: -84, arm: ang(-60, -60), leg: kneel(tallHip, knee) };
  const downHip: Pt = [57, FLOOR - 8];
  const down: Pose = { hip: downHip, torso: -14, arm: pin([110, FLOOR], 1), leg: kneel(downHip, knee) };
  return { viewBox: VB, props: [floor], frames: [kf(tall, 300, 1500), kf(down, 1700, 1200)] };
}

// Kneeling lunge stretch (hip flexor / couch): back knee down, hips drift forward.
// The couch stretch has the back shin up a wall.
export function kneelingLunge(opts: { reach?: boolean } = {}): Demo {
  const front: Pt = [102, FLOOR];
  const backKnee: Pt = [62, FLOOR - 1];
  const p = (hip: Pt, torso: number, arm: Limb): Pose => ({ hip, torso, arm, leg: pin(front, -1), leg2: kneel(hip, backKnee, opts.reach ? -90 : 180) });
  const back = p([70, FLOOR - 1 - 16], -88, ang(95, 95));
  const fwd = p([78, FLOOR - 1 - 15], -94, opts.reach ? ang(-100, -100) : ang(95, 95));
  const props: Prop[] = opts.reach ? [floor, { kind: "wall", x: 48, y1: 40, y2: FLOOR }] : [floor];
  return { viewBox: VB, props, frames: [kf(back, 300, 1300), kf(fwd, 1400, 1300)] };
}

// World's greatest stretch: deep lunge, hand down, the other arm opens up.
export function worldsGreatest(): Demo {
  const front: Pt = [96, FLOOR];
  const back: Pt = [40, FLOOR];
  const base: Pose = { hip: [70, FLOOR - 20], torso: -28, arm: pin([90, FLOOR], 1), leg: pin(front, -1), leg2: pin(back, -1) };
  const open: Pose = { ...base, arm2: ang(-95, -95) };
  return { viewBox: VB, props: [floor], frames: [kf({ ...base, arm2: ang(95, 95) }, 300, 1100), kf(open, 900, 1100)] };
}

// Seated forward fold: legs long, fold over them.
export function seatedFold(): Demo {
  const up: Pose = { hip: [56, FLOOR - 2], torso: -84, arm: ang(10, 10), leg: ang(0, 0) };
  const fold: Pose = { hip: [56, FLOOR - 2], torso: -22, arm: ang(6, 6), leg: ang(0, 0) };
  return { viewBox: VB, props: [floor], frames: [kf(up, 300, 1600), kf(fold, 1600, 1300)] };
}

// Leg swings: standing tall, one leg swings forward and back.
export function legSwings(): Demo {
  const foot: Pt = [80, FLOOR];
  const at = (a: number): Pose => ({ hip: [80, STAND_HIP], torso: -90, arm: ang(160, 170), leg: pin(foot, -1), leg2: ang(a, a + 4) });
  return { viewBox: VB, props: [floor], frames: [kf(at(25), 0, 550), kf(at(150), 0, 550)] };
}

// High knees: running on the spot, knees to hip height.
export function highKnees(): Demo {
  const run = (up: 1 | 2): Pose => ({
    hip: [80, STAND_HIP - 2],
    torso: -92,
    arm: up === 1 ? ang(130, 60) : ang(60, -40),
    arm2: up === 1 ? ang(60, -40) : ang(130, 60),
    leg: up === 1 ? ang(-5, 90) : ang(92),
    leg2: up === 1 ? ang(92) : ang(-5, 90),
  });
  return { viewBox: VB, props: [floor], frames: [kf(run(1), 40, 260), kf(run(2), 40, 260)] };
}

// Mountain climbers: in a high plank, knees drive to the chest in turn.
export function mountainClimbers(): Demo {
  const hand: Pt = [104, FLOOR];
  const hip: Pt = [64, FLOOR - 26];
  const p = (front: 1 | 2): Pose => ({
    hip,
    torso: -15,
    arm: pin(hand, 1),
    // the driving knee comes in under the chest; the other leg stays long behind
    leg: front === 1 ? ang(40, 130) : pin([30, FLOOR], 1),
    leg2: front === 1 ? pin([30, FLOOR], 1) : ang(40, 130),
  });
  return { viewBox: VB, props: [floor], frames: [kf(p(1), 40, 320), kf(p(2), 40, 320)] };
}

// Burpees: squat, hands down, jump back to a plank, back in, jump up.
export function burpee(): Demo {
  const feet: Pt = [80, FLOOR];
  const stand: Pose = { hip: [80, STAND_HIP], torso: -90, arm: ang(95, 95), leg: pin(feet, -1) };
  const squat: Pose = { hip: [74, FLOOR - 14], torso: -40, arm: pin([100, FLOOR], 1), leg: pin(feet, -1) };
  const plank: Pose = { hip: [74, FLOOR - 15], torso: -12, arm: pin([104, FLOOR], 1), leg: pin([42, FLOOR], 1) };
  const jump: Pose = { hip: [80, STAND_HIP - 10], torso: -90, arm: ang(-80, -80), leg: pin([80, FLOOR - 10], -1) };
  return { viewBox: VB, props: [floor], frames: [kf(stand, 100, 400), kf(squat, 0, 300), kf(plank, 150, 300), kf(squat, 0, 550), kf(jump, 0, 450)] };
}

// Prone Y-T-W raises: face down, arms lift off the floor.
export function proneRaises(): Demo {
  const lie = (armAng: number): Pose => ({ hip: [60, FLOOR - 4], torso: 2, arm: ang(armAng, armAng), leg: ang(178, 180) });
  return { viewBox: VB, props: [floor], frames: [kf(lie(-10), 300, 700), kf(lie(-40), 600, 700)] };
}

// Wrist prep: on hands and knees, rocking the shoulders over the hands.
export function wristRocks(): Demo {
  const hand: Pt = [96, FLOOR];
  const back: Pose = { hip: [56, FLOOR - 16], torso: -10, arm: pin(hand, 1), leg: pin([48, FLOOR], 1) };
  const fwd: Pose = { hip: [64, FLOOR - 17], torso: -8, arm: pin(hand, 1), leg: pin([48, FLOOR], 1) };
  return { viewBox: VB, props: [floor], frames: [kf(back, 200, 800), kf(fwd, 300, 800)] };
}

// Chest / doorway stretch: standing, arm back on a wall at shoulder height.
export function chestOpener(): Demo {
  const WALL = 54;
  const hand: Pt = [WALL + 1, 50];
  const lean = (dx: number): Pose => ({ hip: [80 + dx, STAND_HIP], torso: -90, arm: pin(hand, 1), leg: ang(90), leg2: ang(84, 92) });
  return { viewBox: VB, props: [floor, { kind: "wall", x: WALL, y1: 20, y2: FLOOR }], frames: [kf(lean(0), 300, 1200), kf(lean(5), 1400, 1200)] };
}

// Crow / frog stand: hands down, knees on the elbows, lean until the feet float.
export function crowStand(opts: { elbowLever?: boolean } = {}): Demo {
  const hand: Pt = [86, FLOOR];
  if (opts.elbowLever) {
    // body horizontal on bent arms, elbows tucked into the hips
    const lever: Pose = { hip: [70, FLOOR - 22], torso: 0, arm: pin(hand, -1), leg: ang(180, 180) };
    const tuck: Pose = { hip: [72, FLOOR - 24], torso: 6, arm: pin(hand, -1), leg: ang(150, 70) };
    return { viewBox: VB, props: [floor], frames: [kf(tuck, 400, 1100), kf(lever, 1500, 1000)] };
  }
  // hips high behind, shoulders over the hands with the elbows bent; the knees rest on the elbows
  const feetDown: Pose = { hip: [62, FLOOR - 32], torso: 22, arm: pin(hand, -1), leg: pin([64, FLOOR], 1) };
  const up: Pose = { hip: [64, FLOOR - 36], torso: 28, arm: pin(hand, -1), leg: ang(52, 172) }; // knees on the backs of the arms, shins up behind
  return { viewBox: VB, props: [floor], frames: [kf(feetDown, 400, 1000), kf(up, 1500, 900)] };
}

// Monkey bar traverse: hand over hand along the bar, the body swinging along.
export function monkeyBars(): Demo {
  const props = [bar(6, 154)];
  // body under the middle of the two hands, swinging into each reach
  const hang = (lead: number, trail: number, swing: number): Pose => {
    const x = (lead + trail) / 2;
    return { hip: [x - swing, BAR_Y + ARM - 3 + SEG.torso], torso: -90 + swing, arm: pin([lead, BAR_Y], 1), arm2: pin([trail, BAR_Y], -1), leg: ang(92 + swing * 2) };
  };
  // hand over hand to the right, then back
  const rungs = [36, 56, 76, 96, 116];
  const frames: Keyframe[] = [];
  for (let i = 0; i + 1 < rungs.length; i++) frames.push(kf(hang(rungs[i + 1], rungs[i], i % 2 ? 4 : -4), 120, 520));
  for (let i = rungs.length - 1; i > 0; i--) frames.push(kf(hang(rungs[i - 1], rungs[i], i % 2 ? -4 : 4), 120, 520));
  return { viewBox: VB, props, frames };
}

// Rope climb: hands reach up the rope in turn, the legs pinch it.
export function ropeClimb(opts: { legless?: boolean } = {}): Demo {
  const ROPE = 80;
  const props: Prop[] = [{ kind: "pole", x: ROPE, y1: 0, y2: FLOOR - 10 }];
  const at = (y: number, high: 1 | 2): Pose => ({
    hip: [ROPE - 4, y + SEG.torso],
    torso: -88,
    arm: pin([ROPE, y - (high === 1 ? 22 : 8)], 1),
    arm2: pin([ROPE, y - (high === 1 ? 8 : 22)], 1),
    leg: opts.legless ? ang(92, 90) : ang(40, 120),
    leg2: opts.legless ? ang(88, 92) : ang(60, 150),
  });
  return { viewBox: VB, props, frames: [kf(at(48, 1), 150, 650), kf(at(40, 2), 150, 650)] };
}

// Broad jump: swing, jump forward, land soft.
export function broadJump(): Demo {
  const set: Pose = { hip: [44, FLOOR - 18], torso: -48, arm: ang(140, 150), leg: pin([50, FLOOR], -1) };
  const air: Pose = { hip: [82, FLOOR - 46], torso: -70, arm: ang(-60, -40), leg: ang(140, 90) };
  const land: Pose = { hip: [110, FLOOR - 18], torso: -52, arm: ang(-10, 0), leg: pin([118, FLOOR], -1) };
  return { viewBox: VB, props: [floor], frames: [kf(set, 250, 450), kf(air, 0, 450), kf(land, 600, 900)] };
}

// Single-leg Romanian deadlift: hinge on one leg, the other reaching back.
export function singleLegRDL(): Demo {
  const foot: Pt = [84, FLOOR];
  const tall: Pose = { hip: [84, STAND_HIP], torso: -90, arm: ang(95, 95), leg: pin(foot, -1), leg2: ang(94, 96) };
  const hinge: Pose = { hip: [82, STAND_HIP + 2], torso: -8, arm: ang(92, 92), leg: pin(foot, -1), leg2: ang(178, 180) };
  return { viewBox: VB, props: [floor], frames: [kf(tall, 300, 1300), kf(hinge, 400, 1300)] };
}

// ---- cool-down stretches ----

// Standing quad stretch: heel pulled to the glute, knee pointing down.
export function quadStretch(): Demo {
  const foot: Pt = [80, FLOOR];
  const hip: Pt = [80, STAND_HIP];
  // the bent leg: knee down beside the other, heel pulled up behind to the glute
  const p = (thigh: number): Pose => {
    const knee = along(hip, SEG.thigh, thigh);
    const heel = along(knee, SEG.shin, -100);
    return { hip, torso: -90, arm: pin(heel, -1), arm2: ang(-30, -20), leg: pin(foot, -1), leg2: ang(thigh, -100) };
  };
  return { viewBox: VB, props: [floor], frames: [kf(p(92), 2000, 800), kf(p(98), 1200, 800)] };
}

// Calf stretch: hands on a wall, back leg long, heel down.
export function calfStretch(): Demo {
  const WALL = 116;
  const p = (dx: number): Pose => ({ hip: [84 + dx, FLOOR - 32], torso: -72, arm: pin([WALL - 1, 46], 1), leg: pin([92, FLOOR], -1), leg2: pin([58, FLOOR], -1) });
  return { viewBox: VB, props: [floor, { kind: "wall", x: WALL + 4, y1: 20, y2: FLOOR }], frames: [kf(p(0), 300, 1200), kf(p(4), 1500, 1200)] };
}

// Sphinx: lying face down, propped on the forearms, chest lifted.
export function sphinx(): Demo {
  const elbow: Pt = [88, FLOOR];
  const low: Pose = { hip: [58, FLOOR - 4], torso: -4, arm: ang(100, 0), leg: ang(178, 180) };
  const up: Pose = { hip: [58, FLOOR - 4], torso: -26, arm: pin([elbow[0] + SEG.forearm, FLOOR], 1), leg: ang(178, 180) };
  return { viewBox: VB, props: [floor], frames: [kf(low, 300, 1200), kf(up, 1800, 1200)] };
}

// Cross-body shoulder stretch (front): one arm pulled across the chest.
export function crossBodyStretch(): Demo {
  const across = (dx: number): Pose => ({ hip: [CX, STAND_HIP], torso: -90, arm: ang(-5 + dx, -5 + dx), arm2: ang(150, 190), leg: ang(91, 90) });
  return { view: "front", viewBox: VB, props: [floor], frames: [kf(across(0), 1500, 900), kf(across(-8), 1200, 900)] };
}

// Overhead triceps stretch (front): elbow up, hand down the back.
export function tricepsStretch(): Demo {
  // right elbow up by the head, hand dropping behind it; the left hand eases the elbow back
  const p = (lean: number): Pose => ({ hip: [CX, STAND_HIP], torso: -90 + lean, arm: ang(-100 + lean, 60), arm2: ang(-55, -150), leg: ang(91, 90) });
  return { view: "front", viewBox: VB, props: [floor], frames: [kf(p(0), 1500, 900), kf(p(4), 1200, 900)] };
}
