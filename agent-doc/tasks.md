## Task 1: Backend — one session per login, all staying valid

**Description:** Every login creates its own row in the new `sessions` table and every session stays valid, so several devices share one account — manager dashboards and shared salesperson phones alike. The old single-token column migrates so nobody is signed out.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] Every login creates a `sessions` row and all tokens keep working — a new login never signs an older device out, for managers and salespeople alike; deactivation or deletion still rejects every session (`specs/authentication.md` — One session per login, all staying valid; `database.md` — `sessions`).
- [x] A password change deletes the account's other sessions while the session that made the change stays valid, and there is still no logout endpoint (`specs/authentication.md`; `specs/user-management.md` — Edit account).
- [x] Each token stored in the old single-token column becomes one `sessions` row, so the update signs nobody out (`specs/authentication.md` — Migration keeps old tokens working).

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_auth.py tests/modules/test_users.py -q` in `backend/`

## Task 2: Backend — outcome choices ride the synced call

**Description:** The calls table and the sync batch carry the post-call popup's two yes/no flags and the optional note, saved beside the call's number, time, and duration.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] A sync item saves `interested` and `do_not_call` as yes/no flags and `notes` on the call row; items without them save with both flags false and an empty note (`specs/call-tracking.md` — Post-call outcome popup on every flow; `api.md` — sync item fields).
- [x] Flags and note ride the normal batch unchanged — the call's time and duration still come only from the call log, and the popup never changes any number (`specs/call-tracking.md` — Time and duration stay call-log only).

**Verification:**
- [x] Tests pass: `python -m pytest tests/modules/test_calls.py -q` in `backend/`

## Task 3: Backend — a call's outcome reaches its lead

**Description:** When a kept call matches a lead, the lead stores the call's outcome and note beside its own state: Do not call again stops the lead for everyone, Interested is only a label, and no outcome resolves the lead exactly as before.

**Blocked by:** 2

**Status:** Not started

**Acceptance criteria:**
- [ ] `do_not_call: true` on a matched call sets the lead's status to `stopped` with claims and schedules cleared — even when the call was unconnected (`specs/lead-management.md` — Call outcome reaches the lead).
- [ ] `interested: true` is stored as a label beside the lead's state with the normal retry rules running unchanged, and the call's note is copied onto the lead (`specs/lead-management.md` — Call outcome reaches the lead).
- [ ] A synced call with no outcome choices resolves the lead exactly as before — no label stored (`specs/lead-management.md` — No outcome resolves as before).

**Verification:**
- [ ] Tests pass: `python -m pytest tests/modules/test_calls.py tests/modules/test_leads.py -q` in `backend/`

## Task 4: App — post-call popups carry outcome choices

**Description:** The shared post-call dialog gains the two optional outcome buttons — Interested and Do not call again — plus an optional Notes box on every flow, and the choices ride the call record to the server.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] Every post-call popup — keypad, automated lead, My List — shows the same Interested and Do not call again buttons and Notes box, with nothing preselected and Submit working with all of it empty (`specs/call-tracking.md` — Post-call outcome popup on every flow).
- [x] The two flags and the note are saved on the phone's pending row and sent in the sync batch, while the call's time and duration still come only from the call log (`specs/call-tracking.md` — Choices ride the sync batch; `database.md` — `pending_calls`).
- [x] `specs/call-tracking.md` — Time and duration stay call-log only.

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 5: App — the keypad clears after the post-call popup

**Description:** Submitting the keypad's post-call popup clears the typed number to blank, ready for the next dial, while the automated flow keeps its number untouched.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] Submitting the keypad post-call popup — "Do not schedule" and "Schedule" alike — clears the display to blank, with paste, backspace, and hold-to-clear unchanged (`specs/call-tracking.md` — Keypad clears after the post-call popup).
- [x] The automated lead flow keeps its number and popup untouched — the clearing applies to the keypad only (`specs/call-tracking.md` — Automated flow keeps its number).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 6: App — the lead card hands out its number

**Description:** The automated lead calling card gains a Copy button beside the lead's number, available through the whole flow, so a salesperson who must dial elsewhere goes copy, paste, dial straight from the card.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] A Copy button sits beside the lead's number on the lead calling card, available while ringing, during the call, and on the post-call popup; one tap copies it with a "Number copied." toast (`specs/lead-management.md` — Lead card hands out its number).
- [x] Copying leaves the call and the flow running exactly as they were (`specs/lead-management.md` — Copy leaves the flow untouched).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 7: App — WhatsApp opens the chosen app by package

**Description:** A small Kotlin module beside the SIM module launches the chosen WhatsApp app by its exact package with the number in international format and the optional first message; the JS bridge exposes it to every future WhatsApp button.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] The native module launches only the chosen app by its exact package — WhatsApp `com.whatsapp`, Business `com.whatsapp.w4b` — with the number in international format and the optional text, so Android shows the existing chat with that number or a fresh one (`specs/whatsapp-open.md` — Every WhatsApp button opens the chosen app).
- [x] When the chosen app is not installed, a toast says "WhatsApp is not installed." and nothing else happens (`specs/whatsapp-open.md` — Missing app handled quietly).
- [x] The JS bridge opens the chosen app with the saved first message when the switch is on, and empty when off (`specs/whatsapp-open.md` — WhatsApp settings rows saved on the phone).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 8: App — WhatsApp settings rows saved on the phone

**Description:** Settings gains the WhatsApp app row — WhatsApp or WhatsApp Business, WhatsApp preselected — and the First message row with its switch and text, both saved on the phone only.

**Blocked by:** 7

**Status:** Not started

**Acceptance criteria:**
- [x] Settings shows the WhatsApp app row with WhatsApp preselected and Business selectable, saved on the phone only (`specs/whatsapp-open.md` — WhatsApp settings rows saved on the phone).
- [x] The First message row holds a switch, off by default, plus a text field — off opens the chat empty, on pre-types the saved text, still editable, nothing ever sends by itself (`specs/whatsapp-open.md` — Switch off opens an empty chat; Switch on pre-types the text).
- [x] Both choices never reach the server and never move between phones (`specs/whatsapp-open.md` — Saved on the phone only).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 9: App — My List stores numbers with the replace rule

**Description:** The phone gains its personal-list table and the upload pipeline: pasted messy text and CSV files become E.164 rows, re-uploads re-arm numbers, and the toast reports what was added and what failed to parse.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] Pasted text with numbers buried anywhere and picked CSV files both fill the `my_list_numbers` table, every number normalized to E.164 with the login country before storing (`specs/my-list.md` — Numbers come in three ways; Upload rules).
- [x] A number already in the list in any state has its old row deleted and is added fresh as Left, the same number twice inside one upload counts once, and the toast reads "Added N numbers." with "M not valid." appended when any parse fails (`specs/my-list.md` — Re-upload re-arms; Toast with counts).
- [x] The list cap comes from the app's `config.json` as `my_list_max_numbers` (10000), never hardcoded (`specs/my-list.md` — List capped by config).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 10: App — My List takes Excel files with the Copy AI prompt

**Description:** Upload gains the third source — an .xlsx file parsed on the phone by a maintained Excel-reading library chosen at implementation — plus a "Copy AI prompt" button that hands the salesperson a ready prompt for ChatGPT.

**Blocked by:** 9

**Status:** Not started

**Acceptance criteria:**
- [ ] An .xlsx file picked on the phone is parsed by an Excel-reading library chosen at implementation and its numbers join the upload like any other source (`specs/my-list.md` — Excel parsed on the phone).
- [ ] "Copy AI prompt" copies a ready prompt, so the salesperson pastes their sheet text and the prompt into ChatGPT and puts the comma-separated numbers back into the paste box (`specs/my-list.md` — AI prompt copied).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 11: App — the My List tab

**Description:** The Dialer's pill switch grows to Keypad | Automated | My List, opening a tab that shows count chips, one badge-carrying row per number, and the Upload, Start Calling, Download, and Clear buttons — all working offline.

**Blocked by:** 9, 10

**Status:** Not started

**Acceptance criteria:**
- [ ] The pill switch shows Keypad | Automated | My List, and the tab shows Left, Called, Interested, and Do not call count chips matching the table (`specs/my-list.md` — My List as the third pill item).
- [ ] One row per number carries its badge — Left, Connected, Not connected, Interested, or Do not call — and everything on the tab works with no internet (`specs/my-list.md` — One badge per row; Works offline).
- [ ] With no numbers stored the tab shows its empty state with an Upload button (`testing.md` — My List manual pass).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 12: Start Calling dials the list

**Description:** Start Calling dials the oldest Left number through the shared call flow, skips Do-not-track numbers entirely, and any recorded call to a listed number — from Start Calling or the keypad — marks the row Called.

**Blocked by:** 4, 11

**Status:** Not started

**Acceptance criteria:**
- [ ] Start Calling dials the oldest Left number; a Do-not-track number is skipped, never dialed, and never recorded (`specs/my-list.md` — Start Calling never dials Do-not-track numbers).
- [ ] Any recorded call to a listed number — from Start Calling or a keypad dial — moves the row out of Left with the outcome and note saved on it, matched on the normalized number exactly like lead resolution does (`specs/my-list.md` — Marked called from Start Calling; Marked called from a keypad dial).
- [ ] With "Go to next call" checked the next Left number dials right after Submit, and an empty list says "No numbers left." (`testing.md` — Start Calling manual pass).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 13: App — My List downloads the whole list as CSV

**Description:** Download exports the entire list through Android's share sheet with every column the spreadsheet needs, each row keeping its called date.

**Blocked by:** 11

**Status:** Not started

**Acceptance criteria:**
- [ ] Download produces one CSV of the whole list — number, status, interested, do-not-call, notes, called date — through Android's share sheet (`specs/my-list.md` — Download exports the whole list).
- [ ] Each row keeps its own called date, so today's slice is a filter in the spreadsheet app (`specs/my-list.md` — Rows keep their dates).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 14: App — Clear wipes the list after a counted confirmation

**Description:** Clear wipes the whole My List only after a confirmation that shows the left and called counts, touching nothing on the server.

**Blocked by:** 11

**Status:** Not started

**Acceptance criteria:**
- [ ] Clear opens a confirmation showing both counts — left and called — before anything is deleted (`specs/my-list.md` — Confirmation shows the counts).
- [ ] Cancelling keeps the list untouched, and the wipe deletes phone rows only — no server data changes (`specs/my-list.md` — Cancel keeps everything; Server untouched).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 15: App — every recorded call keeps a history row

**Description:** The phone gains its local call-history table, written once per call at the moment the real time and duration are known — before any sync — capped at 1000 rows, never touching Do-not-track numbers.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [x] One `call_history` row is written per call at the moment the real time and duration are known, before any sync, so queue cleanup never touches history and the list works offline (`specs/call-history.md` — One history row per recorded call).
- [x] A Do-not-track number never gets a history row — the same rule tracking follows (`specs/call-history.md` — Do-not-track number gets no row).
- [x] The table keeps at most 1000 rows — row 1001 pushes the oldest out (`specs/call-history.md` — Cap pushes the oldest out).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 16: App — History backfill with the sweep on every open

**Description:** The first History open backfills the table once from the phone's call log, and every open runs the sweep and saves the last-loaded time, so calls made while the app was closed appear at the next look.

**Blocked by:** 15

**Status:** Not started

**Acceptance criteria:**
- [x] The first open after the update backfills the history table once from the phone's call log, skipping Do-not-track numbers (`specs/call-history.md` — Backfill runs once).
- [x] Every History open runs the call-log sweep and saves the last-loaded time, so closed-period calls appear at the next look (`specs/call-history.md` — Closed-period calls appear at the next look; Last-loaded time saved).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 17: App — the History tab in a five-tab bar

**Description:** The tab bar grows toward its five tabs and the History tab renders the phone's calls: newest first, paged 50 at a time, each row with its result, Copy, WhatsApp, and the Scheduled badge.

**Blocked by:** 7, 15, 16

**Status:** Not started

**Acceptance criteria:**
- [x] The tab bar holds Dialer, Scheduled, History, My Stats, Settings, and History lists every recorded call, outgoing and incoming, newest first, 50 rows per page with Load-more (`specs/call-history.md` — History tab in a five-tab bar; Paged list capped at 1000 rows).
- [x] A row shows the number, an out or in mark, the date-time, and the result — connected with talk time, or not connected — and carries Copy, WhatsApp, and the Scheduled badge when the number has an active booking (`specs/call-history.md` — Row contents and empty state).
- [x] With no calls yet the tab reads "No calls yet." (`specs/call-history.md` — Empty state).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 18: App — the Scheduled tab lists every booking

**Description:** The Scheduled tab reads the local reminders table and lists every booking — lead and keypad alike — with its state, Due first, each row ready to copy, open in WhatsApp, or tap through to the booked lead.

**Blocked by:** 7

**Status:** Not started

**Acceptance criteria:**
- [x] The tab lists every booking from the local `scheduled_reminders` table — lead bookings and keypad bookings alike — with the number, the booked date and time, and Upcoming while the time has not come, Due once it has passed (`specs/scheduled-bookings.md` — Every booking listed with its state).
- [x] Due rows sort first, most overdue at top, then Upcoming rows soonest first, and nothing booked reads "Nothing scheduled." (`specs/scheduled-bookings.md` — Due first, most overdue at top; Empty state).
- [x] Each row carries Copy and WhatsApp buttons, and tapping the row opens the booked lead's card ready to call — the same thing tapping the notification does (`specs/scheduled-bookings.md` — Row actions and tap-through).

**Verification:**
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 19: App — handled bookings leave the Scheduled tab

**Description:** A booking row leaves the list when its notification is tapped, when the number is called, or 24 hours past its booked time, and the Due count shows as a tab badge with the not-called line.

**Blocked by:** 18

**Status:** Not started

**Acceptance criteria:**
- [ ] A row leaves the list when the notification is tapped, when a call to that number is recorded, or when 24 hours pass its booked time — the same window the server uses to free the lead — with the cleanup running at every app open (`specs/scheduled-bookings.md` — Handled bookings leave the list).
- [ ] Every app open counts the Due rows and shows the count as a badge on the Scheduled tab, with the line "You have N leads you have not called." (`specs/scheduled-bookings.md` — Due count badge and line).
- [ ] The tab works fully offline from the phone's own tables (`specs/scheduled-bookings.md` — Works offline).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
