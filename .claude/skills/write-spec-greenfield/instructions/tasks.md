Create the task list that breaks down the implementation work.

Before writing tasks, check design.md for Open Questions. If any of them
would change what gets built, resolve them with the user first - do not
bake an unstated assumption into the task list.

**IMPORTANT: Follow the template below exactly.** The orchestrator parses
checkbox format to track progress. Tasks not using `- [ ]` won't be tracked.

## One group per build slice

proposal.md's Build Slices define the groups. One slice = one `## N.` group,
in the proposal's slice order. A big slice may span several groups - every
group still belongs to exactly one slice.

## How to break a slice into tasks

Break each slice into vertical slices (tracer bullets):

- Each task cuts a narrow but COMPLETE path through every layer it touches
  (schema, API, UI, tests) - never a horizontal layer slice like "build all
  the models", then "build all the APIs".
- A completed task is demoable or verifiable on its own.
- Size each task to fit one fresh context window of work.

Right-sizing rule: a task is the smallest unit that carries its own test or
verify cycle. Split only where a reviewer could reject one task while
approving its neighbor.

Never target a task count - no fixed number, no minimum, no maximum. Understand
the project first, then break it according to what it needs. The size test
decides, not the count: a task that cannot be demoed or verified on its own is
too big - split it; a task that already can is done - stop there.

## Task quality

- Order tasks by dependency inside the group (what must be done first?).
- Each task cites its feature spec file and the scenarios it implements.
- No placeholders: "add error handling", "implement the rest" are plan
  failures - name what gets built.
- Reference specs for what needs to be built, design for how to build it.
- Each task is verifiable - you know when it's done.

Example:

```
## 1. Server - Auth & Leads

- [ ] 1.1 Lead schema + create-lead API + tests (specs/lead-management.md - scenarios 1, 2)
- [ ] 1.2 List and search leads API + tests (specs/lead-management.md - scenarios 3, 4)

## 2. Salesperson App - Auth & Lead List

- [ ] 2.1 Login screen wired to auth API + happy-path test (specs/salesperson-auth.md - scenario 1)
- [ ] 2.2 Lead list screen wired to leads API (specs/lead-management.md - scenario 5)
```
