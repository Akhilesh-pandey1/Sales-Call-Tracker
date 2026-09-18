# Sales Call Tracker — Build Design

One file for the team that builds this: the database, every API, every screen. The rules and the "why" live in `decisions.md`; this file holds only the structure — no rule written twice.

## 1. The system in one look

Three parts, one repository (Decision 10):

```
sales-call-tracker/
  app/    React Native — salesperson dialer + own KPIs (Android, sideloaded APK)
  api/    Python Flask   — all business logic, served on Render
  web/    React          — manager dashboard, served by the same API
```

The app on the phone is named **Apex Sales Call** (Decision 72); the web dashboard is manager-only (Decision 69).

Database: Neon Postgres (Singapore). Exactly two tables. The phone keeps no permanent database — only a temporary local SQLite queue whose rows are deleted once the server accepts them (Decisions 6, 11, 29).

## 2. Database structure

### users


| column        | type                 | notes                                                                                                  |
| ------------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| id            | integer, primary key |                                                                                                        |
| name          | text, unique         | the login ID (Decision 30)                                                                             |
| password_hash | text                 | never the raw password                                                                                 |
| role          | text                 | `manager` or `salesperson`. One manager in v1 (Decision 4)                                             |
| is_active     | boolean              | false = can't log in (Decision 22)                                                                     |
| created_at    | timestamp, UTC       |                                                                                                        |
| auth_token    | text                 | fresh random value written on every login (Decision 31)                                                |
| country       | text                 | ISO code (`IN`, `AE`, `US`) — the app's default for normalizing local-style numbers (Decisions 34, 36) |


### calls


| column           | type               | notes                                                                                         |
| ---------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| call_id          | text, UNIQUE index | UUID the phone creates the moment dialing starts — the idempotency key (Decisions 10, 24, 29) |
| user_id          | integer            | who made the call                                                                             |
| phone_number     | text               | E.164, normalized by the app before saving (Decision 34)                                      |
| dialed_at        | timestamp, UTC     | the real time, taken from the Android call log after the call ends (Decision 6)               |
| duration_seconds | integer            | from the call log; 0 = not connected (Decision 17)                                            |


### Rules that live in the database

- All times stored in UTC (Decision 24).
- Index on (user_id, dialed_at) — every dashboard query filters on exactly that pair.
- Both tables are defined as Flask-SQLAlchemy models in `api/database/` (Decision 90).

### pending_calls — on the phone only (SQLite)

The server never sees this table; a row is deleted once sync answers 200 (Decisions 11, 53).

| column           | type      | notes                                                                  |
| ---------------- | --------- | ---------------------------------------------------------------------- |
| call_id          | text      | created the moment Call is tapped                                      |
| phone_number     | text      | E.164, normalized at dial time (Decision 34)                           |
| intent_at        | timestamp | phone clock, the moment Call was tapped                                |
| dialed_at        | timestamp | EMPTY until a path fills it from the Android call log (Decisions 6, 50)|
| duration_seconds | integer   | EMPTY until filled; 0 = not connected (Decision 17)                    |
| attempts         | integer   | strike counter — the janitor's only; at 5 it FILLS the row instead of deleting (Decisions 11, 50, 59) |

Empty duration = still waiting; filled = ready to send — no status column. Rows are filled by the two paths of Decision 50. At 5 strikes the janitor fills the row itself — dialed_at = intent_at, duration 0 (Decision 59) — so even an orphan dial rides sync. Sync sends filled rows only; empty rows wait for the janitor and ride the next sync (Decision 57). The app's Clear local data button wipes the queue on request (Decision 56).

App open = the app comes to the foreground (icon tap or return after a call — the same event). The open sequence is always janitor first, then one batch sync; sync also fires right after a row is filled (Decision 55).

## 3. API — Flask

Every endpoint except login requires the auth token with the request; the server checks the token and that the account is active before doing anything (Decision 31). A bad or dead token → 401 → the screen shows the login page.

### POST /api/login

For: signing in — the app and the web both use this one endpoint.

Request:

```json
{ "name": "Ramesh", "password": "start123" }
```

Response 200:

```json
{ "token": "...", "id": 3, "role": "manager", "name": "Ramesh", "country": "IN" }
```

Wrong name or password → error: "Wrong name or password."
Correct credentials on a deactivated account → error: "Your account is not active. Please contact your manager." (Decision 43)
The app saves its `id` and uses it for My Stats — `GET /api/dashboard/person/<id>` (Decision 39).

### POST /api/calls/sync

For: the one batch sync from the app — every filled row in a single request (Decisions 29, 57). Salesperson token.

Request:

```json
{ "calls": [
    { "call_id": "uuid-1", "phone_number": "+919876543210", "dialed_at": "2026-09-17T05:14:00Z", "duration_seconds": 132 },
    { "call_id": "uuid-2", "phone_number": "+919812345678", "dialed_at": "2026-09-17T07:40:00Z", "duration_seconds": 0 }
] }
```

Behavior: the app sends filled rows only — an empty row has no `dialed_at` to store and waits for the janitor and the next sync (Decision 57). Each row is checked on its own — insert it, silently skip any call_id that already exists (a duplicate is never an error), and discard a broken row with a log line while the rest still save. A row older than `MAX_CALL_AGE_DAYS` (3 days — config.py, Decision 86) is discarded the same way: a phone offline longer than that loses the older calls, accepted. Any active token may call sync — every row is saved under the token owner's id, no manager special case (Decision 89). Response 200: `{ "ok": true }` → the app clears the rows it sent (Decision 35).

### GET /api/dashboard/team

For: the manager's home screen (Decision 15). Manager only.

Response 200:

```json
{
  "today":     { "dials": 120, "connected": 64, "seconds": 18600 },
  "yesterday": { "dials": 145, "connected": 70, "seconds": 21300 },
  "people": [
    { "id": 3, "name": "Ramesh",
      "today":     { "dials": 12, "connected": 7, "seconds": 2280 },
      "yesterday": { "dials": 15, "connected": 9, "seconds": 2460 } }
  ]
}
```

- `people` contains active salespeople only (Decision 22).
- Totals count every call made — deactivated people's past calls keep counting, so today's number never drops when someone is deactivated (Decision 58).
- Sorted by today's dials, highest first (Decision 33).

### GET /api/dashboard/person/<id>

For: one person's screen (Decision 16). Manager may open anyone; a salesperson may open only their own id — the app's My Stats tab uses this same endpoint (Decision 8).

Response 200:

```json
{
  "name": "Ramesh",
  "today":        { "dials": 12,  "connected": 7,   "seconds": 2280,  "connected_percent": 58 },
  "yesterday":    { "dials": 15,  "connected": 9,   "seconds": 2460,  "connected_percent": 60 },
  "last_30_days": { "dials": 410, "connected": 205, "seconds": 61200, "connected_percent": 50 },
  "top_numbers": [
    { "phone_number": "+919876543210", "seconds": 4320, "calls": 14 }
  ]
}
```

- `connected_percent` lives inside each period (today, yesterday, last_30_days) — connected ÷ dials for that period (Decisions 33, 67). With 0 dials in a period it comes back empty, and that period shows "—" (Decision 42).
- `top_numbers`: the 5 numbers with the most talk time in the last 30 days, sorted by seconds, each with its call count (Decision 33).

### Account management — manager only


| endpoint                          | what it does                                                                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/users`                  | the Accounts screen list — every account with id, name, role, country, is_active; deactivated included (Decision 38)                                             |
| `POST /api/users`                 | create account (name, password, role, country). Existing name → error: "That name is already taken." (Decisions 30, 34)                                          |
| `POST /api/users/<id>/deactivate` | the safe pause — can't log in, hidden from totals, history kept (Decision 22)                                                                                    |
| `POST /api/users/<id>/activate`   | bring them back                                                                                                                                                  |
| `DELETE /api/users/<id>`          | permanent — removes the person and ALL their call rows; totals shrink, no undo (Decision 28)                                                                     |
| `POST /api/users/<id>/update`     | edit any of name / password / country. Password kills the person's old token (Decision 31); existing name → "That name is already taken." (Decisions 19, 34, 36) |


"Software sold" has no endpoint — a fixed `--` placeholder on the web screen only (Decision 18).

## 4. Screens — exact contents

Display rule everywhere: the API returns seconds; screens show minutes (seconds ÷ 60, rounded) (Decision 32).

### Screen 1 — Team Dashboard (web, manager) — home after login

```
[ Team ]                                              Software sold: --

  Today:      120 dials | 64 connected | 310 min
  Yesterday:  145 dials | 70 connected | 355 min

  | Name   | Today dials | Today connected | Today min | Yest. dials | Yest. connected | Yest. min |
  | Ramesh |     12      |        7        |    38     |     15      |        9        |    41     |
  | Sunita |     10      |        6        |    33     |     11      |        5        |    28     |
```

- Totals ← `today` / `yesterday`; one row per entry in `people`; tapping a row opens the Person screen with that `id`. Totals include everyone's calls, including deactivated people's past calls — the top number can be larger than the sum of the visible rows (Decision 58).
- "Software sold: --" is fixed text (Decision 18). Deactivated people never appear here (Decision 22).

### Screen 2 — Person View (web, manager)

```
[ Ramesh ]

             Dials | Connected | Minutes | Connected %
  Today:      12   |     7     |   38    |    58%
  Yesterday:  15   |     9     |   41    |    60%
  Last 30 d:  410  |    205    |  1020   |    50%

  Top 5 numbers (last 30 days):
  | Number            | Minutes | Calls |
  | +91 98765 43210   |   72    |  14   |
```

- Numbers ← `today` / `yesterday` / `last_30_days`; each row's Connected % ← that period's `connected_percent` (Decision 67); table ← `top_numbers`. A period's Connected % shows "—" when the API returns no number for it (Decision 42).
- No graphs (Decision 16). Red flags — one number with huge minutes, the same number daily — are read by eye from the table.

### Screen 3 — Accounts (web, manager)

- List ← `GET /api/users`: ALL accounts, including deactivated — greyed out, with an Activate button (otherwise they could never be found again) (Decision 38).
- Tapping an account row — active or deactivated — opens that person's view, so a deactivated person's call history stays reachable (Decision 58).
- "Add person" form: name + starting password (Decision 19) + country dropdown (Decision 34).
- Per-row actions: Deactivate / Activate · Delete · Edit (name, password, country) (Decision 36).
- Delete dialog: "This permanently removes NAME and all their calls. Cannot be undone." (Decision 28)

### Screen 4 — Login (app and web share the design)

Name field, password field, Login button. Wrong credentials → "Wrong name or password."

The web is manager-only (Decision 69): the URL is never shared with salespeople. If a salesperson logs in anyway, the web shows one message — "This dashboard is for managers." — and no data.

### Screen 5 — Dialer (app, home tab)

- The number being typed, keypad 0–9 / * / #, backspace, one **Paste** button that fills the number from anything copied (Decision 25); pasting with an empty clipboard shows a "Nothing copied." toast and leaves the typing untouched (Decision 88).
- The green Call button is grey until the number is valid for the person's country — libphonenumber-js decides; India = exactly 10 digits or a full +91 number. Pasted numbers pass the same check (Decision 87).
- First launch asks for the THREE permissions — CALL_PHONE (place the call), READ_CALL_LOG (read the log to match), READ_PHONE_STATE (real-time call-end listener) (Decision 40). If any one is off: red banner at the top — "Calls are not being logged" — with a **Fix** button that opens Android's settings page for our app, where all three get switched on (Decisions 13, 40). react-native-permissions does the checks, the ask, and the Fix button (Decision 41). With CALL_PHONE off, the Call button opens the Android dialer pre-filled — the call happens, nothing is recorded, no intent row is written (Decision 52).
- After the call ends: the listener fills the row in seconds and sync sends it; anything it misses, the janitor completes on a later open (Decisions 11, 50). Nothing to tap.

### Screen 6 — My Stats (app, second tab)

- Same layout and numbers as the web Person View. Every tab open calls `GET /api/dashboard/person/<id>` with the salesperson's own id and shows the answer — no local copy (Decisions 39, 54).
- Two tabs at the bottom — Dialer | My Stats. A small gear icon in the My Stats header opens a one-item settings screen: **Clear local data**, which wipes the `pending_calls` queue after asking "This deletes N calls not yet sent to the server. Cannot be undone." (Decision 56). That is the whole app.

## 5. Setup

- First manager account: no endpoint and no setup screen makes it. One INSERT in the Neon console creates the manager; a one-line Python command in the README prints the password hash (Decisions 4, 19). A forgotten manager password uses the same path — paste a fresh hash with an UPDATE and clear the old token (Decision 31).
- APK updates: re-sideload the new APK by hand. No auto-update in v1 (Decision 9).
- The tracking spike is built to become `app/` itself — the proven code ships (Decision 75). The oldest team phone in hand is arranged by hand before the spike starts.

## 6. File structure — every file we build

The full tree, agreed and final (Decision 83, updated by Decision 90). Flask-SQLAlchemy defines the tables — models live only in `database/`; every other layer stays functions-only.

### api/ — Flask, strict MVC

```
api/
  requirements.txt            flask, flask-sqlalchemy, gunicorn, psycopg2-binary (driver), pytest
  config.py                   named constants (Decision 85) + SQLALCHEMY_DATABASE_URI
  wsgi.py                     the entry point Render runs
  database/                   models — SQLAlchemy tables + queries (Decision 90)
    user_model.py               User model: login lookup, create, update, token
    call_model.py               Call model: insert-skip, dashboard aggregates
  logics/                     controllers — all business logic
    auth_logic.py               login, token check, lockout, password rule
    sync_logic.py               per-row checks: duplicate, broken, older than 3 days
    dashboard_logic.py          IST day windows, team + person totals, top numbers
    user_logic.py               create / update / activate / deactivate / delete + self-guards
  routes/                     views — requests in, responses out, no logic
    auth_routes.py              POST /api/login
    sync_routes.py              POST /api/calls/sync
    dashboard_routes.py         GET /api/dashboard/team · GET /api/dashboard/person/<id>
    user_routes.py              the 6 account endpoints
  utils/                      helpers
    exception_handler.py        AppException + the handler decorator
    database.py                 the SQLAlchemy db instance + init (Decision 90)
  tests/
    test_login.py               login + lockout (Decision 49)
    test_sync.py                duplicates, broken rows, 3-day cutoff (Decisions 29, 35, 86)
    test_dashboard_periods.py   IST boundaries over UTC (Decisions 24, 32)
    test_totals.py              totals across deactivate/delete (Decisions 22, 58)
```

### web/ — React, manager dashboard

```
web/
  package.json                react, react-dom, react-router-dom (Vite scaffold)
  vite.config.js              dev-only proxy: /api → localhost Flask
  index.html
  src/
    pages/
      LoginPage.jsx             route /           — role gate (Decision 69)
      TeamPage.jsx              route /team       — home after login (Screen 1)
      PersonPage.jsx            route /person/:id (Screen 2)
      AccountsPage.jsx          route /accounts   (Screen 3)
    hooks/
      useAuth.js                login, token in localStorage, 401 → login page
      useTeamDashboard.js       team data
      usePersonStats.js         one person's numbers
      useAccounts.js            list, create, edit, deactivate, activate, delete
    services/
      authService.js            POST /api/login
      dashboardService.js       team + person GETs
      userService.js            the 6 account calls
    components/
      Navbar.jsx                top bar + Logout on the 3 manager pages (Decision 84)
```

The manager never configures an API address: Flask serves the built `web/dist` through one catch-all route — same server, same origin (Decision 83).

### app/ — React Native, bare CLI, plain JavaScript

```
app/
  package.json                navigation (bottom tabs), async-storage, clipboard,
                              sqlite-storage, libphonenumber-js,
                              react-native-permissions, react-native-call-log,
                              react-native-call-detection-android (Decisions 14, 40, 41)
  index.js · App.js           auth gate → Login or the 2 tabs
  android/                    from RN init — the manifest carries the 3 permissions (Decision 40)
  src/
    pages/
      LoginPage.jsx
      DialerPage.jsx            keypad, Paste, Call button, red banner (Screen 5)
      MyStatsPage.jsx           Screen 6 + the gear icon
      SettingsPage.jsx          Clear local data (Decision 56)
    hooks/
      useAuth.js                saves token + own id + country (Decision 39)
      usePermissions.js         the 3 permissions, banner state, Fix button
      useDialer.js              number state, paste, one-tap-one-row lock (Decision 73)
      useCallTracking.js        call-end listener, call-log match, 3s/10s/30s retries (Decision 50)
      usePendingCalls.js        all SQLite queue reads/writes (Decision 53)
      useJanitor.js             1-hour completion + 5-strike fill (Decisions 50, 59)
      useSync.js                open sequence: janitor → one batch, plus after-fill sync (Decision 55)
      useMyStats.js             fetch on every tab open (Decision 54)
    services/
      apiClient.js              SERVER_BASE_URL constant + token header + 401 → login
      authService.js            POST /api/login
      statsService.js           GET /api/dashboard/person/<own-id>
      syncService.js            the one batch POST
    components/
      Keypad.jsx                the 12-key grid (Decision 84)
```

The app's server address is one constant — `SERVER_BASE_URL` in apiClient.js; changing servers is a one-line edit and a rebuild.

Build on Render (Decision 79): build the web, then start gunicorn on `wsgi.py` — one push to main deploys both.

