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
Returns team call aggregates for today, yesterday, and the last 30 days, plus dials per hour, top people by talk time, and individual stats for all active salespeople.

- **Auth**: Manager token only
- **Response 200**:
  ```json
  {
    "today": {
      "dials": 120,
      "connected": 64,
      "seconds": 18600
    },
    "yesterday": {
      "dials": 145,
      "connected": 70,
      "seconds": 21300
    },
    "last_30_days": {
      "dials": 3400,
      "connected": 1500,
      "seconds": 530000
    },
    "calls_by_hour": {
      "today": [0, 0, 0, 0, 0, 0, 0, 0, 5, 17, 32, 38, 11, 21, 33, 24, 12, 8, 4, 2, 1, 0, 0, 0],
      "yesterday": [0, 0, 0, 0, 0, 0, 0, 0, 3, 12, 25, 30, 9, 18, 28, 20, 10, 6, 3, 1, 1, 0, 0, 0],
      "last_30_days": [0, 0, 0, 0, 0, 0, 0, 0, 140, 510, 960, 1140, 330, 630, 990, 720, 360, 240, 120, 60, 30, 0, 0, 0]
    },
    "top_people": {
      "today": [
        { "id": 3, "name": "Ramesh", "seconds": 2280 },
        { "id": 5, "name": "Priya", "seconds": 1740 }
      ],
      "yesterday": [
        { "id": 5, "name": "Priya", "seconds": 2460 }
      ],
      "last_30_days": [
        { "id": 5, "name": "Priya", "seconds": 53000 }
      ]
    },
    "people": [
      {
        "id": 3,
        "name": "Ramesh",
        "today": { "dials": 12, "connected": 7, "seconds": 2280 },
        "yesterday": { "dials": 15, "connected": 9, "seconds": 2460 }
      }
    ]
  }
  ```
- **Rules**:
  - `today`, `yesterday`, and `last_30_days` totals count every call recorded in those IST windows, including calls made by currently deactivated salespeople.
  - `calls_by_hour` holds 24 dial counts per IST hour for each period; the `last_30_days` block holds 30-day totals per hour — screens divide by 30 for the daily average.
  - `top_people` holds at most 5 active salespeople by talk seconds in the period, highest first.
  - `people` lists all active salespeople (including those with 0 calls), sorted by `today.dials` descending.
- **Error Responses**:
  - `401 Unauthorized`: `{"message": "Invalid or expired token."}`
  - `403 Forbidden`: `{"message": "This dashboard is for managers."}`

### `GET /api/dashboard/person/<id>`
Returns call performance stats and top 5 numbers for a specific user across today, yesterday, and the last 30 days.

- **Auth**: Manager token (can view any user) OR Salesperson token (where `token.user_id == id`).
- **Response 200**:
  ```json
  {
    "name": "Ramesh",
    "today": {
      "dials": 12,
      "connected": 7,
      "seconds": 2280,
      "connected_percent": 58
    },
    "yesterday": {
      "dials": 15,
      "connected": 9,
      "seconds": 2460,
      "connected_percent": 60
    },
    "last_30_days": {
      "dials": 410,
      "connected": 205,
      "seconds": 61200,
      "connected_percent": 50,
      "active_days": 26
    },
    "top_numbers": [
      {
        "phone_number": "+919876543210",
        "seconds": 4320,
        "calls": 14
      }
    ]
  }
  ```
- **Rules**:
  - `connected_percent` is `null` if dials equal 0 in that period.
  - `active_days` counts the days with at least one dial inside the last 30 IST days; screens divide the period totals by it for per-active-day averages.
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
Returns pool bucket counts with the waiting split, daily upload and tackle counts, and today's calling activity per salesperson.

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
    "tackled": { "today": 312, "yesterday": 285 },
    "people": [
      {
        "id": 3,
        "name": "Ramesh",
        "attempted": 30,
        "connected": 18,
        "not_connected": 12
      }
    ]
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
