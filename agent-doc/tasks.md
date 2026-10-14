# Tasks: Sales Call Tracker v1

---

## 1. Project Setup

- [ ] 1.1 Create the GitHub repo (private), initialise with a root `.gitignore` covering Python, Node, and Android, connect it to Render for auto-deploy on push to `main` (Render connection deferred to future by user)
- [x] 1.2 Create the three top-level folders: `backend/`, `web/`, `app/` as described in `structure.md`
- [ ] 1.3 Create and store the Android release signing keystore (`app/android/`) — one-time manual step; record the alias and store the `.jks` safely (never commit it) (user will do in future)

---

## 2. Backend — Foundation

> Spec refs: `specs/authentication.md`, `specs/user-management.md`, `design.md §2-3`

- [x] 2.1 Initialise the Flask app factory (`backend/app/__init__.py`), register blueprints, configure Flask-SQLAlchemy, and wire `db.create_all()` on startup
- [x] 2.2 Add `backend/app/config/base.py` with all named constants: `MAX_CALL_AGE_DAYS=3`, `MAX_LEAD_ATTEMPTS=3`, `RETRY_LOCK_HOURS=2`, `CLAIM_MINUTES=10`, `MAX_SCHEDULE_AHEAD_DAYS=30`, `MAX_LEAD_UPLOAD_MB=2`, lockout (10 tries / 5 min), password rule (8+ chars, upper + lower), country shortlist, IST timezone name
- [x] 2.3 Create `User` SQLAlchemy model (`backend/app/modules/users/models.py`) with all columns from `database.md`; add `backend/app/core/security.py` (password hashing and random token generation)
- [x] 2.4 Add `flask seed` CLI command that creates the initial manager account (name + password from env vars)
- [x] 2.5 Add `backend/app/core/errors.py` with `AppException` and a global error handler that returns `{"message": "..."}` JSON on all expected errors

---

## 3. Backend — Authentication

> Spec refs: `specs/authentication.md` — all scenarios

- [x] 3.1 Implement `POST /api/login`: validate body, verify password hash, check `is_active`, generate and store new token, return token + id + role + name + country (scenarios: Successful login, Deactivated account, Wrong password, Missing fields)
- [x] 3.2 Implement in-memory lockout: after 10 consecutive wrong-password attempts for a name, return 429 for 5 minutes; reset counter on success (scenarios: Lockout triggered, Lockout expires, Counter reset on success)
- [x] 3.3 Implement `require_auth` decorator that reads `Authorization: Bearer <token>`, looks up the user, checks `is_active`, and attaches `g.user` — attach to all protected routes (scenarios: Valid token, Invalid/missing token, Deactivated user with valid token)
- [x] 3.4 Write `tests/modules/test_auth.py` covering all scenarios in `specs/authentication.md`


---

## 4. Backend — User Management

> Spec refs: `specs/user-management.md` — all scenarios

- [x] 4.1 Implement `GET /api/users` (manager only): return all accounts (active + inactive) with id, name, role, country, is_active; no call counts (scenarios: All accounts returned, Non-manager access refused)
- [x] 4.2 Implement `POST /api/users`: validate name uniqueness, password strength, country code; create account (scenarios: Successful creation, Duplicate name, Weak password, Invalid country)
- [x] 4.3 Implement `POST /api/users/<id>/update`: accept name, password, country (any subset); enforce name uniqueness; on password change, regenerate token (scenarios: Name updated, Password changed invalidates token, Manager edits own account)
- [x] 4.4 Implement `POST /api/users/<id>/deactivate`: set `is_active = false`, clear token; guard against self-deactivation (scenarios: Deactivated account cannot log in, Self-deactivation refused)
- [x] 4.5 Implement `POST /api/users/<id>/activate`: set `is_active = true` (scenarios: Reactivated account can log in)
- [x] 4.6 Implement `DELETE /api/users/<id>`: cascade delete user + calls; release any lead claims; guard against self-deletion (scenarios: Delete removes user and all calls, Self-deletion refused, Delete releases lead claims)
- [x] 4.7 Write `tests/modules/test_users.py` covering all scenarios in `specs/user-management.md`


---

## 5. Backend — Call Sync

> Spec refs: `specs/call-tracking.md §Server-side call ingestion`, `design.md §6`

- [ ] 5.1 Create `Call` SQLAlchemy model (`backend/app/modules/calls/models.py`) from `database.md`; add indexes on `(user_id, dialed_at)`
- [ ] 5.2 Implement `POST /api/calls/sync`: accept `{"calls": [...]}`, iterate rows, skip calls older than `MAX_CALL_AGE_DAYS`, skip duplicate `call_id` (unique index), save valid rows under `g.user.id`, log and skip malformed rows, return `{"status": true}` (scenarios: Valid batch saved, Old call dropped, Malformed row in batch, Server deduplicates retried rows)
- [ ] 5.3 Add lead resolution logic inside the sync handler: for each saved call, look up matching lead by normalized phone number; connected → `status='done'`; unconnected → increment attempt + retry lock; at cap → `status='stopped'`; clear claims and schedules on any resolution (scenarios from `specs/lead-management.md §Lead resolution via call sync`)
- [ ] 5.4 Add `backend/app/core/utils.py` with IST timezone helper and E.164 normalization using `phonenumbers`
- [ ] 5.5 Write `tests/modules/test_calls.py` covering all scenarios in `specs/call-tracking.md §Server-side call ingestion`

---

## 6. Backend — Dashboards

> Spec refs: `specs/dashboard.md` — all scenarios

- [ ] 6.1 Implement `GET /api/dashboard/team` (manager only): compute today/yesterday IST boundaries in UTC, aggregate dials/connected/seconds for the full team, return per-active-salesperson rows with zeros included, sorted by today's dials desc (all scenarios in `specs/dashboard.md §Team dashboard`)
- [ ] 6.2 Implement `GET /api/dashboard/person/<id>`: compute three periods (today, yesterday, last 30 days) in IST, return dials/connected/seconds/connected_percent for each; null percent when dials = 0; top 5 numbers by talk seconds; enforce owner-only access for salesperson tokens (all scenarios in `specs/dashboard.md §Per-person stats` and `§Top 5 numbers`)
- [ ] 6.3 Write `tests/modules/test_dashboard.py` covering all scenarios in `specs/dashboard.md`

---

## 7. Backend — Lead Management

> Spec refs: `specs/lead-management.md` — all scenarios

- [ ] 7.1 Create `Lead` SQLAlchemy model (`backend/app/modules/leads/models.py`) from `database.md` with all status, attempt, lock, claim, and schedule columns
- [ ] 7.2 Implement `POST /api/leads/upload` (manager only): parse multipart CSV, enforce 2 MB limit, normalise numbers to E.164 with `phonenumbers` for chosen country, skip duplicates (within file and existing pool), insert new rows, return `{"status": true, "added": N, "duplicates": N, "invalid": N}` (all scenarios in `specs/lead-management.md §CSV upload`)
- [ ] 7.3 Implement `GET /api/leads/summary` (manager only): return pool bucket counts (waiting, scheduled, done, stopped) and today's per-active-salesperson attempted/connected/not-connected counts (scenarios: Pool bucket counts returned, Per-person activity returned)
- [ ] 7.4 Implement `POST /api/leads/next` (salesperson): handle optional `schedule` body field — validate and save schedule first; then apply priority order (unexpired claim → due schedule → newest waiting); claim the served lead for `CLAIM_MINUTES`; return lead or null (all scenarios in `specs/lead-management.md §Next-lead serving`, `§Claim window`, `§Scheduling`)
- [ ] 7.5 Write `tests/modules/test_leads.py` covering all scenarios in `specs/lead-management.md`

---

## 8. Backend — Production Wiring

- [ ] 8.1 Add `wsgi.py` (Gunicorn entry point), `requirements.txt` (flask, flask-sqlalchemy, gunicorn, psycopg2-binary, phonenumbers, pytest), and the Render `start` command (`gunicorn wsgi:app`)
- [ ] 8.2 Configure Flask to serve `web/dist` static assets from the catch-all route so the web dashboard shares the same origin as the API
- [ ] 8.3 Set `DATABASE_URL` and `SECRET_KEY` environment variables on Render; verify `db.create_all()` runs cleanly against Neon on first deploy

---

## 9. Web Dashboard — Foundation

> Spec refs: `design.md §10`, `structure.md §web`

- [ ] 9.1 Scaffold `web/` with Vite + React + TypeScript; install Tailwind CSS, shadcn/ui (Button, Dialog, Input, Table, Badge), TanStack Query, React Router, Lucide React, Axios
- [ ] 9.2 Create `src/shared/api/api-client.ts`: Axios instance with `Authorization: Bearer <token>` interceptor and 401 → clear localStorage → redirect to login
- [ ] 9.3 Create `src/app/router.tsx` with a manager auth guard; create `src/app/layouts/dashboard-layout.tsx` with the sidebar (Dashboard, Leads, Accounts) and top bar; add `src/shared/components/navbar.tsx` with Logout (clear localStorage, show login page — no API call)
- [ ] 9.4 Create `src/app/providers.tsx` wrapping the app in TanStack Query provider and Auth context (token in localStorage)

---

## 10. Web Dashboard — Auth Page

> Spec refs: `specs/authentication.md`, `screen.md §Screen 1`

- [ ] 10.1 Build `src/features/auth/pages/login-page.tsx`: name + password fields, Login button; call `POST /api/login`; store token + role in localStorage; route by role (manager → team page, salesperson → "This dashboard is for managers." message, no data)
- [ ] 10.2 Handle all login error states: wrong credentials (401), deactivated (403), lockout (429), missing fields (400) — per `specs/authentication.md`

---

## 11. Web Dashboard — Team Dashboard

> Spec refs: `specs/dashboard.md`, `screen.md §Screen 2`

- [ ] 11.1 Create `src/features/dashboard/api/dashboard.api.ts` with `getTeamDashboard()` and `getPersonStats(id)` API calls
- [ ] 11.2 Build `src/features/dashboard/pages/team-page.tsx`: KPI totals (today/yesterday), team table component (`team-table.tsx`) with all active salespeople, zeros included, sorted by today's dials; tap row → navigate to person page; "Could not load data." + Retry on error
- [ ] 11.3 Build `src/features/dashboard/pages/person-page.tsx`: person name heading, three-period stats block (today/yesterday/30d: dials/connected/minutes/connected%), top numbers table (`top-numbers-table.tsx`); "—" for null connected_percent; "Could not load data." + Retry on error (Screen 3)
- [ ] 11.4 Person page is reachable from both the team table and the Accounts list (deactivated people included)

---

## 12. Web Dashboard — Leads Page

> Spec refs: `specs/lead-management.md`, `screen.md §Screen 4`

- [ ] 12.1 Create `src/features/leads/api/leads.api.ts` with `getLeadsSummary()` and `uploadLeads(file, country)` calls
- [ ] 12.2 Build `src/features/leads/pages/leads-page.tsx`: Upload Leads button → modal (`lead-upload-card.tsx`) with CSV file picker + country dropdown; Sonner toast on success; 2 MB and format validation with inline error message
- [ ] 12.3 Build pool stats display (`lead-pool-stats.tsx`): Waiting/Scheduled/Connected/Stopped bucket counts; per-person today table (`lead-agent-table.tsx`) with attempted/connected/not-connected; "Could not load data." + Retry on error

---

## 13. Web Dashboard — Accounts Page

> Spec refs: `specs/user-management.md`, `screen.md §Screen 5`

- [ ] 13.1 Create `src/features/accounts/api/accounts.api.ts` with list, create, update, deactivate, activate, and delete calls
- [ ] 13.2 Build `src/features/accounts/pages/accounts-page.tsx`: account list with greyed-out deactivated rows; Add person button (opens `add-user-modal.tsx` with name/password/country); per-row Edit (`edit-user-modal.tsx`) / Deactivate|Activate / Delete (`delete-dialog.tsx` with "Cannot be undone" confirmation)
- [ ] 13.3 Hide all actions on the manager's own row; handle all error messages from `specs/user-management.md` inline in modals
- [ ] 13.4 Deactivated person's row is tappable and opens their Screen 3 person view

---

## 14. Android App — Tracking Spike (Do This First)

> Spec refs: `specs/call-tracking.md`, `decisions.md §27, 45, 46`

- [ ] 14.1 **Manual step**: Get the oldest team phone physically in hand before starting the spike
- [ ] 14.2 Scaffold `app/` with bare React Native CLI + TypeScript; install NativeWind, React Native Reusables, react-native-permissions, react-native-call-detection-android, react-native-call-log, libphonenumber-js, Axios, react-native-sqlite-storage, @react-native-async-storage/async-storage, @react-native-clipboard/clipboard; add CALL_PHONE + READ_CALL_LOG + READ_PHONE_STATE to the Android manifest
- [ ] 14.3 Build `src/features/tracking/db/pending-calls-db.ts`: SQLite `pending_calls` table with call_id, phone_number, intent_at, dialed_at, duration_seconds, attempts; implement insert, getAll, markFilled, delete, count, clearAll operations
- [ ] 14.4 Build `src/features/tracking/hooks/use-permissions.ts`: check all three permissions on mount; request if not granted; expose `allGranted` boolean; open Android settings via `Linking` when Fix is tapped
- [ ] 14.5 Build `src/features/tracking/hooks/use-call-tracker.ts` (Path 1): on hang-up, retry reading the call log at 3 s / 10 s / 30 s; match OUTGOING entry for same E.164 number within 1 minute of intent_at; fill `dialed_at` + `duration_seconds`; trigger sync immediately after fill
- [ ] 14.6 Build `src/features/tracking/hooks/use-janitor.ts` (Path 2): on app foreground, iterate rows older than 1 hour with null duration; attempt call-log match; on no match increment attempts; at 5 strikes fill with `dialed_at = intent_at, duration_seconds = 0`
- [ ] 14.7 Run the 8-case spike checklist from `decisions.md §45` on the oldest team phone: (1) normal answered call records talk time, (2) unanswered dial records 0, (3) 3-minute ring still matches, (4) two quick calls same number match in order, (5) incoming call ignored, (6) app killed mid-call completes via janitor, (7) hang-up listener fires, (8) call-log retry delay measured. All 8 must pass before proceeding.

---

## 15. Android App — Foundation and Auth

> Spec refs: `specs/authentication.md`, `screen.md §Screen 6`

- [ ] 15.1 Create `App.tsx` (auth check → tab navigation), `src/app/navigation/root-navigator.tsx` (login vs main), `src/app/navigation/app-navigator.tsx` (bottom tabs: Dialer | My Stats)
- [ ] 15.2 Create `src/shared/api/api-client.ts`: Axios with `Authorization: Bearer <token>` header; 401 → clear stored token + navigate to login
- [ ] 15.3 Build `src/features/auth/screens/login-screen.tsx`: name + password fields, Login button; store token + user_id + country in AsyncStorage on success; same error messages as web (401, 403, 429, 400)

---

## 16. Android App — Dialer Screen

> Spec refs: `specs/call-tracking.md §Dialer intent row`, `specs/lead-management.md §Next-lead serving`, `screen.md §Screen 7`

- [ ] 16.1 Build `src/features/dialer/components/keypad.tsx`: 12-key grid (0-9, *, #) + backspace; Paste button (reads clipboard; "Nothing copied." toast on empty clipboard); Call button grey until libphonenumber-js validates number for user's country; green when valid
- [ ] 16.2 Build `src/features/dialer/hooks/use-dialer.ts`: on Call button tap, lock button, write intent row to SQLite (call_id = uuid, phone_number = normalized E.164, intent_at = Date.now()), then launch `CALL_PHONE` intent; unlock on intent launch; if CALL_PHONE denied, open native dialer without writing intent row
- [ ] 16.3 Build `src/features/dialer/components/permission-banner.tsx`: shown when any of the three permissions is off; red background; Fix button opens Android app settings; cleared when all three are granted
- [ ] 16.4 Build the Automated sub-tab (`src/features/dialer/hooks/use-automated-calling.ts` + `components/lead-call-card.tsx`): Start Calling button fetches next lead via `POST /api/leads/next`; displays card with number; auto-dials; post-call outcome dialog (Connected / Did not connect / Schedule with date-time picker); "Auto-dial next lead" checkbox; Next button sends outcome (schedule or no-op) and fetches next lead in one request; show `lead: null` state when pool is empty
- [ ] 16.5 Build `src/features/dialer/screens/dialer-screen.tsx`: hosts Keypad and Automated sub-tabs with a pill switch; integrates permission banner

---

## 17. Android App — Sync

> Spec refs: `specs/call-tracking.md §Batch sync to server`, `design.md §6`

- [ ] 17.1 Build `src/features/tracking/hooks/use-sync.ts`: run janitor first, then batch-post all filled rows to `POST /api/calls/sync`; on 200 delete sent rows; on network error keep rows and retry on next app open
- [ ] 17.2 Wire `use-sync` to fire on every app foreground event (`AppState` change to `active`) and immediately after Path 1 fills a row

---

## 18. Android App — My Stats and Settings

> Spec refs: `specs/dashboard.md §Per-person stats`, `screen.md §Screen 8 and 9`

- [ ] 18.1 Build `src/features/stats/screens/my-stats-screen.tsx`: calls `GET /api/dashboard/person/<own-id>` on every tab open (no local cache); displays three-period stats block (today/yesterday/30d: dials/connected/minutes/connected%); top numbers table; "—" for null percent; "Can't reach the server. Check your internet." on network error — never fake zeros; gear icon in header opens Settings
- [ ] 18.2 Build `src/features/stats/screens/settings-screen.tsx`: single "Clear local data" button; confirmation dialog showing exact count of unsent calls (can be 0); confirm wipes `pending_calls` table; cancel does nothing; server data is untouched

---

## 19. End-to-End Verification

- [ ] 19.1 Run the full pytest suite (`pytest backend/tests/`) and confirm all tests pass
- [ ] 19.2 Deploy backend to Render; verify `db.create_all()` runs against Neon; run `flask seed` to create the manager account
- [ ] 19.3 Build the web dashboard (`npm run build` in `web/`), confirm Flask serves `web/dist` and the manager can log in, see the team dashboard, upload leads, create/edit/deactivate accounts
- [ ] 19.4 Build the Android APK (`./gradlew assembleRelease` in `app/android/`) signed with the release keystore; sideload to the oldest team phone and repeat the 8-case spike checklist from task 14.7 on the production build
- [ ] 19.5 Full end-to-end smoke test: manager uploads a CSV → salesperson logs in on app → automated calling flow → call syncs → manager's dashboard reflects the call → lead pool counts update
