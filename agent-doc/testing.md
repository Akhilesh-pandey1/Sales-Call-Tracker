# Testing Specifications

Automated tests live in the backend API using `pytest`. Mobile testing is handled through the dedicated tracking spike checklist on physical Android devices.

---

## 1. Backend Automated Tests (`backend/tests/`)

### `tests/modules/test_auth.py`
- Valid login returns token, user ID, role, name, country.
- Invalid password returns 401 `"Wrong name or password."`.
- Correct credentials on deactivated account returns 403 `"Your account is not active. Please contact your manager."`.
- 10 consecutive failed attempts locks out the name for 5 minutes (429 `"Too many tries. Wait 5 minutes and try again."`), blocking even the correct password.

### `tests/modules/test_calls.py`
- Single batch inserts multiple valid calls and associates them with the token owner's user ID.
- Duplicate `call_id`s in subsequent batches are skipped silently without error or duplication.
- Calls older than 3 days (`MAX_CALL_AGE_DAYS`) are discarded with a server log line.
- A call starting 09:59 IST is discarded with a server log line; 10:00 is saved (window start inclusive).
- A call starting 18:59 and exactly 19:00 IST are saved; 19:01 is discarded (window end inclusive).
- After the manager updates the office hours window, the gate uses the new window on the next sync.
- Malformed call rows are skipped while valid rows in the same batch are saved.
- Calls sync without an outcome; the `outcome` column stays empty on every saved row.
- A sync item with `direction: 'incoming'` is saved with direction incoming; it never creates or resolves a lead and never burns an attempt.
- The office-hours gate applies to incoming calls the same as outgoing — an outside-window incoming call is discarded with a log line.
- A call to a number with no lead creates that lead as `waiting` and resolves it from the same call — connected marks it `done`, not connected burns attempt 1.
- A second sync for a number that already has a lead never creates a second lead.
- A call item with `scheduled_at` inside 30 days schedules the resolved lead; the call is saved.
- A `scheduled_at` on a call that connects still books the lead — the lead ends `waiting` and scheduled, never `done`; the call is saved.
- A schedule lifts a `done` or `stopped` lead back to `waiting` with the schedule set, attempts untouched.
- A `scheduled_at` from a salesperson other than the booking's owner is refused: the call is saved, the lead keeps the owner's booking, and the refused call's id comes back in `schedule_refused_call_ids`.
- The booking's owner re-schedules their own lead freely — the new time replaces the old.
- A past or beyond-30-days `scheduled_at` is skipped with a log line; the call is still saved.
- Returns `{"status": true, "schedule_refused_call_ids": []}` on success.

### `tests/modules/test_dashboard.py`
- All date boundaries for "today", "yesterday", and "last_30_days" match IST (Asia/Kolkata) calendar days over UTC call timestamps.
- Each period object carries its own totals, computed KPIs, `calls_by_hour`, and `top_people`; the team response has no `people` array.
- `not_connected` equals `dials - connected`; `minutes` equals `round(seconds / 60, 2)` where `seconds` is TOTAL talk time — outgoing plus incoming.
- `dials`, `connected`, and `not_connected` count outgoing calls only; incoming calls never enter them.
- `connected_percent` returns `null` when a period has 0 dials, otherwise the rounded percent.
- `avg_per_person_per_day` divides each metric by the period day count and the active salesperson count, then rounds.
- `vs_yesterday` exists only on `today`, holds today minus yesterday in the displayed unit, and is `null` on the other two periods.
- `calls_by_hour.hours` spans the office hours window start-to-end inclusive; `outgoing` and `incoming` hold one count per hour; `best_hour` follows total calls and is `null` when the period has no calls.
- `talk_totals` carries the outgoing/incoming calls and minutes plus the two rounded percentages of total talk minutes, on every period of the team and person responses.
- The `last_30_days` `calls_by_hour` holds `round(total / 30)` per hour in both series.
- Calls by deactivated salespeople stay counted in every period total.
- `active_days` counts days with at least one OUTGOING dial; a day with only incoming calls is not active.
- `avg_per_active_day` is `null` when `active_days` is 0, otherwise the rounded per-active-day averages over total talk minutes.
- Top 5 numbers return the highest TOTAL talk-time numbers (both directions) with `minutes` alongside `seconds`.
- `GET /api/dashboard/team/people` returns one row per active salesperson with today and yesterday blocks holding only `dials`, `connected`, and `minutes` — dials and connected outgoing-only, minutes total talk, no `seconds` anywhere.
- People rows include zero-call salespeople, exclude deactivated salespeople, and arrive sorted by today's dials highest first.
- A salesperson token gets 403 on `GET /api/dashboard/team/people`.

### `tests/modules/test_settings.py`
- GET returns the stored window as `start_time` / `end_time` `HH:MM` strings.
- PUT updates the window, and the next call sync and chart immediately use the new window.
- PUT with `end_time` not after `start_time` returns 400 `"End time must be after start time."`.
- PUT with a malformed body or non-`HH:MM` values returns 400.
- A salesperson token gets 403 on both GET and PUT.

### `tests/modules/test_users.py`
- Manager creates a salesperson with unique name, password (8+ chars, upper/lower), and country code.
- Duplicate name on create or edit returns 400 `"That name is already taken."`.
- Editing password generates a new session token, invalidating old sessions.
- Deactivating an account sets `is_active = false` and revokes session.
- Self-deactivation and self-deletion by the manager are rejected with 400 `"You cannot do this to your own account."`.
- Permanent delete removes the user and cascades to delete all their call rows.

### `tests/modules/test_leads.py`
- **CSV Upload**: Valid numbers are added as E.164; duplicates within the file, unparseable numbers, and existing pool numbers are skipped with counts returned. Files over 2 MB are rejected with 400 `"File is too large."`.
- **Calling Loop (`POST /api/leads/next`)**:
  - Serves current active claim first if still valid.
  - Serves due scheduled leads reserved for the calling salesperson before new pool leads.
  - Serves newest available leads (`created_at DESC`) when no due schedules exist.
  - Claims the served lead for 10 minutes (`CLAIM_MINUTES`).
  - Supports scheduling current lead and fetching next in a single request; a schedule books the lead whatever its state — `done` and `stopped` included, ending `waiting` with the retry lock and claim cleared — the scheduler owns the reservation, and a schedule clears a claim held by a different salesperson.
  - The hourly expiry job frees expired bookings: a lead still `waiting` booked more than 24 hours past its time (`SCHEDULE_EXPIRE_HOURS`) returns to the pool with attempts untouched; a booking inside the 24-hour window stays reserved.
  - Serving a lead never frees expired bookings — a lead whose booking just expired stays invisible in the pool until the job runs.
  - The scheduler never starts under pytest.
  - `continue_calling: false` stores the schedule (if supplied) and releases the claim but serves and claims no lead — the response `lead` is `null`.
- **Resolution via Call Sync**:
  - Connected call (`duration > 0`) marks lead `status = 'done'`.
  - Unconnected call (`duration == 0`) increments attempt count and locks for 2 hours (`RETRY_LOCK_HOURS`).
  - 3rd unconnected attempt marks lead `status = 'stopped'`.
- **Manager Summary**:
  - Pool bucket counts (waiting, scheduled, connected, stopped) are mutually exclusive.
  - `waiting_by_attempts` splits the waiting pool by attempt count, and `waiting` equals its sum.
  - `uploaded` counts leads by `created_at`; `tackled` counts distinct leads with a synced call — both for the today and yesterday IST windows.
  - Per-person lead call counts for today match recorded calls.

---

## 2. Mobile Android Spike Checklist

The tracking spike verifies the complete dialer and call-log pipeline on the oldest target Android phone before UI construction:
1. Normal answered call records actual talk time (not ring time).
2. Unanswered dial records duration 0.
3. Long ring (3 minutes) before answer matches within the 1-minute window.
4. Two quick successive calls to the same number match in order.
5. Incoming call from the same number is ignored (OUTGOING calls only).
6. App killed mid-call completes via the 1-hour janitor on the next app open.
7. Call-end listener opens the post-call popup upon hang-up.
8. Submit-click read records the real duration even when the phone writes its call-log entry late (vendor delay) — a 15-second connected call shows 15 seconds on the dashboard, never 0.

---

## 3. App Calling & Navigation — Manual On-Device Pass

The app has no automated UI tests; the calling and navigation fixes are verified by hand on a real phone:
- Tapping Call starts the call at once in the Android calling screen — no other dialer app, no second confirm tap.
- With CALL_PHONE off, the Call button hands the number to the phone's own dialer (one extra tap there) and no intent row is written.
- When a call ends, the post-call popup is already open on return to the app: a lead call shows the schedule question with "Do not schedule" pre-selected and "Go to next call" pre-checked; a keypad call shows the dialed number with the same schedule question.
- Returning to the app while the call is still running shows no popup — it appears only after the call has ended.
- Tapping the follow-up field opens the native date picker first, then the native time picker; past dates and dates beyond 30 days cannot be picked.
- Tapping Submit sends the call, and a 15-second connected call shows 15 seconds of talk time on the dashboard — never 0.
- With airplane mode on, Submit saves the row on the phone with its duration; with internet back, the next app open bulk-sends it and the row is deleted.
- Unchecking "Go to next call" and submitting stops the automated loop — no new lead is served until Start calling is tapped again.
- Submit with "Go to next call" checked starts the next lead's call immediately.
- Tapping outside the post-call popup or pressing the back button does nothing — Submit is the only way through, for lead and keypad calls alike.
- Tapping Log out on the Settings screen sends any unsent calls first and returns to the Login screen; with airplane mode and unsent calls it shows how many are waiting and stays logged in.
- The My Stats calls-by-hour chart opens on Today.
- The tab bar shows five tabs with icons — Dialer, Scheduled, History, My Stats, Settings — and the My Stats header has no gear button.
- No screen draws content under the status bar (Login, Dialer, Scheduled, History, My Stats, Settings).
- The Settings "Clear local data" row shows its full title and description, and tapping it opens the confirm dialog.
- Holding the dialer backspace clears the whole typed number; a single tap still deletes one character.
- My Stats shows the Last-30-days KPI cards, the performance table, and the Calls-by-hour chart with its period switch — and no most-contacted-numbers table.
- Every screen keeps a slim 12px side margin.
- Booking a lead shows the notification-permission ask once on Android 13+; declining keeps booking working with no reminders.
- With the app closed, the phone shows "Time to call" with the lead's number at the booked time; tapping it opens the booked lead's card ready to call.
- After a phone reboot, opening the app restores reminders for still-future bookings.
- Submitting a call to the booked number cancels that lead's reminder.
- Submitting a schedule on a lead booked by another salesperson shows "This lead is already booked by someone else." and the call itself is still sent.
- With the app closed, an answered incoming call and a call made from the phone's own dialer both appear on the dashboards at the next app open — the sweep caught both.
- A number on the Do-not-track list produces no row in either direction; removing it from the list lets the sweep track it again.
- A call dialed from our app is never counted twice by the sweep.
- With airplane mode, swept calls wait on the phone and arrive at the next open with internet; after a successful push, synced rows behind the sweep line are gone from the phone.
- A number typed as 10 digits in the Do-not-track list saves in international format (+91...) and can be removed again.
- My Stats shows the donut with its numbers line and ONE stacked two-color bar per hour; the counts sit centered inside their segments, and Minutes on the table means total talk.
- Both hour charts — web and app — show the dot legend under the bars: blue dot = outgoing, green dot = incoming.
- Settings shows the fourth row listing the phone's SIM numbers; picking one saves it, marks it with a checkmark, and every later call leaves on that number with no SIM picker.
- With no number picked, a call goes out on Android's default SIM.
- After the SIMs are swapped between slots, the next call still leaves on the stored number.
- Removing the chosen SIM from the phone blocks the call with "This SIM number is not in the phone." — nothing is dialed or recorded; picking again in Settings fixes it.
- The reminder notification shows the white phone icon in the status bar and the full-color app icon in the notification drawer.
- The History tab backfills from the phone's call log on its first open, shows newest first, 50 rows per page with Load-more; Do-not-track numbers never appear.
- A History row shows the number, an out or in mark, the time, and the result; Copy shows "Number copied."; the WhatsApp button opens the chosen app on that number's chat; a booked number carries the Scheduled badge.
- A call made while the app was closed appears in History at the next tab open; past 1000 rows, the oldest row disappears as a new one arrives.
- The Scheduled tab lists bookings Due first, then Upcoming soonest first, and shows "You have N leads you have not called." with the count as a badge on the tab.
- Tapping a Scheduled row opens the booked lead's card ready to call; tapping the notification removes that row; the row also leaves when the number is called or 24 hours pass its booked time.
- Submitting the keypad post-call popup clears the typed number to blank; the Automated card keeps its number and its Copy button copies it with "Number copied."
- Settings shows the WhatsApp app row (WhatsApp or WhatsApp Business, WhatsApp preselected) and the First message row; with the switch on, the WhatsApp button opens the chat with the text pre-typed; a missing chosen app shows "WhatsApp is not installed."
- Tapping a number in Contacts, WhatsApp, and the browser shows our app in Android's chooser; picking Always makes the chooser stop appearing and every later tap opens our app.
- A caught number lands on the Dialer tab already typed with the Call button ready; backing out leaves the number in the keypad and nothing dials.
- A call started from a caught number leaves on the chosen SIM, records like a keypad call, and shows in History.
- While the automated lead call flow is on screen, a caught number is ignored and the live flow keeps running.
- An empty or unreadable number link opens the dialer with nothing filled.
- When our app already handles tapped numbers, the login pass shows nothing for this step.
- Tapping "Don't show again" on the login step keeps it hidden at every later login, even when our app is never picked.
