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
  - Supports scheduling current lead and fetching next in a single request.
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
7. Call-end listener fires upon hang-up.
8. Call-log reading retries at 3s / 10s / 30s to handle vendor logging delays.

---

## 3. App Calling & Navigation — Manual On-Device Pass

The app has no automated UI tests; the calling and navigation fixes are verified by hand on a real phone:
- Tapping Call starts the call at once in the Android calling screen — no other dialer app, no second confirm tap.
- With CALL_PHONE off, the Call button hands the number to the phone's own dialer (one extra tap there) and no intent row is written.
- When an automated call ends, the Call Outcome box is already open on return to the app — three results with icons, the auto-dial-next checkbox, and Save & Continue.
- Closing the outcome box without saving keeps the lead card with an Enter outcome button, and the call can still be logged.
- Save & Continue with auto-dial on starts the next lead's call immediately.
- The tab bar shows three tabs with icons — Dialer (phone), My Stats (bar chart), Settings (gear) — and the My Stats header has no gear button.
- No screen draws content under the status bar (Login, Dialer, My Stats, Settings).
