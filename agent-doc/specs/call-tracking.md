## Purpose

Ensures every dial made through the app is recorded, timestamped, and permanently associated with the salesperson who made it. The app captures real call events from Android's call log, not self-reported input.

## Requirements

### Requirement: Dialer intent row created on tap
The system SHALL write one intent row to the local SQLite queue the moment the Call button is tapped, before the call is placed, recording the phone number and the tap time.

#### Scenario: Call button tapped once
- **WHEN** a salesperson taps the Call button on a valid phone number
- **THEN** exactly one intent row is created in the local queue with the normalized E.164 number and the current phone time

#### Scenario: Call button double-tap
- **WHEN** the Call button is tapped a second time before the dialer takes over
- **THEN** only one intent row is created (the button is locked after the first tap)

### Requirement: Call-log matching — Path 1 (real-time)
The system SHALL attempt to match the pending intent row against the Android call log immediately after hang-up, retrying at 3 s, 10 s, and 30 s, then fill the row with `dialed_at` and `duration_seconds` from the matched entry.

#### Scenario: Normal answered call
- **WHEN** the call ends and an OUTGOING call-log entry for the same E.164 number appears within 1 minute of intent time
- **THEN** the intent row is filled with the actual `dialed_at` and the talk time (not ring time)

#### Scenario: Unanswered dial
- **WHEN** the call ends with no answer and an OUTGOING entry for that number exists
- **THEN** the intent row is filled with `duration_seconds = 0`

#### Scenario: Incoming call from the same number ignored
- **WHEN** the customer calls back before the matching attempt completes
- **THEN** the incoming call-log entry is ignored; only OUTGOING entries match

#### Scenario: Two quick calls to the same number
- **WHEN** a salesperson dials the same number twice in succession
- **THEN** the first intent row matches the first OUTGOING call-log entry in chronological order; the second intent row matches the second

### Requirement: Call-log matching — Path 2 (janitor)
The system SHALL inspect unfilled intent rows on every app open for rows older than 1 hour, attempt to complete them from the call log, and increment a strike counter for each attempt that finds no match.

#### Scenario: App killed mid-call — row completed at first open
- **WHEN** the app was killed during a call and reopened after 1 hour
- **THEN** the janitor finds the intent row, matches it from the call log, and fills it

#### Scenario: Row give-up after 5 janitor strikes
- **WHEN** an intent row has been checked 5 times without finding a call-log match
- **THEN** the row is filled with `dialed_at = intent_at` and `duration_seconds = 0` so the dial is counted

#### Scenario: Young rows untouched by janitor
- **WHEN** an intent row is less than 1 hour old at app open
- **THEN** the janitor skips that row and Path 1 remains responsible for it

### Requirement: Batch sync to server
The system SHALL send all filled intent rows (non-null `dialed_at` and `duration_seconds`) to the server in a single batch request on every app-foreground event and immediately after Path 1 fills a row.

#### Scenario: Sync sends only filled rows
- **WHEN** the app comes to the foreground with a mix of filled and unfilled rows
- **THEN** only filled rows are included in the batch; unfilled rows remain in the queue

#### Scenario: Successful sync clears sent rows
- **WHEN** the server responds with HTTP 200
- **THEN** the rows that were sent are deleted from the local queue

#### Scenario: Failed sync retains rows
- **WHEN** the server is unreachable
- **THEN** the rows remain in the local queue and are retried on the next app open

#### Scenario: Server deduplicates retried rows
- **WHEN** the same `call_id` is included in a later sync batch
- **THEN** the server skips it silently and still returns HTTP 200

### Requirement: Server-side call ingestion
The system SHALL accept batched calls, validate each row individually, save good rows to the `calls` table under the token owner's ID, discard bad rows with a log line, and skip calls older than `MAX_CALL_AGE_DAYS` days.

#### Scenario: Valid batch saved
- **WHEN** a sync batch contains valid call rows
- **THEN** all valid rows are inserted with the token owner's user ID and the server returns `{"status": true}`

#### Scenario: Old call dropped
- **WHEN** a call's `dialed_at` is more than 3 days before the server's current UTC time
- **THEN** the row is discarded with a server log entry and is not counted

#### Scenario: Malformed row in batch
- **WHEN** one row in the batch is missing required fields or has invalid data
- **THEN** that row is discarded; all other valid rows in the batch are saved; the server still returns `{"status": true}`

### Requirement: Phone number normalization
The system SHALL normalize all phone numbers to E.164 format using the user's assigned country code before storing or matching. If normalization fails, the raw digits SHALL be stored.

#### Scenario: Local-format number normalized
- **WHEN** a salesperson enters a 10-digit local number (e.g., for India)
- **THEN** it is stored as a full E.164 string (e.g., "+919876543210")

#### Scenario: International number passes through
- **WHEN** a number starts with "+" (self-identified international)
- **THEN** it is normalized using the international prefix and stored in E.164 format

#### Scenario: Unparseable number stored raw
- **WHEN** a number cannot be parsed by the phone library for the user's country
- **THEN** the raw digits are stored and the call is not lost

### Requirement: Three Android permissions required
The system SHALL request CALL_PHONE, READ_CALL_LOG, and READ_PHONE_STATE permissions at runtime and SHALL display a visible red banner when any one of them is denied.

#### Scenario: All permissions granted
- **WHEN** all three permissions are granted
- **THEN** the red banner is not shown and call tracking operates normally

#### Scenario: Any permission denied
- **WHEN** one or more of the three permissions is denied
- **THEN** a red banner is displayed with a Fix button that opens the app's Android settings page

#### Scenario: CALL_PHONE denied — Call button fallback
- **WHEN** CALL_PHONE permission is denied and the salesperson taps Call
- **THEN** the number is handed to the phone's native dialer; no intent row is written; the call is not tracked

### Requirement: Clear local data recovery
The system SHALL provide a settings action that wipes only the local SQLite queue after explicit user confirmation, without touching any server data.

#### Scenario: Clear confirmed
- **WHEN** the salesperson confirms the "Clear local data" action
- **THEN** all rows in the local `pending_calls` table are deleted and server data is unchanged

#### Scenario: Clear cancelled
- **WHEN** the salesperson cancels the confirmation dialog
- **THEN** no data is deleted

#### Scenario: Count shown in confirmation
- **WHEN** the confirmation dialog is shown
- **THEN** it displays the exact number of unsent calls that will be deleted (can be zero)
