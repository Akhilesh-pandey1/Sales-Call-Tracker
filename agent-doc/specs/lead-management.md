## Purpose

Gives the manager a shared pool of phone numbers to dial, and gives salespeople a one-tap automated calling flow that prevents two people from dialing the same number at once. Every call outcome is captured from the real call log — salespeople never manually report results.

## Requirements

### Requirement: CSV upload into lead pool
The system SHALL allow the manager to upload a single-column CSV of phone numbers, normalize each number to E.164 for the chosen country, and skip duplicates within the file, numbers already in the pool in any state, and unparseable numbers — each skipped row counted.

#### Scenario: Successful upload
- **GIVEN** the manager picked a supported country and a valid CSV of new phone numbers
- **WHEN** the upload completes
- **THEN** valid numbers join the pool as waiting leads and the response carries the added, duplicates, and invalid counts

#### Scenario: File too large
- **GIVEN** a CSV over 2 MB (`MAX_LEAD_UPLOAD_MB`)
- **WHEN** the upload is attempted
- **THEN** the server refuses with "File is too large." and nothing is added

#### Scenario: Duplicate in file skipped
- **GIVEN** the same phone number appears more than once in the uploaded CSV
- **WHEN** the upload is processed
- **THEN** only the first occurrence is added; later occurrences count as duplicates

#### Scenario: Number already in pool skipped
- **GIVEN** an uploaded number already exists in the pool in any state (waiting, done, stopped)
- **WHEN** the upload is processed
- **THEN** the number is skipped and counted as a duplicate

#### Scenario: Unparseable number skipped
- **GIVEN** a CSV row cannot be parsed as a valid phone number for the chosen country
- **WHEN** the upload is processed
- **THEN** the row is skipped and counted as invalid; the rest of the upload continues

### Requirement: Lead pool manager summary
The system SHALL return the pool bucket counts — waiting split by attempt count (0, 1, and 2 calls so far), scheduled, connected (done), and stopped, with waiting equal to the split's sum — plus leads uploaded and leads tackled for today and yesterday, plus each active salesperson's today attempted, connected, and not-connected lead calls.

#### Scenario: Stage split returned
- **GIVEN** the waiting pool holds leads with attempt counts 0, 1, and 2
- **WHEN** the manager requests the lead summary
- **THEN** the waiting split returns each stage count and waiting equals their sum

#### Scenario: Uploaded counts by creation day
- **GIVEN** leads were uploaded on both today and yesterday
- **WHEN** the summary is requested
- **THEN** uploaded returns each day's count of leads whose creation time falls in that IST window

#### Scenario: Tackled counts distinct leads called
- **GIVEN** one lead was called twice today and another lead once yesterday
- **WHEN** the summary is requested
- **THEN** tackled shows 1 for today and 1 for yesterday — distinct leads, not call counts

#### Scenario: Zero yesterday hides percentage change
- **GIVEN** the uploaded or tackled count for yesterday is 0
- **WHEN** the daily cards render on the Leads page
- **THEN** no percentage change shows; the comparison reads "vs 0 yesterday"

### Requirement: Next-lead serving — priority order
The system SHALL serve leads in the following priority: (1) the current unexpired claim for the requesting salesperson; (2) due scheduled leads reserved for that salesperson; (3) the newest available pool lead with waiting status, no active claim, and no active retry lock.

#### Scenario: Unexpired claim returned first
- **GIVEN** the salesperson holds a claim on a lead that has not expired
- **WHEN** they request the next lead
- **THEN** the same lead is returned again

#### Scenario: Due scheduled lead served before pool
- **GIVEN** the salesperson has a scheduled lead whose time has passed
- **WHEN** they request the next lead
- **THEN** the scheduled lead is returned ahead of any waiting pool lead

#### Scenario: Newest waiting lead served
- **GIVEN** no unexpired claim and no due scheduled lead exist
- **WHEN** the salesperson requests the next lead
- **THEN** the newest lead with waiting status, no active claim, and an expired retry lock is returned

#### Scenario: Pool empty
- **GIVEN** no eligible lead exists for the salesperson
- **WHEN** they request the next lead
- **THEN** the server responds success with no lead

### Requirement: Lead claim window
The system SHALL claim the served lead for the requesting salesperson for 10 minutes (`CLAIM_MINUTES`); an expired claim makes the lead available to any salesperson again.

#### Scenario: Lead claimed on serve
- **GIVEN** a lead is about to be returned by the next-lead request
- **WHEN** the lead is served
- **THEN** it is claimed by that salesperson for 10 minutes

#### Scenario: Expired claim releases lead
- **GIVEN** a claimed lead received no call within 10 minutes
- **WHEN** the claim expires
- **THEN** the claim is cleared and another salesperson can receive the lead

### Requirement: Lead scheduling
The system SHALL allow a salesperson to schedule any lead that is neither done nor stopped, reserving it for themselves at a chosen future time within 30 days (`MAX_SCHEDULE_AHEAD_DAYS`), with scheduling and next-lead fetch combinable in a single request.

#### Scenario: Schedule accepted
- **GIVEN** a lead that is neither done nor stopped and a future time within 30 days
- **WHEN** the salesperson schedules it
- **THEN** the lead is reserved for that salesperson and no other salesperson's next-lead request serves it

#### Scenario: Schedule combined with next-lead fetch
- **GIVEN** the salesperson wants to schedule the current lead and continue calling
- **WHEN** the combined request is sent
- **THEN** both actions happen atomically: the current lead is scheduled and the next available lead is returned

#### Scenario: Schedule in the past rejected
- **GIVEN** a scheduled time in the past or more than 30 days ahead
- **WHEN** the schedule is submitted
- **THEN** the server refuses with "Scheduled time must be in the future within 30 days."

#### Scenario: Done or stopped lead cannot be scheduled
- **GIVEN** a lead with done or stopped status
- **WHEN** a schedule is attempted for it
- **THEN** the request is refused

### Requirement: Lead resolution via call sync
The system SHALL update a lead's status when a matching call is synced and kept by the server, matching on normalized phone number: connected finishes the lead, unconnected adds a failed attempt with a 2-hour retry lock, and the third unconnected attempt stops the lead; manual keypad calls to a lead's number resolve it the same way.

#### Scenario: Connected call finishes lead
- **GIVEN** a synced call with duration above zero matches a lead's number
- **WHEN** the sync is processed
- **THEN** the lead's status becomes done and all claims and schedules are cleared

#### Scenario: Unconnected call increments attempt and locks
- **GIVEN** a synced call with zero duration matches a waiting lead's number
- **WHEN** the sync is processed
- **THEN** the attempt count is incremented, the lead is retry-locked for 2 hours (`RETRY_LOCK_HOURS`), and claims and schedules are cleared

#### Scenario: Lead stopped at attempt cap
- **GIVEN** an unconnected call brings a lead's attempt count to 3 (`MAX_LEAD_ATTEMPTS`)
- **WHEN** the sync is processed
- **THEN** the lead's status becomes stopped and it is never served again

#### Scenario: Manual keypad call resolves matching lead
- **GIVEN** a salesperson dialed a number manually from the keypad
- **WHEN** the call syncs and its normalized number matches a waiting lead
- **THEN** the lead is resolved by the same connected / unconnected rules

#### Scenario: Discarded call leaves the lead unchanged
- **GIVEN** a synced call matching a waiting lead's number whose IST start minute falls outside the office-hours window
- **WHEN** the sync is processed
- **THEN** the call is discarded and the lead keeps its status, attempt count, and locks — only kept calls resolve leads

### Requirement: Lead state is authoritative and server-stored
The system SHALL store the full lead state — status, attempt count, last-attempted time, retry lock, claim, and schedule — on the server only, reading it directly from the leads table and never deriving it from the calls table.

#### Scenario: Lead state persists across devices
- **GIVEN** a salesperson signs in from a different phone on the same account
- **WHEN** lead state is served
- **THEN** it is unchanged and comes from the server

#### Scenario: Lead state never computed from calls
- **GIVEN** the summary or next-lead endpoint is called
- **WHEN** lead state is read
- **THEN** it comes from the leads table directly, not from a derivation over calls
