## Purpose

Gives the manager a live view of team call activity and gives each salesperson a view of their own numbers. All date math, period bucketing, and aggregation happen on the server in IST; screens display returned aggregates and do display-level division only.

## Requirements

### Requirement: Team dashboard periods
The system SHALL offer three periods on the team dashboard — Today, Yesterday, and Last 30 days — and the selected period SHALL drive the KPI cards, the calls-by-hour chart, and the top-people list.

#### Scenario: Period switch changes displayed aggregates
- **GIVEN** the manager is on the team dashboard
- **WHEN** the manager selects "Last 30 days"
- **THEN** the KPI cards, the calls-by-hour chart, and the top-people list show the last-30-day aggregates

#### Scenario: Thirty-day hourly view shows daily average
- **GIVEN** the server returned 30-day dial totals per hour
- **WHEN** the Last 30 days period is selected
- **THEN** each hour shows its 30-day total divided by 30 as a daily average

### Requirement: Team totals include deactivated people's calls
The system SHALL count every call recorded in the selected IST window in the team totals for today, yesterday, and the last 30 days, including calls made by currently deactivated salespeople.

#### Scenario: Deactivated person's calls still counted
- **GIVEN** a salesperson made calls today and was deactivated afterwards
- **WHEN** the manager opens the team dashboard
- **THEN** those calls remain counted in the team totals even though the person has no row in the team table

#### Scenario: IST day boundary respected
- **GIVEN** a call is stored in UTC and falls inside yesterday's IST calendar day
- **WHEN** the team totals are computed
- **THEN** the call counts as yesterday's call, not today's

### Requirement: Team KPI cards
The system SHALL show four KPI cards for the selected period — Dials, Connected calls, Not connected, and Talk minutes — each with a per-active-person-per-day average sub-line; the Today cards compare against yesterday instead.

#### Scenario: Not connected derived from returned aggregates
- **GIVEN** the period totals show 120 dials and 64 connected calls
- **WHEN** the cards render
- **THEN** Not connected shows 56

#### Scenario: Per-person daily average
- **GIVEN** the team has 5 active people and the 30-day totals show 600 dials
- **WHEN** the cards render for the Last 30 days period
- **THEN** the Dials card shows an average of 4 dials per person per day

### Requirement: Calls by hour chart
The system SHALL show dials per IST hour for the selected period as a bar chart, highlight the best hour, and show a one-line summary under the chart.

#### Scenario: Best hour highlighted
- **GIVEN** hour 11 holds the highest dial count in the selected period
- **WHEN** the chart renders
- **THEN** the hour-11 bar is highlighted as the best hour and the summary names it

#### Scenario: Empty period shows a note
- **GIVEN** the selected period has zero dials in all 24 hours
- **WHEN** the chart area renders
- **THEN** a "No calls in this period." note shows instead of an empty chart and no best hour is highlighted

### Requirement: Top 5 people by talk time
The system SHALL list the active salespeople with the highest talk seconds for the selected period — at most five, highest first — with minutes derived from the returned seconds.

#### Scenario: More than five contributors
- **GIVEN** 8 active salespeople hold talk time in the selected period
- **WHEN** the list renders
- **THEN** exactly the top 5 by talk seconds appear, highest first

#### Scenario: Fewer than five contributors
- **GIVEN** only 3 active salespeople hold talk time in the selected period
- **WHEN** the list renders
- **THEN** exactly those 3 appear

### Requirement: Team table
The system SHALL list every active salesperson in a table with grouped Today and Yesterday columns (dials, connected, minutes), zeros included, sorted by today's dials descending, scrolling horizontally on narrow screens; tapping a row opens that person's view.

#### Scenario: Zero-call salesperson always listed
- **GIVEN** an active salesperson made no calls today or yesterday
- **WHEN** the table renders
- **THEN** their row appears with zeros — it is never hidden

#### Scenario: Sorted by today's dials
- **GIVEN** active salespeople hold different dial counts today
- **WHEN** the table renders
- **THEN** rows are ordered highest-to-lowest by today's dials

#### Scenario: Row opens person view
- **GIVEN** the team table shows a salesperson row
- **WHEN** the manager taps the row
- **THEN** that salesperson's person view opens

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
The system SHALL show four last-30-day cards on a person's view — Active days out of 30, Avg dials, Avg connected, Avg minutes — where each average divides the period total by active days, the period total shows as a sub-line, and a person with zero active days shows "—" in all four cards.

#### Scenario: Averages per active day
- **GIVEN** the person has 1,760 dials across 26 active days in the last 30 days
- **WHEN** the cards render
- **THEN** Avg dials shows 68 with "1,760 total" as its sub-line

#### Scenario: No calls in 30 days
- **GIVEN** the person has zero active days in the last 30 days
- **WHEN** the cards render
- **THEN** all four averages show "—" and the page indicates no calls in the last 30 days

### Requirement: Person performance table
The system SHALL show Today, Yesterday, and Last 30 days rows with dials, connected, minutes, and connected percent, where connected percent is connected ÷ dials and "—" when the period has zero dials.

#### Scenario: Connected percent computed
- **GIVEN** a period shows 58 dials and 21 connected calls
- **WHEN** the table renders
- **THEN** that period's connected percent shows 36%

#### Scenario: Zero dials in a period
- **GIVEN** a period has zero dials
- **WHEN** the table renders
- **THEN** that period's connected percent shows "—" — read as "no data yet", not 0%

### Requirement: Most contacted numbers
The system SHALL show the person's top phone numbers by talk time over the last 30 days — at most five, each with minutes and call count, highest talk time first.

#### Scenario: Fewer than five numbers
- **GIVEN** the person called only 2 distinct numbers in the last 30 days
- **WHEN** the table renders
- **THEN** both numbers appear — the list is never padded

#### Scenario: No calls in the last 30 days
- **GIVEN** the person has no calls in the last 30 days
- **WHEN** the page renders
- **THEN** the empty-state message shows instead of the table

### Requirement: Salesperson self view
The system SHALL render the same person view for a salesperson's own ID on every My Stats tab open in the app, fetching fresh from the server with no local copy.

#### Scenario: Tab open fetches fresh
- **GIVEN** the salesperson opens the My Stats tab
- **WHEN** the view loads
- **THEN** it shows their current server-side numbers, never a saved copy

#### Scenario: Server unreachable
- **GIVEN** the app has no internet connection
- **WHEN** the My Stats tab opens
- **THEN** it shows "Can't reach the server. Check your internet." with no numbers — never fake zeros

### Requirement: Server-side computation and display division
The system SHALL compute all date boundaries, period bucketing, and aggregation on the server in IST over UTC-stored times and return talk time in seconds; screens SHALL only divide returned aggregates for display (seconds to minutes, hourly totals to daily averages, totals to per-active-day averages, dials minus connected, percentage comparisons) and never perform date math themselves.

#### Scenario: API returns seconds
- **GIVEN** any dashboard endpoint responds
- **WHEN** the response carries talk time
- **THEN** it is expressed in whole seconds; screens convert to minutes for display

#### Scenario: Screens never bucket by date
- **GIVEN** any dashboard screen
- **WHEN** it renders periods or hour buckets
- **THEN** it uses only the server-returned blocks and never splits raw data by date itself

### Requirement: Dashboard failure and empty states
The system SHALL show "Could not load data." with a Retry button when any dashboard request fails, return to the login screen when the session has ended, and show zeros for totals when no calls exist at all.

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
- **THEN** totals show 0 and every active salesperson still lists with zeros
