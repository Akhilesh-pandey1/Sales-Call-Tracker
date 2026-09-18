---
name: write-tickets
description: Convert agent-doc/tasks.md into agent-doc/tickets.json for the orchestrator - the script does all conversion, validation and updates. Run after /write-spec or after any manual edit of tasks.md.
disable-model-invocation: true
---

# Tickets

Convert `agent-doc/tasks.md` into `agent-doc/tickets.json`. The script does everything mechanical - the LLM never converts, edits, or updates the JSON by hand.

**Input format** (`agent-doc/tasks.md`) - `## N. Title` is ONE task; the checkbox bullets inside it are its points (multi-line allowed). No blockedBy here - dependencies are decided at runtime:

```markdown
## 1. Setup

- [ ] 1.1 Create module structure
- [ ] 1.2 Add dependencies

## 2. Auth

- [ ] 2.1 Login endpoint
```

**Steps**

1. Verify `agent-doc/tasks.md` exists. If not, stop - run `/write-spec` first.
2. If `agent-doc/tickets.json` already exists, ask:
   > "tickets.json already exists. Rewrite it completely from tasks.md?"
   Yes → continue. No → stop.
3. Ask the user, in ONE message:
   - Coding rules file path (e.g. `agent-doc/coding-rules.md`)
   - Specs entry path (default: `agent-doc/proposal.md`)
   - Additional prompt to send to every sub-agent (optional, may be empty)
4. **Draft the blocked-by map** - Read `agent-doc/tasks.md` (and `proposal.md` / specs if needed). Give each task its blocking edges - the tasks that must complete before it can start. Work top to bottom: for each task, look at the previous tasks and ask which ones genuinely gate it. Rules:
   - **Direct blockers only.** If task 5 needs task 4, and task 4 needs task 1, write only 4 for task 5 - when 1 finishes, 4 frees; when 4 finishes, 5 frees. Transitive edges are redundant.
   - **Parallel when the contract is defined.** If the interface between two tasks is already decided in the specs/design (API shape, data passed, component contract), they are NOT blocked by each other - frontend and backend can start together once what to pass is clear.
   - **Blocked means: cannot start without the other's output.** Not "touches related files."
   - **If unsure, mark it blocked.** Delaying a task is acceptable; building on an assumption is not.
5. **Quiz the user** - present the breakdown as a numbered list. For each task show:
   - **Id** and **Title**
   - **Blocked by**: which tasks (if any) must complete first
   - **What it delivers**: one line on the end-to-end result

   Ask: "Are the edges correct - does each task only depend on tasks that genuinely gate it?" Iterate until the user approves. An approved empty map = all tasks parallel.

6. Run the script (quote paths; it lives in this skill's `scripts/` folder) - `--blocked-by` format: `task:blockedBy` pairs separated by `;` (e.g. `2:1;3:1,2`):

   ```bash
   node "<this skill's folder>/scripts/tickets.mjs" --specs "<path>" --coding-rules "<path>" --prompt "<text>" --blocked-by "<map>"
   ```

7. Show the script's output. If validation fails (unknown blockedBy id, circular block), fix the blocked-by map or `tasks.md` and re-run.

**Marking a task done** (orchestrator use - never hand-edit the JSON):

```bash
node "<this skill's folder>/scripts/tickets.mjs" --complete <task-id>
```

**Rules**

- Only the script writes `tickets.json` - full rewrite on build, `status: "pending"` for every task
- `blockedBy` must reference existing task ids; the script rejects cycles and unknown ids
- The LLM's jobs: gather the 3 answers, draft the blocked-by edges, get user approval, run the command, report the output - never convert or edit JSON by hand
