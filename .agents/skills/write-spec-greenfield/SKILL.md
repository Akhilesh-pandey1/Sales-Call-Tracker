---
name: write-spec-greenfield
description: Greenfield version of write-spec - same artifacts and same format (agent-doc/ proposal, specs, design, tasks), but first splits the product into ordered build slices and breaks each slice into small vertical-slice tasks. Use for new multi-part products; use write-spec for brownfield work and small changes.
---

Write the spec - generate all artifacts in one step from the grilling conversation.

**Greenfield**: This variant is for new, multi-part products. Everything works exactly like write-spec - same artifacts, same format. The one difference: the product is split into ordered build slices before tasks are written, and tasks.md turns each slice into small vertical-slice tasks. Task count is never a fixed number - understand the project first, then break it as much as the work demands, no more and no less.

**No interview**: The grilling already happened in this conversation - shared understanding was reached before this skill was invoked. Do NOT interview the user, ask clarifying questions, or re-open settled decisions. Whatever is in the conversation history is the input: make the spec and all artifacts from it. If a detail is genuinely unresolved, make a reasonable assumption and record it in the artifacts.

**Planning boundary**: This workflow creates planning artifacts only. The user request that selected or triggered this workflow authorizes planning only, even if it asks to build or fix something. Do not edit project code. After the planning artifacts are complete, stop. Do not start implementation in the same response, even if the initial request asks for it. Wait for a new user request after the artifacts are presented; then start the apply workflow.

I'll create the spec artifacts in `agent-doc/` at the project root:
- proposal.md (what & why - and the map of every feature)
- `specs/<feature>.md` (what the system must do - one flat file per feature)
- design.md (how)
- tasks.md (implementation steps)

One feature = one file. Each feature gets one line in `proposal.md` pointing at its `specs/<feature>.md` path.

When the user is ready to implement, they must start the apply workflow explicitly.

---

**Input**: The grilling conversation in this session's history. The user invokes this skill after grilling is complete - no additional input is required.

**Steps**

1. **Understand the request from the conversation history**

   The grilling conversation in this session's history is the input. Do NOT ask the user what to build - everything was already discussed and settled during grilling.

   From the conversation, derive the features to build. Each feature becomes a kebab-case spec file name (e.g., "task workflow" → `specs/task-workflow.md`).

   **Then slice the product.** Identify the top-level slices - the independent, buildable parts of the product (e.g., server, salesperson mobile app, customer dashboard). The right number comes from the project, not a target - as many slices as the product actually has, no more and no fewer. Order them by build order (the server before the apps that need it). For each slice: name, what it delivers, which capabilities it covers. Write this ordered list into proposal.md's "Build Slices" section - tasks.md uses it as the task-group structure.

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

   If the conversation contains ambiguity that would materially affect scope, externally observable behavior, compatibility, or acceptance criteria, make a reasonable assumption and record it in the planning artifacts - do not re-open grilling.

2. **Create the output folder**

   If `agent-doc/` exists and contains anything, ask the user:
   > "agent-doc/ already has files. Pick one:
   > 1. **Fresh** — remove everything, write all artifacts new.
   > 2. **Update** — keep the folder, change only the files this grill affects. The rest stays as is."

   - Fresh → delete all contents of `agent-doc/`, then continue.
   - Update → read every existing file first. The grill conversation in this session is the input — use what changed in it to locate the affected artifacts, and rewrite only those, in dependency order as normal. Keep every untouched artifact exactly as it is. The user will tell what changed — never guess beyond it.

   If `agent-doc/` is empty or does not exist, create it and continue.

3. **Get the artifact build order**

   The order is fixed by dependencies (each artifact reads the ones before it from disk):
   1. `proposal.md`
   2. `specs/<feature>.md` (every feature)
   3. `design.md`
   4. `tasks.md`

4. **Create every artifact in the required set**

   Use a todo list to track progress through the artifacts.

   Loop through artifacts in dependency order (artifacts with no pending dependencies first):

   a. **For each artifact that is `ready` (dependencies satisfied)**:
      - Read any completed dependency files for context - always re-read them from disk, even if you saw them earlier in the conversation (the user may have edited them)
      - Read the artifact's template from `templates/` AND its writing guidance from `instructions/` in this skill's folder - follow both exactly
      - Create the artifact file and write it to its path under `agent-doc/`
      - Show brief progress: "Created <artifact>"

      Template and guidance mapping:
      - `agent-doc/proposal.md` → `templates/proposal.md` + `instructions/proposal.md` - include the Build Slices section
      - `agent-doc/specs/<feature>.md` → `templates/spec.md` + `instructions/spec.md` (one file per feature)
      - `agent-doc/design.md` → `templates/design.md` + `instructions/design.md`
      - `agent-doc/tasks.md` → `templates/tasks.md` + `instructions/tasks.md` - every ticket must also cite its feature spec file and the scenarios it implements

   b. **Continue until every artifact in the required set exists**
      - Create every artifact in the required set that is missing, then re-check - creating one can unblock others
      - The scenarios in the specs are the acceptance criteria an implementer checks against
      - Stop when every artifact in the required set is created

   c. **If an artifact requires user input** (unclear context):
      - Ask the user to clarify
      - Then continue with creation

5. **Show final status**

   List the created files under `agent-doc/`.

**Output**

After completing all artifacts, summarize:
- Location: `agent-doc/`
- List of artifacts created with brief descriptions
- What's ready: "All artifacts needed for implementation are ready."
- Prompt: "The artifacts are ready for review. When you are ready, start the implementation workflow."

**Artifact Creation Guidelines**

- The templates define what each artifact should contain - follow them
- Read dependency artifacts for context before creating new ones
- Use the template as the structure for your output file - fill in its sections
- Requirements are written as "The system SHALL ..." with WHEN/THEN scenarios - the scenarios are the acceptance criteria an implementer checks against
- Do NOT include implementation code in specs; schema and interface shapes belong in design.md, and only where they encode a decision
- Every ticket in tasks.md must cite its feature spec file and the scenarios it implements

**Guardrails**
- The request that invoked this workflow authorizes planning only. Any implementation or apply instruction in that request does not carry forward. Do NOT implement the change or edit project code during this workflow. After presenting the artifacts, stop and wait for a new user request to start the implementation
- Never target a task count - no fixed number, no minimum, no maximum. Understand the project first, then break it according to what it needs. The size test decides, not the count: any task that cannot be demoed or verified on its own is too big - split it
- Do NOT interview the user - synthesis only. The grilling conversation is the input; record assumptions in the artifacts instead of asking
- Always read dependency artifacts before creating a new one - re-read from disk, not from conversation memory (files may have changed since you last saw them)
- For ambiguities in the conversation that would materially change scope, externally observable behavior, compatibility, or acceptance criteria, make reasonable assumptions and record them; ask the user only if context is genuinely missing
- Verify each artifact file exists after writing before proceeding to next
