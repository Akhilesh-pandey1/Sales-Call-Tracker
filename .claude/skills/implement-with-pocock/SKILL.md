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
- **UI stack guidelines (how to build UI in your stack)**: the `ui-ux-pro-max` skill - `.claude/skills/ui-ux-pro-max/`

Building UI: the design is already decided by the sources above - what this adds is the HOW in your framework. Detect the stack from the project's package file and query THAT stack - never a hardcoded one. React + shadcn + Tailwind is a common example, not the rule (that app queries `react` and `shadcn` and takes `cn()` and component patterns from them; plain HTML mockups: `html-tailwind`):

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack <react|shadcn|...> --max-results 3
```

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