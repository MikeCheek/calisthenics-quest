# BarQuests — app map

Every page of the web app, who can open it, and what it does.

## Who can open what

| Level | Who | What happens otherwise |
|---|---|---|
| 🌐 **Public** | Anyone, signed in or not | — |
| 🔑 **Account** | Anyone with an account: Google or guest | No account → sent to `/` (the landing page) |
| ✅ **Onboarded** | An account that has finished the first setup | Not set up yet → sent to `/onboarding` |
| 👤 **Google only** | A Google account, not a guest | The page or feature shows "Save your progress with Google" instead |

How this is enforced:

- **Pages** check access in the browser and redirect. There is no server-side page protection.
- **Data** is what's actually protected, by the **Firestore security rules** (see the README). Even if someone opens a page, they can only read and write their own data, plus what friends are allowed to see.
- **AI and push routes** on the server check the caller's Firebase sign-in token themselves (see [Server routes](#server-routes)).

## Page tree

```
/                         🌐  Landing page (English)
├── it                    🌐  Landing page (Italian)
│   ├── yoga              🌐  Yoga landing page (Italian)
│   └── pilates           🌐  Pilates landing page (Italian)
├── yoga                  🌐  Yoga landing page
├── pilates               🌐  Pilates landing page
├── about                 🌐  About & privacy
│
├── onboarding            🔑  First setup: pick a sport, then its setup
│
├── dashboard             ✅  Today                         ── bottom tab "Today"
│   ├── training          ✅  Today's session (guided)
│   ├── plan              ✅  Week plan
│   ├── library           ✅  Exercise library
│   ├── build             ✅  Build a session
│   └── parks             ✅  Bar parks near you
│
├── skills                ✅  Skills                        ── bottom tab "Skills"
│   ├── ?tab=tree         ✅    Skill tree (default)
│   ├── ?tab=proven       ✅    Proven skills
│   ├── ?tab=road         ✅    Trophy road
│   └── compare           ✅  Then vs now
│
├── coach                 ✅  Coach                         ── bottom tab "Coach"
│   └── wheel             ✅  Bonus wheel
│
├── friends               ✅  Crew                          ── bottom tab "Crew"
│   │                     👤    whole page needs Google (guests see the save prompt)
│   └── friend/[uid]      🔑  A friend's public profile
│
└── profile               ✅  Me                            ── bottom tab "Me"
    ├── ?tab=activity     ✅    Activity (default)
    ├── ?tab=settings     ✅    Settings
    └── ?tab=account      ✅    Account

Old addresses (redirect only, kept so old links and notifications still work):
├── pair      → /friends   (keeps ?code= for train-together invites)
├── path      → /skills?tab=road
├── progress  → /skills, /profile or /coach, depending on ?tab=
└── pomodoro  → /training

Server routes (not pages):
└── api/
    ├── coach-chat        🔑  token + rate limit
    ├── exercise-tip      🔑  token + rate limit
    ├── plan-coach        🔑  token + rate limit
    ├── plan-review       🔑  token + rate limit
    ├── push/ping         🔑  token + must be friends
    ├── push/reminders    🔒  scheduler only (CRON_SECRET)
    └── parks/osm         🌐  per-address rate limit
```

The bottom tab bar on phones (and the sidebar on desktop) groups pages under five sections. A page lights up its section's tab: `/training`, `/plan`, `/library` and `/build` light up **Today**; `/compare` lights up **Skills**; `/wheel` lights up **Coach**; `/friend/…` lights up **Crew**.

## On every signed-in page

These come from the root layout and the navigation, so they're available everywhere once you're in.

- **Navigation**
  - Phones: bottom tabs (Today, Skills, Coach, Crew, Me) and the **All features** menu, with search, in the top bar.
  - Desktop: a sidebar listing every feature, with the current one marked.
- **Sport switcher**: a chip in the header (phone) or the sidebar (desktop).
  - It shows the active sport and opens **Your sports**, where you switch with one tap or start yoga or Pilates (three questions).
  - Each sport keeps its own level; the streak and XP are shared.
- **Quick actions**: a floating button with shortcuts. It's hidden on the landing pages, onboarding, `/training`, `/about` and `/parks`.
- **Training bubble**: "Resume training" while a session is in progress, from any page.
- **Notifications**: nudges and kudos from friends arrive in the app (PingsListener) and as push notifications when enabled. A training reminder can be scheduled too.
- **Park prompt**: "Where are you training?" before a calisthenics session, when enabled.
- **Achievements**: unlocked badges are announced as they happen.
- **Offline**: an offline banner. Sessions can be finished and logged without a connection and are sent later.
- **App behaviour**: installable as an app (PWA), page titles follow the page and language, the tab icon shows the streak status, and a skip link jumps to the content.
- **Demo badge**: only in demo mode.

## Public pages

### `/` and `/it` — Landing page 🌐
- **Hero** with a screenshot of the app, plus **Start free — no account needed** (creates a guest account) and **Sign in with Google**.
- **Content**: numbers, "why it's different", and a screen-by-screen tour of the app.
- **Not only calisthenics**: a card for yoga and one for Pilates, each linking to its page.
- **Further down**: more features, an honest note about what the app isn't, questions, and a final call to action.
- **Language**:
  - English on `/` and Italian on `/it`, both rendered on the server for search engines.
  - An Italian browser is sent to `/it`.
  - Someone already signed in is sent straight into the app.

### `/yoga`, `/pilates` (and `/it/yoga`, `/it/pilates`) — Sport landing pages 🌐
- Hero with an animated pose and **Start Yoga free** / **Start Pilates free**.
- How it works in four steps; the eight skills with their stage counts; six animated moves; questions; links to the other tracks.
- **Starting from here** remembers the sport:
  - New users see it highlighted in the sport picker.
  - Existing users get its setup, or are switched to it if they already follow it.

### `/about` — About & privacy 🌐
- Who made it and the privacy notice.

## Getting started

### `/onboarding` — First setup 🔑
**First login** (not set up, nothing logged yet): **What do you want to train?**
- **Calisthenics**, the big "Main track" card → the 4-step setup:
  - About you
  - Where you train (equipment)
  - Your level (skill check per area)
  - Your goals
- **Yoga** or **Pilates** → three questions (experience, up to 3 goal skills, session length) → straight to Today.
  - Calisthenics is marked "not set up yet". Its check runs the first time you switch to it.

**Later visits** (from Skills, Me or Today to update your profile, or after "Reset skills") go straight to the calisthenics setup.

## Today

### `/dashboard` — Today ✅
- **Today's session**: a card with the focus and length, ready to start.
  - Calisthenics asks where you're training first, if that's turned on.
- **Week strip** and the **skipped-day shift**: miss a training day and the rest of the week moves along.
- **Missions** for the day.
- **Calisthenics only**:
  - Weather card, with a home plan when it rains.
  - Today's equipment banner.
  - Training block.
  - Next goal.
- **Yoga and Pilates only**: an **Up next** card showing the skills closest to their next stage.
- **Also on Today**:
  - The community event card.
  - Links to the extras (library, build, parks, wheel…).
  - A notification prompt.
- **Guests**: a compact **Save your progress with Google** prompt.

### `/training` — Today's session ✅
- **Guided session**: one exercise at a time, with timers, rest, animated demos, cues and common mistakes.
- **Logging**: log reps, time or laps per set; mark each exercise done, too hard or skipped.
- **Focus**: pick a different focus for today.
- **Calisthenics only**: an equipment check.
- **AI plan review** of the session.
- **Afterwards**: cool-down stretches, the session report (mastery changes, unlocked stages, records, suggestions), the celebration and a share card.
- **Today / Week switch** at the top.

### `/plan` — Week plan ✅
- The sessions ahead this week, laid out in advance.
- **AI plan coach** (`/api/plan-coach`) to adjust it.
- **Note**: the plan covers calisthenics. With another sport active, the page says so and points to Today.

### `/library` — Exercise library ✅
- Every exercise of the **active sport**, searchable.
- **Filters**: type and muscle group; "only what my equipment allows" for calisthenics.
- **Each exercise**: animated demo, how to do it, what it needs and where it sits in a skill's progression.
- **Actions**: **Do it now** (a one-exercise guided session) or **Add to your session**.

### `/build` — Build a session ✅
- Pick exercises from the library, set the sets, add a warm-up, and start in guided mode.
- Save your own sessions to reuse.
- A session made only of yoga (or only Pilates) exercises counts for that sport.

### `/parks` — Bar parks near you ✅ (calisthenics)
- Full-screen map of outdoor bars from OpenStreetMap, served through `/api/parks/osm` and cached in Firestore.
- **Each park**:
  - Its name (taken from the park it's in) and a photo.
  - The equipment, which can be confirmed or corrected.
  - Likes, favourites, and how many people trained there.
- **Adding a missing park**: pick its spot on the map.
- **Choosing where you train**: pick a park before a session.

## Skills

### `/skills` — Skills ✅
**Calisthenics** has three tabs.
- **Skills** (tree):
  - The skill tree and skill wall.
  - Radar chart.
  - Next milestones.
  - **Training block** (aim for a stage in a few weeks).
  - **Skill timeline**.
  - Declare a skill you already have.
  - Link to Then vs now.
- **Proven**: skills verified with Skill Checks (video or timed).
- **Road**: the trophy road, with level-by-level milestones.

**Yoga / Pilates**: each skill as a ladder of stages.
- Each skill shows its mastery toward the next stage and its current exercises (tap one for the demo).
- **Goal stars**: up to 3. Starred skills come up more often.

### `/compare` — Then vs now ✅
- Two periods side by side, either "since you started" or custom dates.
- Share card.

## Coach

### `/coach` — Coach ✅
- **Ask your coach**: AI chat about your own training (`/api/coach-chat`).
  - It knows your level, skills, goals, equipment, recent sessions and your yoga/Pilates tracks.
  - It never sees your name, email, body stats or friends.
- **Coach insights**: what the app has learned from your training.

### `/wheel` — Bonus wheel ✅
- Bet, spin, and land on an extra exercise you can do with your kit.
- Timer, animated demo and an **AI tip** for it (`/api/exercise-tip`), with XP for finishing.

## Crew

### `/friends` — Crew ✅ 👤
Guests see a **Save your progress with Google** prompt instead, since friends need an account others can find.
- **Crew activity**:
  - Friends' finished sessions from the last two weeks; yoga and Pilates ones show the sport.
  - Kudos, and kudos you've received.
- **Leaderboard**: this week's ranking among friends and globally (Google accounts only).
- **Community event**: this month's shared goal, with everyone's total and your part.
- **Friends and nudges**:
  - Add friends by code.
  - Nudge them; they can reply.
  - **Train together**: a shared session at two levels, via an invite code.

### `/friend/[uid]` — A friend's profile 🔑
- **Content**: their public profile (name, level, streak, XP, sessions, skills).
- **Who can open it**: anyone signed in who has the link.
- **What can't be done**: the profiles collection can't be listed, so nobody can browse all players.

## Me

### `/profile` — Me ✅
- **Activity**:
  - Achievements.
  - **Bodyweight** log with its trend.
  - **Your totals**: reps and time per exercise.
  - The **XP** chart.
  - **Session history**: every session with its sets; yoga and Pilates sessions are marked.
- **Settings**:
  - Body & schedule.
  - Where you train (equipment).
  - Language.
  - Reminders.
  - Vibration and sharing: haptics, whether friends see your activity, and whether to ask for the park.
- **Account**:
  - Save with Google (guests).
  - Export your data.
  - Sign out (Google accounts).
  - The danger zone:
    - clear training memory
    - reset verifications
    - reset skills
    - start over (also clears the other sports)
    - delete the account (anonymises shared data)

## Server routes

| Route | Who can call it | Limits |
|---|---|---|
| `POST /api/coach-chat` | Any account (valid Firebase token) | 20 per 10 min (guests 6) |
| `POST /api/exercise-tip` | Any account | 30 per 10 min (guests 10) |
| `POST /api/plan-coach` | Any account | 10 per 10 min (guests 3) |
| `POST /api/plan-review` | Any account | 10 per 10 min (guests 3) |
| `POST /api/push/ping` | Any account, and only to a friend | — |
| `POST /api/push/reminders` | The scheduler only (`Authorization: Bearer <CRON_SECRET>`) | — |
| `GET /api/parks/osm` | Anyone (public map data) | 20 per 10 min per address |

**AI routes overall**: there is also a daily cap per account (150 for Google accounts, 30 for guests) and a global cap of 300 per minute per server instance.

## Data permissions (Firestore rules, in short)

| Data | Read | Write |
|---|---|---|
| `users/{uid}`: profile, progress, sports | Owner | Owner |
| `users/{uid}/sessions` | Owner | Owner |
| `users/{uid}/friends` | Owner | Owner, or the friend mirroring a mutual add |
| `users/{uid}/pings` (nudges) | Owner (can delete) | An established friend can add one (≤ 200 characters) |
| `users/{uid}/feed` | Owner and friends | Owner (fixed fields: `sport` only `yoga`/`pilates`); friends can add or remove only their own kudos |
| `profiles/{uid}` (public profile) | Anyone signed in, by id only (no listing) | Owner |
| `leaderboard/{week}/entries/{uid}` | Anyone signed in | Owner, Google accounts only, values checked |
| Bar parks, their reports, likes and visits, and the map cache | Anyone signed in | Signed in, fixed fields; reactions only your own |

The exact rules are in the README ("Firestore security rules") and `docs/DEVELOPER_NOTES.md`, and a test keeps the two in sync.
