## Task 1: The team's Day by day graph on the Dashboard

**Description:** The manager reads the last 30 days as one bar per day below the Calls by hour block. `GET /api/dashboard/team/daily` computes the 30 IST day rows on the server (shared IST day-window helper moves into `core/utils.py`), and the Dashboard renders them as a fixed graph the period switch does not touch.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] `GET /api/dashboard/team/daily` (manager-only, Bearer) returns exactly 30 rows, oldest day first, a day with no calls at zeros — dials and connected count outgoing calls only, minutes counts outgoing and incoming together, and calls by deactivated salespeople stay counted (`specs/dashboard.md` — "Team day-by-day graph", `api.md` — team daily).
- [x] The Dashboard shows the Day by day graph below the Calls by hour block: 30 bars, oldest day left, connected calls as the green segment, dials count on top, an empty bar at zero, and no date picking anywhere (`specs/dashboard.md` — "Team day-by-day graph" scenarios).
- [x] A salesperson token gets `"This dashboard is for managers."` from the endpoint.

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_dashboard.py -q` in `backend/`
- [x] Build succeeds: `npm run build` in `web/`

## Task 2: The person's Day by day graph on the Person View

**Description:** `GET /api/dashboard/person/<id>/daily` returns the same 30-day shape for one person, and the Person View renders the graph below the Call Split section, built only from that person's calls.

**Blocked by:** Task 1

**Status:** Not started

**Acceptance criteria:**
- [ ] The endpoint (manager-only) returns the same 30 rows for the person; an unknown id gets 404 `"User not found."` (`specs/dashboard.md` — "Person day-by-day graph", `api.md` — person daily).
- [ ] The Person View shows the graph below the Call Split donut; an incoming-only day renders an empty bar at zero, and no period switch touches it (`specs/dashboard.md` — "Person day-by-day graph" scenarios).
- [ ] A salesperson token gets `"This dashboard is for managers."` from the endpoint.

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_dashboard.py -q` in `backend/`
- [ ] Build succeeds: `npm run build` in `web/`

## Task 3: Team-wide log downloads from the day heading icons

**Description:** The new `logs` module (routes, schemas, services — no models) serves `GET /api/logs/team?day=today|yesterday` as an Excel-safe CSV of every stored call of that day, and the Team page's Today and Yesterday heading icons download it in one click.

**Blocked by:** Task 1

**Status:** Not started

**Acceptance criteria:**
- [ ] The CSV carries the ten columns in order, both directions, UTF-8 BOM, escaped notes, salespersons name A to Z with each person's calls oldest first, headers-only when the day is empty, filename `call-logs-<date>.csv` (`specs/call-log-downloads.md` — "The log downloads", "Every file carries the same ten columns", "Excel-safe files").
- [ ] The two heading icons save the file directly; a failure keeps the manager on the page with `"Could not download the logs."` and saves no partial file (`specs/call-log-downloads.md` — "Download failure handling").
- [ ] A wrong `day` value returns 400 `"day must be today or yesterday."` and a salesperson token gets 403 `"This dashboard is for managers."`.

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_logs.py -q` in `backend/`
- [ ] Build succeeds: `npm run build` in `web/`

## Task 4: The Person Logs screen opened by View logs

**Description:** "View logs" beside the Back link above the KPI cards opens the Person Logs screen listing every stored call of that person's last 30 days as rows; `GET /api/logs/person/<id>` serves the JSON rows behind it.

**Blocked by:** Task 3

**Status:** Not started

**Acceptance criteria:**
- [ ] The endpoint (manager-only) returns JSON rows newest call first, both directions, with `phone_number`, `date`, `time`, `direction`, `connected`, `minutes`; 401, 403, and 404 `"User not found."` per `api.md`.
- [ ] The Person Logs screen lists one row per call — number, date, time, direction, connected, minutes — and shows `"No calls in the last 30 days."` when the window is empty (`specs/call-log-downloads.md` — "View logs on the person page").
- [ ] The person page header keeps only the date, with the "View logs" button beside the Back link above the KPI cards.

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_logs.py -q` in `backend/`
- [ ] Build succeeds: `npm run build` in `web/`

## Task 5: The 30-day log download inside Person Logs

**Description:** `GET /api/logs/person/<id>/download` builds the same ten-column CSV for that person's last 30 days (an optional `?day=` narrows it later), and the "Download logs" button at the Person Logs heading saves it in one click.

**Blocked by:** Task 4

**Status:** Not started

**Acceptance criteria:**
- [ ] Without `day` the file covers the last 30 days including today — oldest call first, ten columns, UTF-8 BOM, escaped notes, filename `call-logs-<name>-<today's IST date>.csv` (`api.md` — person download, `specs/call-log-downloads.md` — "Person file saves").
- [ ] The button click saves the file; a failure keeps the manager on the Person Logs screen with `"Could not download the logs."` and saves no partial file.
- [ ] A salesperson token gets 403 and an unknown id gets 404 `"User not found."`.

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_logs.py -q` in `backend/`
- [ ] Build succeeds: `npm run build` in `web/`

## Task 6: Per-person day downloads from the Team rows

**Description:** Every Team table row gets a small download icon at the right edge of its Today group and its Yesterday group saving that person's calls for that single day via the download endpoint's `day` parameter; the mobile cards carry the same two chips.

**Blocked by:** Task 5

**Status:** Not started

**Acceptance criteria:**
- [ ] `?day=today` or `?day=yesterday` narrows the file to that single IST day with the filename carrying that day's date; any other value returns 400 `"day must be today or yesterday."` (`api.md` — person download, `specs/call-log-downloads.md` — "One person's day file saves").
- [ ] One click on a row icon saves that person's that-day file; tapping the row itself still opens the Person View.
- [ ] The mobile cards expose the same two downloads, and a failure keeps the manager on the page with `"Could not download the logs."`.

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_logs.py -q` in `backend/`
- [ ] Build succeeds: `npm run build` in `web/`
