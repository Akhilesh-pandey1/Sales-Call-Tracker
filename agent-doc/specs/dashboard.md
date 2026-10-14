## Purpose

Gives the manager a live view of team call activity and lets each salesperson check their own numbers. All calculations happen on the server; screens display only what the API returns.

## Requirements

### Requirement: Team dashboard — today and yesterday totals
The system SHALL return total dials, connected calls, and talk seconds for the full team for both today and yesterday as IST calendar days, including calls made by currently deactivated salespeople.

#### Scenario: Team totals include deactivated people's calls
- **WHEN** a salesperson is deactivated after making calls today
- **THEN** their calls are still counted in the team totals for today

#### Scenario: IST day boundary respected
- **WHEN** a call's UTC `dialed_at` falls in yesterday's IST window
- **THEN** it counts as yesterday's call, not today's

### Requirement: Team dashboard — per-person active salesperson list
The system SHALL return one row per active salesperson showing today's and yesterday's dials, connected calls, and talk seconds, including salespeople with zero calls, sorted by today's dials descending.

#### Scenario: Zero-call salesperson always listed
- **WHEN** an active salesperson has made no calls today
- **THEN** their row still appears with zeros — it is never hidden

#### Scenario: Sorted by today's dials
- **WHEN** multiple active salespeople have different dial counts today
- **THEN** the list is ordered highest-to-lowest by today's dials

#### Scenario: Deactivated salesperson excluded from people list
- **WHEN** a salesperson is deactivated
- **THEN** their row does not appear in the `people` array, even if they had calls today

#### Scenario: Team total can exceed sum of person rows
- **WHEN** a deactivated person has calls today
- **THEN** the team totals include those calls but the deactivated person's row is absent

### Requirement: Manager-only team dashboard access
The system SHALL restrict `GET /api/dashboard/team` to manager tokens only.

#### Scenario: Manager access granted
- **WHEN** a manager token is used to call the team dashboard endpoint
- **THEN** the server returns the team data

#### Scenario: Salesperson token rejected
- **WHEN** a salesperson token is used to call the team dashboard endpoint
- **THEN** the server returns HTTP 403 with message "This dashboard is for managers."

### Requirement: Per-person stats (today / yesterday / last 30 days)
The system SHALL return dials, connected calls, talk seconds, and connected percentage for a specific user across three periods: today, yesterday, and the last 30 days. Connected percentage SHALL be `null` when dials equal zero in a period.

#### Scenario: Normal stats
- **WHEN** a manager or the salesperson themselves requests person stats with calls in each period
- **THEN** each period includes dials, connected, seconds, and connected_percent as a rounded integer

#### Scenario: Zero dials in a period
- **WHEN** a user has no dials in a given period
- **THEN** connected_percent for that period is null (displayed as "—" on screen)

#### Scenario: Salesperson accessing own stats
- **WHEN** a salesperson token requests `GET /api/dashboard/person/<id>` where id matches their own user ID
- **THEN** the server returns their stats

#### Scenario: Salesperson accessing another person's stats
- **WHEN** a salesperson token requests stats for a different user ID
- **THEN** the server returns HTTP 403 with message "Access denied: you can only view your own statistics."

#### Scenario: User not found
- **WHEN** the requested user ID does not exist in the system
- **THEN** the server returns HTTP 404 with message "User not found."

### Requirement: Top 5 numbers by talk time
The system SHALL return at most 5 phone numbers with the highest total talk seconds for the requested user in the last 30 days, including the call count for each number.

#### Scenario: Top 5 returned
- **WHEN** a user has called more than 5 distinct numbers in the last 30 days
- **THEN** only the 5 with the highest total seconds are returned, sorted descending

#### Scenario: Fewer than 5 numbers
- **WHEN** a user has called fewer than 5 distinct numbers in the last 30 days
- **THEN** all distinct numbers are returned (no padding)

### Requirement: Server-side time calculations
The system SHALL perform all date boundary calculations in IST (Asia/Kolkata) and return talk time in seconds. Screens SHALL never perform date math or divide calls into periods themselves.

#### Scenario: API returns seconds
- **WHEN** any dashboard endpoint is called
- **THEN** talk time is expressed in whole seconds in the response; screens convert to minutes for display

#### Scenario: Connected is derived, not stored
- **WHEN** the dashboard aggregates calls
- **THEN** a call is counted as connected if and only if its `duration_seconds > 0`; no separate connected flag is stored in the database
