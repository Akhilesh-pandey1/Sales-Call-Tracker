# Proposal: Sales Call Tracker — v1

> **CRITICAL GUIDANCE FOR DOWNSTREAM AGENTS:**
> This proposal is the root index and primary entry point for this initiative. Before designing or implementing any component, you **MUST review the technical ground-truth files in `agent-doc/`**:
> - [`agent-doc/decisions.md`](./decisions.md) — Core architectural decisions, business rules, and settled constraints.
> - [`agent-doc/database.md`](./database.md) — Database schemas, table definitions, fields, and relationships.
> - [`agent-doc/api.md`](./api.md) — API contracts, endpoints, request/response payloads, and error shapes.
> - [`agent-doc/structure.md`](./structure.md) — Directory layout, file locations, module organization, and the tech stack with exact versions.
> - [`agent-doc/testing.md`](./testing.md) — Testing strategy, test runners, commands, and expectations.
> Always consult these files whenever you need specific schema, endpoint, or architecture details.

## Why

Managers of 15–20 salespeople have zero visibility into daily call activity — they must ask each person individually. The system gives the manager a live web dashboard showing who called, how many times, and how long, while giving salespeople a mobile dialer that proves every call is real.

The manager web dashboard matches the approved screen screenshots in `agent-doc/screens/` exactly: indigo-on-lavender theme, sidebar navigation with Logout, a period-switched team dashboard with a calls-by-hour chart, a person view with active-day averages, lead pool stage cards, and toast notifications. The API carries additive fields that feed every number on those screens; the database does not change.

## Scope

### In Scope

- `authentication`: name + password login, single active session, brute-force lockout, token-gated API, manager-only web gate
- `call-tracking`: dialer intent queue, call-log matching (real-time + janitor), batch sync, server-side ingestion, three Android permissions, clear-local-data recovery
- `dashboard`: team dashboard (Today / Yesterday / 30 days switch, four KPI cards, calls-by-hour chart, top 5 people, team table), person view (active-day KPI cards, performance table, most-contacted numbers), and the salesperson's own My Stats view on the app
- `user-management`: manager creates, edits, activates, deactivates, and deletes accounts; accounts list with counts and own-row marker
- `lead-management`: single-column CSV upload, shared pool with newest-first serving, 10-minute claims, scheduling, call-based resolution, manager summary with stage split and daily upload/tackle counts
- The manager web UI on all five screens — Login, Team Dashboard, Person View, Leads, Accounts — built with the React 19 + Tailwind v4 + sonner + Recharts stack

### Out of Scope (Non-Goals)

- Real-time dashboard updates (auto-refresh or push) — data loads on open and refresh only
- GPS location, attendance, WhatsApp/SMS/chat tracking — calls only
- Teams, sub-managers, and interest labels — v2 work
- Sales tracking — "Software sold" appears nowhere in v1
- Password self-service — only the manager sets and changes passwords
- Background sync jobs on the phone — sync runs in the foreground only
- iOS, Google Play distribution (the APK is sideloaded), and web automated tests (tests live in the API only)

## Capability Map (Modular Breakdown)

| Module ID | Responsibility | Depends On | Spec File |
|---|---|---|---|
| `authentication` | Login, session tokens, brute-force lockout, token-gated access | — | `specs/authentication.md` |
| `user-management` | Manager control of accounts: create, edit, activate, deactivate, delete, list | `authentication` | `specs/user-management.md` |
| `call-tracking` | Real call capture on Android: intent queue, call-log matching, batch sync, server ingestion | `authentication` | `specs/call-tracking.md` |
| `lead-management` | Shared lead pool: upload, serving, claims, scheduling, call-based resolution, manager summary | `authentication`, `call-tracking` | `specs/lead-management.md` |
| `dashboard` | Call aggregates for manager web and salesperson app: team, person, hourly, top numbers | `authentication`, `call-tracking` | `specs/dashboard.md` |

### Build Order

`authentication` ──► `user-management` and `call-tracking` ──► `lead-management` ──► `dashboard`

## Impact & Systems Affected

- **`backend/`** — Python Flask modular monolith serving all five capabilities; Neon PostgreSQL with the `users`, `calls`, and `leads` tables; hosted on Render
- **`web/`** — React 19.3.1 + Vite 8.3.4 + TypeScript, Tailwind CSS v4 (4.3.3) via `@tailwindcss/vite`, shadcn/ui, sonner 2.0.8 toasts, Recharts 3.10.1 charts; built to `web/dist` and served by Flask
- **`app/`** — React Native (bare CLI) + TypeScript + NativeWind Android app "Apex Sales Call", distributed as a sideloaded APK
