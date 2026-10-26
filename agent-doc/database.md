# Database Schema & Design

## Overview
- **Server Database**: Neon PostgreSQL (Singapore region).
- **Client Database**: SQLite on Android phones — `pending_calls`, `do_not_track`, `sweep_state`, `scheduled_reminders`, `call_history`, `my_list_numbers`.
- **Timezone**: All timestamps are stored in UTC.

---

## 1. PostgreSQL Tables

### `users`
Stores manager and salesperson accounts.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'salesperson',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    country VARCHAR(5) NOT NULL DEFAULT 'IN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE UNIQUE INDEX idx_users_name ON users(name);
```

### `sessions`
Holds one row per login. Every session stays valid until the password changes or the account is deactivated or deleted, so several managers can use the shared login at the same time.

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE UNIQUE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
```

- Every login inserts one row; all of a user's rows stay valid at the same time — a new login never invalidates an older one.
- Token checks look the token up in this table, then verify the owner's `is_active`; an unknown token gets "Invalid or expired token."
- Changing the password deletes all of the user's session rows except the one making the change.
- Deactivating a user deletes all their session rows; deleting the user cascades.
- The old single token column migrated by turning each stored `users.auth_token` value into one `sessions` row, then dropping the column and its index.

### `calls`
Stores completed calls synced from salesperson devices — outgoing calls dialed from the app or caught by the call-log sweep, and answered incoming calls caught by the sweep.

```sql
CREATE TABLE calls (
    call_id VARCHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(30) NOT NULL,
    dialed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    direction VARCHAR(10) NOT NULL DEFAULT 'outgoing',
    interested BOOLEAN NOT NULL DEFAULT FALSE,
    do_not_call BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE UNIQUE INDEX idx_calls_call_id ON calls(call_id);
CREATE INDEX idx_calls_user_dialed ON calls(user_id, dialed_at);
```

- `direction` is `outgoing` or `incoming`; rows from before the column existed are `outgoing`.
- `interested` and `do_not_call` are yes/no flags written by the post-call popup, both false when the salesperson picked none. `notes` holds the popup's optional note text. All three ride the sync batch and are copied onto the matched lead — `do_not_call` true sets that lead's status to `stopped`.
- Incoming rows never create or resolve leads and never increment `leads.attempt_count`.
- A leftover `outcome` column from an old design is dropped by the startup migration whenever it exists. `user_id` marks whose call the row is — every per-person stat counts on it.

### `leads`
Stores shared lead numbers, call outcomes, retry locks, claims, and scheduling.

```sql
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(30) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- 'waiting', 'done', 'stopped'
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_attempted_at TIMESTAMP WITH TIME ZONE,
    retry_locked_until TIMESTAMP WITH TIME ZONE,
    claimed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    claimed_until TIMESTAMP WITH TIME ZONE,
    scheduled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    interested BOOLEAN NOT NULL DEFAULT FALSE,
    do_not_call BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE UNIQUE INDEX idx_leads_phone_number ON leads(phone_number);
CREATE INDEX idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX idx_leads_scheduled ON leads(scheduled_by, scheduled_at);
```

- `interested` and `do_not_call` are yes/no flags copied from the call that resolved the lead; `do_not_call` true makes the lead `stopped`.

### `office_hours`
Holds the single office-hours window applied to call sync and the calls-by-hour chart. One row only.

```sql
CREATE TABLE office_hours (
    id INTEGER PRIMARY KEY DEFAULT 1,
    start_minute INTEGER NOT NULL DEFAULT 600,
    end_minute INTEGER NOT NULL DEFAULT 1140
);
```

- `start_minute` and `end_minute` are minutes since midnight IST. Defaults are 10:00 (600) to 19:00 (1140).
- `end_minute` must be greater than `start_minute`; the server enforces this on update.

---

## 2. Android Local Phone Database (SQLite)

### `pending_calls`
Holds every tracked call on the salesperson's phone — dialed from the app or caught by the call-log sweep — until the server accepts it. A successful sync MARKS the row (`synced_at` set) instead of deleting it; cleanup removes synced rows behind the sweep line at every successful push.

```sql
CREATE TABLE pending_calls (
    call_id TEXT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    intent_at TEXT NOT NULL,
    dialed_at TEXT,
    duration_seconds INTEGER,
    direction TEXT NOT NULL DEFAULT 'outgoing',
    synced INTEGER NOT NULL DEFAULT 0,
    interested INTEGER NOT NULL DEFAULT 0,
    do_not_call INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    attempts INTEGER NOT NULL DEFAULT 0
);
```

- `direction` is `outgoing` or `incoming`. Sweep-caught rows are born filled (`dialed_at`, `duration_seconds` from the call log) with `direction = 'incoming'` for answered incoming calls; missed and rejected calls are never recorded.
- For app-dialed calls, `dialed_at` and `duration_seconds` stay `NULL` until the post-call popup's Submit click fills them from the call log, or the 1-hour janitor does. On a failed send the filled values stay saved on the row until the next bulk sync succeeds.
- `synced` 0 = not yet accepted by the server; 1 = the server has the call and it must never be sent again. The flag is what stops the sweep from ever re-counting an app-dialed call.
- Cleanup deletes synced rows whose call time is behind the sweep line, at every successful push; three days is the worst-case backstop (the server refuses calls older than that anyway).
- `interested` and `do_not_call` are the popup's yes/no choices (0/1) and `notes` its note — written at Submit, sent in the sync batch, kept until cleanup.
- At 5 janitor attempts, an unfilled row is set to `dialed_at = intent_at` and `duration_seconds = 0` so the dial reaches the server and counts.

### `do_not_track`
The salesperson's excluded numbers — local only, never synced. The sweep checks it BEFORE inserting, in both directions: a listed number never enters `pending_calls` and never counts as work in any direction.

```sql
CREATE TABLE do_not_track (
    phone_number TEXT PRIMARY KEY,
    created_at TEXT
);
```

- `phone_number` is stored in E.164 (`+919876543210`), normalized on save with the same libphonenumber-js call and the login country used everywhere else; the salesperson may type 10 digits. No name is stored — numbers only.

### `sweep_state`
One row holding the call-log sweep's resume point.

```sql
CREATE TABLE sweep_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_swept_at TEXT
);
```

- The sweep reads call-log entries newer than `last_swept_at` and moves the value in the SAME SQLite transaction that inserts the sweep's rows, so the app can never crash between saving rows and moving the line. The first-ever sweep starts at the install moment.

### `scheduled_reminders`
One row per booked reminder — a booked lead, or a number booked from the keypad post-call popup. The reminder alarms are rebuilt from this table at every app open, so they survive a reboot.

```sql
CREATE TABLE scheduled_reminders (
    lead_id INTEGER PRIMARY KEY,
    phone_number TEXT NOT NULL,
    scheduled_at TEXT NOT NULL
);
```

- `lead_id` is the reminder's key: the lead's id for lead bookings, or a stable negative key derived from the phone number for keypad bookings — so a keypad key can never collide with a real lead id. Rebooking the same number replaces the row.
- Submitting a call to the booked number deletes the row, matched by normalized phone number.

### `call_history`
Holds the salesperson's call history on the phone — every call the app records in both directions, shown on the History tab. Local only, never synced.

```sql
CREATE TABLE call_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL,
    direction TEXT NOT NULL,
    call_at TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0
);
```

- `direction` is `outgoing` or `incoming`; `duration_seconds` above 0 means connected, 0 means not connected.
- `call_at` is the call's real time in UTC — the filled `dialed_at` for app-dialed calls, the log time for sweep-caught incoming calls.
- One row is written per call, at the moment the call's real time and duration are known — before any sync, so queue cleanup never touches history.
- A Do-not-track number never gets a history row.
- The table keeps at most 1000 rows — an insert past 1000 deletes the oldest row first.
- The first open after the update backfills the table once from the phone's own call log, skipping Do-not-track numbers.

### `my_list_numbers`
The salesperson's personal calling list — the My List tab. Local only, never synced; the manager never sees it.

```sql
CREATE TABLE my_list_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'left',
    interested INTEGER NOT NULL DEFAULT 0,
    do_not_call INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    uploaded_at TEXT NOT NULL,
    called_at TEXT
);
```

- `phone_number` is E.164. Upload replaces: an existing row in any state is deleted and a fresh `left` row is inserted — the same number twice in one upload inserts once.
- `status` is `left` or `called`; `called_at` fills when any recorded call to the number is submitted — from Start Calling or the keypad.
- `interested` and `do_not_call` are the popup's yes/no choices (0/1); the row badge shows Interested or Do not call when one is set.
- Download reads the whole table for the CSV export; Clear deletes all rows after a confirmation that shows the left and called counts.
- The upload size cap lives in the app's `config.json` as `my_list_max_numbers` (10000).

---

## 3. Migrations & Rollback
- **Greenfield Setup**: Tables are created automatically on startup using Flask-SQLAlchemy `db.create_all()` or initial database migration.
- **Rollback Procedure**: To roll back the database completely, execute:
  ```sql
  DROP TABLE IF EXISTS sessions CASCADE;
  DROP TABLE IF EXISTS office_hours CASCADE;
  DROP TABLE IF EXISTS leads CASCADE;
  DROP TABLE IF EXISTS calls CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```
