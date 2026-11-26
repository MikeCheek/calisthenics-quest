import { Demo } from "./figure";
import * as T from "./templates";
import * as T2 from "./templates2";
import * as T3 from "./templates3";
import * as T4 from "./templates4";
import type { Variant } from "./templates";

// ---------------------------------------------------------------------------
// Exercise name -> demonstration + common mistakes.
//
// Rules run in order, most specific first; the first match wins. Mistakes
// belong to the movement family, so every exercise built on the same
// movement shares one well-reviewed list (translated in phrases.it.ts).
// ---------------------------------------------------------------------------

export type Family =
  | "pullUp" | "hang" | "legRaise" | "row" | "muscleUp" | "germanHang" | "frontLever" | "backLever"
  | "pushUp" | "pike" | "dip" | "support" | "handstand" | "hspu" | "planche" | "plancheLean" | "lSit"
  | "squat" | "pistol" | "lunge" | "nordic" | "bridge" | "plank" | "hollow" | "superman" | "dragonFlag"
  | "flag" | "calf" | "gluteBridge"
  | "cross" | "crow" | "elbowLever" | "monkeyBars" | "rope" | "jump" | "rdl"
  | "jacks" | "armCircles" | "pullApart" | "hipCircles" | "catCow" | "childsPose" | "hipFlexor" | "worldsGreatest" | "fold"
  | "legSwings" | "highKnees" | "climbers" | "burpee" | "prone" | "wrists" | "chestOpener" | "stretch"
  | "flow" | "downDog" | "balance" | "backbend" | "split" | "seated" | "inversion" | "curl" | "rolling" | "sideLying" | "rest"
  | "kipUp" | "flip" | "barSpin" | "getUp";

export const MISTAKES: Record<Family, string[]> = {
  pullUp: ["Kipping or swinging to get up", "Half reps — not starting from a full hang", "Shrugging: shoulders up by the ears at the bottom"],
  hang: ["Fully relaxed, collapsed shoulders", "Bent arms", "Swinging"],
  legRaise: ["Swinging for momentum", "Dropping the legs without control", "Shrugged shoulders"],
  row: ["Hips sagging — keep the body in one line", "Pushing the chin forward to reach the bar", "Stopping short of the chest touching the bar"],
  muscleUp: ["Pulling too low — the bar should reach the lower chest", "One arm turning over before the other", "Too much kip in the strict version"],
  germanHang: ["Dropping in fast", "Bending the arms", "Going deeper than the shoulders comfortably allow"],
  frontLever: ["Hips piking or sagging below the line", "Bent arms — keep the elbows locked", "Losing the hollow body / holding the breath"],
  backLever: ["Arching the lower back", "Bent arms", "Hips dropping below the shoulder line"],
  pushUp: ["Hips sagging or piking", "Elbows flared straight out to the sides", "Partial range — chest not near the floor"],
  pike: ["Hips dropping — keep them high", "Head landing in front of the hands instead of forming a triangle", "Elbows flaring out"],
  dip: ["Shoulders shrugging up at the top", "Going so deep the front of the shoulder hurts", "Swinging the legs for momentum"],
  support: ["Shrugged shoulders", "Bent elbows", "Swinging"],
  handstand: ["Banana back — ribs flared, lower back arched", "Bent arms or relaxed shoulders (push the floor away)", "Looking too far forward or back — keep the head neutral"],
  hspu: ["Head landing too far in front of the hands", "Elbows flaring wide", "Kicking off the wall for momentum"],
  planche: ["Bent arms", "Shoulders not leaning far enough past the hands", "Losing the rounded, protracted upper back"],
  plancheLean: ["Not leaning far enough forward", "Bent elbows", "Hips sagging"],
  lSit: ["Collapsed shoulders — push down hard", "Legs drooping below horizontal", "Bent knees in the full version"],
  squat: ["Knees caving inward", "Heels lifting", "Rounding the lower back at the bottom"],
  pistol: ["Heel lifting off the floor", "Knee caving in", "Collapsing at the bottom instead of controlling the descent"],
  lunge: ["Front knee caving in", "Torso collapsing forward", "Too short a step"],
  nordic: ["Bending at the hips instead of staying straight from knee to head", "Dropping fast at the end without control", "Heels not anchored firmly"],
  bridge: ["Bent elbows", "Pushing mostly with the legs, shoulders not opening", "Feet too far from the hands"],
  plank: ["Hips sagging", "Hips too high", "Holding the breath"],
  hollow: ["Lower back lifting off the floor", "Chin jutting forward", "Lowering the legs further than you can keep the back down"],
  superman: ["Cranking the neck up", "Bent knees", "Holding the breath"],
  dragonFlag: ["Bending at the hips", "Dropping fast instead of lowering slowly", "Resting on the neck instead of the upper back"],
  flag: ["Bottom arm bending — push hard", "Hips dropping", "Hands too close together on the pole"],
  gluteBridge: ["Pushing through the toes instead of the heels", "Arching the lower back at the top instead of squeezing the glutes", "Hips dropping on one side (single-leg)"],
  calf: ["Bouncing instead of pausing at the top", "Partial range", "Rolling onto the outside of the foot"],
  cross: ["Bent arms — the cross is a straight-arm hold", "Rings drifting forward instead of out to the sides", "Shoulders shrugging up to the ears"],
  crow: ["Looking straight down — look a little forward", "Elbows flaring out", "Jumping into it instead of leaning"],
  elbowLever: ["Elbows not tucked into the hips", "Hips piking up or legs dropping", "Leaning too far forward onto the face"],
  monkeyBars: ["Stopping to rest between bars", "Bent, tired arms — hang long between grabs", "Reaching without using the swing"],
  rope: ["Pulling only with the arms when the legs could help", "Letting go of the leg lock on the way down", "Sliding down fast — hand over hand"],
  jump: ["Landing with straight knees", "Knees caving in on the landing", "No arm swing"],
  rdl: ["Rounding the lower back", "Hips opening to the side", "Standing knee locked straight"],
  jacks: ["Landing heavy on the heels", "Half-height arms", "Holding the breath"],
  armCircles: ["Shrugging the shoulders up", "Huge fast circles too soon", "Bending the elbows"],
  pullApart: ["Shrugging instead of squeezing the shoulder blades", "Bending the elbows", "Arching the lower back"],
  hipCircles: ["Moving the shoulders instead of the hips", "Tiny circles", "Locked knees"],
  catCow: ["Moving only the neck", "Rushing — breathe with each position", "Shifting the weight off the hands"],
  childsPose: ["Forcing the hips down", "Shrugging the shoulders", "Holding the breath"],
  hipFlexor: ["Arching the lower back instead of tucking the pelvis", "Back knee on a hard floor — pad it", "Leaning forward"],
  worldsGreatest: ["Back knee collapsing to the floor", "Rotating from the lower back only", "Rushing through it"],
  fold: ["Rounding hard from the upper back only", "Bouncing", "Locking the knees hard"],
  legSwings: ["Swinging the torso along with the leg", "Too big too soon", "Standing knee bent"],
  highKnees: ["Knees below hip height", "Leaning back", "Landing on the heels"],
  climbers: ["Hips bouncing up", "Shoulders behind the hands", "Toes not landing under the hips"],
  burpee: ["Hips sagging in the plank", "Landing the jump with straight knees", "Rushing the squat-back"],
  prone: ["Lifting with the lower back", "Shrugging", "Bending the elbows"],
  wrists: ["Rushing — wrists like slow, steady warm-up", "Fingers lifting off the floor", "Going past mild discomfort"],
  chestOpener: ["Shrugging the shoulder", "Twisting the lower back to fake range", "Hand too high on the wall"],
  stretch: ["Bouncing", "Going to pain instead of a mild pull", "Holding the breath"],
  flow: ["Rushing — one breath per movement", "Collapsing the lower back in the low plank", "Shoulders dropping toward the floor in upward dog"],
  downDog: ["Rounding the back to get the heels down — bend the knees instead", "Shoulders sinking toward the ears", "Weight only in the hands"],
  balance: ["Locking the standing knee", "Staring at a moving point — fix the gaze", "Hip of the lifted leg hiking up"],
  backbend: ["Bending only from the lower back", "Squeezing the neck back", "Knees splaying out"],
  split: ["Hips twisting open", "Forcing the last inch", "Back knee on a hard floor — pad it"],
  seated: ["Rounding to fake the range — lengthen first", "Forcing the knees down", "Holding the breath"],
  inversion: ["Weight on the head instead of the forearms", "Kicking up instead of walking the feet in", "Arching the lower back"],
  curl: ["Pulling on the neck", "Lower back lifting off the mat", "Legs lower than you can keep the back down"],
  rolling: ["Using momentum to sit back up", "Rolling onto the neck", "Losing the shape halfway"],
  sideLying: ["Rolling back onto the hips", "Moving the waist instead of the leg", "Collapsing the bottom shoulder"],
  rest: ["Fidgeting — let the floor hold you", "Holding tension in the jaw and shoulders", "Skipping it"],
  kipUp: ["Kicking forward instead of up", "Pushing late — the hands push as the legs kick", "Landing with the feet too far in front of the hips"],
  flip: ["Throwing the head back before the jump", "Jumping backward instead of up", "Opening the tuck too late — spot the floor early"],
  barSpin: ["Bent arms", "Letting the hips drift off the bar", "Losing the hollow shape as you turn"],
  getUp: ["Taking the eyes off the weight", "Letting the loaded arm drift off vertical", "Rushing the hip bridge and the leg sweep"],
};

function variantOf(name: string): Variant {
  if (/adv(\.|anced)?\s*tuck/i.test(name)) return "advTuck";
  if (/one[- ]leg/i.test(name)) return "oneLeg";
  if (/tuck/i.test(name)) return "tuck";
  if (/straddle/i.test(name)) return "straddle";
  return "full";
}

interface Rule {
  test: RegExp;
  family: Family;
  build: (name: string) => Demo;
}

// Yoga and Pilates names first: they reuse words like "bridge", "plank", "cross"
const SPORT_RULES: Rule[] = [
  { test: /half sun salutation/i, family: "flow", build: () => T3.halfSunSalutation() },
  { test: /sun salutation b/i, family: "flow", build: () => T3.sunSalutation({ b: true }) },
  { test: /sun salutation/i, family: "flow", build: () => T3.sunSalutation() },
  { test: /vinyasa/i, family: "flow", build: () => T3.vinyasa() },
  { test: /jump back to chaturanga/i, family: "flow", build: () => T3.vinyasa({ jumpBack: true }) },
  { test: /chaturanga/i, family: "flow", build: () => T3.chaturanga() },
  { test: /downward dog pedal/i, family: "downDog", build: () => T3.downwardDog({ pedal: true }) },
  { test: /downward dog/i, family: "downDog", build: () => T3.downwardDog() },
  { test: /dolphin/i, family: "downDog", build: () => T3.downwardDog({ dolphin: true }) },
  { test: /cobra|swan prep/i, family: "backbend", build: () => T3.cobra() },
  { test: /swan dive/i, family: "backbend", build: () => T3.cobra({ swanDive: true }) },
  { test: /^swan$/i, family: "backbend", build: () => T3.cobra({ high: true }) },
  { test: /tree pose/i, family: "balance", build: () => T3.tree() },
  { test: /warrior ii\b/i, family: "balance", build: () => T3.warrior2() },
  { test: /warrior iii/i, family: "balance", build: () => T3.warrior3() },
  { test: /eagle pose/i, family: "balance", build: () => T3.eagle() },
  { test: /half moon/i, family: "balance", build: () => T3.halfMoon() },
  { test: /dancer pose/i, family: "balance", build: () => T3.dancer() },
  { test: /standing split/i, family: "balance", build: () => T3.standingSplit() },
  { test: /hand-to-big-toe/i, family: "balance", build: () => T3.handToToe() },
  { test: /garland/i, family: "stretch", build: () => T3.garland() },
  { test: /firefly|eight-angle/i, family: "crow", build: () => T2.crowStand() },
  { test: /boat pose/i, family: "curl", build: () => T3.boat({ build: true }) },
  { test: /boat hold/i, family: "curl", build: () => T3.boat() },
  { test: /single-leg teaser/i, family: "curl", build: () => T3.teaser({ singleLeg: true }) },
  { test: /teaser prep/i, family: "curl", build: () => T3.teaser({ prep: true }) },
  { test: /teaser hold/i, family: "curl", build: () => T3.teaser({ hold: true }) },
  { test: /teaser/i, family: "curl", build: () => T3.teaser() },
  { test: /forearm plank/i, family: "plank", build: () => T.plank() },
  { test: /headstand leg lowers/i, family: "inversion", build: () => T3.headstand({ lowers: true }) },
  { test: /headstand tuck/i, family: "inversion", build: () => T3.headstand({ tuck: true }) },
  { test: /headstand at the wall/i, family: "inversion", build: () => T3.headstand({ wall: true }) },
  { test: /freestanding headstand/i, family: "inversion", build: () => T3.headstand() },
  { test: /bridge pose|pelvic curl/i, family: "gluteBridge", build: () => T.gluteBridge({ singleLeg: false }) },
  { test: /single-leg bridge/i, family: "gluteBridge", build: () => T.gluteBridge({ singleLeg: true }) },
  { test: /bridge marches/i, family: "gluteBridge", build: () => T3.bridgeKick({ march: true }) },
  { test: /shoulder bridge/i, family: "gluteBridge", build: () => T3.bridgeKick() },
  { test: /locust/i, family: "backbend", build: () => T3.locust() },
  { test: /camel/i, family: "backbend", build: () => T3.camel() },
  { test: /wheel prep/i, family: "backbend", build: () => T3.wheelPrep() },
  { test: /wheel pose/i, family: "bridge", build: () => T.bridge() },
  { test: /bow pose/i, family: "backbend", build: () => T3.bow() },
  { test: /low lunge/i, family: "hipFlexor", build: () => T3.lowLunge() },
  { test: /half split/i, family: "split", build: () => T3.halfSplit() },
  { test: /lizard/i, family: "split", build: () => T3.lizard() },
  { test: /supported front split/i, family: "split", build: () => T3.frontSplit({ supported: true }) },
  { test: /front split/i, family: "split", build: () => T3.frontSplit() },
  { test: /middle split/i, family: "split", build: () => T3.straddle() },
  { test: /(standing|wide-legged) forward fold/i, family: "fold", build: () => T3.forwardFold() },
  { test: /head-to-knee/i, family: "seated", build: () => T3.seatedHeadToKnee() },
  { test: /plow/i, family: "inversion", build: () => T3.plow() },
  { test: /figure-four/i, family: "stretch", build: () => T3.figureFour() },
  { test: /butterfly/i, family: "seated", build: () => T3.butterfly() },
  { test: /pigeon/i, family: "split", build: () => T3.pigeon() },
  { test: /happy baby/i, family: "stretch", build: () => T3.happyBaby() },
  { test: /half lotus/i, family: "seated", build: () => T3.lotus({ half: true }) },
  { test: /full lotus/i, family: "seated", build: () => T3.lotus() },
  { test: /supine twist/i, family: "stretch", build: () => T3.supineTwist() },
  { test: /savasana/i, family: "rest", build: () => T3.savasana() },
  { test: /chest lift/i, family: "curl", build: () => T3.chestLift() },
  { test: /hundred \(tabletop/i, family: "curl", build: () => T3.hundred("tabletop") },
  { test: /hundred \(low/i, family: "curl", build: () => T3.hundred("low") },
  { test: /^hundred$/i, family: "curl", build: () => T3.hundred("high") },
  { test: /single-leg stretch/i, family: "curl", build: () => T3.singleLegStretch() },
  { test: /criss-cross/i, family: "curl", build: () => T3.singleLegStretch({ cross: true }) },
  { test: /double-leg stretch/i, family: "curl", build: () => T3.doubleLegStretch() },
  { test: /half roll-back/i, family: "rolling", build: () => T3.rollUp({ half: true }) },
  { test: /roll-up/i, family: "rolling", build: () => T3.rollUp() },
  { test: /spine stretch forward/i, family: "seated", build: () => T3.rollUp({ spineStretch: true }) },
  { test: /roll-over/i, family: "rolling", build: () => T3.rollOver() },
  { test: /jackknife/i, family: "rolling", build: () => T3.rollOver({ jackknife: true }) },
  { test: /control balance/i, family: "rolling", build: () => T3.rollOver({ control: true }) },
  { test: /boomerang/i, family: "rolling", build: () => T3.boomerang() },
  { test: /rolling like a ball|^seal$/i, family: "rolling", build: () => T3.rolling() },
  { test: /open-leg rocker/i, family: "rolling", build: () => T3.rolling({ openLeg: true }) },
  { test: /corkscrew/i, family: "curl", build: () => T3.legCircles({ both: true }) },
  { test: /single-leg circles/i, family: "curl", build: () => T3.legCircles() },
  { test: /swimming/i, family: "prone", build: () => T3.swimming() },
  { test: /single-leg kick/i, family: "prone", build: () => T3.legKick() },
  { test: /double-leg kick/i, family: "prone", build: () => T3.legKick({ double: true }) },
  { test: /side-lying leg lifts/i, family: "sideLying", build: () => T3.sideLegLift() },
  { test: /side kick front and back/i, family: "sideLying", build: () => T3.sideLegLift({ kick: true }) },
  { test: /clamshell/i, family: "sideLying", build: () => T3.clamshell() },
  { test: /kneeling side kick/i, family: "sideLying", build: () => T3.kneelingSideKick() },
  { test: /side bend \(mermaid\)/i, family: "seated", build: () => T3.mermaid() },
  { test: /leg pull front/i, family: "plank", build: () => T3.legPull() },
  { test: /leg pull back/i, family: "plank", build: () => T3.legPull({ back: true }) },
  { test: /breathing with pelvic tilts/i, family: "rest", build: () => T3.breathingTilt() },
  { test: /spine twist/i, family: "seated", build: () => T3.spineTwist() },
  { test: /^saw$/i, family: "seated", build: () => T3.spineTwist({ saw: true }) },
];

// Exercises that need a specific drawing — checked before the general
// rules, which would match them by a word in their name
const SPECIFIC_RULES: Rule[] = [
  { test: /door frame rows|towel door rows/i, family: "row", build: () => T4.doorRow() },
  { test: /chair dips/i, family: "dip", build: () => T4.chairDip() },
  { test: /one-arm pull-up, other hand on wrist/i, family: "pullUp", build: () => T2.pullUpFront({ oneArm: true }) },
  { test: /nordic curl (with push-up catch|to push-up)/i, family: "nordic", build: () => T.nordic() },
  { test: /side plank hip dips/i, family: "plank", build: () => T4.sidePlank({ dips: true }) },
  { test: /side plank with leg raised|single-leg extended side plank/i, family: "plank", build: () => T4.sidePlank({ legUp: true }) },
  { test: /copenhagen|adductor plank/i, family: "plank", build: () => T4.sidePlank({ copenhagen: true }) },
  { test: /side plank/i, family: "plank", build: () => T4.sidePlank() },
  { test: /reverse plank/i, family: "plank", build: () => T4.reversePlank() },
  { test: /^lying leg raises/i, family: "legRaise", build: () => T4.lyingLegRaise() },
  { test: /side-lying leg raises|adductor squeezes/i, family: "sideLying", build: () => T3.sideLegLift() },
  { test: /sissy squat/i, family: "squat", build: () => T4.sissySquat() },
  { test: /cossack|lateral lunge/i, family: "lunge", build: () => T4.cossack() },
  { test: /hollow-to-arch swing|bar swing|partial rotation swings/i, family: "hang", build: (n) => (/partial/i.test(n) ? T4.giant({ partial: true }) : T4.barSwing()) },
  { test: /l-sit holds during dead hang/i, family: "lSit", build: () => T4.hangingLSit() },
  { test: /wall walks?\b/i, family: "handstand", build: () => T4.wallWalk() },
  { test: /kick-ups?\b|kick-up attempts/i, family: "handstand", build: () => T4.kickUp() },
  { test: /vertical pole holds/i, family: "flag", build: () => T4.poleLean() },
  { test: /archer push-ups?/i, family: "pushUp", build: (n) => T.pushUp({ archer: true, slow: /deep/i.test(n) }) },
  { test: /one-arm push-ups?/i, family: "pushUp", build: (n) => T.pushUp({ oneArm: true, slow: /negative/i.test(n) }) },
  { test: /one-leg extensions from tuck|elbow-lever entry|elbow lever (presses|to handstand)/i, family: "elbowLever", build: () => T2.crowStand({ elbowLever: true, shape: "entry" }) },
  { test: /tuck elbow lever/i, family: "elbowLever", build: () => T2.crowStand({ elbowLever: true, shape: "tuck" }) },
  { test: /straddle elbow lever/i, family: "elbowLever", build: () => T2.crowStand({ elbowLever: true, shape: "straddle" }) },
  { test: /full elbow lever/i, family: "elbowLever", build: () => T2.crowStand({ elbowLever: true, shape: "full" }) },
  // the dynamic skills
  { test: /shoulder rolls to feet/i, family: "kipUp", build: () => T4.kipUp({ drill: true }) },
  { test: /hip-to-shoulder rolls/i, family: "rolling", build: () => T3.rollOver() },
  { test: /kip-up/i, family: "kipUp", build: (n) => T4.kipUp({ jump: /jump/i.test(n) }) },
  { test: /box jump-backs/i, family: "jump", build: () => T4.jumpBack() },
  { test: /back tuck|back flip/i, family: "flip", build: () => T4.flip("back") },
  { test: /front tuck|front flip/i, family: "flip", build: () => T4.flip("front") },
  { test: /dive roll/i, family: "flip", build: () => T4.diveRoll() },
  { test: /giant swing/i, family: "barSpin", build: () => T4.giant() },
  { test: /windmill|around.the.world|bar spin|hip circles on bar/i, family: "barSpin", build: () => T4.hipCircleBar() },
  { test: /half get-ups/i, family: "getUp", build: () => T4.getUp({ half: true }) },
  { test: /get-ups?\b/i, family: "getUp", build: () => T4.getUp() },
  { test: /straight-arm pull-downs/i, family: "pullApart", build: () => T4.pullDown() },
  { test: /ring pull-outs/i, family: "cross", build: () => T4.ringPullOut() },
  { test: /inverted hang on rings/i, family: "hang", build: () => T4.invertedHang() },
  { test: /rope pulls/i, family: "rope", build: () => T4.ropePull() },
  { test: /shoulder opening/i, family: "stretch", build: () => T4.shoulderOpening() },
  { test: /single-leg hops/i, family: "jump", build: () => T4.singleLegHop() },
  { test: /windshield wipers \(pole/i, family: "legRaise", build: () => T4.wipers() },
];

const RULES: Rule[] = [
  ...SPORT_RULES,
  ...SPECIFIC_RULES,
  // warm-up, mobility and cool-down first — their names reuse words like "push-up", "hang", "squat"
  { test: /wrist|forearm/i, family: "wrists", build: () => T2.wristRocks() },
  { test: /jumping jacks?/i, family: "jacks", build: () => T2.jumpingJack() },
  { test: /arm circles/i, family: "armCircles", build: () => T2.armCircles() },
  { test: /shoulder dislocates?/i, family: "pullApart", build: () => T2.pullApart({ overhead: true }) },
  { test: /pull-?aparts?|arm swings/i, family: "pullApart", build: () => T2.pullApart() },
  { test: /hip circles(?! on bar)/i, family: "hipCircles", build: () => T2.hipCircles() },
  { test: /cat-?cow/i, family: "catCow", build: () => T2.catCow() },
  { test: /thoracic|thread the needle/i, family: "catCow", build: () => T2.catCow({ reach: true }) },
  { test: /child'?s pose/i, family: "childsPose", build: () => T2.childsPose() },
  { test: /couch stretch|hip flexor/i, family: "hipFlexor", build: (n) => T2.kneelingLunge({ reach: /couch/i.test(n) }) },
  { test: /world'?s greatest/i, family: "worldsGreatest", build: () => T2.worldsGreatest() },
  { test: /forward fold|hamstring\/hip flexibility|pike stretch/i, family: "fold", build: () => T2.seatedFold() },
  { test: /leg swings/i, family: "legSwings", build: () => T2.legSwings() },
  { test: /high knees/i, family: "highKnees", build: () => T2.highKnees() },
  { test: /mountain climbers?/i, family: "climbers", build: () => T2.mountainClimbers() },
  { test: /burpees?/i, family: "burpee", build: () => T2.burpee() },
  { test: /y-t-w|prone .*raises/i, family: "prone", build: () => T2.proneRaises() },
  { test: /sphinx/i, family: "stretch", build: () => T2.sphinx() },
  { test: /chest (opener|stretch)|doorway|biceps wall/i, family: "chestOpener", build: () => T2.chestOpener() },
  { test: /quad stretch/i, family: "stretch", build: () => T2.quadStretch() },
  { test: /calf stretch/i, family: "stretch", build: () => T2.calfStretch() },
  { test: /cross-body/i, family: "stretch", build: () => T2.crossBodyStretch() },
  { test: /triceps stretch/i, family: "stretch", build: () => T2.tricepsStretch() },
  { test: /dead hang|passive (shoulder )?hang|false grip hang|hang stretch/i, family: "hang", build: () => T2.pullUpFront({ hang: true }) },
  { test: /scapula/i, family: "hang", build: () => T2.pullUpFront({ scapula: true }) },
  // rings: the cross family, seen from the front
  { test: /maltese lean/i, family: "plancheLean", build: () => T.plancheLean() },
  // close relatives drawn with the shape they share
  { test: /maltese/i, family: "planche", build: (n) => T.planche(variantOf(n)) },
  { test: /manna/i, family: "lSit", build: () => T.lSit("full") },
  { test: /pike press|straddle pike press|pike walk-ups|wall-assisted lateral walks/i, family: "handstand", build: (n) => T.handstand({ wall: /wall/i.test(n) }) },
  { test: /single-leg box step-offs/i, family: "pistol", build: () => T.pistol({ slow: true }) },
  { test: /victorian/i, family: "backLever", build: (n) => T.backLever(variantOf(n)) },
  { test: /\bcross\b(?!-body)/i, family: "cross", build: (n) => T2.ironCross(variantOf(n), { fromSupport: /negative|pull-out|press/i.test(n), inverted: /inverted/i.test(n) }) },
  { test: /crow|frog stand/i, family: "crow", build: () => T2.crowStand() },
  { test: /elbow lever|elbow-lever/i, family: "elbowLever", build: () => T2.crowStand({ elbowLever: true }) },
  { test: /monkey bar/i, family: "monkeyBars", build: () => T2.monkeyBars() },
  { test: /rope climb/i, family: "rope", build: (n) => T2.ropeClimb({ legless: /legless/i.test(n) }) },
  { test: /broad jump|long jump/i, family: "jump", build: () => T2.broadJump() },
  { test: /single-leg rdl|romanian/i, family: "rdl", build: () => T2.singleLegRDL() },
  { test: /hamstring bridge/i, family: "gluteBridge", build: () => T.gluteBridge({ singleLeg: false }) },
  { test: /glute-ham|leg curls/i, family: "nordic", build: () => T.nordic() },
  { test: /compression hold|pike compression|elevated pike hold/i, family: "lSit", build: () => T.lSit("tuck") },
  { test: /tucked hang rocks/i, family: "legRaise", build: () => T.legRaise() },
  { test: /one-arm (negatives|flexed-arm hang|chin|attempt)|freestanding one-arm/i, family: "pullUp", build: (n) => T2.pullUpFront({ oneArm: true, slowDown: /negative/i.test(n) }) },
  // levers & flags first — their names also contain "hold", "raise", "pull"
  { test: /back lever/i, family: "backLever", build: (n) => T.backLever(variantOf(n), { raise: /raise|negative/i.test(n) }) },
  { test: /front lever|ice cream maker|tuck-to-one-leg|one-leg to straddle|tuck negatives|tuck hold from support|^advanced tuck holds$/i, family: "frontLever", build: (n) => T.frontLever(variantOf(n), { raise: /raise|negative|ice cream|pull/i.test(n) }) },
  // the dragon flag before the human flag: "dragon flag negatives" also says "flag negatives"
  { test: /dragon flag/i, family: "dragonFlag", build: (n) => T.dragonFlag({ tuck: /tuck/i.test(n) }) },
  { test: /human flag|flag negatives|flag raises|flag pull-ins|straddle-to-full|tuck-to-straddle|vertical pole holds|pole pull-to-hip/i, family: "flag", build: (n) => T2.humanFlagFront(variantOf(n), { raise: /raise|negative|pull/i.test(n) }) },
  { test: /german hang|skin the cat/i, family: "germanHang", build: (n) => T.germanHang({ skinTheCat: /skin|transition/i.test(n) }) },
  { test: /muscle-?up|transition drill/i, family: "muscleUp", build: () => T.muscleUp() },
  // planche family
  { test: /planche lean|pseudo planche/i, family: "plancheLean", build: (n) => T.plancheLean({ pushUp: /push/i.test(n) }) },
  { test: /planche/i, family: "planche", build: (n) => T.planche(variantOf(n), { pushUp: /push|press/i.test(n) }) },
  // handstands
  { test: /handstand push|hspu/i, family: "hspu", build: (n) => T.handstand({ wall: !/parallette|freestanding/i.test(n), pushUp: true, parallettes: /parallette/i.test(n) }) },
  { test: /pike push/i, family: "pike", build: () => T.pikePushUp() },
  { test: /handstand|kick-up|wall walk|shoulder taps|straddle-to-hs/i, family: "handstand", build: (n) => T.handstand({ wall: /wall/i.test(n) }) },
  // pushing
  { test: /support hold/i, family: "support", build: (n) => T.supportHold({ rings: /ring/i.test(n) }) },
  { test: /dips?\b/i, family: "dip", build: (n) => T.dip({ rings: /ring/i.test(n), straightBar: /straight bar/i.test(n), slow: /negative|tempo|slow/i.test(n) }) },
  { test: /push-?ups?/i, family: "pushUp", build: (n) => T.pushUp({ decline: /decline/i.test(n), slow: /tempo|slow|negative/i.test(n) }) },
  // core & compression
  { test: /l-sit pull/i, family: "pullUp", build: () => T.pullUp({ lsitLegs: true }) },
  { test: /l-sit|l sit|v-sit|tuck-to-extend/i, family: "lSit", build: (n) => T.lSit(variantOf(n)) },
  { test: /knee raise|leg raise|toes.to.bar|windshield wiper(?!s \(pole)/i, family: "legRaise", build: (n) => T.legRaise({ straight: /straight|leg raise|toes/i.test(n) }) },
  { test: /hollow|dead bug/i, family: "hollow", build: (n) => T.hollow({ rock: /rock/i.test(n) }) },
  { test: /superman|arch hold/i, family: "superman", build: () => T.superman() },
  { test: /side plank/i, family: "plank", build: () => T.plank({ side: true }) },
  { test: /plank/i, family: "plank", build: () => T.plank() },
  // pulling

  { test: /\brows?\b/i, family: "row", build: () => T.row() },
  // pull-ups and chin-ups from the front: from the side the arms fold into the body and the
  // pull can't be read; from the front the elbows visibly drive down and the chin clears the bar
  { test: /chin-?ups?/i, family: "pullUp", build: (n) => T2.pullUpFront({ narrow: true, slowDown: /negative|eccentric|tempo/i.test(n) }) },
  { test: /pull-?ups?|chest-to-bar|wide-grip negatives|high pulls/i, family: "pullUp", build: (n) => T2.pullUpFront({ wide: /wide|chest-to-bar/i.test(n), slowDown: /negative|eccentric|tempo/i.test(n) }) },
  // legs
  { test: /nordic/i, family: "nordic", build: () => T.nordic() },
  { test: /shrimp/i, family: "pistol", build: () => T.pistol({ shrimp: true }) },
  { test: /pistol|single-leg sit|step-down/i, family: "pistol", build: (n) => T.pistol({ slow: /negative|step-down|sit/i.test(n) }) },
  { test: /lunge|split squat|cossack/i, family: "lunge", build: () => T.lunge() },
  { test: /squat/i, family: "squat", build: (n) => T.squat({ jump: /jump/i.test(n) }) },
  { test: /glute bridge|hip thrust/i, family: "gluteBridge", build: (n) => T.gluteBridge({ singleLeg: /single/i.test(n) }) },
  { test: /\bbridge\b/i, family: "bridge", build: () => T.bridge() },
  { test: /calf raise/i, family: "calf", build: () => T.calfRaise() },
];

export interface DemoEntry {
  family: Family;
  demo: Demo;
  mistakes: string[];
}

const cache = new Map<string, DemoEntry | null>();

export function demoFor(exerciseName: string): DemoEntry | null {
  if (cache.has(exerciseName)) return cache.get(exerciseName)!;
  const rule = RULES.find((r) => r.test.test(exerciseName));
  const entry = rule ? { family: rule.family, demo: rule.build(exerciseName), mistakes: MISTAKES[rule.family] } : null;
  cache.set(exerciseName, entry);
  return entry;
}
