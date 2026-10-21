## Task 1: The schedule always books the lead

**Description:** The rule from the testing round replaces Decisions 108 and 168: a chosen schedule always books the lead, whatever its state — `waiting`, `done`, or `stopped`. When a synced call carries `scheduled_at` or `/api/leads/next` carries a schedule, the lead ends `waiting` with `scheduled_at` and `scheduled_by` set, retry lock and claim cleared, and the last salesperson to schedule owns the reservation — so a keypad schedule by one salesperson takes the lead over from another, and a schedule lifts a lead out of `done` or `stopped`. Only a bad time is refused — past or beyond `MAX_SCHEDULE_AHEAD_DAYS`. A not-connected call with a schedule still burns its attempt, and the follow-up call later follows the normal rules — connects with no new schedule means `done`, not connected burns an attempt, a new schedule books again.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] A call with `scheduled_at` — sync path and `/api/leads/next` path alike — leaves the lead `waiting` and scheduled to that salesperson even when the call connected or the lead was `done` or `stopped`, and the newest schedule wins the ownership
- [ ] A past or beyond-30-days `scheduled_at` is still refused on both paths, and a not-connected call with a schedule still burns its attempt while booking
- [ ] The new cases are covered in `backend/tests/modules/test_calls.py` and `backend/tests/modules/test_leads.py` per `testing.md`

**Verification:**
- [ ] Tests pass: `python -m pytest backend/tests/modules/test_calls.py backend/tests/modules/test_leads.py` (from the project root)

---

## Task 2: The schedule picker opens on the phone's current time

**Description:** The picker stops opening on a fixed tomorrow-9:00-AM (the testing complaint). Tapping the schedule field opens Android's date dialog on the phone's current date and the time dialog right after on the phone's current time. The field's resting value — used when the salesperson submits without opening the picker — becomes tomorrow at the current mobile time, so a quick Submit always books a valid future moment. The label format and the 30-day maximum stay as they are.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] Tapping the field opens the date dialog on today's date and the time dialog on the phone's current time
- [x] Submitting without opening the picker books tomorrow at the current mobile time, still inside the future-only and 30-day rules

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 3: The app locks its light theme against phone dark mode

**Description:** The black-and-white devices came from phone dark mode — the app followed it but has no dark palette, so colors collapsed. The app locks to light mode in the Android config (`userInterfaceStyle: "light"`) and forces it at startup, so the phone's dark mode can never change the app's colors. The approved light mockups stay the only look, on all devices.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] The Android config declares light-only UI style and the app forces the light color scheme at startup
- [ ] The app renders the light theme with the phone's dark mode turned on

**Verification:**
- [ ] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [ ] Lint passes: `npm run lint` (from `app/`)
