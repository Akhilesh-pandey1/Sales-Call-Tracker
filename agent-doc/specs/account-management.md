# Spec: account-management

## Purpose

The manager — who is also the admin, one web role (Decision 4) — creates and governs every account from the web: create, edit, pause, bring back, or remove permanently.

## Requirements

### Requirement: The full account list

The Accounts screen SHALL list every account — id, name, role, country, active flag — deactivated included, shown greyed out with an Activate button, so they can always be found again. The list SHALL come from a manager-only endpoint and SHALL carry no call counts (Decision 38).

#### Scenario: Deactivated people stay findable

- **WHEN** the manager opens the Accounts screen
- **THEN** every account shows, deactivated ones greyed out with an Activate button

#### Scenario: Tapping a row opens the person

- **WHEN** the manager taps any account row — active or deactivated
- **THEN** that person's view opens, so a deactivated person's call history stays reachable (Decision 58)

### Requirement: Create a salesperson

The manager SHALL create an account with a name, a starting password, and a country chosen from a shortlist (starts with IN, AE, US). The role SHALL be fixed to salesperson — the form's dropdown shows only "Salesperson" and no second manager can be created. Duplicate names are rejected because the name is the login ID. The password rule is enforced (Decisions 19, 30, 66, 70, 77).

#### Scenario: A normal create

- **WHEN** the manager submits a new name, a valid password, and a country
- **THEN** the account is created as a salesperson and appears in the list

#### Scenario: Duplicate name

- **WHEN** the manager creates an account with a name that already exists
- **THEN** the response says "That name is already taken."

#### Scenario: Role cannot be escalated

- **WHEN** any create request arrives
- **THEN** the created account is a salesperson, whatever the request claims

### Requirement: Edit without losing history

The manager SHALL edit any of name / password / country through one update action. A password edit SHALL kill the person's old session instantly; a name edit SHALL obey the same uniqueness rule; a country edit changes the app's dialing default at the next login. Editing never touches the person's call history (Decisions 31, 36).

#### Scenario: Fix a typo'd name

- **WHEN** the manager edits a person's name
- **THEN** the person keeps all their call history under the new name

#### Scenario: Password edit logs the person out

- **WHEN** the manager sets a new password for a person
- **THEN** the person's app is logged out on its next request and needs the new password (a forgotten password is fixed this way, Decision 19)

#### Scenario: Duplicate name on edit

- **WHEN** an edit tries to rename a person to a name that already exists
- **THEN** the response says "That name is already taken."

### Requirement: Deactivate and activate

Deactivate SHALL pause the person: they cannot log in, their app gets rejected, and they drop out of the team table — while their call history is kept and keeps counting in team totals. Activate SHALL bring them back with all numbers untouched, and their phone's leftover queue syncs again. Only delete removes calls (Decisions 22, 58).

#### Scenario: Deactivate pauses, numbers stay

- **WHEN** the manager deactivates a salesperson
- **THEN** the person can no longer log in, the team table hides them, and their past calls keep counting in the totals

#### Scenario: Reactivate brings everything back

- **WHEN** the manager activates a deactivated person
- **THEN** they can log in again with the same password and every number is untouched

### Requirement: Permanent delete

Delete SHALL remove the person, their session, and ALL their call rows — past team totals shrink and nothing comes back. The web SHALL ask before running it: "This permanently removes NAME and all their calls. Cannot be undone." (Decision 28).

#### Scenario: Delete after confirmation

- **WHEN** the manager confirms the delete dialog
- **THEN** the person and every call they ever made are gone and the totals shrink — deactivate stays the safe option

### Requirement: The manager protects themself

The server SHALL refuse deactivate and delete aimed at the manager's own account — with one manager in v1, one tap could otherwise lock everyone out. Editing the manager's own name / password / country SHALL stay allowed (Decision 48).

#### Scenario: Self-deactivate refused

- **WHEN** the manager tries to deactivate their own account
- **THEN** the server refuses with a clear error

#### Scenario: Self-delete refused

- **WHEN** the manager tries to delete their own account
- **THEN** the server refuses with a clear error

#### Scenario: Self-edit allowed

- **WHEN** the manager edits their own name, password, or country
- **THEN** the edit goes through like any other
