## Purpose

Lets the manager control who can log in and make calls. Managers create accounts, fix typos, change countries, pause or re-enable access, and permanently remove people — without losing call history unless they explicitly choose to delete.

## Requirements

### Requirement: Create salesperson account
The system SHALL allow the manager to create a salesperson account with a unique name, a strong starting password, and a dialing country code.

#### Scenario: Successful creation
- **WHEN** the manager submits a unique name, a valid password, and a valid country code
- **THEN** the account is created and the server returns `{"status": true}` with HTTP 201

#### Scenario: Duplicate name rejected
- **WHEN** the submitted name already exists in the system (any role, any status)
- **THEN** the server returns HTTP 400 with message "That name is already taken."

#### Scenario: Weak password rejected
- **WHEN** the password is fewer than 8 characters or lacks both an uppercase and a lowercase letter
- **THEN** the server returns HTTP 400 with message "Password needs 8+ characters with an uppercase and a lowercase letter."

#### Scenario: Invalid country code rejected
- **WHEN** the country code is not in the allowed shortlist (IN, AE, US)
- **THEN** the server returns HTTP 400 with message "Country must be one of: IN, AE, US."

### Requirement: Edit account (name, password, country)
The system SHALL allow the manager to update a user's name, password, and/or country. Changing the password SHALL invalidate the user's existing session token.

#### Scenario: Name updated
- **WHEN** the manager submits a new unique name for an existing account
- **THEN** the name is updated and `{"status": true}` is returned

#### Scenario: Password changed invalidates old token
- **WHEN** the manager changes a salesperson's password
- **THEN** the salesperson's current auth token is replaced; the next API request with the old token returns HTTP 401

#### Scenario: Manager can edit own account
- **WHEN** the manager submits an edit request targeting their own account ID
- **THEN** the change is accepted normally

### Requirement: Deactivate account
The system SHALL allow the manager to deactivate a salesperson account, preventing login and rejecting API requests from that account while preserving all historical call data.

#### Scenario: Deactivated account cannot log in
- **WHEN** a deactivated salesperson attempts to log in with correct credentials
- **THEN** the server returns HTTP 403 with message "Your account is not active. Please contact your manager."

#### Scenario: Deactivated account's calls kept
- **WHEN** an account is deactivated
- **THEN** all existing calls remain in the `calls` table and still count in team dashboard totals

#### Scenario: Self-deactivation refused
- **WHEN** the manager submits a deactivate request targeting their own account ID
- **THEN** the server returns HTTP 400 with message "You cannot do this to your own account."

### Requirement: Activate (re-enable) account
The system SHALL allow the manager to reactivate a deactivated account, restoring full access with all historical data intact.

#### Scenario: Reactivated account can log in
- **WHEN** a deactivated salesperson's account is reactivated and they log in
- **THEN** login succeeds and they access the app normally with all prior stats visible

### Requirement: Delete account permanently
The system SHALL allow the manager to permanently delete a salesperson account and ALL their call records.

#### Scenario: Delete removes user and all calls
- **WHEN** the manager deletes an account
- **THEN** the user row and every row in `calls` for that user are removed; past team totals shrink accordingly

#### Scenario: Self-deletion refused
- **WHEN** the manager submits a delete request targeting their own account ID
- **THEN** the server returns HTTP 400 with message "You cannot do this to your own account."

#### Scenario: Delete releases lead claims
- **WHEN** a user who holds an active lead claim is deleted
- **THEN** that claim is released and the lead becomes available to other salespeople

### Requirement: List all accounts
The system SHALL return all accounts (active and inactive) for the manager's Accounts screen, showing id, name, role, country, and is_active for each. The list SHALL NOT include call counts.

#### Scenario: All accounts returned
- **WHEN** the manager requests the account list
- **THEN** every account — active and inactive — is included

#### Scenario: Non-manager access refused
- **WHEN** a salesperson token is used to call the user list endpoint
- **THEN** the server returns HTTP 403
