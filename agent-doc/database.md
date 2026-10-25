# Database Schema & Design

## Overview
- **Server Database**: Neon PostgreSQL (Singapore region).
- **Client Database**: SQLite on Android phones — `pending_calls`, `do_not_track`, `sweep_state`, `scheduled_reminders`, `call_history`.
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
    auth_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE UNIQUE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_auth_token ON users(auth_token);
```

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
    outcome VARCHAR(20)
);

CREATE UNIQUE INDEX idx_calls_call_id ON calls(call_id);
CREATE INDEX idx_calls_user_dialed ON calls(user_id, dialed_at);
```

- `direction` is `outgoing` or `incoming`; rows from before the column existed are `outgoing`.
- `outcome` is unused: the app never asks for an outcome, so every call syncs without one and the column stays empty on every row. The nullable column remains in place for a future decision.
- Incoming rows never create or resolve leads and never increment `leads.attempt_count`.

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE UNIQUE INDEX idx_leads_phone_number ON leads(phone_number);
CREATE INDEX idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX idx_leads_scheduled ON leads(scheduled_by, scheduled_at);
```

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
    outcome TEXT,
    attempts INTEGER NOT NULL DEFAULT 0
);
```

- `direction` is `outgoing` or `incoming`. Sweep-caught rows are born filled (`dialed_at`, `duration_seconds` from the call log) with `direction = 'incoming'` for answered incoming calls; missed and rejected calls are never recorded.
- For app-dialed calls, `dialed_at` and `duration_seconds` stay `NULL` until the post-call popup's Submit click fills them from the call log, or the 1-hour janitor does. On a failed send the filled values stay saved on the row until the next bulk sync succeeds.
- `synced` 0 = not yet accepted by the server; 1 = the server has the call and it must never be sent again. The flag is what stops the sweep from ever re-counting an app-dialed call.
- Cleanup deletes synced rows whose call time is behind the sweep line, at every successful push; three days is the worst-case backstop (the server refuses calls older than that anyway).
- `outcome` is no longer written — the outcome flow is removed; the column stays from an older version of the app.
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

---

## 3. Migrations & Rollback
- **Greenfield Setup**: Tables are created automatically on startup using Flask-SQLAlchemy `db.create_all()` or initial database migration.
- **Rollback Procedure**: To roll back the database completely, execute:
  ```sql
  DROP TABLE IF EXISTS office_hours CASCADE;
  DROP TABLE IF EXISTS leads CASCADE;
  DROP TABLE IF EXISTS calls CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```
