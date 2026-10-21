## Task 1: Server — the sync accepts direction

**Description:** The `calls` table and the sync endpoint learn the `direction` column (`outgoing` / `incoming`), so an answered incoming call is stored as work but never moves a lead.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] The `calls` model and the sync path carry an optional `direction` (`outgoing` is the default, so old rows read outgoing); incoming calls save under the token owner's ID (`api.md` §2; `database.md` — `calls.direction`).
- [x] An incoming call never creates or resolves a lead and never burns an attempt (`api.md` §2 Processing; `testing.md` — `test_calls.py` incoming tests).
- [x] The office-hours gate drops outside-window calls in both directions and still answers success (`api.md` §2).

**Verification:**
- [x] Focused tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests/modules/test_calls.py -q`
- [x] All backend tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests -q`

## Task 2: Server — a future booking locks its lead

**Description:** A lead booked by one salesperson refuses another person's schedule submitted through the sync: the call is saved, the booking stays, and the refused call's id returns in `schedule_refused_call_ids`.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] A schedule on a lead whose future booking belongs to another salesperson is refused: the call is saved, the lead keeps the owner's booking, and the call's id comes back in `schedule_refused_call_ids` (Decision 5; `api.md` §2 Response; `testing.md` — refused-schedule test).
- [ ] The booking's owner re-books freely (a new time replaces the old); a `done` or `stopped` lead has no active booking, so anyone may book it — it lifts back to `waiting` owned by the scheduler (Decision 5).
- [ ] Resolve on a call never clears another user's booking — after a refused call the lead still holds the owner's booking (`testing.md` — the lead keeps the owner's booking).

**Verification:**
- [ ] Focused tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests/modules/test_calls.py -q`
- [ ] All backend tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests -q`

## Task 3: Server — expired bookings free before serving

**Description:** A `waiting` lead whose booking is more than `SCHEDULE_EXPIRE_HOURS` = 24 hours past its time returns to the pool before any lead is served — the lazy check, same pattern as the 10-minute claim.

**Blocked by:** 2

**Status:** Not started

**Acceptance criteria:**
- [ ] `SCHEDULE_EXPIRE_HOURS = 24` lives in `backend/app/config/base.py`; before serving, every `waiting` lead booked more than 24 hours past its `scheduled_at` gets `scheduled_at` and `scheduled_by` cleared, attempts untouched (Decision 4; `testing.md` — frees expired bookings before serving).
- [ ] A booking inside the 24-hour window keeps the lead reserved; freed leads return to the newest-first pool (Decision 4).
- [ ] The check never looks at the owner's active state, so a deactivated person's stuck bookings return to the pool through the same rule (Decision 4).

**Verification:**
- [ ] Focused tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests/modules/test_leads.py -q`
- [ ] All backend tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests -q`

## Task 4: Server — team dashboard carries the split

**Description:** The team endpoints compute every number with direction: outgoing-only dials/connected, total-talk minutes, the `talk_totals` split, and stacked chart arrays — the web only formats them.

**Blocked by:** 1

**Status:** Not started

**Acceptance criteria:**
- [ ] Every team period carries `dials`/`connected`/`not_connected` counting OUTGOING calls only, `seconds`/`minutes` as TOTAL talk (`round(seconds/60, 2)`), `connected_percent`, `avg_per_person_per_day`, and `vs_yesterday` only on today (`api.md` §3 team Rules).
- [ ] `talk_totals` and `calls_by_hour` carry `hours`, `outgoing`, `incoming`, and `best_hour` by total calls; `last_30_days` holds per-day averages; `top_people` ranks by TOTAL talk seconds (`api.md` §3; `testing.md` — test_dashboard.py list).
- [ ] `GET /api/dashboard/team/people` returns one row per active salesperson with only `dials`, `connected`, `minutes` — dials/connected outgoing-only, minutes total talk, no `seconds`; zero-call salespeople included, deactivated excluded, sorted by today's dials (`api.md` §3 team/people).

**Verification:**
- [ ] Focused tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests/modules/test_dashboard.py -q`
- [ ] All backend tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests -q`

## Task 5: Server — person dashboard carries the split

**Description:** The person endpoint computes the same direction-aware numbers for one user — the single source My Stats and the manager's person view both render.

**Blocked by:** 4

**Status:** Not started

**Acceptance criteria:**
- [ ] Every person period carries outgoing-only dials/connected, total-talk `seconds`/`minutes`, `connected_percent`, `talk_totals`, and `calls_by_hour` with `outgoing`/`incoming` arrays + `best_hour` by total (`api.md` §3 person; Decision 14).
- [ ] `active_days` counts only days with at least one outgoing dial; `avg_per_active_day` divides exact total talk minutes by `active_days` and is `null` at 0 active days (`api.md` §3 person Rules).
- [ ] `top_numbers` ranks by TOTAL talk seconds in the last 30 days with `minutes` alongside `seconds` (`api.md` §3; `testing.md` — top-numbers test).

**Verification:**
- [ ] Focused tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests/modules/test_dashboard_person.py -q`
- [ ] All backend tests pass: `backend/venv/Scripts/python.exe -m pytest backend/tests -q`

## Task 6: App — My Stats shows the incoming/outgoing split

**Description:** My Stats renders the server's new numbers: the donut with its numbers line, ONE stacked two-color bar per hour, and total-talk KPI wording — the phone only draws.

**Blocked by:** 5

**Status:** Not started

**Acceptance criteria:**
- [ ] `stats.api.ts` types carry `talk_totals` and the chart's `outgoing`/`incoming` arrays; the donut renders `talk_totals` with its numbers line, e.g. "Outgoing 142 calls · 310 min — Incoming 37 calls · 52 min" (Decision 14; screen `08-my-stats--M.html`).
- [ ] The hour chart draws ONE stacked bar per hour — total height = all calls that hour, two color segments sized by share, counts written inside the segments — and the best-hour highlight follows total calls (Decision 14).
- [ ] The Avg minutes card holds total talk per active day and the performance table's Minutes column holds total talk — all values come from the server, the screen formats only (Decision 14).

**Verification:**
- [ ] Lint passes: `npm run lint` in `app/`
- [ ] Types pass: `npx tsc --noEmit` in `app/`

## Task 7: App — the call-log sweep tracks outside calls

**Description:** At every app open the app sweeps Android's call log past the sweep line, saves answered incoming and outgoing calls it did not already count, pushes them, and cleans up behind itself — nothing counted twice.

**Blocked by:** 1

**Status:** Not started

**Acceptance criteria:**
- [ ] `pending_calls` gains `direction` and `synced` columns (in-place migration via the existing PRAGMA pattern), `sweep_state` is created with its one row seeded at the install moment — nothing historical uploads (Decision 7; `database.md` §2).
- [ ] The sweep reads answered INCOMING and OUTGOING entries newer than `last_swept_at`, normalizes numbers to E.164 with the login country, skips entries matching existing rows (synced or pending) by normalized number inside the match window, and moves the line in the SAME SQLite transaction that inserts the rows (Decisions 6–7).
- [ ] The app-open pipeline runs janitor → sweep → sync; a successful sync MARKS rows `synced = 1` instead of deleting (submit path and batch push alike); cleanup after a successful push deletes synced rows behind the sweep line, never inside the window (Decisions 8, 10, 12).

**Verification:**
- [ ] Lint passes: `npm run lint` in `app/`
- [ ] Types pass: `npx tsc --noEmit` in `app/`

## Task 8: App — do-not-track numbers never count as work

**Description:** The salesperson lists numbers in Settings; the sweep checks the list before inserting in both directions, so a listed number never counts in any direction.

**Blocked by:** 7

**Status:** Not started

**Acceptance criteria:**
- [ ] The `do_not_track` table and its db helpers exist; numbers save in E.164 via the same libphonenumber-js call and login country — 10 typed digits are allowed (Decision 9; `database.md` §2).
- [ ] The sweep checks the list BEFORE inserting in both directions — a listed number never enters `pending_calls`, so no dial, minute, or active day (Decision 8).
- [ ] Settings gains the "Do not track numbers" row opening the list screen per `09b-do-not-track--M.html`: add a number (with normalize-on-save) and remove from the list.

**Verification:**
- [ ] Lint passes: `npm run lint` in `app/`
- [ ] Types pass: `npx tsc --noEmit` in `app/`

## Task 9: App — refused booking shows a toast

**Description:** When the sync refuses this salesperson's schedule because someone else holds the booking, the app says so at the Submit moment.

**Blocked by:** 2, 7

**Status:** Not started

**Acceptance criteria:**
- [ ] `syncCalls` returns the sync response body and the post-call submit path reads `schedule_refused_call_ids` (`api.md` §2 Response).
- [ ] The submitted call's id in the refused list shows the toast "This lead is already booked by someone else." — the call itself is still sent (`testing.md` — manual pass list).

**Verification:**
- [ ] Lint passes: `npm run lint` in `app/`
- [ ] Types pass: `npx tsc --noEmit` in `app/`

## Task 10: App — booked leads set a reminder alarm

**Description:** The moment a booking is made at Submit, the phone sets one exact local alarm with @notifee; the alarm cancels when that number is called and rebuilds at every app open.

**Blocked by:** 9

**Status:** Not started

**Acceptance criteria:**
- [ ] `@notifee/react-native` is installed (Decision 1 names it); a post-call Submit carrying a schedule inserts a `scheduled_reminders` row and sets ONE exact timestamp trigger — "Time to call" with the lead's number (Decisions 1, 3; `database.md` §2 `scheduled_reminders`).
- [ ] Submitting a call to the booked number cancels that lead's alarm, matched by normalized number; alarms rebuild at every app open from `scheduled_reminders`, so they survive reboot (Decision 2).
- [ ] Android 13+ POST_NOTIFICATIONS is asked once at the first booking; declined keeps bookings working with no reminders and no nagging; tapping the notification opens the dialer with the booked lead's number ready to call (Decisions 1, 3).

**Verification:**
- [ ] Lint passes: `npm run lint` in `app/`
- [ ] Types pass: `npx tsc --noEmit` in `app/`

## Task 11: Web — team dashboard shows the split

**Description:** The manager's web dashboard renders the server's split numbers: total talk minutes, stacked hour bars with the split summary line, and Top 5 by total talk.

**Blocked by:** 4

**Status:** Not started

**Acceptance criteria:**
- [ ] The dashboard types carry `talk_totals` and the chart's `outgoing`/`incoming` arrays; the Talk minutes card and Top 5 render total talk, ranking by total talk minutes (Decision 15).
- [ ] The hour chart draws ONE stacked two-color bar per hour and its summary line shows the split, e.g. "142 outgoing · 37 incoming", per screen `02-dashboard--P.html` (Decision 15).
- [ ] Team rows keep dials · connected · minutes with minutes as total talk — all rendered from server values (Decision 15).

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`

## Task 12: Web — person view shows the split

**Description:** The manager's person view renders the same person endpoint as My Stats: donut with numbers line, stacked hour chart, total-talk KPIs.

**Blocked by:** 5, 11

**Status:** Not started

**Acceptance criteria:**
- [ ] The person view renders the `talk_totals` donut with its numbers line and the stacked hour chart through the shared chart component, per screen `04-person-view--P.html` (Decision 15).
- [ ] KPI cards, the performance table, and top numbers render server values only — the web computes nothing (Proposal — the web only formats what it receives).

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
