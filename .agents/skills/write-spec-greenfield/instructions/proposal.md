Create the proposal document that establishes WHY this change is needed.

Sections:
- **Why**: 1-2 sentences on the problem or opportunity. What problem does this solve? Why now?
- **What Changes**: Bullet list of changes. Be specific about new capabilities, modifications, or removals. Mark breaking changes with **BREAKING**.
- **Capabilities**: Identify which specs will be created:
  - **New Capabilities**: List capabilities (features) being introduced. Each becomes a new `specs/<feature>.md`. Use kebab-case names (e.g., `user-auth`, `task-workflow`).
- **Build Slices**: Ordered top-level slices of the product - the independent, buildable parts (e.g., server, salesperson app, customer dashboard). One line per slice: what it delivers, which capabilities it covers. The right number comes from the project, not a target. tasks.md turns each slice into task groups. Required - a multi-part product without slices produces a broken task list.
- **Impact**: Affected code, APIs, dependencies, or systems.

IMPORTANT: The Capabilities section is critical. It creates the contract between
proposal and specs phases. Each capability listed here will need a corresponding
spec file. Every change must declare at least one capability - do not invent
requirements just to fill the list, but a change with no capabilities at all
means nothing spec-worthy is being built.

Keep it concise (1-2 pages). Focus on the "why" not the "how" -
implementation details belong in design.md.

This is the foundation - specs, design, and tasks all build on this.
