## Task 1: The server creates a lead for a dialed number that has none

**Description:** Every keypad dial to a new number now grows the lead pool (Decision 167). When a synced call's normalized number has no lead, `resolve_lead_for_call` first creates that lead as `waiting`, then resolves it from the same call exactly like an uploaded lead — connected marks it `done`, not connected burns attempt one and can stop it at the attempt limit. The unique index on `leads.phone_number` makes a double create impossible; a number that already has a lead is only reused.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] A synced call to a number with no lead creates that lead as `waiting` and resolves it from the same call — connected marks it `done`, not connected burns attempt 1 and stops it at the attempt limit
- [x] A second sync for a number that already has a lead never creates a second lead
- [x] The create-and-resolve and no-double-create cases are covered in `backend/tests/modules/test_calls.py` per `testing.md`

**Verification:**
- [x] Tests pass: `python -m pytest backend/tests/modules/test_calls.py backend/tests/modules/test_leads.py` (from the project root)

---

## Task 2: The sync request carries the popup's schedule answer

**Description:** The server half of Decision 168: the sync request's call item gains an optional `scheduled_at` (ISO UTC follow-up time chosen in the keypad post-call popup). After the call is saved and its lead resolved (created or matched), the server applies the schedule under the rules the lead schedule already has — the time must be in the future within 30 days (`MAX_SCHEDULE_AHEAD_DAYS`) and the lead must not be `done` or `stopped`. An invalid or inapplicable schedule is skipped with a warning log; the call itself is always saved. Lead calls keep sending their schedule through `/api/leads/next`, untouched.

**Blocked by:** Task 1

**Status:** Done

**Acceptance criteria:**
- [x] A call item with `scheduled_at` inside 30 days schedules the resolved lead — created or matched — and the call is saved
- [x] A `scheduled_at` on a call that connects (lead ends `done`), and a past or beyond-30-days `scheduled_at`, are each skipped with a warning log while the call stays saved
- [x] The three schedule cases are covered in `backend/tests/modules/test_calls.py` per `testing.md`

**Verification:**
- [x] Tests pass: `python -m pytest backend/tests/modules/test_calls.py backend/tests/modules/test_leads.py` (from the project root)

---

## Task 3: The post-call popup opens only when the call has truly ended

**Description:** The popup guard from Decision 166: the back-to-app trigger in `use-call-hang-up-detector.ts` first reads the phone's live call state through `getCallState()` and opens the popup only when the state is IDLE — while a call is still live, returning to the app shows nothing. Without the guard, the Submit click finds no finished call-log entry and the row falls to the janitor. The native OFFHOOK→IDLE event still opens the popup at the real hang-up, and a later return to the app opens it the same way. Decision 171 holds here too: the popup lives only in memory, so nothing re-opens it after an app restart — the pending row waits for the janitor.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] The back-to-app trigger reads the live call state through `getCallState()` and opens the popup only when it is IDLE — while a call is still live, returning to the app shows no popup
- [x] The OFFHOOK→IDLE event still opens the popup at the real hang-up
- [x] No code persists or re-opens the popup across an app restart — the row waits for the janitor (Decision 171)

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 4: The popup's schedule input becomes a native picker

**Description:** The free-text follow-up input and its date-parsing helpers (`toDateTimeLocalInput`, `readScheduleDateFromInput`) are deleted (Decision 169). One tappable field shows the chosen moment — like "21 Oct 2026, 9:00 AM" — and opens Android's date dialog first and the time dialog right after, through `@react-native-community/datetimepicker`. The picker's minimum is now and its maximum is 30 days ahead, matching the server's schedule rule; the default stays tomorrow at 9:00 AM. Before this task runs, the developer installs the package: `npm install @react-native-community/datetimepicker` (from `app/`).

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] Tapping the follow-up field opens the native date dialog first, then the native time dialog, and the field shows the chosen moment as a readable label
- [x] The picker offers nothing before now or beyond 30 days ahead, and the default stays tomorrow at 9:00 AM
- [x] The free-text input and its date-parsing helpers are gone from `post-call-dialog.tsx`

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 5: The keypad popup's schedule answer rides the sync request

**Description:** The app half of Decision 168: the keypad Submit keeps the popup's schedule choice today instead of dropping it. The chosen follow-up time travels from `submitKeypadPostCall` through `use-post-call-submit.ts` into `submitTrackedCall`, and the sync call item carries it as the optional `scheduled_at` exactly as `api.md` defines. With "Do not schedule" chosen, no schedule field is sent. Lead calls keep sending their schedule through `/api/leads/next`, untouched.

**Blocked by:** Task 2, Task 4

**Status:** Done

**Acceptance criteria:**
- [x] Keypad Submit with a schedule chosen sends the call item with `scheduled_at`; "Do not schedule" sends the item without the field
- [x] The `SyncCall` type carries the optional `scheduled_at` as `api.md` defines it, and the bulk-sync path still builds items without it
- [x] The lead flow still sends its schedule through `/api/leads/next`, untouched

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 6: The post-call popup locks until Submit

**Description:** The popup is locked (Decision 170): tapping outside it and pressing the Android back button do nothing, in the keypad and lead variants alike — Submit is the only way past. The dialog primitive (`dialog.tsx`) gains a locked dismissal mode and the post-call popup uses it; every other dialog keeps its current behavior. With nothing able to close the popup without Submit, the finished screen's "Reopen call summary" button loses its job and is deleted with its now-dead wiring.

**Blocked by:** Task 4, Task 5

**Status:** Done

**Acceptance criteria:**
- [x] Tapping outside the popup or pressing the Android back button does nothing — Submit is the only way through, for lead and keypad calls alike
- [x] Every other dialog keeps closing on outside tap and back button as before
- [x] The finished screen's reopen button is deleted with its now-dead wiring

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 7: Settings gains a Log out row

**Description:** The salesperson's Settings screen gains a Log out row under Clear local data (Decision 172). Tapping it first tries to send every unsent call on the phone — reusing the bulk-sync path — and when the queue is empty it clears the stored session token on the phone alone and the app returns to the Login screen. With unsent calls and no internet it refuses to log out and says how many calls are waiting, so a call is never lost and never synced under the next person who uses the phone. There is no logout endpoint on the server.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] Tapping Log out sends the unsent calls first; when the queue is empty the stored token is cleared and the app returns to the Login screen
- [x] With unsent calls and no internet, Log out refuses and says how many calls are waiting
- [x] No logout endpoint is called — only the phone's stored token is cleared

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 8: The My Stats calls-by-hour chart opens on Today

**Description:** The chart's period switch opens on Today, not Last 30 days (Decision 173). Yesterday and Last 30 days stay one tap away on the existing switch.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] The calls-by-hour chart opens on Today, and Yesterday and 30 days still switch on tap

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 9: The performance table's headings become icons

**Description:** The performance table's worded headings become icons (Decision 174) — phone for Dials, connected-phone for Connected, clock for Minutes, percent for Connected % — and an annotation line under the table names each icon in words. The numbers, the three periods, and the "—" empty marker stay exactly as they are; only the headings change.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] The four column headings show icons — phone, connected-phone, clock, percent — and an annotation line under the table names each icon in words
- [x] The numbers, the three period rows, and the "—" marker are unchanged

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)