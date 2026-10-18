## Task 1: A synced call carries the salesperson's chosen outcome

**Description:** The `calls` table gains one nullable `outcome` column (Decision 149) and `POST /api/calls/sync` stores the optional per-call `outcome` (`connected`, `not_connected`, or `schedule`) from each batch row (Decision 151's sync path). An absent or empty value leaves the outcome unrecorded; nothing is backfilled. Because `db.create_all()` cannot add a column to the already-created table, startup also ensures the column exists (Postgres `ADD COLUMN IF NOT EXISTS`), keeping Decision 116's startup-initialization pattern.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] Sync stores a valid per-call `outcome`; an absent or empty value leaves the column unset, and an invalid value skips that row like any malformed row
- [x] The `calls` table has the nullable `outcome` column after startup — on a fresh database and on the existing one, with existing rows left empty
- [x] The outcome tests in `backend/tests/modules/test_calls.py` cover the stored, absent, and invalid cases per `testing.md`

**Verification:**
- [x] Tests pass: `python -m pytest backend/tests/modules/test_calls.py` (from the project root)

---

## Task 2: An already-synced call receives its outcome through PATCH

**Description:** When a call synced before the person chose, the app records the choice with `PATCH /api/calls/<call_id>/outcome` (Decision 151's second path). The endpoint updates only the authenticated user's own call, replaces a previously stored outcome, and answers per the `api.md` contract: 400 for an invalid value, 404 for an unknown or another user's call.

**Blocked by:** Task 1

**Status:** Done

**Acceptance criteria:**
- [x] PATCH updates the outcome of the token owner's synced call, and a new outcome replaces a stored one
- [x] An invalid value returns 400 "Outcome must be connected, not_connected, or schedule."; an unknown call or another user's call returns 404 "Call not found."

**Verification:**
- [x] Tests pass: `python -m pytest backend/tests/modules/test_calls.py` (from the project root)

---

## Task 3: Fix dialogs that mount but never become visible

**Description:** The Settings confirm dialog and the Call Outcome dialog mount but never show (Decision 152) — a shared dialog-rendering bug in the `@rn-primitives/dialog`-based wrapper at `app/src/components/ui/dialog.tsx`. Isolate the cause with a plain React Native Modal test, then correct the dialog primitive usage or move the shared wrapper to React Native's built-in Modal. Dialog content stays exactly as the approved mockups, and the lead card's Enter outcome button stays as the fallback that reopens the dialog.

**Blocked by:** None

**Status:** Code done — needs the on-device visibility check

**Acceptance criteria:**
- [ ] The cause is identified and fixed in the shared dialog wrapper — the Settings confirm dialog and the Call Outcome dialog both become visible when opened
- [ ] Dialog content matches the approved mockups, and the lead card's Enter outcome button still reopens the dialog after it was closed without saving

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 4: The phone queue keeps the chosen outcome until sync

**Description:** The `pending_calls` SQLite queue gains an `outcome` column (Decisions 53, 151): the picked result sits on the row until a sync sends it, then the row is deleted as usual. Sync's payload carries each call's stored outcome when present (Decision 151's first path). Existing installs gain the column without losing queued rows — `CREATE TABLE IF NOT EXISTS` alone cannot alter an already-created table.

**Blocked by:** Task 1

**Status:** Done

**Acceptance criteria:**
- [x] The queue stores the chosen outcome on a pending row, and an existing install's database gains the column without losing queued rows
- [x] Sync sends each filled call's stored outcome in the batch; calls with no recorded outcome send none

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 5: Keypad calls ask for the outcome when the call ends

**Description:** After a keypad call ends, the Call Outcome dialog opens by itself (Decision 150) — driven by the real call-state end or the app returning to the foreground, reusing the existing call-ended event. It shows the dialed number with Connected and Did not connect and a Save button that records the outcome: on the queued row when the call is still on the phone, or through PATCH when it already synced (Decision 151). The keypad version has no Schedule choice, no auto-dial checkbox, and no attempt line.

**Blocked by:** Task 3, Task 4

**Status:** Not started

**Acceptance criteria:**
- [ ] When a keypad call ends, the dialog opens by itself showing the dialed number with Connected and Did not connect only, and Save records the choice
- [ ] Save stores the outcome on the queued row when the call is still on the phone, and calls PATCH when the call already synced
- [ ] The keypad dialog has no Schedule choice, no auto-dial checkbox, and no attempt line

**Verification:**
- [ ] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [ ] Lint passes: `npm run lint` (from `app/`)

---

## Task 6: Save & Continue records the outcome on the call

**Description:** The automated flow's Save & Continue keeps its current server behavior — schedule the lead when chosen, then claim the next lead through `/api/leads/next` — and now also records the chosen outcome on the call record (Decision 157), through the same queue-or-PATCH rule built for keypad calls.

**Blocked by:** Task 5

**Status:** Not started

**Acceptance criteria:**
- [ ] Save & Continue still schedules the lead when chosen and claims the next lead through `/api/leads/next`
- [ ] The chosen outcome is recorded on the call record — on the queued row or through PATCH, the same rule as keypad calls

**Verification:**
- [ ] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [ ] Lint passes: `npm run lint` (from `app/`)

---

## Task 7: My Stats is rebuilt to the approved mockup

**Description:** My Stats matches its approved mockup (`agent-doc/screens/08-my-stats--M.html`, Decision 155): a "Last 30 days" block of four KPI cards — Active days out of 30, Avg dials, Avg connected, Avg minutes — averaging per active day with the period totals as sub-lines; the Calls-by-hour bar chart with a Today / Yesterday / 30 days switch and a best-hour summary line; and the existing three-period performance table. The most-contacted-numbers table is removed. Everything renders from fields the person endpoint already returns (`calls_by_hour`, `active_days`, `avg_per_active_day`) — no new endpoint and no chart library; the bars are plain views.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] My Stats shows the Last-30-days KPI cards, the calls-by-hour chart with its period switch and best-hour summary line, and the existing performance table — matching the approved mockup
- [x] The most-contacted-numbers table is removed from My Stats
- [x] Everything renders from fields the person endpoint already returns — no new endpoint and no chart library

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 8: Every app screen uses a 12px side gutter

**Description:** Every app screen — Dialer, My Stats, Settings, and their cards and headers — switches from the current 20px padding to a 12px side gutter (Tailwind `px-3`), because phone screens are narrow (Decision 156). Dialogs keep their own centered padding. My Stats is rebuilt first (Task 7), so this pass lands the gutter on its final layout.

**Blocked by:** Task 7

**Status:** Done

**Acceptance criteria:**
- [x] Dialer, My Stats, and Settings — screens, cards, and headers — use a 12px side gutter (`px-3`), replacing the 20px padding
- [x] Dialogs keep their own centered padding

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 9: The Clear local data row grows to fit its full content

**Description:** The Settings "Clear local data" row forces the button's standard 40px height, cutting off its two text lines (Decision 153). The row stops forcing that height and sizes itself to its icon and its title plus description, so both lines show in full.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] The row shows its full title and description at its natural height — no forced standard button height
- [x] Tapping the row still opens the clear-local-data confirm dialog

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 10: The dialer backspace clears everything on a long press

**Description:** A tap on the dialer backspace deletes one character as before; holding the button for about half a second wipes the whole typed number in one go (Decision 154).

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [ ] A tap deletes one character exactly as before
- [ ] Holding the backspace for about half a second clears the whole typed number

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)
