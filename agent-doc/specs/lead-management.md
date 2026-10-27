## Purpose

Gives the manager a shared pool of phone numbers to dial, and gives salespeople a one-tap automated calling flow that prevents two people from dialing the same number at once. Every call outcome is captured from the real call log — salespeople never manually report results.

## Requirements

### Requirement: CSV upload into lead pool
The system SHALL allow the manager to upload a CSV of phone numbers, turn every comma-separated value in the file into its own lead row, normalize each number to E.164 for the chosen country, and skip duplicates within the file, numbers already in the pool in any state, and unparseable values — each skipped value counted.

#### Scenario: Successful upload
- **GIVEN** the manager picked a supported country and a valid CSV of new phone numbers
- **WHEN** the upload completes
- **THEN** valid numbers join the pool as waiting leads and the response carries the added, duplicates, and invalid counts

#### Scenario: Comma-separated values become separate rows
- **GIVEN** a CSV line or cell holding several phone numbers separated by commas
- **WHEN** the upload is processed
- **THEN** each number becomes its own lead row

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
- **GIVEN** a CSV value cannot be parsed as a valid phone number for the chosen country
- **WHEN** the upload is processed
- **THEN** the value is skipped and counted as invalid; the rest of the upload continues

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

### Requirement: Expired bookings freed by the hourly job
The system SHALL run a booking-expiry job inside the server process that fires once the moment the server starts and then once every hour, clearing `scheduled_by` and `scheduled_at` on every `waiting` lead whose `scheduled_at` sits more than 24 hours (`SCHEDULE_EXPIRE_HOURS`) in the past — attempt counts untouched, freed leads returning to the newest-first pool. Serving SHALL never free a booking: only the job releases expired bookings.

#### Scenario: Expired booking cleared
- **GIVEN** a waiting lead whose booking sits more than 24 hours in the past
- **WHEN** the hourly job fires
- **THEN** `scheduled_by` and `scheduled_at` are cleared and the lead returns to the newest-first pool with its attempt count unchanged

#### Scenario: Young overdue booking stays reserved
- **GIVEN** a lead whose booking is overdue by less than 24 hours
- **WHEN** the hourly job fires
- **THEN** the booking stays — the lead is still reserved for its booker and invisible to the pool

#### Scenario: Serving never frees a booking
- **GIVEN** a lead holds an overdue-but-not-expired booking and is served to its booker
- **WHEN** no call happens
- **THEN** the booking stays — only the hourly job releases expired bookings

#### Scenario: Startup run recovers a sleeping server
- **GIVEN** the server was down and bookings expired while it was away
- **WHEN** the server starts
- **THEN** the job fires once immediately and frees everything that expired within seconds of waking

#### Scenario: Duplicate runs are harmless
- **GIVEN** the job fires twice over the same leads
- **WHEN** the second run processes an already-freed lead
- **THEN** the release is one idempotent update — nothing changes and nothing breaks

#### Scenario: Manager's Scheduled count drains within the hour
- **GIVEN** bookings have sat expired
- **WHEN** the hourly job has run
- **THEN** the lead summary's Scheduled count reflects the freed leads within the hour

### Requirement: Call outcome reaches the lead
When a synced and kept call matches a lead, the system SHALL store the call's outcome and note beside the lead's own state: Do not call again SHALL set the lead's status to stopped — never served again by any salesperson, even unconnected — with claims and schedules cleared; Interested SHALL be stored as a label with the normal retry rules running unchanged; and a call with no outcome SHALL resolve the lead exactly as before.

#### Scenario: Do not call again stops the lead
- **GIVEN** a synced call with the Do not call again choice matches a lead
- **WHEN** the sync is processed
- **THEN** the lead's status becomes stopped with claims and schedules cleared — it is never served again by any salesperson

#### Scenario: Stopped even when the call was unconnected
- **GIVEN** a synced unconnected call carrying the Do not call again choice matches a lead
- **WHEN** the sync is processed
- **THEN** the lead is still stopped — the choice does not need a connected call

#### Scenario: Interested stored as a label only
- **GIVEN** a synced call carrying the Interested choice matches a lead
- **WHEN** the sync is processed
- **THEN** the label is stored beside the lead's state and the normal retry rules keep running unchanged

#### Scenario: Note stored beside the lead
- **GIVEN** a synced call with a note typed matches a lead
- **WHEN** the sync is processed
- **THEN** the note is stored beside the lead's state with the outcome

#### Scenario: No outcome resolves as before
- **GIVEN** a synced call with no outcome choices matches a lead
- **WHEN** the sync is processed
- **THEN** the lead resolves by the normal connected / unconnected rules with no label stored

### Requirement: Lead card hands out its number
The system SHALL show a Copy button beside the lead's number on the automated lead calling card, available while ringing, during the call, and on the post-call popup; one tap copies the number with a "Number copied." toast.

#### Scenario: Copy available through the whole flow
- **GIVEN** the lead card is showing while the lead's call is ringing, in progress, or on its post-call popup
- **WHEN** the salesperson taps Copy
- **THEN** the lead's number is copied and a "Number copied." toast shows

#### Scenario: Copy leaves the flow untouched
- **GIVEN** the lead's call is live
- **WHEN** Copy is tapped
- **THEN** the call and the flow keep running exactly as they were
