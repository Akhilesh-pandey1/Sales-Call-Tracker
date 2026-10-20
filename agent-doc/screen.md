# Screens - Sales Call Tracker

Platform: Web app for the manager (responsive on mobile, tablet, PC) + Android app "Apex Sales Call" for salespeople

## Manager View (web)

The web is manager-only. A salesperson who opens it gets one message, no data.

### Screen 1: Login
- Name field - the login name (the name is the login ID)
- Password field - login password
- Login button - signs in and opens the Dashboard
- Manager-only gate - a salesperson who logs in here sees one message and no data

**Edge cases:**
- Wrong name or password: "Wrong name or password."
- Correct details on a deactivated account: "Your account is not active. Please contact your manager."
- 10 wrong password tries for one name: "Too many tries. Wait 5 minutes and try again." - blocks even the correct password
- Login ended (signed in on another device, account paused, or password changed): the next page goes back to this login

→ Next: Screen 2 Team Dashboard

### Screen 2: Dashboard - home after login
- Sidebar - product name, Dashboard, Team, Leads, Accounts, Settings links, Logout at the bottom (icon rail on mobile, labeled bar on PC)
- Top bar - page title "Dashboard" and today's date
- Period switch - Today | Yesterday | Last 30 days; drives the KPI cards, Calls by hour, and Top 5
- KPI cards (4) - Dials, Connected calls, Not connected, Talk minutes. Sub-line shows per-active-person per-day average; the Today card sub-line compares with yesterday instead
- Calls by hour - dials per hour for the selected period; 30 days shows the daily average per hour; best hour highlighted
- Top 5 by minutes - the 5 people with the most talk time in the selected period
- No person rows here - per-salesperson rows live on Screen 2b Team
- Totals count every call on record - including deactivated people's past calls
- Numbers update on open and page refresh - no live updates

**Edge cases:**
- No calls yet at all: totals show 0 and the chart shows the "No calls in this period." note
- Backend does not load: "Could not load data." with a Retry button
- Login ended (signed in on another device): back to Screen 1 Login

**Graph - what it means:** Calls by hour shows how team dialing is distributed throughout the working day. The manager uses it to identify peak calling windows, see when activity drops off, and schedule team meetings outside high-volume hours.

→ Next: Screen 2b Team

### Screen 2b: Team
- Sidebar item "Team" opens this page
- Top bar - clean page title "Team" (no date, no period switch)
- Team table - one row per active salesperson: name, today dials / connected / minutes, yesterday dials / connected / minutes
- Zeros included - a person with no calls still shows a row of zeros (seeing who is NOT calling is the point)
- Sorted by today's dials, highest first
- Tap a row - opens that person's Screen 3 Person View
- On mobile the table becomes one card per person with the same numbers

**Edge cases:**
- No calls yet at all: every active person still lists with zeros
- No salespeople created yet: an empty state prompts the manager to add people in Accounts
- Backend does not load: "Could not load data." with a Retry button
- Login ended: back to Screen 1 Login

→ Next: Screen 3 Person View

### Screen 3: Person View
- Person's name as the heading
- Back link - returns to the section the person was opened from (Team for an active person, Accounts for a deactivated one)
- KPI cards (4, last 30 days) - Active days (of 30), Avg dials, Avg connected, Avg minutes; averages per active day, not calendar day
- Stats block - three rows (Today, Yesterday, Last 30 days), each with: Dials, Connected, Minutes, Connected %
- Calls by hour - the same chart as the Dashboard, for this person only; its own small period switch (Today | Yesterday | Last 30 days) drives only this chart
- Connected % - connected ÷ dials for that period; "—" means the period has no dials yet, not 0%
- Most contacted numbers table (last 30 days) - number, minutes, calls; sorted by talk time
- Red flags - one number with huge minutes, or the same number dialed daily - are read by eye from the Most contacted table

**Edge cases:**
- No dials in a period: that period's Connected % shows "—"
- Fewer than 5 numbers in 30 days: the table lists what exists
- No calls in the last 30 days: "No calls in the last 30 days."
- Chart period with no calls: the chart shows "No calls in this period."
- Backend does not load: "Could not load data." with a Retry button

→ Next: Screen 4 Leads

### Screen 4: Leads
- Sidebar item "Leads" opens this page
- Top bar - clean page title "Leads" on the left; "Upload Leads" button on the right (no date or time in header)
- Upload modal dialog - opens on clicking "Upload Leads": single-column CSV file picker (phone numbers only, max 2 MB), country dropdown (IN, AE, US), Cancel and Upload buttons
- Floating Sonner toast notification on upload completion: "150 new leads added to the active calling queue."
- Daily KPI cards (2) - Leads Uploaded (today vs yesterday) and Leads Tackled (today vs yesterday)
- Active Lead Pool stage cards (5) - backlog in calling queue:
  - Waiting (0 calls) - fresh leads never dialed yet
  - Waiting (1 call) - dialed 1 time without answer, awaiting 2nd retry
  - Waiting (2 calls) - dialed 2 times without answer, awaiting final retry
  - Scheduled - callbacks requested for a specific date and time
  - Stopped - did not answer after 3 attempts (max retries reached)
- Active Lead Pool visual composition bar - shows distribution across 0-call, 1-call, 2-call, scheduled, and stopped stages
- Numbers update on open and page refresh - no live updates

**Edge cases:**
- File over 2 MB: modal displays error "File size exceeds 2 MB limit (maximum file size is 2 MB)."
- Invalid file format: modal displays error "Invalid CSV format: file must contain a single column of phone numbers."
- Pool is completely empty: all pool cards show 0, with a clean "No leads in calling pool" prompt and Upload Leads button
- Backend does not load: "Could not load data." with a Retry button
- Login ended: back to Screen 1 Login

→ Next: Screen 5 Accounts

### Screen 5: Accounts
- Account list - every account: name, role, country, active or inactive; deactivated included
- Deactivated rows - greyed out, with an Activate button, so they can always be found again
- Accounts count in the list header - "8 accounts · 7 active"
- Row taps - an active row does not open anything (performance lives on Screen 2b Team); a deactivated person's row opens their Person View, read-only
- Add person button, top right above the list - opens a dialog with the form: name, starting password, country dropdown (IN, AE, US); role is always Salesperson
- Per-row actions - Edit (name, password, country) · Deactivate or Activate · Delete
- The manager's own row shows no actions at all - no edit, no deactivate, no delete; it carries a "You" badge
- Delete confirmation dialog - "This permanently removes NAME and all their calls. Cannot be undone."
- The list carries no call counts

**Edge cases:**
- Name already exists, on create or edit: "That name is already taken."
- Weak password (under 8 characters, or no uppercase or lowercase letter): "Password needs 8+ characters with an uppercase and a lowercase letter."
- Deactivate or delete aimed at the manager's own account: refused - "You cannot do this to your own account."
- No salespeople created yet: the list shows only the manager's own row

→ Next: Screen 5b Settings (web)

### Screen 5b: Settings (web)
- Sidebar item "Settings" opens this page - manager only
- One card - Office hours: shows the current window, for example "10:00 - 19:00 IST"
- Edit - start time and end time fields (HH:MM) and a Save button
- Save applies the window at once - the next call sync and every Calls-by-hour chart use it immediately
- One window for every day of the week - Sunday included; no working-day rule

**Edge cases:**
- End time not after start time: "End time must be after start time."
- Missing or malformed time: "Invalid request format: start_time and end_time required."
- Backend does not load: "Could not load data." with a Retry button
- Login ended: back to Screen 1 Login

→ Next: Screen 6 Login (app)

## Salesperson View (Android app "Apex Sales Call")

### Screen 6: Login
Same as Screen 1 Login (shared design, same messages) - without the manager-only gate. A correct login opens the app straight to the Dialer.

→ Next: Screen 7 Dialer

### Screen 7: Dialer - home tab
- Bottom tab bar - Dialer | My Stats | Settings
- Sub-tab switch at top - pill switch: Keypad | Automated
- **Keypad view**:
  - Number display - the phone number being typed
  - Keypad - 0–9, *, #, and backspace (tap deletes one character, holding it clears the whole number)
  - Paste button - fills the number field from clipboard
  - Call button - grey and unpressable until the number is valid for the country; green when valid; starts the call at once, no confirm step
  - Post-call popup - opens by itself when a keypad call ends; same popup as the lead call - the dialed number, the schedule question with the follow-up time field below, and one Submit button - no "Go to next call"
- **Automated view (lead calling)**:
  - Start Calling button - dials the next lead at once, one tap, no lead card step
  - Post-call popup - opens by itself when the call ends: "Schedule this number for the next call?" with two choices - "Do not schedule" pre-selected and "Schedule", which reveals the follow-up time field below in the same popup; a pre-checked "Go to next call" checkbox; one Submit button
  - Submit - saves the chosen schedule and sends the call; with the box checked the next lead's call starts at once; with the box unchecked the flow pauses until Start Calling again
  - Follow-up time field (both popups) - tapping it opens the phone's date picker first, then the time picker; starts at tomorrow 9:00 AM; past dates and dates beyond 30 days cannot be picked
  - Locked popup (both popups) - tapping outside or pressing the back button does nothing; Submit is the only way through
- Red banner (both views when any call permission is off) - "Calls are not being logged", with a Fix button that opens Android app settings

**Edge cases:**
- Paste with nothing copied: "Nothing copied." toast; typed number stays untouched
- Number not valid yet: Call button stays grey
- Any of the three call permissions off: red banner shows; Fix opens Android settings; banner clears once all three are on
- Call permission off: tapping Call hands the number to the phone's own dialer (one extra tap there) - that call is not recorded
- Direct call fails to start: "Could not start the call. Please try again."
- Popup closed without Submit, or app killed with the popup open: the call still records at the next app open; the popup does not come back
- No internet: dialing and lead calling work as always; calls sync on a later app open
- Login ended (signed in on another phone, deactivated, or password changed): back to Screen 6 Login

→ Next: Screen 8 My Stats

### Screen 8: My Stats - second tab
- "Last 30 days" KPI cards (4) - Active days (out of 30), Avg dials, Avg connected, Avg minutes; averages per active day, with the 30-day totals as small sub-lines
- Calls by hour - the salesperson's own dials per hour; small period switch (Today | Yesterday | 30 days) opens on Today and drives only this chart; one line under it names the best hour
- Performance table - three rows (Today, Yesterday, Last 30 days); the four headings are icons (phone, connected phone, clock, percent) and one line under the table names them: Dials, Connected, Minutes, Connected %
- No most-contacted-numbers table here - that lives only on the manager's Person View
- Loads fresh on every tab open - no saved copy on the phone

**Edge cases:**
- Server unreachable: "Can't reach the server. Check your internet." and no numbers - never fake zeros; next open retries
- No dials in a period: that period's Connected % shows "—"
- Zero active days in the last 30: all four average cards show "—"
- Chart period with no calls: "No calls in this period." instead of the chart, with no best-hour line
- Login ended (signed in on another phone, deactivated, or password changed): back to Screen 6 Login

**Graph - what it means:** Same chart as Screen 2, but only this salesperson's calls - the person sees their own busy and quiet hours.

→ Next: Screen 9 Settings

### Screen 9: Settings - third tab
- Plain "Settings" title - no back arrow; this is a top-level tab
- Log out row - under the Clear local data row; icon, title, and a short description
- Log out tap - first tries to send every unsent call; when none are left, clears the session and returns to the Login screen
- Clear local data row - icon, title, and a short description of what it wipes, all shown in full
- Confirmation dialog on tap - "This deletes N calls not yet sent to the server. Cannot be undone." (N is the real count of unsent calls on the phone)
- Confirm - wipes only the unsent calls on the phone; server numbers stay untouched
- Cancel - closes dialog without changes

**Edge cases:**
- No unsent calls: N shows 0 in the same message
- Log out with unsent calls and no internet: refused - "You have N calls not sent yet. Connect to the internet and log out."

→ Flow ends
