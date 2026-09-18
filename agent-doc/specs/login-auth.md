# Spec: login-auth

## Purpose

One shared login — name plus password — for both the Android app and the manager's web dashboard, with token sessions the manager can kill instantly (Decisions 19, 31).

## Requirements

### Requirement: Login with name and password

The system SHALL log a user in with name and password through one shared endpoint used by both the app and the web. A successful login SHALL return the person's token, own id, role, name, and country — the app saves its own id to ask for its own stats later (Decision 39) and the country to normalize dialed numbers (Decision 34).

#### Scenario: Correct credentials

- **WHEN** a user logs in with the correct name and password on an active account
- **THEN** the response carries a fresh token, the person's id, role, name, and country

#### Scenario: Wrong credentials

- **WHEN** the name or password is wrong
- **THEN** the response says "Wrong name or password."

#### Scenario: Deactivated account

- **WHEN** the name and password are correct but the account is deactivated
- **THEN** the response says "Your account is not active. Please contact your manager." (Decision 43)

#### Scenario: App remembers who it is

- **WHEN** the app logs in successfully
- **THEN** it stores its own id and uses it for its My Stats requests

### Requirement: Token sessions

Every login SHALL write a fresh random token, replacing the old one. Every request except login SHALL present the token, and the server SHALL check both the token and that the account is active before doing anything. A dead token SHALL get a 401, and the screen SHALL return to the login page (Decision 31).

#### Scenario: A new login kills the old session

- **WHEN** the same name logs in on a second phone
- **THEN** the first phone's token stops working — its next request gets a 401 (accepted: two phones on one login stall the first, Decision 76)

#### Scenario: Manager actions kill sessions instantly

- **WHEN** the manager deactivates the account, deletes it, or resets its password
- **THEN** the person's saved token stops working on their very next request

#### Scenario: Web stays logged in

- **WHEN** the manager keeps the token in the browser's localStorage
- **THEN** a page refresh stays logged in, and a 401 returns the login page (Decision 63)

#### Scenario: App stays logged in

- **WHEN** the salesperson closes and reopens the app
- **THEN** they are still logged in — no login screen until their token dies

### Requirement: No logout endpoint

Logout SHALL be browser-side only: clear the saved token and show the login page. The system SHALL NOT provide a logout endpoint (Decision 31).

#### Scenario: Logout clears locally

- **WHEN** the manager taps Logout on the web
- **THEN** the token is cleared and the login page shows — no server call is needed

### Requirement: Guess limit on passwords

After 10 wrong password tries for one name, that name SHALL wait 5 minutes before the next try — even with the correct password. The counter SHALL live in server memory, so a server restart clears it (accepted, Decision 76).

#### Scenario: Lockout blocks the next try

- **WHEN** a name has 10 wrong password tries
- **THEN** the next try for that name is blocked for 5 minutes, correct password or not

#### Scenario: Other names are unaffected

- **WHEN** one name is locked out
- **THEN** a different name can still log in normally during those 5 minutes

### Requirement: Password rule

Every created or edited password SHALL have at least 8 characters with at least one uppercase and one lowercase letter. The API SHALL enforce the rule (the web form may check it too, but the API is the real gate) (Decision 66).

#### Scenario: Weak password rejected

- **WHEN** an account is created or edited with a password shorter than 8 characters, or without an uppercase or lowercase letter
- **THEN** the API rejects it with a clear error

#### Scenario: Valid password accepted

- **WHEN** a password meets the rule
- **THEN** it is accepted and stored only as a hash

### Requirement: The web is manager-only

The web SHALL route by role after login. A salesperson who logs in on the web SHALL see one message — "This dashboard is for managers." — and no data. The login endpoint itself stays shared with the app (Decision 69).

#### Scenario: Salesperson on the web

- **WHEN** a salesperson logs in on the web dashboard
- **THEN** they see "This dashboard is for managers." and no data

### Requirement: No manager mode in the app

The app SHALL treat every account the same — the manager never uses the app, and even if a manager logs in there, it is just another dialer user (Decision 74).

#### Scenario: Manager in the app

- **WHEN** the manager's account logs in on the Android app
- **THEN** the app shows the same dialer and My Stats as any salesperson
