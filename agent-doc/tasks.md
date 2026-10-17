## Task 1: Office-hours window storage with manager endpoints

**Description:** Add the `office_hours` table (one row, defaults 10:00–19:00 IST stored as minutes since midnight) and the `settings` module with `GET /api/settings/office-hours` and `PUT /api/settings/office-hours` — manager-only, HH:MM validation with end after start. Covers `specs/office-hours.md` window and validation requirements.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] A fresh database answers GET with 10:00 / 19:00, and a valid PUT is saved and returned by the next read
- [x] PUT refuses an end not after start with "End time must be after start time." and a missing or non-HH:MM body with "Invalid request format: start_time and end_time required."
- [x] A salesperson token gets 403 "This setting is for managers." on both endpoints

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_settings.py` (from `backend/`)

---

## Task 2: Call sync keeps only calls inside office hours

**Description:** Extend call ingestion so a synced call is kept only when its IST start minute falls inside the stored window, both ends inclusive — judged on the call's own start time, never the sync moment. Outside calls are dropped with a warning log while the server still answers `{"status": true}` so the app clears its queue. Covers `specs/office-hours.md` gate requirement.

**Blocked by:** Task 1

**Status:** Done

**Acceptance criteria:**
- [x] Under the 10:00–19:00 window, calls starting 09:59 are dropped while 10:00, 18:59, and 19:00 are saved
- [x] A call starting 19:01 is dropped with a log line, and every dropped row still lets the batch answer success
- [x] After the manager updates the window, the next sync uses the new window

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_calls.py` (from `backend/`)

---

## Task 3: Team endpoint returns per-period computed blocks

**Description:** Restructure `GET /api/dashboard/team` to the per-period shape — each period object carries its totals plus server-computed `not_connected`, `minutes`, `connected_percent`, `avg_per_person_per_day`, and `vs_yesterday` (today only), its own `calls_by_hour` (`hours` spanning the office window, `dials`, `best_hour`, 30-day values as daily averages) and `top_people` with `minutes`. The `people` list is removed while active salespeople are still counted internally for the averages. Covers `specs/dashboard.md` team requirements (Decisions 129–131).

**Blocked by:** Task 1

**Status:** Done

**Acceptance criteria:**
- [x] Each period object carries its own totals, computed KPIs, calls_by_hour, and top_people, matching the shapes and formulas in `api.md`
- [x] `calls_by_hour.hours` spans the office-hours window start to end inclusive, `best_hour` is the highest-count hour or null with no calls, and last_30_days dials hold per-day averages
- [x] The response carries no `people` array, deactivated people's calls stay counted, and top_people holds at most 5 active people with seconds and minutes

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_dashboard.py` (from `backend/`)

---

## Task 4: Person endpoint returns per-period computed blocks

**Description:** Extend `GET /api/dashboard/person/<id>` so every period object carries `not_connected` and `minutes`, last_30_days adds `avg_per_active_day` (null when active_days is 0), every period carries its own `calls_by_hour` block on the office window, and `top_numbers` entries add `minutes`. Covers `specs/dashboard.md` person requirements (Decisions 129, 130, 135).

**Blocked by:** Task 3

**Status:** Done

**Acceptance criteria:**
- [x] Each period carries not_connected and minutes, and last_30_days returns avg_per_active_day that is null when active_days is 0
- [x] Every period carries a calls_by_hour block with office-hours hours, per-hour counts, and best_hour
- [x] top_numbers holds at most 5 numbers each with seconds, minutes, and call count

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_dashboard.py` (from `backend/`)

---

## Task 5: Team page renders server-computed period blocks

**Description:** Rework `team-page.tsx` to render the selected period object only — the four KPI cards show returned totals with `avg_per_person_per_day` sub-lines and `vs_yesterday` deltas on Today, and the chart renders the returned `calls_by_hour` block with "10 AM" labels as the only formatting. The team table is removed with the `people` list gone. Covers `specs/dashboard.md` team and server-side computation requirements (Decision 129).

**Blocked by:** Task 3

**Status:** Done

**Acceptance criteria:**
- [x] The four cards render returned values — no subtraction, division, average, or delta math remains in web code
- [x] The chart renders the returned hours, counts, and best_hour directly, showing "No calls in this period." when best_hour is null
- [x] The team table and all client-side computation helpers are deleted; every widget builds from the one selected period object

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 6: Person page renders server-computed stats with the calls-by-hour chart

**Description:** Rework `person-page.tsx` to render returned values — the four cards show `active_days` and `avg_per_active_day` with period totals as sub-lines and "—" when null, the performance table shows returned `minutes` and `connected_percent`, and the shared calls-by-hour chart component renders the per-period `calls_by_hour` block. Covers `specs/dashboard.md` person requirements (Decisions 129, 135).

**Blocked by:** Tasks 4, 5

**Status:** Not started

**Acceptance criteria:**
- [ ] The four cards render returned averages — no client-side division by active_days remains
- [ ] The performance table renders returned minutes and connected_percent with "—" where null
- [ ] The person page shows the same chart component reading the returned calls_by_hour block

**Verification:**
- [ ] Build succeeds: `npm run build` (from `web/`)

---

## Task 7: Accounts page gains the office-hours editor

**Description:** Add the small office-hours editor to the Accounts screen — the manager sees the current window and saves a new start and end time, with refused saves surfacing the API's messages. Covers `specs/office-hours.md` editing behavior (Decision 132).

**Blocked by:** Task 1

**Status:** Done

**Acceptance criteria:**
- [x] The editor opens showing the stored window and saves a valid change with a confirmation toast
- [x] Refused saves show the API messages ("End time must be after start time." / invalid format) without closing the editor

**Verification:**
- [x] Build succeeds: `npm run build` (from `web/`)

---

## Task 8: My Stats renders returned talk minutes

**Description:** Switch the app's My Stats screen from dividing `seconds` by 60 to rendering the `minutes` field the reshaped person response now provides; everything else on the screen stays as is. Covers `specs/dashboard.md` server-side computation requirement (Decision 129) with the app otherwise unchanged (Decision 136).

**Blocked by:** Task 4

**Status:** Not started

**Acceptance criteria:**
- [ ] Talk-minutes values on My Stats come from the returned `minutes` field and the seconds-division helper is gone
- [ ] Dials, connected, and connected_percent still render as before against the reshaped per-period response

**Verification:**
- [ ] Lint passes: `npm run lint` (from `app/`)
