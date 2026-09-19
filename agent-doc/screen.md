# Screens - Sales Call Tracker

Platform: Web app for the manager (responsive on mobile, tablet, PC) + Android app "Apex Sales Call" for salespeople

## Manager View (web)

The web is manager-only. A salesperson who opens it gets one message, no data.

### Screen 1: Login
- Name field - the login name (the name is the login ID)
- Password field
- Login button - signs in and opens the Team Dashboard
- Manager-only gate - a salesperson who logs in here sees one message and no data

**Edge cases:**
- Wrong name or password: "Wrong name or password."
- Correct details on a deactivated account: "Your account is not active. Please contact your manager."
- Salesperson logs in on the web: "This dashboard is for managers." and no data
- 10 wrong password tries for one name: "Too many tries. Wait 5 minutes and try again." - blocks even the correct password
- Login ended (signed in on another device, or the account was paused or its password changed): the next page goes back to this login

→ Next: Screen 2 Team Dashboard

### Screen 2: Team Dashboard - home after login
- Sidebar - product name, Dashboard, Teams, Accounts links, Logout at the bottom (icon rail on mobile, labeled bar on PC)
- Top bar - page title "Team Dashboard" and today's date
- Period switch - Today | Yesterday | Last 30 days; drives the KPI cards, Calls by hour, and Top 5 (one switch, not separate dropdowns)
- KPI cards (4) - Dials, Connected calls, Not connected, Talk minutes. Sub-line shows per-active-person per-day average; the Today card sub-line compares with yesterday instead (a partial day has no honest average)
- Calls by hour - dials per hour for the selected period; 30 days shows the daily average per hour; best hour highlighted
- Top 5 by minutes - the 5 people with the most talk time in the selected period
- Team table - one row per active salesperson: name, today dials / connected / minutes, yesterday dials / connected / minutes (not affected by the switch)
- Zeros included - a person with no calls still shows a row of zeros (seeing who is NOT calling is the point)
- Sorted by today's dials, highest first
- Tap a row - opens that person's Screen 3
- Totals count every call on record - including deactivated people's past calls, so a total can be larger than the sum of the rows shown
- Numbers update on open and page refresh - no live updates

**Edge cases:**
- No calls yet at all: totals show 0 and every active person still lists with zeros
- Backend does not load: "Could not load data." with a Retry button
- Login ended (signed in on another device): back to Screen 1 Login

→ Next: Screen 2b Teams

### Screen 2b: Teams - every active person, all three periods
- Sidebar item "Teams" opens this page
- One row per active salesperson: name, then Today / Yesterday / Last 30 days, each with dials, connected, minutes
- Same people and same order as the Screen 2 team table
- Zeros included - a person with no calls still lists
- Sorted by today's dials, highest first
- Tap a row - opens that person's Screen 3 for connected %, most contacted numbers, and more
- View only - nothing is edited here

**Edge cases:**
- No salespeople created yet: "No salespeople yet. Add them in Accounts."
- No calls yet: every person lists with zeros
- Backend does not load: "Could not load data." with a Retry button
- Login ended: back to Screen 1 Login

→ Next: Screen 3 Person View

### Screen 3: Person View
- Person's name as the heading
- KPI cards (4, last 30 days) - Active days (of 30), Avg dials, Avg connected, Avg minutes; averages per active day, not per calendar day
- Stats block - three rows (Today, Yesterday, Last 30 days), each with: Dials, Connected, Minutes, Connected %
- Connected % - connected ÷ dials for that period; "—" means the period has no dials yet, not 0%
- Most contacted numbers table (last 30 days) - number, minutes, calls; sorted by talk time
- No graphs - red flags (one number with huge minutes, the same number dialed daily) are read by eye from the table

**Edge cases:**
- No dials in a period: that period's Connected % shows "—"
- Fewer than 5 numbers in 30 days: the table lists what exists
- No calls in the last 30 days: "No calls in the last 30 days."
- Backend does not load: "Could not load data." with a Retry button

→ Next: Screen 4 Accounts

### Screen 4: Accounts
- Account list - every account: name, role, country, active or inactive; deactivated included
- Deactivated rows - greyed out, with an Activate button, so they can always be found again
- Tap an account row - opens that person's Screen 3 (deactivated people too - their call history stays reachable)
- Add person form - name, starting password, country dropdown (IN, AE, US); role is always Salesperson
- Per-row actions - Edit (name, password, country) · Deactivate or Activate · Delete
- Delete confirmation dialog - "This permanently removes NAME and all their calls. Cannot be undone."
- The list carries no call counts

**Edge cases:**
- Name already exists, on create or edit: "That name is already taken."
- Weak password (under 8 characters, or no uppercase or lowercase letter): "Password needs 8+ characters with an uppercase and a lowercase letter."
- Deactivate or delete aimed at the manager's own account: refused - "You cannot do this to your own account."
- Editing the manager's own name, password, or country: allowed like anyone else's
- No salespeople created yet: the list shows only the manager's own row

→ Next: Screen 5 Login (app)

## Salesperson View (Android app "Apex Sales Call")

### Screen 5: Login
Same as Screen 1 Login (shared design, same messages) - without the manager-only gate. A correct login opens the app straight to the Dialer.

→ Next: Screen 6 Dialer

### Screen 6: Dialer - home tab
- Bottom tab bar - Dialer | My Stats
- Number display - the number being typed
- Keypad - 0–9, *, #, and a backspace
- Paste button - fills the number field from anything copied anywhere on the phone
- Call button - grey and unpressable until the number is valid for the person's country; green when valid (a number starting with "+" is judged as international)
- Red banner (only when a permission is off) - "Calls are not being logged", with a Fix button that opens Android's settings page for the app
- After a call ends - nothing to tap; the call is recorded and sent to the server by itself

**Edge cases:**
- Paste with nothing copied: "Nothing copied." toast; the typed number stays untouched
- Number not valid yet: Call button stays grey
- Any of the three call permissions off: the red banner shows; Fix opens Android settings; the banner clears once all three are on
- Call permission off: tapping Call opens the phone's own dialer with the number filled - the call happens but is not recorded
- No internet: dialing works as always; the call reaches the server on a later app open
- Login ended (signed in on another phone, deactivated, or password changed): back to Screen 5 Login

→ Next: Screen 7 My Stats

### Screen 7: My Stats - second tab
Same as Screen 3 Person View, showing the salesperson's own numbers - plus:
- Gear icon in the header - opens Screen 8 Settings
- Loads fresh on every tab open - no saved copy on the phone

**Edge cases:**
- Server unreachable: "Can't reach the server. Check your internet." and no numbers - never fake zeros; the next open retries
- No dials in a period: that period's Connected % shows "—"
- Login ended (signed in on another phone, deactivated, or password changed): back to Screen 5 Login

→ Next: Screen 8 Settings

### Screen 8: Settings
- One item - Clear local data button
- Confirmation dialog - "This deletes N calls not yet sent to the server. Cannot be undone." (N is the real count of unsent calls on the phone)
- Confirm - wipes only the unsent calls on the phone; the server's numbers stay exactly as they are
- Cancel - nothing changes

**Edge cases:**
- No unsent calls: N shows 0 in the same message

→ Flow ends
