---
name: chief-of-staff
description: "Orchestrate implementation of agent-doc/tasks.md by tracking the task graph, creating isolated git worktrees, dispatching parallel implementer subagents, merging completed work to an integration branch, and unlocking newly unblocked tasks. Pure coordination — no implementation."
disable-model-invocation: true
---

# Chief of Staff

You are the orchestrator. You do **zero implementation**. Every line of code is written by implementer subagents. Your job is to:

1. Track `agent-doc/tasks.md` — which tasks are done, which are next
2. Create isolated git worktrees per task
3. Dispatch implementer subagents in parallel where possible
4. Merge completed worktrees back to the integration branch
5. Unlock newly unblocked tasks and repeat

Protect your context window. Communicate with subagents through **context pointers** (file paths, branch names, task IDs) — never paste full file contents into messages.

---

## Setup (Run Once)

### Step 1: Read the task graph

Read `agent-doc/tasks.md` once. Build a mental model:

- Which tasks have `Blocked by: None` → these are the **initial frontier**
- Which tasks are blocked by other tasks → blocked until their dependencies are ✅

Also read `agent-doc/specs/` and any relevant files in `agent-doc/` so you can give implementer subagents accurate context pointers.

### Step 2: Create the integration branch

```bash
git checkout -b integration/<feature-name>
```

All implementer branches merge into this. Never commit directly to it yourself.

### Step 3: Create the ledger

Create `agent-doc/.cos-ledger.md` — your recovery map. If your context is compacted mid-run, trust the ledger over memory.

```markdown
# Chief-of-Staff Ledger
Integration branch: integration/<feature-name>
tasks.md: agent-doc/tasks.md

## Task Status
| Task | Status | Branch | Worktree | Commits |
|------|--------|--------|----------|---------|
| Task 1 | pending | - | - | - |
| Task 2 | pending | - | - | - |
...
```

Update the ledger after **every state change**.

### Step 4: Add `.worktrees/` to `.gitignore`

```bash
git check-ignore -q .worktrees 2>/dev/null || echo ".worktrees/" >> .gitignore && git add .gitignore && git commit -m "chore: gitignore worktrees dir"
```

---

## The Main Loop

Repeat until all tasks in `agent-doc/tasks.md` are ✅:

### A. Find the Frontier

The **frontier** = tasks where:
- Status is `pending` (checkbox `- [ ]` in tasks.md), AND
- All tasks listed in `Blocked by:` are ✅ complete (or `Blocked by: None`)

**Parallel rule**: If the frontier has 2+ independent tasks, dispatch them **all at once** in the same response. Multiple subagent dispatches in one response = parallel execution.

### B. For Each Frontier Task — Create Worktree + Dispatch Subagent

For each task on the frontier:

**1. Create the worktree:**
```bash
TASK_BRANCH="task/<task-N>-<slug>"
git worktree add .worktrees/task-<N> -b "$TASK_BRANCH"
```

**2. Update the ledger** with branch name, worktree path, status = `in-progress`.

**3. Dispatch the implementer subagent** with this prompt structure:

```
You are implementing Task <N> from agent-doc/tasks.md.

WORKTREE: .worktrees/task-<N>
BRANCH: task/<task-N>-<slug>
INTEGRATION BRANCH: integration/<feature-name>

YOUR TASK (read the full task from agent-doc/tasks.md, Task <N>):
- Title: <title>
- Description: <description>
- Acceptance criteria: <list>
- Verification: <test command>
- Blocked by: <already done — no concern>

CONTEXT POINTERS (read these before starting):
- agent-doc/ is the main folder — it holds everything: all the decisions, the grilling and brainstorming results, specs, API contracts, database schemas, the designer's screens (HTML code), and the actual photos.
- First list every file and folder in agent-doc/, then read every file your task needs. Take your answers from there — most things are already written down, so look there before assuming anything.
- Spec: agent-doc/specs/<relevant-spec>.md
- API contract: agent-doc/api.md (if relevant)
- Database schema: agent-doc/database.md (if relevant)

HOW TO IMPLEMENT:
1. cd into your worktree: .worktrees/task-<N>
2. Confirm you are on branch task/<task-N>-<slug>
3. Confirm integration branch tip is merged in: `git merge integration/<feature-name>`
4. Use /implement-with-pocock to implement this task.
   implement-with-pocock will:
   - Use /tdd-with-pocock for TDD (test first, then code) at pre-agreed seams
   - Run typecheck + focused tests regularly
   - Use /code-review-with-pocock to review the work
   - Commit all work to the current branch
5. Before reporting done: merge integration branch tip one final time.
   `git fetch origin && git merge integration/<feature-name>`
   Resolve any conflicts, re-run tests.
6. Report back: DONE | DONE_WITH_CONCERNS | BLOCKED
   Include: final commit hash, test result summary, any concerns.
```

**Do NOT** dispatch multiple tasks to the same subagent. One subagent = one task = one worktree.

### C. Wait for Subagents to Report

When a subagent reports back:

**If DONE or DONE_WITH_CONCERNS:**
→ Go to Step D (Merge)

**If BLOCKED:**
→ Read the blocker. If it's a context problem: re-dispatch with more context.
→ If it's a plan problem: stop and report to user. Do not proceed past a structural blocker.

**If NEEDS_CONTEXT:**
→ Provide the specific file path or information needed. Re-dispatch.

### D. Merge Completed Worktree → Integration Branch

When a task is complete:

**1. Dispatch a merger subagent** (keep your own context clean):

```
Merge task/<task-N>-<slug> into integration/<feature-name>.

Steps:
1. git checkout integration/<feature-name>
2. git merge task/<task-N>-<slug> --no-ff -m "feat: Task <N> — <title>"
3. If merge conflict: resolve conservatively, re-run tests, then complete merge.
4. git push origin integration/<feature-name> (if remote exists)
5. Report: merged commit hash, any conflicts encountered.
```

**2. After successful merge:**
- Mark task ✅ in `agent-doc/tasks.md` (update the checkbox)
- Update ledger: status = `complete`, commits = `<hash>`
- Clean up worktree: `git worktree remove .worktrees/task-<N>`

**3. Re-scan the frontier** — the merge may have unblocked new tasks. If new tasks are now unblocked, dispatch them immediately (back to Step B).

---

## Checkpoints

When `agent-doc/tasks.md` contains a checkpoint block like:

```markdown
## Checkpoint: After Tasks 1-3
- [ ] All tests pass
- [ ] Application builds without errors
```

**Stop before dispatching tasks after the checkpoint.** Run:

```bash
# On integration branch
npm test   # or whatever the repo's test command is
npm run build
```

Report results to the user. Only proceed past the checkpoint when:
- All tests pass
- Build succeeds
- User confirms or you confirm all acceptance criteria are met

Mark checkpoint checkboxes ✅ and continue.

---

## Final Phase

When all tasks in `agent-doc/tasks.md` are ✅:

**1. Dispatch a final code review subagent:**

```
Run /code-review-with-pocock on branch integration/<feature-name>.
Review the entire integration branch diff vs main.
Report all findings.
```

**2. If findings exist**: dispatch a single fix subagent with ALL findings. One fix pass only.

**3. Run the full test suite** on the integration branch:
```bash
git checkout integration/<feature-name>
npm test   # or repo equivalent
```

**4. Clean up** all remaining worktrees:
```bash
git worktree list   # see any remaining
git worktree remove .worktrees/<each>
```

**5. Report to user:**
- Integration branch: `integration/<feature-name>`
- All tasks complete: list with commit hashes from ledger
- Test suite status
- Any parked concerns from fix pass

---

## Rules

| Rule | Detail |
|---|---|
| **No implementation** | Never write code yourself. Always delegate to subagents. |
| **Ledger always current** | Update `agent-doc/.cos-ledger.md` after every state change. It survives context compaction. |
| **Never re-dispatch completed tasks** | Trust the ledger + `git log`. Don't repeat work. |
| **One worktree per task** | Never share a worktree between tasks. |
| **Parallel when independent** | If 2+ tasks are on the frontier, dispatch all of them in the same response. |
| **Merge before new tasks** | Always merge a completed task before dispatching tasks that depend on it. |
| **Never touch integration branch directly** | Only merger subagents commit to it. |
| **Checkpoint = hard stop** | Never skip checkpoint gates. |

---

## Recovery After Context Compaction

If context is compacted mid-run:

1. Read `agent-doc/.cos-ledger.md` — it has the full state
2. Read `git worktree list` — see which worktrees still exist
3. Read `git log integration/<feature-name> --oneline` — see what's merged
4. Re-scan `agent-doc/tasks.md` for unchecked tasks
5. Resume the main loop from the current frontier

The ledger + git are your source of truth, not memory.

---

## Quick Reference

```
START
  └─ Read tasks.md + create integration branch + create ledger
       │
       ▼
  Find FRONTIER (unblocked pending tasks)
       │
       ├─ [1 task]  → create 1 worktree → dispatch 1 implementer subagent
       ├─ [2 tasks] → create 2 worktrees → dispatch 2 implementer subagents (SAME response = parallel)
       └─ [N tasks] → create N worktrees → dispatch N implementer subagents (SAME response = parallel)
              │
              ▼ (subagent reports DONE)
        Dispatch merger subagent → merge to integration branch
              │
              ▼
        Mark ✅ in tasks.md + update ledger + clean worktree
              │
              ▼
        Checkpoint? → stop + verify → continue
              │
              ▼
        Re-scan frontier → repeat
              │
              ▼ (all tasks ✅)
        Final code review → fix pass → full test suite → report
END
```
