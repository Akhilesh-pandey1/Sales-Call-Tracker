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
- Malformed call rows are skipped while valid rows in the same batch are saved.
- Returns `{"status": true}` on success.

### `tests/modules/test_dashboard.py`
- All date boundaries for "today", "yesterday", and "last_30_days" match IST (Asia/Kolkata) calendar days over UTC call timestamps.
- Active salespeople with 0 calls still appear in the team list with zeros.
- People list is sorted by today's dials descending.
- Deactivated salespeople are excluded from the `people` array, but their past calls remain counted in team totals — including the `last_30_days` totals.
- `calls_by_hour` buckets dials by IST hour for each period; the 30-day block holds 30-day totals per hour.
- `top_people` returns at most 5 active salespeople by talk seconds in the period, highest first.
- `connected_percent` returns `null` when a period has 0 dials.
- `active_days` counts days with at least one dial; a person with no calls in 30 days has `active_days` 0.
- Top 5 numbers return the highest duration numbers for the last 30 days.

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
