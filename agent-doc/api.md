# API Specifications

All endpoints use JSON bodies unless specified otherwise. All endpoints except `POST /api/login` require an `Authorization: Bearer <token>` header from an active user session.

---

## 1. Authentication

### `POST /api/login`
Authenticates a manager or salesperson.

- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "Ramesh",
    "password": "Password123"
  }
  ```
- **Response 200**:
  ```json
  {
    "token": "4f8a9b2c...",
    "id": 3,
    "role": "salesperson",
    "name": "Ramesh",
    "country": "IN"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{"message": "Name and password are required."}`
  - `401 Unauthorized`: `{"message": "Wrong name or password."}`
  - `403 Forbidden`: `{"message": "Your account is not active. Please contact your manager."}`
  - `429 Too Many Requests`: `{"message": "Too many tries. Wait 5 minutes and try again."}` (triggered after 10 consecutive failures for a given name; lockout persists for 5 minutes in server memory).

---

## 2. Call Sync

### `POST /api/calls/sync`
Receives a batch of completed calls from the salesperson's mobile app.

- **Auth**: Any active user token
- **Request Body**:
  ```json
  {
    "calls": [
      {
        "call_id": "c1f7b8d4-5e92-4a7b-91c2-3e4f5a6b7c8d",
        "phone_number": "+919876543210",
        "dialed_at": "2026-10-14T06:30:00Z",
        "duration_seconds": 95
      },
      {
        "call_id": "d2a8c9e5-6f03-4b8c-82d3-4f5a6b7c8d9e",
        "phone_number": "+919812345678",
        "dialed_at": "2026-10-14T06:45:00Z",
        "duration_seconds": 0
      }
    ]
  }
  ```
- **Processing Logic**:
  - Saves all valid call entries under the authenticated user's ID.
  - Silently ignores existing `call_id` values (idempotent unique key).
  - Skips and logs any call older than 3 days (`MAX_CALL_AGE_DAYS`).
  - Skips and logs any call whose IST start minute falls outside the office hours window (`office_hours` table), both ends inclusive — a call started 19:00 is kept, 19:01 is skipped.
  - Automatically updates any matching lead in `leads`:
    - If `duration_seconds > 0` (connected): marks `status = 'done'`, clears claims and schedules.
    - If `duration_seconds == 0` (not connected): increments `attempt_count`, sets `retry_locked_until = now() + 2 hours`. If attempts reach 3 (`MAX_LEAD_ATTEMPTS`), sets `status = 'stopped'`. Clears claims and schedules.
- **Response 200**:
  ```json
  { "status": true }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{"message": "Invalid request format: 'calls' array required."}`
  - `401 Unauthorized`: `{"message": "Invalid or expired token."}`
  - `403 Forbidden`: `{"message": "Your account is not active. Please contact your manager."}`

---

## 3. Dashboards

### `GET /api/dashboard/team`
Returns team call aggregates for today, yesterday, and the last 30 days. Each period carries its own totals, computed KPIs, calls-by-hour, and top people. The frontend only formats these values for display.

- **Auth**: Manager token only
- **Response 200**:
  ```json
  {
    "today": {
      "dials": 120,
      "connected": 64,
      "not_connected": 56,
      "seconds": 18600,
      "minutes": 310,
      "connected_percent": 53,
      "avg_per_person_per_day": {
        "dials": 12,
        "connected": 6,
        "not_connected": 6,
        "minutes": 31
      },
      "vs_yesterday": {
        "dials": -25,
        "connected": -6,
        "not_connected": -19,
        "minutes": -45
      },
      "calls_by_hour": {
        "hours": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        "dials": [0, 5, 25, 38, 15, 20, 12, 3, 1, 1],
        "best_hour": 12
      },
      "top_people": [
        { "id": 3, "name": "Ramesh", "seconds": 2280, "minutes": 38 }
      ]
    },
    "yesterday": { "...": "same shape as today, with \"vs_yesterday\": null" },
    "last_30_days": { "...": "same shape as today, with \"vs_yesterday\": null; calls_by_hour.dials holds per-day averages" }
  }
  ```
- **Rules**:
  - Each period object holds every number its screen shows: raw counts (`dials`, `connected`, `not_connected`, `seconds`, `minutes`) and the computed KPIs (`connected_percent`, `avg_per_person_per_day`, `vs_yesterday`).
  - `not_connected` is `dials - connected`; `minutes` is `round(seconds / 60)`.
  - `connected_percent` is `round(connected / dials * 100)`, `null` when dials is 0.
  - `avg_per_person_per_day` divides each metric by the period day count (1 or 30) and the active salesperson count, then rounds.
  - `vs_yesterday` exists only on `today`; each value is today minus yesterday in the displayed unit (`minutes` against yesterday's `minutes`). It is `null` on the other two periods.
  - `calls_by_hour.hours` lists the IST hours of the office hours window, start to end inclusive. `calls_by_hour.dials` holds one count per hour; for `last_30_days` it holds `round(total / 30)` per hour. `best_hour` is the hour number with the highest count, `null` when the period has no calls.
  - `top_people` holds at most 5 active salespeople by talk seconds in the period, highest first.
  - Period totals count every stored call in those IST windows, including calls made by currently deactivated salespeople.
- **Error Responses**:
  - `401 Unauthorized`: `{"message": "Invalid or expired token."}`
  - `403 Forbidden`: `{"message": "This dashboard is for managers."}`

### `GET /api/dashboard/team/people`
Returns one row per active salesperson for the Team page table: today and yesterday dials, connected, and minutes. The frontend only formats these values for display.

- **Auth**: Manager token only
- **Response 200**:
  ```json
  [
    {
      "user_id": 3,
      "name": "Ramesh",
      "today": { "dials": 58, "connected": 21, "minutes": 96 },
      "yesterday": { "dials": 47, "connected": 15, "minutes": 74 }
    }
  ]
  ```
- **Rules**:
  - One row per active salesperson; a person with no calls still lists with zeros. Deactivated salespeople never appear.
  - Each period block carries only `dials`, `connected`, and `minutes`; `minutes` is `round(seconds / 60)` computed on the server. No `seconds` field is returned.
  - Rows are sorted by today's dials, highest first.
  - Today and yesterday are IST calendar days over UTC call timestamps, same as the team endpoint.
- **Error Responses**:
  - `401 Unauthorized`: `{"message": "Invalid or expired token."}`
  - `403 Forbidden`: `{"message": "This dashboard is for managers."}`

### `GET /api/dashboard/person/<id>`
Returns call performance stats, calls-by-hour, and top 5 numbers for a specific user across today, yesterday, and the last 30 days. Each period carries its own totals and computed KPIs. The frontend only formats these values for display.

- **Auth**: Manager token (can view any user) OR Salesperson token (where `token.user_id == id`).
- **Response 200**:
  ```json
  {
    "name": "Ramesh",
    "today": {
      "dials": 12,
      "connected": 7,
      "not_connected": 5,
      "seconds": 2280,
      "minutes": 38,
      "connected_percent": 58,
      "calls_by_hour": {
        "hours": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        "dials": [0, 1, 2, 3, 1, 2, 1, 1, 0, 1],
        "best_hour": 13
      }
    },
    "yesterday": { "...": "same shape as today" },
    "last_30_days": {
      "dials": 410,
      "connected": 205,
      "not_connected": 205,
      "seconds": 61200,
      "minutes": 1020,
      "connected_percent": 50,
      "active_days": 26,
      "avg_per_active_day": {
        "dials": 16,
        "connected": 8,
        "minutes": 39
      },
      "calls_by_hour": { "...": "same shape; dials holds per-day averages" }
    },
    "top_numbers": [
      {
        "phone_number": "+919876543210",
        "seconds": 4320,
        "minutes": 72,
        "calls": 14
      }
    ]
  }
  ```
- **Rules**:
  - `not_connected` is `dials - connected`; `minutes` is `round(seconds / 60)`.
  - `connected_percent` is `round(connected / dials * 100)`, `null` if dials equal 0 in that period.
  - `active_days` counts the days with at least one dial inside the last 30 IST days.
  - `avg_per_active_day` divides dials, connected, and exact talk minutes by `active_days`, then rounds; it is `null` when `active_days` is 0.
  - `calls_by_hour` follows the same rules as the team endpoint: office-hours `hours`, one count per hour (per-day averages for `last_30_days`), and `best_hour` as the hour number or `null`.
  - `top_numbers` includes at most 5 phone numbers with the highest talk seconds in the last 30 days.
- **Error Responses**:
  - `401 Unauthorized`: `{"message": "Invalid or expired token."}`
  - `403 Forbidden`: `{"message": "Access denied: you can only view your own statistics."}`
  - `404 Not Found`: `{"message": "User not found."}`

---

## 4. User Account Management (Manager Only)

### `GET /api/users`
Lists all accounts (active and inactive) for the Accounts screen.

- **Auth**: Manager token
- **Response 200**:
  ```json
  [
    {
      "id": 1,
      "name": "Manager",
      "role": "manager",
      "country": "IN",
      "is_active": true
    },
    {
      "id": 3,
      "name": "Ramesh",
      "role": "salesperson",
      "country": "IN",
      "is_active": true
    },
    {
      "id": 4,
      "name": "Sunita",
      "role": "salesperson",
      "country": "IN",
      "is_active": false
    }
  ]
  ```

### `POST /api/users`
Creates a new salesperson account.

- **Auth**: Manager token
- **Request Body**:
  ```json
  {
    "name": "Sunita",
    "password": "Password123",
    "role": "salesperson",
    "country": "IN"
  }
  ```
- **Response 201**:
  ```json
  { "status": true }
  ```
- **Error Responses**:
  - `400 Bad Request` (duplicate name): `{"message": "That name is already taken."}`
  - `400 Bad Request` (weak password): `{"message": "Password needs 8+ characters with an uppercase and a lowercase letter."}`
  - `400 Bad Request` (invalid country): `{"message": "Country must be one of: IN, AE, US."}`

### `POST /api/users/<id>/update`
Updates a user's name, password, or dialing country code.

- **Auth**: Manager token
- **Request Body** (at least one field):
  ```json
  {
    "name": "Sunita Sharma",
    "password": "NewPassword123",
    "country": "IN"
  }
  ```
- **Response 200**:
  ```json
  { "status": true }
  ```
- **Rules**:
  - Changing the password invalidates the user's active session by generating a new session token.
  - Allowed on the manager's own account.

### `POST /api/users/<id>/deactivate`
Deactivates a salesperson account, preventing login and active API use while preserving historical calls.

- **Auth**: Manager token
- **Response 200**:
  ```json
  { "status": true }
  ```
- **Rules**:
  - Refused if `<id>` is the manager's own account (`400 Bad Request`: `{"message": "You cannot do this to your own account."}`).

### `POST /api/users/<id>/activate`
Reactivates a deactivated salesperson account.

- **Auth**: Manager token
- **Response 200**:
  ```json
  { "status": true }
  ```

### `DELETE /api/users/<id>`
Permanently deletes a user and cascades to delete all their call records.

- **Auth**: Manager token
- **Response 200**:
  ```json
  { "status": true }
  ```
- **Rules**:
  - Deletes user row and cascades to delete all associated rows in `calls`. Past team totals shrink accordingly.
  - Releases any active lead claims held by the user back to the pool.
  - Refused if `<id>` is the manager's own account (`400 Bad Request`: `{"message": "You cannot do this to your own account."}`).

---

## 5. Leads

### `POST /api/leads/upload`
Uploads a single-column CSV of phone numbers into the lead pool.

- **Auth**: Manager token
- **Content-Type**: `multipart/form-data`
  - `file`: CSV file (max 2 MB / `MAX_LEAD_UPLOAD_MB`)
  - `country`: Country ISO code (`IN`, `AE`, `US`)
- **Processing Logic**:
  - Normalizes numbers to E.164 using Python `phonenumbers`.
  - Skips duplicates within the file, unparseable lines, and numbers already present in `leads`.
- **Response 200**:
  ```json
  {
    "status": true,
    "added": 120,
    "duplicates": 15,
    "invalid": 5
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{"message": "File is too large."}` / `{"message": "Please select a valid CSV file."}`

### `GET /api/leads/summary`
Returns pool bucket counts with the waiting split, plus daily upload and tackle counts.

- **Auth**: Manager token
- **Response 200**:
  ```json
  {
    "status": true,
    "pool": {
      "waiting": 277,
      "waiting_by_attempts": { "0": 138, "1": 94, "2": 45 },
      "scheduled": 25,
      "connected": 80,
      "stopped": 15
    },
    "uploaded": { "today": 450, "yesterday": 380 },
    "tackled": { "today": 312, "yesterday": 285 }
  }
  ```
- **Rules**:
  - `waiting` equals the sum of `waiting_by_attempts`.
  - `waiting_by_attempts` splits the waiting pool by `attempt_count` (0, 1, or 2 calls so far).
  - `uploaded` counts leads whose `created_at` falls in today's / yesterday's IST window.
  - `tackled` counts distinct leads with at least one synced call in today's / yesterday's IST window.

### `POST /api/leads/next`
Retrieves and claims the next lead for automated calling, with an optional lead scheduling parameter in the same request.

- **Auth**: Salesperson token
- **Request Body** (optional):
  - Next lead only:
    ```json
    {}
    ```
  - Schedule current lead and fetch next:
    ```json
    {
      "schedule": {
        "lead_id": 42,
        "scheduled_at": "2026-10-15T09:00:00Z"
      }
    }
    ```
- **Processing Logic**:
  1. If `schedule` is supplied:
     - Verifies `lead_id` is neither `done` nor `stopped`.
     - Validates `scheduled_at` is in the future and within 30 days (`MAX_SCHEDULE_AHEAD_DAYS`).
     - Sets `scheduled_by = user_id`, `scheduled_at = scheduled_at`, and releases active claim.
  2. Prioritizes serving:
     - Current unexpired claim for this user (if one already exists).
     - Due scheduled leads reserved for this user (`scheduled_by == user_id`, `scheduled_at <= now()`).
     - Newest available pool lead (`created_at DESC`, `status == 'waiting'`, retry lock expired, unreserved).
  3. Claims the served lead for 10 minutes (`CLAIM_MINUTES`): `claimed_by = user_id`, `claimed_until = now() + 10 minutes`.
- **Response 200** (lead available):
  ```json
  {
    "status": true,
    "lead": {
      "id": 43,
      "phone_number": "+919876543210",
      "attempt_count": 0,
      "is_scheduled": false
    }
  }
  ```
- **Response 200** (pool empty or no lead available):
  ```json
  {
    "status": true,
    "lead": null
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{"message": "Scheduled time must be in the future within 30 days."}`

---

## 6. Office Hours Settings (Manager Only)

### `GET /api/settings/office-hours`
Returns the office hours window applied to call sync and the calls-by-hour chart.

- **Auth**: Manager token
- **Response 200**:
  ```json
  { "start_time": "10:00", "end_time": "19:00" }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"message": "Invalid or expired token."}`
  - `403 Forbidden`: `{"message": "This setting is for managers."}`

### `PUT /api/settings/office-hours`
Updates the office hours window.

- **Auth**: Manager token
- **Request Body**:
  ```json
  { "start_time": "10:00", "end_time": "19:00" }
  ```
- **Processing Logic**:
  - Times are IST in `HH:MM` format with minute precision; the server stores them as minutes since midnight.
  - The window applies to every day of the week.
- **Response 200**:
  ```json
  { "status": true }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{"message": "Invalid request format: start_time and end_time required."}`
  - `400 Bad Request`: `{"message": "End time must be after start time."}`
  - `401 Unauthorized`: `{"message": "Invalid or expired token."}`
  - `403 Forbidden`: `{"message": "This setting is for managers."}`
