# Sales Call Tracker — Task List

Build order follows Decision 27: the tracking spike first (the only step with unknowns), then the API, the web, the app's remaining features, then deploy. How to build each part lives in `design.md`; what each part must do lives in the cited spec scenarios. Manual (human) steps are marked **[manual]**.

## 1. Manual setup — human steps before code starts

- [ ] 1.1 **[manual]** Get the oldest team Android phone physically in hand — it gates every spike scenario (specs/tracking-spike.md — all scenarios; Decisions 12, 75)
- [ ] 1.2 **[manual]** Create the release signature keystore by hand and keep it safe — every future APK update must use the same stamp (Decisions 9, 68)
- [ ] 1.3 **[manual]** Create the Neon Postgres project (Singapore), the Render service (small paid plan), and the private GitHub repo connected to Render — push to main auto-deploys (Decisions 20, 71, 79)
- [ ] 1.4 **[manual]** Add the README one-line command that prints a password hash, then create the one manager account by INSERT in the Neon console (design §5; Decisions 4, 19, 31)

## 2. Tracking spike — prove the chain on the oldest phone

- [ ] 2.1 Init `app/` as bare React Native (no Expo), app name "Apex Sales Call", Android manifest carrying the three permissions; install the three native libraries — call-log read, call-end listener, permissions (specs/tracking-spike.md — Chain proven; specs/call-dialer.md — The three permissions; Decisions 60, 72, 40)
- [ ] 2.2 Build the minimal local chain: tap Call → intent row (fresh call id, E.164 number, tap time) → call-log read → match (number + OUTGOING + within 1 minute after intent, in order) (specs/call-dialer.md — One tap creates exactly one intent row, Fill the row from the real call; specs/tracking-spike.md — Cases 1–5)
- [ ] 2.3 Add the real-time call-end listener with 3s / 10s / 30s retries after hang-up (specs/tracking-spike.md — Cases 7, 8; specs/call-dialer.md — Log entry lands late; Decision 50)
- [ ] 2.4 Add app-open janitor: complete rows older than 1 hour, 5-strike fill (tap time, duration 0) (specs/call-dialer.md — Complete missed rows on app open; specs/tracking-spike.md — Case 6; Decisions 11, 59)
- [ ] 2.5 **[manual + fix loop]** Run the eight-case checklist on the oldest phone until all eight pass; record the results (specs/tracking-spike.md — The eight-case checklist, One phone is enough)

## 3. API foundation

- [ ] 3.1 Flask skeleton: `config.py` named constants (lockout 10/5min, password rule, IST name, country shortlist, MAX_CALL_AGE_DAYS=3), `wsgi.py`, exception handler + `AppException`, database init (design §6; Decision 85)
- [ ] 3.2 SQLAlchemy models `database/user_model.py` + `database/call_model.py`: users and calls tables, unique call_id, index on (user_id, dialed_at) (design §2; specs/call-sync.md — The server keeps every row exactly once; Decision 90)

## 4. Login and auth

- [ ] 4.1 `POST /api/login`: name+password check, fresh token per login, response with token/id/role/name/country, distinct messages for wrong credentials vs deactivated (specs/login-auth.md — Login with name and password; Decision 43)
- [ ] 4.2 Token guard on every non-login route (401 on dead token), in-memory lockout after 10 wrong tries for 5 minutes, password rule check (specs/login-auth.md — Token sessions, Guess limit on passwords, Password rule)
- [ ] 4.3 `tests/test_login.py` — login paths and the lockout (specs/login-auth.md — same scenarios; Decision 61)

## 5. Call sync

- [ ] 5.1 `POST /api/calls/sync`: one batch, per-row processing — insert, silently skip existing call_id, discard broken row with log line, drop rows older than 3 days by real call time, always 200, rows saved under the token owner's id (specs/call-sync.md — The server keeps every row exactly once, Every call belongs to whoever's token sent it; Decisions 29, 35, 86, 89)
- [ ] 5.2 `tests/test_sync.py` — duplicates, broken rows, 3-day cutoff (specs/call-sync.md — same scenarios; Decisions 29, 35, 86)

## 6. Dashboard endpoints

- [ ] 6.1 IST day-window helper + `GET /api/dashboard/team`: today/yesterday totals counting deactivated people's past calls, active-salespeople rows with zeros, sorted by today's dials (specs/team-dashboard.md — Team totals on open, One row per active salesperson, Totals count everyone's calls; Decisions 58, 62)
- [ ] 6.2 `GET /api/dashboard/person/<id>`: three periods each with dials/connected/seconds/connected_percent, top 5 numbers by talk time with call counts, access rule (manager anyone, salesperson own id only) (specs/person-stats.md — Three periods, Top 5 numbers, Who may see whom; Decisions 39, 42, 67)
- [ ] 6.3 `tests/test_dashboard_periods.py` + `tests/test_totals.py` — IST boundaries over UTC; totals across deactivate/delete (specs/team-dashboard.md, specs/person-stats.md — same scenarios; Decision 61)

## 7. Account endpoints

- [ ] 7.1 `GET /api/users` (manager only, all accounts, deactivated included, no call counts) and `POST /api/users` (create: role fixed to salesperson, country shortlist, duplicate-name check, password rule) (specs/account-management.md — The full account list, Create a salesperson; Decisions 38, 70, 77)
- [ ] 7.2 `POST /api/users/<id>/update` (any of name/password/country; password kills old token; unique name), `deactivate` + `activate`, `DELETE /api/users/<id>` (permanent, removes all call rows), self-guards on deactivate/delete of the manager's own account (specs/account-management.md — Edit without losing history, Deactivate and activate, Permanent delete, The manager protects themself; Decisions 28, 31, 36, 48)
- [ ] 7.3 Extend `tests/test_totals.py` with deactivate/delete total checks (specs/account-management.md — Deactivate and activate, Permanent delete; Decision 61)

## 8. Web dashboard

- [ ] 8.1 Vite scaffold, `authService`/`dashboardService`/`userService`, `useAuth` (token in localStorage, 401 → login page), manager-only role gate with "This dashboard is for managers." (specs/login-auth.md — Token sessions, The web is manager-only; Decision 63)
- [ ] 8.2 `LoginPage.jsx` and shared `Navbar.jsx` with client-side Logout (clear token, show login — no endpoint) (specs/login-auth.md — Login with name and password, No logout endpoint; Decision 84)
- [ ] 8.3 `TeamPage.jsx` (Screen 1): totals + per-person table, zeros included, sorted, minutes display contract (≥1 sec shows ≥ "1 min"), "Software sold: --" fixed (specs/team-dashboard.md — all scenarios; Decisions 18, 82)
- [ ] 8.4 `PersonPage.jsx` (Screen 2): three periods with connected_percent ("—" when empty), top-5 table with minutes and calls (specs/person-stats.md — Three periods, Top 5 numbers, Same display contract; Decisions 42, 67)
- [ ] 8.5 `AccountsPage.jsx` (Screen 3): full list with greyed deactivated rows, add-person form (name, password, country dropdown), per-row Edit / Deactivate / Activate / Delete with the "cannot be undone" dialog, row tap → person view (specs/account-management.md — all scenarios; Decisions 28, 38, 58)
- [ ] 8.6 Build the web into `web/dist` and serve it from Flask through one catch-all route — same server, same origin, no API URL config (design §3/§6; Decision 83)

## 9. App — remaining features on top of the spike

- [ ] 9.1 `LoginPage` + auth storage: save token, own id, country; stay logged in; 401 → login screen (specs/login-auth.md — Login with name and password, Token sessions, App stays logged in; Decision 39)
- [ ] 9.2 Dialer screen: `Keypad` component, backspace, Paste (+ empty-clipboard toast), validity gate for the person's country, one-tap-one-row button lock, red banner + Fix button, CALL_PHONE-off fallback to the phone's dialer (specs/call-dialer.md — Number entry, Call button validity gate, One tap, Fallback; Decisions 73, 87, 88)
- [ ] 9.3 Sync wiring: `usePendingCalls` SQLite queue, `useSync` open sequence (janitor first, then one filled-rows-only batch; sync also right after a fill), clear sent rows on 200 (specs/call-sync.md — One batch of filled rows only, Sync runs on exactly two triggers; Decisions 55, 57)
- [ ] 9.4 My Stats tab (fetch own id on every open, "Can't reach the server." on failure) + gear icon → `SettingsPage` with Clear local data and its confirm dialog with the real count (specs/person-stats.md — My Stats fetches fresh; specs/call-sync.md — Clear local data; Decisions 56, 64)
- [ ] 9.5 Placeholder app icon (Decisions 72, 81) and **[manual]** sideload the signed APK on the team's phones

## 10. Deploy and end-to-end pass

- [ ] 10.1 Push to main → Render deploys (web build + gunicorn on `wsgi.py`); verify login, team dashboard, person view, and accounts on live data (design §3, §6; Decision 79)
- [ ] 10.2 **[manual]** Create the real salespeople accounts, distribute the APK, run one live day of calls, and confirm the dashboards answer "who called, how much" — with the spike checklist re-run if any person's numbers look wrong (specs/team-dashboard.md, specs/call-dialer.md — all scenarios; Decisions 1, 46)
