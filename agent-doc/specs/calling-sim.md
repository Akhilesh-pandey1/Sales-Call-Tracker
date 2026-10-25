## Purpose

Puts every call on one chosen SIM slot. The salesperson picks a slot once in Settings; the choice lives on the phone only, and every dial places on it through a small native module — no SIM picker at dial time, ever.

## Requirements

### Requirement: Calling SIM picker lists slots
The system SHALL add a Calling SIM row to Settings listing the phone's readable SIM slots — "SIM 1 · Jio", "SIM 2 · Airtel" — with the number shown only when the OS has one, plus one "Use phone default" item. Picking a slot saves the choice on the phone only; it is never synced to the server.

#### Scenario: Slots shown with their carriers
- **GIVEN** a phone with two readable SIMs
- **WHEN** the Calling SIM picker opens
- **THEN** it lists each slot with its carrier name — "SIM 1 · Jio", "SIM 2 · Airtel"

#### Scenario: Number shown only when the OS has one
- **GIVEN** a SIM whose own number the OS cannot read
- **WHEN** the picker lists that slot
- **THEN** the slot shows its carrier only, with no number line

#### Scenario: Choice saved on the phone only
- **GIVEN** the salesperson picked a slot
- **WHEN** the app syncs or the account is used on another phone
- **THEN** the choice never reaches the server and never moves between phones

#### Scenario: Use phone default
- **GIVEN** the Calling SIM picker is showing
- **WHEN** "Use phone default" is picked
- **THEN** calls place through Android's default SIM choice again

### Requirement: Every dial places on the saved slot
The system SHALL read the live SIM slots at dial time and place every call on the saved slot through the native SIM module, with no SIM picker ever and no number matching; the call SHALL be recorded only after the slot's SIM is found. With no slot picked — or on phones below Android 8 — the call SHALL leave on the phone default.

#### Scenario: Call on the chosen slot
- **GIVEN** a slot is saved and both SIMs are in the phone
- **WHEN** any call is dialed from the app
- **THEN** it places on the saved slot with no SIM picker shown

#### Scenario: No pick leaves on phone default
- **GIVEN** no slot has been picked in Settings
- **WHEN** a call is dialed from the app
- **THEN** it leaves on the phone's default SIM path

#### Scenario: Old Android stays on the default path
- **GIVEN** a phone below Android 8
- **WHEN** a call is dialed from the app
- **THEN** it leaves on the phone default — the slot choice never runs

### Requirement: Blocked slot call places nothing
The system SHALL block the call when the saved slot's SIM cannot place it — nothing is dialed and nothing is recorded — and show "Could not place the call on this SIM.", with a fresh pick in Settings as the fix.

#### Scenario: SIM missing from the saved slot
- **GIVEN** the saved slot holds no readable SIM at dial time
- **WHEN** the salesperson taps Call
- **THEN** nothing is dialed, nothing is recorded, and the message "Could not place the call on this SIM." shows

#### Scenario: Fresh pick fixes it
- **GIVEN** the blocked-call message is showing because a SIM was removed
- **WHEN** the salesperson picks another slot in Settings
- **THEN** the next call places on the newly chosen slot

### Requirement: READ_PHONE_NUMBERS is display-only
The system SHALL ask READ_PHONE_NUMBERS once at the dialer's login permission pass alongside the tracking permissions, where it never blocks anything and its denial shows no banner. The Calling SIM screen itself SHALL ask no permissions; with the Phone permission off it SHALL show a note and stay on phone default.

#### Scenario: Asked once at the login pass
- **GIVEN** the salesperson signs in on the phone
- **WHEN** the login permission pass runs
- **THEN** READ_PHONE_NUMBERS is asked once alongside the tracking permissions

#### Scenario: Denial never blocks
- **GIVEN** the salesperson denied READ_PHONE_NUMBERS
- **WHEN** the app runs
- **THEN** no red banner shows and every other capability works as usual

#### Scenario: Calling SIM screen asks no permissions
- **GIVEN** the Calling SIM screen in Settings
- **WHEN** it opens
- **THEN** it asks no permission itself

#### Scenario: Phone permission off shows a note
- **GIVEN** the Phone permission is off
- **WHEN** the Calling SIM screen opens
- **THEN** a note shows and calls stay on the phone default

### Requirement: Old number-based choice dropped
The system SHALL drop any stored SIM choice saved under the old number-matching rule, so the salesperson picks the SIM once more; from then on the choice follows the slot — SIMs swapped between slots keep the choice on the slot.

#### Scenario: Update drops the old choice
- **GIVEN** a stored SIM choice saved as a phone number from before the update
- **WHEN** the app updates to the slot-based rule
- **THEN** the stored choice is gone and the salesperson picks the SIM once more

#### Scenario: Choice follows the slot after a swap
- **GIVEN** slot 1 is saved and the salesperson swaps the two SIMs between slots
- **WHEN** the next call is dialed
- **THEN** it places on slot 1's new SIM — the choice follows the slot, not the number
