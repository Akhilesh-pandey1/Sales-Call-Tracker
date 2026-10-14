# Proposal: Sales Call Tracker — v1

## Why

Managers of 15–20 salespeople have zero visibility into daily call activity — they must ask each person individually. The goal is to give the manager a live web dashboard showing who called, how many times, and how long, while giving salespeople a mobile dialer that proves every call is real.

## What Changes

This is a greenfield product. Nothing exists today. The entire system — backend API, manager web dashboard, and Android salesperson app — is being built from scratch.

- New REST API (Flask/Python) with authentication, call sync, dashboards, user management, and lead pool management
- New manager web dashboard (React + TypeScript) with team overview, per-person stats, lead pool management, and account management
- New Android salesperson app (React Native) with a dialer, call tracking, automated lead calling, and a personal stats view
- New Neon PostgreSQL database with `users`, `calls`, and `leads` tables

## Capabilities

### New Capabilities

- `authentication`: Login with name + password; session token per user; rate-limiting lockout after 10 failed attempts → [`specs/authentication.md`](specs/authentication.md)
- `call-tracking`: Android app captures real calls via dialer intent, matches call-log entries, queues them in SQLite, and syncs to the server in batches → [`specs/call-tracking.md`](specs/call-tracking.md)
- `dashboard`: Team and per-person call performance stats (today, yesterday, last 30 days) with top-5 numbers → [`specs/dashboard.md`](specs/dashboard.md)
- `user-management`: Manager creates, edits, activates, deactivates, and deletes salesperson accounts → [`specs/user-management.md`](specs/user-management.md)
- `lead-management`: Manager uploads lead CSVs; salespeople call leads in automated flow; leads progress through waiting → done/stopped lifecycle → [`specs/lead-management.md`](specs/lead-management.md)

## Impact

- **New systems**: Three new deployable units (backend on Render, web served by Flask, Android APK sideloaded)
- **New database**: Neon PostgreSQL with three tables; no existing data to migrate
- **Dependencies**: Flask-SQLAlchemy, psycopg2-binary, phonenumbers, pytest (backend); React + TanStack Query + shadcn/ui (web); React Native bare CLI, react-native-call-log, react-native-call-detection-android, react-native-permissions (app)
- **No breaking changes** — greenfield; no prior system to be compatible with
