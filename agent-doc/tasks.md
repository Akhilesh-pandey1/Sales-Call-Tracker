## Task 1: App — the tel: intent filter also answers the dial intent

**Description:** The Android manifest's `tel:` intent filter answers ACTION_DIAL beside ACTION_VIEW, so phones whose select-a-number "Call" button fires the dial intent can offer the app in Android's chooser (`specs/tapped-number-capture.md` — catch requirement).

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**

- [x] The `tel:` intent filter on MainActivity carries ACTION_VIEW and ACTION_DIAL, keeping DEFAULT and BROWSABLE (`specs/tapped-number-capture.md` — Catch tapped numbers through Android's chooser).
- [x] Nothing else in the capture flow changes — the chooser probe, keypad fill, and skip rules stay as they are.

**Verification:**

- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 2: App — login-pass popups never overlap, so the tapped-number step shows on first login

**Description:** Each login permission pass step waits until the previous popup is fully closed before its own popup shows, so the reminders popup can never swallow the tapped-number step and the step always appears on the first login (`specs/tapped-number-capture.md` — one-time setup requirement).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] No two login-pass popups can overlap — each step waits for the previous popup to be fully closed (`specs/tapped-number-capture.md` — Popups never overlap on first login).
- [ ] On a first login whose reminders step showed its own popup, the tapped-number step still shows instead of being dropped (`specs/tapped-number-capture.md` — Popups never overlap on first login).
- [ ] The skip rules stay exactly as they are — silent skip when already the handler, permanent refusal saved by "Don't show again" (`specs/tapped-number-capture.md` — Don't-show-again requirement).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 3: App — the Dialer Paste button fills only real phone numbers

**Description:** The Dialer paste button extracts the first real phone number from the clipboard text with libphonenumber-js and fills the keypad with it in E.164; a clipboard with no number leaves the keypad untouched with a toast (`decisions.md` — Decision 2; `specs/my-list.md` — the same library the upload uses).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] Pasting clipboard text fills the keypad with the first number found in it, in E.164 form (`decisions.md` — Decision 2).
- [ ] A clipboard holding no number shows the toast "No number found in what you copied." and leaves the keypad exactly as it was (`decisions.md` — Decision 2).
- [ ] An empty clipboard keeps its existing "Nothing copied." toast and changes nothing.

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 4: App — the Calling SIM feature is removed

**Description:** Every trace of the Calling SIM feature is deleted: the Settings row and picker screen, its hook, utility, bridge, native module and its registration, the SIM logic in the call launcher, and the READ_PHONE_NUMBERS ask — calls always place on the phone default (`decisions.md` — Decision 3; `specs/settings-tab.md` — four-row menu).

**Blocked by:** 2

**Status:** Not started

**Acceptance criteria:**

- [ ] Settings shows exactly the WhatsApp, Do not track numbers, Clear local data, and Log out rows, and the SIM screen, hook, utility, bridge, native module, and its registration are deleted (`specs/settings-tab.md` — Four-row menu with no section header).
- [ ] Every call places on the phone default through the direct call, and with CALL_PHONE off the number still hands to the phone's own dialer untracked.
- [ ] READ_PHONE_NUMBERS is asked nowhere — the login pass asks only CALL_PHONE, READ_CALL_LOG, READ_PHONE_STATE, then the reminders check, then the tapped-number step (`decisions.md` — Decision 3).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 5: App — Download saves the My List CSV as a real file

**Description:** The My List Download button writes the whole list as one real .csv file into the phone's Downloads folder, named by the save moment as date and full time, with no share sheet and a confirming toast (`decisions.md` — Decision 4; `specs/my-list.md` — Download saves the whole list as a file).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] Download saves one .csv of the whole list into Downloads, named like `26-10-2026-18-03-26.csv`, and no share sheet opens (`specs/my-list.md` — Download saves a unique file).
- [ ] The columns stay Number, Status, Interested, Do not call, Notes, Called date, Called time, with each row's called date and called time kept (`specs/my-list.md` — Download requirement).
- [ ] A toast confirms the save with the file's name, and a failed save shows a short user-facing error without opening a share sheet (`decisions.md` — Decision 4).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`