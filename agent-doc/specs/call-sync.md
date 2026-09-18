# Spec: call-sync

## Purpose

Moves filled call rows from the phone to the server exactly once, in batches, even after offline days — nothing fake is sent, nothing is counted twice (Decisions 10, 29).

## Requirements

### Requirement: One batch of filled rows only

The app SHALL send all its filled rows — rows with a real time and duration — in one single batch request, whether there is 1 row or 40. Rows still empty SHALL wait for the janitor and ride a later sync: an empty row has nothing real to store (Decisions 29, 57).

#### Scenario: Filled rows go, empty rows stay

- **WHEN** the queue holds 2 filled rows and 1 empty row at sync time
- **THEN** the batch contains the 2 filled rows and the empty row keeps waiting

#### Scenario: Same path for any count

- **WHEN** the queue holds 1 row or 40 rows
- **THEN** the same one-request batch is used — no special cases

### Requirement: Sync runs on exactly two triggers

Sync SHALL run only while the app is in the foreground, on two triggers: (a) app open — after the janitor has completed or struck what it can; (b) immediately after a row is filled at call end. There is no background sync (Decisions 11, 55).

#### Scenario: App open — janitor first, then sync

- **WHEN** the app comes to the foreground (icon tap or return after a call — the same event)
- **THEN** the janitor runs first, and the one batch send follows — calls the janitor just recovered ride the same batch instead of waiting one extra open

#### Scenario: Fill triggers its own sync

- **WHEN** a call ends and the row is filled in real time
- **THEN** sync fires right away — the call reaches the server in seconds, without waiting for the next app open

#### Scenario: Closed phones send nothing

- **WHEN** the app stays closed for days
- **THEN** nothing is sent until the next app open — no background job exists

### Requirement: The server keeps every row exactly once

The sync endpoint SHALL process each row on its own: insert it; silently skip a call id it already has (a retried sync can never double-count); discard a broken row with a log line; drop a row older than 3 days — judged on the call's real time — with a log line. The server SHALL answer 200 in all these cases so the app clears what it sent (Decisions 24, 29, 35, 86).

#### Scenario: Retried batch never double-counts

- **WHEN** the app sends the same batch again after a lost response
- **THEN** rows already saved are silently skipped and nothing is counted twice

#### Scenario: One broken row never blocks good calls

- **WHEN** a batch holds a broken row among good ones
- **THEN** the good rows are saved, the broken one is discarded with a log line, and the server still answers 200

#### Scenario: Too-old calls are dropped

- **WHEN** a batch holds a call older than 3 days (a phone offline longer than that)
- **THEN** the row is dropped with a log line, the server answers 200, and the app clears it — accepted loss (Decision 86)

### Requirement: Every call belongs to whoever's token sent it

The server SHALL save each row under the account whose token sent it. Any active token may sync — no manager special case, because the manager never uses the app (Decision 89).

#### Scenario: Rows attributed to the sender

- **WHEN** a salesperson's app syncs a batch
- **THEN** every row is saved under that salesperson's id

### Requirement: The queue lives only on the phone

Unsent rows SHALL exist only on the phone — there is no background copy and no background push. A reinstall, cleared app data, or a replaced phone deletes unsynced calls forever; those calls never reach the server (accepted, Decision 47).

#### Scenario: Reinstall loses unsynced calls

- **WHEN** the app is reinstalled while the queue still holds unsent rows
- **THEN** those calls are gone — the dashboards stay short by exactly that window

### Requirement: Clear local data

The app SHALL offer a Clear local data action — a small gear icon on the My Stats header opening a one-item settings screen. It SHALL wipe only the not-yet-sent queue, after asking: "This deletes N calls not yet sent to the server. Cannot be undone." Nothing on the server is touched (Decision 56).

#### Scenario: Clear with confirmation

- **WHEN** the person confirms the Clear local data dialog
- **THEN** the queue is wiped, the server's numbers stay exactly as they were

#### Scenario: Cancel changes nothing

- **WHEN** the person cancels the dialog
- **THEN** the queue is untouched

#### Scenario: The count is real

- **WHEN** the dialog opens
- **THEN** N is the actual number of not-yet-sent rows on the phone
