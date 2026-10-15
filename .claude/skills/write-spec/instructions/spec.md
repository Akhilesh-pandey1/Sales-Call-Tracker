Create specification files that define WHAT the module must do as a testable behavior contract.

## Principles

1. **Behavior Contract, Not Code:**
   A spec defines externally observable behavior, business logic, constraints, and error modes. 
   - DO NOT include programming language code, internal class/function bodies, or step-by-step code execution.
   - Database tables belong in `agent-doc/database.md`. API payloads belong in `agent-doc/api.md`. Cross-reference them when needed, do not duplicate them here.

2. **1:1 Mapping to Capability Map:**
   Create exactly one spec file per module listed in `agent-doc/proposal.md` under the Capability Map:
   `agent-doc/specs/<module-id>.md` (kebab-case name matching the table).

3. **Normative Requirements (RFC 2119):**
   - Each requirement header: `### Requirement: <Name>`
   - State requirements using **SHALL** or **MUST** (avoid ambiguous "should" or "may").
   - Keep requirements focused on one specific behavior.

4. **Scenario Formatting (Acceptance Criteria):**
   - Every requirement MUST have at least one scenario.
   - Header: `#### Scenario: <Name>` (**CRITICAL:** MUST use exactly four hashtags `####` so parsers recognize it).
   - Use structured Given/When/Then:
     - `- **GIVEN** [precondition]`
     - `- **WHEN** [trigger/action]`
     - `- **THEN** [expected result/observable state]`
   - Cover both the happy path and critical edge/error cases.

5. **Quick Verification Test:**
   If the internal implementation can change completely without altering the externally visible behavior or test assertions, the spec is well-written.
