# Database Schema & Design

## Overview
- **Server Database**: Neon PostgreSQL (Singapore region).
- **Client Queue**: SQLite on Android phones (`pending_calls` table only, temporary buffer).
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
Stores completed calls synced from salesperson devices.

```sql
CREATE TABLE calls (
    call_id VARCHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(30) NOT NULL,
    dialed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    outcome VARCHAR(20)
);

CREATE UNIQUE INDEX idx_calls_call_id ON calls(call_id);
CREATE INDEX idx_calls_user_dialed ON calls(user_id, dialed_at);
```

- `outcome` holds the salesperson's chosen result: `connected`, `not_connected`, or `schedule`. Empty means the outcome was never recorded. The column is additive — existing rows keep it empty and nothing is backfilled.

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
Temporary queue living only on the salesperson's phone. Rows are deleted after `POST /api/calls/sync` succeeds.

```sql
CREATE TABLE pending_calls (
    call_id TEXT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    intent_at TEXT NOT NULL,
    dialed_at TEXT,
    duration_seconds INTEGER,
    outcome TEXT,
    attempts INTEGER NOT NULL DEFAULT 0
);
```

- `dialed_at` and `duration_seconds` remain `NULL` until filled by the real-time call-end listener or the 1-hour janitor.
- `outcome` holds the result picked in the outcome dialog (`connected` or `not_connected`) until sync sends it; the row is deleted after sync as usual.
- At 5 janitor attempts, an unfilled row is set to `dialed_at = intent_at` and `duration_seconds = 0` so the dial reaches the server and counts.

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
