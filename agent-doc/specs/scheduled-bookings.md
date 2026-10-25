## Purpose

Keeps every booking visible on the phone until it is handled. The local Scheduled tab lists every booked number with its Upcoming or Due state, and the reminder notification carries the app icon.

## Requirements

### Requirement: Every booking listed with its state
The system SHALL read the local `scheduled_reminders` table — lead bookings and keypad bookings alike — and list every booking with the number, the booked date and time, and a state: Upcoming while the booked time has not come, Due once it has passed with no tap and no call. Due rows SHALL sort first, most overdue at top, then Upcoming rows soonest first.

#### Scenario: Both kinds of bookings listed
- **GIVEN** a booked lead and a keypad booking exist on the phone
- **WHEN** the Scheduled tab opens
- **THEN** both bookings appear as rows in one list

#### Scenario: Upcoming while the time has not come
- **GIVEN** a booking set for tomorrow
- **WHEN** the Scheduled tab opens
- **THEN** the row shows Upcoming with its booked date and time

#### Scenario: Due once the time has passed
- **GIVEN** a booking whose time passed with no tap and no call
- **WHEN** the Scheduled tab opens
- **THEN** the row shows Due

#### Scenario: Due first, most overdue at top
- **GIVEN** the list holds Due and Upcoming rows
- **WHEN** the list renders
- **THEN** Due rows come first with the most overdue at top, followed by Upcoming rows soonest first

### Requirement: Row actions and tap-through
Each row SHALL carry Copy and WhatsApp buttons, and tapping the row SHALL open the booked lead's card ready to call — the same thing tapping the notification does.

#### Scenario: Tapping opens the booked lead's card
- **GIVEN** a row for a booked lead
- **WHEN** the salesperson taps the row
- **THEN** that lead's card opens ready to call — the same thing tapping the notification does

#### Scenario: Copy and WhatsApp on every row
- **GIVEN** any booking row
- **WHEN** it renders
- **THEN** it carries a Copy button and a WhatsApp button

### Requirement: Handled bookings leave the list
The system SHALL remove a row when the notification is tapped, when a call to that number is recorded, or when 24 hours pass its booked time — the same window the server uses to free the lead — with the cleanup running at every app open.

#### Scenario: Notification tap removes the row
- **GIVEN** a booking's reminder notification
- **WHEN** the salesperson taps the notification
- **THEN** the row leaves the Scheduled list

#### Scenario: Recorded call removes the row
- **GIVEN** a booking's number
- **WHEN** a call to that number is recorded
- **THEN** the row leaves the Scheduled list

#### Scenario: 24 hours removes the row
- **GIVEN** a booking untouched for 24 hours past its booked time
- **WHEN** the cleanup runs at the next app open
- **THEN** the row leaves the list — the same window the server uses to free the lead

### Requirement: Due count badge and line
The system SHALL count the Due rows at every app open and show the count as a badge on the Scheduled tab, with the tab showing the line "You have N leads you have not called."

#### Scenario: Badge counts Due rows
- **GIVEN** three bookings are Due
- **WHEN** the app opens
- **THEN** the Scheduled tab shows the badge 3

#### Scenario: Line matches the Due count
- **GIVEN** three bookings are Due
- **WHEN** the Scheduled tab opens
- **THEN** it shows "You have 3 leads you have not called."

### Requirement: Fully local and offline
The tab SHALL work fully offline from the phone's own tables, and nothing booked SHALL read "Nothing scheduled."

#### Scenario: Works offline
- **GIVEN** the phone has no internet
- **WHEN** the Scheduled tab opens
- **THEN** the full local list renders with no server contact

#### Scenario: Empty state
- **GIVEN** nothing is booked on the phone
- **WHEN** the Scheduled tab opens
- **THEN** it reads "Nothing scheduled."

### Requirement: Reminder notification carries the app icon
The reminder notification SHALL show a dedicated white phone shape on a transparent background as its small status-bar icon at all five densities — Android flattens any colored icon to plain white there, so the normal app icon cannot be used — and the full-color app icon as the large icon in the notification drawer; nothing else about the notification changes.

#### Scenario: Status bar shows the white icon
- **GIVEN** a booking's reminder notification is active
- **WHEN** it sits in the status bar
- **THEN** the small icon is the white phone shape on a transparent background

#### Scenario: Drawer shows the full-color app icon
- **GIVEN** the reminder notification sits in the drawer
- **WHEN** the drawer is opened
- **THEN** the notification's large icon is the full-color app icon

#### Scenario: Nothing else changes
- **GIVEN** the notification's icons are set
- **WHEN** the reminder fires
- **THEN** its time, text, and tap behavior stay exactly as they were
