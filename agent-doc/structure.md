# Project File Structure

## Architecture Overview
The system consists of three parts in a single repository:
- `backend/`: Python Flask modular monolith API served on Render.
- `web/`: React + TypeScript manager dashboard built with Vite and served by the Flask backend.
- `app/`: React Native (bare CLI) + TypeScript Android app ("Apex Sales Call") with NativeWind + React Native Reusables, distributed via APK sideloading.

---

## Technology Stack & Tools

### 1. Mobile App (`app/`) — Android Sideloaded APK
- **Runtime & Language**: Bare React Native CLI + TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: React Native Reusables (`react-native-reusables` — shadcn/ui for React Native in `components/ui/`)
- **Navigation**: React Navigation (`@react-navigation/bottom-tabs`)
- **Local Storage**: `react-native-sqlite-storage` (pending call queue) + `@react-native-async-storage/async-storage`
- **Telephony & Permissions**:
  - `react-native-permissions`
  - `react-native-call-detection-android`
  - `react-native-call-log`
- **Utilities**: `libphonenumber-js` (E.164 phone normalization), `axios` (API requests), `@react-native-clipboard/clipboard`

### 2. Web Dashboard (`web/`) — Manager Web App
- **Build Tool & Language**: Vite 8.3.4 + React 19.3.1 + TypeScript
- **Styling**: Tailwind CSS v4 (4.3.3) through the `@tailwindcss/vite` plugin and a CSS `@theme` block — no `tailwind.config.js`, no `postcss.config.js` — plus `tw-animate-css` (1.4.0) for dialog animations
- **UI Components**: shadcn/ui (Button, Dialog, Input, Table, Badge in `components/ui/`) + Lucide React (1.58.0)
- **Toasts**: sonner (2.0.8)
- **Charts**: recharts (3.10.1)
- **Routing**: React Router (`react-router-dom` 7.18.4)
- **Server State & Data Fetching**: TanStack Query (`@tanstack/react-query` 5.104.3) + `axios` (1.20.0)

### 3. Backend (`backend/`) — Python Flask API
- **Framework & Language**: Python + Flask (Modular Monolith)
- **ORM & Database Client**: Flask-SQLAlchemy + `psycopg2-binary`
- **Database**: PostgreSQL (hosted on Neon)
- **WSGI Production Server**: Gunicorn
- **Validation & Tools**: `phonenumbers` (Python phone parsing), `pytest` (automated tests)
- **Hosting & Serving**: Render (Flask also serves the built `web/dist` static assets)

---

## 1. Backend (`backend/`) — Python / Flask Modular Monolith

```text
backend/
├── app/
│   ├── __init__.py                  # Application factory (create_app)
│   ├── extensions.py                # Shared instances: SQLAlchemy (db)
│   ├── config/
│   │   ├── base.py                  # Common constants: MAX_CALL_AGE_DAYS=3, MAX_LEAD_ATTEMPTS=3, RETRY_LOCK_HOURS=2, CLAIM_MINUTES=10, MAX_SCHEDULE_AHEAD_DAYS=30, MAX_LEAD_UPLOAD_MB=2, lockout limits
│   │   ├── dev.py                   # Local development settings
│   │   └── prod.py                  # Production settings (DATABASE_URL from Neon)
│   ├── core/
│   │   ├── errors.py                # AppException and global error handler
│   │   ├── security.py              # Password hashing and token generation
│   │   └── utils.py                 # Timezone and phone normalization utilities
│   ├── api/
│   │   └── __init__.py              # Blueprint registration for all /api endpoints
│   └── modules/
│       ├── auth/
│       │   ├── routes.py            # POST /api/login
│       │   ├── schemas.py           # Login request and response validation
│       │   ├── services.py          # Authentication and in-memory lockout logic
│       │   └── __init__.py
│       ├── calls/
│       │   ├── routes.py            # POST /api/calls/sync
│       │   ├── schemas.py           # Sync batch schemas
│       │   ├── services.py          # Call ingestion, office-hours gate, duplicate skip, lead resolution
│       │   ├── models.py            # Call SQLAlchemy database model
│       │   └── __init__.py
│       ├── dashboard/
│       │   ├── routes.py            # GET /api/dashboard/team, GET /api/dashboard/team/people, GET /api/dashboard/person/<id>
│       │   ├── schemas.py           # Dashboard response schemas
│       │   ├── services.py          # IST period aggregation, computed dashboard KPIs, and top numbers calculation
│       │   └── __init__.py
│       ├── users/
│       │   ├── routes.py            # User management endpoints (create, list, update, activate, deactivate, delete)
│       │   ├── schemas.py           # User schemas and password rules
│       │   ├── services.py          # User CRUD and self-action guards
│       │   ├── models.py            # User SQLAlchemy database model
│       │   └── __init__.py
│       ├── leads/
│       │   ├── routes.py            # POST /api/leads/upload, GET /api/leads/summary, POST /api/leads/next
│       │   ├── schemas.py           # Lead upload, summary, and next-lead schemas
│       │   ├── services.py          # Lead parsing, pool queries, claims, and scheduling
│       │   ├── models.py            # Lead SQLAlchemy database model
│       │   └── __init__.py
│       └── settings/
│           ├── routes.py            # GET /api/settings/office-hours, PUT /api/settings/office-hours
│           ├── schemas.py           # Office hours request and response validation
│           ├── services.py          # Office hours read, update, and window validation
│           ├── models.py            # OfficeHours SQLAlchemy database model
│           └── __init__.py
├── tests/
│   ├── conftest.py                  # Pytest fixtures and test database setup
│   └── modules/
│       ├── test_auth.py             # Login and lockout tests
│       ├── test_calls.py            # Call sync, office-hours gate, and deduplication tests
│       ├── test_dashboard.py        # Team and person metrics over IST boundaries
│       ├── test_users.py            # Account lifecycle and guard tests
│       ├── test_leads.py            # CSV upload, serving order, claims, and resolution
│       └── test_settings.py         # Office hours read, update, and permission tests
├── wsgi.py                          # Gunicorn WSGI production entry point
└── requirements.txt                 # flask, flask-sqlalchemy, gunicorn, psycopg2-binary, pytest, phonenumbers
```

---

## 2. Manager Web Dashboard (`web/`) — React + TypeScript

```text
web/
├── package.json
├── vite.config.ts                   # Vite build configuration with /api dev proxy
├── index.html
└── src/
    ├── app/
    │   ├── router.tsx               # Routes: /, /team, /leads, /accounts, /settings, /person/:id with manager auth guard
    │   ├── providers.tsx            # TanStack Query and Auth context providers
    │   ├── guards/
    │   │   └── manager-guard.tsx    # Manager-only gate: salesperson logins see one message
    │   └── layouts/
    │       └── dashboard-layout.tsx # Sidebar: Dashboard, Team, Leads, Accounts, Settings, Logout
    ├── features/
    │   ├── auth/
    │   │   ├── api/auth.api.ts
    │   │   ├── hooks/use-auth.ts
    │   │   └── pages/login-page.tsx
    │   ├── dashboard/
    │   │   ├── api/dashboard.api.ts
    │   │   ├── hooks/use-team-dashboard.ts
    │   │   ├── hooks/use-person-stats.ts
    │   │   ├── components/kpi-card.tsx
    │   │   ├── components/period-switch.tsx
    │   │   ├── components/dashboard-card.tsx
    │   │   ├── components/calls-by-hour-chart.tsx
    │   │   ├── components/top-people-list.tsx
    │   │   ├── components/top-numbers-table.tsx
    │   │   ├── components/team-table.tsx  # Team page rows: today and yesterday per salesperson
    │   │   ├── utils/format.ts          # Display-only formatting (no calculations)
    │   │   ├── pages/dashboard-page.tsx # Dashboard: KPI cards, calls-by-hour chart, Top 5
    │   │   ├── pages/team-page.tsx      # Team: one row per active salesperson, opens person page
    │   │   └── pages/person-page.tsx
    │   ├── accounts/
    │   │   ├── api/accounts.api.ts
    │   │   ├── hooks/use-accounts.ts
    │   │   ├── hooks/use-create-user.ts
    │   │   ├── hooks/use-update-user.ts
    │   │   ├── hooks/use-delete-user.ts
    │   │   ├── hooks/use-user-status.ts
    │   │   ├── hooks/use-edit-account-form.ts
    │   │   ├── components/accounts-table.tsx
    │   │   ├── components/user-status-button.tsx
    │   │   ├── components/add-user-modal.tsx
    │   │   ├── components/edit-user-modal.tsx
    │   │   ├── components/delete-dialog.tsx
    │   │   └── pages/accounts-page.tsx
    │   ├── settings/
    │   │   ├── api/office-hours.api.ts
    │   │   ├── hooks/use-office-hours.ts
    │   │   ├── hooks/use-office-hours-form.ts
    │   │   ├── components/office-hours-editor.tsx
    │   │   └── pages/settings-page.tsx   # Settings: the office-hours card
    │   └── leads/
    │       ├── api/leads.api.ts
    │       ├── hooks/use-leads.ts
    │       ├── hooks/use-lead-upload.ts
    │       ├── components/lead-upload-card.tsx
    │       ├── components/lead-pool-stats.tsx
    │       ├── components/lead-daily-stats.tsx
    │       ├── components/lead-agent-table.tsx
    │       └── pages/leads-page.tsx
    ├── components/
    │   └── ui/                      # shadcn/ui components: button, dialog, input, table, badge, chart
    ├── shared/
    │   ├── components/page-header.tsx  # Slim per-page top bar: title left, date or action right
    │   ├── components/error-state.tsx  # "Could not load data." with a Retry button
    │   ├── components/error-alert.tsx
    │   ├── api/api-client.ts        # Axios client with auth token interceptor and 401 redirect
    │   ├── api/api-error.ts
    │   └── utils/                   # cn, format-count, todays-date, row-activation helpers
    └── main.tsx                     # React DOM entry point
```

---

## 3. Salesperson Mobile App (`app/`) — React Native (Bare CLI) + TypeScript

```text
app/
├── package.json
├── tailwind.config.js               # NativeWind Tailwind configuration
├── global.css                       # NativeWind CSS theme and styles
├── App.tsx                          # Root container: Auth check → Tab navigation
├── index.js                         # React Native app registry entry point
├── android/                         # Android native project (manifest includes CALL_PHONE, READ_CALL_LOG, READ_PHONE_STATE)
└── src/
    ├── app/
    │   └── navigation/
    │       ├── app-navigator.tsx    # Bottom tabs: Dialer (with Dialer & Automated tabs) and My Stats
    │       └── root-navigator.tsx   # Login vs Main App screen switch
    ├── components/
    │   └── ui/                      # React Native Reusables (shadcn for mobile): button, input, card, dialog, text
    ├── features/
    │   ├── auth/
    │   │   ├── api/auth.api.ts
    │   │   ├── hooks/use-auth.ts
    │   │   └── screens/login-screen.tsx
    │   ├── dialer/
    │   │   ├── components/keypad.tsx
    │   │   ├── components/permission-banner.tsx
    │   │   ├── components/lead-call-card.tsx
    │   │   ├── hooks/use-dialer.ts
    │   │   ├── hooks/use-automated-calling.ts
    │   │   └── screens/dialer-screen.tsx # Hosts Dialer keypad and Automated lead calling sub-tabs
    │   ├── stats/
    │   │   ├── api/stats.api.ts
    │   │   ├── hooks/use-my-stats.ts
    │   │   └── screens/
    │   │       ├── my-stats-screen.tsx   # Salesperson KPI view with gear icon
    │   │       └── settings-screen.tsx   # Clear local data recovery button
    │   └── tracking/
    │       ├── db/pending-calls-db.ts    # SQLite queue operations
    │       ├── hooks/use-permissions.ts  # Runtime permissions check, request, settings link
    │       ├── hooks/use-call-tracker.ts # Native call-state listener and call-log matching
    │       ├── hooks/use-janitor.ts      # 1-hour check and 5-strike give-up filler
    │       └── hooks/use-sync.ts         # Janitor-first batch sync on foreground and call completion
    └── shared/
        ├── api/api-client.ts             # Axios HTTP client with token header
        └── utils/phone-formatter.ts      # libphonenumber-js E.164 normalization
```
