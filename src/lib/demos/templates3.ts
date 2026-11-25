import {
  Demo,
  Keyframe,
  LEG,
  Limb,
  Pose,
  Prop,
  Pt,
  SEG,
  along,
} from "./figure";

// ---------------------------------------------------------------------------
// Yoga and Pilates. Most poses read best from the side; the ones that open
// sideways (tree, warrior II, half moon, straddles, side-lying work, seated
// cross-legged poses) are drawn from the front.
//
// Side view conventions used here: standing figures face right; lying on the
// back the head is on the left (torso 180, curling up = above 180); lying
// face down the head is on the right (torso 0, chest up = below 0).
// ---------------------------------------------------------------------------

const FLOOR = 108;
const VB: Demo["viewBox"] = [0, 0, 160, 120];
const floor: Prop = { kind: "floor", y: FLOOR };
const kf = (pose: Pose, hold: number, move: number): Keyframe => ({
  pose,
  hold,
  move,
});
const pin = (at: Pt, bend: 1 | -1 = 1): Limb => ({ at, bend });
const ang = (a: number, b: number = a): Limb => ({ ang: [a, b] });
const CX = 80;
const STAND_HIP = FLOOR - LEG + 0.5;
const toward = (a: Pt, b: Pt) =>
  (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const side = (frames: Keyframe[], props: Prop[] = [floor]): Demo => ({
  viewBox: VB,
  props,
  frames,
});
const front = (frames: Keyframe[], props: Prop[] = [floor]): Demo => ({
  view: "front",
  viewBox: VB,
  props,
  frames,
});
const shoulderOf = (p: Pose): Pt => along(p.hip, SEG.torso, p.torso);
// a slow breath: the hold, then the same pose eased a touch
const breathe = (p: Pose, dy = 1, hold = 1600): Keyframe[] => [
  kf(p, hold, 1000),
  kf({ ...p, hip: [p.hip[0], p.hip[1] - dy] }, 400, 1000),
];

// ================= standing and flowing (side) =================

const FEET: Pt = [80, FLOOR];
const stand = (arm: Limb = ang(95, 95)): Pose => ({
  hip: [80, STAND_HIP],
  torso: -90,
  arm,
  leg: pin(FEET, -1),
});
const armsUp = (): Pose => ({ ...stand(ang(-95, -95)), torso: -95 });
const fold = (): Pose => ({
  hip: [74, STAND_HIP + 1],
  torso: 30,
  arm: pin([77, FLOOR], 1),
  leg: pin(FEET, -1),
});
const halfLift = (): Pose => ({
  hip: [74, STAND_HIP + 1],
  torso: 8,
  arm: pin([102, FLOOR - 1], 1),
  leg: pin(FEET, -1),
});

// plank, low plank, upward dog, downward dog: one set of feet and hands
const P_FEET: Pt = [40, FLOOR];
const plankPose = (): Pose => ({
  hip: [70, FLOOR - 16],
  torso: -28,
  arm: pin([95, FLOOR], 1),
  leg: pin(P_FEET, 1),
});
const lowPlank = (): Pose => {
  const hip: Pt = [70.3, FLOOR - 7.6];
  const torso = -13;
  const sh = along(hip, SEG.torso, torso);
  return {
    hip,
    torso,
    arm: pin([sh[0] - SEG.upperArm, FLOOR], 1),
    leg: pin(P_FEET, 1),
  };
};
const upDog = (): Pose => ({
  hip: [70, FLOOR - 7],
  torso: -50,
  arm: pin([88, FLOOR], 1),
  leg: ang(178, 181),
});
const downDog = (hands: Pt = [116, FLOOR]): Pose => {
  const feet: Pt = [58, FLOOR];
  const hip: Pt = [70, FLOOR - 31];
  return {
    hip,
    torso: toward(hip, hands),
    arm: pin(hands, 1),
    leg: pin(feet, 1),
  };
};

export function halfSunSalutation(): Demo {
  return side([
    kf(stand(), 300, 900),
    kf(armsUp(), 300, 1100),
    kf(fold(), 500, 800),
    kf(halfLift(), 400, 800),
    kf(fold(), 300, 1100),
    kf(armsUp(), 200, 900),
  ]);
}

export function sunSalutation(opts: { b?: boolean } = {}): Demo {
  const chair: Pose = {
    hip: [70, STAND_HIP + 12],
    torso: -70,
    arm: ang(-70, -70),
    leg: pin(FEET, -1),
  };
  const start = opts.b
    ? [kf(stand(), 300, 900), kf(chair, 500, 900)]
    : [kf(stand(), 300, 900), kf(armsUp(), 300, 900)];
  return side([
    ...start,
    kf(fold(), 300, 700),
    kf(halfLift(), 200, 700),
    kf(downDog(), 100, 700),
    kf(plankPose(), 300, 700),
    kf(lowPlank(), 300, 700),
    kf(upDog(), 500, 900),
    kf(downDog(), 900, 1000),
    kf(fold(), 200, 1000),
  ]);
}

export function vinyasa(opts: { jumpBack?: boolean } = {}): Demo {
  if (opts.jumpBack)
    return side([
      kf({ ...fold(), leg: pin(FEET, 1) }, 300, 450),
      kf(lowPlank(), 400, 700),
      kf(upDog(), 400, 800),
      kf(downDog(), 700, 900),
    ]);
  return side([
    kf(plankPose(), 400, 800),
    kf(lowPlank(), 400, 700),
    kf(upDog(), 500, 800),
    kf(downDog(), 900, 900),
  ]);
}

export function downwardDog(
  opts: { pedal?: boolean; dolphin?: boolean } = {},
): Demo {
  if (opts.dolphin) {
    // on the forearms: elbows down under the shoulders
    const hip: Pt = [66, FLOOR - 31];
    const p: Pose = {
      hip,
      torso: 35,
      arm: pin([103, FLOOR], 1),
      leg: pin([54, FLOOR], 1),
    };
    return side([
      kf(p, 1400, 900),
      kf({ ...p, hip: [65, FLOOR - 30] }, 500, 900),
    ]);
  }
  const d = downDog();
  if (!opts.pedal) return side(breathe(d, 1.5));
  // one heel lifts, the knee bends forward; then the other
  const a: Pose = {
    ...d,
    leg: pin([62, FLOOR - 4], -1),
    leg2: pin([58, FLOOR], 1),
  };
  const b: Pose = {
    ...d,
    leg: pin([58, FLOOR], 1),
    leg2: pin([62, FLOOR - 4], -1),
  };
  return side([kf(a, 300, 700), kf(b, 300, 700)]);
}

export function chaturanga(): Demo {
  return side([kf(plankPose(), 400, 1200), kf(lowPlank(), 1200, 900)]);
}

export function cobra(opts: { high?: boolean; swanDive?: boolean } = {}): Demo {
  const lie: Pose = {
    hip: [62, FLOOR - 4],
    torso: -3,
    arm: pin([80, FLOOR], 1),
    leg: ang(179, 180),
  };
  const up: Pose = {
    hip: [62, FLOOR - 4],
    torso: opts.high ? -42 : -26,
    arm: pin([opts.high ? 82 : 84, FLOOR], 1),
    leg: ang(179, 180),
  };
  if (opts.swanDive) {
    // rocking on the front: chest up and legs down, then legs up and chest down
    const rockUp: Pose = {
      hip: [66, FLOOR - 5],
      torso: -30,
      arm: ang(-30, -30),
      leg: ang(178, 180),
    };
    const rockDown: Pose = {
      hip: [66, FLOOR - 6],
      torso: -9,
      arm: ang(-24, -24),
      leg: ang(198, 198),
    };
    return side([kf(rockUp, 150, 500), kf(rockDown, 150, 500)]);
  }
  return side([kf(lie, 400, 1300), kf(up, 1500, 1100)]);
}

// ================= balances =================

// Tree, from the front: foot on the inner thigh, knee out, hands rising.
export function tree(): Demo {
  const hip: Pt = [CX + 2, STAND_HIP];
  const p = (arm: Limb): Pose => ({
    hip,
    torso: -90,
    arm,
    arm2: undefined,
    leg: ang(91, 90),
    leg2: pin([CX - 1, STAND_HIP + 15], 1),
  });
  return front([
    kf(p(ang(40, -140)), 600, 1200),
    kf(p(ang(-100, -80)), 2000, 1200),
  ]);
}

// Warrior II, from the front: front knee over the ankle, arms long to the sides.
export function warrior2(): Demo {
  const p = (y: number, arm: Limb): Pose => ({
    hip: [CX, y],
    torso: -90,
    arm,
    leg: pin([58, FLOOR], -1),
    leg2: pin([113, FLOOR], 1),
  });
  return front([
    kf(p(88, ang(100, 95)), 400, 1100),
    kf(p(91, ang(180, 180)), 2000, 1100),
  ]);
}

// Warrior III: hinged on one leg, arms and the back leg in one line.
export function warrior3(): Demo {
  const tall: Pose = {
    hip: [80, STAND_HIP],
    torso: -90,
    arm: ang(-90, -90),
    leg: pin(FEET, -1),
    leg2: pin([71, FLOOR], 1),
  };
  const t: Pose = {
    hip: [80, STAND_HIP],
    torso: 2,
    arm: ang(2, 2),
    leg: pin(FEET, -1),
    leg2: ang(182, 182),
  };
  return side([kf(tall, 400, 1300), kf(t, 1800, 1100)]);
}

// Half moon, from the front: the body tips sideways over the standing leg.
export function halfMoon(): Demo {
  const p = (lift: number): Pose => ({
    hip: [96, STAND_HIP - 5],
    torso: 180,
    arm: ang(90, 90),
    arm2: ang(-90, -90),
    leg: pin([96, FLOOR], 1),
    leg2: ang(-lift, -lift),
  });
  return front([kf(p(-12), 400, 1100), kf(p(2), 1800, 1100)]);
}

// Eagle, from the front: knees bent, legs and arms wrapped.
export function eagle(): Demo {
  const p = (y: number): Pose => ({
    hip: [CX, y],
    torso: -90,
    arm: ang(35, -80),
    arm2: ang(150, -95),
    leg: pin([CX - 2, FLOOR], -1),
    leg2: ang(150, 70),
  });
  return front([
    kf(p(STAND_HIP + 3), 400, 1100),
    kf(p(STAND_HIP + 6), 1800, 1100),
  ]);
}

// Dancer: back foot held behind, chest forward, the other arm reaching.
export function dancer(): Demo {
  const hip: Pt = [80, STAND_HIP];
  const p = (thigh: number, torso: number): Pose => {
    const knee = along(hip, SEG.thigh, thigh);
    const foot = along(knee, SEG.shin, -80);
    return {
      hip,
      torso,
      arm: ang(-35, -35),
      arm2: pin(foot, 1),
      leg: pin(FEET, -1),
      leg2: ang(thigh, -80),
    };
  };
  return side([kf(p(160, -75), 400, 1200), kf(p(200, -60), 1800, 1200)]);
}

// Standing split: folded over the standing leg, the other leg high behind.
export function standingSplit(): Demo {
  const p = (lift: number): Pose => ({
    hip: [80, STAND_HIP],
    torso: 15,
    arm: pin([108, FLOOR], 1),
    leg: pin(FEET, -1),
    leg2: ang(lift, lift),
  });
  return side([kf(p(-160), 400, 1200), kf(p(-122), 1800, 1200)]);
}

// Extended hand-to-big-toe: one leg straight forward, the hand holding the foot.
export function handToToe(): Demo {
  const hip: Pt = [80, STAND_HIP];
  const p = (legAng: number): Pose => {
    const foot = along(hip, LEG, legAng);
    return {
      hip,
      torso: -52,
      arm: pin(foot, 1),
      arm2: ang(150, 150),
      leg: pin(FEET, -1),
      leg2: ang(legAng, legAng),
    };
  };
  return side([
    kf({ ...p(40), arm: ang(60, 60) }, 400, 1200),
    kf(p(0), 1800, 1200),
  ]);
}

// Garland: a deep squat, heels down, elbows inside the knees.
export function garland(): Demo {
  const p = (y: number): Pose => ({
    hip: [70, y],
    torso: -74,
    arm: ang(45, -70),
    leg: pin(FEET, -1),
  });
  return side(breathe(p(FLOOR - 11), 1.2));
}

// ================= core: boat, teaser, rolling =================

const SIT: Pt = [72, FLOOR - 1.5];
const vSit = (lean: number, legs: Limb, arm: Limb = ang(-25, -25)): Pose => ({
  hip: SIT,
  torso: -90 - lean,
  arm,
  leg: legs,
});

export function boat(opts: { bent?: boolean; build?: boolean } = {}): Demo {
  const bent = vSit(30, ang(-60, 5), ang(-5, -5));
  const full = vSit(35, ang(-42, -42), ang(-28, -28));
  if (opts.bent) return side(breathe(bent, 0.8));
  if (opts.build) return side([kf(bent, 500, 1100), kf(full, 1500, 1100)]);
  return side(breathe(full, 0.8));
}

// Teaser: from lying long to a V, and down again.
export function teaser(
  opts: { prep?: boolean; singleLeg?: boolean; hold?: boolean } = {},
): Demo {
  const lieLong: Pose = {
    hip: SIT,
    torso: 182,
    arm: ang(182, 182),
    leg: ang(-40, -40),
  };
  const v = vSit(35, ang(-42, -42), ang(-28, -28));
  if (opts.hold) return side(breathe(v, 0.8));
  if (opts.prep || opts.singleLeg) {
    // feet down (or one leg long), the upper body rolls up to the V and back
    const foot: Pt = [104, FLOOR];
    const down: Pose = {
      hip: SIT,
      torso: 182,
      arm: ang(-12, -12),
      leg: pin(foot, -1),
      leg2: opts.singleLeg ? ang(-40, -40) : pin(foot, -1),
    };
    const up: Pose = { ...down, torso: -125, arm: ang(-30, -30) };
    return side([kf(down, 300, 1400), kf(up, 1200, 1400)]);
  }
  return side([kf(lieLong, 300, 1500), kf(v, 1200, 1500)]);
}

// Rolling like a ball (and the seal): tucked, rocking back to the shoulders and up.
export function rolling(opts: { openLeg?: boolean } = {}): Demo {
  if (opts.openLeg) {
    const up: Pose = {
      hip: SIT,
      torso: -125,
      arm: ang(-45, -45),
      leg: ang(-50, -50),
    };
    const back: Pose = {
      hip: [76, FLOOR - 10],
      torso: 196,
      arm: ang(-110, -110),
      leg: ang(-120, -120),
    };
    return side([kf(up, 500, 700), kf(back, 150, 700)]);
  }
  const tuck = (hip: Pt, torso: number, thigh: number, shin: number): Pose => {
    const knee = along(hip, SEG.thigh, thigh);
    const ankle = along(knee, SEG.shin * 0.35, shin);
    return { hip, torso, arm: pin(ankle, -1), leg: ang(thigh, shin) };
  };
  return side([
    kf(tuck(SIT, -112, -62, 70), 500, 650),
    kf(tuck([80, FLOOR - 12], 192, -128, 5), 150, 650),
  ]);
}

// ================= on the back (Pilates mat) =================

const BACK_HIP: Pt = [88, FLOOR - 4];
const supine = (curl: number, arm: Limb, leg: Limb, leg2?: Limb): Pose => ({
  hip: BACK_HIP,
  torso: 180 + curl,
  arm,
  leg,
  leg2,
});
const KNEES_FEET: Pt = [114, FLOOR];
const kneesBent = pin(KNEES_FEET, -1);

export function chestLift(): Demo {
  return side([
    kf(supine(0, ang(-4, -4), kneesBent), 400, 1100),
    kf(supine(26, ang(-14, -14), kneesBent), 1000, 1100),
  ]);
}

export function breathingTilt(): Demo {
  return side([
    kf(supine(0, ang(0, 0), kneesBent), 600, 1600),
    kf(
      {
        ...supine(0, ang(0, 0), kneesBent),
        hip: [BACK_HIP[0], BACK_HIP[1] - 1.5],
      },
      600,
      1600,
    ),
  ]);
}

// The hundred: curled up, legs in tabletop / long, arms pumping by the sides.
export function hundred(legs: "tabletop" | "high" | "low"): Demo {
  const leg =
    legs === "tabletop"
      ? ang(-90, 0)
      : legs === "high"
        ? ang(-48, -48)
        : ang(-24, -24);
  const p = (pump: number): Pose =>
    supine(26, ang(-10 + pump, -10 + pump), leg);
  return side([kf(p(-4), 40, 220), kf(p(4), 40, 220)]);
}

// Single-leg stretch / criss-cross: one knee in, the other leg long, switch.
export function singleLegStretch(opts: { cross?: boolean } = {}): Demo {
  const bent = ang(-128, -20);
  const long = ang(-34, -34);
  const curl = opts.cross ? 34 : 26;
  const a = supine(curl, ang(-40, -10), bent, long);
  const b = supine(curl, ang(-40, -10), long, bent);
  return side([kf(a, 200, 600), kf(b, 200, 600)]);
}

export function doubleLegStretch(): Demo {
  const inn = supine(28, ang(-40, -10), ang(-128, -20));
  const out = supine(24, ang(200, 200), ang(-32, -32));
  return side([kf(inn, 300, 800), kf(out, 400, 900)]);
}

// Roll-up: from lying long, roll up through the spine to reach past the toes.
export function rollUp(
  opts: { half?: boolean; spineStretch?: boolean } = {},
): Demo {
  const sit: Pt = [70, FLOOR - 3];
  if (opts.half) {
    const foot: Pt = [98, FLOOR];
    const tall: Pose = {
      hip: sit,
      torso: -95,
      arm: ang(0, 0),
      leg: pin(foot, -1),
    };
    const back: Pose = {
      hip: sit,
      torso: -140,
      arm: ang(-10, -10),
      leg: pin(foot, -1),
    };
    return side([kf(tall, 300, 1300), kf(back, 700, 1300)]);
  }
  const long = ang(0, 0);
  const tall: Pose = { hip: sit, torso: -90, arm: ang(-5, -5), leg: long };
  const reach: Pose = { hip: sit, torso: -28, arm: ang(8, 8), leg: long };
  if (opts.spineStretch)
    return side([
      kf(tall, 500, 1500),
      kf({ ...reach, torso: -40 }, 1000, 1500),
    ]);
  const lie: Pose = { hip: sit, torso: 180, arm: ang(180, 180), leg: long };
  return side([
    kf(lie, 400, 1300),
    kf(tall, 0, 700),
    kf(reach, 700, 900),
    kf(tall, 0, 1300),
  ]);
}

// Roll-over, jackknife, control balance, plow: hips over the shoulders.
const OVER_SH: Pt = [56, FLOOR - 13];
const overhead = (torso: number, leg: Limb, leg2?: Limb): Pose => {
  const hip = along(OVER_SH, SEG.torso, torso + 180);
  return { hip, torso, arm: ang(10, 0), leg, leg2 };
};

export function plow(): Demo {
  return side(breathe(overhead(118, ang(140, 140)), 0.6));
}

export function rollOver(
  opts: { jackknife?: boolean; control?: boolean } = {},
): Demo {
  const up = supine(0, ang(0, 0), ang(-90, -90));
  const over = overhead(118, ang(140, 140));
  if (opts.control) {
    // over, then one leg rises to the ceiling while the other stays overhead
    return side([
      kf(over, 300, 1100),
      kf(overhead(118, ang(140, 140), ang(-84, -84)), 1200, 1100),
    ]);
  }
  if (opts.jackknife)
    return side([
      kf(up, 300, 1100),
      kf(over, 200, 900),
      kf(overhead(98, ang(-82, -82)), 900, 1100),
      kf(over, 200, 1300),
    ]);
  return side([kf(up, 300, 1200), kf(over, 700, 1200)]);
}

// Boomerang: roll over, then roll up into the teaser and reach back.
export function boomerang(): Demo {
  return side([
    kf(vSit(35, ang(-42, -42), ang(-28, -28)), 500, 1100),
    kf(supine(0, ang(0, 0), ang(-90, -90)), 0, 700),
    kf(overhead(118, ang(140, 140)), 400, 1300),
  ]);
}

// Leg circles and the corkscrew: legs to the ceiling, drawing a circle.
export function legCircles(opts: { both?: boolean } = {}): Demo {
  const at = (a: number): Pose =>
    opts.both
      ? supine(0, ang(0, 0), ang(a, a))
      : supine(0, ang(0, 0), ang(0, 0), ang(a, a));
  return side([
    kf(at(-78), 0, 450),
    kf(at(-96), 0, 450),
    kf(at(-112), 0, 450),
    kf(at(-92), 0, 450),
  ]);
}

export function figureFour(): Demo {
  // one foot down, the other ankle crossed over that knee; the knee comes toward the chest
  const p = (pull: number): Pose =>
    supine(
      4 + pull / 3,
      ang(-40 - pull, 10),
      pin([112 - pull, FLOOR], -1),
      ang(-50 - pull, 10 - pull / 2),
    );
  return side([kf(p(0), 600, 1200), kf(p(14), 1600, 1200)]);
}

export function happyBaby(): Demo {
  const p = (rock: number): Pose => {
    const knee = along(BACK_HIP, SEG.thigh, -140 + rock);
    const foot = along(knee, SEG.shin, -90);
    return { ...supine(14, pin(foot, -1), ang(-140 + rock, -90)) };
  };
  return side([kf(p(0), 800, 1100), kf(p(8), 800, 1100)]);
}

export function supineTwist(): Demo {
  return side([
    kf(supine(0, ang(-150, -150), ang(-90, 0)), 400, 1500),
    kf(supine(0, ang(-150, -150), ang(-20, 20)), 1800, 1500),
  ]);
}

export function savasana(): Demo {
  const p = supine(0, ang(8, 2), ang(0, 0));
  return side([
    kf(p, 1800, 1500),
    kf({ ...p, hip: [BACK_HIP[0], BACK_HIP[1] - 0.8] }, 800, 1500),
  ]);
}

// Shoulder bridge with kicks / bridge marches: hips up, one leg moving.
export function bridgeKick(opts: { march?: boolean } = {}): Demo {
  const feet: Pt = [98, FLOOR];
  const sh: Pt = [44, FLOOR - 3];
  const hip: Pt = [70, FLOOR - 20];
  const torso = toward(hip, sh);
  const p = (leg2: Limb): Pose => ({
    hip,
    torso,
    arm: ang(torso - 160, torso - 170),
    leg: pin(feet, -1),
    leg2,
  });
  if (opts.march)
    return side([
      kf(p(pin(feet, -1)), 200, 600),
      kf(p(ang(-70, 20)), 300, 600),
    ]);
  return side([kf(p(ang(-80, -80)), 200, 800), kf(p(ang(-10, -10)), 300, 800)]);
}

// ================= face down =================

const PRONE_HIP: Pt = [60, FLOOR - 4];
export function locust(): Demo {
  const p = (lift: number): Pose => ({
    hip: PRONE_HIP,
    torso: -lift,
    arm: ang(180 - lift, 180 - lift),
    leg: ang(180 + lift * 0.7, 180 + lift * 0.7),
  });
  return side([kf(p(2), 400, 1100), kf(p(16), 1500, 1100)]);
}

export function swimming(): Demo {
  const p = (s: number): Pose => ({
    hip: PRONE_HIP,
    torso: -12,
    arm: ang(-14 + s, -14 + s),
    arm2: ang(-14 - s, -14 - s),
    leg: ang(188 + s, 188 + s),
    leg2: ang(188 - s, 188 - s),
  });
  return side([kf(p(7), 40, 260), kf(p(-7), 40, 260)]);
}

export function bow(): Demo {
  const hip: Pt = [70, FLOOR - 6];
  const p = (torso: number, thigh: number): Pose => {
    const knee = along(hip, SEG.thigh, thigh);
    const foot = along(knee, SEG.shin, -50);
    return { hip, torso, arm: pin(foot, 1), leg: ang(thigh, -50) };
  };
  return side([kf(p(-30, 190), 400, 1200), kf(p(-40, 200), 1600, 1200)]);
}

// Single- and double-leg kicks: on the forearms (or face down), heels to the glutes.
export function legKick(opts: { double?: boolean } = {}): Demo {
  const elbowsDown: Pose = {
    hip: [58, FLOOR - 4],
    torso: -22,
    arm: pin([90, FLOOR], 1),
    leg: ang(179, 180),
  };
  if (opts.double) {
    const kick: Pose = {
      hip: [58, FLOOR - 4],
      torso: -4,
      arm: ang(170, 175),
      leg: ang(180, -70),
    };
    const lift: Pose = {
      hip: [58, FLOOR - 4],
      torso: -22,
      arm: ang(165, 168),
      leg: ang(182, 182),
    };
    return side([
      kf(kick, 150, 500),
      kf({ ...kick, leg: ang(180, -20) }, 50, 500),
      kf(kick, 100, 900),
      kf(lift, 700, 900),
    ]);
  }
  return side([
    kf({ ...elbowsDown, leg2: ang(180, -80) }, 150, 450),
    kf({ ...elbowsDown, leg: ang(180, -80), leg2: ang(179, 180) }, 150, 450),
  ]);
}

// Leg pull front (plank, one leg lifting) and back (reverse plank, kicking up).
export function legPull(opts: { back?: boolean } = {}): Demo {
  if (opts.back) {
    const heels: Pt = [112, FLOOR];
    const hip: Pt = [82, FLOOR - 16];
    const sh = along(heels, LEG + SEG.torso, toward(heels, hip));
    const torso = toward(hip, sh);
    const p = (leg2: Limb): Pose => ({
      hip,
      torso,
      arm: pin([sh[0], FLOOR], -1),
      leg: pin(heels, 1),
      leg2,
    });
    return side([
      kf(p(pin(heels, 1)), 300, 700),
      kf(p(ang(-50, -50)), 300, 700),
    ]);
  }
  const p = plankPose();
  return side([
    kf({ ...p, leg2: pin(P_FEET, 1) }, 300, 700),
    kf({ ...p, leg2: ang(195, 195) }, 300, 700),
  ]);
}

// ================= kneeling, lunging, splitting =================

export function camel(): Demo {
  const knee: Pt = [70, FLOOR - 1];
  const upright: Pose = {
    hip: [71, FLOOR - 18],
    torso: -90,
    arm: ang(95, 95),
    leg: ang(toward([71, FLOOR - 18], knee), 180),
  };
  const hip: Pt = [77, FLOOR - 16];
  const arch: Pose = {
    hip,
    torso: -148,
    arm: pin([54, FLOOR - 2], 1),
    leg: ang(toward(hip, knee), 180),
  };
  return side([kf(upright, 400, 1400), kf(arch, 1600, 1400)]);
}

// Wheel prep: hips up, the crown of the head resting on the floor.
export function wheelPrep(): Demo {
  const feet: Pt = [100, FLOOR];
  const p = (hipY: number, torso: number): Pose => ({
    hip: [86, hipY],
    torso,
    arm: pin([50, FLOOR], 1),
    leg: pin(feet, -1),
  });
  return side([kf(p(86, 160), 400, 1200), kf(p(82, 150), 1500, 1200)]);
}

export function lowLunge(): Demo {
  const front: Pt = [100, FLOOR];
  const knee: Pt = [56, FLOOR - 1];
  const p = (hip: Pt, arm: Limb, torso: number): Pose => ({
    hip,
    torso,
    arm,
    leg: pin(front, -1),
    leg2: ang(toward(hip, knee), 180),
  });
  return side([
    kf(p([70, FLOOR - 15], ang(95, 95), -88), 400, 1200),
    kf(p([74, FLOOR - 13], ang(-92, -92), -92), 1600, 1200),
  ]);
}

export function lizard(): Demo {
  const p = (torso: number, y: number): Pose => ({
    hip: [70, y],
    torso,
    arm: pin([96, FLOOR], -1),
    leg: pin([100, FLOOR], -1),
    leg2: ang(165, 180),
  });
  return side([
    kf(p(-30, FLOOR - 13), 400, 1300),
    kf(p(-10, FLOOR - 11), 1600, 1300),
  ]);
}

export function halfSplit(): Demo {
  const knee: Pt = [60, FLOOR - 1];
  const hip: Pt = [61, FLOOR - 17];
  const p = (torso: number): Pose => ({
    hip,
    torso,
    arm: pin([86, FLOOR], 1),
    leg: ang(28, 28),
    leg2: ang(toward(hip, knee), 180),
  });
  return side([
    kf({ ...p(-62), arm: ang(80, 80) }, 400, 1300),
    kf(p(-22), 1600, 1300),
  ]);
}

export function frontSplit(opts: { supported?: boolean } = {}): Demo {
  if (opts.supported) {
    const blocks: Prop[] = [
      floor,
      { kind: "box", x: 76, y: FLOOR - 12, w: 10, h: 12 },
    ];
    const p = (y: number, a: number): Pose => ({
      hip: [80, y],
      torso: -90,
      arm: pin([81, FLOOR - 12], 1),
      leg: ang(a, a),
      leg2: ang(180 - a, 180 - a),
    });
    return {
      viewBox: VB,
      props: blocks,
      frames: [
        kf(p(FLOOR - 12.5, 23), 400, 1400),
        kf(p(FLOOR - 12, 20), 1600, 1400),
      ],
    };
  }
  const p = (y: number, a: number): Pose => ({
    hip: [80, y],
    torso: -90,
    arm: ang(-90, -90),
    leg: ang(a, a),
    leg2: ang(180 - a, 180 - a),
  });
  return side([
    kf(p(FLOOR - 12, 20), 400, 1400),
    kf(p(FLOOR - 4, 6), 1800, 1400),
  ]);
}

// Standing forward fold: from tall, hinge and hang.
export function forwardFold(): Demo {
  return side([kf(stand(), 300, 1300), kf(fold(), 1800, 1300)]);
}

// Middle split, from the front: the legs open to the sides.
export function straddle(): Demo {
  const p = (a: number, arm: Limb, torso = -90): Pose => {
    const y = FLOOR - LEG * Math.sin(((180 - a) * Math.PI) / 180) + 0.5;
    return { hip: [CX, y], torso, arm, leg: ang(a, a) };
  };
  return front([
    kf(p(140, ang(110, 100)), 400, 1400),
    kf(p(160, ang(115, 105)), 1600, 1400),
  ]);
}

// ================= seated =================

export function seatedHeadToKnee(): Demo {
  const p = (torso: number): Pose => ({
    hip: [64, FLOOR - 3],
    torso,
    arm: ang(8, 8),
    leg: ang(0, 0),
    leg2: ang(-14, 172),
  });
  return side([kf(p(-80), 400, 1300), kf(p(-22), 1600, 1300)]);
}

export function butterfly(): Demo {
  const p = (flap: number): Pose => ({
    hip: [CX, FLOOR - 3],
    torso: -90,
    arm: pin([CX - 3, FLOOR - 4], 1),
    leg: ang(194 + flap, 16 + flap),
  });
  return front([kf(p(0), 200, 600), kf(p(10), 200, 600)]);
}

export function lotus(opts: { half?: boolean } = {}): Demo {
  const p: Pose = {
    hip: [CX, FLOOR - 3],
    torso: -90,
    arm: ang(115, 70),
    leg: ang(176, -12),
    leg2: opts.half ? ang(4, 176) : undefined,
  };
  return front(breathe(p, 0.8, 1800));
}

export function pigeon(): Demo {
  const p = (torso: number, arm: Limb): Pose => ({
    hip: [72, FLOOR - 6],
    torso,
    arm,
    leg: ang(14, 172),
    leg2: ang(178, 180),
  });
  return side([
    kf(p(-88, ang(100, 92)), 400, 1500),
    kf(p(-12, pin([102, FLOOR], 1)), 1800, 1500),
  ]);
}

// Spine twist and the saw: sitting tall, the arms show the turn.
export function spineTwist(opts: { saw?: boolean } = {}): Demo {
  const hip: Pt = [64, FLOOR - 3];
  const long = ang(0, 0);
  if (opts.saw) {
    const tall: Pose = {
      hip,
      torso: -90,
      arm: ang(0, 0),
      arm2: ang(180, 180),
      leg: long,
    };
    const sawP: Pose = {
      hip,
      torso: -38,
      arm: ang(18, 18),
      arm2: ang(200, 210),
      leg: long,
    };
    return side([kf(tall, 300, 1000), kf(sawP, 700, 1000)]);
  }
  // 178, not 180: the arms swing round low, never up through the head
  const a: Pose = {
    hip,
    torso: -90,
    arm: ang(0, 0),
    arm2: ang(178, 178),
    leg: long,
  };
  const b: Pose = {
    hip,
    torso: -90,
    arm: ang(178, 178),
    arm2: ang(0, 0),
    leg: long,
  };
  return side([kf(a, 500, 900), kf(b, 500, 900)]);
}

// Mermaid, from the front: sitting, one arm over the head, bending sideways.
export function mermaid(): Demo {
  const p = (bend: number): Pose => ({
    hip: [CX, FLOOR - 3],
    torso: -90 - bend,
    arm: pin([54, FLOOR], 1),
    arm2: ang(-110 - bend, -150 - bend),
    leg: ang(176, -12),
  });
  return front([
    kf({ ...p(0), arm: ang(100, 95) }, 400, 1300),
    kf(p(28), 1500, 1300),
  ]);
}

// ================= on the side (front view, head to the left) =================

const SIDE_HIP: Pt = [96, FLOOR - 8];
const sideLying = (top: Limb, bottom: Limb = ang(0, 0)): Pose => ({
  hip: SIDE_HIP,
  torso: 180,
  arm: ang(180, 180),
  arm2: ang(10, 10),
  leg: bottom,
  leg2: top,
});

export function sideLegLift(opts: { kick?: boolean } = {}): Demo {
  if (opts.kick)
    return front([
      kf(sideLying(ang(-22, -22)), 200, 600),
      kf(sideLying(ang(8, 8)), 200, 600),
    ]);
  return front([
    kf(sideLying(ang(0, 0)), 200, 800),
    kf(sideLying(ang(-26, -26)), 300, 800),
  ]);
}

export function clamshell(): Demo {
  const bent = ang(12, 192);
  return front([
    kf(sideLying(ang(40, 190), bent), 200, 800),
    kf(sideLying(ang(-5, 145), bent), 400, 800),
  ]);
}

export function kneelingSideKick(): Demo {
  const p = (lift: number): Pose => ({
    hip: [86, FLOOR - 21],
    torso: -150,
    arm: pin([52, FLOOR], 1),
    arm2: ang(-130, -40),
    leg: ang(96, 178),
    leg2: ang(-lift, -lift),
  });
  return front([kf(p(-6), 200, 700), kf(p(14), 300, 700)]);
}

// Headstand: crown and forearms down, hips stacked over the shoulders.
export function headstand(
  opts: { wall?: boolean; tuck?: boolean; lowers?: boolean } = {},
): Demo {
  const sh: Pt = [78, FLOOR - 15];
  const hip: Pt = [sh[0], sh[1] - SEG.torso];
  const p = (leg: Limb, dx = 0): Pose => ({
    hip: [hip[0] + dx, hip[1]],
    torso: 90,
    arm: pin([sh[0] - 14, FLOOR], -1),
    leg,
  });
  const tuck = ang(-150, 60);
  if (opts.tuck)
    return side([kf(p(ang(-170, 80)), 400, 1100), kf(p(tuck), 1500, 1100)]);
  if (opts.lowers)
    return side([
      kf(p(ang(-90, -90)), 500, 1600),
      kf(p(ang(-165, -165)), 300, 1600),
    ]);
  const up = p(ang(-90, -90));
  if (opts.wall)
    return side(
      [kf(p(tuck), 400, 1200), kf({ ...up, leg: ang(-86, -86) }, 1800, 1200)],
      [floor, { kind: "wall", x: 86, y1: 20, y2: FLOOR }],
    );
  return side([kf(p(tuck), 400, 1300), kf(up, 1800, 1300)]);
}
