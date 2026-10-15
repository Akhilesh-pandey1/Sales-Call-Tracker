# Tasks: Sales Call Tracker v1 — Remaining Work

## Task 1: Manager can log in to the web dashboard

**Description:** Build the login feature end to end (`features/auth/`: `api/auth.api.ts`, `hooks/use-auth.ts`, `pages/login-page.tsx`) against the existing `POST /api/login`, storing token and role in the existing auth context from `providers.tsx`. The manager lands on the team dashboard; a salesperson sees the restricted message already rendered by `ManagerGuard`.

**Blocked by:** None

**Spec refs:** `specs/authentication.md` — all scenarios

**Acceptance criteria:**
- [ ] Valid manager credentials navigate to the team dashboard; a salesperson login sees "This dashboard is for managers." with a logout button
- [ ] Wrong credentials (401), deactivated account (403), lockout (429), and missing fields (400) each show their exact spec message on the page
- [ ] The stored token is sent by the existing Axios interceptor, so guarded pages load without extra wiring

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: log in as manager and as salesperson, then with a wrong password and an empty field

---

## Task 2: Manager can view the team call dashboard

**Description:** Build the team dashboard read path (`features/dashboard/`: `api/dashboard.api.ts` with `getTeamDashboard()`, `hooks/use-team-dashboard.ts`, `pages/team-page.tsx`, `components/team-table.tsx`) showing KPI totals and the per-person table from `GET /api/dashboard/team`.

**Blocked by:** Task 1

**Spec refs:** `specs/dashboard.md` §Team dashboard; `screen.md` §Screen 2

**Acceptance criteria:**
- [ ] Today and yesterday KPI cards show team dials, connected calls, and talk time (rendered in minutes from API seconds)
- [ ] The table lists every active salesperson — zeros included — sorted by today's dials descending; clicking a row opens that person's stats page
- [ ] On fetch error the page shows "Could not load data." with a Retry button

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: with synced calls in the database, totals and sorting match the API response; a zero-call salesperson still appears

---

## Task 3: Manager can view a salesperson's call stats

**Description:** Build the person stats page (`features/dashboard/`: `hooks/use-person-stats.ts`, `components/top-numbers-table.tsx`, `pages/person-page.tsx`) rendering `GET /api/dashboard/person/<id>` for any user the manager opens.

**Blocked by:** Task 2

**Spec refs:** `specs/dashboard.md` §Per-person stats, §Top 5 numbers; `screen.md` §Screen 3

**Acceptance criteria:**
- [ ] Three period blocks (today / yesterday / last 30 days) show dials, connected, talk minutes, and connected percent; null percent renders as "—"
- [ ] Top numbers table lists at most 5 numbers with total talk time and call count, highest first
- [ ] On fetch error the page shows "Could not load data." with a Retry button

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: open a salesperson with calls and one with no calls — the zero-dial periods show "—"

---

## Task 4: Manager can view the lead pool summary

**Description:** Build the leads page read path (`features/leads/`: `api/leads.api.ts` with `getLeadsSummary()`, `hooks/use-leads.ts`, `pages/leads-page.tsx`, `components/lead-pool-stats.tsx`, `components/lead-agent-table.tsx`) rendering `GET /api/leads/summary`.

**Blocked by:** Task 1

**Spec refs:** `specs/lead-management.md` §Lead pool manager summary; `screen.md` §Screen 4

**Acceptance criteria:**
- [ ] Pool buckets Waiting / Scheduled / Connected / Stopped show their counts
- [ ] The per-person table shows each active salesperson's today attempted, connected, and not-connected lead calls
- [ ] On fetch error the page shows "Could not load data." with a Retry button

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: with leads in the pool, bucket counts match the API response

---

## Task 5: Manager can upload a lead CSV

**Description:** Build the upload dialog (`features/leads/components/lead-upload-card.tsx` plus `uploadLeads(file, country)` in `leads.api.ts`) posting multipart form data to `POST /api/leads/upload`, then refreshing the summary.

**Blocked by:** Task 4

**Spec refs:** `specs/lead-management.md` §CSV upload; `api.md` §POST /api/leads/upload

**Acceptance criteria:**
- [ ] The dialog has a CSV file picker and a country dropdown (IN / AE / US); a successful upload shows the added / duplicates / invalid counts from the response
- [ ] Files over 2 MB and non-CSV picks are rejected inline with "File is too large." / "Please select a valid CSV file."
- [ ] The pool summary refreshes after a successful upload

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: upload a CSV containing new numbers, one in-file duplicate, and one unparseable line — counts match

---

## Task 6: Manager can view the accounts list

**Description:** Build the accounts read path (`features/accounts/`: `api/accounts.api.ts` with the list call, `hooks/use-accounts.ts`, `pages/accounts-page.tsx`) rendering `GET /api/users` with navigation into person stats.

**Blocked by:** Task 3

**Spec refs:** `specs/user-management.md` §List all accounts; `screen.md` §Screen 5

**Acceptance criteria:**
- [ ] All accounts — active and inactive — are listed with name, role, country, and status; inactive rows are greyed out
- [ ] Clicking any row, including a deactivated one, opens that person's stats page
- [ ] On fetch error the page shows "Could not load data." with a Retry button

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: deactivate a test account via API, confirm it greys out but stays listed and opens its stats page

---

## Task 7: Manager can add a salesperson account

**Description:** Build the create-account modal (`features/accounts/components/add-user-modal.tsx` plus `createUser()` in `accounts.api.ts`) posting to `POST /api/users`.

**Blocked by:** Task 6

**Spec refs:** `specs/user-management.md` §Create salesperson account

**Acceptance criteria:**
- [ ] Name, password, and country form; success closes the modal and the new account appears in the list
- [ ] Duplicate name, weak password, and invalid country each show the server's exact message inline in the modal
- [ ] The accounts list refreshes after creation

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: create a salesperson, then try the same name again and a weak password

---

## Task 8: Manager can edit a salesperson account

**Description:** Build the edit-account modal (`features/accounts/components/edit-user-modal.tsx` plus `updateUser()` in `accounts.api.ts`) posting to `POST /api/users/<id>/update`.

**Blocked by:** Task 6

**Spec refs:** `specs/user-management.md` §Edit account

**Acceptance criteria:**
- [ ] Name, password, and country are editable in any combination; success updates the row in the list
- [ ] A duplicate name shows the server's message inline; the manager can edit their own account
- [ ] Changing a salesperson's password invalidates their session (their old token gets 401 on next use)

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: rename an account; change a password and confirm the app session for that user is rejected

---

## Task 9: Manager can pause a salesperson's access

**Description:** Add the deactivate/activate toggle (`deactivateUser()` / `activateUser()` in `accounts.api.ts`) as a row action that pauses a salesperson's login and API access, and restores it.

**Blocked by:** Task 6

**Spec refs:** `specs/user-management.md` §Deactivate account, §Activate account

**Acceptance criteria:**
- [ ] Deactivating greys the row out and blocks that user's login with the spec's 403 message; activating restores normal login
- [ ] The manager's own row shows no pause control
- [ ] The deactivated person's past calls still count in team dashboard totals

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: deactivate a salesperson, confirm login fails, reactivate, confirm login works

---

## Task 10: Manager can delete a salesperson account

**Description:** Build the delete flow (`features/accounts/components/delete-dialog.tsx` plus `deleteUser()` in `accounts.api.ts`) calling `DELETE /api/users/<id>` with a confirmation dialog.

**Blocked by:** Task 6

**Spec refs:** `specs/user-management.md` §Delete account permanently

**Acceptance criteria:**
- [ ] The dialog warns the action cannot be undone; confirming removes the account and their calls shrink past team totals
- [ ] The manager's own row shows no delete control
- [ ] A lead claimed by the deleted user returns to the pool

**Verification:**
- [ ] Build succeeds: `npm run build` in `web/`
- [ ] Manual check: delete a test salesperson with calls; confirm they vanish from the list and team totals drop

---

## Task 11: Android app shell runs on a device

**Description:** Scaffold `app/` with bare React Native CLI + TypeScript per `structure.md §3`: NativeWind, React Native Reusables, bottom tabs (Dialer | My Stats) via React Navigation, the shared Axios client with token header, and CALL_PHONE + READ_CALL_LOG + READ_PHONE_STATE declared in the Android manifest. Install the libraries listed in `structure.md §1`.

**Blocked by:** None

**Spec refs:** `structure.md` §3; `specs/call-tracking.md` §Three Android permissions

**Acceptance criteria:**
- [ ] The app installs and launches on a physical Android phone showing the two-tab shell
- [ ] All three telephony permissions are declared in `app/android/` manifest
- [ ] The shared Axios client is wired so a 401 clears the stored token and returns to login

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: install the debug APK on a physical Android phone and confirm the shell opens

---

## Task 12: Salesperson can log in on the app

**Description:** Build the mobile login slice (`features/auth/`: `api/auth.api.ts`, `hooks/use-auth.ts`, `screens/login-screen.tsx`) with the root navigator switching between login and main tabs, storing token, user id, and country in AsyncStorage.

**Blocked by:** Task 11

**Spec refs:** `specs/authentication.md` — all scenarios; `screen.md` §Screen 6

**Acceptance criteria:**
- [ ] Valid login opens the main tabs; token, user id, and country persist across app restarts
- [ ] 401, 403, 429, and 400 responses each show their exact spec message
- [ ] Logging in again replaces the stored session, so the old token stops working

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: log in on the device against a reachable backend; force-close and reopen — still logged in

---

## Task 13: The app asks for call permissions

**Description:** Build the runtime permissions slice (`features/tracking/hooks/use-permissions.ts` and `features/dialer/components/permission-banner.tsx`): check all three permissions, request missing ones, and show the red banner until all are granted.

**Blocked by:** Task 11

**Spec refs:** `specs/call-tracking.md` §Three Android permissions

**Acceptance criteria:**
- [ ] Missing permissions are requested at runtime; with all three granted the banner is hidden
- [ ] With any one denied, a red banner shows with a Fix button that opens the app's Android settings page
- [ ] Granting the missing permission in settings clears the banner

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: deny a permission, see the banner, tap Fix, grant in settings, see the banner clear

---

## Task 14: Dial intents are queued locally in SQLite

**Description:** Build the local queue (`features/tracking/db/pending-calls-db.ts`) over `react-native-sqlite-storage` implementing the `pending_calls` table from `database.md §2` with insert, getAll, markFilled, delete, count, and clearAll operations.

**Blocked by:** Task 11

**Spec refs:** `database.md` §2; `specs/call-tracking.md` §Batch sync to server

**Acceptance criteria:**
- [ ] The table matches `database.md §2`: call_id, phone_number, intent_at, dialed_at, duration_seconds, attempts
- [ ] markFilled writes dialed_at and duration_seconds; unfilled rows keep them null
- [ ] count returns the exact number of rows in the queue (used later by the clear-data dialog)

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: insert and read back rows via a temporary debug entry point, then remove it

---

## Task 15: Real dials are captured from the call log (Path 1)

**Description:** Build the real-time tracker (`features/tracking/hooks/use-call-tracker.ts`): after hang-up, match the pending intent row against the OUTGOING call log with retries at 3 s / 10 s / 30 s, then fill the row and trigger a sync.

**Blocked by:** Tasks 13, 14

**Spec refs:** `specs/call-tracking.md` §Call-log matching — Path 1; `testing.md` §2 cases 1–5

**Acceptance criteria:**
- [ ] An OUTGOING entry for the same E.164 number within 1 minute of intent time fills dialed_at and real talk time (not ring time)
- [ ] Unanswered dials fill duration 0; incoming entries never match; two quick calls to the same number match in order
- [ ] A filled row immediately triggers a sync attempt

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: on a physical device run spike cases 1, 2, 4, 5 from `testing.md §2` (answered, unanswered, double dial, incoming ignore). Hardware validation can run in parallel — later tasks are not blocked on it.

---

## Task 16: Stale queued dials are completed by the janitor (Path 2)

**Description:** Build the janitor (`features/tracking/hooks/use-janitor.ts`): on every app foreground, inspect unfilled rows older than 1 hour, attempt a call-log match, count strikes, and give up after 5.

**Blocked by:** Tasks 13, 14

**Spec refs:** `specs/call-tracking.md` §Call-log matching — Path 2; `testing.md` §2 case 6

**Acceptance criteria:**
- [ ] On foreground, rows older than 1 hour with null duration get a call-log match attempt; a miss increments their attempts counter
- [ ] The 5th strike fills the row with `dialed_at = intent_at` and `duration_seconds = 0` so the dial still counts
- [ ] Rows under 1 hour old are left for Path 1

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: seed a row older than 1 hour directly in SQLite (or adjust the threshold temporarily), reopen the app, confirm strike/give-up behavior

---

## Task 17: Queued calls sync to the server

**Description:** Build the sync slice (`features/tracking/hooks/use-sync.ts`): janitor first, then batch all filled rows to `POST /api/calls/sync`, deleting sent rows on success and keeping them on failure. Wire it to app-foreground events and to Path 1 completions.

**Blocked by:** Tasks 15, 16

**Spec refs:** `specs/call-tracking.md` §Batch sync to server; `api.md` §POST /api/calls/sync

**Acceptance criteria:**
- [ ] Only filled rows are sent in one batch; a 200 response deletes exactly the sent rows
- [ ] Sync runs on every foreground event and immediately after Path 1 fills a row
- [ ] With the server unreachable, rows stay queued and go out on the next successful attempt

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: make a call offline, restore connectivity, foreground the app — the call appears on the web team dashboard and the local queue empties

---

## Task 18: Salesperson can dial a number manually

**Description:** Build the keypad dialer (`features/dialer/`: `components/keypad.tsx`, `hooks/use-dialer.ts`, `screens/dialer-screen.tsx` hosting the Dialer and Automated sub-tabs): number entry, paste, validation, and the tracked dial action.

**Blocked by:** Tasks 13, 14

**Spec refs:** `specs/call-tracking.md` §Dialer intent row, §Phone number normalization; `screen.md` §Screen 7

**Acceptance criteria:**
- [ ] A 12-key keypad with backspace and a Paste button ("Nothing copied." toast on an empty clipboard)
- [ ] The Call button stays grey until libphonenumber-js validates the number for the user's country, then turns green; tapping it writes exactly one intent row (E.164 + tap time), locks the button, and launches the dialer
- [ ] With CALL_PHONE denied, the native dialer opens, no row is written, and nothing is tracked

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: dial a real number — one row appears in the queue, the call places, and Path 1 fills it

---

## Task 19: Salesperson can call leads in the automated flow

**Description:** Build the automated calling loop (`features/dialer/`: `hooks/use-automated-calling.ts`, `components/lead-call-card.tsx`) as the Automated sub-tab: fetch-claim-dial loop over `POST /api/leads/next` with the post-call outcome dialog.

**Blocked by:** Task 18

**Spec refs:** `specs/lead-management.md` §Next-lead serving, §Lead scheduling; `api.md` §POST /api/leads/next; `screen.md` §Screen 7

**Acceptance criteria:**
- [ ] Start Calling fetches and claims the next lead and auto-dials it; the card shows the number and attempt count
- [ ] After hang-up, the outcome dialog offers Connected / Did not connect / Schedule with a date-time picker; Next sends the schedule (or no-op) and fetches the next lead in one request, with an auto-dial-next option
- [ ] An empty pool shows the empty state; scheduling in the past or beyond 30 days shows the server's 400 message

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: upload leads via the web dashboard, run the loop on the device, watch lead statuses change in `GET /api/leads/summary`

---

## Task 20: Salesperson can view their own stats

**Description:** Build the personal stats screen (`features/stats/`: `api/stats.api.ts`, `hooks/use-my-stats.ts`, `screens/my-stats-screen.tsx`) fetching `GET /api/dashboard/person/<own-id>` fresh on every tab open, with the gear icon linking to settings.

**Blocked by:** Task 12

**Spec refs:** `specs/dashboard.md` §Per-person stats; `screen.md` §Screen 8

**Acceptance criteria:**
- [ ] Today / yesterday / last 30 days blocks show dials, connected, talk minutes, and connected percent; null percent renders as "—"
- [ ] The top numbers table shows up to 5 numbers with talk time and call count
- [ ] A network error shows "Can't reach the server. Check your internet." — never fake zeros

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: with airplane mode on, see the error; reconnect and reopen the tab to see real numbers

---

## Task 21: Salesperson can clear local data

**Description:** Build the settings screen (`features/stats/screens/settings-screen.tsx`) with a single "Clear local data" action that wipes only the local SQLite queue after confirmation.

**Blocked by:** Tasks 14, 20

**Spec refs:** `specs/call-tracking.md` §Clear local data recovery; `screen.md` §Screen 9

**Acceptance criteria:**
- [ ] The confirmation dialog shows the exact number of unsent queued calls (can be zero)
- [ ] Confirming deletes all `pending_calls` rows; cancelling deletes nothing
- [ ] Server data is untouched by the action

**Verification:**
- [ ] Build succeeds: `./gradlew assembleDebug` in `app/android/`
- [ ] Manual check: queue rows offline, open settings, cancel once (rows intact), confirm once (queue empty, server unchanged)
