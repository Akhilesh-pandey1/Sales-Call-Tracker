# pre-call-notes

Depends on: settings-tab

## Purpose

Shows the salesperson what was said before they call again. When a number has a note and the popup switch is on, a small notes popup appears before the call on every list and the automated flow, and every list row carries an info icon that opens the note. The lists work from the phone's own stores — fully offline.

## Requirements

### Requirement: Notes popup before a call
The system SHALL show a small notes popup before a call when the number has a note and the Notes popup switch in Settings is on — on the Scheduled, History, Interested, and Do-not-call rows, the automated lead card, and My List Start Calling. The popup SHALL show the number, its one newest note, and a Call button that dials through the same flow as before. With no note the call SHALL go straight through with no extra tap. The keypad SHALL never show the popup, and Call Again SHALL never show it — that call was just served. Cancelling the popup SHALL place no call and return to where the salesperson was, and an automated lead SHALL stay claimed for its 10-minute window.

#### Scenario: Notes popup appears with a note
- **GIVEN** a Scheduled row whose number has a note and the popup switch on
- **WHEN** the row or its Call button is tapped
- **THEN** the notes popup shows first with the number, its one note, and a Call button

#### Scenario: No notes dials at once
- **GIVEN** a list row whose number has no note
- **WHEN** it is tapped
- **THEN** the call starts at once with no extra screen

#### Scenario: The keypad never shows it
- **GIVEN** a number with a note typed on the keypad
- **WHEN** Call is tapped
- **THEN** the call starts at once — the notes popup never appears

#### Scenario: Call Again never shows it
- **GIVEN** a popup submitted through Call Again on a number with notes
- **WHEN** the redial starts
- **THEN** it goes straight through with no notes screen

#### Scenario: Cancel places no call
- **GIVEN** the notes screen showing for a number
- **WHEN** the salesperson cancels
- **THEN** no call is placed and the app returns to where it was — an automated lead stays claimed for its window

### Requirement: The popup switch gates only the popup
The system SHALL dial straight through whenever the Notes popup switch is off — every call the popup could have gated (the Scheduled, History, Interested, and Do-not-call rows, the automated lead card, and My List Start Calling) starts at once with no notes screen. The switch SHALL change nothing else: the info icon stays on noted rows, the keypad and Call Again never show the popup in either state, and a fresh install or a new phone SHALL start with the switch on. A flip SHALL apply from the very next call attempt.

#### Scenario: Switch off dials noted numbers straight
- **GIVEN** the popup switch off and a Scheduled row whose number has a note
- **WHEN** the row or its Call button is tapped
- **THEN** the call starts at once with no notes screen

#### Scenario: Switch off keeps the info icon
- **GIVEN** the popup switch off and a row whose number has a note
- **WHEN** the list renders and the info icon is tapped
- **THEN** the icon is still there and opens the number's one note — the row's actions stay untouched

#### Scenario: Switch off dials the automated lead straight
- **GIVEN** the popup switch off and a served automated lead with a note
- **WHEN** the lead card is tapped
- **THEN** the call starts at once inside the lead's 10-minute claim window

#### Scenario: A flip applies from the next call
- **GIVEN** the popup switch was just flipped while the app is open
- **WHEN** a noted number is called next
- **THEN** the new state decides — the popup shows when on, the call dials straight when off

#### Scenario: Fresh install starts on
- **GIVEN** a fresh install or a new phone with no saved choice
- **WHEN** a noted number is called from a list
- **THEN** the popup shows — the switch starts on

### Requirement: One note per number, new overrides last
A number SHALL hold one note only, and a new note SHALL override the last one. The popup's Submit overwrites the note on the My List row when the number is in My List, and on the booking when a schedule is booked; the synced note overwrites the lead's note on the server, and in the automated flow the served lead's stored note arrives with the lead — one extra field on the existing next-lead response. The notes popup SHALL show that one note. A number with no note anywhere gets no info icon, no notes popup, and the call goes straight through. The lists SHALL work fully offline.

#### Scenario: A new note overrides the last
- **GIVEN** a My List number whose row holds "Asked to call after 6 PM"
- **WHEN** a later call to it saves the note "Wants the demo first"
- **THEN** the row holds only "Wants the demo first" and the popup shows only that note

#### Scenario: Rebooking overwrites the booking note
- **GIVEN** a booked number whose booking carries a note
- **WHEN** the number is rebooked from a call with a new note
- **THEN** the booking holds only the new note

#### Scenario: The served lead arrives with its note
- **GIVEN** a waiting lead whose stored note was overwritten by its last noted call
- **WHEN** the lead is served in the automated flow
- **THEN** the lead's one note arrives with it and is the note the popup shows

#### Scenario: No note anywhere
- **GIVEN** a number with no My List row, no booking, and no served-lead note
- **WHEN** it is called from a list
- **THEN** it has no note — no icon, no popup, a direct call

### Requirement: Info icon on list rows
Every row on the Scheduled, History, Interested, and Do-not-call lists SHALL carry an info icon only when the number has a note; tapping it SHALL open a small popup with the number's one note, and the row and its actions SHALL stay untouched.

#### Scenario: Icon with a note
- **GIVEN** a row whose number has a note
- **WHEN** it renders
- **THEN** it carries the info icon

#### Scenario: No icon without a note
- **GIVEN** a row whose number has no note
- **WHEN** it renders
- **THEN** it carries no info icon

#### Scenario: Tapping opens the notes popup
- **GIVEN** a row carrying the info icon
- **WHEN** it is tapped
- **THEN** a popup opens with the number's one note and the row's actions keep working exactly as before
