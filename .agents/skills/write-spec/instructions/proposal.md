Create the proposal document (`agent-doc/proposal.md`) that serves as the master entry point and modular capability map.

## Core Rules

1. **Read Existing `agent-doc/` Files First:**
   Before writing `proposal.md`, inspect all existing files in `agent-doc/`:
   - `agent-doc/decisions.md` (Product & design decisions)
   - `agent-doc/database.md` (Database models & tables)
   - `agent-doc/api.md` (API contracts & schemas)
   - `agent-doc/structure.md` (Directory structure, tech stack with exact versions)
   - `agent-doc/testing.md` (Testing guidelines)
   These files represent settled technical truth. The proposal must align with them, not contradict them.

2. **Mandatory Downstream Agent Banner:**
   `proposal.md` is the first file downstream agents and human reviewers read. You MUST include the callout banner at the top directing agents to inspect the files in `agent-doc/` (`decisions.md`, `database.md`, `api.md`, `structure.md`, `testing.md`) whenever they need schemas, endpoints, or constraints.

3. **Phase 0 Capability Map (Force Small Modules):**
   Decompose the work into small, single-responsibility modules:
   - **One module = one responsibility:** Never bundle unrelated capabilities into one module. E.g., `user-auth` and `billing-checkout` must be separate modules.
   - **Stable Kebab-Case IDs:** `auth`, `lead-intake`, `csv-export`.
   - **Strict Dependency Direction:** Arrows point only one way. Cycles are forbidden. If Module A and Module B depend on each other, they are a single module.
   - **1:1 Mapping to Specs:** Every row in the Capability Map table maps to exactly one spec file: `specs/<module-id>.md`.

4. **Pure Scope & Direction (No Code, No Tasks):**
   - Keep the proposal concise (1-2 pages).
   - Define clear In Scope and Out of Scope boundaries.
   - Do NOT include code snippets.
   - Do NOT write implementation tasks here (tasks belong to the dedicated task-writing phase).
