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

Managers of 15–20 salespeople have zero visibility into daily call activity — they must ask each person individually. The system gives the manager a web dashboard showing who called, how many times, and how long, while giving salespeople a mobile dialer that proves every call is real.

The manager web dashboard matches the approved screen screenshots in `agent-doc/screens/` exactly: indigo-on-lavender theme, sidebar navigation with Logout, a period-switched team dashboard with a calls-by-hour chart, a person view with active-day averages, lead pool stage cards, and toast notifications. Round 2 settled the number contract: the backend computes every dashboard figure and returns it inside per-period blocks — the web only formats what it receives, and the team response carries no per-salesperson rows. A manager-editable office-hours window decides which synced calls count and bounds the chart's hours; it adds the `office_hours` table.

## Scope

### In Scope

- `authentication`: name + password login, single active session, brute-force lockout, token-gated API, manager-only web gate
- `call-tracking`: dialer intent queue, call-log matching (real-time + janitor), batch sync, server-side ingestion with age and office-hours checks, three Android permissions, clear-local-data recovery
- `office-hours`: one manager-editable daily window (default 10:00–19:00 IST) edited from the Accounts screen, gating synced calls both-ends inclusive and bounding the calls-by-hour chart hours
- `dashboard`: server-computed per-period responses — team dashboard (Today / Yesterday / 30 days switch, four KPI cards with returned averages and yesterday deltas, calls-by-hour chart, top 5 people), person view (active-day KPI cards, performance table, calls-by-hour chart, most-contacted numbers), and the salesperson's own My Stats view on the app; screens format returned values and compute nothing
- `user-management`: manager creates, edits, activates, deactivates, and deletes accounts; accounts list with counts and own-row marker
- `lead-management`: single-column CSV upload, shared pool with newest-first serving, 10-minute claims, scheduling, call-based resolution, manager summary with stage split and daily upload/tackle counts
- `tapped-number-capture`: numbers tapped outside the app — Contacts, WhatsApp, browser, SMS — open our Dialer keypad already typed and ready to call; a one-time login-pass setup step with a permanent Don't-show-again; the app never becomes the default phone app
- The manager web UI on all five screens — Login, Team Dashboard, Person View, Leads, Accounts — built with the React 19 + Tailwind v4 + sonner + Recharts stack

### Out of Scope (Non-Goals)

- Real-time dashboard updates (auto-refresh or push) — data loads on open and refresh only
- GPS location, attendance, WhatsApp/SMS/chat tracking — calls only
- Teams, sub-managers, and interest labels — v2 work
- Per-salesperson team-table rows — the team dashboard response drops the people list; rows return with the future Team section and its own endpoint (Decision 131)
- Working-day rules for office hours — one window serves every day of the week, Sunday included (Decision 132)
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
| `office-hours` | The single manager-editable office-hours window: storage, editing, sync gate, chart hours | `authentication`, `call-tracking` | `specs/office-hours.md` |
| `lead-management` | Shared lead pool: upload, serving, claims, scheduling, call-based resolution, manager summary | `authentication`, `call-tracking` | `specs/lead-management.md` |
| `dashboard` | Server-computed call aggregates for manager web and salesperson app: per-period team and person data, hourly chart, top lists | `authentication`, `call-tracking`, `office-hours` | `specs/dashboard.md` |
| `tapped-number-capture` | Catches numbers tapped outside the app into the Dialer keypad ready to call; one-time login-pass setup with a permanent opt-out | `call-tracking` | `specs/tapped-number-capture.md` |

### Build Order

`authentication` ──► `user-management` and `call-tracking` ──► `office-hours` and `lead-management` ──► `dashboard`

`call-tracking` ──► `tapped-number-capture`

## Impact & Systems Affected

- **`backend/`** — Python Flask modular monolith serving all six capabilities; Neon PostgreSQL with the `users`, `calls`, `leads`, and `office_hours` tables; hosted on Render
- **`web/`** — React 19.3.1 + Vite 8.3.4 + TypeScript, Tailwind CSS v4 (4.3.3) via `@tailwindcss/vite`, shadcn/ui, sonner 2.0.8 toasts, Recharts 3.10.1 charts; renders server-computed values with display formatting only; built to `web/dist` and served by Flask
- **`app/`** — React Native (bare CLI) + TypeScript + NativeWind Android app "Apex Sales Call", distributed as a sideloaded APK; unchanged by the office-hours gate (it lives server-side)
