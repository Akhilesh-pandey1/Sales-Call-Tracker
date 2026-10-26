## Purpose

Holds the Settings tab shell: the four-row menu, the always-reset navigation rule, and the section-header cleanup. Each row's behavior — WhatsApp choices, the Do-not-track list, clearing local data — lives in its own module spec.

## Requirements

### Requirement: Four-row menu with no section header
The system SHALL show the Settings tab as a plain top-level tab — title "Settings", no back arrow — with a four-row menu: WhatsApp, Do not track numbers, Clear local data, and Log out, each row opening its own screen or dialog, and SHALL show no "Local data" section header above the rows.

#### Scenario: Four rows render with no header
- **GIVEN** the Settings tab opens
- **WHEN** it renders
- **THEN** it shows exactly the WhatsApp, Do not track numbers, Clear local data, and Log out rows — with no "Local data" section header above them

#### Scenario: Clear local data row keeps its name
- **GIVEN** the Settings list renders
- **WHEN** the salesperson reads it
- **THEN** the "Clear local data" row keeps its name and behavior exactly as before

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
