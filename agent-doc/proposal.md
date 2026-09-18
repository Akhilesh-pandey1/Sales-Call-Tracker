# Sales Call Tracker — Proposal

## Why

A manager with 15–20 salespeople has no idea who is calling, how many calls they make, or to whom (Decision 1). The manager wastes the day chasing people one by one for updates (Decision 2). This build gives the manager one live web dashboard that answers "who called, how much" at any time — and every number comes from a real call event on the phone, so it cannot be faked (Decision 5).

## What Changes

This is a greenfield build — one repository, three parts (Decision 10):

- **`app/`** — Android app "Apex Sales Call" (bare React Native, sideloaded APK). Salespeople dial from the in-app dialer; the app records each dial locally the moment Call is tapped, fills in the real time and duration from the Android call log after the call ends, and syncs to the server — exactly once, even after offline days. It also shows each salesperson their own KPIs.
- **`api/`** — one Flask API (Render, Neon Postgres): login and token sessions, idempotent call sync, dashboard totals computed in IST, and full account management for the manager.
- **`web/`** — manager-only React dashboard served by the same API: team totals, per-person views, and account management.

Not in v1: real-time updates, GPS, attendance, WhatsApp/SMS tracking, chat, auto-flag rules, graphs (Decisions 7, 8).

## Capabilities

### New Capabilities

- `tracking-spike` (`specs/tracking-spike.md`): the eight-case proof, on the oldest real team phone, that dial → call end → call log → match → exact duration works. Comes first; its code ships.
- `login-auth` (`specs/login-auth.md`): one shared login (name + password) for app and web, fresh token sessions the manager can kill instantly, guess limit, manager-only web.
- `call-dialer` (`specs/call-dialer.md`): the in-app dialer — number entry, validity gate, the three permissions, one tap = one intent row, filling the row from the real call (two paths).
- `call-sync` (`specs/call-sync.md`): the local queue and the one batch sync — filled rows only, exactly once, per-row safety, 3-day cutoff, clear-local-data escape hatch.
- `team-dashboard` (`specs/team-dashboard.md`): the manager's home screen — today and yesterday totals, one row per active salesperson, zeros included.
- `person-stats` (`specs/person-stats.md`): one person's numbers — three periods, connected %, top 5 numbers. The web Person view and the app's My Stats tab use the same endpoint.
- `account-management` (`specs/account-management.md`): the manager creates, edits, deactivates, reactivates, and permanently deletes accounts — with self-guards.

### Modified Capabilities

None — first spec set for a greenfield build.

## Impact

- **New code**: `api/` (Flask + Flask-SQLAlchemy, strict MVC per design.md §6), `web/` (React + Vite), `app/` (bare React Native CLI, plain JavaScript). File tree is final in design.md §6.
- **External services**: Neon Postgres (Singapore, free plan) for storage; Render (small paid plan) for hosting; private GitHub repo connected to Render — push to main auto-deploys (Decisions 20, 79).
- **App libraries** (all existing, custom Kotlin only as last resort — Decision 14): call-log reading, call-end detection, permission handling; plus libphonenumber-js for number normalization.
- **Manual steps owned by humans**: oldest team phone in hand, release keystore, first manager account via the Neon console, APK sideloading (design §5).
- **Acceptance criteria**: the scenarios in the seven spec files under `specs/`.
