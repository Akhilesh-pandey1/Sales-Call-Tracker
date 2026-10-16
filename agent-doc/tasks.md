## Task 1: Team endpoint returns 30-day totals, hourly buckets, top people

**Description:** Extend `GET /api/dashboard/team` (services + schemas) with the three additive blocks the mockups need: `last_30_days` totals including deactivated people's calls, `calls_by_hour` as 24 IST buckets for each period, and `top_people` with at most 5 active salespeople by talk seconds per period. Covers `specs/dashboard.md` team requirements.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] The response carries `last_30_days`, `calls_by_hour` (24 IST hour buckets × today / yesterday / last_30_days), and `top_people` (max 5, highest talk seconds first) while `today`, `yesterday`, and `people` stay unchanged
- [x] A deactivated salesperson's past calls count in `last_30_days` totals, and their calls land in the correct IST hour buckets
- [x] `top_people` includes only active salespeople and omits anyone beyond the top 5

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_dashboard.py` (from `backend/`)

---

## Task 2: Person endpoint returns active_days

**Description:** Add `active_days` to the `last_30_days` block of `GET /api/dashboard/person/<id>` — the count of days with at least one dial inside the last 30 IST days. Covers `specs/dashboard.md` person KPI requirement.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] `last_30_days.active_days` counts days with at least one dial, computed server-side in IST
- [x] A person with no calls in 30 days returns `active_days` 0 while all existing fields stay unchanged

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_dashboard.py` (from `backend/`)

---

## Task 3: Leads summary returns stage split, uploaded, tackled counts

**Description:** Extend `GET /api/leads/summary` (services + schemas) with `waiting_by_attempts` (attempt counts 0/1/2 with `waiting` as their sum), `uploaded` and `tackled` for today and yesterday IST windows. Covers `specs/lead-management.md` summary requirement.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] `waiting_by_attempts` splits the waiting pool by attempt count and `waiting` equals its sum; `scheduled`, `connected`, `stopped`, and `people` stay unchanged
- [x] `uploaded` counts leads whose creation time falls in today's / yesterday's IST window
- [x] `tackled` counts distinct leads with at least one synced call in each window — never call counts

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_leads.py` (from `backend/`)

---

## Task 4: Web upgrades to the React 19 + Vite 8 dependency set

**Description:** Upgrade the whole web dependency set in one install to current stable — React 19 line, Vite 8 line, and every library bump — keeping the app working with zero behavior change. Versions come from `structure.md`; the developer runs the installs.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] `package.json` resolves the agreed set (react 19.3.1, vite 8.3.4, @vitejs/plugin-react 6.1.2, updated router/query/axios/radix/lucide) with npm's peer check passing
- [x] No source code changes are needed beyond what the upgrades require — every page still renders as before

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 5: Web builds on Tailwind v4 with the mockup theme

**Description:** Migrate the web to Tailwind CSS v4 — delete `tailwind.config.js` and `postcss.config.js`, register `@tailwindcss/vite` in `vite.config.ts`, and rewrite `index.css` with `@import "tailwindcss"`, `tw-animate-css`, and a `@theme` block carrying the mockup's indigo primary on lavender background tokens.

**Blocked by:** Task 4

**Status:** Done

**Acceptance criteria:**
- [x] No `tailwind.config.js` or `postcss.config.js` remains; the Vite plugin compiles all existing utility classes
- [x] The `@theme` tokens render the indigo-on-lavender look on every existing page with no component edits
- [x] Dialogs fade in and out — `tw-animate-css` restores the animations the old setup silently lacked

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 6: Web shell adopts the mockup sidebar layout

**Description:** Rework `dashboard-layout.tsx` into the mockup shell — brand with phone icon on top, MENU label, three links, Logout at the sidebar bottom, icon-only rail on mobile — add the shared `page-header.tsx` (title left, date or action right), and delete `navbar.tsx`. Covers `specs/user-management.md` shell behavior and Decision 84 as corrected.

**Blocked by:** Task 5

**Status:** Done

**Acceptance criteria:**
- [x] The sidebar shows brand, MENU label, Dashboard / Leads / Accounts links, and Logout at the bottom, collapsing to an icon rail on small screens
- [x] Each page renders its own slim top bar via `page-header.tsx` and `shared/components/navbar.tsx` no longer exists
- [x] Logout still clears the saved token and shows the login page

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 7: Lead upload shows a sonner toast on success

**Description:** Install and wire sonner (`<Toaster>` in providers) and replace the in-dialog upload result panel with a floating toast carrying the added / duplicates / invalid counts; the dialog closes on success. Covers `specs/lead-management.md` toast behavior (Decision 123).

**Blocked by:** Task 5

**Status:** Done

**Acceptance criteria:**
- [x] A successful upload shows a sonner toast with the three counts and closes the dialog
- [x] No in-dialog result panel remains; the pool summary still refreshes after upload

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 8: Team dashboard renders the period switch with four KPI cards

**Description:** Rebuild `team-page.tsx` around the shared `kpi-card.tsx`: a Today | Yesterday | 30 days pill switch driving four KPI cards (Dials, Connected, Not connected, Talk minutes) with per-active-person-per-day sub-lines, plus the team table regrouped into Today / Yesterday column groups. Covers `specs/dashboard.md` periods, KPI cards, and team table requirements.

**Blocked by:** Tasks 1, 5, 6

**Status:** Not started

**Acceptance criteria:**
- [x] The switch renders three periods and each selection drives the four cards without refetching the page
- [x] Not connected shows dials − connected, and each card's sub-line shows its per-active-person-per-day average
- [x] The team table lists every active salesperson with grouped Today / Yesterday columns, zeros included, sorted by today's dials, scrolling horizontally on narrow screens

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 9: Team dashboard renders the calls-by-hour chart with top people

**Description:** Add the Recharts bar chart of dials per IST hour — best hour highlighted, summary line under it, empty-period note — and the Top 5 by minutes list, both following the selected period. Covers `specs/dashboard.md` chart and top-people requirements (Decision 125).

**Blocked by:** Tasks 1, 8

**Status:** Not started

**Acceptance criteria:**
- [ ] The chart shows 24 IST hour bars for the selected period, dividing 30-day totals by 30 for the daily average, with the best hour highlighted and named in the summary line
- [ ] A period with zero dials shows "No calls in this period." instead of an empty chart with no best-hour highlight
- [ ] The Top 5 list shows at most five active people by talk minutes, highest first, for the selected period

**Verification:**
- [ ] Build succeeds: `npm run build` (from `web/`)

---

## Task 10: Person view renders the active-day KPI cards

**Description:** Add the initials avatar beside the person's name and the four last-30-day cards — Active days out of 30, Avg dials, Avg connected, Avg minutes — averaging per active day with totals as sub-lines and "—" when there are no active days. Covers `specs/dashboard.md` person view requirements (Decision 121).

**Blocked by:** Tasks 2, 5, 6

**Status:** Done

**Acceptance criteria:**
- [x] The header shows an initials avatar beside the person's name above a Back link
- [x] Each card divides the returned 30-day totals by `active_days` and shows the total as its sub-line; "26 / 30" style active-days display comes straight from the field
- [x] A person with zero active days shows "—" in all four cards with the no-calls message

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 11: Leads page renders the daily lead KPI cards

**Description:** Add the two daily cards — Leads Uploaded and Leads Tackled — each comparing against yesterday with a percentage change, reusing `kpi-card.tsx` exported from the dashboard feature. Covers `specs/lead-management.md` summary display (Decision 122).

**Blocked by:** Tasks 3, 5, 6

**Status:** Done

**Acceptance criteria:**
- [x] The uploaded card shows today's count against yesterday's with a percentage change
- [x] The tackled card shows today's count against yesterday's with a percentage change
- [x] A zero yesterday hides the percentage pill and reads "vs 0 yesterday"

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 12: Leads page renders the five pool stages with the composition bar

**Description:** Rebuild `lead-pool-stats.tsx` into the Active Lead Pool card — five stage cards (Waiting 0/1/2 calls, Scheduled, Stopped) fed by `waiting_by_attempts`, a colored composition bar across the stages, and the total-active-leads chip. Covers `specs/lead-management.md` summary display (Decision 122).

**Blocked by:** Tasks 3, 11

**Status:** Not started

**Acceptance criteria:**
- [ ] The five stage cards show their counts from the waiting split and the other buckets
- [ ] The composition bar segments the pool by stage with a legend, and the chip shows the stage total
- [ ] A completely empty pool shows all zeros with the existing "No leads in calling pool" prompt

**Verification:**
- [ ] Build succeeds: `npm run build` (from `web/`)

---

## Task 13: Accounts list shows the count header with the You badge

**Description:** Add the accounts count ("8 accounts · 7 active") to the card header and the "You" badge on the manager's own row, restyling deactivated rows per the theme. Covers `specs/user-management.md` header requirement (Decision 124).

**Blocked by:** Tasks 5, 6

**Status:** Done

**Acceptance criteria:**
- [x] The card header shows the total and active account counts
- [x] The manager's own row carries a "You" badge with no action buttons
- [x] Deactivated rows stay greyed out with their Activate action reachable

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)
