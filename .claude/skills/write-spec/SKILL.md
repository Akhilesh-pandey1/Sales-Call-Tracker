---
name: write-spec
description: Turn the grilling conversation and agent-doc/ technical files into complete specifications — proposal.md (with Capability Map and references to all agent-doc files) and specs/<module-id>.md (modular behavior contracts with SHALL requirements and WHEN/THEN scenarios). Only proposal and specs are generated. Pure specification.
disable-model-invocation: true
---

# Write Spec — The Specification Engine

Synthesize the grilling conversation and technical decision files into clean, modular specification documents in `agent-doc/`.

<HARD GATE>
1. **Planning & Spec boundary only:** Do NOT write project implementation code. Do NOT generate tasks or execution tickets here (tickets belong in a dedicated downstream skill).
2. **No re-interviewing:** Grilling already settled the scope and requirements. Synthesize the existing session history and the files in `agent-doc/`. Do not ask the user what to build.
3. **Behavior contracts only:** Specs define WHAT the system does (normative requirements + testable scenarios). Never dump code implementations into specs.
4. **Only two artifact types:** This skill writes ONLY `agent-doc/proposal.md` and `agent-doc/specs/<module-id>.md`. Technical designs already exist in `agent-doc/database.md`, `agent-doc/api.md`, etc.
</HARD GATE>

---

## Artifacts Produced in `agent-doc/`

1. **`proposal.md`** — The master index. Contains the "Why", Scope, **Capability Map** (modular decomposition into small, single-responsibility modules), and the **Downstream Agent Banner** explicitly directing agents to inspect `agent-doc/` technical files (`database.md`, `api.md`, `decisions.md`, `structure.md`, `testing.md`).
2. **`specs/<module-id>.md`** — One behavior contract file per module in the Capability Map (`### Requirement:` SHALL + `#### Scenario:` WHEN/THEN).

---

## Execution Steps

### 1. Read Existing `agent-doc/` Ground Truth
Before writing, read all existing files in `agent-doc/` from disk:
- `agent-doc/decisions.md` (Product rules, edge case agreements)
- `agent-doc/database.md` (Schemas, tables, columns, relations)
- `agent-doc/api.md` (Endpoints, request/response structures)
- `agent-doc/structure.md` (Directory and module layouts)
- `agent-doc/testing.md` (Test strategies and runners)

If `agent-doc/` does not exist, create it.

### 2. Phase 0: Decompose via Capability Map
Derive the modules from the conversation and technical agreements:
- **Rule 1 (Single Responsibility):** Every module covers exactly ONE capability. Keep modules very small and focused (e.g. `auth`, `lead-intake`, `export-csv`).
- **Rule 2 (Strict Direction):** Dependencies flow one way (`A ──► B`). No circular dependencies. If two modules depend on each other, merge them into one module.
- **Rule 3 (1:1 Mapping):** Each row in the Capability Map table gets exactly one flat spec file: `agent-doc/specs/<module-id>.md`.

### 3. Generate Artifacts in Dependency Order

Follow templates in `templates/` and instructions in `instructions/`:

1. **Write `agent-doc/proposal.md`:**
   - Template: `templates/proposal.md` | Guidance: `instructions/proposal.md`
   - Must include the mandatory downstream agent banner referencing all `agent-doc/` technical files (`decisions.md`, `database.md`, `api.md`, `structure.md`, `testing.md`).
   - Must include the Capability Map and recommended build order.

2. **Write each `agent-doc/specs/<module-id>.md`:**
   - Template: `templates/spec.md` | Guidance: `instructions/spec.md`
   - One file per module in the Capability Map.
   - Normative requirements (`The system SHALL...`).
   - Scenarios with exact `#### Scenario: <Name>` formatting (GIVEN/WHEN/THEN).
   - Zero implementation code.

---

## Output Summary

After creating the files, output:
- List of created files in `agent-doc/` (`proposal.md` and `specs/*.md`)
- The Capability Map modules and their spec paths
- Final prompt: *"Specifications are complete and ready in `agent-doc/`. Next step: Run the task/ticket decomposition skill to generate execution tickets."*
