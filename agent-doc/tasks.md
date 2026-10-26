## Task 1: App — history starts from the first open, never from the whole log

**Description:** The history backfill's first load floors at "now": the missing `history_last_loaded_at` marker means the read window starts at the current moment and that moment is saved as the marker, so no before-install call ever imports.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] On a fresh start the first backfill reads nothing older than the open moment, so before-install calls never get a history row (`decisions.md` — Decision 1).
- [x] A later open reads from the marker onward exactly as before, and history rows already stored stay untouched (`decisions.md` — Decision 1).
- [x] The install moment needs no new storage key — the existing `history_last_loaded_at` marker carries it (`decisions.md` — Decision 1).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 2: App — one history batch never inserts the same call twice

**Description:** The backfill's batch loop dedupes against itself: after a row's call key is built, a key already in the stored-keys set or the batch set is skipped, and every accepted key joins the batch set before continuing.

**Blocked by:** 1

**Status:** Not started

**Acceptance criteria:**
- [x] After `entryCallKey` is built, a key found in the stored set or the batch set is skipped, and every accepted key is added to the batch set before continuing (`decisions.md` — Decision 2).
- [x] Two call-log rows for the same call (same number, same call time) insert exactly one history row (`decisions.md` — Decision 2).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 3: App — the Download CSV splits called date and called time

**Description:** The My List Download CSV carries the columns Number, Status, Interested, Do not call, Notes, Called date, Called time — date as DD/MM and time as HH:MM in the phone's own time, both empty when the number was never called.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] The CSV header reads Number, Status, Interested, Do not call, Notes, Called date, Called time, and the formula guard plus the share flow stay unchanged (`decisions.md` — Decision 3).
- [x] Called date shows DD/MM and Called time shows HH:MM in phone-local time, reusing the way the History tab formats its row times (`decisions.md` — Decision 3).
- [x] A number never called leaves both cells empty (`decisions.md` — Decision 3).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 4: Backend — My Stats responses carry the fuller office-hours label

**Description:** The server computes a second label from the stored window — 12-hour clock, minutes always shown, no AM/PM, like `10:00 to 7:00` — and sends it as `office_hours_full_label` beside the short label in every My Stats response.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] Every My Stats response carries `office_hours_full_label` beside `office_hours_label`, computed on the server from the `office_hours` table (`api.md` — GET /api/dashboard/person/<id>; `decisions.md` — Decision 4).
- [ ] The fuller label always shows minutes — `10:00 to 7:00` — while the short label keeps its minutes-only-when-needed form (`api.md` — office-hours label rules).

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_dashboard_person.py -q` in `backend/`

## Task 5: App — My Stats shows the fuller office-hours label

**Description:** The My Stats screen renders the fuller label on the right of the "Last 30 days" heading — the office timing like "10:00 to 7:00" — and shows nothing there before the first successful fetch.

**Blocked by:** 4

**Status:** Not started

**Acceptance criteria:**
- [ ] The "Last 30 days" heading carries the fuller label on its right, small and muted, exactly as the approved screen shows it (`screen.md` — My Stats; `decisions.md` — Decision 4).
- [ ] Nothing shows before the first successful fetch, and the label follows whatever window the manager last saved (`decisions.md` — Decision 4).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 6: Backend — startup drops the legacy outcome column

**Description:** Startup cleanup drops the dead `outcome` column from the `calls` table whenever it exists, the same way the legacy auth_token cleanup works — Postgres gets DROP COLUMN IF EXISTS, SQLite gets the inspect-then-drop treatment.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] When the `calls` table has an `outcome` column, startup drops it; when it does not, startup skips it and nothing else changes (`database.md` — calls table rules).
- [ ] `user_id` and every live column stay untouched — the dashboards keep counting per person (`database.md` — calls table rules).

**Verification:**
- [ ] Tests pass: `python -m pytest tests/test_foundation.py -q` in `backend/`
