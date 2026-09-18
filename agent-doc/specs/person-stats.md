# Spec: person-stats

## Purpose

One person's calling numbers in one view — three periods, connected %, and the top 5 numbers. The manager's web Person view and the salesperson's own My Stats tab use the same endpoint, so the two screens can never disagree (Decisions 8, 16, 54).

## Requirements

### Requirement: Three periods with numbers

For any person, the endpoint SHALL return today, yesterday, and last 30 days — each with dials, connected, seconds, and connected_percent (connected ÷ dials for that period). All of it SHALL be computed on the server in IST over UTC-stored times (Decisions 32, 67).

#### Scenario: A normal person

- **WHEN** the endpoint is asked for a person who called today, yesterday, and over the last month
- **THEN** each period carries that period's dials, connected, seconds, and connected_percent

#### Scenario: No dials in a period

- **WHEN** a person has 0 dials in a period
- **THEN** that period's connected_percent comes back empty, and the screen shows "—" — "no data yet", not a 0% scolding (Decision 42)

### Requirement: Top 5 numbers

The response SHALL include the 5 numbers with the most talk time in the last 30 days, sorted by talk time, each with its call count (Decision 33).

#### Scenario: The red-flag table

- **WHEN** the person view renders
- **THEN** the top-numbers table shows number, minutes, and calls — and red flags (one number with huge minutes, the same number every day) are read by eye; no auto-flags, no graphs (Decision 16)

#### Scenario: Fewer than 5 numbers

- **WHEN** the person called fewer than 5 distinct numbers in 30 days
- **THEN** the table lists what exists

### Requirement: Who may see whom

The manager may open any person's view. A salesperson may fetch only their own — the app's My Stats uses the salesperson's own id saved at login (Decision 39).

#### Scenario: Salesperson asks for someone else

- **WHEN** a salesperson's request asks for another person's id
- **THEN** the server rejects it

#### Scenario: Own numbers

- **WHEN** the app's My Stats tab asks for the logged-in person's own id
- **THEN** the numbers come back

### Requirement: My Stats fetches fresh on every tab open

The app's My Stats SHALL call the endpoint on every tab open and show the answer — no local stats copy and no local counting, the server stays the single accountant (Decision 54).

#### Scenario: Always fresh

- **WHEN** the salesperson opens the My Stats tab
- **THEN** a fresh request is made and the answer is shown — their screen and the manager's screen agree

#### Scenario: Server unreachable

- **WHEN** the request fails because the server cannot be reached
- **THEN** the screen shows "Can't reach the server. Check your internet." and no numbers — never fake zeros; the next open retries (Decision 64)

### Requirement: Same display contract

As everywhere: the API returns seconds, the screens show minutes (seconds ÷ 60, rounded), sums only, and any total with at least 1 second shows at least "1 min" (Decisions 32, 82).

#### Scenario: Minutes on the person view

- **WHEN** a period holds 61200 seconds
- **THEN** the screen shows "1020 min"
