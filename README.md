# BarQuests

A gamified, mobile-first calisthenics training app: complete sessions
(warm-up → main focus → accessory → finisher) tailored to your body stats,
skill stage — across 50 tracked skills, from Front Lever to Iron Cross, Victorian Cross, and
Manna, each with its own description in a full skills catalog — and the
equipment you actually have at your park, including bands and weights —
with a per-exercise timer, AI-powered technique tips, a casino-style bonus
wheel with randomized modifiers (and a nudge toward an easier skill if you
pick one that's a stretch for your level), a Clash Royale-style trophy road
mapping every skill across your level with its own calisthenics-flavored
chapter titles — unified with a single XP/level number via a 1-5 mastery
rating per skill, so a skill you've truly mastered raises your level
immediately while one you've merely attempted stays honest without being
blocked outright — live easier/harder adjustments, celebration animations, streaks that freeze
through rest days instead of breaking, weekly missions, skill/XP charts, a
redesigned dashboard, a pomodoro-style focus timer, day/week/month plan
generation with optional AI coach notes, a friends list with mutual add and
nudges, daily training reminders with rotating fun
punch-lines, and paired training via a share
code. Installable as a PWA.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Firebase Auth (Google sign-in) + Firestore
- No chart library — the radar and XP charts are custom SVG

## 1. Install

```bash
npm install
```

## 2. Create a Firebase project

1. Go to https://console.firebase.google.com and create a project.
2. **Authentication** → Sign-in method → enable **Google**.
3. **Firestore Database** → create a database (start in production mode).
4. Project settings → General → "Your apps" → add a **Web app** → copy the config values.

Create `.env.local` from the example and fill in the values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 3. Firestore security rules

In the Firebase console → Firestore → Rules, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /friends/{friendUid} {
        allow read: if request.auth != null && request.auth.uid == uid;
        // both sides of a mutual add need to write: the person adding writes
        // their own list (auth.uid == uid) AND mirrors the entry into the
        // other person's list (auth.uid == friendUid, the doc's own id).
        allow write: if request.auth != null &&
          (request.auth.uid == uid || request.auth.uid == friendUid);
      }

      match /pings/{pingId} {
        allow read, delete: if request.auth != null && request.auth.uid == uid;
        // only an established friend can drop a nudge in your inbox
        allow create: if request.auth != null && request.auth.uid != uid &&
          request.resource.data.fromUid == request.auth.uid &&
          exists(/databases/$(database)/documents/users/$(uid)/friends/$(request.auth.uid));
      }
    }

    // minimal public info so friends can be found by code — see PublicProfile
    match /profiles/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    // friend-code -> uid reverse lookup, one doc per user, immutable once set
    match /usercodes/{code} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }

    match /pairings/{code} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.hostUid == request.auth.uid;
      allow update: if request.auth != null &&
        (resource.data.hostUid == request.auth.uid ||
         request.resource.data.guestUid == request.auth.uid);
    }
  }
}
```

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000, sign in with Google, and step through the
onboarding wizard. On a phone, or after `npm run build && npm start` in a
real (non-dev) environment, you can install it as an app from the browser's
"Add to Home Screen" / install prompt — it ships a manifest and service worker.

## How it works

- **Landing page** (`/`, signed-out visitors only) — no longer just a
  sign-in button. A **live bonus wheel demo** (`LandingWheelDemo.tsx`) lets
  anyone spin for a real exercise across 12 curated skills — same pool
  logic as the real wheel, same exercise timer, same AI tip button —
  entirely without an account (it spins against `DEFAULT_SKILLS`/
  `DEFAULT_EQUIPMENT` at a beginner-appropriate difficulty, and doesn't
  award XP since there's no account to award it to). Below that, a
  **progress preview** (`LandingProgressPreview.tsx`) shows what tracking
  actually looks like — a level/streak card, the skill radar chart, and a
  trophy-road snippet — using clearly-labeled fabricated example data, not
  live or real in any way. A feature grid and a second sign-in CTA close
  out the page. Signed-in visitors still get redirected straight past all
  of this to `/dashboard` or `/onboarding` as before.
- **Onboarding** (`/onboarding`) is a 4-step mobile wizard:
  1. **About you** — age/height/weight via scroll-snap pickers (a wheel for
     age and weight, a tick-marked ruler for height), sex, which specific
     days of the week you train (a Sun–Sat toggle row, not just a count),
     and typical session length.
  2. **Where you train** — pull-up bar, parallel bars/dip station, rings,
     wall space, vertical pole/tree, monkey bars, resistance/elastic bands,
     and whether you have any weight (a dip belt, weighted vest, plates, or
     a loaded backpack) — exercises that would otherwise call for weight or
     bands automatically swap to what you actually have.
  3. **Your skills** — all 50 tracked skills, from the everyday (Front
     Lever, Planche, Muscle-Up, Handstand) through the rarer/advanced ones
     (Iron Cross, Maltese, One-Arm Pull-Up, One-Arm Handstand, Victorian
     Cross, Manna, and 38 more — see "The 50 skills" below for the full
     list). A horizontal scroller picks which skill you're setting
     (`src/components/SkillTabPicker.tsx`) instead of stacking 50 pickers
     down the page. For whatever stage you set, you also rate how solid it
     is on a 1-5 mastery scale — see "Unified with XP and leveling" below
     for what that actually gates — plus max pull-ups/dips and archer
     pull-up.
  4. **Your goals** — pick up to 4 skills you most want to progress; those
     focuses show up more often in your training rotation.
- **Training** (`/training`) generates a *complete* session for a rotating
  daily focus across 10 tracks — Front Lever, Back Lever, Planche, Muscle-Up,
  Handstand, Human Flag, Pull Strength, Push Strength, Legs, Core — pulled
  from progression tables keyed to your exact stage. Every session has four
  parts: a **Warm-Up** (generic mobility/activation, rotates daily), the
  **Main Focus** (the day's skill work — the tables are already ordered from
  foundational/propedeutic drills up through the harder work for that
  stage), an **Accessory** block (a complementary strength track), and
  **Final Hits** (a short conditioning finisher). Only focuses your
  equipment can actually support show up (front lever/back lever/muscle-up/
  pull strength need a bar; human flag needs a pole; push strength swaps
  dips for push-ups without bars; handstand swaps wall drills for
  freestanding/crow work without a wall). Legs and Core always work with
  nothing but ground space. Goal tracks are marked with a ★ and appear
  roughly twice as often. Each exercise has a **Start** button that opens an
  inline timer already configured for that exercise's sets, reps, and rest
  (see below), and **−/+** buttons to make it easier or harder on the fly.
  Completing a session awards XP, updates your streak, logs an XP history
  point, progresses weekly missions, and shows a celebration animation for
  level-ups and streak milestones.
- **Dashboard** (`/dashboard`) — a hero "today's session" card as the
  primary call to action, a stat row (streak, skills started out of 50,
  total sessions — each tapping through to where it's explained further),
  the XP bar, this week's missions, and a 6-tile quick-action grid (bonus
  wheel, plan ahead, pair up, skills catalog, focus timer, trophy road).
- **Profile** (`/profile`) — your detailed stats: an SVG skill radar chart
  across the 8 foundational skills, a full scrollable list of all 50
  skills and your stage in each, an XP-over-time line chart, your goal
  chips, body stats, and your equipment list.
- **Trophy road** (`/path`) — a Clash Royale-style level path mapping
  every one of the 50 skills across levels 1–66; see its own section below.
- **Plan** (`/plan`) — generates a schedule instead of just today's
  session: pick Today / This week / This month and it lays out each day's
  focus (or rest day) using the same deterministic, equipment- and
  goal-aware logic as the daily generator, using the exact weekdays you
  picked in onboarding (e.g. "Mon/Wed/Fri") rather than just a count. Tap
  any day to preview its exercises; today's day links straight into
  `/training` to actually log it. An optional "Add AI coach notes" toggle
  calls a small OpenRouter model to write a short intro and one line of
  encouragement per day — see below.
- **Pair Up** (`/pair`) — one person creates a 6-character code from their
  profile and the equipment at their spot, the other enters it from their own
  account. Once linked, the app generates a shared-focus session where each
  person gets exercises matched to their own stage, gated by the shared
  location's equipment, with synced set/rest structure.
- **Focus Timer** (`/pomodoro`, also toggleable inside a training session) is
  a configurable work/rest interval timer with a 3-2-1 countdown before it
  starts and a distinct audio cue for each transition (see the "Per-exercise
  timer" section below for the full sound design, shared with this timer).
- **Bottom tab bar** is the primary navigation on phones (Home / Train /
  Skills / Pair / Profile); a slim top bar with a secondary nav row appears
  on wider screens. The Pomodoro timer and Trophy road moved off the tab
  bar to make room for Skills — both stay one tap away via Dashboard quick
  links and (for the trophy road) the clickable level badge.
- **PWA**: `public/manifest.json` + `public/sw.js` (network-first with
  app-shell caching) + generated icons in `public/icons/`. Registered from
  `src/components/PWARegister.tsx`. `display: "standalone"` plus a
  `display_override` fallback list keep the installed app's browser address
  bar hidden across engines; `appleWebApp.statusBarStyle:
  "black-translucent"` gives the same effect on iOS but draws page content
  underneath the status bar, so `env(safe-area-inset-top)` padding is
  applied globally at the `body` level in `globals.css` (a no-op in a
  normal browser tab, non-zero once installed) to keep content clear of the
  notch/status bar on every page, not just ones using the shared `Nav`.
  **If you change manifest/meta PWA settings, existing installs won't pick
  them up automatically** — uninstall and reinstall the PWA (remove it from
  the home screen, revisit the site, install again) to see changes; this is
  a platform limitation, not a bug in the app.

## The 50 skills, and how they fit together

There are two layers, kept deliberately separate:

- **10 macro tracks** (`SkillTrack` in `src/lib/types.ts`) — Front Lever,
  Back Lever, Planche, Muscle-Up, Handstand, Human Flag, Pull Strength, Push
  Strength, Legs, Core. These drive the daily session rotation and goals —
  keeping the rotation at 10 (rather than 50) means each focus still comes
  around every few days instead of once every seven weeks.
- **50 individually-progressed skills** (`StagedSkillKey`) — the 8 skills
  behind those macro tracks (Front Lever, Back Lever, Planche, Muscle-Up,
  Handstand, Human Flag, Pistol Squat, L-Sit), plus 42 more that aren't part
  of the daily rotation but are fully tracked, staged, and trainable. 12 of
  those are the original "rarer/advanced" set (Iron Cross, Maltese, One-Arm
  Pull-Up, One-Arm Handstand, Dragon Flag, Elbow Lever, One-Arm Push-Up,
  Nordic Curl, Shrimp Squat, Handstand Push-Up, Impossible Dip, Manna —
  `src/lib/advancedSkills.ts`), and 30 more round it out to 50
  (`src/lib/advancedSkills2.ts`): Clap Push-Up, Kip-Up, Back Flip, Front
  Flip, Windmill, Around the World, Handstand Walk, Wall Walk, Superman
  Hold, Side Plank, Copenhagen Plank, Bridge, Turkish Get-Up, Pike Press,
  Rope Climb, Skin the Cat, German Hang, Chest-to-Bar Pull-Up, Wide-Grip
  Pull-Up, Ring Muscle-Up, 90° Push-Up, Jump Pistol, Sissy Squat, Cossack
  Squat, Flag Pull-Up, L-Sit Pull-Up, Typewriter Pull-Up, Toes-to-Bar,
  Inverted Cross, and Victorian Cross. To keep 42 skills' worth of data
  tractable, most of the 30 newest ones share one of two generic
  progressions (`SimpleSkillStage`: none → developing → full, or
  `AssistedSkillStage`: none → assisted → developing → full) rather than
  each getting a bespoke stage vocabulary — the original 20 keep their
  specific named stages (tuck, straddle, one-leg, etc).

  If you're actively working on one of the 42 (stage past "none", and you
  have the equipment it needs — Iron Cross and Maltese want rings, Flag
  Pull-Up wants a pole, and so on, checked via `advancedSkillAvailable`), a
  bonus block for it shows up in your regular sessions
  (`advancedSkillBonusSet`), and all 50 are always spinnable on the bonus
  wheel regardless of the daily rotation.

**Progression audit.** A few of the original 8 skills' stage ladders were
missing a rung — fixed:
- Back Lever was missing "one leg" (Front Lever always had it) — added
  between advanced tuck and straddle.
- Human Flag was missing "advanced tuck" (the single-leg-tuck stage) —
  added between tuck and straddle.
- Pistol Squat was missing an explicit "negative" stage between the basics
  and assisted work — added, and the box/bench-negative exercises that used
  to sit oddly in the "none" stage moved there.

Every stage-keyed exercise table's keys are cross-checked against its
skill's stage type at the source level — if you add a stage to a skill,
TypeScript won't catch a table that's missing it (the tables are typed as
`Record<Stage, Exercise[]>`, so a missing key is a compile error), but a
*typo'd* stage name in the separate `STAGE_ORDER` map (`src/lib/stageOrder.ts`)
would silently resolve to nothing at runtime since it's a plain string-keyed
lookup. All 50 skills' stage lists were cross-checked programmatically
against both their type definitions and `STAGE_ORDER` before shipping (zero
mismatches) — worth re-running that check if you add or rename a stage;
it's a few lines: diff each `XStage` union (or `SimpleSkillStage`/
`AssistedSkillStage`) in `types.ts` against `STAGE_ORDER[x]`.

## Trophy road (`/path`)

A Clash Royale-style level path — every level from 1 up shows roughly
what's within reach, grouped into chapters that reuse the same rank titles
shown elsewhere (`RANK_TITLES` in `src/lib/xp.ts`, now with a short flavor
`blurb` per tier too, so "Chapter 3" on the road and your rank badge always
agree and read like an actual progression story, not a spreadsheet). The
data lives in `src/lib/levelPath.ts`: 66 milestones spanning levels 1–66,
hand-placed so every one of the 50 skills gets at least one milestone, and
the 8 foundational skills (plus a few flagship advanced ones) get multiple
as they climb toward "full" — so leveling up keeps paying off on skills you
already have, not just handing out new ones. A handful of plain numeric
milestones (pull-up/dip rep targets) are mixed in for the non-staged
strength numbers. Every node's skill+stage reference was cross-checked
against the real stage tables before shipping.

**Deliberately not strict.** The copy throughout is phrased as guidance,
not requirements — "around level 16" rather than "level 16 required,"
milestones use a sparkle rather than a hard lock icon, and the intro text
says outright that it's "a loose guide, not a checklist." The goal is a
sense of a calisthenics journey with real names and titles attached to your
progress, not a gate you have to satisfy.

**Reachable from everywhere.** The level display is clickable throughout
the app — the level badge in the top nav bar, and the whole XP/streak card
on the Dashboard — both link straight to `/path`. It's also linked directly
from the Dashboard's quick actions.

The screen (`src/app/path/page.tsx`) renders chapters highest-to-lowest —
level 1 ends up at the bottom of the page, higher levels toward the top —
and auto-scrolls to center your current level on open, so you land right
where you are rather than at the very bottom every time. Passed milestones
show a checkmark; your current level gets a pulsing highlight.

**Unified with XP and leveling, via a 1-5 mastery rating.** Skills feed
directly into your level rather than sitting next to it as a separate
display — but "possessing" a skill isn't binary. Every skill claim carries
a mastery rating (`SkillMastery` in `src/lib/types.ts`):

| Mastery | Label | Meaning |
|---|---|---|
| 1 | Attempted | Tried it, not really landing it yet |
| 2 | Touched it | Hit it once or twice — brief, rough form |
| 3 | Getting there | Can do it, but inconsistent or not clean |
| 4 | Consistent | Reliable, decent form most of the time |
| 5 | Mastered | Clean, full target reps or hold, controlled |

**Mastery 1-2 are always self-reportable, at any level, no gate at all** —
that's the explicit exception for having hit a skill once, briefly, or
badly: log it as "Attempted" or "Touched it" regardless of where your level
actually is, and it's honest, not a workaround. Mastery 3-5 require being
within reach of that stage's trophy-road level, progressively stricter:

```
required level for mastery 3  =  node's road level − 15
required level for mastery 4  =  node's road level − 5
required level for mastery 5  =  exactly the node's road level
```

(`requiredLevelForMastery` / `canClaimMastery` in `src/lib/levelPath.ts`.)
Onboarding's skill picker (`SkillTabPicker.tsx`) enforces this directly —
mastery options you haven't reached show a lock icon and a "unlocks around
level N" hint, live-recalculated as you edit other skills in the same
session, with a running "level so far" indicator at the top of the step so
you can watch it build. A brand-new claim always starts at mastery 1 by
default; you raise it deliberately, not automatically.

Only mastery 3+ counts toward your level floor at all, and even then it's
discounted by the same margin as its gate — mastery 3 credits `node − 15`,
mastery 4 credits `node − 5`, mastery 5 credits the full node level. So
claiming "Attempted" on Victorian Cross at level 1 is honest and free, but
doesn't inflate your level; claiming real competency does, and can only
happen once you're actually in range. `skillFloorLevel` /
`effectiveLevel` in `src/lib/levelPath.ts` do this computation; a
pre-existing account with a stage set but no recorded mastery (from before
this system existed) defaults to mastery 3 rather than being penalized to 1.

This was a deliberate design choice over the alternative (a second, separate
"skill level" alongside the XP level): two numbers competing for "which one
is my real level" would undercut having one coherent trophy road in the
first place. The floor mechanism reuses the trophy road's own data as the
single source of truth, so the road and your displayed level literally
cannot disagree — no separate weighting table to keep in sync. Every
consumer of level/XP in the app (`Nav`, `XPBar`, `/profile`, `/skills`,
`/wheel`, `/path`, `/onboarding`, and `sessionComplete.ts`'s
celebration/friend-profile sync) goes through
`effectiveLevel`/`effectiveXpProgress` — now all taking `skillMastery` as a
parameter — rather than the raw XP curve, so this is consistent everywhere,
not just on the dashboard.

**What's actually enforced now, versus what remains advisory:** the level
*floor* is a real, load-bearing gate — you cannot claim high mastery on a
skill without the level to back it, full stop. What's still *not* gated is
the underlying stage itself (front lever's tuck/straddle/full progression,
etc.) — you can mark any stage for any skill at low mastery regardless of
level, and self-reported stage (not mastery, not level) is still what the
training generator, the bonus wheel, and the radar chart use to tailor
actual session content. Going further — e.g. having the exercise
prescriptions themselves (reps/hold targets in `Exercise.detail`) scale
with level rather than being fixed per stage — would be a further step
touching the training generator directly and remains out of scope for this
pass.

## Skills catalog (`/skills`) and "too hard for your level" suggestions

A dedicated browsing screen for all 50 skills, grouped into six categories
(Levers & Static Holds, Pulling, Pressing & Balance, Core & Compression,
Legs, Dynamic & Flashy — `src/lib/skillCategories.ts`, cross-checked to
cover exactly the 50 skills with no gaps or overlaps). Every skill has:

- An **i** info icon that opens a modal
  (`src/components/SkillInfoModal.tsx`) with a plain-English description of
  what the skill actually is (`src/lib/skillDescriptions.ts` — one written
  for each of the 50), your current self-reported stage, and its suggested
  arc on the trophy road (e.g. front lever: tuck around level 16, straddle
  around 40, full around 61).
- Tapping the skill itself (or "Train this skill" in the modal) sends you
  to the bonus wheel pre-loaded with that skill via `/wheel?skill=<skill>`.

**The same info icon appears everywhere else a skill name is shown, not
just here.** `SkillInfoModal` and a small shared `InfoIconButton`
(`src/components/InfoIconButton.tsx`) are used consistently across:
- The skills catalog above (per-row icon).
- Onboarding's skill picker (`SkillTabPicker.tsx`) — icon next to the
  currently-selected skill's name in the detail panel; the modal there hides
  the "train this" CTA (`showTrainCta={false}`) since navigating away
  mid-setup doesn't make sense.
- The Profile page's "All skills" strip — a small icon in the corner of
  each of the 50 tiles.
- The bonus wheel (`/wheel`) — icon next to the currently-selected skill,
  above the picker row.
- The trophy road (`/path`) — icon next to each milestone's skill+stage line.
- The landing page's wheel demo (`LandingWheelDemo.tsx`) — icon on each of
  its 12 demo-picker chips, with no player level/mastery context (there's no
  account yet) and the train CTA hidden.

`SkillInfoModal` is built to degrade gracefully for exactly this reason —
`playerLevel`, `skills`, and `skillMastery` are all optional props, so the
same component renders sensibly whether it's called with a full real
account (stage, mastery, and the stretch-suggestion logic all show) or with
none of that (just the plain description, as on the landing page).

**One deliberate scoping choice:** the two large horizontal skill-chip
scrollers (onboarding's 50-skill picker and the wheel's ~45-skill picker)
do *not* get an icon on every individual chip — cramming a second small tap
target into that many already-compact mobile chips would make them
error-prone to hit accurately. Each of those screens instead has one
larger, prominent display of whichever skill is currently selected, and
that's where the info icon lives; every skill is still reachable, just via
selecting it first rather than an icon on every chip in a fast scroll.

**Suggesting an easier skill.** If the skill you pick is well beyond where
the trophy road says you typically are — `isSkillAStretch` in
`src/lib/levelPath.ts`, currently "more than 6 levels ahead of you" — both
the info modal and the wheel screen itself show a gentle suggestion instead
of silently sending you in over your head: "this one's a stretch for level
N — [suggested skill] might be a better fit," with buttons for either the
suggested skill or "train this anyway." The suggested alternative
(`suggestEasierSkill`) is the highest-level trophy-road milestone that's
already within your reach and that you haven't self-reported any progress
on yet — so it's tailored to what you specifically haven't started, not a
generic "go do the basics" nudge. Like the rest of the road, this is
advisory, never a hard block — "train this anyway" is always right there.

## Notes / where to extend (skills & path)

- To add a 51st skill: add its `Stage` type (or reuse `SimpleSkillStage`/
  `AssistedSkillStage`) and a `SkillProfile` field in `types.ts`, add it to
  `DEFAULT_SKILLS`, `AdvancedSkill`, `ADVANCED_SKILL_LABEL`, and
  `STAGE_ORDER`; write its exercise table in `advancedSkills2.ts` (or a new
  file) and register it in `ADVANCED_TABLES` in `advancedSkills.ts`; add it
  to the `SKILL_ORDER` arrays in `SkillTabPicker.tsx`, the profile page, and
  the wheel page; optionally give it a `LEVEL_PATH` milestone.
- The trophy road's chapter grouping is derived from `RANK_TITLES`, not
  hardcoded — add a rank tier there and the road picks it up automatically.

## Exercise timer, the bonus wheel, AI tips, and live adjustments

**Per-exercise timer, built for eyes-free use with earphones.** Every
exercise has a **Start** button. Tapping it opens an inline timer parsed
straight from that exercise's own sets/reps text
(`src/lib/exerciseTiming.ts`) — no separate configuration step. Every set —
whether it's the first tap of Start or an automatic continuation — begins
with an on-screen **3-2-1 countdown** so you have a moment to get in
position before anything actually starts.

For timed holds (front lever holds, planche leans, anything with an
explicit or implied duration), the whole exercise runs hands-free once you
tap Start once: countdown → work countdown → rest countdown → countdown for
the next set → work → ... straight through to the last set, with no further
taps needed (`src/components/ExerciseTimer.tsx`). For rep-based exercises
(where "reps" are inherently self-paced) it shows a "Done with this set"
button once the countdown ends — tapping it kicks off the rest countdown
and then automatically counts down into the next set, so only the "I've
done my reps" moment itself needs a tap.

**A deliberately distinct sound for each event**, so you can tell what's
happening by ear alone with earphones in, never needing to look at the
screen (`src/lib/sound.ts`):
- `playCountdownTick` — short, neutral, mid-pitch: each second of the 3-2-1.
- `playGoSound` — a bright ascending double-beep, high register: work starts.
- `playRestSound` — a single low, sustained tone: rest starts, ease off.
- `playCompleteSound` — a rising three-note chime: the whole exercise is done.

The same sound set drives the standalone **Pomodoro/focus timer**
(`src/components/PomodoroTimer.tsx`) too — its first Start press (or any
press after Reset) gets the same 3-2-1 countdown, and each automatic
work↔rest phase transition plays the matching go/rest sound. Pausing and
resuming mid-phase does *not* re-trigger the countdown — that's reserved
for genuinely fresh starts — so a quick pause to check something doesn't
force you to wait through 3 seconds again.

**Bonus wheel** (`/wheel`, its own screen — linked from the Training page).
Casino-style: pick any of the 50 skills you have equipment for and a
difficulty (Easier / Your level / Harder), then spin. The exercise pool
isn't just one stage's 3 exercises — it combines exercises from *every*
stage of that skill, weighted so stages near your chosen difficulty come up
more often without excluding the rest (`wheelPoolWeighted` in
`src/lib/wheelPool.ts`), landing on 20+ possible segments. A "🔀 Randomize
skill too" button next to Spin picks a random skill *and* difficulty from
whatever you have equipment for, then spins immediately — for when you want
the skill itself to be part of the chance too, not just the exercise and
modifier (`spinRandomSkill` in `src/app/wheel/page.tsx`). Both this and the
regular Spin button funnel into the same `runSpin(pool)`, which takes the
exercise pool as an explicit argument rather than reading it from state —
that's what avoids a re-render race between "the skill/difficulty just
changed" and "the pool for the wheel visual just got set," since both
updates land in the same React batch as the spin actually starting.

The bonus/malus system sits **above** the wheel as two side-by-side
vertical reels — a modifier *type* on the left, its *quantity* on the
right — and both spin the moment you hit Spin, alongside the wheel itself.
They resolve in sequence: the type reel locks in first (2s), then the
quantity reel locks in on a magnitude specific to that type (another
1.2s) — e.g. type "More Sets" pairs with a quantity like "+1"/"+2"/"+3";
type "Multiplied XP" pairs with "x2"/"x3"/"x5"; type "Easy Mode" pairs with
"-2 reps"/"1/2 time"/"-5s hold" — and only *then*, another second later,
does the wheel itself land and reveal the exercise. All three reveals are
pre-decided the instant you hit Spin (`spin()` in `src/app/wheel/page.tsx`)
and just disclosed on a timer, so the sequence is always type → quantity →
exercise, never out of order. There are 10 modifier types spanning 25
distinct type+quantity combinations (`src/lib/wheelModifiers.ts`) — More
Sets, Fewer Sets, More Rest, Less Rest, Bonus Effort, Easy Mode, Bonus XP
(flat), Multiplied XP, the rare golden "🌟 Golden Exercise" (big multiplier,
no downside), and a weighted "No Bonus" that stays the most common outcome.
Modifiers that touch numbers do it precisely (sets via the same parser the
difficulty ±buttons use, rest via the exercise's actual `restSeconds`
field); the effort-based ones append a descriptive cue instead, since reps
vs. hold-time isn't a single mutable number across every exercise format.
Finishing the composed exercise via the same Start-timer button banks bonus
XP (multiplied and/or flat-bonused per the modifier), completely separate
from a regular session's XP/streak/missions (`awardXp` in
`src/lib/sessionComplete.ts`).

**AI exercise tips.** Every exercise (in a session or on the wheel) has an
"AI tip" button. Tapping it lazily fetches — and caches, so it won't
re-fetch — a specific technique cue and the most common mistake for that
exact exercise from a small OpenRouter model (`/api/exercise-tip`). Same
safety scoping as the plan-level coach notes: it's given the exercise and
its prescription only for context and is explicitly told never to change or
repeat back sets/reps — it only ever returns coaching text. Same
`OPENROUTER_API_KEY` setup as below; without it, the button just says AI
tips aren't configured, and everything else keeps working.

**Live difficulty adjustment.** Each exercise also has small **−** / **+**
buttons next to its sets/reps text. These bump the set count up or down for
*that one session* only (`src/lib/exerciseTiming.ts`'s `adjustDetail`) — a
quick "today this felt too easy/too hard" lever, separate from your actual
skill-stage progression (which you change deliberately in onboarding once
you've actually improved). A small "adjusted" tag and reset button appear
once you've changed it.

## Celebration animations


Level-ups and streak milestones show a full-screen animated
celebration (`src/components/CelebrationOverlay.tsx`) right after you
complete a session — tap anywhere to dismiss, or it auto-dismisses after a
couple of seconds. If both happen at once (e.g. a session pushes you to a
new level *and* extends your streak), they queue and show one after another
rather than overlapping.

- **Level up** — confetti burst + your new level number.
- **Streak increased** — a pulsing flame with the new count.
- **Streak unfrozen** — a distinct animation from a plain increase: this
  fires when you had a gap since your last session, but *every* day in that
  gap was a day you'd marked as a rest day (from the weekday picker in
  onboarding). The streak logic (`src/lib/sessionComplete.ts`,
  `resolveStreak`) treats scheduled rest days as "frozen" rather than
  "missed" — so training again on your next scheduled day continues the
  streak instead of resetting it, and this animation calls that out
  explicitly rather than looking identical to a normal day-over-day
  increase.
- **Streak restarted** — a duller, shake-animated card when the gap
  included at least one day you *had* scheduled to train but skipped —
  that's a genuine break, and the streak resets to 1.
- **Streak started** — the first time you ever complete a session.

## Training reminders & friend nudges

**Reminders** (Profile page → "Training reminders"): toggle on, pick a time,
and you'll get a local notification once a day with a different fun
punch-line each time (30+ of them, Duolingo-style, in
`src/lib/reminderMessages.ts` — add your own there). There's also a "send me
a test reminder now" button.

**Be aware of a real limitation:** this is implemented with the browser's
`Notification` API and `setTimeout`, scheduled client-side in
`src/lib/notifications.ts` — there is no backend push service in this app.
That means reminders only fire while a tab or installed-PWA instance has been
open recently enough to keep the timer (or the service worker) alive. It
will **not** wake up a fully closed app the next day the way a native app's
push notifications would. For genuinely reliable "notify me even if the app
is closed" delivery, you'd need to add:
1. Firebase Cloud Messaging (FCM) — register for a token client-side
   (`firebase/messaging`, `getToken()`) and store it on the user's doc.
2. A scheduled Firebase Cloud Function (Cloud Scheduler trigger) that reads
   everyone's reminder time + FCM token once a minute/hour and calls
   `admin.messaging().send()` for anyone due.

That's a genuine backend service outside this Next.js app (needs the
Firebase Blaze plan and a separate `firebase deploy --only functions`), so
it's intentionally left out of this build rather than shipped half-tested —
the current local-notification version is fully functional and needs zero
extra setup, it's just not guaranteed-delivery.

**Friends** (Pair page → top section): every account gets a permanent
6-character friend code (`users/{uid}.friendCode`, backfilled automatically
on load if missing). Share it, or enter someone else's, to add each other —
adding is mutual: it writes to both people's `users/{uid}/friends`
subcollection in one batch. From your friends list you can:
- **Nudge** — drops a ping (`users/{uid}/pings`) in their inbox with a random
  punch-line; if they have the app open, `PingsListener` shows it as a
  dismissible banner and fires a local notification immediately.
- **Train together** — creates a pairing code (same mechanism as the
  standalone "Create a code" flow) and sends a nudge containing that code, so
  your friend gets pinged with an invite instead of you having to message
  them the code separately.

## AI coach notes and tips (optional, via OpenRouter)

Two features share the same OpenRouter setup: the Plan page's optional "Add
AI coach notes" toggle (a short intro + one line per day), and the per-exercise
"AI tip" button available everywhere an exercise is shown (a specific
technique cue + common mistake, fetched on demand — see the exercise timer
section above for details on that one). Both follow the same reasoning
below.

**What the LLM does and doesn't do.** The actual training plan — which days
you train, what focus each day gets, which exercises and how many sets/reps
— is always produced by the deterministic generator (`src/lib/planGenerator.ts`
+ `src/lib/trainingGenerator.ts`), the same one used everywhere else in the
app. It's rule-based, matched exactly to your equipment and skill stage, and
has zero risk of hallucinating an exercise or a rep count. The LLM is called
*after* that plan already exists, and its only job is to write a short intro
line and one short encouragement per training day — text, not prescriptions.
It's given the finished plan and explicitly told not to invent or change any
exercise. If it returns something that doesn't parse as valid JSON, the app
just shows the plan without notes rather than guessing.

This is a deliberate scoping decision: letting a general-purpose LLM freely
prescribe sets/reps/exercise selection in a physical training app is a real
correctness and safety risk (invented exercise names, unsafe progressions,
ignoring your equipment). Keeping that part rule-based and using the model
only for motivational framing gets the "feels personalized" benefit without
that risk.

**Robustness.** Free-tier models (especially reasoning-style ones like
DeepSeek R1 variants) are the least predictable about output format —
they'll wrap JSON in markdown fences, add a `<think>...</think>` reasoning
block ahead of the answer, use smart quotes, add a trailing comma, or ramble
before/after the JSON despite being told not to. The route now defends
against all of that before giving up: it requests strict JSON mode where the
model supports it, strips `<think>` blocks and code fences, normalizes smart
quotes, drops trailing commas, and as a last resort extracts the first
`{...}` block out of surrounding prose. It also handles the newer
multi-part `content` array format some providers return instead of a plain
string.

**Debugging.** Every call logs to the server console (visible in your
terminal for `next dev`/`next start`, or your host's function logs in
production) — tagged `[plan-coach]`, always, whether it succeeds or fails.
That includes the model actually used (OpenRouter's routed model can differ
from the one you requested), whether the response got cut off by the token
limit (`finishReason: "length"` — the most common real cause of unparseable
output, since a truncated response is cut off mid-JSON), and the raw content
returned. If notes still come back unusable, check those logs first — they
tell you exactly what the model sent back.

**Setup.** Add to `.env.local` (server-side only — never exposed to the browser):

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openrouter/free
```

Get a free key at https://openrouter.ai/keys (no card required).
`openrouter/free` is OpenRouter's auto-router alias that picks a current
zero-cost model for you — convenient, but the specific free-tier lineup on
OpenRouter rotates weekly as providers add/remove models, and free-tier
requests are rate-limited (roughly 20/min, 50–1000/day depending on account
history). If you want a fixed model instead of the auto-router, swap in any
current `:free`-suffixed model ID from https://openrouter.ai/models
(filter by price). Without this env var set, the toggle just shows a small
"not configured" note and the rest of the plan works exactly the same.

## Notes / where to extend

- The daily focus rotation is deterministic by day-of-year (filtered to what
  your equipment supports, weighted toward your goal tracks); override it
  per-session from the pill selector on the Training page.
- Exercise progression tables live in `src/lib/trainingData.ts` — extend them
  with more stages or new skills there. Equipment gating for each track lives
  in `REQUIRED_EQUIPMENT` in `src/lib/trainingGenerator.ts`.
- The scroll-snap picker (age/height/weight) is `src/components/ScrollPicker.tsx`;
  the segmented chip selector used for skill stages is
  `src/components/SegmentedControl.tsx`. Both are generic and reusable.
- The skill radar chart's axis-to-level mapping uses `STAGE_ORDER` from
  `src/lib/stageOrder.ts` (shared with the difficulty wheel) — add a skill
  there and to `AXES` in `src/components/SkillRadarChart.tsx` to plot it.
- Weighted-exercise fallbacks (used when `equipment.weights` is off) live
  alongside their weighted counterparts in `src/lib/trainingData.ts` — search
  for `equipment.weights ?` to find and extend them. Resistance-band bonus
  exercises are separate — `src/lib/bandBonus.ts` — appended to a track's
  primary exercise list rather than swapped in, and only while the relevant
  skill is still in an early stage.
- The plan generator's day selection (`isTrainingDay` in
  `src/lib/planGenerator.ts`) uses your exact chosen weekdays
  (`body.trainingDaysOfWeek`, a `WeekdayPicker` in onboarding) when set, and
  falls back to spreading a plain day-count evenly across the week for
  older accounts that predate that field.
- XP curve and rank titles are in `src/lib/xp.ts`.
- Weekly missions are (re)generated in `src/lib/missions.ts`; add new mission
  kinds by extending the `Mission["kind"]` union and `bumpMissions`.
- More reminder punch-lines go in `REMINDER_LINES` in
  `src/lib/reminderMessages.ts` — it avoids repeating the last one shown.
- The mutual-friend and ping data layer is in `src/lib/store.ts`
  (`addFriend`, `listenFriends`, `sendPing`, `listenPings`); the UI is
  `src/components/FriendsPanel.tsx` and `src/components/PingsListener.tsx`.
- To regenerate the app icons, see the inline Python/PIL script used to build
  `public/icons/*.png` (simple bar-and-figure glyph on a rounded dark square).
- Warm-up/finisher pools and their date-seeded daily picks are in
  `src/lib/warmupFinisher.ts`. Session structure (warm-up → main → accessory
  → finisher) is assembled in `buildSets` in `src/lib/trainingGenerator.ts`.
- The per-exercise timer's parsing (set count, timed-vs-rep-based, target
  seconds) and the −/+ adjustment logic are both in
  `src/lib/exerciseTiming.ts` — it's regex-based against the existing
  `detail` string formats, so keep new exercise entries in a similar shape
  ("N x M reps", "N x max hold", "N x Xs", "N min, ...") if you want them to
  drive the timer correctly.
- The difficulty wheel's exercise pools come straight from the same stage
  tables as everything else — `src/lib/wheelPool.ts`'s `wheelPoolWeighted`
  combines every stage's exercises (weighted toward your chosen difficulty)
  for the casino wheel; the simpler single-stage `wheelPool` function is
  still there if you want it elsewhere. Extending a skill's table
  automatically extends its wheel pool too. Bonus/malus modifiers are in
  `src/lib/wheelModifiers.ts` — add a new type to `MODIFIER_TYPES` with a
  weight (higher = more common), its own `quantities` list, a case in
  `applyModifier`, and (if it should affect XP) a case in
  `modifierXpMultiplier` or `modifierFlatXpBonus`. The two reels' cycling
  visuals (`TYPE_LABELS`/`ALL_QUANTITY_LABELS`) update automatically since
  they're derived from `MODIFIER_TYPES` rather than hardcoded. The reveal
  timing (type → quantity → wheel) is three constants at the top of
  `src/app/wheel/page.tsx` (`TYPE_SPIN_MS`, `QTY_SPIN_MS`,
  `WHEEL_REVEAL_DELAY_MS`) — the wheel's own CSS spin duration is derived
  from their sum, so it always finishes exactly when the schedule says to
  reveal it.
- Streak-freeze logic (rest days don't break a streak) and celebration
  event resolution are both in `resolveStreak` in
  `src/lib/sessionComplete.ts`. Celebration animations are pure CSS
  keyframes defined in `src/app/globals.css` (`pop-in`, `flame-pulse`,
  `thaw`, `gentle-shake`, `confetti-fall`, `reel-scroll`, `golden-glow`)
  and rendered by `src/components/CelebrationOverlay.tsx` and
  `src/components/ModifierReel.tsx`.
- Per-exercise AI tips are cached in component state per exercise
  (`src/components/ExerciseTipButton.tsx`) so navigating away and back
  re-fetches, but repeat taps within one view don't. The prompt lives in
  `src/app/api/exercise-tip/route.ts` and follows the same JSON-hardening
  and always-log approach as `/api/plan-coach`.
- To add a description or recategorize a skill for `/skills`, edit
  `src/lib/skillDescriptions.ts` and `src/lib/skillCategories.ts`
  respectively — both are checked at build time against `StagedSkillKey`
  (`Record<StagedSkillKey, string>` for descriptions), so a missing skill
  in the description map is a compile error, though categories currently
  aren't type-enforced to sum to all 50 (there's a one-off Python
  cross-check used during development, not a build step — worth re-running
  if you add a 51st skill).
- The "too hard for your level" threshold (`STRETCH_MARGIN` in
  `src/lib/levelPath.ts`) is a flat 6-level margin applied uniformly; make
  it configurable per-chapter if some tiers should be more/less forgiving.
- Any new code that needs a user's level should call
  `effectiveLevel(userDoc.xp, userDoc.skills, userDoc.skillMastery)` or
  `effectiveXpProgress(...)` from `src/lib/levelPath.ts` — never
  `levelFromXp`/`xpProgress` from `src/lib/xp.ts` directly against
  `userDoc.xp` alone, or it'll silently ignore the skill floor and can show
  a lower level than the trophy road says is already earned.
- The dashboard's quick-action grid and stat row are plain arrays of
  `{ href, icon, label }` in `src/app/dashboard/page.tsx` — add a tile by
  adding an entry, no layout changes needed for up to a few more.
- The mastery gate's margins (`MASTERY_LEVEL_MARGIN` /
  `MASTERY_FLOOR_DISCOUNT` in `src/lib/levelPath.ts`, currently 15/5/0 for
  mastery 3/4/5) are a flat offset from a node's road level, same for every
  skill — make them per-chapter or per-skill if some should be more/less
  forgiving. `levelForSkillStage` approximates a road level for stages that
  aren't themselves exact `LEVEL_PATH` nodes (interpolating from the
  nearest tracked milestone at or above that difficulty) — used to gate
  mastery on stages the road doesn't explicitly list.
- The landing page's demo skill list (`DEMO_SKILLS` in
  `LandingWheelDemo.tsx`) is a hand-picked 12 out of the full 50 — add or
  swap entries there for different variety. Its mock progress data
  (`MOCK_SKILLS`/`MOCK_LEVEL`/`MOCK_MILESTONES` in
  `LandingProgressPreview.tsx`) is hardcoded and intentionally static —
  it's a marketing preview, not a simulation, so it never needs to match
  any real leveling math.
- The 3-2-1 countdown length (`COUNTDOWN_FROM` — a separate constant in
  both `ExerciseTimer.tsx` and `PomodoroTimer.tsx`, currently 3 in each) and
  the sound vocabulary itself (`src/lib/sound.ts`) are both small and
  self-contained if you want to change the count, add a new event sound, or
  swap the actual tones/pitches used.
