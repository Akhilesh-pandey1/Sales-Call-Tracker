## Task 1: The Settings tab holds the Notes popup switch, ON by default

**Description:** The salesperson can flip a Notes popup switch directly on the Settings home. A new per-device setting utility stores the choice; the Settings screen gains the fifth row — between Do not track and Clear local data — with a switch that flips in place, no sub-page.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] A phone with nothing saved reads the switch as ON, and a saved OFF reads back OFF after leaving Settings, returning, or reopening the app (`specs/settings-tab.md` — "Default is on", "The choice survives leaving and restarting").
- [x] The Settings home shows exactly five rows — WhatsApp, Do not track numbers, Notes popup, Clear local data, Log out — with the Notes popup row holding a switch, and tapping the row flips it in place with no sub-page (`specs/settings-tab.md` — "Five-row menu", "Tapping the row flips it in place").
- [x] No backend, API, or database change exists — the choice lives on the phone only (decisions.md, Decision 14).

**Verification:**
- [x] Tests pass: `npx jest notes-popup-settings` in `app/` (new test file: nothing saved → ON, save OFF → reads OFF, save ON → reads ON)
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 2: The switch gates the pre-call notes popup — OFF dials straight through

**Description:** The shared pre-call note check reads the switch in the same step it reads the note, so the popup shows only when the number has a note and the switch is on. With the switch off, every gated entry — Scheduled, History, Interested, and Do-not-call rows, the automated lead card, My List Start Calling — dials straight through, while the info icon and the rest of the call flow stay untouched.

**Blocked by:** Task 1

**Status:** Done

**Acceptance criteria:**
- [x] With the switch off, a noted number tapped on a list row, the automated lead card, or My List Start Calling dials at once with no notes screen (`specs/pre-call-notes.md` — "Switch off dials noted numbers straight", "Switch off dials the automated lead straight").
- [x] With the switch on, the popup shows exactly as before, and a flip applies from the very next call attempt (`specs/pre-call-notes.md` — "Notes popup appears with a note", "A flip applies from the next call").
- [x] With the switch off, the info icon still shows on noted rows and opens the note; the keypad and Call Again behave as before (`specs/pre-call-notes.md` — "Switch off keeps the info icon").

**Verification:**
- [x] Tests pass: `npx jest find-pre-call-note` in `app/` (switch off + note → no popup, switch on + note → popup, off + no note → straight dial)
- [x] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
