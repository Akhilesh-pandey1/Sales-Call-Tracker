## Purpose

Lets the manager control who can log in and make calls. Managers create accounts, fix typos, change countries, pause or re-enable access, and permanently remove people — without losing call history unless they explicitly choose delete.

## Requirements

### Requirement: Create salesperson account
The system SHALL allow the manager to create a salesperson account with a unique name, a strong starting password, and a dialing country code from the allowed shortlist.

#### Scenario: Successful creation
- **GIVEN** a unique name, a password with 8+ characters including an uppercase and a lowercase letter, and a valid country code
- **WHEN** the manager submits the create form
- **THEN** the account is created and the server confirms success

#### Scenario: Duplicate name rejected
- **GIVEN** the submitted name already exists in the system (any role, any status)
- **WHEN** the create form is submitted
- **THEN** the server refuses with "That name is already taken."

#### Scenario: Weak password rejected
- **GIVEN** a password shorter than 8 characters or lacking an uppercase or lowercase letter
- **WHEN** the create form is submitted
- **THEN** the server refuses with "Password needs 8+ characters with an uppercase and a lowercase letter."

#### Scenario: Invalid country code rejected
- **GIVEN** a country code outside the allowed shortlist (IN, AE, US)
- **WHEN** the create form is submitted
- **THEN** the server refuses with "Country must be one of: IN, AE, US."

### Requirement: Edit account
The system SHALL allow the manager to update a user's name, password, and/or country in any combination; changing the password SHALL invalidate the user's existing session token.

#### Scenario: Name updated
- **GIVEN** a new unique name for an existing account
- **WHEN** the manager submits the edit
- **THEN** the name is updated and success is confirmed

#### Scenario: Password changed invalidates old token
- **GIVEN** the manager changes a salesperson's password
- **WHEN** the salesperson's next request uses the old token
- **THEN** it is rejected as invalid

#### Scenario: Manager can edit own account
- **GIVEN** the manager submits an edit targeting their own account
- **WHEN** the edit is processed
- **THEN** the change is accepted normally

### Requirement: Deactivate account
The system SHALL allow the manager to deactivate a salesperson account, preventing login and rejecting API requests from that account while preserving all historical call data.

#### Scenario: Deactivated account cannot log in
- **GIVEN** a deactivated salesperson submits correct credentials
- **WHEN** login is attempted
- **THEN** the server refuses with "Your account is not active. Please contact your manager."

#### Scenario: Deactivated account's calls kept
- **GIVEN** a salesperson is deactivated after making calls
- **WHEN** the dashboards are computed
- **THEN** all existing calls remain counted in team totals

#### Scenario: Self-deactivation refused
- **GIVEN** the manager targets their own account for deactivation
- **WHEN** the request is submitted
- **THEN** the server refuses with "You cannot do this to your own account."

### Requirement: Activate account
The system SHALL allow the manager to reactivate a deactivated account, restoring full access with all historical data intact.

#### Scenario: Reactivated account can log in
- **GIVEN** a deactivated salesperson whose account is reactivated
- **WHEN** they log in with correct credentials
- **THEN** login succeeds with all prior stats visible

### Requirement: Delete account permanently
The system SHALL allow the manager to permanently delete a salesperson account and ALL their call records, after a confirmation warning that the action cannot be undone.

#### Scenario: Delete removes user and all calls
- **GIVEN** the manager confirms deletion of a salesperson account
- **WHEN** the delete is processed
- **THEN** the user row and every call row for that user are removed and past team totals shrink accordingly

#### Scenario: Self-deletion refused
- **GIVEN** the manager targets their own account for deletion
- **WHEN** the request is submitted
- **THEN** the server refuses with "You cannot do this to your own account."

#### Scenario: Delete releases lead claims
- **GIVEN** a deleted user held an active lead claim
- **WHEN** the delete is processed
- **THEN** the claim is released and the lead becomes available to other salespeople

### Requirement: List all accounts
The system SHALL return all accounts — active and inactive — with id, name, role, country, and active status, and SHALL NOT include call counts; deactivated rows stay visible and greyed out and can be opened to their person view.

#### Scenario: All accounts returned
- **GIVEN** accounts exist in both active and inactive states
- **WHEN** the manager requests the account list
- **THEN** every account is included

#### Scenario: Deactivated row stays reachable
- **GIVEN** the list shows a deactivated account
- **WHEN** the manager taps the row
- **THEN** that person's view opens with their call history

#### Scenario: Non-manager access refused
- **GIVEN** a salesperson token calls the account list endpoint
- **WHEN** the request is processed
- **THEN** the server refuses with an authorization error

### Requirement: Accounts list header and own-row marker
The system SHALL show the total and active account counts in the list header and SHALL mark the manager's own row with a "You" badge; the manager's own row SHALL offer no edit, deactivate, or delete actions.

#### Scenario: Counts shown
- **GIVEN** 8 accounts exist of which 7 are active
- **WHEN** the accounts list renders
- **THEN** the header shows 8 accounts with 7 active

#### Scenario: Own row marked and unactionable
- **GIVEN** the manager views the accounts list
- **WHEN** their own row renders
- **THEN** it carries a "You" badge and shows no action buttons
