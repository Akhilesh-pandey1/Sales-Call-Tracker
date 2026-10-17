## Purpose

Ensures every dial made through the app is recorded, timestamped, and permanently associated with the salesperson who made it. The app captures real call events from Android's call log, not self-reported input.

## Requirements

### Requirement: Dialer intent row created on tap
The system SHALL write one intent row to the local SQLite queue the moment the Call button is tapped, before the call is placed, recording the phone number and the tap time.

#### Scenario: Call button tapped once
- **GIVEN** a salesperson entered a valid phone number
- **WHEN** the Call button is tapped
- **THEN** exactly one intent row is created in the local queue with the normalized E.164 number and the current phone time

#### Scenario: Call button double-tap
- **GIVEN** the Call button was just tapped and the dialer has not taken over yet
- **WHEN** the button is tapped a second time
- **THEN** only one intent row exists — the button stays locked until the dialer takes over

### Requirement: Call-log matching — Path 1 (real-time)
The system SHALL attempt to match the pending intent row against the Android call log immediately after hang-up, retrying at 3 s, 10 s, and 30 s, then fill the row with the dialed time and duration from the matched entry.

#### Scenario: Normal answered call
- **GIVEN** an OUTGOING call-log entry for the same E.164 number appears within 1 minute of the intent time
- **WHEN** the call ends and the match succeeds
- **THEN** the intent row is filled with the actual dialed time and the talk time — not the ring time

#### Scenario: Unanswered dial
- **GIVEN** the call ended with no answer and an OUTGOING entry for that number exists
- **WHEN** the match succeeds
- **THEN** the intent row is filled with duration 0

#### Scenario: Incoming call from the same number ignored
- **GIVEN** the customer calls back before the matching attempt completes
- **WHEN** the matcher inspects the call log
- **THEN** the incoming entry is ignored — only OUTGOING entries match

#### Scenario: Two quick calls to the same number
- **GIVEN** the salesperson dialed the same number twice in succession
- **WHEN** both calls are matched
- **THEN** the first intent row matches the first OUTGOING entry in chronological order and the second intent row matches the second

### Requirement: Call-log matching — Path 2 (janitor)
The system SHALL inspect unfilled intent rows on every app open for rows older than 1 hour, attempt to complete them from the call log, and increment a strike counter for each attempt that finds no match.

#### Scenario: App killed mid-call — row completed at first open
- **GIVEN** the app was killed during a call and reopened after 1 hour
- **WHEN** the janitor runs
- **THEN** the intent row is matched from the call log and filled

#### Scenario: Row give-up after 5 janitor strikes
- **GIVEN** an intent row has been checked 5 times without a call-log match
- **WHEN** the janitor runs a sixth time
- **THEN** the row is filled with the tap time as the dialed time and duration 0, so the dial is still counted

#### Scenario: Young rows untouched by janitor
- **GIVEN** an intent row less than 1 hour old at app open
- **WHEN** the janitor runs
- **THEN** the row is skipped and Path 1 remains responsible for it

### Requirement: Batch sync to server
The system SHALL send all filled intent rows to the server in a single batch request on every app-foreground event — after the janitor runs — and immediately after Path 1 fills a row; unfilled rows are never sent.

#### Scenario: Sync sends only filled rows
- **GIVEN** the queue holds a mix of filled and unfilled rows
- **WHEN** the app comes to the foreground
- **THEN** only filled rows are included in the batch; unfilled rows remain queued

#### Scenario: Successful sync clears sent rows
- **GIVEN** a batch was sent
- **WHEN** the server responds with success
- **THEN** exactly the sent rows are deleted from the local queue

#### Scenario: Failed sync retains rows
- **GIVEN** the server is unreachable
- **WHEN** a sync is attempted
- **THEN** all rows remain in the queue and go out on the next successful attempt

#### Scenario: Server deduplicates retried rows
- **GIVEN** a call ID the server already stored
- **WHEN** it arrives again in a later batch
- **THEN** the server skips it silently and still answers success

### Requirement: Server-side call ingestion
The system SHALL accept batched calls, validate each row individually, save good rows under the token owner's ID, discard bad rows with a log line, skip calls older than `MAX_CALL_AGE_DAYS` days, drop calls whose IST start minute falls outside the manager's office-hours window, and still answer success so the app can clear its queue.

#### Scenario: Valid batch saved
- **GIVEN** a sync batch of valid call rows
- **WHEN** the server processes it
- **THEN** all valid rows are inserted under the token owner's user ID and success is returned

#### Scenario: Old call dropped
- **GIVEN** a call dialed more than 3 days before the server's current time
- **WHEN** the batch is processed
- **THEN** the row is discarded with a server log entry and never counted

#### Scenario: Out-of-office-hours call dropped
- **GIVEN** a call whose IST start minute falls outside the manager's office-hours window
- **WHEN** the batch is processed
- **THEN** the row is discarded with a log line and success is still returned — the gate rules live in `specs/office-hours.md`

#### Scenario: Malformed row in batch
- **GIVEN** one row in the batch is missing required fields or holds invalid data
- **WHEN** the batch is processed
- **THEN** that row is discarded, all other valid rows are saved, and success is still returned

### Requirement: Phone number normalization
The system SHALL normalize all phone numbers to E.164 using the user's assigned country code before storing or matching; if normalization fails, the raw digits SHALL be stored so the call is never lost.

#### Scenario: Local-format number normalized
- **GIVEN** a salesperson entered a 10-digit local number for India
- **WHEN** the number is stored
- **THEN** it is stored as a full E.164 string

#### Scenario: International number passes through
- **GIVEN** a number starting with "+" that self-identifies its country
- **WHEN** the number is stored
- **THEN** it is normalized with its international prefix into E.164

#### Scenario: Unparseable number stored raw
- **GIVEN** a number the phone library cannot parse for the user's country
- **WHEN** the dial is recorded
- **THEN** the raw digits are stored and the call still counts

### Requirement: Three Android permissions required
The system SHALL request CALL_PHONE, READ_CALL_LOG, and READ_PHONE_STATE at runtime and SHALL show a visible red banner whenever any one of them is denied.

#### Scenario: All permissions granted
- **GIVEN** all three permissions are granted
- **WHEN** the app checks them
- **THEN** no banner shows and call tracking operates normally

#### Scenario: Any permission denied
- **GIVEN** one or more of the three permissions is denied
- **WHEN** the app checks them
- **THEN** a red banner shows with a Fix button that opens the app's Android settings page, and it clears once all three are granted

#### Scenario: CALL_PHONE denied — Call button fallback
- **GIVEN** CALL_PHONE is denied and the salesperson taps Call
- **WHEN** the dial is attempted
- **THEN** the number is handed to the phone's native dialer, no intent row is written, and the call is not tracked

### Requirement: Clear local data recovery
The system SHALL provide a settings action that wipes only the local SQLite queue after explicit confirmation showing the exact number of unsent calls, without touching any server data.

#### Scenario: Clear confirmed
- **GIVEN** the salesperson confirmed the clear action
- **WHEN** it executes
- **THEN** all local queue rows are deleted and server data is unchanged

#### Scenario: Clear cancelled
- **GIVEN** the confirmation dialog is showing
- **WHEN** the salesperson cancels
- **THEN** nothing is deleted

#### Scenario: Count shown in confirmation
- **GIVEN** the confirmation dialog opens
- **WHEN** it renders
- **THEN** it displays the exact number of unsent calls that will be deleted — which can be zero
