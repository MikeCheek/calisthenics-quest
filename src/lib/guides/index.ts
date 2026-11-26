import type { Locale } from "@/lib/types";

// ---------------------------------------------------------------------------
// Form guides: how to do an exercise properly — setup, the steps, the body
// positions and angles to aim for, the common mistakes with their fix, and
// how to breathe.
//
// A guide belongs to a movement (a pull-up, a pigeon pose…), so every
// version of it shares one well-reviewed guide; what changes between
// versions (a negative, band help, a tuck, rings…) is added as short
// "this version" lines read from the exercise's name.
//
// This file is small and always loaded: it only maps names to guides. The
// text lives in guides.en.ts / guides.it.ts and is loaded on demand, one
// language at a time.
// ---------------------------------------------------------------------------

export interface GuideText {
  setup: string[]; // how to set up before the first rep
  steps: string[]; // the movement, in order
  targets: string[]; // positions and angles that mean it's done right
  mistakes: [mistake: string, fix: string][];
  breath: string;
}

export type GuideTable = Record<string, GuideText>;

// name -> guide id. First match wins: most specific first.
const RULES: [RegExp, string][] = [
  // ---------------- yoga ----------------
  [/^half sun salutation/i, "halfSun"],
  [/^sun salutation a/i, "sunA"],
  [/^sun salutation b/i, "sunB"],
  [/jump back to chaturanga/i, "jumpBack"],
  [/^chaturanga/i, "chaturanga"],
  [/^vinyasa flow/i, "vinyasa"],
  [/^downward dog pedal/i, "dogPedal"],
  [/^downward dog/i, "downDog"],
  [/^dolphin pose/i, "dolphin"],
  [/^cobra pose/i, "cobra"],
  [/^locust pose/i, "locust"],
  [/^camel pose/i, "camel"],
  [/^wheel prep/i, "wheelPrep"],
  [/^bow pose/i, "bow"],
  [/^tree pose/i, "tree"],
  [/^warrior ii\b/i, "warrior2"],
  [/^warrior iii/i, "warrior3"],
  [/^eagle pose/i, "eagle"],
  [/^half moon/i, "halfMoon"],
  [/^dancer pose/i, "dancer"],
  [/^standing split/i, "standingSplit"],
  [/hand-to-big-toe/i, "handToToe"],
  [/^garland squat/i, "garland"],
  [/^figure-four/i, "figureFour"],
  [/^happy baby/i, "happyBaby"],
  [/^supine twist/i, "supineTwist"],
  [/^crow prep lean/i, "crowPrep"],
  [/^crow to plank jump back/i, "crowJumpBack"],
  [/^side crow/i, "sideCrow"],
  [/^crow pose/i, "crow"],
  [/^firefly/i, "firefly"],
  [/^eight-angle/i, "eightAngle"],
  [/^boat pose/i, "boatPose"],
  [/headstand leg lowers/i, "headstandLegLowers"],
  [/headstand tuck holds/i, "headstandTuck"],
  [/headstand at the wall/i, "headstandWall"],
  [/freestanding headstand/i, "headstand"],
  [/^plow pose/i, "plow"],
  [/^bridge pose/i, "bridgePose"],
  [/^wheel pose/i, "wheel"],
  [/^low lunge/i, "lowLunge"],
  [/^half split/i, "halfSplit"],
  [/^lizard pose/i, "lizard"],
  [/front split/i, "frontSplit"],
  [/^middle split/i, "middleSplit"],
  [/^pigeon pose/i, "pigeon"],
  [/^seated forward fold/i, "seatedFold"],
  [/^standing forward fold/i, "standingFold"],
  [/^wide-legged forward fold/i, "wideFold"],
  [/^head-to-knee/i, "headToKnee"],
  [/^butterfly pose/i, "butterfly"],
  [/lotus/i, "lotus"],
  [/^child's pose/i, "childsPose"],
  [/^savasana/i, "savasana"],

  // ---------------- pilates ----------------
  [/^chest lift/i, "chestLift"],
  [/^hundred/i, "hundred"],
  [/^single-leg stretch/i, "singleLegStretch"],
  [/^double-leg stretch/i, "doubleLegStretch"],
  [/^criss-cross/i, "crissCross"],
  [/^single-leg circles/i, "legCircles"],
  [/^corkscrew/i, "corkscrew"],
  [/^boat hold/i, "boatPose"],
  [/teaser/i, "teaser"],
  [/^half roll-back/i, "halfRollBack"],
  [/^roll-up/i, "rollUp"],
  [/^roll-over/i, "rollOver"],
  [/^jackknife/i, "jackknife"],
  [/^rolling like a ball/i, "rollingBall"],
  [/^seal$/i, "seal"],
  [/^open-leg rocker/i, "openLegRocker"],
  [/^control balance/i, "controlBalance"],
  [/^boomerang/i, "boomerang"],
  [/^pelvic curl/i, "pelvicCurl"],
  [/^bridge marches/i, "bridgeMarches"],
  [/^shoulder bridge with leg kicks/i, "shoulderBridgeKicks"],
  [/^single-leg bridge$/i, "gluteBridge"],
  [/^spine stretch forward/i, "spineStretch"],
  [/mermaid/i, "mermaid"],
  [/^spine twist/i, "spineTwist"],
  [/^saw$/i, "saw"],
  [/^swan dive/i, "swanDive"],
  [/^swan prep/i, "swanPrep"],
  [/^swan$/i, "swan"],
  [/^swimming/i, "swimming"],
  [/^single-leg kick/i, "singleLegKick"],
  [/^double-leg kick/i, "doubleLegKick"],
  [/^side-lying leg lifts/i, "sideLyingLift"],
  [/^clamshell/i, "clamshell"],
  [/^side kick front and back/i, "sideKick"],
  [/^kneeling side kick/i, "kneelingSideKick"],
  [/^leg pull front/i, "legPullFront"],
  [/^leg pull back/i, "legPullBack"],
  [/^pilates push-up/i, "pilatesPushUp"],
  [/breathing with pelvic tilts/i, "pelvicTilts"],

  // ---------------- calisthenics: names that contain another move's words ----------------
  [/dragon flag/i, "dragonFlag"],
  [/nordic|glute-ham|eccentric leg curls/i, "nordic"],
  [/side plank/i, "sidePlank"],
  [/side-lying leg raises/i, "sideLyingLift"],
  [/german hang|skin the cat(?!.*back lever)/i, "germanHang"],
  [/ring pull-outs|^cross pull-outs/i, "ringPullOut"],
  [/knee raises|hanging.*leg raises|toes-to-bar|tucked hang rocks/i, "hangingLegRaise"],
  [/manna/i, "manna"],
  [/v-sit|compression holds|elevated pike holds/i, "vSit"],

  // ---------------- calisthenics: pulling ----------------
  [/vertical pole holds/i, "poleLean"],
  [/vertical pole pull-ups|flag pull-up|pole pull-to-hip/i, "flagPullUp"],
  [/human flag|flag negatives|flag raises|flag pull-ins|straddle-to-full|tuck-to-straddle/i, "humanFlag"],
  [/one-arm (?:pull-up|negatives|flexed-arm|chin)|one-arm pull-ups|uneven-grip|freestanding one-arm attempts|other hand on wrist/i, "oneArmPullUp"],
  [/archer pull-up|typewriter/i, "archerPullUp"],
  [/l-sit pull-up/i, "lSitPullUp"],
  [/muscle-up|transition drills|false-grip dip transitions/i, "muscleUp"],
  [/pull-up|high pulls to chest|chest-to-bar|wide-grip negatives/i, "pullUp"],
  [/rows?\b.*\(bent-arm\)|front lever rows/i, "frontLever"],
  [/door frame rows|towel door rows/i, "homeRow"],
  [/body rows|inverted rows|ring rows|wide-grip rows|table rows/i, "row"],
  [/scapula (?:pulls|depressions)/i, "scapPull"],
  [/bar swing|hollow-to-arch swing|partial rotation swing/i, "barSwing"],
  [/inverted hang on rings/i, "invertedHang"],
  [/l-sit holds during dead hang/i, "hangingLSit"],
  [/dead hang|passive (?:shoulder )?hang|false grip hangs/i, "deadHang"],
  [/front lever|ice cream makers|tuck-to-one-leg negatives|one-leg to straddle negatives|^tuck negatives|tuck hold from support|^advanced tuck holds/i, "frontLever"],
  [/skin the cat.*back lever|back lever.*skin-the-cat/i, "backLever"],
  [/victorian/i, "victorian"],
  [/back lever/i, "backLever"],
  [/iron cross|tuck cross|cross holds|cross negatives|cross press|deep cross/i, "ironCross"],
  [/straight-arm pull-downs/i, "straightArmPulldown"],
  [/rope pulls/i, "ropePull"],
  [/rope climb/i, "ropeClimb"],
  [/monkey bar/i, "monkeyBars"],

  // ---------------- calisthenics: pushing & balance ----------------
  [/maltese/i, "maltese"],
  [/planche lean|pseudo planche|planche-to-handstand/i, "plancheLean"],
  [/planche/i, "planche"],
  [/frog stand|crow/i, "crowStand"],
  [/elbow.lever|one-leg extensions from tuck/i, "elbowLever"],
  [/wrist/i, "wrists"],
  [/impossible dip/i, "impossibleDip"],
  [/chair dips/i, "chairDip"],
  [/straight bar dips/i, "straightBarDip"],
  [/dips/i, "dip"],
  [/support hold/i, "support"],
  [/hspu|handstand push-up/i, "hspu"],
  [/pike push-up/i, "pikePushUp"],
  [/one-arm (?:handstand|wall)|wall one-arm/i, "oneArmHandstand"],
  [/handstand press|straddle-to-hs|pike press|pike walk-ups|l-sit to handstand/i, "pressHandstand"],
  [/wall walk/i, "wallWalk"],
  [/kick-up/i, "kickUp"],
  [/handstand walk|lateral walks/i, "handstandWalk"],
  [/wall handstand/i, "wallHandstand"],
  [/handstand/i, "handstand"],
  [/archer push-up/i, "archerPushUp"],
  [/one-arm push-up/i, "oneArmPushUp"],
  [/90° push-up/i, "ninetyPushUp"],
  [/clap|explosive push-up|superman push-up/i, "explosivePushUp"],
  [/diamond push-up/i, "diamondPushUp"],
  [/push-up/i, "pushUp"],

  // ---------------- calisthenics: core ----------------
  [/copenhagen|adductor plank/i, "copenhagen"],
  [/reverse plank/i, "reversePlank"],
  [/plank/i, "plank"],
  [/windshield wipers/i, "windshieldWipers"],
  [/^lying leg raises/i, "lyingLegRaise"],
  [/adductor squeezes/i, "adductorSqueeze"],
  [/dead bug/i, "deadBug"],
  [/hollow/i, "hollow"],
  [/l-sit|tuck-to-extend/i, "lSit"],
  [/hip-to-shoulder rolls/i, "hipToShoulderRoll"],
  [/one-arm tuck teaser/i, "teaser"],
  [/y-t-w/i, "ytw"],
  [/superman/i, "superman"],

  // ---------------- calisthenics: legs ----------------
  [/sissy squat/i, "sissySquat"],
  [/cossack|lateral lunges/i, "cossack"],
  [/split squat/i, "splitSquat"],
  [/shrimp/i, "shrimpSquat"],
  [/jump pistol/i, "jumpPistol"],
  [/pistol|single-leg step-downs|single-leg sits|step-offs/i, "pistol"],
  [/jump squats/i, "jumpSquat"],
  [/squats/i, "squat"],
  [/calf raises/i, "calfRaise"],
  [/hamstring bridges/i, "hamstringBridge"],
  [/glute bridges/i, "gluteBridge"],
  [/single-leg rdl/i, "singleLegRdl"],
  [/hamstring\/hip flexibility/i, "standingFold"],
  [/broad jumps|long jumps/i, "broadJump"],
  [/box jump-backs/i, "boxJumpBack"],
  [/single-leg hops/i, "singleLegHop"],

  // ---------------- calisthenics: acrobatics & bar tricks ----------------
  [/kip-up|shoulder rolls to feet/i, "kipUp"],
  [/back (?:tuck|flip)/i, "backFlip"],
  [/front (?:tuck|flip)/i, "frontFlip"],
  [/dive roll/i, "diveRoll"],
  [/giant swing/i, "giantSwing"],
  [/hip circles on bar/i, "hipCircleBar"],
  [/windmill|around.the.world|bar spin/i, "barSpin"],
  [/get-up/i, "getUp"],

  // ---------------- calisthenics: bridges, mobility, warm-up ----------------
  [/bridge/i, "bridge"],
  [/shoulder opening/i, "shoulderOpening"],
  [/shoulder dislocates/i, "shoulderDislocates"],
  [/pull-aparts/i, "pullApart"],
  [/arm circles/i, "armCircles"],
  [/thoracic spine rotations/i, "thoracicRotation"],
  [/cat-cow/i, "catCow"],
  [/chest opener/i, "chestOpener"],
  [/hip circles/i, "hipCircles"],
  [/leg swings/i, "legSwings"],
  [/world's greatest/i, "worldsGreatest"],
  [/couch stretch/i, "couchStretch"],
  [/jumping jacks/i, "jumpingJacks"],
  [/burpees/i, "burpee"],
  [/mountain climbers/i, "mountainClimbers"],
  [/high knees/i, "highKnees"],
];

export function guideIdFor(exerciseName: string): string | null {
  return RULES.find(([re]) => re.test(exerciseName))?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// "This version": what a modifier in the name changes. Several can apply
// (e.g. "Weighted archer pull-ups" gets the weighted line).
// ---------------------------------------------------------------------------
type Line = { en: string; it: string };
const L = (en: string, it: string): Line => ({ en, it });

const VARIANTS: [RegExp, Line][] = [
  [/negative|eccentric/i, L(
    "Negative: get to the top position by jumping or stepping, then lower over 3–5 s with the same body shape; reset instead of pulling back up.",
    "Negativa: arriva alla posizione alta con un salto o un appoggio, poi scendi in 3–5 s mantenendo la stessa forma del corpo; riparti da capo invece di risalire.",
  )],
  [/band-assisted|\(band\)/i, L(
    "Band help: loop the band so it pulls hardest at the hardest point; use the lightest band that still lets you keep perfect form.",
    "Con elastico: posizionalo in modo che aiuti di più nel punto più duro; usa l'elastico più leggero che ti permette di mantenere una forma perfetta.",
  )],
  [/(?<!band-)assisted|feet supported|foot support|feet-assisted|foot on box|feet on box|holding support|hand support|fingertip support|rail/i, L(
    "Assisted: the support takes only what you can't do yet — give it as little weight as possible and reduce it week by week.",
    "Assistito: l'appoggio prende solo quello che ancora non riesci a fare — dagli meno peso possibile e riducilo settimana dopo settimana.",
  )],
  [/spotted|spotter|partner/i, L(
    "With a spotter: they hold you only at the hips or back of the thighs and only as much as needed; agree on a stop signal before you start.",
    "Con assistenza: chi ti aiuta ti tiene solo ai fianchi o dietro le cosce, solo quanto serve; concordate un segnale di stop prima di iniziare.",
  )],
  [/weighted/i, L(
    "Weighted: add load (vest, belt or backpack) only once you own 3×8 clean reps or the full hold time without it; start with 2.5–5 kg.",
    "Con sovraccarico: aggiungi peso (giubbotto, cintura o zaino) solo quando fai pulite 3×8 ripetizioni o il tempo pieno senza; parti da 2,5–5 kg.",
  )],
  [/cluster/i, L(
    "Cluster sets: split a hard set into mini-sets of 1–3 reps with 15–20 s rest between them — every rep stays clean instead of grinding.",
    "Cluster set: dividi una serie dura in mini-serie da 1–3 ripetizioni con 15–20 s di pausa — ogni ripetizione resta pulita invece di arrancare.",
  )],
  [/emom/i, L(
    "EMOM: start a set at the top of every minute and rest for what's left; pick reps you can still do cleanly in the last minute.",
    "EMOM: inizia una serie all'inizio di ogni minuto e riposa per il resto; scegli ripetizioni che riesci a fare pulite anche nell'ultimo minuto.",
  )],
  [/tempo|slow/i, L(
    "Slow tempo: count every phase out loud (e.g. 3 s down, 1 s pause, 2 s up) — no bouncing out of the bottom.",
    "Tempo lento: conta ogni fase (es. 3 s giù, 1 s pausa, 2 s su) — niente rimbalzi in basso.",
  )],
  [/pause at|holds? at (?:top|bottom)/i, L(
    "Pause: stop dead for 2–3 s at the marked point with the same tension, then continue without a bounce.",
    "Pausa: fermati 2–3 s nel punto indicato mantenendo la tensione, poi riparti senza rimbalzo.",
  )],
  [/explosive|clap|jump (?:squats|pistols)|to jump|hops/i, L(
    "Explosive: move up as fast as you can, land softly with bent joints, and reset before each rep — stop when the speed drops.",
    "Esplosivo: sali più veloce che puoi, atterra morbido con le articolazioni piegate e ricomponiti prima di ogni ripetizione — fermati quando la velocità cala.",
  )],
  [/deficit/i, L(
    "Deficit: the raised hands or feet add range at the bottom — go only as deep as you can keep the shoulders or knees comfortable.",
    "Deficit: mani o piedi rialzati aggiungono ampiezza in basso — scendi solo finché spalle o ginocchia restano a proprio agio.",
  )],
  [/elevated feet|elevated pike push|decline/i, L(
    "Feet raised: more of your weight moves onto the hands — the higher the feet, the harder it gets.",
    "Piedi rialzati: più peso passa sulle mani — più alti i piedi, più difficile l'esercizio.",
  )],
  [/incline|off an incline/i, L(
    "Incline: hands on a bench or bar make it easier — lower the surface as you get stronger.",
    "Inclinato: mani su panca o sbarra lo rendono più facile — abbassa l'appoggio man mano che diventi più forte.",
  )],
  [/\brings?\b/i, L(
    "On rings: they move, so squeeze them hard, keep them close to the body and turn the hands out slightly at the lockout.",
    "Agli anelli: si muovono, quindi stringili forte, tienili vicini al corpo e ruota leggermente le mani verso l'esterno a braccia tese.",
  )],
  [/false grip/i, L(
    "False grip: the base of the palm sits on top of the bar or ring with the wrist bent over it — set it before every rep.",
    "Falsa presa: la base del palmo sta sopra la sbarra o l'anello con il polso piegato sopra — sistemala prima di ogni ripetizione.",
  )],
  [/wide-grip|wide stance/i, L(
    "Wide: hands (or feet) about 1.5× shoulder width — keep the shoulder blades in control, don't let them shrug.",
    "Larga: mani (o piedi) a circa 1,5 volte la larghezza delle spalle — controlla le scapole, non alzarle verso le orecchie.",
  )],
  [/advanced tuck|adv\. tuck|\(adv\. tuck\)/i, L(
    "Advanced tuck: the back is flat (not rounded) and the thighs are at about 90° to the torso, knees bent.",
    "Advanced tuck: la schiena è piatta (non arrotondata) e le cosce a circa 90° rispetto al busto, ginocchia piegate.",
  )],
  [/(?<!advanced |adv\. )\btuck(?!-to)|tucked/i, L(
    "Tuck: knees pulled tight to the chest and the back rounded — the shortest, easiest lever.",
    "Tuck: ginocchia strette al petto e schiena arrotondata — la leva più corta e più facile.",
  )],
  [/one-leg (?:front|back) lever|one-leg extended|\(one-leg\)/i, L(
    "One leg: one leg straight in line with the body, the other tucked — switch legs between sets.",
    "Una gamba: una gamba tesa in linea con il corpo, l'altra raccolta — alterna la gamba tra le serie.",
  )],
  [/straddle/i, L(
    "Straddle: legs straight and wide apart (aim for 90° or more between them) — knees locked, toes pointed.",
    "Straddle: gambe tese e divaricate (punta a 90° o più tra loro) — ginocchia bloccate, punte tese.",
  )],
  [/\bfull (?:front lever|back lever|planche|human flag|dragon flag|elbow lever|maltese|l-sit)/i, L(
    "Full: legs together and straight — the body is one straight line from shoulders to toes.",
    "Completa: gambe unite e tese — il corpo è un'unica linea retta dalle spalle alle punte.",
  )],
  [/partial/i, L(
    "Partial: work only the range you control; extend it a few centimetres at a time.",
    "Parziale: lavora solo nell'ampiezza che controlli; allungala pochi centimetri alla volta.",
  )],
  [/full rom|full range|full rotation|full height/i, L(
    "Full range: every rep goes all the way — from a full stretch to a full finish.",
    "Ampiezza completa: ogni ripetizione va fino in fondo — da allungamento completo a chiusura completa.",
  )],
  [/attempts|drill/i, L(
    "Drill: quality over quantity — stop the set as soon as the reps get sloppy.",
    "Drill: qualità prima della quantità — chiudi la serie appena le ripetizioni peggiorano.",
  )],
  [/knees (?:down|bent)|knee support|top leg bent|bent knees/i, L(
    "Easier version: bent knees shorten the lever — keep the same straight line from knees to head.",
    "Versione facile: le ginocchia piegate accorciano la leva — mantieni la stessa linea dritta da ginocchia a testa.",
  )],
  [/(?:lever|flag|dragon flag) raises|lever pulls|planche presses|manna presses|v-sit presses|maltese presses|elbow lever presses|flag raises/i, L(
    "Raises and presses: move slowly into the position and out of it, keeping the shape you'd have in the hold.",
    "Raise e press: entra ed esci dalla posizione lentamente, mantenendo la forma che avresti nella tenuta.",
  )],
];

export function variantLines(exerciseName: string, locale: Locale): string[] {
  return VARIANTS.filter(([re]) => re.test(exerciseName)).map(([, l]) => l[locale]);
}

// Load one language's guides (cached after the first load).
const loaded: Partial<Record<Locale, Promise<GuideTable>>> = {};
export function loadGuides(locale: Locale): Promise<GuideTable> {
  return (loaded[locale] ??=
    locale === "it"
      ? import("./guides.it").then((m) => m.GUIDES)
      : import("./guides.en").then((m) => m.GUIDES));
}
