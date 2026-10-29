## Task 1: Server drops calls with numbers invalid for the caller's country at sync

**Description:** The sync's per-row validation gains a validity gate on the dialed number — a row whose number is not a valid phone number for the token user's country is thrown away with a log line, the same treatment old and out-of-hours calls get, while the batch still answers success (`specs/call-tracking.md` — Phone number normalization; `api.md` §2; `decisions.md` — Decision 5).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] A synced row whose number is not valid for the user's country is discarded with a server log line — no call row is saved and no lead is created or changed, and the batch still answers `{"status": true}` (`api.md` §2; `specs/call-tracking.md` — "Unparseable number dropped by the server").
- [ ] A valid local number and a self-identifying `+`-prefixed international number still normalize to E.164 and save (`specs/call-tracking.md` — "Local-format number normalized", "International number passes through").
- [ ] The standing gates keep their behavior — duplicates skipped, too-old calls skipped, out-of-window calls dropped, malformed rows dropped, notes and flags still riding to the lead (`api.md` §2 Processing Logic).

**Verification:**

- [ ] Tests pass: `python -m pytest tests/modules/test_calls.py` in `backend/`

## Task 2: Server truncates notes past the 200-character cap at sync

**Description:** The sync truncates any note longer than the cap to 200 characters before saving — the server-side defense of the phone's note cap (`api.md` §2; `decisions.md` — Decision 10; `database.md` — `calls.notes`).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] A synced note longer than 200 characters is stored truncated to 200 — on the call row and on its matched lead's note copy (`api.md` §2; `database.md` — `calls`, `leads`).
- [ ] A note of exactly 200 characters saves unchanged, and shorter notes save as sent (`api.md` §2).

**Verification:**

- [ ] Tests pass: `python -m pytest tests/modules/test_calls.py` in `backend/`

## Task 3: The next-lead response carries the lead's note

**Description:** The served lead arrives with its stored note — one optional extra field on the existing `/api/leads/next` response, so the automated flow can show the pre-call notes popup (`api.md` §5; `decisions.md` — Decision 8).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] The served lead's response object carries `notes` — the lead's stored note from its last noted call — and omits it (or carries `null`) when the lead has no note (`api.md` §5 `lead.notes`).
- [ ] Serving, claiming, scheduling, and `continue_calling: false` behavior stay exactly as they are (`api.md` §5 Processing Logic).

**Verification:**

- [ ] Tests pass: `python -m pytest tests/modules/test_leads.py` in `backend/`

## Task 4: A booking saves its note at Submit

**Description:** The local `scheduled_reminders` table gains its `notes` column, and the moment a popup Submit books a schedule the booking saves the note typed on that call — overwritten by a later rebooking (`database.md` — `scheduled_reminders`; `specs/scheduled-bookings.md` — Booking carries its note; `decisions.md` — Decision 8).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] The phone's `scheduled_reminders` table carries the `notes` column, with an upgrade-safe path for phones that installed before it (`database.md` — `scheduled_reminders`).
- [ ] Submitting the popup with Schedule chosen saves the call's note on the booking; a rebooking replaces the row and holds only the new note; a call with no note leaves no stale note behind (`specs/scheduled-bookings.md` — "Booking saves the call's note", "Rebooking overwrites the booking note").
- [ ] The booking note stays phone-local — it never rides the sync batch (`specs/my-list.md` — Phone-local only; `database.md`).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 5: The Scheduled row shows its Interested tag

**Description:** The booking gains its interested mark — a local `interested` column set at the moment Submit books the schedule, shown as the Interested tag on the Scheduled row (`specs/scheduled-bookings.md` — Booking carries its note and interested mark; `decisions.md` — Decision 12; `screen.md` — Screen 7b).

**Blocked by:** 4

**Status:** Not started

**Acceptance criteria:**

- [ ] The `scheduled_reminders` table carries `interested`, set at booking time — on when the booking call's popup chose Interested or the number's My List row is flagged Interested (`database.md` — `scheduled_reminders`; `specs/scheduled-bookings.md` — "Tag shows for an interested booking", "Tag shows from the My List flag").
- [ ] The Scheduled row shows the Interested tag only while the flag is on; a booking with no local mark shows no tag, and rebooking sets the flag fresh (`specs/scheduled-bookings.md` — "Plain booking shows no tag", "Rebooking sets the marks fresh").
- [ ] Marks that live only on the server never tag the row (`decisions.md` — Decision 12).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 6: The post-call popup caps notes with an N/200 counter

**Description:** The popup's Notes box stops accepting input at the app's `note_max_length` config value (200) and shows a small N/200 counter beside it — the cap read from `config.json`, never hardcoded (`specs/call-tracking.md` — Shared post-call popup; `decisions.md` — Decision 10; `screen.md` — Screen 7).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] `config.json` gains `note_max_length` (200) and the popup reads the cap from it (`decisions.md` — Decision 10; `app/config.json`).
- [ ] The Notes box accepts nothing past the cap, the counter reads N/200 as the text grows, and a note at the cap saves in full (`specs/call-tracking.md` — "Notes box stops at the cap"; `testing.md` §2 — Post-call popup).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 7: Call Again saves the popup like Submit, then redials

**Description:** Every post-call popup gains a Call Again button beside Submit — it saves the outcome choices, the note, and the schedule answer exactly like Submit, then dials the same number again at once, with a fresh popup after the second call (`specs/call-tracking.md` — Shared post-call popup; `decisions.md` — Decision 4; `screen.md` — Screen 7).

**Blocked by:** 6

**Status:** Not started

**Acceptance criteria:**

- [ ] The keypad, automated, and My List popups each show Call Again beside Submit; tapping it saves everything exactly like Submit and dials the same number at once (`specs/call-tracking.md` — "Call Again saves like Submit and redials"; `decisions.md` — Decision 4).
- [ ] The "Go to next call" checkbox is ignored by a Call Again tap, the keypad display clears as after any submit, and an automated lead stays claimed for its 10-minute window so the redial hits the same lead (`specs/call-tracking.md` — "A fresh popup follows the redial", "The automated redial hits the same lead", "The keypad clears after Call Again").
- [ ] After the redial's call ends a fresh popup shows with nothing preselected; with CALL_PHONE denied the standing fallback applies — the number goes to the phone's own dialer and the call is not tracked (`decisions.md` — Decision 4; `specs/call-tracking.md` — CALL_PHONE denied).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 8: The keypad shows "Enter a valid phone number." for an invalid number

**Description:** The keypad's validity gate speaks the contract message — a typed number that is not valid for the saved login country cannot start a call and the screen says so (`specs/call-tracking.md` — "Keypad refuses an invalid number"; `decisions.md` — Decision 5; `screen.md` — Screen 7 edge cases).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] Tapping Call with a typed number that is not valid for the login country shows "Enter a valid phone number." and no call is placed (`specs/call-tracking.md` — "Keypad refuses an invalid number"; `testing.md` §2 — Notes).
- [ ] The check uses the login country saved at login — the same country and validator the uploads and the direct-call flow use (`decisions.md` — Decision 5; `specs/my-list.md` — Upload rules).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 9: Tapping a My List summary card opens its list screen

**Description:** The Interested and Do-not-call summary cards become tappable and open one shared list screen showing only that state's numbers — title, rows newest called first, back arrow, everything on the phone and offline — while Left and Called stay plain count cards (`specs/my-list.md` — Interested and Do-not-call cards open their lists; `decisions.md` — Decision 1; `screen.md` — Screen 7a1).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] Tapping Interested opens the shared screen titled Interested; tapping Do not call opens it titled Do not call — each showing only that flag's numbers, newest `called_at` at the top (`specs/my-list.md` — "Interested card opens the interested list", "Do-not-call card opens its list"; `database.md` — `my_list_numbers`).
- [ ] Each row shows the number with its Call and WhatsApp buttons in the same look as the History rows; a back arrow returns to the My List tab (`decisions.md` — Decision 1; `screen.md` — Screen 7a1).
- [ ] The screen works fully offline from the local table, reads "No numbers here yet." when the flag has no numbers, and the Left and Called cards stay non-tappable count cards (`specs/my-list.md` — "Empty list state", "Left and Called cards stay plain"; `screen.md` — Screen 7a1).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 10: List rows dial through the shared direct-call flow

**Description:** The rows on the Interested and Do-not-call lists act like every list row — Call dials at once through the shared direct-call flow with the shared post-call popup after, WhatsApp opens the chosen chat, and the standing flag rules keep moving numbers between the lists (`specs/my-list.md` — List rows act like every list row; `decisions.md` — Decision 2).

**Blocked by:** 9

**Status:** Not started

**Acceptance criteria:**

- [ ] A row's Call button dials at once through the shared direct-call flow — intent row written, direct dial with CALL_PHONE, shared post-call popup after — and with CALL_PHONE denied the standing fallback hands the number to the phone's own dialer, untracked (`specs/call-tracking.md` — Shared direct-call flow; `specs/my-list.md` — "Call dials through the shared flow").
- [ ] A row's WhatsApp button opens the chosen WhatsApp app on that number's chat with the first-message setting applied and leaves the list exactly as it was (`specs/my-list.md` — "WhatsApp opens the chat"; `screen.md` — Screen 7a1).
- [ ] The flags keep their standing rules — a later call that marks the number with the other outcome moves it from one list to the other (`specs/my-list.md` — "The other outcome moves the number"; `decisions.md` — Decision 2).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 11: Each list downloads its own CSV

**Description:** The Interested and Do-not-call list screens each carry a Download button that saves only that list's rows as one CSV in the phone's Downloads folder — the same columns and date-time file name as the whole-list download — with a toast confirming the save (`specs/my-list.md` — Each list downloads its own CSV; `decisions.md` — Decision 3; `screen.md` — Screen 7a1).

**Blocked by:** 9

**Status:** Not started

**Acceptance criteria:**

- [ ] Tapping Download on a list screen saves one .csv holding exactly that flag's rows with the whole-list columns — number, status, interested, do-not-call, notes, called date, called time (`specs/my-list.md` — "Only that list's rows are saved"; `database.md` — `my_list_numbers`).
- [ ] The file name carries the save moment as date and full time, like the whole-list download, so no download overwrites another; a toast confirms the save with the file's name (`specs/my-list.md` — "Same file naming as the whole list"; `decisions.md` — Decision 3).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 12: A call from a list row shows the notes popup first

**Description:** When the number has a note, a small notes popup shows before the call — on the Scheduled, History, Interested, and Do-not-call rows, the automated lead card, and My List Start Calling — showing the number, its one note, and a Call button that dials through the same flow as before (`specs/pre-call-notes.md`; `decisions.md` — Decisions 7, 8; `screen.md` — Screen 7a2).

**Blocked by:** 3, 4, 10

**Status:** Not started

**Acceptance criteria:**

- [ ] The popup appears before the call exactly when the number has a note — its My List row, its active booking, or its served-lead note — and never on the keypad or after Call Again (`specs/pre-call-notes.md` — "Notes popup appears with a note", "The keypad never shows it", "Call Again never shows it"; `decisions.md` — Decision 7).
- [ ] Its Call button dials through the same flow as before, and a number with no note anywhere dials straight through with no extra tap (`specs/pre-call-notes.md` — "No notes dials at once"; `screen.md` — Screen 7a2).
- [ ] Cancelling places no call and returns to where the salesperson was, and an automated lead stays claimed for its 10-minute window (`specs/pre-call-notes.md` — "Cancel places no call"; `decisions.md` — Decision 7).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`

## Task 13: The info icon opens the row's one note

**Description:** Every row on the Scheduled, History, Interested, and Do-not-call lists carries a small info icon just right of the date, only when the number has a note, and tapping it opens a small popup with the number's one note (`specs/pre-call-notes.md` — Info icon on list rows; `decisions.md` — Decision 9; `screen.md` — Screens 7a1, 7b, 7c).

**Blocked by:** 4, 9, 12

**Status:** Not started

**Acceptance criteria:**

- [ ] The icon shows only on rows whose number has a note — its My List row, its active booking, or its served-lead note — and rows without a note carry none (`specs/pre-call-notes.md` — "Icon with a note", "No icon without a note"; `specs/call-history.md` — "Info icon only with notes").
- [ ] Tapping the icon opens a small popup with the number's one note, and the row and its actions keep working exactly as before (`specs/pre-call-notes.md` — "Tapping opens the notes popup"; `decisions.md` — Decision 9).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`
