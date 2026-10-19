## Task 1: The server stops storing call outcomes

**Description:** The outcome flow is removed from the server (Decisions 160, 164). `POST /api/calls/sync` no longer reads or stores a per-call `outcome`, and the `PATCH /api/calls/<call_id>/outcome` endpoint is deleted with its service and schema code. The nullable `outcome` column stays on the `calls` table, never written, exactly as `database.md` records it. Tests follow `testing.md`: the old stored / absent / invalid outcome cases go, and sync asserts the column stays empty on every saved row.

**Blocked by:** None

**Status:** Done

**Acceptance criteria:**
- [x] Sync saves calls without reading an outcome field, and the `outcome` column stays empty on every saved row
- [x] `PATCH /api/calls/<call_id>/outcome` is gone, with its service and schema code
- [x] The outcome tests in `backend/tests/modules/test_calls.py` are replaced by the stays-empty case per `testing.md`

**Verification:**
- [x] Tests pass: `python -m pytest backend/tests/modules/test_calls.py` (from the project root)

---

## Task 2: `/api/leads/next` serves no lead when `continue_calling` is false

**Description:** The endpoint gains an optional `continue_calling` flag, true by default (Decision 163). When `false`, the request still applies a supplied schedule and releases the active claim, but skips serving and claiming entirely and answers `lead: null` — the salesperson who unchecked "Go to next call" gets no lead assigned. Automated calling for that person resumes only when they tap Start again.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] `continue_calling` defaults to true — without the flag the endpoint behaves exactly as before
- [ ] `continue_calling: false` still applies a supplied schedule and releases the active claim, then answers `lead: null`
- [ ] The flag is covered in `backend/tests/modules/test_leads.py` per `testing.md`

**Verification:**
- [ ] Tests pass: `python -m pytest backend/tests/modules/test_leads.py` (from the project root)

---

## Task 3: The post-call popup is rebuilt around a single Submit

**Description:** The popup never asks what happened (Decisions 159, 164): `keypad-outcome-dialog.tsx` and `outcome-option.tsx` are replaced by `post-call-dialog.tsx`, driven by `use-post-call-submit.ts`. The keypad version shows the dialed number with one OK; the lead version shows the schedule question with the date picker ("Do not schedule" pre-selected) and the pre-checked "Go to next call" checkbox. Submit reads the call log at the click and sends first: the server accepts → the pending row is deleted; the send fails → the filled row is saved locally for the next bulk sync; the log has no entry yet → the row stays unfilled for the janitor (Decisions 158, 161). The dead outcome code is deleted: the three outcome hooks, the app's PATCH client call, and the outcome path in the sync code — while the `pending_calls.outcome` column and its add-column migration stay in place, never written. The lead card keeps its button that reopens the popup after it was closed without Submit.

**Blocked by:** Task 1

**Status:** Not started

**Acceptance criteria:**
- [ ] The popup opens by itself when a call ends and is visible on the phone, carrying one Submit button — the keypad version shows the dialed number with OK; the lead version shows the schedule question with the date picker and the pre-checked "Go to next call" checkbox
- [ ] Submit reads the call log at the click and sends first — server accepts → the row is deleted; send fails → the filled row is saved locally; no log entry yet → the row stays unfilled for the janitor
- [ ] The dead outcome code is deleted (the outcome dialogs, `outcome-option.tsx`, the three outcome hooks, the PATCH client call, the sync outcome path), and the lead card's reopen button still reopens the popup after it was closed without Submit

**Verification:**
- [ ] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [ ] Lint passes: `npm run lint` (from `app/`)

---

## Task 4: The call-log read happens only at Submit

**Description:** The instant hang-up read and its 3s / 10s / 30s retries are removed (Decision 158) — they locked in 0 minutes on slow phones. `use-call-hang-up-detector.ts` is deleted with the call-log reading inside it, and `use-call-tracker.ts` keeps only the call-state listener that opens the post-call popup. The janitor (1-hour check, 5-strike give-up) is unchanged, and app open still runs janitor first, then bulk sync.

**Blocked by:** Task 3

**Status:** Not started

**Acceptance criteria:**
- [ ] The instant hang-up read and its retries are gone — `use-call-hang-up-detector.ts` is deleted with the call-log reading inside it
- [ ] `use-call-tracker.ts` keeps only the call-state listener that opens the post-call popup — no call-log reading anywhere outside the Submit click

**Verification:**
- [ ] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [ ] Lint passes: `npm run lint` (from `app/`)

---

## Task 5: The automated flow stops when Go-to-next is unchecked

**Description:** The automated flow's Submit saves the chosen schedule (if any) and claims the next lead through `/api/leads/next` only when "Go to next call" is checked — its default (Decisions 162, 163). With the box checked, the next lead's call starts immediately through the direct call (Decision 144). With the box unchecked, the request carries `continue_calling: false`, the schedule is still saved, no lead is served, and automated calling stops until the person taps Start again.

**Blocked by:** Task 2, Task 3

**Status:** Not started

**Acceptance criteria:**
- [ ] With "Go to next call" checked (the default), Submit saves the schedule (when chosen) and claims the next lead through `/api/leads/next`, and that lead's call starts immediately
- [ ] With the box unchecked, the request carries `continue_calling: false` — the schedule (if chosen) is still saved, no lead is served, and automated calling stops until Start again

**Verification:**
- [ ] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [ ] Lint passes: `npm run lint` (from `app/`)
