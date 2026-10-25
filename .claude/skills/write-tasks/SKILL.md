---
name: write-tasks
description: Decompose specifications and requirements into ordered, atomic vertical-slice tasks in agent-doc/tasks.md using Addy Osmani sizing rules with verification gates. Pure task generation.
disable-model-invocation: true
---

# Write Tasks — Planning and Task Breakdown

## Overview

Decompose specifications in `agent-doc/specs/` and technical contracts in `agent-doc/` into small, verifiable vertical-slice tasks with explicit acceptance criteria in `agent-doc/tasks.md`. Good task breakdown is the difference between an agent that completes work reliably and one that produces a tangled mess. Every task should be small enough to implement, test, and verify in a single focused session.

## When to Use

- You have a spec or requirements in `agent-doc/` and need to break it into implementable units
- A task feels too large or vague to start
- Work needs to be parallelized across multiple agents or sessions
- You need to communicate scope clearly before coding
- The implementation order isn't obvious

**When NOT to use:** Single-file trivial changes with obvious scope, or when the spec already contains well-defined atomic tasks.

---

<HARD GATE>
1. **Planning Boundary Only:** Do not write project implementation code. Only generate `agent-doc/tasks.md`.
2. **Never Overwrite Incomplete Plans:** If `agent-doc/tasks.md` already exists with unchecked tasks (`- [ ]`), STOP and ask the user before overwriting or replanning.
3. **Vertical Slices Only:** Never create horizontal layer tasks (e.g., "Build all database tables", "Build all API routes"). Every task must deliver a narrow, working path for ONE user capability or scenario.
4. **The "And" Prohibition:** If a task title contains the word "and", it is two tasks. You MUST split it.
5. **Subsystem Slicing Trigger:** If a task touches two or more independent subsystems (e.g., auth and billing), you MUST split it.
6. **Development Work Only:** Never make a task for manual or production work — `git push`, connecting the repo to a remote, deploying to hosting (Render, Vercel, …), or setting up the production database. The user does these by hand later. Include a deployment step ONLY when the user explicitly asked for it, and then as the last task — never as a gate between development tasks.
7. **Tasks Only, No Preamble:** `agent-doc/tasks.md` starts directly with `## Task 1:`. Never write anything before the first task — no scope summary, no "remaining work" paragraph, no assumptions block about manual checks. Context the user needs goes in the chat reply, not in the file.
8. **No Heavy Machine Work:** Never make a task or verification step that sits through a long, heavy build — mobile APK / IPA, `gradle`, emulator runs, big native or Docker image builds. Quick commands stay fine (`npm run build`, tests, lint). The agent writes code and runs quick checks; the human runs the heavy build.
</HARD GATE>

---

## The Planning Process

### Step 1: Enter Plan Mode

Before writing any code, operate in read-only mode:

- Read all relevant files in `agent-doc/`:
  - `agent-doc/specs/<module-id>.md` — Behavior contracts and scenarios; the set of spec files is the module list, each spec's `Depends on:` line gives the build order
  - `agent-doc/database.md` — Database schemas & tables
  - `agent-doc/api.md` — API endpoints & contracts
- Identify existing patterns and conventions in the codebase
- Map dependencies between components
- Note risks and unknowns

**Do NOT write code during planning.** The output is a structured task list recorded in `agent-doc/tasks.md`, not implementation code.

### Step 2: Identify the Dependency Graph

Map what depends on what:

```
Database schema
    │
    ├── API models/types
    │       │
    │       ├── API endpoints
    │       │       │
    │       │       └── Frontend API client
    │       │               │
    │       │               └── UI components
    │       │
    │       └── Validation logic
    │
    └── Seed data / migrations
```

Implementation order follows the dependency graph bottom-up: build foundations first.

### Step 3: Slice Vertically

Instead of building all the database, then all the API, then all the UI — build one complete feature path at a time:

**Bad (horizontal slicing):**
```
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**Good (vertical slicing):**
```
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

Each vertical slice delivers working, testable functionality.

### Step 4: Write Tasks

Each task follows this structure in `agent-doc/tasks.md`:

```markdown
## Task [N]: [Short descriptive title]

**Description:** One or two sentences explaining what this slice accomplishes and delivers.

**Blocked by:** [Task numbers this depends on, or "None"]

**Status:** Not started

**Acceptance criteria:**
- [ ] [Specific, testable condition cited from specs/<module>.md]
- [ ] [Specific, testable condition]

**Verification:**
- [ ] Tests pass: [the repository's focused-test command, e.g., npm test path/to/focused.test.ts]
- [ ] Build succeeds: [the repository's build command, e.g., npm run build]
```

**No Manual check lines.** Verification in the file is automation only — tests and build. Never write a "Manual check" line in a task. Anything worth testing by hand goes in the chat reply when the work is done, not in `tasks.md`.

The **Status** line records agent time so the user can see how long each agent takes on a task:

- Tasks are always generated as `**Status:** Not started`.
- The implementing agent fills it from the machine's local clock (the user's desktop time — never UTC). When work begins: `**Status:** In progress — Started: 2026-10-15 14:30`
- When the task is checked off: `**Status:** Done — Started: 2026-10-15 14:30 · Total: 35 minutes`

### Step 5: Order the Tasks

Arrange tasks so that:

1. Dependencies are satisfied (build foundation first)
2. Each task leaves the system in a working state
3. High-risk tasks are early (fail fast)

---

## Task Sizing Guidelines

| Size | Scope | Example |
|------|-------|---------|
| **XS** | Single function or config change | Add a validation rule |
| **S** | One component or endpoint | Add a new API endpoint |
| **M** | One feature slice | User registration flow |
| **L** | Multi-component feature | Search with filtering and pagination |
| **XL** | **Too large — break it down further** | — |

If a task is L or larger, it should be broken into smaller tasks. An agent performs best on S and M tasks.

### When to Break a Task Down Further (Sizing Triggers)

- **Session duration:** It would take more than one focused session (roughly 2+ hours of agent work).
- **Criteria count:** You cannot describe the acceptance criteria in 3 or fewer bullet points.
- **Subsystem Slicing Trigger:** It touches two or more independent subsystems (e.g., auth and billing). Split into separate tasks.
- **The "And" Prohibition:** You find yourself writing "and" in the task title (a clear sign it is two tasks). Split it.

---

## No Manual or Deployment Work in Tasks

Tasks are development work only. Never put these in `agent-doc/tasks.md`:

- `git push`, connecting the repo to a remote, branch protection
- Deploying to hosting (Render, Vercel, AWS, …) or CI/CD setup
- Creating or migrating the production database, DNS, secrets/env setup on the host

The user does this work by hand, later — deployment comes after development, not inside it. A task that ends with "wait for the user to push/deploy before continuing" breaks the chain: subagents and the orchestrator would stall on a step only a human can do. Development tasks must flow end to end with no human in the middle.

**Exception:** if the user explicitly names the deployment work (e.g., "include pushing to Render"), write it as its own task at the very end — never as a `Blocked by:` gate between development tasks.

---

## Output File & Protection Rules

Save all tasks to **`agent-doc/tasks.md`**. Create the `agent-doc/` directory if it does not exist.

### Never Overwrite an Incomplete Plan

Before writing `agent-doc/tasks.md`, check whether it already exists and still contains unchecked tasks (`- [ ]`):

- **Same work being replanned** (the user asked to revise or extend this plan) → update the existing file in place.
- **Different work** → **STOP and ask.** The unchecked tasks may be mid-build in another session. Do not delete, overwrite, or rename the existing file on your own; present the conflict and let the user decide (finish the old plan first, explicitly discard it, or tell you where the new plan should go).

---

## Parallelization Opportunities (Parallel vs Sequential Guidance)

When multiple agents or sessions are available:

- **Safe to parallelize:** Independent feature slices, tests for already-implemented features, documentation.
- **Must be sequential:** Database migrations, shared state changes, foundational dependency chains.
- **Needs coordination:** Features that share an API contract (define the contract first, then parallelize).

---

## Common Rationalizations (Banned Shortcuts)

| Rationalization | Reality |
|---|---|
| *"I'll figure it out as I go"* | That's how you end up with a tangled mess and rework. 10 minutes of planning saves hours. |
| *"The tasks are obvious"* | Write them down anyway. Explicit tasks surface hidden dependencies and forgotten edge cases. |
| *"Planning is overhead"* | Planning is the task. Implementation without a plan is just typing. |
| *"I can hold it all in my head"* | Context windows are finite. Written plans survive session boundaries and compaction. |
| *"The old `tasks.md` is stale, I'll just replace it"* | Unchecked tasks may be mid-build in another session. Overwriting them destroys work state that exists nowhere else. Stop and ask. |
| *"This is too small, I don't need to slice it"* | Even small features must have their own vertical slice, acceptance criteria, and verification steps. |
| *"It's faster to do DB + API + UI in one big task"* | Doing all layers together causes context bloat and debugging failures. Slice vertically into separate tasks. |
| *"I'll combine these two small endpoints with 'and'"* | The "And" rule is absolute. If a title has "and", split it into two tasks. |
| *"I'll leave verification for the end of the project"* | Every individual task must have its own verification command. Untested tasks are plan failures. |
| *"Deployment is part of this feature"* | Manual and production work (push, deploy, prod DB) is the user's job, done later. Making it a task stalls the whole chain behind a human step. |
| *"The APK build proves it works"* | A multi-minute APK or `gradle` build is not agent work. Quick checks (`npm run build`, tests) verify the code; the human runs the heavy build. |

---

## Red Flags

- Starting implementation without a written task list
- Overwriting an `agent-doc/tasks.md` that still has unchecked tasks, without asking
- Tasks that say "implement the feature" without acceptance criteria
- No verification steps in the plan
- All tasks are L/XL-sized
- An intro or scope paragraph before the first task
- Dependency order isn't considered
- Tasks that wait for a human step (git push, deploy, prod DB) before the next task can start
- Deployment or production setup added as a task without the user explicitly asking for it
- A task whose core is a long heavy build (mobile APK, `gradle`, emulator, Docker image) instead of writing code

---

## Pre-Handoff Verification

Before completing task generation, confirm:

- [ ] Every task has acceptance criteria (≤ 3 bullet points)
- [ ] Every task has an explicit verification step (focused test command or build command)
- [ ] No task contains a "Manual check" line — hand-testing items go in the chat reply
- [ ] Every task has a `Status:` line generated as "Not started"
- [ ] Task dependencies (`Blocked by:`) are identified and ordered correctly
- [ ] The file starts directly with Task 1 — no intro or scope paragraph before it
- [ ] No pre-existing incomplete plan was overwritten without explicit user confirmation
- [ ] No task touches multiple independent subsystems or uses "and" in its title
- [ ] Tasks are recorded cleanly in `agent-doc/tasks.md`
- [ ] No task contains or blocks on manual/production work (git push, deploy, prod database) — deployment becomes a task only when the user explicitly asked, and then last
- [ ] No task runs or waits on a heavy build (APK/IPA, `gradle`, emulator, big image builds) — quick checks like `npm run build` are fine

---

## Output Summary

After creating `agent-doc/tasks.md`:
- Report the total number of tasks created.
- List each task with its ID, title, and `Blocked by:` dependency.
- Highlight parallelizable task groups vs sequential dependency chains.
- Final prompt: *"Tasks are written to `agent-doc/tasks.md`. Ready for subagent handoff."*
