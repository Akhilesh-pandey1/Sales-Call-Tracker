## Task 1: Server — the hourly job frees expired bookings

**Description:** An APScheduler job inside the Flask process frees expired bookings — once at startup, then every hour — and becomes the only place that releases them; the lazy check inside serving is removed.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] `backend/app/tasks/lead_expiry.py` starts the scheduler from `create_app()` — the job runs once the moment the server starts, then every hour, clearing `scheduled_by` and `scheduled_at` on every `waiting` lead booked more than `SCHEDULE_EXPIRE_HOURS` (24) hours past its time, attempts untouched — and never starts under pytest (`decisions.md` Decision 1; `structure.md` — `tasks/lead_expiry.py`).
- [x] `serve_next_lead` no longer calls `release_expired_bookings()` — the hourly job is the only release point (`decisions.md` Decision 1).
- [x] Tests prove the job frees expired bookings, a booking inside the 24-hour window stays reserved, and serving no longer frees anything (`testing.md` — `test_leads.py`).

**Verification:**
- [x] Focused tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests/modules/test_leads.py -q`
- [x] All backend tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests -q`

## Task 2: App — hour chart centers the segment counts

**Description:** On My Stats, each hour bar's outgoing and incoming counts move to the vertical middle of their own colored segments, matching the web chart; the total stays on top.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] The outgoing count sits centered in the outgoing segment and the incoming count centered in the incoming segment; the total label stays above the bar (`decisions.md` Decision 2).
- [x] A count still shows only when its segment holds at least one eighth of the tallest bar's calls, with fonts and colors unchanged (`decisions.md` Decision 2).

**Verification:**
- [x] Lint passes: `npm run lint` in `app/`
- [x] Types pass: `npx tsc --noEmit` in `app/`

## Task 3: Web — hour chart gains the direction dot legend

**Description:** The manager's calls-by-hour chart shows a one-row legend — blue dot "Outgoing", green dot "Incoming" — between the chart and its summary line.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] The web hour chart shows the dot legend in the same colors as its segments — `hsl(var(--primary))` for outgoing, `INCOMING_COLOR` for incoming — with the summary line untouched below it (`decisions.md` Decision 2).

**Verification:**
- [x] Build succeeds: `npm run build` in `web/`

## Task 4: App — hour chart gains the direction dot legend

**Description:** The salesperson's calls-by-hour chart shows the same one-row legend under the bars, in the colors the Call Split card already uses.

**Blocked by:** 2

**Status:** Done

**Acceptance criteria:**
- [x] The app hour chart shows a blue dot "Outgoing" and a green dot "Incoming" in a row under the bars — `bg-primary` and `bg-accent`, the Call Split card colors (`decisions.md` Decision 2).

**Verification:**
- [x] Lint passes: `npm run lint` in `app/`
- [x] Types pass: `npx tsc --noEmit` in `app/`

## Task 5: App — calling-SIM foundation

**Description:** A small Kotlin module reads the phone's active SIM numbers and places a call on the slot matching a chosen number; the chosen number saves on the phone only. No UI and no dial change yet.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] `SimCallModule.kt` reads the active SIMs with their numbers and carrier names, and places a call on the slot matching a given number through `TelecomManager.placeCall` with that SIM's account handle; the JS bridge (`sim-module.ts`) exposes both (`decisions.md` Decision 3; `structure.md` — `SimCallModule.kt`, `sim-module.ts`).
- [x] The chosen number saves, reads, and clears in AsyncStorage in international format, and matching normalizes both sides (+91 vs 0) with the login country (`decisions.md` Decision 3).

**Verification:**
- [x] Lint passes: `npm run lint` in `app/`
- [x] Types pass: `npx tsc --noEmit` in `app/`

## Task 6: App — every dial leaves on the chosen number

**Description:** The call launcher branches through the SIM module: a chosen number places the call on its slot with no picker; no choice keeps today's default behavior; a missing number blocks the call.

**Blocked by:** 5

**Status:** Done

**Acceptance criteria:**
- [x] With a number chosen, keypad and lead dials place the call on the matching slot with no SIM picker, and the pending-call row is written only after the SIM is found (`decisions.md` Decision 3).
- [x] With no number chosen, or CALL_PHONE off, the call keeps today's path on Android's default SIM (`decisions.md` Decision 3).
- [x] A stored number not present in any slot blocks the call with "This SIM number is not in the phone." — nothing dialed, nothing recorded (`decisions.md` Decision 3).

**Verification:**
- [x] Lint passes: `npm run lint` in `app/`
- [x] Types pass: `npx tsc --noEmit` in `app/`

## Task 7: App — Settings picks the calling number

**Description:** Settings gains a fourth row opening a picker screen: the phone's readable SIM numbers with carrier names, a checkmark on the chosen one, and a "Use phone default" item.

**Blocked by:** 5

**Status:** Done

**Acceptance criteria:**
- [x] The Settings fourth row opens `calling-sim-screen.tsx`: readable SIM numbers with carrier names, the current choice checkmarked, and "Use phone default" restoring the default path (`decisions.md` Decision 3; `structure.md` — `calling-sim-screen.tsx`).
- [x] A pick saves at once and shows on the next open; when the phone hides all SIM numbers, the screen says so and keeps the salesperson on phone default (`decisions.md` Decision 3).

**Verification:**
- [x] Lint passes: `npm run lint` in `app/`
- [x] Types pass: `npx tsc --noEmit` in `app/`

## Task 8: App — the reminder notification shows the app icon

**Description:** The reminder notification gains a white phone glyph for the status bar and the full-color app icon for the drawer — the blank shape today is gone.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] `ic_reminder_icon` exists at all five densities — a white phone shape on a transparent background — and the reminder notification sets it as `smallIcon` with the launcher icon as `largeIcon` (`decisions.md` Decision 4).
- [x] Nothing else in the reminder notification changes — same channel, title, body, and press action (`decisions.md` Decision 4).

**Verification:**
- [x] Lint passes: `npm run lint` in `app/`
- [x] Types pass: `npx tsc --noEmit` in `app/`
