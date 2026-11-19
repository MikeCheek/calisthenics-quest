# Next ideas

What's left after the current round of work: things to try on a real device, a few
product decisions, and bigger features worth considering.

## 1. Test on real devices

Unit tests and builds pass, but these flows depend on real browsers, phones or services.

- [ ] **Session history**: finish a few sessions, then check history, records and the
      "last time" hints.
- [ ] **Guest mode**: start as a guest, train, then save with Google and confirm nothing
      is lost. Also try linking a Google account that already has BarQuests data.
- [ ] **Account deletion**: delete a test account and confirm it disappears from a
      friend's list and from the leaderboard.
- [ ] **AI features with a real model**: coach chat, exercise tips, plan coach notes and
      plan review, in English and Italian. Also check a guest gets the
      "try again in a few minutes" message after hitting the limit, and that a signed-out
      request gets 401.
- [ ] **Sharing on a phone**: share cards through the native share sheet (iOS Safari,
      Android Chrome) and the download fallback on desktop.
- [ ] **Skill Check video**: record, play back and delete on iOS and Android.
- [ ] **Lock-screen controls**: check that they show up, and how they behave with music
      playing in another app.
- [ ] **Voice coaching**: listen to it in both languages, on iOS (voices load late)
      and Android.
- [ ] **TCX export**: import a file into Strava or Garmin Connect.
- [ ] **Italian copy**: have a native speaker read through the app, especially the
      assessment and the coach's notes.

## 2. Decisions to make

None open right now.

Decided and done: rank titles and exercise names stay in English in every language
(enforced by `tests/names-stay-english.test.ts`); a session now ends in a single summary window (level-up, streak and
XP sit at the top of the report instead of separate overlays and toasts); "Up next"
ranks by how close you are to the next stage, then by trophy-road distance, with goals
as a tie-breaker; the skill descriptions are translated to Italian.

## 3. Bigger work

- **Location leaderboards**: boards per park or per city, opt-in, without sharing exact
  locations.
- **Tamper-proof stats**: weekly totals and XP are reported by each device. Moving that
  calculation into Cloud Functions would make leaderboards trustworthy.
- **Shared AI rate limits and App Check**: today's limits live in each server
  instance's memory. A shared store (Upstash Redis or a Firestore counter) would make
  them exact, and Firebase App Check would stop scripts that aren't the real app.
- **Form checks from video**: use pose estimation (e.g. MediaPipe) in the browser to
  check holds and reps in Skill Check videos, so the videos never leave the device.
- **Native wrapper**: a Capacitor build would allow writing to Apple Health and Health
  Connect, and more reliable notifications.
- **Push notifications through FCM**: so reminders and nudges arrive even when the app
  hasn't been opened recently.
