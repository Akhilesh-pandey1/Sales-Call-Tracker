# settings-tab

Depends on: none

## Purpose

Holds the Settings tab shell: the five-row menu with the inline Notes popup switch, the always-reset navigation rule, and the section-header cleanup. The other rows' behaviors — the WhatsApp choices, the Do-not-track list, clearing local data — live in their own module specs.

## Requirements

### Requirement: Five-row menu with no section header
The system SHALL show the Settings tab as a plain top-level tab — title "Settings", no back arrow — with a five-row menu: WhatsApp, Do not track numbers, Notes popup, Clear local data, and Log out — each row opening its own screen or dialog except the Notes popup row, which toggles in place, and SHALL show no "Local data" section header above the rows.

#### Scenario: Five rows render with no header
- **GIVEN** the Settings tab opens
- **WHEN** it renders
- **THEN** it shows exactly the WhatsApp, Do not track numbers, Notes popup, Clear local data, and Log out rows — with no "Local data" section header above them

#### Scenario: Clear local data row keeps its name
- **GIVEN** the Settings list renders
- **WHEN** the salesperson reads it
- **THEN** the "Clear local data" row keeps its name and behavior exactly as before

### Requirement: Notes popup switch row
The system SHALL show the Notes popup row between "Do not track numbers" and "Clear local data" — label, one-line description, and a switch on the right — and tapping anywhere on the row SHALL flip the switch with no sub-page. The switch SHALL be ON when nothing is saved, and the flipped choice SHALL stay saved on the phone.

#### Scenario: Default is on
- **GIVEN** a phone with no saved choice
- **WHEN** the Settings tab opens
- **THEN** the Notes popup switch shows ON

#### Scenario: Tapping the row flips it in place
- **GIVEN** the Notes popup switch ON
- **WHEN** the row is tapped
- **THEN** the switch flips to OFF and no sub-page opens

#### Scenario: The choice survives leaving and restarting
- **GIVEN** the switch was flipped to OFF
- **WHEN** the salesperson leaves Settings, returns, or reopens the app
- **THEN** the switch still shows OFF

### Requirement: Leaving Settings always resets it
The system SHALL reset the Settings tab every time the salesperson leaves it, so coming back lands on the Settings home — never inside a sub-page like WhatsApp or Do-not-track.

#### Scenario: Sub-page does not survive leaving
- **GIVEN** the salesperson sits on the WhatsApp sub-page inside Settings
- **WHEN** they switch to another tab and return to Settings
- **THEN** the Settings home shows — no sub-page is left open

#### Scenario: Every return lands on the home
- **GIVEN** the salesperson visits Settings, leaves, and returns several times
- **WHEN** each return happens
- **THEN** every return lands on the Settings home
