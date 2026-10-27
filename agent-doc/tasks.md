## Task 1: Server — removing a do-not-track number needs the manager password

**Description:** A new `do_not_track` backend module checks the manager password typed on the phone against the server's `DO_NOT_TRACK_REMOVE_PASSWORD` env value with a constant-time compare — nothing is stored, the endpoint only verifies (`api.md` — Do Not Track; `decisions.md` — Decisions 2, 3).

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**

- [ ] `POST /api/do-not-track/verify-remove-password` answers 200 `{"status": true}` on the correct password, 403 `"Wrong password. Ask your manager."` on a wrong one, and 400 `"Password is required."` on a missing or empty one (`api.md` — Do Not Track).
- [ ] Any active token may call it — no token gets 401 and a deactivated account's token gets the not-active 403 (`api.md` — Do Not Track).
- [ ] With `DO_NOT_TRACK_REMOVE_PASSWORD` unset the check fails closed with 503 `"Removing is not available yet. Contact support."`, the value is read when the request arrives, and `.env.example` carries the name with a placeholder (`decisions.md` — Decision 2, 3; `api.md` — Do Not Track).

**Verification:**

- [ ] Tests pass: `python -m pytest tests/modules/test_do_not_track.py` in `backend/`

## Task 2: App — a number leaves the do-not-track list only after the server accepts the manager password

**Description:** The Do-not-track screen's Remove button opens the manager-password popup — title "Remove number" with the number in brackets, one hidden password field, Cancel / Remove — and the number is deleted locally only when the server accepts the password (`screen.md` — Screen 9b; `decisions.md` — Decision 1, 3).

**Blocked by:** 1

**Status:** Not started

**Acceptance criteria:**

- [ ] Tapping Remove opens the popup for that number, the typed password goes to the verify endpoint, and the row disappears only on a server OK (`decisions.md` — Decision 1; `screen.md` — Screen 9b).
- [ ] Wrong password keeps the number and shows the server's `"Wrong password. Ask your manager."`; empty shows `"Enter the password."` and sends nothing; no internet shows `"Removing a number needs the internet. Connect and try again."` (`decisions.md` — Decision 3).
- [ ] Adding numbers and call tracking stay exactly as today — local and offline (`decisions.md` — Decision 1).

**Verification:**

- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
- [ ] Tests pass: `npx jest` in `app/`
