---
name: implement-with-pocock
description: "Implement a piece of work based on a spec or set of tasks."
---

# Implement with Pocock

Implement the work described in the spec or task with zero guessing.

## 1. Single Source of Truth (No Guessing / No Assumptions)
Do NOT invent architecture, folder structures, database schemas, API routes, or UI components. All decisions have already been planned, grilled, and designed:

- **Specs & Scenarios**: `agent-doc/specs/`
- **Database schemas & tables**: `agent-doc/database.md`
- **API contracts & endpoints**: `agent-doc/api.md`
- **Architectural & tech stack decisions**: `agent-doc/decisions.md`
- **Screens & UI designs**: `agent-doc/screens/` (or generated HTML/CSS mockups)

Strictly mirror the exact types, naming, and layouts defined in these files.

## 2. Implementation Loop
1. Use `/tdd-with-pocock` where possible: write tests at pre-agreed public seams first, then write minimal code to pass.
2. Run typechecking regularly and single test files regularly.
3. Run the full test suite once at the end.
4. Run only quick commands (`npm run build`, `npm test`) — never a heavy build (mobile APK, `gradle`, emulator). The human runs those.

## 3. Review & Commit
1. Once code passes all tests, use `/code-review-with-pocock` to review against the original spec and coding standards.
2. Fix any review issues.
3. Commit your work to the current branch.