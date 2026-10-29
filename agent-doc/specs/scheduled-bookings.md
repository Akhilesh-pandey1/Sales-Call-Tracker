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

### Requirement: Booking carries its note and interested mark
The moment a popup Submit books a schedule, the booking SHALL save the note typed on that call, and SHALL carry an interested flag set on when that call chose Interested or the number's My List row is flagged Interested. The Scheduled row SHALL show an Interested tag only while the flag is on, and rebooking SHALL replace the booking and set the note and flag fresh.

#### Scenario: Booking saves the call's note
- **GIVEN** a popup with the note "Wants the demo Tuesday" and Schedule chosen
- **WHEN** Submit is tapped
- **THEN** the booking carries that note and the pre-call notes popup shows it for the number

#### Scenario: Tag shows for an interested booking
- **GIVEN** a booking made from a call whose popup chose Interested
- **WHEN** the Scheduled tab renders
- **THEN** the row carries the Interested tag

#### Scenario: Tag shows from the My List flag
- **GIVEN** a booking for a number flagged Interested in My List, booked without choosing Interested
- **WHEN** the Scheduled tab renders
- **THEN** the row still carries the Interested tag

#### Scenario: Plain booking shows no tag
- **GIVEN** a booking with no interested mark anywhere local
- **WHEN** the Scheduled tab renders
- **THEN** the row shows no Interested tag

#### Scenario: Rebooking sets the marks fresh
- **GIVEN** a booking carrying the Interested tag
- **WHEN** the number is rebooked from a call with no interested mark and no note
- **THEN** the replaced booking shows no tag and no note

### Requirement: Row actions and tap-through
Each row SHALL carry a Call button beside Copy and WhatsApp. Tapping the row SHALL open the booked lead's card ready to call — the same thing tapping the notification does. Tapping the Call button SHALL dial through the shared direct-call flow, and tapping WhatsApp SHALL open the chosen app on the number's chat and remove that booking from the list — the salesperson handled it.

#### Scenario: Tapping opens the booked lead's card
- **GIVEN** a row for a booked lead
- **WHEN** the salesperson taps the row
- **THEN** that lead's card opens ready to call — the same thing tapping the notification does

#### Scenario: Call, Copy, and WhatsApp on every row
- **GIVEN** any booking row
- **WHEN** it renders
- **THEN** it carries a Call button beside Copy and WhatsApp

#### Scenario: Call button dials through the shared flow
- **GIVEN** a booking row
- **WHEN** its Call button is tapped
- **THEN** the number dials directly through the shared direct-call flow with the shared post-call popup after

#### Scenario: WhatsApp tap removes the booking
- **GIVEN** a booking row
- **WHEN** its WhatsApp button is tapped
- **THEN** the chat opens on the chosen app and the booking leaves the Scheduled list

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

### Requirement: Calling a booked number re-books or clears through the popup
The system SHALL run the shared post-call popup after a call started from a Scheduled row, and its Schedule answer SHALL overwrite the booking — "Do not schedule" leaves the row removed, and a new schedule replaces the old booking with the new date.

#### Scenario: Do not schedule leaves it removed
- **GIVEN** a booked number was called from the Scheduled tab
- **WHEN** the popup's Schedule answer is "Do not schedule"
- **THEN** the row stays removed — the old booking is gone

#### Scenario: New schedule replaces the old booking
- **GIVEN** a booked number was called from the Scheduled tab
- **WHEN** the popup's Schedule answer books a new date
- **THEN** the old booking is replaced with the new date and the row shows the new booked time

#### Scenario: Standing removal rules stay as they are
- **GIVEN** any booking
- **WHEN** 24 hours pass its booked time
- **THEN** the row leaves the list — the 24-hour window and the Due badge stay exactly as they are

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
