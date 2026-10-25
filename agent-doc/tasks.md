## Task 1: Backend — hour-chart buckets run from the window's start through the hour before its end

**Description:** The calls-by-hour buckets lose the extra bar: the server returns one bucket per hour from the window's start hour through the hour before its end, so a 10:00–19:00 window yields nine buckets, and a kept call starting exactly at the end minute still lands in the last bucket.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] The returned `calls_by_hour` holds one bucket per hour from the window's start hour through the hour before its end — nine buckets for 10:00–19:00 (`specs/dashboard.md` — Hours span the office-hours window).
- [ ] A call starting in hour H counts in the bucket labeled H, and a kept call starting exactly at the window's end minute counts in the last bucket — no kept call goes missing (`specs/dashboard.md` — End-minute call lands in the last bar).
- [ ] The same buckets flow to the team dashboard, the person view, and My Stats (`specs/dashboard.md` — Calls-by-hour chart).

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_dashboard.py tests/modules/test_dashboard_person.py -q` in `backend/`

## Task 2: Backend — the login response carries the office-hours window

**Description:** The login response gains the current office-hours window beside the token, so the phone learns the window from a response it already receives — no salesperson settings endpoint exists.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] A successful login response carries the current office-hours window beside the token (`specs/office-hours.md` — Login carries the window).
- [ ] No settings endpoint opens to salespeople — the office-hours GET stays manager-only (`specs/office-hours.md` — No salesperson endpoint exists; Salesperson refused).

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_auth.py -q` in `backend/`

## Task 3: Backend — My Stats responses carry the office-hours window with its short label

**Description:** Every My Stats response carries the current office-hours window plus its very short label — computed on the server from the stored window — so the phone always has the window its History filter needs.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] Every My Stats response carries the current window with its short label beside the numbers (`specs/office-hours.md` — My Stats fetch carries the window; `specs/dashboard.md` — Label arrives with every fetch).
- [ ] The label is computed server-side from the stored window — 12-hour clock, minutes only when they are not :00, no AM/PM — so 10:00–19:00 reads "10 to 7" (`specs/dashboard.md` — Exact hours render shortest; Minutes shown only when needed).
- [ ] A window the manager saved earlier shows on the next fetch without any extra request (`specs/dashboard.md` — Label arrives with every fetch).

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_dashboard_person.py -q` in `backend/`

## Task 4: App — the shared post-call popup makes outcomes mutually exclusive

**Description:** The one mergeable popup used by the keypad, automated, and My List flows enforces the exclusive pair: tapping one outcome clears the other, tapping it again unchecks it — both off or exactly one on, never both.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] Tapping one outcome clears the other, and tapping the chosen one again unchecks it — both off or exactly one on, never both on, on every flow's popup (`specs/call-tracking.md` — Tapping one outcome clears the other; Tapping the chosen outcome again unchecks it).
- [ ] Submit works with both off and with exactly one on, saving the two flags and the note exactly as before (`specs/call-tracking.md` — Submit with everything empty; Submit with exactly one outcome).
- [ ] The keypad popup carries no "Go to next call" checkbox while the automated and My List popups keep theirs (`specs/call-tracking.md` — Keypad popup carries no next-call checkbox; Automated and My List popups carry the next-call checkbox).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 5: App — one shared direct-call flow serves list rows

**Description:** One shared flow places a call straight from a list row: it writes the intent row, dials through Android's direct-call intent with CALL_PHONE, and runs the shared post-call popup after — the exact keypad process, with the standing fallback when CALL_PHONE is denied.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] The shared flow writes the intent row, places the call straight through Android's direct-call intent with CALL_PHONE, and runs the shared post-call popup after — the exact keypad process (`specs/call-tracking.md` — Shared direct-call flow).
- [ ] With CALL_PHONE denied the number goes to the phone's own dialer and the call is not tracked (`specs/call-tracking.md` — CALL_PHONE denied falls back to the phone's dialer).
- [ ] The keypad itself works exactly as before (`specs/call-tracking.md` — The keypad stays unchanged).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 6: App — History rows dial directly

**Description:** Tapping a History row or its Call button dials the number straight through the shared flow instead of filling the keypad.

**Blocked by:** 5

**Status:** Not started

**Acceptance criteria:**
- [ ] Each history row carries a Call button beside Copy and WhatsApp (`specs/call-history.md` — Call, Copy, and WhatsApp on every row).
- [ ] Tapping the row or its Call button dials the number directly through the shared flow — the keypad is never filled (`specs/call-history.md` — Tapping the row dials directly; `specs/call-tracking.md` — History row tapped dials directly).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 7: App — the My List tab shows KPIs only

**Description:** The My List tab drops its per-number rows, badges, and list-loading code, keeping only the Upload, Download, and Clear buttons, Start Calling, the four summary cards, and the phone-local line — the table underneath still powers everything.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] The tab shows only the Upload, Download, and Clear buttons, Start Calling, the four summary cards — Left, Called, Interested, Do not call — and the line that the list lives only on the phone, with no per-number rows or badges anywhere (`specs/my-list.md` — My List tab shows KPIs only).
- [ ] The cards show each state's count, and an empty list reads "No numbers yet." with Upload as the invite (`specs/my-list.md` — Four summary cards match the table; Empty list).
- [ ] The `my_list_numbers` table still powers Start Calling, Download, Clear, and call-marking — only the screen's rows and list-loading code are removed (`specs/my-list.md` — My List tab shows KPIs only).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 8: App — Scheduled rows gain the Call button

**Description:** Each booking row gains a Call button beside Copy and WhatsApp that dials the number through the shared direct-call flow.

**Blocked by:** 5

**Status:** Not started

**Acceptance criteria:**
- [ ] Each booking row carries a Call button beside Copy and WhatsApp (`specs/scheduled-bookings.md` — Call, Copy, and WhatsApp on every row).
- [ ] Tapping it dials the number directly through the shared flow with the shared post-call popup after (`specs/scheduled-bookings.md` — Call button dials through the shared flow).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 9: App — tapping WhatsApp on a Scheduled row clears the booking

**Description:** Tapping WhatsApp on a booking row opens the chosen app on the number's chat and removes that booking from the list — the salesperson handled it.

**Blocked by:** 8

**Status:** Not started

**Acceptance criteria:**
- [ ] Tapping WhatsApp on a booking row opens the chosen app on the number's chat and removes the booking from the Scheduled list (`specs/scheduled-bookings.md` — WhatsApp tap removes the booking).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 10: App — the popup answer re-books or clears a called booking

**Description:** After a call started from a Scheduled row, the popup's Schedule answer overwrites the booking: "Do not schedule" leaves it removed, a new schedule replaces the old booking with the new date.

**Blocked by:** 8

**Status:** Not started

**Acceptance criteria:**
- [ ] "Do not schedule" after a Scheduled-tab call leaves the row removed — the old booking is gone (`specs/scheduled-bookings.md` — Do not schedule leaves it removed).
- [ ] A new schedule replaces the old booking with the new date, and the row shows the new booked time (`specs/scheduled-bookings.md` — New schedule replaces the old booking).
- [ ] The 24-hour removal window and the Due badge stay exactly as they are (`specs/scheduled-bookings.md` — Standing removal rules stay as they are).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 11: App — the My List popup schedules like the keypad

**Description:** The My List post-call popup gains the same Schedule choice the automated flow has — same popup, same pieces — and choosing it books the number keypad-style onto the Scheduled tab.

**Blocked by:** 4, 8

**Status:** Not started

**Acceptance criteria:**
- [ ] The My List popup carries the same Schedule choice as the automated flow (`specs/my-list.md` — Post-call popup schedules like the keypad).
- [ ] Choosing Schedule books the number keypad-style, keyed by phone number, and the booking appears on the Scheduled tab with Copy, WhatsApp, and the Call button (`specs/my-list.md` — Schedule choice books onto the Scheduled tab).
- [ ] The booking leaves the tab by the standing rules — notification tap, recorded call, 24 hours (`specs/my-list.md` — Booking leaves by the standing rules).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 12: App — WhatsApp First message defaults ON

**Description:** A fresh install opens every WhatsApp chat with the fixed line pre-typed — the First message switch starts ON with "Hello sir, Mai Apex Album AI se baat kar raha/rahi hu" — while a phone that saved its own choice keeps it.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] A fresh install has the First message switch ON with "Hello sir, Mai Apex Album AI se baat kar raha/rahi hu" pre-filled, and every WhatsApp button opens the chat with that line pre-typed, still editable (`specs/whatsapp-open.md` — Fresh install defaults ON).
- [ ] A phone that saved its own first-message choice keeps exactly what it saved — the default never overwrites it (`specs/whatsapp-open.md` — Saved choice keeps what it saved).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 13: App — the Do-not-track add button becomes a bare + icon

**Description:** The Do-not-track screen's add button becomes a bare + icon in the header with no text, because the old texted button did not fit on mobile.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] The Do-not-track screen's add button is a bare + icon in the header with no text, opening the same add dialog (`specs/call-tracking.md` — Add button is a bare + icon).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 14: App — leaving Settings always lands on its home

**Description:** Leaving the Settings tab always resets it, so coming back lands on the Settings home and never inside a sub-page like WhatsApp or Do-not-track.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] Leaving the Settings tab and returning always lands on the Settings home — no sub-page is ever left open (`specs/settings-tab.md` — Sub-page does not survive leaving; Every return lands on the home).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 15: App — the Settings list drops the Local data header

**Description:** The Settings list loses its "Local data" section header because the list holds several kinds of rows now; the "Clear local data" row keeps its name and behavior.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] The Settings list shows no "Local data" section header (`specs/settings-tab.md` — Five rows render with no header).
- [ ] The "Clear local data" row keeps its name and behavior exactly as before (`specs/settings-tab.md` — Clear local data row keeps its name).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 16: App — the phone filters history by the received window

**Description:** The phone stores the office-hours window it last received and keeps only calls the dashboard would count: a call starting outside the window never gets a history row, in the recording check, the backfill, and every sweep.

**Blocked by:** 2, 3

**Status:** Not started

**Acceptance criteria:**
- [ ] The app stores the office-hours window it last received — from the login response or a My Stats fetch — and uses the documented default 10:00–19:00 IST before any arrives (`specs/office-hours.md` — The window reaches the phone without its own endpoint; `specs/call-history.md` — Default window before any arrives).
- [ ] A call whose IST start minute falls outside the stored window never gets a history row — checked at the same moment the Do-not-track check runs (`specs/call-history.md` — Out-of-window call gets no row; Check runs with the Do-not-track check).
- [ ] The first-open backfill and every sweep apply the same filter, and history rows already stored stay untouched (`specs/call-history.md` — Backfill and sweep apply the filter; Stored rows stay untouched).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
