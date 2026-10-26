# Sales Call Tracker - Decision Log


- **Decision 1:** The phone's History takes only calls from the install moment onward, and the install moment needs no key of its own — the existing "history last loaded" marker carries it. On a fresh start the marker does not exist; the first load treats "now" as its start line and saves that as the marker, so no before-install call ever imports. Every later load reads from the marker onward as it already does. A phone updating the app keeps its marker and re-imports nothing, and history rows already stored stay untouched. The sweep and live recording are untouched — they never imported before-first-open calls anyway.

- **Decision 2:** The history backfill inserts the same call once, even when the phone's call log holds two rows for it. Inside one batch, a fresh set of call keys starts empty beside the stored-keys set; after a row's call key is built, a key already in either set is skipped, and every accepted key joins the batch set before continuing. Two log rows for one real call insert once.

- **Decision 3:** The My List Download CSV carries the columns Number, Status, Interested, Do not call, Notes, Called date, Called time. Called date shows DD/MM and Called time shows HH:MM in the phone's own time — the way the History tab shows it — and both cells stay empty when the number was never called. The formula guard and the share-sheet flow stay exactly as they are.

- **Decision 4:** My Stats shows the office hours in the fuller clock form — like "10:00 to 7:00" — on the right of the "Last 30 days" heading. The server computes the fuller label from the stored window and sends it with every My Stats fetch, so it follows whatever window the manager last saved, and nothing shows before the first successful fetch. The short label keeps its existing use.

- **Decision 5:** The production crash "column users.auth_token does not exist" came from old code — its User model still had `auth_token` — running against the already-migrated database. The fix is deploying the current code; its startup migration moves any leftover tokens into the sessions table and drops the column when present, and skips everything when the column is already gone. No code change was made for this crash.
