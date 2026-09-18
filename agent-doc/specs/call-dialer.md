# Spec: call-dialer

## Purpose

The screen salespeople live on: they type or paste a number, tap Call, and every valid dial creates one real record on the phone that no one can fake or double-count (Decisions 5, 6). The app's name on the phone is "Apex Sales Call" (Decision 72).

## Requirements

### Requirement: Number entry by keypad or paste

The dialer SHALL take a number typed on a keypad (0–9, *, #) with a backspace, or filled with one Paste button press from anything copied (WhatsApp, SMS, anywhere). No contact-list reading and no permission beyond call tracking's needs (Decision 25).

#### Scenario: Paste fills the number

- **WHEN** the person copies a number anywhere on the phone and taps Paste on the dialer
- **THEN** the number field is filled with the copied text

#### Scenario: Empty clipboard

- **WHEN** Paste is tapped with nothing copied
- **THEN** a small toast says "Nothing copied." and the typed number stays untouched (Decision 88)

### Requirement: The Call button only dials valid numbers

The Call button SHALL stay grey and unpressable until the entered number is a valid phone number for the logged-in person's country. Numbers starting with "+" SHALL be judged as full international numbers regardless of country. Pasted numbers pass the same check. A number that cannot be validated cannot be dialed (Decision 87).

#### Scenario: Valid local number

- **WHEN** the person types a 10-digit number while logged in with country IN
- **THEN** the Call button turns green and can be tapped

#### Scenario: Invalid number

- **WHEN** the number is too short, has wrong digits, or is otherwise not valid for the person's country
- **THEN** the Call button stays grey and nothing can be dialed

### Requirement: The three permissions and the red banner

First launch SHALL ask for three permissions together: CALL_PHONE (place the call), READ_CALL_LOG (read the log to match), READ_PHONE_STATE (the real-time call-end listener). When any one is off, the app SHALL show a red banner at the top — "Calls are not being logged" — with a Fix button that opens Android's settings page for the app, where all three get switched on. The banner SHALL clear once all three are granted. There is no silent tracking (Decisions 13, 40).

#### Scenario: All permissions on

- **WHEN** all three permissions are granted
- **THEN** no banner shows and dialing is tracked

#### Scenario: One permission off

- **WHEN** any one of the three permissions is off
- **THEN** the red banner shows with its Fix button — checking only one permission would hide the silent case where calls place fine but can never be recorded

#### Scenario: Fix flow

- **WHEN** the person taps Fix, switches the missing permissions on in Android's settings, and returns to the app
- **THEN** the app re-checks and the banner is gone

### Requirement: One tap creates exactly one intent row

Tapping Call SHALL lock the button the moment it is tapped and unlock only when the dialer takes over. Each tap SHALL create exactly one local intent row with: a fresh call id, the number normalized to E.164 (a local-style number assumes the logged-in person's country; a number starting with "+" self-identifies), and the tap time from the phone clock. A double-tap can never create a second row for one real call (Decisions 34, 53, 73).

#### Scenario: Double-tap

- **WHEN** the Call button is tapped twice in a hurry
- **THEN** only one intent row is created and the call is dialed once

#### Scenario: Local number normalized

- **WHEN** a 10-digit local number is dialed by a person whose country is IN
- **THEN** the row stores the full E.164 form (+91…)

#### Scenario: International number self-identifies

- **WHEN** a number starting with "+" is dialed
- **THEN** it is stored as given (normalized), no country assumed

### Requirement: Fill the row from the real call (Path 1 — real time)

When the call ends, the app SHALL read the Android call log and fill the row with the entry's real time and duration. The match SHALL require all three: the normalized number equals the row's number, the entry type is OUTGOING, and the entry's time falls within 1 minute after the intent time. When two candidates fit, they match in order — first intent with the first entry (Decisions 21, 44).

#### Scenario: Answered call

- **WHEN** a dialed call is answered and hung up
- **THEN** the row is filled with the talk time — not the ring time

#### Scenario: Unanswered dial

- **WHEN** a dialed call is never answered
- **THEN** the row is filled with duration 0 — an unanswered outgoing call is still an OUTGOING entry, so duration above 0 stays the only connected signal (Decision 17)

#### Scenario: Two quick calls

- **WHEN** the same number is dialed twice quickly
- **THEN** the first row takes the first log entry and the second row takes the second

#### Scenario: Incoming call-back never matches

- **WHEN** the customer calls back from the same number after a dial
- **THEN** the incoming entry never fills the row — only OUTGOING entries match

#### Scenario: Log entry lands late

- **WHEN** at hang-up the call-log entry is not there yet
- **THEN** the app retries at 3s, 10s, and 30s; if the entry still is not there, the row waits for the janitor (Decision 50)

#### Scenario: Unparsable number in the log

- **WHEN** a call-log entry's number cannot be parsed into E.164
- **THEN** its raw digits are used for matching and storing — a call is never lost over formatting (Decision 34)

### Requirement: Complete missed rows on app open (Path 2 — the janitor)

On every app open, the app SHALL look at rows older than 1 hour that are still empty and complete them from the call log under the same match rule. A row still empty after 5 janitor checks SHALL be filled as: dialed time = the tap time, duration 0 — so the dial still rides sync and stays counted. Rows younger than 1 hour are never touched by the janitor (Decisions 11, 50, 59).

#### Scenario: App killed mid-call

- **WHEN** the app was killed during a call, so no real-time fill happened
- **THEN** at the first app open after 1 hour the row is completed from the call log

#### Scenario: Orphan dial after 5 checks

- **WHEN** a row is still empty after 5 janitor checks — no matching log entry exists
- **THEN** the row is filled with the tap time and duration 0, and it rides the normal sync as a dial (Decision 59)

#### Scenario: Young rows untouched

- **WHEN** a row is less than 1 hour old and still empty
- **THEN** the janitor leaves it alone — the real-time path owns it, so the two paths never fight over one row

### Requirement: Fallback without the call permission

With CALL_PHONE off, the app cannot start a call itself. Tapping Call SHALL hand the number to the phone's own dialer (one extra tap there); no intent row SHALL be written and the call is not tracked. One rule: permission off = not tracked (Decision 52).

#### Scenario: Call without permission

- **WHEN** CALL_PHONE is off and the person taps Call
- **THEN** the phone's own dialer opens with the number filled, and nothing is recorded anywhere

### Requirement: Dialing works offline

Dialing and the local queue SHALL work with no internet. Rows wait on the phone until sync succeeds (Decision 11).

#### Scenario: Dial with no internet

- **WHEN** the phone has no internet and the person dials from the app
- **THEN** the call is placed and the intent row is created as always — it syncs on a later app open
