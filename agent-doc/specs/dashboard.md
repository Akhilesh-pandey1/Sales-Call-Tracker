## Purpose

Gives the manager a view of team call activity and gives each salesperson a view of their own numbers. The server computes every number in IST over UTC-stored times and returns one block per period — totals, computed KPIs, calls-by-hour, and top lists; the web and app screens render those returned values with display formatting only and compute nothing.

## Requirements

### Requirement: Per-period response shape
The system SHALL return dashboards as per-period objects — today, yesterday, and last_30_days — each carrying every number its screen shows: raw totals, the computed KPIs, that period's calls_by_hour, and the period's top list (top_people on the team response).

#### Scenario: Period switch renders one object
- **GIVEN** the manager is on the team dashboard
- **WHEN** the manager selects "Last 30 days"
- **THEN** the KPI cards, the calls-by-hour chart, and the top-people list all render the last_30_days object alone

#### Scenario: Period object is self-contained
- **GIVEN** any period object in a dashboard response
- **WHEN** the screen renders that period
- **THEN** it needs nothing outside the object — totals, computed KPIs, calls_by_hour, and the top list all come from it

### Requirement: Team KPI cards
The system SHALL show four KPI cards for the selected period — Dials, Connected calls, Not connected, and Talk minutes — rendering the returned totals with `avg_per_person_per_day` sub-lines, and on Today the returned `vs_yesterday` deltas in place of averages.

#### Scenario: Not connected rendered as returned
- **GIVEN** the period object returns 120 dials, 64 connected, and not_connected 56
- **WHEN** the cards render
- **THEN** Not connected shows 56 — the screen subtracts nothing

#### Scenario: Per-person daily average rendered from the response
- **GIVEN** the server returned an avg_per_person_per_day of 4 dials for the Last 30 days period
- **WHEN** the cards render
- **THEN** the Dials card shows that returned average as its sub-line

#### Scenario: Today delta rendered from vs_yesterday
- **GIVEN** the today object carries a vs_yesterday of −45 minutes
- **WHEN** the Today cards render
- **THEN** the Talk minutes card shows a 45-minute decrease against yesterday from the returned delta

### Requirement: Calls-by-hour chart
The system SHALL show dials per IST hour as a bar chart built only from the returned calls_by_hour block — hours spanning the office-hours window start to end inclusive, one returned count per hour, and the returned best_hour highlighted — with a one-line summary under it; hour labels such as "10 AM" are display formatting.

#### Scenario: Hours span the office-hours window
- **GIVEN** the office-hours window is 10:00–19:00
- **WHEN** the chart renders
- **THEN** exactly the hours 10 through 19 appear as bars — no hours outside the window

#### Scenario: Best hour highlighted from the returned value
- **GIVEN** the returned calls_by_hour names hour 12 as best_hour
- **WHEN** the chart renders
- **THEN** the hour-12 bar is highlighted as the best hour and the summary names it — the screen never scans the counts itself

#### Scenario: Thirty-day chart renders returned daily averages
- **GIVEN** the last_30_days calls_by_hour.dials holds per-day averages computed by the server
- **WHEN** the Last 30 days period is selected
- **THEN** each hour shows its returned average directly — the screen divides nothing

#### Scenario: Empty period shows a note
- **GIVEN** the selected period's calls_by_hour has best_hour null
- **WHEN** the chart area renders
- **THEN** a "No calls in this period." note shows instead of the chart and no best hour is highlighted

### Requirement: Top 5 people by talk time
The system SHALL list the active salespeople with the highest returned talk seconds for the selected period — at most five, highest first — each entry carrying its returned seconds and minutes.

#### Scenario: More than five contributors
- **GIVEN** 8 active salespeople hold talk time in the selected period
- **WHEN** the list renders
- **THEN** exactly the top 5 by talk seconds appear, highest first

#### Scenario: Fewer than five contributors
- **GIVEN** only 3 active salespeople hold talk time in the selected period
- **WHEN** the list renders
- **THEN** exactly those 3 appear

### Requirement: Team response carries no salesperson rows
The system SHALL keep the per-salesperson row list out of the team dashboard response — it carries only the period aggregates and top_people — while the backend still counts active salespeople internally to compute the per-person averages; per-salesperson rows return with the future Team section and its own endpoint.

#### Scenario: No people array in the team response
- **GIVEN** the manager requests the team dashboard
- **WHEN** the response is processed
- **THEN** it holds no per-salesperson row list — only the period objects with their aggregates and top_people

#### Scenario: Averages still account for every active salesperson
- **GIVEN** 5 active salespeople exist and the 30-day totals show 600 dials
- **WHEN** the server computes avg_per_person_per_day
- **THEN** the Dials average is 4 — counted against all active salespeople, though the response lists none of them

### Requirement: Team totals include deactivated people's calls
The system SHALL count every call recorded in the selected IST window in the team totals for today, yesterday, and the last 30 days, including calls made by currently deactivated salespeople.

#### Scenario: Deactivated person's calls still counted
- **GIVEN** a salesperson made calls today and was deactivated afterwards
- **WHEN** the manager opens the team dashboard
- **THEN** those calls remain counted in the team totals even though the person has no row in any list

#### Scenario: IST day boundary respected
- **GIVEN** a call is stored in UTC and falls inside yesterday's IST calendar day
- **WHEN** the team totals are computed
- **THEN** the call counts as yesterday's call, not today's

### Requirement: Manager-only team dashboard
The system SHALL restrict the team dashboard to manager tokens only.

#### Scenario: Manager access granted
- **GIVEN** a valid manager token
- **WHEN** the team dashboard data is requested
- **THEN** the server returns the team data

#### Scenario: Salesperson token rejected
- **GIVEN** a valid salesperson token
- **WHEN** the team dashboard data is requested
- **THEN** the server refuses with "This dashboard is for managers."

### Requirement: Person view KPI cards
The system SHALL show four last-30-day cards on a person's view — Active days out of 30, Avg dials, Avg connected, Avg minutes — rendering the returned active_days and avg_per_active_day values with the period totals as sub-lines, and showing "—" in all four cards when the returned active_days is 0.

#### Scenario: Averages rendered from the response
- **GIVEN** the last_30_days object returns active_days 26, avg_per_active_day dials 68, and dials 1,760
- **WHEN** the cards render
- **THEN** Avg dials shows 68 with "1,760 total" as its sub-line — the screen divides nothing

#### Scenario: No calls in 30 days
- **GIVEN** the last_30_days object returns active_days 0 and a null avg_per_active_day
- **WHEN** the cards render
- **THEN** all four averages show "—" and the page indicates no calls in the last 30 days

### Requirement: Person performance table
The system SHALL show Today, Yesterday, and Last 30 days rows with the returned dials, connected, minutes, and connected_percent of each period object, showing "—" where connected_percent is null.

#### Scenario: Connected percent rendered from the response
- **GIVEN** a period object returns 58 dials, 21 connected, and connected_percent 36
- **WHEN** the table renders
- **THEN** that period's connected percent shows 36%

#### Scenario: Zero dials in a period
- **GIVEN** a period object returns connected_percent null
- **WHEN** the table renders
- **THEN** that period's connected percent shows "—" — read as "no data yet", not 0%

### Requirement: Person calls-by-hour chart
The system SHALL carry calls_by_hour inside every period object of the person response and SHALL render the same calls-by-hour chart component as the team dashboard on the person page, from the returned block.

#### Scenario: Person page renders the shared chart
- **GIVEN** the person response carries calls_by_hour with office-hours hours, counts, and best_hour
- **WHEN** the person page renders
- **THEN** the same chart component the team dashboard uses shows those returned values

#### Scenario: Empty period on the person chart
- **GIVEN** a period's calls_by_hour has best_hour null
- **WHEN** that chart renders
- **THEN** the "No calls in this period." note shows instead of the chart

### Requirement: Most contacted numbers
The system SHALL show the person's top phone numbers by talk time over the last 30 days — at most five, each entry carrying its returned phone number, seconds, minutes, and call count, highest talk time first.

#### Scenario: Fewer than five numbers
- **GIVEN** the person called only 2 distinct numbers in the last 30 days
- **WHEN** the table renders
- **THEN** both numbers appear — the list is never padded

#### Scenario: No calls in the last 30 days
- **GIVEN** the person has no calls in the last 30 days
- **WHEN** the page renders
- **THEN** the empty-state message shows instead of the table

### Requirement: Salesperson self view
The system SHALL render the same person view for a salesperson's own ID on every My Stats tab open in the app, fetching fresh from the server with no local copy, and SHALL refuse a salesperson's request for another user's stats.

#### Scenario: Tab open fetches fresh
- **GIVEN** the salesperson opens the My Stats tab
- **WHEN** the view loads
- **THEN** it shows their current server-side numbers, never a saved copy

#### Scenario: Server unreachable
- **GIVEN** the app has no internet connection
- **WHEN** the My Stats tab opens
- **THEN** it shows "Can't reach the server. Check your internet." with no numbers — never fake zeros

#### Scenario: Another person's stats refused
- **GIVEN** a salesperson token requests the person endpoint of a different user
- **WHEN** the request is processed
- **THEN** the server refuses with "Access denied: you can only view your own statistics."

### Requirement: All dashboard math computed server-side
The system SHALL compute every dashboard number on the server in IST over UTC-stored times — period totals, not_connected, minutes, connected_percent, the per-person and per-active-day averages, vs_yesterday deltas, calls_by_hour counts, and best_hour — and screens SHALL only format returned values (thousand separators, percent signs, "10 AM" hour labels, card wording) without computing any number.

#### Scenario: Minutes returned, never divided on the screen
- **GIVEN** any dashboard response carries talk time
- **WHEN** a talk-minutes value is displayed
- **THEN** it uses the returned minutes field — the screen never divides seconds by 60

#### Scenario: Best hour returned, never scanned
- **GIVEN** the chart renders
- **WHEN** the best hour is shown
- **THEN** it uses the returned best_hour — the screen never compares counts to find it

#### Scenario: Screens format only
- **GIVEN** any dashboard screen
- **WHEN** it renders returned values
- **THEN** it adds only separators, percent signs, hour labels, and wording — no percentages, averages, deltas, or any other arithmetic

### Requirement: Dashboard failure and empty states
The system SHALL show "Could not load data." with a Retry button when any dashboard request fails, return to the login screen when the session has ended, and show the returned zero-value period when no calls exist at all.

#### Scenario: Backend unreachable
- **GIVEN** the dashboard cannot reach the server
- **WHEN** the page loads
- **THEN** it shows "Could not load data." with a Retry button

#### Scenario: Login ended
- **GIVEN** the manager's session is no longer valid
- **WHEN** any dashboard page loads
- **THEN** the app returns to the login screen

#### Scenario: No calls yet at all
- **GIVEN** no calls exist in the system
- **WHEN** the team dashboard renders
- **THEN** the totals show the returned zeros and the chart shows the "No calls in this period." note
