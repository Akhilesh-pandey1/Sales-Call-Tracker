# Design: Sales Call Tracker v1

## Context

Greenfield product. No existing codebase. The team is ~15–20 salespeople plus one manager, all working in IST. Android devices are personal and unknown — the oldest device on the team sets the bar. The full motivation and scope live in `proposal.md`; the requirements live in the five `specs/` files.

---

## Goals / Non-Goals

**Goals:**
- Three independently deployable units in one repo: Flask backend, React web dashboard, React Native Android app
- One shared backend serves both the web dashboard (static assets) and the mobile API — no CORS, no separate origin
- Every design decision is locked before implementation starts; no guessing during coding

**Non-Goals:**
- Real-time push (WebSockets, SSE) — fetch on open/refresh only (v1)
- Sub-manager teams, interest labels, WhatsApp/SMS tracking — v2
- iOS app, Play Store distribution
- Background sync on the phone — all sync happens while the app is in the foreground

---

## Decisions

### 1. Single-repo, three-part monorepo
`backend/`, `web/`, `app/` live in the same GitHub repo. Render auto-deploys `backend/` on push to `main`; the Flask server also serves `web/dist` from a catch-all route so the web dashboard shares the same origin as the API — no CORS header needed on any endpoint.

**Alternatives considered:** Separate repos (more overhead for a small team), serverless (cold-start latency on Render free tier is worse than a small always-on plan).

### 2. Flask modular monolith with Flask-SQLAlchemy
Each domain (auth, calls, dashboard, users, leads) is a feature module under `backend/app/modules/`. SQLAlchemy models are the only class-based code; all other layers use plain functions (per repo style rules). `db.create_all()` on startup creates tables on Neon automatically — no separate migration runner for greenfield.

**Alternatives considered:** Raw psycopg2 (harder schema evolution when v2 adds teams/tenants), Django (heavier, more opinionated than needed).

### 3. Auth: token in `users` table, no separate tokens table
Each login writes a fresh random token to `users.auth_token`. Token + `is_active` check runs on every protected request. Deactivation, deletion, and password reset all clear the token immediately. In-memory dict tracks login lockout counters (name → fail count + timestamp) — a server restart resets it (accepted; one Render instance).

**Alternatives considered:** JWT (adds expiry complexity; the manager controls all accounts so token revocation is important), separate sessions table (unnecessary join on every request).

### 4. IST day boundaries computed server-side
All "today" / "yesterday" / "last 30 days" periods are computed in `Asia/Kolkata` by the server. UTC timestamps in the DB are converted at query time. `connected_percent` is computed in the API and returned directly — screens never do math.

### 5. Android: bare React Native CLI, no Expo
The three native libraries (call-log read, call-end listener, permissions) require direct Android manifest and Gradle access. Expo's managed workflow hides these. The APK is a plain Gradle build, sideloaded via internal link.

### 6. Call tracking: two-path fill, janitor runs before sync
Path 1 (real-time listener) fills intent rows within seconds; Path 2 (janitor on every app open) catches rows Path 1 missed. The janitor runs first on every foreground event so any row it completes rides the same batch sync — not one extra app open later. After 5 janitor strikes the row is filled with `duration_seconds = 0` so the dial is never lost entirely.

### 7. Lead pool: server-side state, claim window prevents double-dial
Lead state lives entirely in the `leads` table — no local copy on the phone. A 10-minute claim window (`CLAIM_MINUTES`) ensures two salespeople cannot receive the same lead simultaneously. Scheduling reserves a lead to one person; the reservation is cleared when the lead resolves.

### 8. `POST /api/leads/next` is the unified lead endpoint
A single endpoint handles both "schedule current lead" and "fetch next" in one request, so each call transition costs exactly one network round-trip.

### 9. All named constants in `api/config.py`
`MAX_CALL_AGE_DAYS`, `MAX_LEAD_ATTEMPTS`, `RETRY_LOCK_HOURS`, `CLAIM_MINUTES`, `MAX_SCHEDULE_AHEAD_DAYS`, `MAX_LEAD_UPLOAD_MB`, lockout limits, password rules, country shortlist — all in one file. No magic numbers anywhere else.

### 10. Web dashboard token in localStorage
Manager stays logged in across browser refreshes. A 401 from any API call clears the token and redirects to login — same contract as the app.

---

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Call-log listener unreliable on some Android brands | Tracking spike on the oldest team phone is the first build step; Path 2 (janitor) is the safety net; give-up rule ensures the dial is never lost |
| Neon free plan: point-in-time restore only 6 hours; no auto-backup | Manual Neon snapshot after any large bulk operation; documented in decisions.md |
| Login lockout counter lost on server restart | One Render instance; accepted; documented in decisions.md |
| Phone clock skew shifts a call across a day boundary | Accepted limitation; documented in decisions.md |
| Unsynced queue lost on reinstall or data clear | "Clear local data" action requires explicit confirmation with count shown; no background sync is the trade-off for simplicity |
| Old call > 3 days old is dropped on sync | Phone offline ≥ 3 days is an extreme edge case; janitor give-up calls have `dialed_at = intent_at` so they land in the correct day window |

---

## Migration Plan

1. Neon PostgreSQL: `db.create_all()` creates all tables on first deploy — no manual SQL needed.
2. Seed: `flask seed` CLI command creates the initial manager account (manual step in tasks).
3. Rollback: `DROP TABLE IF EXISTS leads, calls, users CASCADE;` clears everything cleanly. Render rolls back code by reverting the GitHub commit.
4. Android APK: release keystore created once, kept safe; every future update uses the same keystore.

---

## Open Questions

None. All design decisions are resolved. See `decisions.md` for the full decision log.
