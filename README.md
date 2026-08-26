# BarQuest

A gamified, mobile-first calisthenics training app: tailored sessions generated
from your body stats, skill stage, and the equipment you actually have at your
park — XP and levels, weekly missions, skill/XP charts, a pomodoro-style focus
timer, and paired training with a friend via a share code. Installable as a PWA.

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
     age and weight, a tick-marked ruler for height), sex, training days/week,
     and typical session length.
  2. **Where you train** — pull-up bar, parallel bars/dip station, rings,
     wall space, vertical pole/tree, monkey bars.
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
- XP curve and rank titles are in `src/lib/xp.ts`.
- Weekly missions are (re)generated in `src/lib/missions.ts`; add new mission
  kinds by extending the `Mission["kind"]` union and `bumpMissions`.
- To regenerate the app icons, see the inline Python/PIL script used to build
  `public/icons/*.png` (simple bar-and-figure glyph on a rounded dark square).
