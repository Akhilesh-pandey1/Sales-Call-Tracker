## Purpose

Catches phone numbers tapped anywhere on the phone — Contacts, WhatsApp, a browser, SMS — so the call goes out through the app's own keypad flow and is tracked like every call. Also settles once, at the login pass, whether the app takes over number taps at all, with a permanent no-thanks option.

## Requirements

### Requirement: Catch tapped numbers through Android's chooser
The system SHALL answer `tel:` dial links through one intent filter on the app's main activity, so tapping a number outside the app offers our app in Android's chooser, and the salesperson can make the choice permanent with Always. The system SHALL NOT become the default phone app — incoming call screens, the in-call screen, and the home-screen dial button stay Android's.

#### Scenario: Chooser offers our app
- **GIVEN** our app is not yet the handler for tapped numbers
- **WHEN** a number is tapped in Contacts, WhatsApp, a browser, or SMS
- **THEN** Android's chooser shows our app beside the phone's dialer

#### Scenario: Always makes the choice permanent
- **GIVEN** the chooser is showing
- **WHEN** the salesperson picks our app and taps Always
- **THEN** every later tapped number opens our app directly with no chooser

#### Scenario: Never the default phone app
- **GIVEN** our app is set to catch tapped numbers
- **WHEN** a call arrives or the in-call screen is needed
- **THEN** the phone's own screens handle it — our app takes over number taps only

### Requirement: Caught number fills the keypad
The system SHALL open the Dialer tab with the caught number already typed in the keypad, cleaned first — spaces and dashes stripped, plus and digits kept — with the Call button ready. Backing out SHALL leave the number in the keypad and place no call.

#### Scenario: Number lands ready to call
- **GIVEN** a tapped number was handed to our app
- **WHEN** the Dialer tab opens
- **THEN** the number sits typed in the keypad with the Call button ready, and one tap on Call starts the normal keypad call

#### Scenario: Dirty number cleaned before filling
- **GIVEN** a tapped link carries a number with spaces or dashes
- **WHEN** it fills the keypad
- **THEN** the keypad holds only the plus and the digits

#### Scenario: Backing out dials nothing
- **GIVEN** a caught number sits in the keypad
- **WHEN** the salesperson backs out without tapping Call
- **THEN** no call is placed and the number stays in the keypad

#### Scenario: Empty or unreadable link
- **GIVEN** a tapped link carries no readable number
- **WHEN** our app opens from it
- **THEN** the dialer opens normally with nothing filled

### Requirement: Caught calls follow the keypad call rules
The system SHALL place a call started from a caught number through the same keypad flow: on the chosen SIM, recorded like every call, with the normal post-call popup. A Do-not-track number SHALL still place the call and never be recorded. With no SIM picked, the call SHALL leave on the phone default.

#### Scenario: Tracked like a keypad call
- **GIVEN** a caught number sits in the keypad
- **WHEN** Call is tapped and the call completes
- **THEN** the call places on the chosen SIM, records like a keypad call, and shows in History

#### Scenario: Do-not-track number
- **GIVEN** the caught number is on the Do-not-track list
- **WHEN** Call is tapped
- **THEN** the call places normally and nothing is recorded — no history row and no synced call

#### Scenario: No SIM picked
- **GIVEN** no calling SIM has been picked in Settings
- **WHEN** Call is tapped on a caught number
- **THEN** the call leaves on the phone default

### Requirement: Live lead flow stays undisturbed
The system SHALL ignore a caught number while the automated lead call flow is on screen — the live flow keeps its number and its state.

#### Scenario: Caught number during the lead call flow
- **GIVEN** the automated lead call flow is on screen with a lead's call
- **WHEN** a number is tapped outside the app
- **THEN** the caught number is ignored — the lead flow keeps its number and its state

### Requirement: One-time setup at the login pass
The system SHALL add one step to the login permission pass in the same step-by-step style: it SHALL check quietly which app handles tapped numbers and skip silently when ours already does; otherwise it SHALL show one short instruction line and fire Android's chooser once, the probe number never dialed.

#### Scenario: Already the handler — silent skip
- **GIVEN** our app already handles tapped numbers
- **WHEN** the login pass reaches this step
- **THEN** nothing shows — no dialog and no banner

#### Scenario: Not yet the handler — chooser fires once
- **GIVEN** no "Don't show again" was saved and our app does not yet handle tapped numbers
- **WHEN** the login pass reaches this step
- **THEN** one short instruction line shows and Android's chooser opens once; the probe number is never dialed

#### Scenario: Skipped — back at the next login
- **GIVEN** the salesperson left the step without picking our app and without "Don't show again"
- **WHEN** the next login pass runs
- **THEN** the step shows again, and keeps returning until picked or refused

### Requirement: Don't-show-again is permanent and lives only on that screen
The system SHALL show a "Don't show again" button on that login step only, and tapping it SHALL save the refusal on the phone permanently, so the step never appears again even when the app is never picked.

#### Scenario: Refusal saved
- **GIVEN** the login step is showing
- **WHEN** "Don't show again" is tapped
- **THEN** the choice is saved on the phone and the step never appears at any later login, even though our app is never picked

#### Scenario: Found only on that screen
- **GIVEN** the step was refused or already settled
- **WHEN** the salesperson uses any other screen of the app
- **THEN** no tapped-number prompt or "Don't show again" appears anywhere else
