# Proposal: [Initiative Name]

> **CRITICAL GUIDANCE FOR DOWNSTREAM AGENTS:**
> This proposal is the root index and primary entry point for this initiative. Before designing or implementing any component, you **MUST review the technical ground-truth files in `agent-doc/`**:
> - [`agent-doc/decisions.md`](./decisions.md) — Core architectural decisions, business rules, and settled constraints.
> - [`agent-doc/database.md`](./database.md) — Database schemas, table definitions, fields, and relationships.
> - [`agent-doc/api.md`](./api.md) — API contracts, endpoints, request/response payloads, and error shapes.
> - [`agent-doc/structure.md`](./structure.md) — Directory layout, file locations, and module organization.
> - [`agent-doc/testing.md`](./testing.md) — Testing strategy, test runners, commands, and expectations.
> Always consult these files whenever you need specific schema, endpoint, or architecture details.

## Why

<!-- Explain the motivation. What problem does this solve? Why now? -->

## Scope

### In Scope
<!-- Explicit capabilities and behaviors to be built. -->

### Out of Scope (Non-Goals)
<!-- Explicit exclusions to prevent scope creep. -->

## Capability Map (Modular Breakdown)

<!-- Decompose the initiative into very small, single-responsibility modules.
     RULES:
     1. One module = one single capability/responsibility.
     2. Arrows point one way (no dependency cycles).
     3. If Module A and Module B need each other, merge them into one module.
     4. Every row maps to exactly one spec file: specs/<module-id>.md -->

| Module ID | Responsibility | Depends On | Spec File |
|---|---|---|---|
| `<module-id>` | `<Single clear responsibility>` | `—` or `<prerequisite-id>` | `specs/<module-id>.md` |

### Build Order
<!-- Ordered sequence based on dependency direction: -->
`[foundation-module] ──► [dependent-module]`

## Impact & Systems Affected
<!-- Affected services, packages, dependencies, or external APIs -->
