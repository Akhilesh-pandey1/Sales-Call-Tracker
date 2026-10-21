# Testing Specifications

Automated tests live in the backend API using `pytest`. Mobile testing is handled through the dedicated tracking spike checklist on physical Android devices.

---

## 1. Backend Automated Tests (`backend/tests/`)

### `tests/modules/test_auth.py`
- Valid login returns token, user ID, role, name, country.
- Invalid password returns 401 `"Wrong name or password."`.
- Correct credentials on deactivated account returns 403 `"Your account is not active. Please contact your manager."`.
- 10 consecutive failed attempts locks out the name for 5 minutes (429 `"Too many tries. Wait 5 minutes and try again."`), blocking even the correct password.

### `tests/modules/test_calls.py`
- Single batch inserts multiple valid calls and associates them with the token owner's user ID.
- Duplicate `call_id`s in subsequent batches are skipped silently without error or duplication.
- Calls older than 3 days (`MAX_CALL_AGE_DAYS`) are discarded with a server log line.
- A call starting 09:59 IST is discarded with a server log line; 10:00 is saved (window start inclusive).
- A call starting 18:59 and exactly 19:00 IST are saved; 19:01 is discarded (window end inclusive).
- After the manager updates the office hours window, the gate uses the new window on the next sync.
- Malformed call rows are skipped while valid rows in the same batch are saved.
- Calls sync without an outcome; the `outcome` column stays empty on every saved row.
- A call to a number with no lead creates that lead as `waiting` and resolves it from the same call — connected marks it `done`, not connected burns attempt 1.
- A second sync for a number that already has a lead never creates a second lead.
- A call item with `scheduled_at` inside 30 days schedules the resolved lead; the call is saved.
- A `scheduled_at` on a call that connects still books the lead — the lead ends `waiting` and scheduled, never `done`; the call is saved.
- A schedule lifts a `done` or `stopped` lead back to `waiting` with the schedule set, attempts untouched.
- The newest schedule wins ownership of the lead, across salespeople.
- A past or beyond-30-days `scheduled_at` is skipped with a log line; the call is still saved.
- Returns `{"status": true}` on success.

### `tests/modules/test_dashboard.py`
- All date boundaries for "today", "yesterday", and "last_30_days" match IST (Asia/Kolkata) calendar days over UTC call timestamps.
- Each period object carries its own totals, computed KPIs, `calls_by_hour`, and `top_people`; the team response has no `people` array.
- `not_connected` equals `dials - connected`; `minutes` equals `round(seconds / 60)`.
- `connected_percent` returns `null` when a period has 0 dials, otherwise the rounded percent.
- `avg_per_person_per_day` divides each metric by the period day count and the active salesperson count, then rounds.
- `vs_yesterday` exists only on `today`, holds today minus yesterday in the displayed unit, and is `null` on the other two periods.
- `calls_by_hour.hours` spans the office hours window start-to-end inclusive; `best_hour` is `null` when the period has no calls.
- The `last_30_days` `calls_by_hour.dials` holds `round(total / 30)` per hour.
- Calls by deactivated salespeople stay counted in every period total.
- `avg_per_active_day` is `null` when `active_days` is 0, otherwise the rounded per-active-day averages.
- Top 5 numbers return the highest talk-time numbers with `minutes` alongside `seconds`.
- `GET /api/dashboard/team/people` returns one row per active salesperson with today and yesterday blocks holding only `dials`, `connected`, and `minutes` — no `seconds` anywhere.
- People rows include zero-call salespeople, exclude deactivated salespeople, and arrive sorted by today's dials highest first.
- A salesperson token gets 403 on `GET /api/dashboard/team/people`.

### `tests/modules/test_settings.py`
- GET returns the stored window as `start_time` / `end_time` `HH:MM` strings.
- PUT updates the window, and the next call sync and chart immediately use the new window.
- PUT with `end_time` not after `start_time` returns 400 `"End time must be after start time."`.
- PUT with a malformed body or non-`HH:MM` values returns 400.
- A salesperson token gets 403 on both GET and PUT.

### `tests/modules/test_users.py`
- Manager creates a salesperson with unique name, password (8+ chars, upper/lower), and country code.
- Duplicate name on create or edit returns 400 `"That name is already taken."`.
- Editing password generates a new session token, invalidating old sessions.
- Deactivating an account sets `is_active = false` and revokes session.
- Self-deactivation and self-deletion by the manager are rejected with 400 `"You cannot do this to your own account."`.
- Permanent delete removes the user and cascades to delete all their call rows.

### `tests/modules/test_leads.py`
- **CSV Upload**: Valid numbers are added as E.164; duplicates within the file, unparseable numbers, and existing pool numbers are skipped with counts returned. Files over 2 MB are rejected with 400 `"File is too large."`.
- **Calling Loop (`POST /api/leads/next`)**:
  - Serves current active claim first if still valid.
  - Serves due scheduled leads reserved for the calling salesperson before new pool leads.
  - Serves newest available leads (`created_at DESC`) when no due schedules exist.
  - Claims the served lead for 10 minutes (`CLAIM_MINUTES`).
  - Supports scheduling current lead and fetching next in a single request; a schedule books the lead whatever its state — `done` and `stopped` included, ending `waiting` with the retry lock and claim cleared — and the newest schedule wins ownership.
  - `continue_calling: false` stores the schedule (if supplied) and releases the claim but serves and claims no lead — the response `lead` is `null`.
- **Resolution via Call Sync**:
  - Connected call (`duration > 0`) marks lead `status = 'done'`.
  - Unconnected call (`duration == 0`) increments attempt count and locks for 2 hours (`RETRY_LOCK_HOURS`).
  - 3rd unconnected attempt marks lead `status = 'stopped'`.
- **Manager Summary**:
  - Pool bucket counts (waiting, scheduled, connected, stopped) are mutually exclusive.
  - `waiting_by_attempts` splits the waiting pool by attempt count, and `waiting` equals its sum.
  - `uploaded` counts leads by `created_at`; `tackled` counts distinct leads with a synced call — both for the today and yesterday IST windows.
  - Per-person lead call counts for today match recorded calls.

---

## 2. Mobile Android Spike Checklist

The tracking spike verifies the complete dialer and call-log pipeline on the oldest target Android phone before UI construction:
1. Normal answered call records actual talk time (not ring time).
2. Unanswered dial records duration 0.
3. Long ring (3 minutes) before answer matches within the 1-minute window.
4. Two quick successive calls to the same number match in order.
5. Incoming call from the same number is ignored (OUTGOING calls only).
6. App killed mid-call completes via the 1-hour janitor on the next app open.
7. Call-end listener opens the post-call popup upon hang-up.
8. Submit-click read records the real duration even when the phone writes its call-log entry late (vendor delay) — a 15-second connected call shows 15 seconds on the dashboard, never 0.

---

## 3. App Calling & Navigation — Manual On-Device Pass

The app has no automated UI tests; the calling and navigation fixes are verified by hand on a real phone:
- Tapping Call starts the call at once in the Android calling screen — no other dialer app, no second confirm tap.
- With CALL_PHONE off, the Call button hands the number to the phone's own dialer (one extra tap there) and no intent row is written.
- When a call ends, the post-call popup is already open on return to the app: a lead call shows the schedule question with "Do not schedule" pre-selected and "Go to next call" pre-checked; a keypad call shows the dialed number with the same schedule question.
- Returning to the app while the call is still running shows no popup — it appears only after the call has ended.
- Tapping the follow-up field opens the native date picker first, then the native time picker; past dates and dates beyond 30 days cannot be picked.
- Tapping Submit sends the call, and a 15-second connected call shows 15 seconds of talk time on the dashboard — never 0.
- With airplane mode on, Submit saves the row on the phone with its duration; with internet back, the next app open bulk-sends it and the row is deleted.
- Unchecking "Go to next call" and submitting stops the automated loop — no new lead is served until Start calling is tapped again.
- Submit with "Go to next call" checked starts the next lead's call immediately.
- Tapping outside the post-call popup or pressing the back button does nothing — Submit is the only way through, for lead and keypad calls alike.
- Tapping Log out on the Settings screen sends any unsent calls first and returns to the Login screen; with airplane mode and unsent calls it shows how many are waiting and stays logged in.
- The My Stats calls-by-hour chart opens on Today.
- The tab bar shows three tabs with icons — Dialer (phone), My Stats (bar chart), Settings (gear) — and the My Stats header has no gear button.
- No screen draws content under the status bar (Login, Dialer, My Stats, Settings).
- The Settings "Clear local data" row shows its full title and description, and tapping it opens the confirm dialog.
- Holding the dialer backspace clears the whole typed number; a single tap still deletes one character.
- My Stats shows the Last-30-days KPI cards, the performance table, and the Calls-by-hour chart with its period switch — and no most-contacted-numbers table.
- Every screen keeps a slim 12px side margin.
