# Screens Index — Apex Sales Call

Open `index.html` to flip through the screens (arrow keys or the buttons; Mobile / iPad / Desktop previews).

| Screen | File | What it is for |
|---|---|---|
| Login | `01-login--P.html` | Manager signs in to the web dashboard |
| Dashboard | `02-dashboard--P.html` | Team numbers at a glance — KPI cards, calls-by-hour with outgoing/incoming split, Top 5 |
| Team — no salespeople yet | `02-team--empty--P.html` | Empty Team page pointing the manager to Accounts |
| Team | `02-team--P.html` | One row per active salesperson — today and yesterday numbers |
| Person View | `04-person-view--P.html` | One person's full record — cards, table, stacked hour chart, direction donut, top numbers |
| Person View — no incoming calls | `04-person-view--no-incoming--P.html` | Donut with zero incoming — full outgoing circle, "Incoming 0 calls · 0 min" |
| Person View — no calls | `04-person-view--no-calls--P.html` | Person with nothing in the last 30 days |
| Person View — load failed | `04-person-view--error--P.html` | Backend unreachable state |
| Leads | `04-leads--P.html` | Upload CSV, pool stage cards, per-person table |
| Leads — upload dialog | `04-leads--upload-dialog--P.html` | CSV picker with country choice |
| Leads — upload error | `04-leads--upload-error--P.html` | File rejected (too large / wrong format) |
| Leads — empty pool | `04-leads--empty--P.html` | No leads in the calling pool yet |
| Accounts | `05-accounts--P.html` | Every account with actions; deactivated included |
| Accounts — add dialog | `05-accounts--add-dialog--P.html` | Create a salesperson |
| Accounts — add form error | `05-accounts--add-error--P.html` | Name taken / weak password |
| Accounts — delete dialog | `05-accounts--delete-dialog--P.html` | Permanent-delete confirmation |
| Settings — office hours | `05-settings--P.html` | The one manager-editable office-hours window |
| Settings — end before start | `05-settings--error--P.html` | Invalid window refused |
| Login (app) | `06-login--M.html` | Salesperson signs in on the phone |
| Login — wrong details | `06-login--error--M.html` | Wrong name or password |
| Login — too many tries | `06-login--locked--M.html` | Lockout after 10 wrong tries |
| Dialer — Keypad & Automated | `07-dialer--M.html` | Home tab — keypad and the lead-calling flow with booking reminders |
| Dialer — empty number | `07-dialer--empty--M.html` | Call button locked until the number is valid |
| Dialer — permissions off | `07-dialer--permissions-off--M.html` | Red banner when any call permission is off |
| Dialer — Keypad — post-call popup | `07-dialer--post-call-keypad--M.html` | Popup after a keypad call with the schedule question |
| Dialer — Automated — Start Calling | `07-dialer--automated--M.html` | The lead-calling entry point |
| Dialer — Automated — post-call popup | `07-dialer--post-call--M.html` | Popup after a lead call, "Do not schedule" pre-selected |
| Dialer — post-call popup (Schedule chosen) | `07-dialer--post-call--schedule--M.html` | Date/time picker revealed in the popup |
| My Stats | `08-my-stats--M.html` | Cards, stacked hour chart, direction donut, performance table |
| My Stats — no incoming calls | `08-my-stats--no-incoming--M.html` | Donut full outgoing, "Incoming 0 calls · 0 min" |
| My Stats — server unreachable | `08-my-stats--offline--M.html` | Offline state — no fake zeros |
| Settings | `09-settings--M.html` | Four-row menu — clear data, do-not-track numbers, calling SIM, log out |
| Settings — clear data dialog | `09-settings--confirm-dialog--M.html` | Confirmation before wiping unsent calls |
| Do not track numbers | `09b-do-not-track--M.html` | Back button + Add number, table of private numbers with Remove per row |
| Do not track — add number dialog | `09b-do-not-track--add-dialog--M.html` | Pop-up to add a number (10 digits → +91) |
| Do not track — number already added | `09b-do-not-track--add-error--M.html` | Duplicate refused inside the pop-up |
| Calling SIM | `09c-calling-sim--M.html` | Pick the number every call leaves from — readable SIM numbers with carrier names, plus Use phone default |
| Calling SIM — numbers not readable | `09c-calling-sim--none-readable--M.html` | Phone hides its SIM numbers — calls stay on the phone's default SIM |
