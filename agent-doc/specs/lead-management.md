## Purpose

Gives the manager a shared pool of phone numbers to dial, and gives salespeople a one-tap automated calling flow that prevents two people from dialing the same number at once. Every call outcome is captured from the real call log — salespeople never manually report results.

## Requirements

### Requirement: CSV upload into lead pool
The system SHALL allow the manager to upload a single-column CSV of phone numbers. Each number SHALL be normalized to E.164 for the chosen country. Duplicates within the file, numbers already in the pool in any state, and unparseable numbers SHALL be skipped and counted.

#### Scenario: Successful upload
- **WHEN** the manager uploads a valid CSV with new phone numbers for a supported country
- **THEN** valid numbers are added to the pool as leads with `status = 'waiting'` and the server returns `{"status": true, "added": N, "duplicates": N, "invalid": N}`

#### Scenario: File too large
- **WHEN** the uploaded file exceeds 2 MB (`MAX_LEAD_UPLOAD_MB`)
- **THEN** the server returns HTTP 400 with message "File is too large."

#### Scenario: Duplicate in file skipped
- **WHEN** the same phone number appears more than once in the uploaded CSV
- **THEN** only the first occurrence is added; subsequent occurrences count as duplicates

#### Scenario: Number already in pool skipped
- **WHEN** an uploaded number already exists in the `leads` table in any state (waiting, done, stopped)
- **THEN** it is skipped and counted as a duplicate

#### Scenario: Unparseable number skipped
- **WHEN** a row in the CSV cannot be parsed as a valid phone number for the chosen country
- **THEN** it is skipped and counted as invalid; the rest of the upload continues

### Requirement: Lead pool manager summary
The system SHALL return pool bucket counts (waiting, scheduled, connected, stopped) and today's per-salesperson lead calling activity to the manager.

#### Scenario: Pool bucket counts returned
- **WHEN** the manager requests the lead summary
- **THEN** the response includes counts for each pool state (waiting, scheduled, connected/done, stopped)

#### Scenario: Per-person activity returned
- **WHEN** the manager requests the lead summary
- **THEN** each active salesperson's today attempted, connected, and not-connected lead calls are included

### Requirement: Next-lead serving — priority order
The system SHALL serve leads in the following priority: (1) current unexpired claim for the requesting salesperson; (2) due scheduled leads reserved for that salesperson; (3) newest available pool lead (`created_at DESC`) with `status = 'waiting'`, no active claim, and no active retry lock.

#### Scenario: Unexpired claim returned first
- **WHEN** the salesperson has an existing claim on a lead that has not expired
- **THEN** that same lead is returned again

#### Scenario: Due scheduled lead served before pool
- **WHEN** a salesperson has a scheduled lead whose `scheduled_at` is in the past
- **THEN** that lead is returned ahead of any waiting pool lead

#### Scenario: Newest waiting lead served
- **WHEN** there is no unexpired claim and no due scheduled lead
- **THEN** the newest lead with `status = 'waiting'` and no active retry lock is returned

#### Scenario: Pool empty
- **WHEN** no eligible lead exists for the salesperson
- **THEN** the server returns `{"status": true, "lead": null}`

### Requirement: Lead claim window
The system SHALL claim the served lead for the requesting salesperson for `CLAIM_MINUTES` (10 minutes). An unclaimed or expired claim makes the lead available to any salesperson again.

#### Scenario: Lead claimed on serve
- **WHEN** a lead is returned by `POST /api/leads/next`
- **THEN** the lead is marked as claimed by that salesperson for 10 minutes

#### Scenario: Expired claim releases lead
- **WHEN** 10 minutes pass without that salesperson calling the claimed lead
- **THEN** the lead's claim fields are cleared and another salesperson can receive it

### Requirement: Lead scheduling
The system SHALL allow a salesperson to schedule any lead that is neither `done` nor `stopped`, reserving it for themselves at a chosen future time within 30 days.

#### Scenario: Schedule accepted
- **WHEN** a salesperson schedules a lead with a future `scheduled_at` within 30 days
- **THEN** the lead is reserved for that salesperson; no other salesperson's next-lead request will serve it

#### Scenario: Schedule combined with next-lead fetch
- **WHEN** a salesperson submits a schedule for the current lead and requests the next lead in a single request
- **THEN** both actions happen atomically: the current lead is scheduled, and the next available lead is returned

#### Scenario: Schedule in the past rejected
- **WHEN** the salesperson submits a `scheduled_at` in the past or more than 30 days ahead
- **THEN** the server returns HTTP 400 with message "Scheduled time must be in the future within 30 days."

#### Scenario: Done or stopped lead cannot be scheduled
- **WHEN** a salesperson attempts to schedule a lead with `status = 'done'` or `'stopped'`
- **THEN** the request is refused

### Requirement: Lead resolution via call sync
The system SHALL update a lead's status when a matching call is synced, matching on normalized phone number.

#### Scenario: Connected call finishes lead
- **WHEN** a call sync includes a call with `duration_seconds > 0` for a phone number that matches a lead
- **THEN** the matching lead's `status` is set to `'done'` and all claims and schedules are cleared

#### Scenario: Unconnected call increments attempt and locks
- **WHEN** a call sync includes a call with `duration_seconds = 0` for a phone number that matches a waiting lead
- **THEN** `attempt_count` is incremented, `retry_locked_until` is set to `now() + 2 hours` (`RETRY_LOCK_HOURS`), and claims and schedules are cleared

#### Scenario: Lead stopped at attempt cap
- **WHEN** an unconnected call brings the lead's `attempt_count` to 3 (`MAX_LEAD_ATTEMPTS`)
- **THEN** the lead's `status` is set to `'stopped'` and it is never served again

#### Scenario: Manual keypad call resolves matching lead
- **WHEN** a salesperson dials a number manually and the normalized number matches a waiting lead
- **THEN** the lead is resolved by the call sync the same way as a lead call

### Requirement: Lead state is authoritative and server-stored
The system SHALL store the full lead state (status, attempt_count, last_attempted_at, retry lock, claim, schedule) on the server only. No lead state lives on the salesperson's device.

#### Scenario: Lead state persists across devices
- **WHEN** a salesperson uses a different phone (within the same account)
- **THEN** lead state is unchanged and served from the server

#### Scenario: Lead state is never computed from calls table
- **WHEN** lead summary or next-lead endpoint is called
- **THEN** lead status is read from the `leads` table directly, not derived from `calls`
