## Task 1: Team people endpoint returns per-salesperson rows

**Description:** Add `GET /api/dashboard/team/people` exactly as contracted in `api.md` — one row per active salesperson with today and yesterday blocks of `dials`, `connected`, and `minutes`, zeros included, deactivated people never listed, rows sorted by today's dials highest first. Covers `specs/dashboard.md` (per-salesperson rows return with the Team section) and Decisions 131, 139.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] The endpoint returns one row per active salesperson including zeros, and deactivated salespeople never appear
- [x] Each period block carries only `dials`, `connected`, and `minutes` — `minutes` is `round(seconds / 60)` computed on the server with no `seconds` field — and rows come back sorted by today's dials, highest first
- [x] A salesperson token gets 403 `{"message": "This dashboard is for managers."}` on the endpoint

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_dashboard.py` (from `backend/`)

---

## Task 2: Team page at /team renders the per-person table

**Description:** Build the Team page (Screen 2b, Decision 139) in a new `features/team` folder — a table of name plus Today and Yesterday column groups (dials / connected / minutes), rows in the server's order, tapping a row opens the person page, and on mobile one card per person with the same numbers. With no salespeople yet it shows an empty state pointing the manager to Accounts, and a failed load shows the existing "Could not load data." pattern with Retry. The dashboard component currently named `TeamPage` is renamed `DashboardPage` so the new page can own the Team name — its `/` route and content stay exactly as they are (Decision 138).

**Blocked by:** Task 1

**Status:** Done

**Acceptance criteria:**
- [x] The page at `/team` renders returned rows only — name plus today/yesterday dials, connected, and minutes, in the server's sort order, zeros included
- [x] Tapping a row opens `/person/<id>?from=/team`, and narrow screens show one card per person with the same numbers
- [x] With no salespeople the page shows an empty state pointing to Accounts, and the Dashboard at `/` keeps its exact current content

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 3: Settings page hosts the office-hours editor

**Description:** Create the Settings page at `/settings` (Decision 142) holding its one card — Office hours — by rendering the existing `OfficeHoursEditor`: it shows the stored window, saves a new start and end time, and a refused save surfaces the API's message with the editor kept open. The editor is removed from the Accounts page so it lives in its new home only (Decision 141).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] `/settings` shows the single Office hours card with the stored window, and saving a valid change updates it
- [x] A refused save shows the API's message and keeps the editor open
- [x] The Accounts page no longer renders the editor and keeps Add person, per-row Edit, Deactivate/Activate, Delete, with no actions on the manager's own row

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 4: Sidebar carries the five section links

**Description:** Update the sidebar to the approved mockup set (Decision 137) — exactly five links in the order Dashboard, Team, Leads, Accounts, Settings, with the mockup icons: grid, two people, person-plus, single person, gear. Opening a person page keeps the section it came from highlighted — Team for a team-row person, Accounts for a deactivated person's page — through the existing `?from=` mechanism.

**Blocked by:** Tasks 2, 3

**Status:** Not started

**Acceptance criteria:**
- [ ] The sidebar shows exactly five links in the order Dashboard, Team, Leads, Accounts, Settings with the mockup icons
- [ ] A person page opened from a Team row highlights Team, and one opened from Accounts highlights Accounts

**Verification:**
- [ ] Build succeeds: `npm run build` (from `web/`)

---

## Task 5: Person page entry rules with source-aware Back link

**Description:** Finish Decision 140's contract — Accounts rows open the person page only for deactivated people, while active Accounts rows never navigate (Team rows already open it from Task 2) — and the Back link returns to the section the page was opened from instead of relying on browser history: Team entries go back to `/team`, Accounts entries to `/accounts`.

**Blocked by:** Task 2

**Status:** Not started

**Acceptance criteria:**
- [ ] A deactivated person's Accounts row opens their person page, and active Accounts rows never navigate to it
- [ ] Back from a person page opened via a Team row returns to `/team`, and via an Accounts row returns to `/accounts`

**Verification:**
- [ ] Build succeeds: `npm run build` (from `web/`)
