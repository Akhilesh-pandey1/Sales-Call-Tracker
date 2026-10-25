## Purpose

Opens WhatsApp chats on the salesperson's chosen app — WhatsApp or WhatsApp Business — with an optional pre-typed first message. The choice and the message live on the phone only, and nothing ever sends by itself.

## Requirements

### Requirement: WhatsApp settings rows saved on the phone
The system SHALL add two Settings rows saved on the phone only: a WhatsApp app row holding WhatsApp or WhatsApp Business with WhatsApp preselected, and a First message row holding a switch, ON by default with the text "Hello sir, Mai Apex Album AI se baat kar raha/rahi hu" pre-filled — off opens the chat empty, on opens the chat with that text already typed, and WhatsApp always lets the salesperson edit before sending, so nothing ever sends by itself. A phone that already saved its own first-message choice SHALL keep what it saved — the default never overwrites a saved choice.

#### Scenario: WhatsApp preselected
- **GIVEN** a fresh install
- **WHEN** the WhatsApp app row opens
- **THEN** WhatsApp is the preselected choice

#### Scenario: Fresh install defaults ON
- **GIVEN** a fresh install
- **WHEN** the First message row opens or any WhatsApp button opens a chat
- **THEN** the switch is ON with "Hello sir, Mai Apex Album AI se baat kar raha/rahi hu" pre-filled and the chat opens with that line pre-typed

#### Scenario: Saved choice keeps what it saved
- **GIVEN** a phone saved its own first-message choice — the switch off, or its own text
- **WHEN** the app restarts
- **THEN** the saved choice stays exactly as saved — the default never overwrites it

#### Scenario: Switch off opens an empty chat
- **GIVEN** the First message switch is off
- **WHEN** any WhatsApp button opens a chat
- **THEN** the chat opens empty with nothing typed

#### Scenario: Switch on pre-types the text
- **GIVEN** the First message switch is on with text saved
- **WHEN** any WhatsApp button opens a chat
- **THEN** the chat opens with that text already typed in the message box, still editable

#### Scenario: Saved on the phone only
- **GIVEN** both rows are set on one phone
- **WHEN** the account is used on another phone or synced
- **THEN** the two choices never reach the server and never move between phones

### Requirement: Every WhatsApp button opens the chosen app
The system SHALL open only the chosen WhatsApp app from every WhatsApp button in the app, launching it through the native WhatsApp module by its exact package — WhatsApp `com.whatsapp`, Business `com.whatsapp.w4b` — with the number in international format and the optional first message, so Android shows the existing chat with that number or a fresh one.

#### Scenario: Chosen app opens
- **GIVEN** WhatsApp Business is the chosen app
- **WHEN** any WhatsApp button is tapped
- **THEN** WhatsApp Business opens — never the regular WhatsApp

#### Scenario: Existing chat opens
- **GIVEN** the number already has a chat in the chosen app
- **WHEN** its WhatsApp button is tapped
- **THEN** that existing chat opens

#### Scenario: Fresh chat for an unknown number
- **GIVEN** the number has no chat in the chosen app
- **WHEN** its WhatsApp button is tapped
- **THEN** a fresh chat with that number opens

### Requirement: Missing app handled quietly
The system SHALL show a toast, "WhatsApp is not installed.", and do nothing else when the chosen WhatsApp app is not installed.

#### Scenario: Chosen app missing
- **GIVEN** the chosen WhatsApp app is not on the phone
- **WHEN** any WhatsApp button is tapped
- **THEN** a toast says "WhatsApp is not installed." and nothing else happens
