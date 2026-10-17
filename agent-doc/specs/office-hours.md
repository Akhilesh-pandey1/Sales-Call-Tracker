## Purpose

Keeps one manager-editable office-hours window that decides which synced calls count and which hours the calls-by-hour chart shows. Calls outside the window are dropped at sync, so no dashboard query ever needs an office-hours filter.

## Requirements

### Requirement: Single office-hours window
The system SHALL store exactly one office-hours window (start and end time only) in the database, default 10:00–19:00 IST, apply it to every day of the week with no working-day rule, and let the manager edit it from a small editor in the manager Settings screen.

#### Scenario: Default window on a fresh system
- **GIVEN** a fresh database
- **WHEN** the window is read
- **THEN** it is 10:00 to 19:00 IST

#### Scenario: Applies to every day of the week
- **GIVEN** the window 10:00–19:00
- **WHEN** a call is synced that started on a Sunday at 11:00 IST
- **THEN** the same window applies as on any other day — there is no day-of-week rule

#### Scenario: Manager reads the window
- **GIVEN** a manager token
- **WHEN** the office-hours endpoint is read
- **THEN** it returns the stored window as start and end HH:MM times

#### Scenario: Salesperson refused
- **GIVEN** a salesperson token calls either office-hours endpoint
- **WHEN** the request is processed
- **THEN** the server refuses with "This setting is for managers."

### Requirement: Window update validation
The system SHALL accept a window update only when it carries both a start and an end time in HH:MM with the end after the start, storing them as minutes since midnight IST, and the saved window SHALL apply to the next call sync and chart immediately.

#### Scenario: Valid update applies immediately
- **GIVEN** the manager submits 09:30–18:00 from the Settings-screen editor
- **WHEN** the update is saved
- **THEN** the next call sync and the chart use 09:30–18:00 at once

#### Scenario: End not after start refused
- **GIVEN** a submitted window whose end time is not after its start time
- **WHEN** the update is processed
- **THEN** the server refuses with "End time must be after start time."

#### Scenario: Malformed update refused
- **GIVEN** an update missing a time or carrying non-HH:MM values
- **WHEN** the update is processed
- **THEN** the server refuses with "Invalid request format: start_time and end_time required."

### Requirement: Office-hours gate at call sync
The system SHALL keep a synced call only when its IST start minute falls inside the window, both ends inclusive, judging by the call's own start time — never the sync moment — and SHALL discard outside calls with a warning log while still answering success so the app clears its queue.

#### Scenario: Window boundaries inclusive
- **GIVEN** the window 10:00–19:00
- **WHEN** calls starting 09:59, 10:00, 18:59, and 19:00 IST are synced
- **THEN** 10:00, 18:59, and 19:00 are kept and 09:59 is discarded

#### Scenario: Just after the window discarded
- **GIVEN** the window 10:00–19:00
- **WHEN** a call starting 19:01 IST is synced
- **THEN** it is discarded with a warning log

#### Scenario: Call's start time decides
- **GIVEN** a call that started 11:00 IST yesterday and is synced today
- **WHEN** the gate runs
- **THEN** it judges 11:00 — the call's own start minute — not the sync moment

#### Scenario: Discarded call still cleared from the app
- **GIVEN** a sync batch holds an out-of-window call
- **WHEN** the server answers
- **THEN** it answers success and the app deletes the row locally

#### Scenario: Refused calls appear nowhere
- **GIVEN** the gate discarded a call
- **WHEN** the manager or the salesperson opens any dashboard
- **THEN** the call appears in no total and no chart — the app itself is unchanged and keeps syncing exactly as before

### Requirement: No retroactive cleanup
The system SHALL leave every call stored before the gate untouched in totals — only newly synced calls are gated — and the calls-by-hour chart SHALL simply have no bucket for hours outside the window.

#### Scenario: Pre-gate call keeps counting
- **GIVEN** an 08:00 IST call stored before the office-hours gate existed
- **WHEN** totals are computed
- **THEN** the call still counts

#### Scenario: Pre-gate call has no chart bucket
- **GIVEN** the same 08:00 call and the window 10:00–19:00
- **WHEN** the chart renders
- **THEN** its hours span 10 through 19 only and the call appears in no bar
