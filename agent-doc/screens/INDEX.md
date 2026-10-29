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
| Dialer — Keypad & Automated & My List | `07-dialer--M.html` | Home tab — three-item pill switch, keypad, and the lead-calling flow with booking reminders |
| Dialer — empty number | `07-dialer--empty--M.html` | Call button locked until the number is valid |
| Dialer — permissions off | `07-dialer--permissions-off--M.html` | Red banner when any call permission is off |
| Dialer — Keypad — post-call popup | `07-dialer--post-call-keypad--M.html` | Popup after a keypad call — Interested / Do not call again buttons, optional note, and the schedule question |
| Dialer — Automated — Start Calling | `07-dialer--automated--M.html` | The lead-calling entry point |
| Dialer — Automated — post-call popup | `07-dialer--post-call--M.html` | Popup after a lead call — outcome buttons + note, "Do not schedule" pre-selected |
| Dialer — post-call popup (Schedule chosen) | `07-dialer--post-call--schedule--M.html` | Date/time picker revealed in the popup |
| My List — personal calling list | `07a-my-list--M.html` | Start Calling + Upload / Download / Clear on top, My-Stats-style KPI cards (Left / Called / Interested / Do not call) — lives only on the phone, offline |
| My List — no numbers yet | `07a-my-list--empty--M.html` | KPI cards at zero with Upload as the invite |
| My List — upload — paste text | `07a-my-list--upload-paste--M.html` | Paste box for any messy text + Copy AI prompt — one of the two upload screens |
| My List — upload — pick file | `07a-my-list--upload-file--M.html` | One file input — tap and pick a CSV or Excel (.xlsx) file, read right on the phone |
| My List — upload result toast | `07a-my-list--upload-toast--M.html` | "Added 24 numbers. 2 not valid." after the upload closes |
| My List — clear confirmation | `07a-my-list--clear-dialog--M.html` | Shows the left and called counts before wiping the whole list |
| My List — post-call popup | `07a-my-list--post-call--M.html` | The same popup as the automated flow — outcome buttons (mutually exclusive), the schedule question, and the pre-checked "Go to next call"; booking lands on the Scheduled tab |
| My List — Interested numbers | `07a1-my-list-interested--M.html` | The Interested card's list — rows with Call, WhatsApp and notes icons, own CSV download |
| My List — Interested — empty | `07a1-my-list-interested--empty--M.html` | "No numbers here yet." — the shared list screen with nothing in it |
| Notes before a call | `07a2-notes-before-call--M.html` | Small popup over the list — just the notes, then Call; shows only when notes exist |
| Scheduled — due & upcoming callbacks | `07b-scheduled--M.html` | Every callback booked on this phone, due first — compact rows with Call, Copy and WhatsApp icons, reload in the header |
| Scheduled — nothing booked | `07b-scheduled--empty--M.html` | Empty state — "Nothing scheduled." |
| Scheduled — WhatsApp missing toast | `07b-scheduled--no-whatsapp--M.html` | "WhatsApp is not installed." toast on the WhatsApp button |
| History — every call on this phone | `07c-history--M.html` | Call log, newest first — compact rows like Scheduled, with direction, result, talk time, Scheduled chip, Call, Copy and WhatsApp icons, reload in the header |
| History — no calls yet | `07c-history--empty--M.html` | Empty state — "No calls yet." |
| History — WhatsApp missing toast | `07c-history--no-whatsapp--M.html` | "WhatsApp is not installed." toast on the WhatsApp button |
| My Stats | `08-my-stats--M.html` | Cards, stacked hour chart, direction donut, performance table |
| My Stats — no incoming calls | `08-my-stats--no-incoming--M.html` | Donut full outgoing, "Incoming 0 calls · 0 min" |
| My Stats — server unreachable | `08-my-stats--offline--M.html` | Offline state — no fake zeros |
| Settings | `09-settings--M.html` | Five-row menu — WhatsApp, do-not-track numbers, the Notes popup switch, clear data, log out |
| Settings — clear data dialog | `09-settings--confirm-dialog--M.html` | Confirmation before wiping unsent calls |
| Do not track numbers | `09b-do-not-track--M.html` | Back button + Add number, table of private numbers with Remove per row |
| Do not track — add number dialog | `09b-do-not-track--add-dialog--M.html` | Pop-up to add a number (10 digits → +91) |
| Do not track — number already added | `09b-do-not-track--add-error--M.html` | Duplicate refused inside the pop-up |
| Do not track — remove password dialog | `09b-do-not-track--remove-dialog--M.html` | Manager password asked before a number can be removed |
| Do not track — wrong password | `09b-do-not-track--remove-error--M.html` | "Wrong password. Ask your manager." — the number stays |
| WhatsApp settings | `09d-whatsapp--M.html` | Pick WhatsApp or WhatsApp Business, and edit the first message chats open with |
