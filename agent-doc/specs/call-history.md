## Purpose

Keeps the calls the dashboards count on the phone, in its own History tab. The list works offline, never syncs, and never touches the server.

## Requirements

### Requirement: History tab in a five-tab bar
The system SHALL grow the app's tab bar to five tabs — Dialer, Scheduled, History, My Stats, Settings — with History holding every call the phone records, outgoing and incoming, listed newest first.

#### Scenario: Five tabs
- **GIVEN** the app is open on any screen
- **WHEN** the tab bar renders
- **THEN** it shows exactly Dialer, Scheduled, History, My Stats, Settings

#### Scenario: Both directions listed newest first
- **GIVEN** the phone recorded outgoing and incoming calls
- **WHEN** the History tab opens
- **THEN** both directions sit in one list with the newest call at the top

### Requirement: One history row per recorded call
The system SHALL write one call-history row per call at the moment the call's real time and duration are known — before any sync — so the list works offline and queue cleanup never touches it, and a Do-not-track number SHALL never get a row — the same rule tracking follows.

#### Scenario: Row written before sync
- **GIVEN** a call's real time and duration have just become known
- **WHEN** the call is recorded
- **THEN** its history row exists at that moment, before any sync runs

#### Scenario: Queue cleanup never touches history
- **GIVEN** synced calls were cleaned from the local queue
- **WHEN** the History tab opens
- **THEN** every one of those calls is still listed

#### Scenario: Works offline
- **GIVEN** the phone has no internet
- **WHEN** the History tab opens
- **THEN** the full local list renders with no server contact

#### Scenario: Do-not-track number gets no row
- **GIVEN** a number on the Do-not-track list
- **WHEN** a call with that number is recorded
- **THEN** no history row is written for it

### Requirement: Only in-window calls kept
The system SHALL keep on the phone only the calls the dashboard would count: a call whose IST start minute falls outside the office-hours window the phone last received SHALL never get a history row — the check runs at the same moment the Do-not-track check runs — and the first-open backfill and every sweep apply the same filter. With no window received yet the phone SHALL use the documented default, 10:00–19:00 IST, and history rows already stored SHALL stay untouched.

#### Scenario: Out-of-window call gets no row
- **GIVEN** the phone holds the window 10:00–19:00 IST
- **WHEN** a call starting 19:30 IST is recorded
- **THEN** no history row is written for it

#### Scenario: Check runs with the Do-not-track check
- **GIVEN** a call just became known to the phone
- **WHEN** the recording check runs
- **THEN** the window check and the Do-not-track check run at the same moment, in one pass

#### Scenario: Backfill and sweep apply the filter
- **GIVEN** calls were made outside the window while the app was closed
- **WHEN** the first-open backfill or a sweep runs
- **THEN** those calls never join the list

#### Scenario: Default window before any arrives
- **GIVEN** the phone has received no office-hours window yet
- **WHEN** calls are recorded
- **THEN** the documented default 10:00–19:00 IST decides which get a row

#### Scenario: Stored rows stay untouched
- **GIVEN** history rows stored before a window change
- **WHEN** the manager saves a new window and the phone receives it
- **THEN** the stored rows are not deleted — only new recordings are filtered

### Requirement: Backfill and sweep at every open
The system SHALL backfill the history table once from the phone's own call log on the first open after the update, skipping Do-not-track numbers, and SHALL run the call-log sweep and save the last-loaded time on the phone at every History tab open, so calls made while the app was closed show up at the next look.

#### Scenario: Backfill runs once
- **GIVEN** the first History open after the update
- **WHEN** the tab opens
- **THEN** the table is backfilled once from the phone's call log, skipping Do-not-track numbers

#### Scenario: Closed-period calls appear at the next look
- **GIVEN** calls were made while the app was closed
- **WHEN** the History tab opens next
- **THEN** the sweep catches them and they appear in the list

#### Scenario: Last-loaded time saved
- **GIVEN** a History tab open finished its sweep
- **WHEN** the next open runs
- **THEN** the sweep reads only entries newer than the saved last-loaded time

### Requirement: Paged list capped at 1000 rows
The system SHALL read the list newest first, 50 rows per page with a Load-more button, and keep at most 1000 rows — row 1001 pushes the oldest out.

#### Scenario: Load-more pages
- **GIVEN** more than 50 calls sit in the table
- **WHEN** the History tab opens and Load-more is tapped
- **THEN** the next 50 rows appear

#### Scenario: Cap pushes the oldest out
- **GIVEN** the table already holds 1000 rows
- **WHEN** a new call is recorded
- **THEN** the oldest row is deleted and the table still holds at most 1000

### Requirement: Row contents and empty state
The system SHALL show each row with the number, an out or in mark, the date-time, and the result — connected with its talk time, or not connected — and SHALL carry a Call button beside Copy and WhatsApp, and a Scheduled badge when the number has an active booking in the local reminders table; tapping the row or its Call button dials the number directly through the shared direct-call flow instead of filling the keypad; with no calls yet the tab SHALL read "No calls yet."

#### Scenario: Connected row shows talk time
- **GIVEN** a recorded call with duration above zero
- **WHEN** its row renders
- **THEN** it shows the number, the out mark, the date-time, and connected with the talk time

#### Scenario: Not-connected row
- **GIVEN** a recorded call with zero duration
- **WHEN** its row renders
- **THEN** it shows "Not connected" in place of talk time

#### Scenario: Scheduled badge from an active booking
- **GIVEN** a row's number has an active booking in the local reminders table
- **WHEN** the row renders
- **THEN** it carries the Scheduled badge

#### Scenario: Call, Copy, and WhatsApp on every row
- **GIVEN** any history row
- **WHEN** it renders
- **THEN** it carries a Call button beside Copy and WhatsApp

#### Scenario: Tapping the row dials directly
- **GIVEN** any history row
- **WHEN** the salesperson taps the row or its Call button
- **THEN** the number dials directly through the shared direct-call flow — the keypad is never filled

#### Scenario: Empty state
- **GIVEN** no call is recorded on the phone
- **WHEN** the History tab opens
- **THEN** it reads "No calls yet."

#### Scenario: Connected row shows talk time
- **GIVEN** a recorded call with duration above zero
- **WHEN** its row renders
- **THEN** it shows the number, the out mark, the date-time, and connected with the talk time

#### Scenario: Not-connected row
- **GIVEN** a recorded call with zero duration
- **WHEN** its row renders
- **THEN** it shows "Not connected" in place of talk time

#### Scenario: Scheduled badge from an active booking
- **GIVEN** a row's number has an active booking in the local reminders table
- **WHEN** the row renders
- **THEN** it carries the Scheduled badge

#### Scenario: Copy and WhatsApp on every row
- **GIVEN** any history row
- **WHEN** it renders
- **THEN** it carries a Copy button and a WhatsApp button

#### Scenario: Empty state
- **GIVEN** no call is recorded on the phone
- **WHEN** the History tab opens
- **THEN** it reads "No calls yet."
