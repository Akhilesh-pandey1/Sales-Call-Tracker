# Spec: team-dashboard

## Purpose

The manager's web home screen — who called, how many, how long, today and yesterday, without asking anyone (Decisions 2, 15). Data loads on login/refresh; there is no real-time in v1 (Decision 8).

## Requirements

### Requirement: Team totals on open

The dashboard SHALL open to team totals for today and yesterday: dials, connected calls, and total minutes. The totals SHALL come from real call events on record; connected SHALL be derived (duration above 0), never stored — a 0-second unanswered dial counts as a dial only (Decision 17).

#### Scenario: Numbers come from real calls

- **WHEN** the manager opens or refreshes the dashboard
- **THEN** the totals show every call on record for today and yesterday — no fake numbers, no auto-refresh

#### Scenario: Unanswered dials

- **WHEN** a salesperson makes 5 dials and 2 are answered
- **THEN** the totals count 5 dials and 2 connected

### Requirement: One row per active salesperson, zeros included

The team table SHALL list every active salesperson with the same numbers as the totals — zeros included, because the manager's core question is who is NOT calling. Rows SHALL be sorted by today's dials, highest first. Tapping a row SHALL open that person's view (Decisions 15, 33, 62).

#### Scenario: Zero-call person is visible

- **WHEN** an active salesperson has made no calls today
- **THEN** their row still shows in the table with zeros

#### Scenario: Sort order

- **WHEN** the table renders
- **THEN** the person with the most dials today is on top

#### Scenario: Tap through to the person

- **WHEN** the manager taps a person's row
- **THEN** that person's view opens with their id

### Requirement: Totals count everyone's calls

Team totals SHALL count every call on record — including calls of people who were deactivated later — so today's total never drops when someone is deactivated. The team table still lists active people only, so the total can be larger than the sum of the visible rows (Decision 58).

#### Scenario: Deactivation never shrinks today

- **WHEN** a salesperson makes 10 calls in the morning and is deactivated at noon
- **THEN** today's totals keep all 10 calls, and the table no longer shows that person

### Requirement: Display contract for minutes

The API returns seconds; the screen SHALL show minutes (seconds ÷ 60, rounded), and rounding SHALL apply only to what is displayed. Any total with at least 1 second SHALL show at least "1 min" (Decisions 32, 82).

#### Scenario: Rounding on sums

- **WHEN** a total holds 3720 seconds
- **THEN** the screen shows "62 min"

#### Scenario: Small totals

- **WHEN** a total holds 30 seconds
- **THEN** the screen shows "1 min", not "0 min"

### Requirement: All day math on the server

Today and yesterday boundaries SHALL be computed by the server in IST over UTC-stored times; the screen never does date math (Decisions 24, 32).

#### Scenario: IST day boundary

- **WHEN** a call is made at 02:00 IST (20:30 UTC the previous day)
- **THEN** it counts under the IST day it belongs to

### Requirement: Software sold placeholder

"Software sold" SHALL appear only as fixed text — `--` — on the dashboard. There SHALL be no endpoint, no entry flow, and no tracking logic for it in v1 (Decision 18).

#### Scenario: Always a placeholder

- **WHEN** the dashboard renders, on any day, for any data
- **THEN** "Software sold" shows `--`
