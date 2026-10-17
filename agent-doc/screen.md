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
- The list is management only - rows do not open Person View; performance lives on Screen 2b Team
- Add person button, top right above the list - opens a dialog with the form: name, starting password, country dropdown (IN, AE, US); role is always Salesperson
- Per-row actions - Edit (name, password, country) · Deactivate or Activate · Delete
- The manager's own row shows no actions at all - no edit, no deactivate, no delete
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
- Bottom tab bar - Dialer | My Stats
- Sub-tab switch at top - compact, sleek pill switch: Keypad | Automated
- **Keypad view**:
  - Number display - the phone number being typed
  - Keypad - 0–9, *, #, and backspace
  - Paste button - fills the number field from clipboard
  - Call button - grey and unpressable until number is valid for country; green when valid
- **Automated view (Lead Calling Flow)**:
  - Screen 1 (Start calling): clean "Start Calling" button only (no lead preview card; the number is fetched directly from the server when calling starts)
  - Screen 2 (Calling & Outcome pop-up):
    - When Next / Start is clicked, phone automatically dials the lead
    - Post-call outcome dialog with 3 options:
      1. Connected
      2. Did not connect
      3. Schedule (reservation date/time picker)
    - Next call checkbox: "[✓] Auto-dial next lead" (check or uncheck whether to do the next call or pause)
    - Next button to submit outcome and advance
- Red banner (on both views when permission is off) - "Calls are not being logged", with a Fix button that opens Android app settings

**Edge cases:**
- Paste with nothing copied: "Nothing copied." toast; typed number stays untouched
- Number not valid yet: Call button stays grey
- Any of the three call permissions off: red banner shows; Fix opens Android settings; banner clears once all three are on
- Call permission off: tapping Call opens phone's native dialer - call happens but is not recorded
- Schedule time not in future or beyond 30 days: "Scheduled time must be in the future within 30 days."
- No internet: manual dialing and calling works as always; calls sync on later app open
- Login ended (signed in on another phone, deactivated, or password changed): back to Screen 6 Login

→ Next: Screen 8 My Stats

### Screen 8: My Stats - second tab
Same as Screen 3 Person View, showing the salesperson's own numbers - plus:
- Gear icon in the header - opens Screen 9 Settings
- Loads fresh on every tab open - no saved copy on the phone

**Edge cases:**
- Server unreachable: "Can't reach the server. Check your internet." and no numbers - never fake zeros; next open retries
- No dials in a period: that period's Connected % shows "—"
- Login ended (signed in on another phone, deactivated, or password changed): back to Screen 6 Login

→ Next: Screen 9 Settings

### Screen 9: Settings
- One item - Clear local data button
- Confirmation dialog - "This deletes N calls not yet sent to the server. Cannot be undone." (N is real count of unsent calls on phone)
- Confirm - wipes only the unsent calls on the phone; server numbers stay untouched
- Cancel - closes dialog without changes

**Edge cases:**
- No unsent calls: N shows 0 in the same message

→ Flow ends
