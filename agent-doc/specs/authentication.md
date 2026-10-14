## Purpose

Proves who is calling. Every salesperson signs in with name + password; the server issues a session token that gates all API endpoints. Invalid or deactivated sessions are rejected immediately.

## Requirements

### Requirement: Name-and-password login
The system SHALL authenticate a user by matching their name and plaintext password against the stored hash and returning a session token, user ID, role, name, and dialing country on success.

#### Scenario: Successful login
- **WHEN** a user submits a valid name and correct password for an active account
- **THEN** the server returns HTTP 200 with a token, id, role, name, and country

#### Scenario: Wrong password
- **WHEN** a user submits a correct name but wrong password
- **THEN** the server returns HTTP 401 with message "Wrong name or password."

#### Scenario: Name not found
- **WHEN** a user submits a name that does not exist in the system
- **THEN** the server returns HTTP 401 with message "Wrong name or password."

#### Scenario: Deactivated account
- **WHEN** a user submits correct credentials for a deactivated account
- **THEN** the server returns HTTP 403 with message "Your account is not active. Please contact your manager."

#### Scenario: Missing fields
- **WHEN** the login request body omits name or password
- **THEN** the server returns HTTP 400 with message "Name and password are required."

### Requirement: Single active session per user
The system SHALL issue a new random auth token on every login, replacing any previously stored token for that user, so logging in on a new device instantly invalidates the old session.

#### Scenario: Re-login replaces old token
- **WHEN** a user logs in successfully for a second time
- **THEN** the old token is no longer valid for any API request

#### Scenario: Token used after password reset
- **WHEN** the manager resets a salesperson's password
- **THEN** the salesperson's existing token is replaced and any subsequent request with the old token returns HTTP 401

### Requirement: Token-gated API access
The system SHALL require a valid `Authorization: Bearer <token>` header on every endpoint except `POST /api/login`, and SHALL verify the token owner's account is active before processing the request.

#### Scenario: Valid token on protected endpoint
- **WHEN** a request includes a token matching an active user
- **THEN** the server processes the request normally

#### Scenario: Invalid or missing token
- **WHEN** a request to a protected endpoint contains an invalid or missing token
- **THEN** the server returns HTTP 401 with message "Invalid or expired token."

#### Scenario: Deactivated user with valid token
- **WHEN** a request includes a token belonging to a deactivated account
- **THEN** the server returns HTTP 403 with message "Your account is not active. Please contact your manager."

### Requirement: Login brute-force lockout
The system SHALL lock a name out of login for 5 minutes after 10 consecutive wrong-password attempts, blocking even the correct password during the lockout window. The counter resets on a successful login.

#### Scenario: Lockout triggered
- **WHEN** 10 consecutive failed login attempts are made for the same name
- **THEN** the 11th attempt returns HTTP 429 with message "Too many tries. Wait 5 minutes and try again." regardless of whether the password is correct

#### Scenario: Lockout expires
- **WHEN** 5 minutes have elapsed since the lockout was triggered
- **THEN** the next login attempt is accepted normally if credentials are correct

#### Scenario: Counter reset on success
- **WHEN** a user logs in successfully before reaching 10 failures
- **THEN** the failure counter for that name resets to zero
