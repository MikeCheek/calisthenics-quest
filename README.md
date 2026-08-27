# BarQuest

A gamified, mobile-first calisthenics training app: complete sessions
(warm-up → main focus → accessory → finisher) tailored to your body stats,
skill stage — across 20 tracked skills, from Front Lever to Iron Cross and
Manna — and the equipment you actually have at your park, including bands
and weights — with a per-exercise timer, AI-powered technique tips, a
casino-style bonus wheel with randomized modifiers, live easier/harder
adjustments, XP and levels with celebration animations, streaks that freeze
through rest days instead of breaking, weekly missions, skill/XP charts, a
pomodoro-style focus timer, day/week/month plan generation with optional AI
coach notes, a friends list with mutual add and nudges, daily training
reminders with rotating fun punch-lines, and paired training via a share
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
  3. **Your skills** — all 20 tracked skills, from the everyday (Front
     Lever, Planche, Muscle-Up, Handstand) through the rarer/advanced ones
     (Iron Cross, Maltese, One-Arm Pull-Up, One-Arm Handstand, Dragon Flag,
     Elbow Lever, One-Arm Push-Up, Nordic Curl, Shrimp Squat, Handstand
     Push-Up, Impossible Dip, Manna). A horizontal scroller picks which
     skill you're setting (`src/components/SkillTabPicker.tsx`) instead of
     stacking 20 pickers down the page, plus max pull-ups/dips and archer
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
- **Dashboard** (`/dashboard`) is a focused home screen: XP bar, streak,
  today's suggested focus, quick actions, and this week's missions.
- **Profile** (`/profile`) — your detailed stats: an SVG skill radar chart
  across all 8 skills, an XP-over-time line chart, your goal chips, body
  stats, and your equipment list.
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
  a configurable work/rest interval timer with an audio cue at each transition.
- **Bottom tab bar** is the primary navigation on phones (Home / Train / Pair
  / Profile / Timer); a slim top bar with a secondary nav row appears on
  wider screens.
- **PWA**: `public/manifest.json` + `public/sw.js` (network-first with
  app-shell caching) + generated icons in `public/icons/`. Registered from
  `src/components/PWARegister.tsx`.

## The 20 skills, and how they fit together

There are two layers, kept deliberately separate:

- **10 macro tracks** (`SkillTrack` in `src/lib/types.ts`) — Front Lever,
  Back Lever, Planche, Muscle-Up, Handstand, Human Flag, Pull Strength, Push
  Strength, Legs, Core. These drive the daily session rotation and goals —
  keeping the rotation at 10 (rather than 20) means each focus still comes
  around every few days instead of once every three weeks.
- **20 individually-progressed skills** (`StagedSkillKey`) — the 8 skills
  behind those macro tracks (Front Lever, Back Lever, Planche, Muscle-Up,
  Handstand, Human Flag, Pistol Squat, L-Sit), plus 12 rarer/advanced ones
  that aren't part of the daily rotation but are fully tracked, staged, and
  trainable: Iron Cross, Maltese, One-Arm Pull-Up, One-Arm Handstand,
  Dragon Flag, Elbow Lever, One-Arm Push-Up, Nordic Curl, Shrimp Squat,
  Handstand Push-Up, Impossible Dip, and Manna
  (`src/lib/advancedSkills.ts`). If you're actively working on one of the 12
  (stage past "none", and you have the equipment it needs — Iron Cross and
  Maltese want rings, for instance, checked via `advancedSkillAvailable`),
  a bonus block for it shows up in your regular sessions
  (`advancedSkillBonusSet`), and all 20 are always spinnable on the bonus
  wheel regardless of the daily rotation.

**Progression audit.** A few of the original 8 skills' stage ladders were
missing a rung — fixed now:
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
lookup — worth re-running a quick cross-check if you add or rename a stage
there (a script for this isn't included, but the check is a few lines: diff
each `XStage` union in `types.ts` against `STAGE_ORDER[x]`).

## Exercise timer, the bonus wheel, AI tips, and live adjustments

**Per-exercise timer.** Every exercise in a session has a **Start** button.
Tapping it opens an inline timer parsed straight from that exercise's own
sets/reps text (`src/lib/exerciseTiming.ts`) — no separate configuration
step. For timed holds (front lever holds, planche leans, anything with an
explicit or implied duration) it runs a countdown per set and auto-advances
through rest into the next set, playing a short tone at each transition; you
just get back into position and it keeps going. For rep-based exercises
(where "reps" are inherently self-paced) it instead shows a "Done with this
set" button — tapping it starts the rest countdown and hands control back to
you for the next set. Either way, all the sets/rests for that one exercise
are already wired up correctly from its own data — nothing to configure.

**Bonus wheel** (`/wheel`, its own screen — linked from the Training page).
Casino-style: pick any of the 20 skills you have equipment for and a
difficulty (Easier / Your level / Harder), then spin. The pool isn't just
one stage's 3 exercises — it combines exercises from *every* stage of that
skill, weighted so stages near your chosen difficulty come up more often
without excluding the rest (`wheelPoolWeighted` in `src/lib/wheelPool.ts`),
landing on 20+ possible segments. While the wheel spins, a second reel below
it cycles through possible bonus/malus modifiers; the wheel lands first,
and ~2 seconds later the modifier reel locks in on one — +1 Set, -1 Set,
Bonus Effort, Easy Mode, Double XP, or the rare golden "🌟 Golden Exercise"
(double XP, no downside) — combined into a final composed exercise
(`src/lib/wheelModifiers.ts`). Finishing it via the same Start-timer button
banks bonus XP (doubled for Double XP/Golden), completely separate from a
regular session's XP/streak/missions (`awardXp` in `src/lib/sessionComplete.ts`).

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
  `src/lib/wheelModifiers.ts` — add a new one to `MODIFIER_POOL` with a
  weight (higher = more common) and a case in `applyModifier`.
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
