## Purpose

Gives the salesperson a personal calling list that lives on the phone only. Upload numbers three ways, call through them with Start Calling, and export or wipe the list — the manager never sees it and the server never stores it.

## Requirements

### Requirement: My List tab shows KPIs only
The system SHALL grow the Dialer's pill switch to three items — Keypad | Automated | My List — and the My List tab SHALL show only the Upload, Download, and Clear buttons, Start Calling, the four summary cards — Left, Called, Interested, Do not call — and the line that the list lives only on the phone. The per-number rows, their badges, and the list-loading code SHALL be gone, while the `my_list_numbers` table stays and still powers Start Calling, Download, Clear, and call-marking.

#### Scenario: Third pill item
- **GIVEN** the Dialer is open
- **WHEN** the pill switch renders
- **THEN** it shows Keypad | Automated | My List

#### Scenario: Four summary cards match the table
- **GIVEN** the table holds numbers in several states
- **WHEN** the My List tab opens
- **THEN** the Left, Called, Interested, and Do not call cards show each state's count

#### Scenario: No per-number rows
- **GIVEN** the table holds called and interested numbers
- **WHEN** the My List tab renders
- **THEN** no number row or badge shows anywhere on the tab

#### Scenario: Empty list
- **GIVEN** the table is empty
- **WHEN** the My List tab opens
- **THEN** it reads "No numbers yet." with Upload as the invite

### Requirement: Phone-local only
The list SHALL live only on the phone, in its own local SQLite table, never sent to the server; the manager never sees it, and everything on the tab works offline.

#### Scenario: Never synced
- **GIVEN** numbers were added and marked over days of calling
- **WHEN** the batch sync runs
- **THEN** no My List data rides it — the server holds nothing about the list

#### Scenario: Manager never sees it
- **GIVEN** any manager view on the web
- **WHEN** it renders
- **THEN** no My List data appears anywhere

#### Scenario: Works offline
- **GIVEN** the phone has no internet
- **WHEN** the My List tab opens
- **THEN** the list, chips, Upload, Start Calling, Download, and Clear all work with no server contact

### Requirement: Numbers come in three ways
The system SHALL take numbers three ways — a paste box that accepts any messy text and pulls out every phone-like number, a CSV file picker, and an Excel (.xlsx) file picker parsed on the phone by an Excel-reading library chosen at implementation — plus a "Copy AI prompt" button that copies a ready prompt, so the salesperson pastes their sheet text and the prompt into ChatGPT and puts the comma-separated numbers ChatGPT returns into the paste box.

#### Scenario: Messy paste yields numbers
- **GIVEN** text with phone numbers buried among names and notes
- **WHEN** it is pasted into the paste box
- **THEN** every phone-like number is pulled out for upload

#### Scenario: CSV file picker
- **GIVEN** a CSV file on the phone
- **WHEN** it is picked for upload
- **THEN** its numbers are read for upload

#### Scenario: Excel parsed on the phone
- **GIVEN** an .xlsx file on the phone
- **WHEN** it is picked for upload
- **THEN** it is parsed on the phone and its numbers are read for upload

#### Scenario: AI prompt copied
- **GIVEN** the My List upload view
- **WHEN** "Copy AI prompt" is tapped
- **THEN** the ready prompt is copied for pasting into ChatGPT beside the sheet text

### Requirement: Upload rules
The system SHALL normalize every number to E.164 with the login country before storing; SHALL delete a number's existing row in any state and add it fresh as Left — re-uploading a sheet re-arms all its numbers — with the same number twice inside one upload counting once; SHALL toast "Added N numbers." with "M not valid." appended when any parse fails; and SHALL cap the list at the app's `my_list_max_numbers` config value (10000).

#### Scenario: Messy input still stores E.164
- **GIVEN** pasted text holding numbers in mixed local formats
- **WHEN** the upload is stored
- **THEN** every number sits in the table as E.164 for the login country

#### Scenario: Re-upload re-arms
- **GIVEN** a number already in the list as Called
- **WHEN** its sheet is uploaded again
- **THEN** the old row is deleted and a fresh Left row is added

#### Scenario: Same number twice in one upload counts once
- **GIVEN** one upload carrying the same number twice
- **WHEN** it is stored
- **THEN** the number is added once

#### Scenario: Toast with counts
- **GIVEN** an upload that added 20 numbers with 3 unparseable rows
- **WHEN** it finishes
- **THEN** the toast reads "Added 20 numbers. 3 not valid."

#### Scenario: Clean toast without failures
- **GIVEN** an upload where every row parsed
- **WHEN** it finishes
- **THEN** the toast reads only "Added N numbers."

#### Scenario: List capped by config
- **GIVEN** the list already holds the configured cap of numbers
- **WHEN** another upload runs
- **THEN** the cap from `my_list_max_numbers` bounds the list — the limit is read from config, never hardcoded

### Requirement: Start Calling never dials Do-not-track numbers
Start Calling SHALL never dial a Do-not-track number — a listed number is skipped and never recorded — and a row SHALL be marked called by ANY recorded call to its number, from Start Calling or a keypad dial, matched on the normalized number exactly like lead resolution does.

#### Scenario: Do-not-track number skipped
- **GIVEN** a My List number that is also on the Do-not-track list
- **WHEN** Start Calling reaches it
- **THEN** the number is skipped, never dialed, and never recorded

#### Scenario: Marked called from Start Calling
- **GIVEN** Start Calling dialed a list number
- **WHEN** the call is recorded
- **THEN** the row moves out of Left

#### Scenario: Marked called from a keypad dial
- **GIVEN** a number sitting in the list as Left
- **WHEN** the salesperson dials it manually from the keypad and the call is recorded
- **THEN** the row moves out of Left — any recorded call counts

### Requirement: First call attempt moves the row out of Left
The system SHALL move a My List row out of Left on the first recorded call to its number — connected or not — saving the outcome and note on the row; Left SHALL count numbers never dialed.

#### Scenario: Unconnected call still moves the row
- **GIVEN** a row in Left whose number was dialed and not connected
- **WHEN** the call is recorded
- **THEN** the number moves out of Left into Called

#### Scenario: Outcome and note saved on the row
- **GIVEN** a call to a list number carried the Interested choice and a note
- **WHEN** the call is recorded
- **THEN** the flag and the note sit on the row

#### Scenario: Left stays for never-dialed numbers
- **GIVEN** a number never dialed
- **WHEN** the tab renders
- **THEN** the number still counts as Left in the summary cards

### Requirement: Post-call popup schedules like the keypad
The My List post-call popup SHALL carry the same Schedule choice the automated flow has — same popup, same pieces. Choosing Schedule SHALL book the number as a keypad-style booking keyed by phone number, so it appears on the Scheduled tab with Copy, WhatsApp, and the Call button, and it leaves that tab by the same rules as any booking.

#### Scenario: Schedule choice books onto the Scheduled tab
- **GIVEN** a My List call ended and its post-call popup is showing
- **WHEN** the salesperson schedules a future date and submits
- **THEN** the number is booked keypad-style, keyed by phone number, and the booking appears on the Scheduled tab with Copy, WhatsApp, and the Call button

#### Scenario: Booking leaves by the standing rules
- **GIVEN** a booking made from the My List popup
- **WHEN** its notification is tapped, its number is called, or 24 hours pass its booked time
- **THEN** it leaves the Scheduled tab like any other booking

### Requirement: Download saves the whole list as a file
The system SHALL save the whole list as one real .csv file in the phone's Downloads folder — number, status, interested, do-not-call, notes, called date, called time — named by the save moment as date and full time, like 26-10-2026-18-03-26.csv, so every download is its own file; no share sheet opens. A toast SHALL confirm the save with the file's name. Each row keeps its called date and called time so today's slice is a filter in the spreadsheet app.

#### Scenario: Download saves a unique file
- **GIVEN** a list of any size
- **WHEN** Download is tapped
- **THEN** one .csv of the whole list — number, status, interested, do-not-call, notes, called date, called time — lands in Downloads with the date-time name, no share sheet opens, and a toast confirms the save with the file's name

#### Scenario: Rows keep their dates
- **GIVEN** rows called on different days
- **WHEN** the CSV opens in a spreadsheet app
- **THEN** each row keeps its own called date to filter on

### Requirement: Clear wipes the whole list after confirmation
The system SHALL wipe the whole list only after a confirmation that shows the counts — left and called — and SHALL touch nothing on the server.

#### Scenario: Confirmation shows the counts
- **GIVEN** a list holding left and called rows
- **WHEN** Clear is tapped
- **THEN** the confirmation shows both counts before anything is deleted

#### Scenario: Cancel keeps everything
- **GIVEN** the Clear confirmation is showing
- **WHEN** the salesperson cancels
- **THEN** the list is untouched

#### Scenario: Server untouched
- **GIVEN** a cleared list
- **WHEN** the wipe completes
- **THEN** no server data changed — the list existed only on the phone
