# Spec: tracking-spike

## Purpose

Proves, on the oldest Android phone the team actually uses, that the full tracking chain works — dial from our app, call ends, read the Android call log, match the entry, exact duration — before anything else is built (Decisions 12, 27). The proven code becomes the start of the app, not a throwaway (Decision 75).

## Requirements

### Requirement: The spike comes first and proves the full chain

The tracking spike SHALL be the first build step. It SHALL prove the full chain on the oldest real team phone: dial from our app → the call ends → the app reads the Android call log → the entry is matched to the dial → the exact duration is recorded. The API and the dashboards SHALL NOT be built until the eight-case checklist below passes.

#### Scenario: Chain proven before anything else is built

- **WHEN** all eight checklist cases pass on the oldest team phone
- **THEN** the rest of the build (API, web, app features) may start
- **AND** until then, no other part is built

### Requirement: The eight-case checklist

The spike SHALL pass all eight cases on the oldest team phone (Decision 45). Existing libraries are used first; custom native (Kotlin) code is written only for what libraries cannot do (Decision 14).

#### Scenario: Case 1 — answered call

- **WHEN** a normal call is dialed from the app and answered
- **THEN** the recorded duration is the talk time, not the ring time

#### Scenario: Case 2 — unanswered dial

- **WHEN** a dial from the app is never answered
- **THEN** it is recorded with duration 0 and counts as a dial only (Decision 17)

#### Scenario: Case 3 — long ring before answer

- **WHEN** the phone rings about 3 minutes before the call is answered
- **THEN** the call-log entry still matches the dial inside the 1-minute window (the entry's time marks when the call was placed, not when it was answered)

#### Scenario: Case 4 — two quick calls to the same number

- **WHEN** the same number is dialed twice in quick succession
- **THEN** the entries match in order — first intent with the first entry, second intent with the second

#### Scenario: Case 5 — incoming call never matches

- **WHEN** a customer calls back (an incoming call from the same number arrives after a dial)
- **THEN** the incoming entry never fills the outgoing dial's row (Decision 44)

#### Scenario: Case 6 — app killed mid-call

- **WHEN** the app is killed while a call is running
- **THEN** the pending row is completed from the call log at the first app open after 1 hour — the janitor's job (Decisions 11, 50)

#### Scenario: Case 7 — call-end listener fires

- **WHEN** a call is hung up
- **THEN** the real-time call-end listener fires on the oldest phone

#### Scenario: Case 8 — call-log entry latency

- **WHEN** a call ends and the call-log entry does not appear immediately
- **THEN** the app retries reading the log at 3s / 10s / 30s, and if the entry still is not there it leaves the row for the janitor

### Requirement: The spike's code ships

The spike SHALL be built inside the real `app/` folder. Its proven permission checks, call-log reading, and matching logic SHALL carry into the real app unchanged when the checklist passes.

#### Scenario: Nothing thrown away

- **WHEN** the eight-case checklist passes
- **THEN** the app continues from the spike's code instead of starting over

### Requirement: One phone is enough

No per-brand testing SHALL be done in v1. The checklist runs on the one oldest team phone; if a person's dashboard numbers ever look wrong later, the same checklist runs on that person's phone then (Decision 46).

#### Scenario: Spike done after one phone

- **WHEN** the checklist passes on the oldest team phone
- **THEN** the spike is complete — other brands are not pre-tested
