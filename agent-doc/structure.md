# Project File Structure

## Architecture Overview
The system consists of three parts in a single repository:
- `backend/`: Python Flask modular monolith API served on Render.
- `web/`: React + TypeScript manager dashboard built with Vite and served by the Flask backend.
- `app/`: React Native (bare CLI) + TypeScript Android app ("Apex Sales Call") distributed via APK sideloading.

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
│       │   ├── services.py          # Call ingestion, duplicate skip, lead resolution
│       │   ├── models.py            # Call SQLAlchemy database model
│       │   └── __init__.py
│       ├── dashboard/
│       │   ├── routes.py            # GET /api/dashboard/team, GET /api/dashboard/person/<id>
│       │   ├── schemas.py           # Dashboard response schemas
│       │   ├── services.py          # IST period aggregation and top numbers calculation
│       │   └── __init__.py
│       ├── users/
│       │   ├── routes.py            # User management endpoints (create, list, update, activate, deactivate, delete)
│       │   ├── schemas.py           # User schemas and password rules
│       │   ├── services.py          # User CRUD and self-action guards
│       │   ├── models.py            # User SQLAlchemy database model
│       │   └── __init__.py
│       └── leads/
│           ├── routes.py            # POST /api/leads/upload, GET /api/leads/summary, POST /api/leads/next
│           ├── schemas.py           # Lead upload, summary, and next-lead schemas
│           ├── services.py          # Lead parsing, pool queries, claims, and scheduling
│           ├── models.py            # Lead SQLAlchemy database model
│           └── __init__.py
├── tests/
│   ├── conftest.py                  # Pytest fixtures and test database setup
│   └── modules/
│       ├── test_auth.py             # Login and lockout tests
│       ├── test_calls.py            # Call sync and deduplication tests
│       ├── test_dashboard.py        # Team and person metrics over IST boundaries
│       ├── test_users.py            # Account lifecycle and guard tests
│       └── test_leads.py            # CSV upload, serving order, claims, and resolution
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
    │   ├── router.tsx               # App routing with manager auth guard
    │   ├── providers.tsx            # TanStack Query and Auth context providers
    │   └── layouts/
    │       └── dashboard-layout.tsx # Persistent sidebar and top navbar wrapper
    ├── features/
    │   ├── auth/
    │   │   ├── api/auth.api.ts
    │   │   ├── hooks/use-auth.ts
    │   │   └── pages/login-page.tsx
    │   ├── dashboard/
    │   │   ├── api/dashboard.api.ts
    │   │   ├── hooks/use-team-dashboard.ts
    │   │   ├── hooks/use-person-stats.ts
    │   │   ├── components/team-table.tsx
    │   │   ├── components/top-numbers-table.tsx
    │   │   ├── pages/team-page.tsx
    │   │   └── pages/person-page.tsx
    │   ├── accounts/
    │   │   ├── api/accounts.api.ts
    │   │   ├── hooks/use-accounts.ts
    │   │   ├── components/add-user-modal.tsx
    │   │   ├── components/edit-user-modal.tsx
    │   │   ├── components/delete-dialog.tsx
    │   │   └── pages/accounts-page.tsx
    │   └── leads/
    │       ├── api/leads.api.ts
    │       ├── hooks/use-leads.ts
    │       ├── components/lead-upload-card.tsx
    │       ├── components/lead-pool-stats.tsx
    │       ├── components/lead-agent-table.tsx
    │       └── pages/leads-page.tsx
    ├── components/
    │   └── ui/                      # shadcn/ui components: button, dialog, input, table, badge
    ├── shared/
    │   ├── components/navbar.tsx    # Header bar with user profile and logout
    │   └── api/api-client.ts        # Axios client with auth token interceptor and 401 redirect
    └── main.tsx                     # React DOM entry point
```

---

## 3. Salesperson Mobile App (`app/`) — React Native (Bare CLI) + TypeScript

```text
app/
├── package.json
├── App.tsx                          # Root container: Auth check → Tab navigation
├── index.js                         # React Native app registry entry point
├── android/                         # Android native project (manifest includes CALL_PHONE, READ_CALL_LOG, READ_PHONE_STATE)
└── src/
    ├── app/
    │   └── navigation/
    │       ├── app-navigator.tsx    # Bottom tabs: Dialer (with Dialer & Automated tabs) and My Stats
    │       └── root-navigator.tsx   # Login vs Main App screen switch
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
