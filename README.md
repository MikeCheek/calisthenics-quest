# BarQuest

A gamified, mobile-first calisthenics training app: tailored sessions generated
from your body stats, skill stage, and the equipment you actually have at your
park — XP and levels, weekly missions, skill/XP charts, a pomodoro-style focus
timer, day/week/month plan generation with optional AI coach notes, a friends
list with mutual add and nudges, daily training reminders with rotating fun
punch-lines, and paired training via a share code. Installable as a PWA.

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
     wall space, vertical pole/tree, monkey bars, and whether you have any
     weight (a dip belt, weighted vest, plates, or a loaded backpack) —
     exercises that would otherwise call for weight automatically swap to a
     bodyweight-only alternative (tempo, deficit, or cluster-set variants)
     when you don't have any.
  3. **Your skills** — stage pickers for Front Lever, Back Lever, Planche,
     Muscle-Up, Handstand, Human Flag (only if you have a pole), Pistol
     Squat, and L-Sit, plus max pull-ups/dips and archer pull-up.
  4. **Your goals** — pick up to 4 skills you most want to progress; those
     focuses show up more often in your training rotation.
- **Training** (`/training`) generates a session for a rotating daily focus
  across 10 tracks — Front Lever, Back Lever, Planche, Muscle-Up, Handstand,
  Human Flag, Pull Strength, Push Strength, Legs, Core — pulled from
  progression tables keyed to your exact stage. Only focuses your equipment
  can actually support show up (front lever/back lever/muscle-up/pull
  strength need a bar; human flag needs a pole; push strength swaps dips for
  push-ups without bars; handstand swaps wall drills for freestanding/crow
  work without a wall). Legs and Core always work with nothing but ground
  space. Goal tracks are marked with a ★ and appear roughly twice as often.
  Completing a session awards XP, updates your streak, logs an XP history
  point, and progresses weekly missions.
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

## AI coach notes (optional, via OpenRouter)

The Plan page has an optional "Add AI coach notes" toggle. Here's the
reasoning behind how it's scoped, and why:

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
- The skill radar chart's axis-to-level mapping is in
  `src/components/SkillRadarChart.tsx` (`STAGE_ORDER`) — add a skill there and
  to `AXES` to plot it.
- Weighted-exercise fallbacks (used when `equipment.weights` is off) live
  alongside their weighted counterparts in `src/lib/trainingData.ts` — search
  for `equipment.weights ?` to find and extend them.
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
