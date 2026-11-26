import type { GuideTable } from "../index";

// Pulling, hanging, levers, rings and bar rotations.
export const PULL: GuideTable = {
  scapPull: {
    setup: ["Hang from the bar (or hold a support) with straight arms, hands shoulder-width apart, body still."],
    steps: [
      "Without bending the elbows, pull the shoulder blades down and together: the body rises 3–5 cm.",
      "Hold the top for 1–2 s and feel the muscles under the armpits working.",
      "Let the shoulder blades slide back up slowly to the starting hang.",
    ],
    targets: [
      "Elbows stay locked at 180° the whole time — the height comes only from the shoulders.",
      "At the top the shoulders are far from the ears; at the bottom they rise again, but you never lose your grip.",
      "Body vertical, legs together, no swinging.",
    ],
    mistakes: [
      ["Bending the elbows to go higher", "Think of pushing the bar towards your feet with straight arms."],
      ["Shrugging up instead of pulling down", "Lead with the chest: lift it slightly towards the bar."],
      ["Dropping fast to the bottom", "Lower over 2 s, staying in control."],
    ],
    breath: "Breathe out as you pull the shoulder blades down, breathe in as they rise.",
  },
  deadHang: {
    setup: ["Grip the bar overhand, hands about shoulder width (wider for the wide-grip version), thumbs around the bar."],
    steps: [
      "Lift the feet and hang with straight arms.",
      "Keep the shoulders active: slightly pulled down, not hanging off the ligaments (unless the passive version is asked).",
      "Hold the time without swinging, then step down rather than dropping.",
    ],
    targets: [
      "Arms straight (180° at the elbow), body vertical, legs together and slightly in front.",
      "Ribs down and glutes lightly squeezed — the body doesn't arch.",
      "Passive version: let the shoulders rise towards the ears and relax, as long as it's pain-free.",
    ],
    mistakes: [
      ["Swinging", "Start from a still position and squeeze the legs together."],
      ["Bent elbows", "Lock the arms; if you can't, make the hang shorter."],
      ["Thumbs over the bar on a weak grip", "Wrap the thumbs around the bar for a safer hold."],
    ],
    breath: "Slow, steady breathing through the nose — don't hold your breath.",
  },
  barSwing: {
    setup: ["Hang from the bar with straight arms and active shoulders; legs together, toes pointed."],
    steps: [
      "Push the chest through the arms and the legs behind you: the arch (back of the swing).",
      "Then pull the bar towards your hips with straight arms and bring the legs forward: the hollow (front of the swing).",
      "Alternate arch and hollow in rhythm, letting the swing grow a little at a time.",
    ],
    targets: [
      "Arms always straight — the motion comes from the shoulders and the hips.",
      "In the hollow the body is a gentle C shape with the legs about 30° in front; in the arch the chest is in front of the bar.",
      "Legs together and straight for the whole swing.",
    ],
    mistakes: [
      ["Bending the knees and kicking", "Keep the legs straight: the swing comes from the shoulders."],
      ["Swinging too big too soon", "Start small and increase only while you stay in control."],
      ["Loose grip at the front of the swing", "Squeeze the bar hard, especially as you change direction."],
    ],
    breath: "Breathe out in the hollow, breathe in in the arch.",
  },
  invertedHang: {
    setup: ["Hang from the rings with straight arms; tuck the knees up and roll back until the hips are above the head."],
    steps: [
      "Lift the legs to vertical, body upside down and straight, arms straight beside the body.",
      "Hold the position with the rings close to the hips.",
      "Come out by tucking the knees and slowly lowering back to the hang.",
    ],
    targets: [
      "Body vertical upside down: shoulders, hips and ankles in one line.",
      "Arms straight, rings beside the thighs, shoulders pulled down.",
      "Head neutral: eyes on the toes or forwards, not on the floor.",
    ],
    mistakes: [
      ["Bent arms", "Push the rings towards your feet with straight arms."],
      ["Piking at the hips", "Squeeze the glutes and push the hips forward."],
      ["Falling out fast", "Exit always by tucking the knees, slowly."],
    ],
    breath: "Breathe calmly; upside down it's normal to feel the head heavy — stop if you get dizzy.",
  },
  hangingLSit: {
    setup: ["Hang from the bar with straight arms and active shoulders."],
    steps: [
      "Raise the straight legs (or bent, in the easy version) in front of you until they're horizontal.",
      "Hold the L with the legs still and the body not swinging.",
      "Lower the legs slowly back to the hang.",
    ],
    targets: [
      "Hip angle at 90°: legs horizontal, parallel to the floor.",
      "Knees locked, toes pointed, legs together.",
      "Shoulders pulled down, arms straight.",
    ],
    mistakes: [
      ["Legs dropping under horizontal", "Bend the knees if needed and keep the thighs horizontal."],
      ["Swinging to get the legs up", "Start from a still hang and lift slowly."],
      ["Leaning back too much", "Keep the torso close to vertical; tighten the abs."],
    ],
    breath: "Short, steady breaths while holding; don't stop breathing.",
  },
  pullUp: {
    setup: ["Hang from the bar overhand, hands a little wider than the shoulders, arms straight, legs together and slightly in front."],
    steps: [
      "Start by pulling the shoulder blades down and back (a small scapula pull).",
      "Pull the elbows down towards the ribs until the chin is over the bar (the chest touches it in the chest-to-bar version).",
      "Pause briefly at the top, then lower over 2–3 s to straight arms.",
    ],
    targets: [
      "Bottom: elbows fully straight (180°), shoulders active — not hanging off them.",
      "Top: chin clearly over the bar, elbows pointing down and slightly forward, about 45° from the body.",
      "Body stays one line with a slight hollow: no kicking, no swing.",
    ],
    mistakes: [
      ["Kipping or kicking to get up", "Squeeze the legs together and slow down; use a band if needed."],
      ["Half reps that don't start from straight arms", "Count each rep only from a full hang."],
      ["Chin poking up to reach the bar", "Keep the neck long and bring the chest to the bar."],
      ["Shoulders shrugged up at the bottom", "Start each rep with the scapula pull."],
    ],
    breath: "Breathe out as you pull up, breathe in as you lower.",
  },
  archerPullUp: {
    setup: ["Hang from the bar with a wide grip, about 1.5–2× shoulder width, arms straight."],
    steps: [
      "Pull towards one hand: that arm bends while the other stays straight, sliding along the bar.",
      "Bring the chin over the working hand.",
      "Typewriter: at the top, slide over to the other hand staying at bar height, then lower.",
      "Lower under control and switch side.",
    ],
    targets: [
      "Working arm: elbow close to the body, ending at about 45° below the bar.",
      "Assisting arm: straight (elbow at 180°), pushing on the bar — it does as little as possible.",
      "Chin over the working hand, shoulders level with the bar.",
    ],
    mistakes: [
      ["Assisting arm bending", "Keep it locked; reduce the depth if you can't."],
      ["Body twisting towards the hand", "Keep the chest facing the bar."],
      ["Typewriter dropping halfway", "Slide slowly and keep the chin at bar height."],
    ],
    breath: "Breathe out on the way up, breathe in on the way down; in the typewriter breathe as you slide.",
  },
  oneArmPullUp: {
    setup: ["Hang from one arm with the shoulder active; the other hand on the wrist, a towel or a band as the version asks."],
    steps: [
      "Pull the working shoulder blade down and lock the core.",
      "Pull with the elbow towards the hip, turning the palm slightly towards you as you rise.",
      "Bring the chin over the bar, then lower over 3–5 s.",
    ],
    targets: [
      "Working elbow tight to the ribs, ending under the bar.",
      "Body upright and slightly turned towards the working arm; legs together, no kick.",
      "Bottom: the arm is straight, the shoulder active — no dead hang.",
    ],
    mistakes: [
      ["Spinning away from the bar", "Bring the free hand to the chest and squeeze the legs together."],
      ["Pulling with the free arm on the towel or wrist", "Use it only to balance, then lighten it."],
      ["Fast, dropped negatives", "Count 5 s for each negative; stop when you can't control them."],
    ],
    breath: "Breathe out on the hardest part of the pull, breathe in on the way down.",
  },
  lSitPullUp: {
    setup: ["Hang from the bar and raise the legs straight in front of you into an L (bent, for the tuck version)."],
    steps: [
      "Hold the legs at horizontal for the whole rep.",
      "Pull up until the chin is over the bar, keeping the L still.",
      "Lower to straight arms without dropping the legs.",
    ],
    targets: [
      "Hip angle at 90°: legs horizontal throughout.",
      "Knees locked and toes pointed (tuck: knees to the chest).",
      "Chin over the bar at the top; arms fully straight at the bottom.",
    ],
    mistakes: [
      ["Legs dropping as you pull", "Choose the tuck version until the L stays still."],
      ["Swinging the legs to get up", "Slow it down: 2 s up, 3 s down."],
      ["Short range", "Every rep from straight arms to chin over the bar."],
    ],
    breath: "Short exhale on the pull; short breaths in the hold.",
  },
  flagPullUp: {
    setup: ["Stand next to a vertical pole: top hand grips overhand at head height, bottom hand underhand 50–70 cm below."],
    steps: [
      "Lean the body sideways away from the pole with the arms straight (feet down to start).",
      "Pull with the top arm and push with the bottom one, bringing the hips and chest close to the pole.",
      "Lower slowly back to the straight-arm lean.",
    ],
    targets: [
      "Top arm pulls, bottom arm pushes: they work in opposite directions.",
      "Body sideways in a straight line from head to feet — hips don't sag.",
      "At the top, the top shoulder is level with the top hand.",
    ],
    mistakes: [
      ["Hands too close on the pole", "Hands at least shoulder width apart."],
      ["Bottom arm bending", "Lock the bottom elbow and push hard."],
      ["Hips sagging towards the floor", "Squeeze the side of the body facing up."],
    ],
    breath: "Breathe out on the pull, breathe in on the way down.",
  },
  muscleUp: {
    setup: ["Hang from the bar (false grip on the rings) with the hands shoulder-width apart; slight hollow body."],
    steps: [
      "Pull explosively, bringing the bar to the lower chest (the high pull).",
      "As the bar reaches the chest, lean the chest over the bar and bring the elbows quickly behind and up: the transition.",
      "Press out of the bottom of the dip until the arms are straight above the bar.",
      "Lower back the same way: dip, transition, hang — slowly.",
    ],
    targets: [
      "Pull high: the bar reaches the sternum or the belly button, not just the chin.",
      "In the transition the wrists turn over the bar and the shoulders go in front of the hands.",
      "Finish: arms straight, shoulders pressed down, body upright over the bar.",
    ],
    mistakes: [
      ["Pulling too low and getting stuck at the transition", "Practise high pull-ups to the chest first."],
      ["One arm turning over before the other (chicken wing)", "Turn both wrists over together; lower the volume."],
      ["Too much kip in the strict version", "Start each rep from a still hang."],
    ],
    breath: "Breathe in at the bottom, breathe out hard on the pull, breathe in again at the top.",
  },
  row: {
    setup: ["Lie under a low bar or rings at hip height; grip with the arms straight, heels on the floor, body straight."],
    steps: [
      "Squeeze glutes and abs so the body is a plank from heels to head.",
      "Pull the chest to the bar, bringing the elbows back close to the body.",
      "Pause 1 s at the top, then lower to straight arms.",
    ],
    targets: [
      "Body straight from heels to head the whole time: hips don't drop.",
      "At the top the chest touches the bar (or the rings are beside the chest), elbows at about 45° from the body.",
      "Shoulder blades squeezed together at the top.",
    ],
    mistakes: [
      ["Hips sagging", "Squeeze the glutes; bend the knees for an easier version."],
      ["Chin poking forward to reach the bar", "Lead with the chest and keep the neck long."],
      ["Stopping short of the bar", "Make the body more upright until you can touch the bar."],
    ],
    breath: "Breathe out as you pull, breathe in as you lower.",
  },
  frontLever: {
    setup: ["Hang from the bar or rings with a shoulder-width overhand grip and the arms straight."],
    steps: [
      "With the arms locked, pull the bar down towards the hips: the body tips back.",
      "Lift the hips until the body (or tuck) is horizontal, face up.",
      "Hold the line (or lift and lower it for raises; pull the bar to the hips for rows).",
      "Come out slowly the way you went in.",
    ],
    targets: [
      "Arms straight (180° at the elbow) and about 90° from the torso at the shoulder.",
      "Body horizontal: shoulders, hips and the end of the lever at the same height.",
      "Shoulder blades pulled down and back, a slight hollow in the lower back.",
    ],
    mistakes: [
      ["Hips sagging or piking", "Use an easier shape (tuck, advanced tuck) until the line is horizontal."],
      ["Bent elbows", "Lock the arms and push the bar towards your hips."],
      ["Holding the breath", "Breathe short and keep the tension."],
    ],
    breath: "Short, steady breaths in the hold; breathe out on the hardest part of raises and rows.",
  },
  germanHang: {
    setup: ["Hang from rings or bar; tuck the knees and roll backwards between the arms."],
    steps: [
      "Pass upside down with the knees tucked (skin the cat).",
      "Let the feet come down behind you until the shoulders are opened fully: the German hang.",
      "Pause, then pull back through the same way to the hang.",
    ],
    targets: [
      "Arms straight the whole time; the stretch is at the front of the shoulders.",
      "At the bottom the body hangs behind the hands, toes pointing to the floor.",
      "Go only as far as the shoulders allow without sharp pain.",
    ],
    mistakes: [
      ["Dropping into the bottom fast", "Lower slowly, using the knee tuck to control speed."],
      ["Bending the arms", "Keep the elbows locked; go less deep."],
      ["Going deeper than the shoulders allow", "Build depth over weeks, feet on the floor at first."],
    ],
    breath: "Breathe out as you pass upside down, breathe calmly in the hold.",
  },
  backLever: {
    setup: ["From the hang, roll back to the inverted hang (skin the cat), arms straight."],
    steps: [
      "From the inverted position, lower the body behind the hands with the arms locked.",
      "Stop when the body (or tuck) is horizontal, face down.",
      "Hold, or rise back to inverted for raises.",
    ],
    targets: [
      "Arms straight, slightly behind the body; hands close to the hips.",
      "Body horizontal, face down: shoulders, hips and feet at the same height.",
      "Glutes squeezed, lower back not arched.",
    ],
    mistakes: [
      ["Arching the lower back", "Squeeze the glutes and tuck the pelvis."],
      ["Bending the elbows", "Lock the arms; work in the tuck."],
      ["Hips dropping below the shoulders", "Push the hips up towards the line."],
    ],
    breath: "Breathe short in the hold; don't stop breathing.",
  },
  victorian: {
    setup: ["Rings, false grip. A very advanced hold: master the full back lever and the cross first."],
    steps: [
      "From the support or the back lever, take the arms forward-down and the body horizontal face up.",
      "Hold the body horizontal with the arms straight in front of the hips.",
      "Exit by bending to a tuck or going back to the support.",
    ],
    targets: [
      "Body horizontal face up, arms straight and angled forward from the hips.",
      "Shoulders strongly depressed, ribs closed.",
      "Feet support only in the assisted version — use as little as possible.",
    ],
    mistakes: [
      ["Elbows bending", "Stop the set: the Victorian is only done straight-armed."],
      ["Hips sagging", "Squeeze the glutes and the abs."],
      ["Training it too often", "1–2 times a week at most, with rest days for the elbows."],
    ],
    breath: "Short breaths, keep the tension; exit before you lose shape.",
  },
  ironCross: {
    setup: ["Rings at shoulder height or higher, turned out; start from a strong support hold."],
    steps: [
      "From the support, open the arms out to the sides slowly with straight elbows.",
      "Stop where you can still control (tuck/assisted) or with the arms horizontal (full cross).",
      "Hold, then press back to the support.",
    ],
    targets: [
      "Arms straight and horizontal, in line with the shoulders, rings beside the shoulders.",
      "Body vertical (or upside down in the inverted cross), legs together.",
      "Shoulders pushed down — not by the ears.",
    ],
    mistakes: [
      ["Bent elbows", "The cross is a straight-arm hold: lower the difficulty."],
      ["Rings drifting forward", "Keep the rings in line with the shoulders, out to the side."],
      ["Shrugging", "Press the rings down and away from you."],
    ],
    breath: "Short, steady breaths; never hold the breath in a straight-arm hold.",
  },
  ringPullOut: {
    setup: ["Support on the rings, arms straight, turned out, body upright."],
    steps: [
      "Slowly let the rings slide out to the sides while the body sinks a little.",
      "Go only as far as you can still control (a slight turnout to start).",
      "Pull the rings back in to the support with straight arms.",
    ],
    targets: [
      "Arms always straight: the elbows don't bend.",
      "Rings move out to the sides, not forward.",
      "Shoulders pushed down the whole time.",
    ],
    mistakes: [
      ["Bending the elbows to come back", "Reduce the range until you can come back straight."],
      ["Rings drifting forward", "Keep them in line with the shoulders."],
      ["Going too wide too soon", "Increase the range by a few centimetres a week."],
    ],
    breath: "Breathe in as the rings go out, breathe out as you pull them back.",
  },
  straightArmPulldown: {
    setup: ["Anchor a band above head height; stand facing it, arms straight forwards and up, holding the band."],
    steps: [
      "With the elbows locked, pull the band down in an arc to the thighs.",
      "Squeeze the lats and the shoulder blades down at the bottom.",
      "Return slowly to the start.",
    ],
    targets: [
      "Elbows straight (180°) for the whole arc.",
      "Torso still, slightly hollow — no leaning back.",
      "At the bottom the hands reach the thighs, shoulders far from the ears.",
    ],
    mistakes: [
      ["Bending the elbows", "Lighter band, arms straight."],
      ["Leaning back to help", "Keep the ribs down and the hips still."],
      ["Fast return", "2–3 s back up."],
    ],
    breath: "Breathe out as you pull down, breathe in as you return.",
  },
  ropePull: {
    setup: ["Sit on the floor with the legs straight, holding the rope in front at arm's length."],
    steps: [
      "Pull with one arm, bringing the hand to the chest.",
      "Reach up with the other hand and grab higher.",
      "Continue hand over hand, pulling the body slightly up.",
    ],
    targets: [
      "Pull with the back: elbows go down and back, not out.",
      "Torso upright, legs straight on the floor.",
      "Hands always above the previous grip — no sliding.",
    ],
    mistakes: [
      ["Pulling only with the biceps", "Start each pull with the shoulder blade going down."],
      ["Leaning back", "Keep the torso upright."],
      ["Letting the rope slide in the hands", "Grip firmly before each pull."],
    ],
    breath: "Breathe out on every pull.",
  },
  ropeClimb: {
    setup: ["Grip the rope at full reach; learn the foot lock (rope between the feet, one foot on top) before climbing high."],
    steps: [
      "Pull with the arms and bring the knees up.",
      "Lock the rope between the feet and stand up on it.",
      "Reach higher with the hands and repeat; legless: arms only, hand over hand.",
      "Come down hand under hand, never sliding.",
    ],
    targets: [
      "Feet lock firmly: the rope is pinched between the soles.",
      "Arms pull to the chest, legs push: the work is shared.",
      "Descent controlled, hand under hand.",
    ],
    mistakes: [
      ["Arms only, when the legs could help", "Use the foot lock in all but the legless version."],
      ["Losing the leg lock on the way down", "Keep the lock until the feet are near the floor."],
      ["Sliding down fast", "Always hand under hand — sliding burns the hands."],
    ],
    breath: "Breathe out on every pull, breathe in as you reset the feet.",
  },
  monkeyBars: {
    setup: ["Hang from the first rung with both hands, arms straight."],
    steps: [
      "Swing the body slightly to the side of the free hand.",
      "Reach for the next rung at the top of the swing.",
      "Continue alternating, using the rhythm of the swing.",
    ],
    targets: [
      "Arms mostly straight: you hang, you don't pull up.",
      "Shoulders active: they don't collapse at each grab.",
      "A smooth, continuous rhythm from bar to bar.",
    ],
    mistakes: [
      ["Stopping to rest between bars", "Keep moving with the swing; rest at the end."],
      ["Bent, tired arms", "Hang long between grabs."],
      ["Reaching without using the swing", "Swing first, then reach."],
    ],
    breath: "Breathe in rhythm with the grabs.",
  },
  humanFlag: {
    setup: ["Grip a vertical pole: top hand overhand at head height, bottom hand underhand about shoulder width lower."],
    steps: [
      "Push hard with the bottom arm and pull with the top one.",
      "Lift the body sideways: start in the tuck, then extend the legs.",
      "Hold horizontal, then come down under control.",
    ],
    targets: [
      "Bottom arm locked straight, pushing; top arm straight, pulling.",
      "Body horizontal: shoulders, hips and feet in one line.",
      "Hips stacked: the top hip right above the bottom one.",
    ],
    mistakes: [
      ["Bottom arm bending", "Push hard; build the strength with pole leans."],
      ["Hips dropping", "Squeeze the top side and lift the top leg."],
      ["Hands too close", "Hands at least shoulder width apart."],
    ],
    breath: "Short breaths in the hold.",
  },
  poleLean: {
    setup: ["Grip a vertical pole as for the flag; feet on the floor, a step away from the pole."],
    steps: [
      "Lean the body sideways away from the pole, arms straight.",
      "Push with the bottom arm and pull with the top one, feeling the side of the body work.",
      "Hold, then come back upright.",
    ],
    targets: [
      "Arms straight; the bottom arm pushes, the top one pulls.",
      "Body straight from head to feet, leaning about 45°.",
      "Feet light on the floor: they take only the weight you can't yet hold.",
    ],
    mistakes: [
      ["Hips sagging towards the pole", "Push the hips away and keep the body straight."],
      ["Bottom arm bending", "Lock the elbow and push."],
      ["Too much weight on the feet", "Lean further as you get stronger."],
    ],
    breath: "Breathe calmly in the hold.",
  },
  giantSwing: {
    setup: ["Advanced: learn on a low bar with a spotter or a strap. Overhand grip, thumbs around, chalk."],
    steps: [
      "From the support on the bar, cast the body back and up towards the handstand.",
      "Swing down in a long, straight body, arms locked.",
      "Snap from arch to hollow at the bottom to bring the body up and around the bar.",
      "Bring the hands over the bar at the top to complete the circle.",
    ],
    targets: [
      "Arms straight for the whole circle.",
      "Body long and straight on the way down, a slight hollow on the way up.",
      "Wrists shift over the top of the bar as the body passes the handstand.",
    ],
    mistakes: [
      ["Bending the arms", "Lock the elbows; it's the swing that brings you around."],
      ["Loose grip at the top", "Regrip quickly as you pass over the bar."],
      ["Training it without a spotter or strap", "Always learn it with help."],
    ],
    breath: "Breathe in at the top, breathe out as you snap through the bottom.",
  },
  hipCircleBar: {
    setup: ["Front support on the bar: hands overhand, arms straight, bar at the hips."],
    steps: [
      "Lift the legs back slightly, then let them come forward against the bar.",
      "Lean the shoulders back and turn around the bar, keeping the hips on it.",
      "Come back to the front support.",
    ],
    targets: [
      "Hips stay in contact with the bar throughout.",
      "Arms straight in the support, slightly bent while turning.",
      "Legs together and straight.",
    ],
    mistakes: [
      ["Hips moving away from the bar", "Keep the bar under the hips the whole time."],
      ["Opening too early", "Stay tight until you're back in the support."],
      ["Loose grip", "Squeeze the bar and regrip as you come up."],
    ],
    breath: "Breathe out as you turn.",
  },
  barSpin: {
    setup: ["Advanced bar trick. Learn with the feet assisted on a low bar; chalk and a soft landing area."],
    steps: [
      "From the support, swing the body to build momentum.",
      "Turn the body around the bar (windmill: legs around; around the world: the whole body).",
      "Keep the hands moving to regrip as the body passes over.",
      "Finish in the support or in a controlled hang.",
    ],
    targets: [
      "The rotation comes from the swing and the hips, not from pulling with bent arms.",
      "Hands always on the bar or regripping in the same instant.",
      "Body tight and compact while turning.",
    ],
    mistakes: [
      ["Letting go too early", "Regrip one hand at a time, never both."],
      ["Too little momentum", "Build the swing before trying to go around."],
      ["Trying it high without assistance", "Start low, with the feet helping."],
    ],
    breath: "Breathe out during the rotation.",
  },
};
