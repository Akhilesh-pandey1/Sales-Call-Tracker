# call-log-downloads

Depends on: call-tracking, user-management

## Purpose

Lets the manager download the stored call logs as CSV files that open in Excel — every salesperson's calls for today or yesterday as two separate files, and one salesperson's last 30 days as its own file — with every file built entirely by the server.

## Requirements

### Requirement: The log downloads
The system SHALL offer every log download as one direct click that saves one CSV file — a small icon button at the right side of the Team table's Today column heading downloads every salesperson's calls of today, the same icon beside the Yesterday heading downloads yesterday; a small icon button at the right edge of each day group in every Team table row downloads that salesperson's calls for that day; and "Download logs" at the heading of the Person Logs screen downloads that person's calls of the last 30 days.

#### Scenario: Today's file saves
- **GIVEN** the manager is on the Team page
- **WHEN** they click the download icon beside the Today column heading
- **THEN** a CSV file named `call-logs-<today's IST date>.csv` saves on their computer

#### Scenario: Yesterday's file saves
- **GIVEN** the manager is on the Team page
- **WHEN** they click the download icon beside the Yesterday column heading
- **THEN** a CSV file named `call-logs-<yesterday's IST date>.csv` saves with that day's calls

#### Scenario: One person's day file saves
- **GIVEN** the manager is on the Team page
- **WHEN** they click the download icon at the right edge of a row's Today group
- **THEN** a CSV file named `call-logs-<name>-<today's IST date>.csv` saves with that person's calls of that day — the name in lowercase with spaces as hyphens

#### Scenario: Person file saves
- **GIVEN** the manager opened a salesperson's Person Logs screen with "View logs"
- **WHEN** they click "Download logs"
- **THEN** a CSV file named `call-logs-<name>-<today's IST date>.csv` saves — the name in lowercase with spaces as hyphens

### Requirement: View logs on the person page
The system SHALL show a "View logs" button beside the Back link above the person's KPI cards — the page header keeps only the date — and SHALL open the Person Logs screen on tap: every stored call of that person's last 30 days, today included, one row per call, newest call first, outgoing and incoming together, each row carrying the phone number, date, time, direction, connected, and minutes.

#### Scenario: The logs open as rows
- **GIVEN** the manager is on a salesperson's person view
- **WHEN** they tap "View logs"
- **THEN** the Person Logs screen lists that person's calls of the last 30 days, newest call first

#### Scenario: Incoming calls sit in the list
- **GIVEN** the person answered incoming calls in the last 30 days
- **WHEN** the Person Logs screen lists the calls
- **THEN** those calls appear as their own rows marked Incoming

#### Scenario: No calls in the window
- **GIVEN** the person has no stored calls in the last 30 days
- **WHEN** the manager opens the Person Logs screen
- **THEN** it shows "No calls in the last 30 days." instead of the table

### Requirement: Every file carries the same ten columns
The system SHALL build every file with the same ten columns in the same order — Salesperson, Phone Number, Date, Time, Direction, Connected, Duration (minutes), Interested, Do Not Call, Notes — with the Date and Time shown in IST, Connected as Yes when the call's duration is above 0, the two flags as Yes or No, and the note text as stored.

#### Scenario: One call's row
- **GIVEN** Ramesh made an outgoing call at 11:24 IST lasting 3 minutes 30 seconds, marked Interested with the note "wants a demo on Tuesday"
- **WHEN** the row for that call is read in any downloaded file
- **THEN** it shows Ramesh, the stored number, the call's IST date and time, Outgoing, Yes, 3.50, Yes, No, and the note text

#### Scenario: IST day boundary in a file
- **GIVEN** a call stored in UTC that falls inside yesterday's IST calendar day
- **WHEN** yesterday's file is downloaded
- **THEN** the call's row appears there with yesterday's IST date — not in today's file

### Requirement: Files hold every stored call in both directions
The system SHALL include every stored call inside the file's window — outgoing and answered incoming — with no row filtered out, including calls made by currently deactivated salespeople.

#### Scenario: Incoming call appears
- **GIVEN** a salesperson answered an incoming call today
- **WHEN** today's file is downloaded
- **THEN** that call appears as a row with Direction Incoming

#### Scenario: Deactivated person's calls appear
- **GIVEN** a salesperson made calls today and was deactivated afterwards
- **WHEN** today's file is downloaded
- **THEN** those calls appear under that person's name

### Requirement: Fixed row order
The system SHALL sort the team files by salesperson name A to Z with each person's calls oldest first, and the person file oldest call first.

#### Scenario: Team file order
- **GIVEN** today's file holds calls from several salespeople
- **WHEN** the rows are read
- **THEN** they run name A to Z, and within each name the calls run oldest first

#### Scenario: Person file order
- **GIVEN** the 30-day file of one salesperson
- **WHEN** the rows are read
- **THEN** they run oldest call first

### Requirement: Excel-safe files
The system SHALL serve every file as CSV with a UTF-8 BOM so Excel shows every character correctly, SHALL escape a note holding a comma, a quote, or a line break, and SHALL still download a headers-only file when the window holds no calls.

#### Scenario: Note with special characters
- **GIVEN** a call whose note holds a comma and a line break
- **WHEN** its file is downloaded
- **THEN** the note stays inside its one cell — the row keeps its ten columns

#### Scenario: Empty window still downloads
- **GIVEN** a day with no stored calls
- **WHEN** the manager downloads that day
- **THEN** the file saves holding only the header row — no error

### Requirement: Manager-only downloads and logs view
The system SHALL refuse every log download and the Person Logs screen to a salesperson token, and SHALL respond "User not found." when the person download or the logs view names a user id that does not exist.

#### Scenario: Salesperson refused
- **GIVEN** a valid salesperson token
- **WHEN** any log download or the logs view is requested
- **THEN** the server refuses with "This dashboard is for managers." and nothing is shown or built

#### Scenario: Unknown person
- **GIVEN** a manager requests the person download or the logs view of a user id that does not exist
- **WHEN** the request is processed
- **THEN** the server responds "User not found." and nothing is shown or built

### Requirement: Download failure handling
The system SHALL keep the manager on the page with "Could not download the logs." when a download fails, SHALL save no partial file, and SHALL return to the login screen instead when the session has ended.

#### Scenario: Server unreachable
- **GIVEN** the web portal cannot reach the server
- **WHEN** the manager clicks any download button
- **THEN** the message "Could not download the logs." shows and no file saves

#### Scenario: Session ended
- **GIVEN** the manager's session is no longer valid
- **WHEN** the manager clicks any download button
- **THEN** the portal returns to the login screen

### Requirement: The server builds every file
The system SHALL build each file completely on the server — its rows, columns, order, name, and encoding all arrive finished — and the screen SHALL only trigger the download and save what arrives.

#### Scenario: Browser adds nothing
- **GIVEN** any of the three downloads
- **WHEN** the file saves
- **THEN** every value in it came from the server — the screen computed no row, column, or order itself
