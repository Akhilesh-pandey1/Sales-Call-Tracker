# Graph Report - sales-call-tracker  (2026-10-15)

## Corpus Check
- 156 files · ~394,219 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1607 nodes · 1863 edges · 160 communities (144 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `020b624e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- .claude/skills/grill-with-superpower/scripts/server.cjs
- .claude/settings.json
- What You Must Do When Invoked
- Requirements
- allow
- Dimensions
- grill-for-business/SKILL.md
- Visual Companion Guide
- Before Grill — the problem gate
- tickets.mjs
- Test-Driven Development
- Python / Flask Code Style & Standards
- graphify reference: extra exports and benchmark
- helper.js
- CLAUDE.md
- Code Style & Standards
- React + TypeScript Code Style & Standards
- Process
- Brainstorming Ideas Into Designs
- grill-with-openspec/SKILL.md
- stop-server.sh
- templates/proposal.md
- Node.js + TypeScript Code Style & Standards
- graphify reference: query, path, explain
- templates/design.md
- templates/spec.md
- Commit Story
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- Grill — style router
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- start-server.sh
- templates/tasks.md
- decisions.md
- extraction-spec.md
- write-tickets/SKILL.md
- core.py
- .agents/skills/design-screens/uiux/scripts/core.py
- .agents/skills/grill-with-superpower/scripts/server.cjs
- Humanizer: remove AI writing patterns
- Humanizer: remove AI writing patterns
- our_agent.py
- What You Must Do When Invoked
- Dimensions
- .claude/skills/design-screens/uiux/scripts/design_system.py
- allow
- DesignSystemGenerator
- ._apply_reasoning
- _select_palette_for_mode
- .generate
- persist_design_system
- .agents/skills/grill-for-business/SKILL.md
- Design Screens
- Write Screens
- Manager View (web)
- _resolve_color_mode
- Requirements
- 4. User Account Management (Manager Only)
- Visual Companion Guide
- deny
- deny
- Before Grill — the problem gate
- .agents/skills/write-tickets/scripts/tickets.mjs
- Python / Flask Code Style & Standards
- .agents/skills/design-screens/uiux/scripts/design_system.py
- Steps
- Test-Driven Development
- Steps
- DesignSystemGenerator
- ._apply_reasoning
- Database Schema & Design
- React + TypeScript Code Style & Standards
- _select_palette_for_mode
- .generate
- 1. Backend Automated Tests (`backend/tests/`)
- Requirements
- Node.js + TypeScript Code Style & Standards
- .agents/settings.json
- persist_design_system
- graphify reference: extra exports and benchmark
- .agents/skills/grill-with-superpower/scripts/helper.js
- Code Style & Standards
- Process
- Design Screens
- Brainstorming Ideas Into Designs
- Write Screens
- Stacks — Library Catalog
- .agents/skills/grill-with-openspec/SKILL.md
- .agents/skills/grill-with-superpower/scripts/stop-server.sh
- .agents/skills/write-spec-greenfield/templates/proposal.md
- .agents/skills/write-spec/templates/proposal.md
- Stacks — Library Catalog
- .claude/skills/write-spec-greenfield/templates/proposal.md
- Project File Structure
- _generate_intelligent_overrides
- _resolve_color_mode
- graphify reference: query, path, explain
- Design System — Apex Sales Call
- .agents/skills/write-spec-greenfield/templates/design.md
- .agents/skills/write-spec-greenfield/templates/spec.md
- .agents/skills/write-spec/templates/design.md
- .agents/skills/write-spec/templates/spec.md
- .claude/skills/write-spec-greenfield/templates/design.md
- .claude/skills/write-spec-greenfield/templates/spec.md
- Commit Story
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- Grill — style router
- .agents/skills/write-spec-greenfield/instructions/tasks.md
- .claude/skills/write-spec-greenfield/instructions/tasks.md
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- .agents/skills/grill-with-superpower/scripts/start-server.sh
- .agents/skills/write-spec-greenfield/templates/tasks.md
- .agents/skills/write-spec/templates/tasks.md
- execute.md
- .claude/skills/write-spec-greenfield/templates/tasks.md
- .agents/skills/graphify/references/extraction-spec.md
- .agents/skills/write-tickets/SKILL.md
- Tasks: Sales Call Tracker v1
- Decisions
- Requirements
- Requirements
- agent-doc/proposal.md
- Requirement: Name-and-password login
- _generate_intelligent_overrides
- Requirement: Batch sync to server
- Requirement: Call-log matching — Path 1 (real-time)
- Requirement: Login brute-force lockout
- Requirement: Call-log matching — Path 2 (janitor)
- Requirement: Clear local data recovery
- Requirement: Phone number normalization
- Requirement: Server-side call ingestion

## God Nodes (most connected - your core abstractions)
1. `allow` - 24 edges
2. `allow` - 24 edges
3. `search()` - 23 edges
4. `search()` - 23 edges
5. `Tasks: Sales Call Tracker v1` - 20 edges
6. `deny` - 19 edges
7. `deny` - 19 edges
8. `DesignSystemGenerator` - 15 edges
9. `DesignSystemGenerator` - 15 edges
10. `handleRequest()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `_generate_intelligent_overrides()` --calls--> `search()`  [EXTRACTED]
  .agents/skills/design-screens/uiux/scripts/design_system.py → .agents/skills/design-screens/uiux/scripts/core.py
- `get_agent_runner()` --indirect_call--> `execute_agy_process()`  [INFERRED]
  .autonomous-coding-agent/our_agent.py → .autonomous-coding-agent/runner.py
- `get_agent_runner()` --indirect_call--> `execute_claude_process()`  [INFERRED]
  .autonomous-coding-agent/our_agent.py → .autonomous-coding-agent/runner.py
- `_generate_intelligent_overrides()` --calls--> `search()`  [EXTRACTED]
  .claude/skills/design-screens/uiux/scripts/design_system.py → .claude/skills/design-screens/uiux/scripts/core.py
- `run_orchestrator_loop()` --calls--> `load_configuration()`  [EXTRACTED]
  .autonomous-coding-agent/our_agent.py → .autonomous-coding-agent/config.py

## Import Cycles
- None detected.

## Communities (160 total, 16 thin omitted)

### Community 0 - ".claude/skills/grill-with-superpower/scripts/server.cjs"
Cohesion: 0.06
Nodes (55): bootstrapPage(), brandMarkup(), broadcast(), browserLauncherForPlatform(), chmodOwnerOnly(), RFC-6455, clients, companionUrl() (+47 more)

### Community 1 - ".claude/settings.json"
Cohesion: 0.22
Nodes (8): autoMemoryEnabled, disableArtifact, disableBundledSkills, disableClaudeAiConnectors, disableRemoteControl, disableWorkflows, permissions, $schema

### Community 2 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 3 - "Requirements"
Cohesion: 0.06
Nodes (32): Purpose, Requirement: CSV upload into lead pool, Requirement: Lead claim window, Requirement: Lead pool manager summary, Requirement: Lead resolution via call sync, Requirement: Lead scheduling, Requirement: Lead state is authoritative and server-stored, Requirement: Next-lead serving — priority order (+24 more)

### Community 4 - "allow"
Cohesion: 0.08
Nodes (24): Agent, Bash(git add:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(git status:*), Bash(graphify:*) (+16 more)

### Community 5 - "Dimensions"
Cohesion: 0.08
Nodes (24): 10. Tech stack — one library per piece, 1. File structure & changes, 1. Gather facts — never ask the user for what you can find, 2. API contracts, 2. Say if this is greenfield or brownfield, 3. Classify the blast radius, 3. Database changes, 4. Build the coverage checklist (+16 more)

### Community 6 - "grill-for-business/SKILL.md"
Cohesion: 0.08
Nodes (23): Anti-Sycophancy Rules, Done — End of Grilling, Important Rules, Operating Principles, Operating Principles, Phase 1: Context Gathering, Phase 2.75: Landscape Awareness, Phase 2A: Startup Mode — YC Product Diagnostic (+15 more)

### Community 7 - "Visual Companion Guide"
Cohesion: 0.10
Nodes (19): Browser Events Format, Cards (visual designs), Cleaning Up, CSS Classes Available, Design Tips, File Naming, How It Works, Mock elements (wireframe building blocks) (+11 more)

### Community 8 - "Before Grill — the problem gate"
Cohesion: 0.11
Nodes (17): 1. Who has what problem?, 2. What should become easier after this exists?, 3. Who is the user who actually uses it?, 4. What is the outcome?, 5. Define the boundaries, 6. Identify the unknowns, 7. Design the simplest architecture, Before Grill — the problem gate (+9 more)

### Community 9 - "tickets.mjs"
Cohesion: 0.14
Nodes (11): args, blockedArg, byId, flushPoint(), flushTask(), ids, ok, out (+3 more)

### Community 10 - "Test-Driven Development"
Cohesion: 0.15
Nodes (10): Designing for Mockability, When to Mock, Anti-patterns, Rules of the loop, Seams — where tests go, Test-Driven Development, What a good test is, Bad Tests (+2 more)

### Community 11 - "Python / Flask Code Style & Standards"
Cohesion: 0.15
Nodes (12): Architecture — Modular Monolith, Code Quality, Error & Exception Handling, File Structure, Folder Structure, Imports, Libraries & Dependencies, Module Rules (+4 more)

### Community 12 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 13 - "helper.js"
Cohesion: 0.42
Nodes (7): connect(), nextReconnectDelay(), reloadAfterRecovery(), sessionKey(), setStatus(), showTombstone(), websocketUrl()

### Community 14 - "CLAUDE.md"
Cohesion: 0.22
Nodes (8): Env Files, Language, Private Folder, Rules, Search, Tasks, Timelines, Working Directory

### Community 15 - "Code Style & Standards"
Cohesion: 0.25
Nodes (7): Bug Fixes & Refactoring, Code Quality, Code Style & Standards, Function Length & Structure, Naming & Constants, Parameters, Returns & Data Flow, Starting a New Feature

### Community 16 - "React + TypeScript Code Style & Standards"
Cohesion: 0.20
Nodes (9): File & Component Structure, Folder Rules, Folder Structure, Language, Naming Conventions, React + TypeScript Code Style & Standards, Responsive Design, State & Logic Separation (+1 more)

### Community 17 - "Process"
Cohesion: 0.25
Nodes (7): 1. Pin the fixed point, 2. Identify the spec source, 3. Identify the standards sources, 4. Spawn both sub-agents in parallel, 5. Aggregate, Process, Why two axes

### Community 18 - "Brainstorming Ideas Into Designs"
Cohesion: 0.25
Nodes (7): Anti-Pattern: "This Is Too Simple To Need A Design", Brainstorming Ideas Into Designs, Checklist, Ending the Session, Process Flow, The Process, Visual Companion

### Community 19 - "grill-with-openspec/SKILL.md"
Cohesion: 0.29
Nodes (6): Ending Discovery, Guardrails, Handling Different Entry Points, The Stance, What You Don't Have To Do, What You Might Do

### Community 20 - "stop-server.sh"
Cohesion: 0.43
Nodes (4): command_has_server_id(), is_brainstorm_server(), mark_stopped(), stop-server.sh script

### Community 21 - "templates/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 22 - "Node.js + TypeScript Code Style & Standards"
Cohesion: 0.22
Nodes (8): Architecture — Modular Monolith, Error & Exception Handling, Folder Structure, Function Composition & Layout, Language & File Structure, Libraries & Dependencies, Module Rules, Node.js + TypeScript Code Style & Standards

### Community 23 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 24 - "templates/design.md"
Cohesion: 0.40
Nodes (4): Context, Decisions, Goals / Non-Goals, Risks / Trade-offs

### Community 25 - "templates/spec.md"
Cohesion: 0.40
Nodes (4): ADDED Requirements, Purpose, Requirement: <!-- requirement name -->, Scenario: <!-- scenario name -->

### Community 26 - "Commit Story"
Cohesion: 0.50
Nodes (3): Commit Story, Git rules, Steps

### Community 27 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 28 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 29 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 30 - "Grill — style router"
Cohesion: 0.50
Nodes (3): Grill — style router, Step 1 — Ask which style, Step 2 — Load and run the chosen skill

### Community 45 - "core.py"
Cohesion: 0.06
Nodes (60): BM25, _contains_phrase(), detect_domain(), _domain_keywords(), _exact_match_diagnostic(), _exact_row_identity(), _exact_stack_identifier(), _file_signature() (+52 more)

### Community 46 - ".agents/skills/design-screens/uiux/scripts/core.py"
Cohesion: 0.06
Nodes (60): BM25, _contains_phrase(), detect_domain(), _domain_keywords(), _exact_match_diagnostic(), _exact_row_identity(), _exact_stack_identifier(), _file_signature() (+52 more)

### Community 47 - ".agents/skills/grill-with-superpower/scripts/server.cjs"
Cohesion: 0.06
Nodes (55): bootstrapPage(), brandMarkup(), broadcast(), browserLauncherForPlatform(), chmodOwnerOnly(), RFC-6455, clients, companionUrl() (+47 more)

### Community 48 - "Humanizer: remove AI writing patterns"
Cohesion: 0.05
Nodes (39): 10. Hyphenated pairs everywhere, 11. Passive voice and missing subjects, 12. Overused AI words, 13. Inflated significance, 14. Vague connection or association, 15. Shallow -ing riders, 16. Sales language, 17. Borrowed authority (+31 more)

### Community 49 - "Humanizer: remove AI writing patterns"
Cohesion: 0.05
Nodes (39): 10. Hyphenated pairs everywhere, 11. Passive voice and missing subjects, 12. Overused AI words, 13. Inflated significance, 14. Vague connection or association, 15. Shallow -ing riders, 16. Sales language, 17. Borrowed authority (+31 more)

### Community 50 - "our_agent.py"
Cohesion: 0.15
Nodes (28): create_argument_parser(), get_default_settings(), load_configuration(), build_execution_prompt(), execute_task_run(), extract_promise_verdict(), get_agent_runner(), get_next_uncompleted_task() (+20 more)

### Community 51 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 52 - "Dimensions"
Cohesion: 0.08
Nodes (24): 10. Tech stack — one library per piece, 1. File structure & changes, 1. Gather facts — never ask the user for what you can find, 2. API contracts, 2. Say if this is greenfield or brownfield, 3. Classify the blast radius, 3. Database changes, 4. Build the coverage checklist (+16 more)

### Community 53 - ".claude/skills/design-screens/uiux/scripts/design_system.py"
Cohesion: 0.22
Nodes (12): ansi_ljust(), format_ascii_box(), format_markdown(), generate_design_system(), hex_to_ansi(), Convert hex color to ANSI True Color swatch (██) with fallback., Like str.ljust but accounts for zero-width ANSI escape sequences., Create a Unicode section separator: ├─── NAME ───...┤ (+4 more)

### Community 54 - "allow"
Cohesion: 0.08
Nodes (24): Agent, Bash(git add:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(git status:*), Bash(graphify:*) (+16 more)

### Community 55 - "DesignSystemGenerator"
Cohesion: 0.27
Nodes (4): DesignSystemGenerator, Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Select best matching result based on priority keywords.

### Community 56 - "._apply_reasoning"
Cohesion: 0.24
Nodes (8): Find matching reasoning rule for a category., Apply reasoning rules to search results., apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), Return deterministic mutations and an audit trail; never execute data., Parse the canonical condition -> action-array representation., _validate_action()

### Community 57 - "_select_palette_for_mode"
Cohesion: 0.22
Nodes (10): _contrast_ratio(), _derive_dark_palette(), _palette_is_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable., True when a colors.csv row's Background is a dark surface., WCAG contrast ratio for two hex colors, or None if either is invalid., Keep product brand tokens while deriving accessible dark surfaces., Pick the highest-ranked palette matching the resolved mode. Only the dark case… (+2 more)

### Community 58 - ".generate"
Cohesion: 0.20
Nodes (7): _filter_anti_patterns_for_mode(), Drop "avoid dark mode" advice once dark mode is the resolved answer., Execute searches across multiple domains., Extract results list from search result dict., Generate complete design system recommendation. variance/motion/density are…, Bucket a 1-10 dial value into its tier config. Returns None if value is None., _resolve_dial()

### Community 59 - "persist_design_system"
Cohesion: 0.25
Nodes (9): format_master_md(), persist_design_system(), Path, Format design system as MASTER.md with hierarchical override logic., Slugify a name into a single safe path segment. Only [a-z0-9_-] survives; every…, Write fully to a temp file, then publish atomically., Persist design system to design-system/<project>/ folder using Master +…, safe_slug() (+1 more)

### Community 60 - ".agents/skills/grill-for-business/SKILL.md"
Cohesion: 0.08
Nodes (23): Anti-Sycophancy Rules, Done — End of Grilling, Important Rules, Operating Principles, Operating Principles, Phase 1: Context Gathering, Phase 2.75: Landscape Awareness, Phase 2A: Startup Mode — YC Product Diagnostic (+15 more)

### Community 61 - "Design Screens"
Cohesion: 0.25
Nodes (7): Checklist before reporting done, Design Screens, Guardrails, Screen file rules, Steps, The design brain, Thinking rules (apply while designing)

### Community 62 - "Write Screens"
Cohesion: 0.25
Nodes (7): Guardrails, Input, Steps, Template, The balance (most important rule), Write Screens, Writing rules

### Community 63 - "Manager View (web)"
Cohesion: 0.15
Nodes (12): Manager View (web), Salesperson View (Android app "Apex Sales Call"), Screen 1: Login, Screen 2: Team Dashboard - home after login, Screen 3: Person View, Screen 4: Leads, Screen 5: Accounts, Screen 6: Login (+4 more)

### Community 64 - "_resolve_color_mode"
Cohesion: 0.33
Nodes (6): _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., _resolve_color_mode(), _style_is_dark_primary()

### Community 65 - "Requirements"
Cohesion: 0.08
Nodes (25): Purpose, Requirement: Manager-only team dashboard access, Requirement: Per-person stats (today / yesterday / last 30 days), Requirement: Server-side time calculations, Requirement: Team dashboard — per-person active salesperson list, Requirement: Team dashboard — today and yesterday totals, Requirement: Top 5 numbers by talk time, Requirements (+17 more)

### Community 66 - "4. User Account Management (Manager Only)"
Cohesion: 0.10
Nodes (19): 1. Authentication, 2. Call Sync, 3. Dashboards, 4. User Account Management (Manager Only), 5. Leads, API Specifications, `DELETE /api/users/<id>`, `GET /api/dashboard/person/<id>` (+11 more)

### Community 67 - "Visual Companion Guide"
Cohesion: 0.10
Nodes (19): Browser Events Format, Cards (visual designs), Cleaning Up, CSS Classes Available, Design Tips, File Naming, How It Works, Mock elements (wireframe building blocks) (+11 more)

### Community 68 - "deny"
Cohesion: 0.11
Nodes (19): Bash(git push:*), CronCreate, CronDelete, CronList, EnterPlanMode, EnterWorktree, ExitPlanMode, ExitWorktree (+11 more)

### Community 69 - "deny"
Cohesion: 0.11
Nodes (19): Bash(git push:*), CronCreate, CronDelete, CronList, EnterPlanMode, EnterWorktree, ExitPlanMode, ExitWorktree (+11 more)

### Community 70 - "Before Grill — the problem gate"
Cohesion: 0.11
Nodes (17): 1. Who has what problem?, 2. What should become easier after this exists?, 3. Who is the user who actually uses it?, 4. What is the outcome?, 5. Define the boundaries, 6. Identify the unknowns, 7. Design the simplest architecture, Before Grill — the problem gate (+9 more)

### Community 71 - ".agents/skills/write-tickets/scripts/tickets.mjs"
Cohesion: 0.14
Nodes (11): args, blockedArg, byId, flushPoint(), flushTask(), ids, ok, out (+3 more)

### Community 72 - "Python / Flask Code Style & Standards"
Cohesion: 0.15
Nodes (12): Architecture — Modular Monolith, Code Quality, Error & Exception Handling, File Structure, Folder Structure, Imports, Libraries & Dependencies, Module Rules (+4 more)

### Community 73 - ".agents/skills/design-screens/uiux/scripts/design_system.py"
Cohesion: 0.22
Nodes (12): ansi_ljust(), format_ascii_box(), format_markdown(), generate_design_system(), hex_to_ansi(), Convert hex color to ANSI True Color swatch (██) with fallback., Like str.ljust but accounts for zero-width ANSI escape sequences., Create a Unicode section separator: ├─── NAME ───...┤ (+4 more)

### Community 74 - "Steps"
Cohesion: 0.15
Nodes (12): 1. Gather — never re-ask what is already settled, 2. Sort — each fact goes to exactly one file, 3. Write — by the rules below, Current truth, not history, Independent entries, Log Decisions — the recorder, One fact, one place, Precondition (+4 more)

### Community 75 - "Test-Driven Development"
Cohesion: 0.15
Nodes (10): Designing for Mockability, When to Mock, Anti-patterns, Rules of the loop, Seams — where tests go, Test-Driven Development, What a good test is, Bad Tests (+2 more)

### Community 76 - "Steps"
Cohesion: 0.15
Nodes (12): 1. Gather — never re-ask what is already settled, 2. Sort — each fact goes to exactly one file, 3. Write — by the rules below, Current truth, not history, Independent entries, Log Decisions — the recorder, One fact, one place, Precondition (+4 more)

### Community 77 - "DesignSystemGenerator"
Cohesion: 0.27
Nodes (4): DesignSystemGenerator, Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Select best matching result based on priority keywords.

### Community 78 - "._apply_reasoning"
Cohesion: 0.24
Nodes (8): Find matching reasoning rule for a category., Apply reasoning rules to search results., apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), Return deterministic mutations and an audit trail; never execute data., Parse the canonical condition -> action-array representation., _validate_action()

### Community 79 - "Database Schema & Design"
Cohesion: 0.20
Nodes (9): 1. PostgreSQL Tables, 2. Android Local Phone Database (SQLite), 3. Migrations & Rollback, `calls`, Database Schema & Design, `leads`, Overview, `pending_calls` (+1 more)

### Community 80 - "React + TypeScript Code Style & Standards"
Cohesion: 0.20
Nodes (9): File & Component Structure, Folder Rules, Folder Structure, Language, Naming Conventions, React + TypeScript Code Style & Standards, Responsive Design, State & Logic Separation (+1 more)

### Community 81 - "_select_palette_for_mode"
Cohesion: 0.22
Nodes (10): _contrast_ratio(), _derive_dark_palette(), _palette_is_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable., True when a colors.csv row's Background is a dark surface., WCAG contrast ratio for two hex colors, or None if either is invalid., Keep product brand tokens while deriving accessible dark surfaces., Pick the highest-ranked palette matching the resolved mode. Only the dark case… (+2 more)

### Community 82 - ".generate"
Cohesion: 0.20
Nodes (7): _filter_anti_patterns_for_mode(), Drop "avoid dark mode" advice once dark mode is the resolved answer., Execute searches across multiple domains., Extract results list from search result dict., Generate complete design system recommendation. variance/motion/density are…, Bucket a 1-10 dial value into its tier config. Returns None if value is None., _resolve_dial()

### Community 83 - "1. Backend Automated Tests (`backend/tests/`)"
Cohesion: 0.22
Nodes (8): 1. Backend Automated Tests (`backend/tests/`), 2. Mobile Android Spike Checklist, Testing Specifications, `tests/modules/test_auth.py`, `tests/modules/test_calls.py`, `tests/modules/test_dashboard.py`, `tests/modules/test_leads.py`, `tests/modules/test_users.py`

### Community 84 - "Requirements"
Cohesion: 0.09
Nodes (23): Requirement: Activate (re-enable) account, Requirement: Create salesperson account, Requirement: Deactivate account, Requirement: Delete account permanently, Requirement: Edit account (name, password, country), Requirement: List all accounts, Requirements, Scenario: All accounts returned (+15 more)

### Community 85 - "Node.js + TypeScript Code Style & Standards"
Cohesion: 0.22
Nodes (8): Architecture — Modular Monolith, Error & Exception Handling, Folder Structure, Function Composition & Layout, Language & File Structure, Libraries & Dependencies, Module Rules, Node.js + TypeScript Code Style & Standards

### Community 86 - ".agents/settings.json"
Cohesion: 0.22
Nodes (8): autoMemoryEnabled, disableArtifact, disableBundledSkills, disableClaudeAiConnectors, disableRemoteControl, disableWorkflows, permissions, $schema

### Community 87 - "persist_design_system"
Cohesion: 0.25
Nodes (9): format_master_md(), persist_design_system(), Path, Format design system as MASTER.md with hierarchical override logic., Slugify a name into a single safe path segment. Only [a-z0-9_-] survives; every…, Write fully to a temp file, then publish atomically., Persist design system to design-system/<project>/ folder using Master +…, safe_slug() (+1 more)

### Community 88 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 89 - ".agents/skills/grill-with-superpower/scripts/helper.js"
Cohesion: 0.42
Nodes (7): connect(), nextReconnectDelay(), reloadAfterRecovery(), sessionKey(), setStatus(), showTombstone(), websocketUrl()

### Community 90 - "Code Style & Standards"
Cohesion: 0.25
Nodes (7): Bug Fixes & Refactoring, Code Quality, Code Style & Standards, Function Length & Structure, Naming & Constants, Parameters, Returns & Data Flow, Starting a New Feature

### Community 91 - "Process"
Cohesion: 0.25
Nodes (7): 1. Pin the fixed point, 2. Identify the spec source, 3. Identify the standards sources, 4. Spawn both sub-agents in parallel, 5. Aggregate, Process, Why two axes

### Community 92 - "Design Screens"
Cohesion: 0.25
Nodes (7): Checklist before reporting done, Design Screens, Guardrails, Screen file rules, Steps, The design brain, Thinking rules (apply while designing)

### Community 93 - "Brainstorming Ideas Into Designs"
Cohesion: 0.25
Nodes (7): Anti-Pattern: "This Is Too Simple To Need A Design", Brainstorming Ideas Into Designs, Checklist, Ending the Session, Process Flow, The Process, Visual Companion

### Community 94 - "Write Screens"
Cohesion: 0.25
Nodes (7): Guardrails, Input, Steps, Template, The balance (most important rule), Write Screens, Writing rules

### Community 95 - "Stacks — Library Catalog"
Cohesion: 0.29
Nodes (6): How this file is used, JS libraries, Python libraries, React Native (native CLI) libraries, Services & Tools, Stacks — Library Catalog

### Community 96 - ".agents/skills/grill-with-openspec/SKILL.md"
Cohesion: 0.29
Nodes (6): Ending Discovery, Guardrails, Handling Different Entry Points, The Stance, What You Don't Have To Do, What You Might Do

### Community 97 - ".agents/skills/grill-with-superpower/scripts/stop-server.sh"
Cohesion: 0.43
Nodes (4): command_has_server_id(), is_brainstorm_server(), mark_stopped(), stop-server.sh script

### Community 98 - ".agents/skills/write-spec-greenfield/templates/proposal.md"
Cohesion: 0.29
Nodes (6): Build Slices, Capabilities, Impact, New Capabilities, What Changes, Why

### Community 99 - ".agents/skills/write-spec/templates/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 100 - "Stacks — Library Catalog"
Cohesion: 0.29
Nodes (6): How this file is used, JS libraries, Python libraries, React Native (native CLI) libraries, Services & Tools, Stacks — Library Catalog

### Community 101 - ".claude/skills/write-spec-greenfield/templates/proposal.md"
Cohesion: 0.29
Nodes (6): Build Slices, Capabilities, Impact, New Capabilities, What Changes, Why

### Community 102 - "Project File Structure"
Cohesion: 0.20
Nodes (9): 1. Backend (`backend/`) — Python / Flask Modular Monolith, 1. Mobile App (`app/`) — Android Sideloaded APK, 2. Manager Web Dashboard (`web/`) — React + TypeScript, 2. Web Dashboard (`web/`) — Manager Web App, 3. Backend (`backend/`) — Python Flask API, 3. Salesperson Mobile App (`app/`) — React Native (Bare CLI) + TypeScript, Architecture Overview, Project File Structure (+1 more)

### Community 103 - "_generate_intelligent_overrides"
Cohesion: 0.33
Nodes (6): _detect_page_type(), format_page_override_md(), _generate_intelligent_overrides(), Format a page-specific override file with intelligent AI-generated content., Generate intelligent overrides based on page type using layered search. Uses…, Detect page type from context and search results.

### Community 104 - "_resolve_color_mode"
Cohesion: 0.33
Nodes (6): _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., _resolve_color_mode(), _style_is_dark_primary()

### Community 105 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 106 - "Design System — Apex Sales Call"
Cohesion: 0.40
Nodes (4): Colors, Design System — Apex Sales Call, Rules & Components, Typography

### Community 107 - ".agents/skills/write-spec-greenfield/templates/design.md"
Cohesion: 0.40
Nodes (4): Context, Decisions, Goals / Non-Goals, Risks / Trade-offs

### Community 108 - ".agents/skills/write-spec-greenfield/templates/spec.md"
Cohesion: 0.40
Nodes (4): ADDED Requirements, Purpose, Requirement: <!-- requirement name -->, Scenario: <!-- scenario name -->

### Community 109 - ".agents/skills/write-spec/templates/design.md"
Cohesion: 0.40
Nodes (4): Context, Decisions, Goals / Non-Goals, Risks / Trade-offs

### Community 110 - ".agents/skills/write-spec/templates/spec.md"
Cohesion: 0.40
Nodes (4): ADDED Requirements, Purpose, Requirement: <!-- requirement name -->, Scenario: <!-- scenario name -->

### Community 111 - ".claude/skills/write-spec-greenfield/templates/design.md"
Cohesion: 0.40
Nodes (4): Context, Decisions, Goals / Non-Goals, Risks / Trade-offs

### Community 112 - ".claude/skills/write-spec-greenfield/templates/spec.md"
Cohesion: 0.40
Nodes (4): ADDED Requirements, Purpose, Requirement: <!-- requirement name -->, Scenario: <!-- scenario name -->

### Community 113 - "Commit Story"
Cohesion: 0.50
Nodes (3): Commit Story, Git rules, Steps

### Community 114 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 115 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 116 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 117 - "Grill — style router"
Cohesion: 0.50
Nodes (3): Grill — style router, Step 1 — Ask which style, Step 2 — Load and run the chosen skill

### Community 118 - ".agents/skills/write-spec-greenfield/instructions/tasks.md"
Cohesion: 0.50
Nodes (3): How to break a slice into tasks, One group per build slice, Task quality

### Community 119 - ".claude/skills/write-spec-greenfield/instructions/tasks.md"
Cohesion: 0.50
Nodes (3): How to break a slice into tasks, One group per build slice, Task quality

### Community 146 - "Tasks: Sales Call Tracker v1"
Cohesion: 0.10
Nodes (20): 10. Web Dashboard — Auth Page, 11. Web Dashboard — Team Dashboard, 12. Web Dashboard — Leads Page, 13. Web Dashboard — Accounts Page, 14. Android App — Tracking Spike (Do This First), 15. Android App — Foundation and Auth, 16. Android App — Dialer Screen, 17. Android App — Sync (+12 more)

### Community 147 - "Decisions"
Cohesion: 0.11
Nodes (17): 10. Web dashboard token in localStorage, 1. Single-repo, three-part monorepo, 2. Flask modular monolith with Flask-SQLAlchemy, 3. Auth: token in `users` table, no separate tokens table, 4. IST day boundaries computed server-side, 5. Android: bare React Native CLI, no Expo, 6. Call tracking: two-path fill, janitor runs before sync, 7. Lead pool: server-side state, claim window prevents double-dial (+9 more)

### Community 148 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Single active session per user, Requirement: Token-gated API access, Requirements, Scenario: Deactivated user with valid token, Scenario: Invalid or missing token, Scenario: Re-login replaces old token, Scenario: Token used after password reset (+1 more)

### Community 149 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Dialer intent row created on tap, Requirement: Three Android permissions required, Requirements, Scenario: All permissions granted, Scenario: Any permission denied, Scenario: Call button double-tap, Scenario: Call button tapped once (+1 more)

### Community 150 - "agent-doc/proposal.md"
Cohesion: 0.22
Nodes (7): Capabilities, Impact, New Capabilities, Proposal: Sales Call Tracker — v1, What Changes, Why, Purpose

### Community 151 - "Requirement: Name-and-password login"
Cohesion: 0.33
Nodes (6): Requirement: Name-and-password login, Scenario: Deactivated account, Scenario: Missing fields, Scenario: Name not found, Scenario: Successful login, Scenario: Wrong password

### Community 152 - "_generate_intelligent_overrides"
Cohesion: 0.33
Nodes (6): _detect_page_type(), format_page_override_md(), _generate_intelligent_overrides(), Format a page-specific override file with intelligent AI-generated content., Generate intelligent overrides based on page type using layered search. Uses…, Detect page type from context and search results.

### Community 153 - "Requirement: Batch sync to server"
Cohesion: 0.40
Nodes (5): Requirement: Batch sync to server, Scenario: Failed sync retains rows, Scenario: Server deduplicates retried rows, Scenario: Successful sync clears sent rows, Scenario: Sync sends only filled rows

### Community 154 - "Requirement: Call-log matching — Path 1 (real-time)"
Cohesion: 0.40
Nodes (5): Requirement: Call-log matching — Path 1 (real-time), Scenario: Incoming call from the same number ignored, Scenario: Normal answered call, Scenario: Two quick calls to the same number, Scenario: Unanswered dial

### Community 155 - "Requirement: Login brute-force lockout"
Cohesion: 0.50
Nodes (4): Requirement: Login brute-force lockout, Scenario: Counter reset on success, Scenario: Lockout expires, Scenario: Lockout triggered

### Community 156 - "Requirement: Call-log matching — Path 2 (janitor)"
Cohesion: 0.50
Nodes (4): Requirement: Call-log matching — Path 2 (janitor), Scenario: App killed mid-call — row completed at first open, Scenario: Row give-up after 5 janitor strikes, Scenario: Young rows untouched by janitor

### Community 157 - "Requirement: Clear local data recovery"
Cohesion: 0.50
Nodes (4): Requirement: Clear local data recovery, Scenario: Clear cancelled, Scenario: Clear confirmed, Scenario: Count shown in confirmation

### Community 158 - "Requirement: Phone number normalization"
Cohesion: 0.50
Nodes (4): Requirement: Phone number normalization, Scenario: International number passes through, Scenario: Local-format number normalized, Scenario: Unparseable number stored raw

### Community 159 - "Requirement: Server-side call ingestion"
Cohesion: 0.50
Nodes (4): Requirement: Server-side call ingestion, Scenario: Malformed row in batch, Scenario: Old call dropped, Scenario: Valid batch saved

## Knowledge Gaps
- **876 isolated node(s):** `$schema`, `autoMemoryEnabled`, `disableBundledSkills`, `disableWorkflows`, `disableArtifact` (+871 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `search()` connect `.agents/skills/design-screens/uiux/scripts/core.py` to `.agents/skills/design-screens/uiux/scripts/design_system.py`, `.generate`, `_generate_intelligent_overrides`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `search()` connect `core.py` to `_generate_intelligent_overrides`, `.generate`, `.claude/skills/design-screens/uiux/scripts/design_system.py`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `$schema`, `autoMemoryEnabled`, `disableBundledSkills` to the rest of the system?**
  _876 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.claude/skills/grill-with-superpower/scripts/server.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05868118572292801 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Requirements` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `allow` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._