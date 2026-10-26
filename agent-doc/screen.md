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
- Login ended (password changed on another device, or the account deactivated or deleted): the next page goes back to this login

→ Next: Screen 2 Team Dashboard

### Screen 2: Dashboard - home after login
- Sidebar - product name, Dashboard, Team, Leads, Accounts, Settings links, Logout at the bottom (icon rail on mobile, labeled bar on PC)
- Top bar - page title "Dashboard" and today's date
- Period switch - Today | Yesterday | Last 30 days; drives the KPI cards, Calls by hour, and Top 5
- KPI cards (4) - Dials, Connected calls, Not connected, Talk minutes. Dials / Connected / Not connected count outgoing calls only (from the app and outside dialers); Talk minutes is TOTAL talk time - outgoing and incoming together. Sub-line shows per-active-person per-day average; the Today card sub-line compares with yesterday instead
- Calls by hour - ONE bar per hour: total calls that hour, split into two colored segments - outgoing and incoming - sized by share; 30 days shows the daily average per hour; best hour highlighted by total calls
- Bar hours - bars run from the office opening hour through the last full hour before closing - a 10-to-7 window shows 9 bars (10 through 6); a call starting exactly at closing counts in the last bar
- Bar counts - each segment's count sits in the vertical middle of its own color, the bar's total on top; a segment under one eighth of the tallest bar shows no count
- Color legend - one row under the chart: blue dot = outgoing, green dot = incoming
- Split line under the legend - reads like "142 outgoing · 37 incoming" for the selected period
- Top 5 by minutes - the 5 people with the most TOTAL talk time (outgoing and incoming together) in the selected period
- No person rows here - per-salesperson rows live on Screen 2b Team
- Totals count every call on record - including deactivated people's past calls
- Numbers update on open and page refresh - no live updates

**Edge cases:**
- No calls yet at all: totals show 0 and the chart shows the "No calls in this period." note
- Backend does not load: "Could not load data." with a Retry button
- Login ended (password changed, or the account deactivated or deleted): back to Screen 1 Login

**Graph - what it means:** Calls by hour shows how all team calling - outgoing and incoming - is distributed through the working day. The two segments in each bar show how much of that hour was dialing effort versus customers calling back. The manager uses it to find peak windows and quiet hours.

→ Next: Screen 2b Team

### Screen 2b: Team
- Sidebar item "Team" opens this page
- Top bar - clean page title "Team" (no date, no period switch)
- Team table - one row per active salesperson: name, today dials / connected / minutes, yesterday dials / connected / minutes. Dials and connected count outgoing calls only; minutes is TOTAL talk time (outgoing + incoming)
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
- KPI cards (4, last 30 days) - Active days (of 30), Avg dials, Avg connected, Avg minutes; averages per active day; Avg minutes is TOTAL talk (outgoing + incoming); Active days counts only days with an outgoing call
- Stats block - three rows (Today, Yesterday, Last 30 days), each with: Dials, Connected, Minutes, Connected %. Minutes is TOTAL talk; Dials / Connected count outgoing only
- Calls by hour - ONE stacked two-color bar per hour, same as the Dashboard - centered counts, color legend included - for this person only; its own small period switch (Today | Yesterday | Last 30 days) drives only this chart
- Donut chart - incoming vs outgoing share of TOTAL talk minutes for the period; its own small period switch (Today | Yesterday | Last 30 days); one line under it reads the exact numbers: "Outgoing 142 calls · 310 min — Incoming 37 calls · 52 min"
- Connected % - connected ÷ dials for that period; "—" means the period has no dials yet, not 0%
- Most contacted numbers table (last 30 days) - number, minutes, calls; sorted by TOTAL talk time (outgoing and incoming together)
- Red flags - one number with huge minutes, or the same number contacted daily - are read by eye from the Most contacted table

**Edge cases:**
- No dials in a period: that period's Connected % shows "—"
- Fewer than 5 numbers in 30 days: the table lists what exists
- No calls in the last 30 days: "No calls in the last 30 days."
- Chart period with no calls: the chart shows "No calls in this period."
- No incoming calls in a period: the donut shows the full circle as outgoing; the line reads "Incoming 0 calls · 0 min"
- Backend does not load: "Could not load data." with a Retry button

**Graph - what it means:** The donut shows how this person's talk time splits between calls they made and calls they received. The manager uses it to see whether the person drives conversations or mostly answers them. The stacked hour chart shows when both kinds happen.

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
  - Stopped - did not answer after 3 attempts, or the customer said "Do not call again"
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
- Saving a password change signs that person's other devices out at once - the device making the change stays in
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
Same as Screen 1 Login (shared design, same messages) - without the manager-only gate. A correct login runs the short step-by-step permission pass, then opens the app straight to the Dialer.

- Tapped-number step - one short instruction line, then Android's chooser opens once over a probe number that is never dialed; picking our app (Always) sends every number tapped anywhere on the phone straight to the Dialer keypad from then on
- Silent skip - when our app already handles tapped numbers, the step passes without showing anything
- Skip vs Don't show again - a plain skip brings the step back at the next login; the "Don't show again" button (found only on this step) refuses for good and the step never shows again

→ Next: Screen 7 Dialer

### Screen 7: Dialer - home tab
- Bottom tab bar - Dialer | Scheduled | History | My Stats | Settings
- Sub-tab switch at top - pill switch: Keypad | Automated | My List
- **Keypad view**:
  - Number display - the phone number being typed
  - Keypad - 0–9, *, #, and backspace (tap deletes one character, holding it clears the whole number)
  - Paste button - fills the number field from clipboard
  - Caught number fill - a number tapped anywhere on the phone (Contacts, WhatsApp, browser, SMS) lands here already typed - spaces and dashes stripped - Call button ready; backing out keeps the number and dials nothing
  - Call button - grey and unpressable until the number is valid for the country; green when valid; starts the call at once, no confirm step
  - Post-call popup - opens by itself when a keypad call ends; same popup as the lead call - the dialed number, the schedule choice (Do not schedule / Schedule) with the follow-up time field below, and one Submit button - no "Go to next call"
  - Submit clears the number - submitting the popup, either schedule choice, wipes the typed number to blank, ready for the next call
- **Automated view (lead calling)**:
  - Start Calling button - dials the next lead at once, one tap, no lead card step; a due booked lead comes first when it is time
  - Lead number with Copy button - one tap copies the lead's number while ringing, during the call, and on the post-call popup; "Number copied." toast
  - Post-call popup - opens by itself when the call ends: two choices - "Do not schedule" pre-selected and "Schedule", which reveals the follow-up time field below in the same popup; a pre-checked "Go to next call" checkbox; one Submit button
  - Submit - saves the chosen schedule and sends the call; with the box checked the next lead's call starts at once; with the box unchecked the flow pauses until Start Calling again
  - Booking a lead sets a reminder - at the booked time the phone itself shows "Time to call" with the lead's number; tapping the notification opens this screen straight to the booked lead's card, ready to call, and clears that booking from the Scheduled tab; one notification per booking, never repeats
  - Follow-up time field (both popups) - tapping it opens the phone's date picker first, then the time picker; starts at tomorrow 9:00 AM; past dates and dates beyond 30 days cannot be picked
  - Locked popup (both popups) - tapping outside or pressing the back button does nothing; Submit is the only way through
- Every post-call popup (all views) - carries the same two optional outcome buttons, Interested and Do not call again, plus an optional Notes box; the two buttons cannot both be on - tapping one clears the other, and tapping it again clears it too; nothing preselected, Submit works with it all empty
- Red banner (all views when any call permission is off) - "Calls are not being logged", with a Fix button that opens Android app settings

**Edge cases:**
- Paste with nothing copied: "Nothing copied." toast; typed number stays untouched
- Number not valid yet: Call button stays grey
- Tapped link with no readable number: the dialer opens with nothing filled
- Caught number while the automated flow is on screen: ignored - the live flow keeps its number and state
- Any of the three call permissions off: red banner shows; Fix opens Android settings; banner clears once all three are on
- Call permission off: tapping Call hands the number to the phone's own dialer (one extra tap there) - that call is not recorded
- Direct call fails to start: "Could not start the call. Please try again."
- Notification permission declined (asked once at the first booking): booking still works, no reminders fire, nothing nags
- Submitting a schedule on a lead booked by another salesperson: "This lead is already booked by someone else." - the call itself still records
- Popup closed without Submit, or app killed with the popup open: the call still records at the next app open; the popup does not come back
- No internet: dialing and lead calling work as always; calls sync on a later app open
- Login ended (password changed, deactivated, or deleted): back to Screen 6 Login

→ Next: Screen 7a My List

### Screen 7a: My List
The Dialer pill switch's third item - Keypad | Automated | My List. The salesperson's personal calling list: it lives only on this phone, never on the server, and the manager never sees it. Everything works offline.

- Action buttons at the top - a row of Upload, Download, Clear, with Start Calling right below them
- KPI cards (4, My Stats style) - Left, Called, Interested, Do not call; one big count per card; Left means never dialed, Called counts the Connected + Not connected rows together
- Row leaves Left after any recorded call to its number - from Start Calling or a keypad dial alike; the call's outcome and note are saved on the row
- Upload button - opens the upload dialog below
- Start Calling button - dials the Left numbers one by one
- Download button - exports the whole list as a CSV (number, status, interested, do-not-call, notes, called date) through Android's share sheet
- Clear button - wipes the whole list after a confirmation that shows the counts: left and called; the server is never touched
- Post-call popup - the same outcome buttons and Notes box every popup carries, plus the schedule choice and the pre-checked "Go to next call" checkbox (Screen 7); choosing Schedule books the number so it appears on the Scheduled tab with Call, Copy, and WhatsApp
- Uploading replaces - a number already on the list in any state has its old row deleted and is added fresh as Left; the same number twice in one upload counts once
- List cap - at most 10,000 numbers

**Upload - two screens, switched the same way (Paste text | File):**
- Paste text screen - a paste box that accepts any messy text and pulls out every phone-like number, plus the Copy AI prompt button
- File screen - one file input: tap it and pick a CSV or Excel (.xlsx) file from the phone; the file is read right on the phone, numbers sit in one column of the sheet

**Edge cases:**
- Upload toast: "Added N numbers." - with "M not valid." appended when some text was not readable as a number
- Start Calling reaches a Do-not-track number: it is skipped and never recorded
- Empty list: only the count chips at zero, with Upload as the invite

→ Next: Screen 7b Scheduled

### Screen 7b: Scheduled - second tab
- Every callback booked on this phone - so a dismissed notification never means a lost call; saved on the phone, works offline
- Due rows stand out - bookings past their time get a red border; the same count shows as a badge on the tab
- Bookings list - Due first (most overdue at top), then Upcoming soonest first
- Booking row - the number, the booked date and time, and a state badge: Upcoming (its time has not come) or Due (time passed, not handled)
- Tap a row - opens the booked lead's card ready to call
- Call icon per row - dials the number directly, and the same post-call popup as the keypad follows
- Reload icon in the header - pulls in newer bookings without reopening the tab
- Copy button per row - copies the number, "Number copied." toast
- WhatsApp button per row - opens the chosen WhatsApp app on that number's chat
- WhatsApp tap removes the row - the booking is handled without a call, so it leaves the list at once
- Call overwrites the booking - the popup after the direct call decides: "Do not schedule" leaves the row removed; a new schedule replaces the old booking with the new date
- Row also leaves the list when - the reminder notification is tapped, or 24 hours pass its booked time

**Edge cases:**
- Nothing booked: "Nothing scheduled."
- WhatsApp app not installed: "WhatsApp is not installed." toast

→ Next: Screen 7c History

### Screen 7c: History - third tab
- Every call this phone recorded - dialed out and incoming, saved on the phone; works offline
- Calls list - newest first, 50 rows at a time with a Load-more button at the bottom
- Call row - the number, an out or in mark, the date-time, and the result: connected with talk time, or not connected
- Call icon per row - dials the number directly, no keypad stop, and the same post-call popup as the keypad follows; rows look like the Scheduled tab rows; tapping the row dials too
- Reload icon in the header - pulls in newer calls without reopening the tab
- Copy button per row - copies the number, "Number copied." toast
- WhatsApp button per row - opens the chosen WhatsApp app on that number's chat
- Scheduled badge - shows on rows whose number has a booked callback
- First open after the update - the list fills once from the phone's own call log
- Every tab open - pulls in the calls made since the last look, even ones made while the app was closed
- Do-not-track numbers never appear here
- Calls made outside the office hours window never appear here - the same window the dashboards count, so History shows exactly what the dashboard counts

**Edge cases:**
- No calls yet: "No calls yet."
- WhatsApp app not installed: "WhatsApp is not installed." toast

→ Next: Screen 8 My Stats

### Screen 8: My Stats - fourth tab
- "Last 30 days" KPI cards (4) - Active days (out of 30), Avg dials, Avg connected, Avg minutes; averages per active day, with the 30-day totals as small sub-lines. Avg minutes is TOTAL talk time (outgoing + incoming); Active days counts only days with an outgoing call
- Office hours label - the office timing written in full clock form, like "10:00 to 7:00", on the right of the "Last 30 days" heading; it follows the manager's window at the next login or My Stats open
- Calls by hour - ONE bar per hour: total calls that hour, split into two colored segments - outgoing and incoming - sized by share, counts centered in their segments with the total on top; small period switch (Today | Yesterday | 30 days) opens on Today and drives only this chart; one-row color legend under the bars: blue dot = outgoing, green dot = incoming; one line under it names the best hour
- Bar hours - bars run from the office opening hour through the last full hour before closing - a 10-to-7 window shows 9 bars (10 through 6); a call starting exactly at closing counts in the last bar
- Donut chart - incoming vs outgoing share of TOTAL talk minutes; the same three-period switch drives it; one line under it reads the exact numbers: "Outgoing 142 calls · 310 min — Incoming 37 calls · 52 min"
- Performance table - three rows (Today, Yesterday, Last 30 days); the four headings are icons (phone, connected phone, clock, percent) and one line under the table names them: Dials, Connected, Minutes, Connected %. Minutes is TOTAL talk; Dials / Connected count outgoing only
- No most-contacted-numbers table here - that lives only on the manager's Person View
- Loads fresh on every tab open - no saved copy on the phone

**Edge cases:**
- Server unreachable: "Can't reach the server. Check your internet." and no numbers - never fake zeros; next open retries
- No dials in a period: that period's Connected % shows "—"
- Zero active days in the last 30: all four average cards show "—"
- Chart period with no calls: "No calls in this period." instead of the chart, with no best-hour line
- No incoming calls in a period: the donut shows the full circle as outgoing; the line reads "Incoming 0 calls · 0 min"
- Login ended (password changed, deactivated, or deleted): back to Screen 6 Login

**Graph - what it means:** The stacked hour bars show when the person's calling happens - the two segments show dialing effort versus customers calling back in each hour. The donut shows the overall split of talk time: how much they drove versus answered. Best hour follows total calls.

→ Next: Screen 9 Settings

### Screen 9: Settings - fifth tab
- Plain "Settings" title - no back arrow; this is a top-level tab
- Leaving and coming back always lands here - going to another tab and returning opens the Settings home, never a sub-page left open
- Five-row menu, each row icon + title + short description + chevron:
  1. WhatsApp - opens Screen 9d
  2. Calling SIM - opens Screen 9c
  3. Do not track numbers - opens Screen 9b
  4. Clear local data - deletes only the unsent calls on this phone; opens the confirm dialog
  5. Log out - sends unsent calls first, then signs out
- Confirmation dialog on Clear local data tap - "This deletes N calls not yet sent to the server. Cannot be undone." (N is the real count of unsent calls on the phone)
- Confirm - wipes only the unsent calls on the phone; server numbers stay untouched
- Cancel - closes dialog without changes
- Log out tap - first tries to send every unsent call; when none are left, clears the session and returns to the Login screen

**Edge cases:**
- No unsent calls: N shows 0 in the same message
- Log out with unsent calls and no internet: refused - "You have N calls not sent yet. Connect to the internet and log out."

→ Next: Screen 9b Do Not Track Numbers

### Screen 9b: Do Not Track Numbers
- Top bar - Back button on the left (returns to Screen 9), title "Do not track numbers", a bare + icon on the right (no text; it opens the add-number dialog)
- Privacy line - "Calls to or from these numbers are never recorded. This list stays on your phone only."
- Numbers table - one row per saved number: row number, the number in international format (+91...), a Remove button per row
- Add number button - opens a pop-up dialog with one phone-number field (typing 10 digits is fine - it saves in +91 format) and Cancel / Add buttons
- Numbers only - no names are stored with the numbers
- The list is local only - never sent to the server, works offline

**Edge cases:**
- Number not valid for the country: "Enter a valid phone number." - nothing is added
- Number already on the list: "This number is already on the list." - no duplicate row
- List is empty: "No numbers yet. Use Add number to keep a personal number private."
- Removing a number: the row disappears at once; that number is tracked again from now on

→ Next: Screen 9c Calling SIM

### Screen 9c: Calling SIM
- Opens from the Settings Calling SIM row
- SIM list - one item per SIM slot: "SIM 1 · Jio", "SIM 2 · Airtel" - the SIM's own number shows only when the phone has one
- Current choice checkmarked; a pick saves at once - every later call leaves on that slot, no SIM picker ever
- "Use phone default" item - calls go out on Android's default SIM again
- The choice stays on the slot - SIMs swapped between slots keep the choice
- No permissions are asked on this screen; with the Phone permission off, a note shows and calls stay on phone default

**Edge cases:**
- The phone shows no SIM numbers: a note says so and the phone default stays in use
- A call fails on the chosen slot: "Could not place the call on this SIM." - nothing dialed, nothing recorded; picking the SIM again here is the fix

→ Next: Screen 9d WhatsApp

### Screen 9d: WhatsApp
- Opens from the Settings WhatsApp row
- WhatsApp app choice - WhatsApp or WhatsApp Business, WhatsApp preselected; a pick saves at once on the phone, and every WhatsApp button in the app opens only the chosen one
- First message - a switch plus the editable message text below it; the switch comes ON from the first install with "Hello sir, Mai Apex Album AI se baat kar raha/rahi hu" already filled in - a phone that saved its own message keeps what it saved; chats open with the text pre-typed - the salesperson can always edit or clear it before sending, nothing ever sends by itself
- Save message - stores the text on the phone only; never synced

**Edge cases:**
- Chosen app not installed: "WhatsApp is not installed." toast
- First message switch on with empty text: chats open with an empty message field

→ Flow ends
