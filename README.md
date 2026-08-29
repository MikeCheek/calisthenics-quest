# BarQuests

A gamified, mobile-first calisthenics training app: an adaptive placement
quiz gets new athletes to roughly the right level in under a minute instead
of manually setting 50 skills, then complete sessions
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
blocked outright — live easier/harder adjustments (buttons, a press-and-drag
swipe gesture, or whole-session feedback that composes with both) with a
"swap for something easier" option on any exercise, a full-screen guided
training mode that steps through a
session hands-free, a unified top-center toast system for every
info/success/warning/error message, celebration animations, streaks that freeze
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
  3. **Your level** — an adaptive placement quiz rather than manually
     setting all 50 skills: it starts with one easy and one hard yes/no
     question to bracket your whole range immediately, then keeps asking
     whatever question narrows that bracket fastest, real questions with a
     real checkable bar ("can you hold a tuck front lever for 5+
     seconds?") — stopping the moment it's confident, not after a fixed
     count, so it's often just 2-6 questions. See "The placement quiz"
     below for the full design — including the always-available manual
     escape hatch for people who'd rather set every skill by hand, which is
     exactly the old flow this replaced. Also collects max pull-ups/dips
     and archer pull-up.
  4. **Your goals** — pick up to 4 skills you most want to progress; those
     focuses show up more often in your training rotation.
- **Training** (`/training`) generates a *complete* session for a rotating
  daily focus across 10 tracks — Front Lever, Back Lever, Planche, Muscle-Up,
  Handstand, Human Flag, Pull Strength, Push Strength, Legs, Core — pulled
  from progression tables keyed to your exact stage. Every session has four
  parts: a **Warm-Up** (targeted mobility for whatever's actually being
  trained that day, not a generic pool — see "Focus-targeted warm-ups"
  below), the **Main Focus** (the day's skill work — the tables are already
  ordered from foundational/propedeutic drills up through the harder work for that
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

## The placement quiz (`SkillAssessmentStep.tsx`)

Onboarding's old "set all 50 skills manually" step is now a genuinely
adaptive quiz by default — manually setting every skill is still fully
available, just no longer the first thing you see.

**This isn't a fixed question list — it's a real-time bisection.** The
question pool (`src/lib/diagnosticQuestions.ts`, 32 questions total) spans
the whole difficulty range, and every question's difficulty is the *exact
same number* the trophy road uses for that skill+stage
(`levelForSkillStage` — one source of truth, so the quiz and the road can
never disagree). The engine:

1. **Asks the easiest question in the whole pool first, then the hardest
   one second** — deliberately bracketing the full range in the first two
   questions rather than guessing near the middle, so the algorithm knows
   almost immediately whether it's talking to a rank beginner, a
   near-expert, or someone in between.
2. **From question 3 onward, always asks whatever remaining question sits
   closest to the midpoint of the current bracket.** A "yes" raises the
   confirmed floor; a "no" lowers the confirmed ceiling; the bracket only
   ever narrows, never re-widens.
3. **Stops the moment the bracket is tight enough** (currently an 8-level
   window) **— never a fixed count.** In practice this means someone who
   answers "no" to both the easiest and hardest question converges in as
   few as 2 questions (`nextQuestion` in `diagnosticQuestions.ts` returns
   `null` the instant the bracket is tight, the pool runs dry, or a 12-question
   safety cap is hit — whichever comes first). I ran this against simulated
   athletes across the full range before shipping it: a true beginner and a
   complete expert both converged in exactly 2 questions; someone in the
   middle took 5.

Every question is a real, checkable yes/no — never "are you flexible?",
always "can you hold a tuck front lever for 5+ seconds?" A "yes" records
that skill at mastery 4 (Consistent) — specific enough to trust, short of
claiming outright mastery; a "no" leaves that skill exactly where it
already was, never a downgrade. **The bracket itself is only used to decide
which question to ask next** — the level you actually land on is computed
by feeding whichever skills got confirmed through the same `effectiveLevel`
floor system everything else in the app uses, so it's grounded in real
skill claims rather than an abstract number.

**The manual picker never went away.** "Prefer to set every skill
yourself?" on the intro screen, and "Fine-tune" on the result screen, both
drop straight into the original full 50-skill `SkillTabPicker` — the same
component, same gated mastery selector, same live level indicator it always
had. The quiz is the new default path, not a replacement for precision.

**Editing later, two ways** (both on `/profile`, in a dedicated "Update
your skills" panel):
- **"Retake assessment"** links back to `/onboarding`, which already
  re-initializes every field from the currently-saved profile — so retaking
  the quiz builds additively on top of existing progress (per the same
  never-downgrade rule above) rather than wiping it out.
- **"I hit a new skill"** opens a lightweight standalone modal
  (`DeclareSkillModal.tsx`) with just the manual picker and a Save button —
  for the common case of "one specific thing changed," without re-running
  the whole quiz. It shows the same level-up celebration as everywhere else
  in the app if the change pushes your level up, and persists via the same
  `saveProfile` call onboarding uses.

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

**A real bug this floor design created, and the fix.** The floor is
`max(rawXp, xpForLevel(skillFloorLevel))` — correct for the level *number*,
since it should never sit below what your skills already justify. But the
dashboard's XP progress bar used to compute its fill from that same
max'd value, which meant: for anyone whose skill floor sat meaningfully
above their raw earned XP (a fresh account that self-reported an advanced
skill during onboarding, for instance), completing training sessions
produced **zero visible movement on the bar** — the floor's XP-equivalent
so thoroughly dominated the max that raw XP gains from actual training
didn't register at all, sometimes for hundreds of sessions before raw XP
could organically exceed the floor. I confirmed the exact magnitude before
fixing it: a floor of level 61 sits at 144,000 XP-equivalent; at ~20-50 XP
per session, someone in that position would need literally thousands of
sessions before the bar moved by even one visible percent.

The fix (`effectiveXpProgress` in `src/lib/levelPath.ts`) doesn't touch the
level number at all — only how the *bar* is computed. Below the floor, it
shows genuine progress toward "catching up" using raw XP directly
(`into: rawXp, span: floorXp`), so every session visibly moves the number
shown, rather than progress toward the next level using the floor-dominated
value. `XPBar.tsx` labels this state distinctly ("catching up to your
skill level" instead of "XP to level N+1") so it reads as an honest,
different kind of progress rather than a mislabeled one. Once raw XP
actually exceeds the floor, this collapses back to normal next-level
progress with no visible seam. Accounts without a meaningfully elevated
floor (the common case) see no behavior change at all — verified this
directly, level-1-floor progress numbers are bit-for-bit identical before
and after this fix.

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

**The same adjustment via a swipe gesture.** Every exercise row
(`src/components/ExerciseRow.tsx`) can also be pressed and dragged left or
right — drag right past a threshold to make it harder (+1), left to make it
easier (−1), exactly the same underlying `adjustDetail` call the ±buttons
make. A background hint ("Easier −" / "Harder +") fades in behind the card
as you drag, and the card snaps back if you release before the threshold.
The gesture is built on raw pointer events with an early axis-lock: the
first ~8px of movement decides whether the gesture is horizontal (a swipe —
locks in, suppresses the page's default touch scrolling for that gesture)
or vertical (a scroll — releases control back to the browser immediately),
so it coexists with normal vertical scrolling through a long exercise list
rather than fighting it.

**Whole-session feedback now swaps exercises, not reps.** Above the
exercise list, a "How does today's session feel overall?" control ("Too
advanced" / "Feels right" / "Too easy") replaces every skill exercise in
the session with the one right next to it in that skill's difficulty
hierarchy — easier for "Too advanced," harder for "Too easy" — leaving set
counts exactly as prescribed for whichever exercise ends up in place,
rather than adjusting reps on the original exercise. **Warm-up and finisher
exercises are exempt and never change** — they're generic conditioning
that isn't part of any skill's difficulty hierarchy to begin with, and
everyone can do those regardless of level (`HIERARCHY_EXEMPT_SETS` in
`SessionView.tsx`, matched against the set titles "Warm-Up" and "Final
Hits"). This is separate from, and composes with, the per-exercise ± /
swipe reps adjustment — that one still works on whichever exercise
currently occupies a row (original or swapped), the same `adjustDetail`
call as always.

**"Can't do this" — and the difficulty hierarchy behind both features.**
Every non-exempt exercise has a "Can't do this" button that steps it down
one rung, same mechanism as the whole-session control but scoped to a
single row. Both are powered by `src/lib/exerciseHierarchy.ts`: for each of
the 50 skills, every exercise across every one of that skill's stages is
flattened into **one continuous easy-to-hard list** — not just "jump down
a whole stage," which is what used to make "no easier found" so common
even when a genuinely gentler option existed one rung away. The two
"general purpose" tracks that were previously invisible to this
system entirely — Pull Strength and Push Strength, which aren't
stage-tracked skills at all — now get their own hand-ordered hierarchies
built from the same real exercises the generator already uses (dead hang →
rows → negatives → pull-ups → weighted/archer/typewriter variants, and the
equivalent dip/push-up progression). A reverse index maps every exercise
name back to which hierarchy it belongs to and where, built once from
**two equipment extremes** (everything enabled, nothing enabled) rather
than one — some hierarchies (push strength, chiefly) branch into a
completely different list depending on equipment rather than just adding
one item, so indexing only the "everything on" case was silently dropping
every exercise that only exists in the bodyweight-only branch. I measured
the fix directly across all 481 exercises in the 50 skill tables before
shipping it: 0% missing from the index (the exact bug being reported), 90%
now find a genuinely easier variant, and the remaining 10% are correctly
sitting at the true floor of their hierarchy — the one easiest exercise
each skill has to have somewhere.

**Still a best-effort match, not a guarantee** — a small number of generic
drill names (like "Scapula pulls") legitimately appear in more than one
skill's hierarchy, and the index just takes the first match it finds. If
no easier (or harder) variant exists at all, a toast says so rather than
silently failing. A swapped exercise is tagged "(swapped, easier)" (this
now also lights up correctly when the whole-session control is what did
the swapping, not just an individual "Can't do this") and its own ± / swipe
reps adjustment resets to zero, since an adjustment relative to the old
exercise's baseline wouldn't mean anything applied to a different one.

**Not currently supported inside the full-screen guided mode** — swapping
and the whole-session feedback control both live in the checklist view
(`SessionView`/`ExerciseRow`); `FocusTrainingMode` steps through the same
underlying session data but doesn't (yet) expose either control. Adjust
before starting focus mode, or exit back to the checklist to make a change
mid-session.

## Multilingual support (`context/LanguageContext.tsx`)

English and Italian, switchable from the profile screen, with a "Language"
panel showing both as buttons — no page reload, the whole app re-renders
immediately in the new language.

**How it works:** `lib/i18n/en.ts` defines both the translation strings
*and* the structural type (`TranslationDict`) that `lib/i18n/it.ts` is
checked against — this is deliberate, not incidental. Because the type
describes each key's shape as `string` rather than a literal value,
TypeScript enforces that every namespace and key in `en.ts` has a
corresponding entry in `it.ts` (add a key to one without the other and the
build fails), while still allowing the actual translated text to differ
freely. `useLanguage()` exposes a namespaced `t(namespace, key, vars?)`
lookup with `{placeholder}` interpolation for the handful of strings that
need it (`t("dashboard", "welcomeBack", { name: "Marco" })` →
`"Welcome back, Marco"` / `"Bentornato, Marco"` — verified both directions
work correctly, interpolation included, before wiring it in).

**Locale persistence is two-layered.** `localStorage` is the immediate,
always-available layer — it's what a signed-out visitor on the landing
page gets, and what makes the choice stick on reload without waiting on
any network round-trip. For a signed-in account, the choice also writes to
`userDoc.locale` in Firestore, and `LocaleSync.tsx` — mounted once at the
root — reads that field back on load and applies it, so signing in on a
second device picks up the same language rather than defaulting to
English. If no preference exists anywhere yet (a fresh visit, nothing in
storage), the browser's own language is checked once as a sensible
starting guess.

**Scope, stated plainly.** Given the sheer amount of text in an app this
size, I translated the app's core chrome — the bottom/top navigation, the
Dashboard, and the Profile screen (including the language switcher itself)
— to a real, professional standard in both languages, and built the
underlying infrastructure to extend it. I did **not** attempt to translate
every string across all 16 routes and 60+ components. Extending coverage
to another page is mechanical once the pattern is there: add the keys to
both `en.ts` and `it.ts` (the type system will immediately flag if either
is missing something), then swap that page's hardcoded strings for `t()`
calls the same way `Nav.tsx`, `dashboard/page.tsx`, and `profile/page.tsx`
already do.

**The exercise catalog itself — names, set/rep detail text, coaching cues
— stays in English on purpose**, as the shared international skill
vocabulary ("Tuck front lever holds," "4 x max hold" reads the same to any
athlete regardless of language, the way "muscle-up" or "planche" already
do in Italian fitness communities). **But the how-to descriptions
(`localizedDescription()` in `exerciseTiming.ts`) are fully translated —
all 175 of them**, everywhere a description is shown: the exercise detail
modal (checklist, guided full-screen mode), the bonus wheel, and the
landing page's live demo wheel. Rather than adding an `descriptionIt`
field to all 577 individual exercise objects (touching that many entries a
second time), it's one flat dictionary keyed by the exercise's exact
English name — `exerciseDescriptions.it.ts` — so a single lookup covers
every table that reuses the same exercise name across different skills'
stages. I verified coverage programmatically before shipping it: of the
175 unique exercise names that currently have an English description, all
175 have a matching Italian one — zero missing, zero orphaned entries in
the Italian file with no English counterpart. The lookup falls back to the
English text for the roughly 350 exercises (the two larger advanced-skill
tables) that don't have a description in *either* language yet, so nothing
ever renders blank.


## The skill wall (`SkillWall.tsx`)

On `/profile`, alongside the skill radar chart and XP-over-time chart, a
GitHub-contribution-graph-style grid: all 50 skills as one square each, in
a dense 10-column grid, shaded from empty (untouched) through four
increasingly bright levels — same visual language as a commit heatmap, but
the "activity" being shaded is skill progress rather than daily commits.

**Brightness is stage progress discounted by mastery, not just stage
alone.** A skill sits at `stageIndex / (totalStages - 1)` — how far along
its own ladder it is, normalized so a 3-stage skill and a 6-stage skill
both reach "fully lit" at their own respective top stage — then that
fraction is scaled by `mastery / 5`. The result: claiming "Attempted" on
an advanced stage lights the square dimly, while a stage you've actually
consolidated at mastery 5 lights it at full brightness, even if it's an
earlier stage than something else you've only attempted. I verified this
scales sensibly across skills with very different stage-ladder lengths
before wiring it in (a 3-stage skill and a 6-stage skill both correctly
reach the brightest bucket at their own top stage, not skewed by ladder
length).

Every square is tappable and opens the same `SkillInfoModal` used
everywhere else skill details are shown (the skills catalog, onboarding,
the wheel, the trophy road) — no new detail UI to maintain, just another
entry point into the existing one. A "Less → More" legend underneath
matches the convention directly, and a running "N/50 lit" count sits next
to the section title.

## Focus-targeted warm-ups (`warmupFinisher.ts`)

The Warm-Up block isn't drawn from one generic mobility pool regardless of
what's being trained — it's picked to actually open up whatever's relevant
to *today's* focus. Every drill in `MOBILITY_POOL` is tagged with the
area(s) it targets (wrists, shoulders, scapula, thoracic spine, chest,
hips, hamstrings, ankles, grip, core), and each of the 10 focus tracks has
its own short list of priority areas (`FOCUS_AREAS`) — front lever pulls in
scapula/shoulders/hamstrings/wrists, planche and handstand lean hard on
wrists, leg day gets hips/ankles/hamstrings, and so on.

`pickWarmup` picks one drill per priority area in turn, matched against
each drill's *primary* tag (its first-listed area) — not just "highest
total overlap score" ranked across the whole pool. That distinction matters:
an earlier version of this scored every drill by how many tags it shared
with the focus, which let multi-tagged generalist drills (a shoulder
stretch that also happens to touch wrists) consistently outscore and crowd
out genuine specialists (dedicated wrist-circle drills) — so a
planche/handstand warm-up could go through dozens of days without ever
surfacing real wrist prep, despite wrists being the single most important
area for either skill. Picking by primary-area-per-priority-slot instead
guarantees actual coverage of each relevant area. I verified this directly
before shipping it: all 10 focus tracks produce genuinely differentiated,
anatomically-relevant selections, and planche/handstand specifically now
include a dedicated wrist drill in every case rather than none. A
date+focus-seeded pick among tied candidates still varies which specific
drill covers a given area from session to session.

**Warm-Up (and Final Hits) are the one place level/difficulty controls
don't apply.** Neither the whole-session "too advanced/too easy" feedback
nor the per-exercise "Can't do this" swap touches these two blocks — see
"Whole-session feedback" above — because they're generic conditioning
everyone can do regardless of level, not part of any skill's difficulty
hierarchy to begin with.

## Full-screen guided training (`FocusTrainingMode.tsx`)

"Start Training" at the top of a session (`SessionView.tsx`) launches a
full-screen, one-exercise-at-a-time guided mode instead of the scrolling
checklist — for actually training through a session hands-on rather than
managing a list.

- **A stepper across the top** shows one segment per exercise in the
  session (color-coded: emerald = completed, orange = current, dim = still
  ahead), plus "Next: <exercise name>" so you always know what's coming.
- **Below that**, the current exercise's set category (Warm-Up / Main Focus
  / Accessory / Finisher), its name, an **i** info icon opening exercise
  details (sets/reps, cue, rest, and the AI tip button —
  `ExerciseDetailModal.tsx`), and the same per-exercise timer used
  elsewhere in the app (`ExerciseTimer.tsx` — countdown, hands-free
  auto-continue through sets, distinct go/rest/complete sounds; see the
  "Per-exercise timer" section above).
- **Progresses automatically, with a rest in between**: finishing an
  exercise's timer (`onComplete`) marks it done on the stepper and — unless
  it was the last exercise — drops into a dedicated rest countdown before
  the next one starts, rather than jumping straight there. The rest
  duration reuses that exercise's own `restSeconds` (the same number its
  set-to-set rest already used), clamped to a sensible 20–90s window so a
  warm-up drill's short set-rest doesn't produce an unrealistically brief
  transition and a heavy hold's long rest doesn't stall the session —
  shown full-screen with a countdown, what's coming up next, and a "Skip
  rest" button for whenever the prescribed rest isn't needed. It respects
  Pause the same way the exercise timer does. Manual **Back** / **Next**
  buttons are also always available, for skipping ahead or reviewing a
  previous exercise; **Next** marks the current exercise done — and still
  triggers the same rest before the next one — exactly like its timer
  finishing would, since you're the judge of "done enough," not the timer.
  Tapping **Back** during that rest cancels the transition and returns you
  to the exercise you just finished, rather than skipping past it to the
  one before.
- **"I'm tired"** eases the current exercise and everything left in the
  session, mid-training, without stopping to think about it. It's the same
  exercise-hierarchy stepping the "Can't do this" swap and the checklist's
  whole-session feedback use — `findEasierExercise` from
  `src/lib/exerciseHierarchy.ts` — just applied in bulk from wherever you
  currently are through the end, and, like the whole-session control,
  Warm-Up and Final Hits are exempt (`HIERARCHY_EXEMPT_SETS`, now shared
  across all three difficulty controls from one place rather than
  duplicated). Swapped exercises are tagged inline ("Swapped in — something
  gentler") so it's clear what changed; a toast confirms how many exercises
  actually eased, or says plainly if everything left was already at its
  easiest — tapping it a second time tries to step down another rung from
  wherever things currently stand, for "I'm *really* tired." The
  live "time left" estimate in the header updates immediately to reflect
  whatever's actually left after easing, not the original harder plan.

- Finishing the last exercise (by timer or by tapping Next) shows a
  completion screen with **Finish & log session**, which reuses the exact
  same `completeSession` XP/streak-awarding flow as the classic checklist's
  "Complete Session" button — so it doesn't matter which mode you actually
  finish a session in.
- **Not currently wired into paired training** (`/pair`'s two side-by-side
  `SessionView`s) — `onStartFocusMode` is an optional prop, so it's simply
  omitted there rather than attempting to guide two simultaneous sessions
  through one full-screen flow, which would need its own design.

**The session lives above the page, not inside it, so it survives
navigation.** `TrainingSessionContext.tsx` — mounted once at the very top
of `layout.tsx`, alongside Auth and Toast — owns the active session,
whether it's expanded (full-screen) or minimized (bubble), whether it's
paused, and the XP-awarding completion flow itself. `FocusTrainingMode`
no longer takes `session`/`onExit`/`onFinish` props; it reads everything
from `useTrainingSession()` and is rendered **unconditionally** once,
globally (`TrainingSessionOverlays.tsx`) — tapping the header's minimize
chevron doesn't unmount it, it just toggles a `hidden` class, which is the
whole trick: React state (which exercise you're on, what's been completed,
even the per-exercise timer's own internal countdown) survives being
hidden, because hiding a DOM node with CSS never unmounts the React tree
underneath it. Navigating anywhere else in the app — Profile, Skills,
wherever — genuinely doesn't touch any of this.

**Pause vs. minimize are two different, complementary things — deliberately.**
Minimizing (the bubble) does **not** stop the clock: the current exercise's
timer keeps running in the background exactly as it would if the screen
were still open, sounds included, since a JS interval doesn't care whether
its DOM is visible. That's intentional — it's how a real background workout
timer should behave. **Pause** is the explicit control for actually
freezing it: `ExerciseTimer` takes an `externallyPaused` prop that halts its
countdown/interval and disables its own play/resume button without
resetting any of its state, so resuming picks up from the exact second it
left off. The pause toggle lives in the `FocusTrainingMode` header and,
identically, right on the bubble itself — pausing from either place is the
same context state.

**The draggable bubble** (`TrainingBubble.tsx`) appears whenever a session
is active but minimized. It shows the current exercise name, a pulse icon
when running or a pause icon when paused, and can be dragged anywhere on
screen (raw pointer events, clamped to the viewport) or tapped to re-expand
— a small movement threshold distinguishes an intentional drag from a tap,
the same technique used for the exercise-row swipe gesture elsewhere in the
app. It also carries its own inline pause/resume button and an "end
session" button (with a native confirm, since discarding loses unsaved
progress and isn't reversible) so you never have to reopen the full screen
just to pause or bail out.

## Estimated session time (`estimateSessionMinutes`, `exerciseTiming.ts`)

Every session preview — the checklist header (`SessionView.tsx`, next to
"Est. reward"), the `/plan` page's expanded day cards (same component, so
this comes for free), and a live "time left" readout in the guided
full-screen mode's header — now shows a rough total duration in minutes,
not just the XP reward.

It's built on the same `parseTiming` every per-exercise timer already
uses, not a separate guess: for a timed hold, it's sets × target seconds +
set-to-set rest; for rep-based work (self-paced, so there's no countdown to
sum) it estimates from whatever rep count the exercise's own detail text
mentions (a range like "8-10 reps" averages to 9) at roughly 3.5 seconds
per controlled rep, falling back to a reasonable default only if nothing
parses. A between-exercise rest is added on top of that, using the *exact
same* clamped constants (`MIN_BETWEEN_EXERCISE_REST` / `MAX_BETWEEN_EXERCISE_REST`,
20–90s) that the guided mode's real rest countdown uses — moved into
`exerciseTiming.ts` specifically so the estimate and what actually happens
during training can't drift apart into two different numbers. I ran it
against several real generated sessions before wiring it in: full 9-10
exercise sessions land around 40-50 minutes, matching what a real
skill-focused calisthenics session actually takes.

The guided mode's header shows **time remaining**, not the fixed total —
`estimateExercisesMinutes` (the flat-array core both this and
`estimateSessionMinutes` are built on) is recomputed from wherever you
currently are in the step list, so the number counts down realistically as
you move through the session rather than staying frozen at the start-of-session estimate.

## Toast notifications (`context/ToastContext.tsx`)

Every info/success/warning/error message in the app funnels through one
shared system rather than each screen inventing its own inline banner: a
`ToastProvider` (mounted once, at the very top of `layout.tsx`) and a
`useToast()` hook exposing `.info(message)` / `.success(message)` /
`.warning(message)` / `.error(message)`. Toasts stack in a fixed
**top-center** viewport (`z-[200]`, above modals), each with a type-specific
icon and color, safe-area-aware positioning so they never collide with the
status bar on an installed PWA, and auto-dismiss (3.5s for info/success,
5.5–6.5s for warning/error — errors need a beat longer to actually read)
alongside a manual dismiss button. `ToastProvider` wraps `AuthProvider` in
the layout specifically so `AuthContext` itself can surface a toast on a
failed sign-in, not just components further down the tree.

**What's already wired onto it**, replacing what used to be one-off inline
banners or — in a few cases — silent failures with no feedback at all:
- `PingsListener.tsx` — friend pings, which used to render their own
  bespoke fixed top banner, now go through the same toast system as
  everything else.
- `SessionView.tsx` — the "no easier exercise found" message when a
  "Can't do this" swap has nowhere left to go.
- `FriendsPanel.tsx` — add-friend success/error, and a "Copied!"
  confirmation on the friend-code copy button that previously gave no
  feedback at all.
- `pair/page.tsx` — join-pairing errors (bad code, code not found, joining
  your own code).
- `onboarding/page.tsx` and `DeclareSkillModal.tsx` — both had a
  `saveProfile` call with **no error handling whatsoever**; a failed save
  used to leave the Save button stuck with zero indication anything went
  wrong. Both now show an error toast and reset cleanly.
- `AuthContext.tsx` — sign-in/sign-out failures (a blocked popup or network
  failure used to fail completely silently); a merely-cancelled popup is
  deliberately *not* toasted, since closing a sign-in popup isn't an error.
- `ReminderSettings.tsx` — a toast on notification-permission denial (in
  addition to, not instead of, the persistent inline explanation next to
  the disabled toggle — see the distinction below) and a confirmation when
  the test-reminder button is pressed.

**What's deliberately still inline, not toasted, and why:** a toast is for
something that just *happened* — a transient event. Anything that's
ongoing *state* the person might come back and look at later stays where
it is: `ReminderSettings`' explanation of *why* the toggle is currently
disabled, the wheel's "+N XP banked!" result line that stays visible
alongside the completed exercise, `ExerciseTipButton`'s "AI tips aren't
configured" message tied to that specific button. Converting persistent
state into a toast would just make it disappear before it's answered the
question it exists to answer.

**Not migrated, on purpose:** a couple of existing `.catch(() => {})`
blocks — `sessionComplete.ts`'s public-profile sync after finishing a
session, `AuthContext.tsx`'s friend-code backfill on load, `PWARegister`'s
service worker registration — are explicitly best-effort background
operations already commented as such in the code; surfacing a toast for
"your public profile sync silently failed" would be more alarming than
useful for something the user never directly triggered and that degrades
gracefully on its own. This was a deliberate line, not an oversight: not
every caught error deserves a toast, only ones tied to something the
person actually just did.

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
- Warm-up drills and their area tags live in `MOBILITY_POOL` in
  `src/lib/warmupFinisher.ts`, matched against each focus track's priority
  areas in `FOCUS_AREAS`; finisher pools and their date-seeded daily picks
  are in the same file. Session structure (warm-up → main → accessory →
  finisher) is assembled in `buildSets` in `src/lib/trainingGenerator.ts`.
  To add a new mobility drill, give it an `areas` tag list with the most
  defining area first (that's what primary-area matching uses); to give a
  focus track a new priority area, add it to its entry in `FOCUS_AREAS`.
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
- The swipe gesture's sensitivity (`SWIPE_THRESHOLD` / `SWIPE_MAX` in
  `src/components/ExerciseRow.tsx`, currently 55px / 90px) and the
  axis-lock decision (the `8px` movement / `1.3` ratio in `onPointerMove`
  that decides "this drag is horizontal, not a page scroll") are both
  tunable if the gesture feels too sensitive or not sensitive enough on a
  given device.
- To add or change a placement-quiz question, edit `DIAGNOSTIC_QUESTIONS`
  in `src/lib/diagnosticQuestions.ts` — each entry is just `{ id, text,
  skill, stage }`; its difficulty is computed automatically from the
  trophy road (`levelForSkillStage`), not set by hand, so a new question
  slots into the bisection at the right point without any extra work. The
  mastery a "yes" records (`QUIZ_MASTERY`, currently 4), the convergence
  window that decides when to stop (`CONVERGENCE_WINDOW`, currently 8
  levels — smaller means more questions but a tighter final bracket), and
  the safety cap on total questions (`MAX_QUESTIONS`, currently 12) are all
  adjustable there too. Same cross-check discipline as everywhere else in
  the skill system applies: a typo'd stage name won't be caught by
  TypeScript (the field is a plain string), so re-run a check like the ones
  used elsewhere in this codebase against `STAGE_ORDER` if you add
  questions.
- The exercise-hierarchy reverse index (`src/lib/exerciseHierarchy.ts`) is
  built once, lazily, on first use, and cached at module scope for the rest
  of the session — rebuilding it (e.g. after a hot reload picks up new
  exercise entries) means reloading the page. If you add a new stage-table
  exercise, it's picked up automatically next time the index builds; no
  separate registration step. To add a 51st skill's hierarchy, add it to
  `CORE_SKILLS`/`ADVANCED_SKILLS` there and it flattens automatically. To
  extend the hand-ordered Pull Strength / Push Strength hierarchies, edit
  `pullStrengthHierarchy`/`pushStrengthHierarchy` directly — unlike the
  skill hierarchies, these aren't derived from a stage table, so ordering
  is by hand and worth double-checking stays easy-to-hard when you touch
  it. `SessionView`'s three pieces of local overlay state —
  `individualDelta`, `sessionLevel`, and `individualOverrides` — are all
  kept separate from the `session` prop itself rather than mutating it, the
  same pattern the existing `done`/`openTimers` state already used; the
  actual training-generator output is never touched. `FocusTrainingMode`
  keeps its own equivalent (`overrides: Record<number, Exercise>`, keyed by
  step index) for exactly the same reason, powering both "I'm tired" and
  the effective exercise shown at each step. `HIERARCHY_EXEMPT_SETS` (the
  Warm-Up/Final Hits exemption) lives in `exerciseHierarchy.ts` itself now,
  not duplicated per-component, so `SessionView` and `FocusTrainingMode`
  can't drift into disagreeing about which set titles are exempt.
- To show a toast from anywhere, `const toast = useToast()` then
  `toast.error("...")` (or `.info`/`.success`/`.warning`) — no prop
  drilling, since `ToastProvider` sits at the very top of `layout.tsx`. Per
  the durations in `ToastContext.tsx`, keep messages short enough to read
  in 3-4 seconds for info/success, since that's how long they're on screen.
  Anything genuinely fire-and-forget in the background (a best-effort sync
  the user didn't directly trigger) probably shouldn't be a toast at all —
  see the "deliberately still inline" and "not migrated, on purpose"
  sections above for where that line was actually drawn in this codebase.
