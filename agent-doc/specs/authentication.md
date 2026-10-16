## Purpose

Proves who is calling. Every salesperson signs in with name + password; the server issues a session token that gates all API endpoints. Invalid or deactivated sessions are rejected immediately.

## Requirements

### Requirement: Name-and-password login
The system SHALL authenticate a user by matching their name and plaintext password against the stored hash and returning a session token, user ID, role, name, and dialing country on success.

#### Scenario: Successful login
- **GIVEN** an active account with a known name and password
- **WHEN** the user submits both correctly
- **THEN** the server returns a token, id, role, name, and country

#### Scenario: Wrong password
- **GIVEN** a registered name
- **WHEN** the user submits it with a wrong password
- **THEN** the server returns "Wrong name or password."

#### Scenario: Name not found
- **GIVEN** a name that does not exist in the system
- **WHEN** the user submits it with any password
- **THEN** the server returns the same "Wrong name or password." message

#### Scenario: Deactivated account
- **GIVEN** a deactivated account with correct credentials
- **WHEN** login is attempted
- **THEN** the server returns "Your account is not active. Please contact your manager."

#### Scenario: Missing fields
- **GIVEN** a login request missing the name or the password
- **WHEN** the request is submitted
- **THEN** the server returns "Name and password are required."

### Requirement: Single active session per user
The system SHALL issue a new random auth token on every login, replacing any previously stored token for that user, so logging in on a new device instantly invalidates the old session.

#### Scenario: Re-login replaces old token
- **GIVEN** a user logged in on one device
- **WHEN** the same user logs in successfully elsewhere
- **THEN** the old token no longer works for any API request

#### Scenario: Token used after password reset
- **GIVEN** the manager reset a salesperson's password
- **WHEN** the salesperson's next request uses the old token
- **THEN** it is rejected as invalid

### Requirement: Token-gated API access
The system SHALL require a valid `Authorization: Bearer <token>` header on every endpoint except login and SHALL verify the token owner's account is active before processing the request.

#### Scenario: Valid token on protected endpoint
- **GIVEN** a request carries a token matching an active user
- **WHEN** the request reaches a protected endpoint
- **THEN** it is processed normally

#### Scenario: Invalid or missing token
- **GIVEN** a request to a protected endpoint with an invalid or missing token
- **WHEN** the request is processed
- **THEN** the server returns "Invalid or expired token."

#### Scenario: Deactivated user with valid token
- **GIVEN** a valid token belonging to a deactivated account
- **WHEN** it is used on a protected endpoint
- **THEN** the server returns "Your account is not active. Please contact your manager."

### Requirement: Manager-only web gate
The system SHALL route by role on the web: a salesperson who logs in on the web sees one message — "This dashboard is for managers." — and no data, while the login endpoint itself stays shared with the app.

#### Scenario: Salesperson on the web
- **GIVEN** a salesperson account logs in on the web dashboard
- **WHEN** the web routes the session
- **THEN** the manager-only message shows and no dashboard data loads

#### Scenario: Manager on the web
- **GIVEN** a manager account logs in on the web
- **WHEN** the web routes the session
- **THEN** the team dashboard opens

### Requirement: Login brute-force lockout
The system SHALL lock a name out of login for 5 minutes after 10 consecutive wrong-password attempts, blocking even the correct password during the lockout window; the counter resets on a successful login.

#### Scenario: Lockout triggered
- **GIVEN** 10 consecutive failed login attempts for the same name
- **WHEN** the 11th attempt arrives
- **THEN** it is refused with "Too many tries. Wait 5 minutes and try again." even if the password is correct

#### Scenario: Lockout expires
- **GIVEN** a name locked out for 5 minutes
- **WHEN** the window elapses and correct credentials arrive
- **THEN** the login is accepted normally

#### Scenario: Counter reset on success
- **GIVEN** a name with some recorded failures
- **WHEN** a login with correct credentials succeeds before 10 failures
- **THEN** the failure counter for that name resets to zero
