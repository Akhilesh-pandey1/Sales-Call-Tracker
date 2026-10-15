# Graph Report - sales-call-tracker  (2026-10-15)

## Corpus Check
- 143 files · ~237,357 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1370 nodes · 2273 edges · 100 communities (88 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97d5ec0a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server.cjs
- .claude/settings.json
- What You Must Do When Invoked
- Requirements
- allow
- Dimensions
- grill-for-business/SKILL.md
- Visual Companion Guide
- Before Grill — the problem gate
- now_utc
- Test-Driven Development
- Python / Flask Code Style & Standards
- graphify reference: extra exports and benchmark
- helper.js
- CLAUDE.md
- Code Style & Standards
- React + TypeScript Code Style & Standards
- Process
- Brainstorming Ideas Into Designs
- Chief of Staff
- stop-server.sh
- Proposal: [Initiative Name]
- Node.js + TypeScript Code Style & Standards
- graphify reference: query, path, explain
- test_production.py
- Requirement: [Clear Name of Requirement]
- Commit Story
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- Grill — style router
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- start-server.sh
- Grill with Osmani — the intent interview
- decisions.md
- extraction-spec.md
- Write Tickets — Planning and Task Breakdown
- Implement with Pocock
- Requirement: Create salesperson account
- instructions/proposal.md
- instructions/spec.md
- Requirement: Token-gated API access
- Execution Steps
- core.py
- Requirement: Deactivate account
- Requirement: Delete account permanently
- Security & Performance Baseline
- Humanizer: remove AI writing patterns
- generate_design_system
- DesignSystemGenerator
- ._apply_reasoning
- _select_palette_for_mode
- .generate
- design_system.py
- Design Screens
- Write Screens
- Manager View (web)
- _resolve_color_mode
- Requirements
- 4. User Account Management (Manager Only)
- deny
- Steps
- Database Schema & Design
- 1. Backend Automated Tests (`backend/tests/`)
- Requirements
- Stacks — Library Catalog
- Project File Structure
- Design System — Apex Sales Call
- Tasks: Sales Call Tracker v1 — Remaining Work
- Requirements
- Requirements
- agent-doc/proposal.md
- Requirement: Name-and-password login
- User
- test_users.py
- AppException
- compilerOptions
- test_leads.py
- router.tsx
- devDependencies
- test_dashboard.py
- leads/services.py
- dependencies
- base.py
- cn
- providers.tsx
- package.json
- navbar.tsx
- table.tsx
- clsx
- lucide-react
- react-dom
- @types/react-dom
- api-client.ts

## God Nodes (most connected - your core abstractions)
1. `AppException` - 37 edges
2. `now_utc()` - 34 edges
3. `User` - 33 edges
4. `create_user_record()` - 31 edges
5. `hash_password()` - 29 edges
6. `allow` - 24 edges
7. `search()` - 23 edges
8. `create_user_fixture()` - 23 edges
9. `Tasks: Sales Call Tracker v1 — Remaining Work` - 22 edges
10. `create_user_fixture()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `TestConfig` --uses--> `BaseConfig`  [INFERRED]
  backend/tests/conftest.py → backend/app/config/base.py
- `_generate_intelligent_overrides()` --calls--> `search()`  [EXTRACTED]
  .claude/skills/design-screens/uiux/scripts/design_system.py → .claude/skills/design-screens/uiux/scripts/core.py
- `create_app()` --calls--> `register_commands()`  [EXTRACTED]
  backend/app/__init__.py → backend/app/commands.py
- `DevConfig` --uses--> `BaseConfig`  [INFERRED]
  backend/app/config/dev.py → backend/app/config/base.py
- `ProdConfig` --uses--> `BaseConfig`  [INFERRED]
  backend/app/config/prod.py → backend/app/config/base.py

## Import Cycles
- None detected.

## Communities (100 total, 12 thin omitted)

### Community 0 - "server.cjs"
Cohesion: 0.06
Nodes (55): bootstrapPage(), brandMarkup(), broadcast(), browserLauncherForPlatform(), chmodOwnerOnly(), clients, companionUrl(), computeAcceptKey() (+47 more)

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
Nodes (24): allow, Agent, Bash(git add:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(git status:*) (+16 more)

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

### Community 9 - "now_utc"
Cohesion: 0.15
Nodes (36): get_ist_timezone(), normalize_phone_number(), now_utc(), datetime, to_ist(), Call, extract_valid_call(), Any (+28 more)

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
Cohesion: 0.20
Nodes (9): Env Files, Language, Private Folder, Rules, Search, Source of Truth (No Guessing), Tasks, Timelines (+1 more)

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

### Community 19 - "Chief of Staff"
Cohesion: 0.12
Nodes (16): A. Find the Frontier, B. For Each Frontier Task — Create Worktree + Dispatch Subagent, C. Wait for Subagents to Report, Checkpoints, Chief of Staff, D. Merge Completed Worktree → Integration Branch, Final Phase, Quick Reference (+8 more)

### Community 20 - "stop-server.sh"
Cohesion: 0.43
Nodes (4): command_has_server_id(), is_brainstorm_server(), mark_stopped(), stop-server.sh script

### Community 21 - "Proposal: [Initiative Name]"
Cohesion: 0.22
Nodes (8): Build Order, Capability Map (Modular Breakdown), Impact & Systems Affected, In Scope, Out of Scope (Non-Goals), Proposal: [Initiative Name], Scope, Why

### Community 22 - "Node.js + TypeScript Code Style & Standards"
Cohesion: 0.22
Nodes (8): Architecture — Modular Monolith, Error & Exception Handling, Folder Structure, Function Composition & Layout, Language & File Structure, Libraries & Dependencies, Module Rules, Node.js + TypeScript Code Style & Standards

### Community 23 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 24 - "test_production.py"
Cohesion: 0.47
Nodes (9): Flask, FlaskClient, Path, test_api_route_not_found_returns_json(), test_missing_dist_returns_404(), test_missing_static_asset_returns_404(), test_serve_index_html_on_root(), test_serve_spa_client_route() (+1 more)

### Community 25 - "Requirement: [Clear Name of Requirement]"
Cohesion: 0.33
Nodes (5): Purpose, Requirement: [Clear Name of Requirement], Requirements, Scenario: [Error or Boundary Condition], Scenario: [Specific Happy Path or Edge Case]

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

### Community 34 - "Grill with Osmani — the intent interview"
Cohesion: 0.18
Nodes (10): Grill with Osmani — the intent interview, Red flags, Rules, Step 1 — Hypothesize, with a confidence number, Step 2 — One question at a time, each with a guess attached, Step 3 — Listen for "want vs. should want", Step 4 — Restate intent in the user's own words, Step 5 — Confirm: explicit yes, not "whatever you think" (+2 more)

### Community 37 - "Write Tickets — Planning and Task Breakdown"
Cohesion: 0.10
Nodes (19): Common Rationalizations (Banned Shortcuts), Never Overwrite an Incomplete Plan, No Manual or Deployment Work in Tickets, Output File & Protection Rules, Output Summary, Overview, Parallelization Opportunities (Parallel vs Sequential Guidance), Pre-Handoff Verification (+11 more)

### Community 39 - "Implement with Pocock"
Cohesion: 0.40
Nodes (4): 1. Single Source of Truth (No Guessing / No Assumptions), 2. Implementation Loop, 3. Review & Commit, Implement with Pocock

### Community 40 - "Requirement: Create salesperson account"
Cohesion: 0.40
Nodes (5): Requirement: Create salesperson account, Scenario: Duplicate name rejected, Scenario: Invalid country code rejected, Scenario: Successful creation, Scenario: Weak password rejected

### Community 43 - "Requirement: Token-gated API access"
Cohesion: 0.50
Nodes (4): Requirement: Token-gated API access, Scenario: Deactivated user with valid token, Scenario: Invalid or missing token, Scenario: Valid token on protected endpoint

### Community 44 - "Execution Steps"
Cohesion: 0.25
Nodes (7): 1. Read Existing `agent-doc/` Ground Truth, 2. Phase 0: Decompose via Capability Map, 3. Generate Artifacts in Dependency Order, Artifacts Produced in `agent-doc/`, Execution Steps, Output Summary, Write Spec — The Specification Engine

### Community 45 - "core.py"
Cohesion: 0.06
Nodes (60): BM25, _contains_phrase(), detect_domain(), _domain_keywords(), _exact_match_diagnostic(), _exact_row_identity(), _exact_stack_identifier(), _file_signature() (+52 more)

### Community 46 - "Requirement: Deactivate account"
Cohesion: 0.50
Nodes (4): Requirement: Deactivate account, Scenario: Deactivated account cannot log in, Scenario: Deactivated account's calls kept, Scenario: Self-deactivation refused

### Community 47 - "Requirement: Delete account permanently"
Cohesion: 0.50
Nodes (4): Requirement: Delete account permanently, Scenario: Delete releases lead claims, Scenario: Delete removes user and all calls, Scenario: Self-deletion refused

### Community 48 - "Security & Performance Baseline"
Cohesion: 0.50
Nodes (3): Performance, Security, Security & Performance Baseline

### Community 49 - "Humanizer: remove AI writing patterns"
Cohesion: 0.05
Nodes (39): 10. Hyphenated pairs everywhere, 11. Passive voice and missing subjects, 12. Overused AI words, 13. Inflated significance, 14. Vague connection or association, 15. Shallow -ing riders, 16. Sales language, 17. Borrowed authority (+31 more)

### Community 53 - "generate_design_system"
Cohesion: 0.17
Nodes (12): ansi_ljust(), format_ascii_box(), format_markdown(), generate_design_system(), hex_to_ansi(), Convert hex color to ANSI True Color swatch (██) with fallback., Like str.ljust but accounts for zero-width ANSI escape sequences., Create a Unicode section separator: ├─── NAME ───...┤ (+4 more)

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

### Community 59 - "design_system.py"
Cohesion: 0.18
Nodes (15): _detect_page_type(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), persist_design_system(), Path, Format design system as MASTER.md with hierarchical override logic., Format a page-specific override file with intelligent AI-generated content. (+7 more)

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

### Community 69 - "deny"
Cohesion: 0.11
Nodes (19): deny, Bash(git push:*), CronCreate, CronDelete, CronList, EnterPlanMode, EnterWorktree, ExitPlanMode (+11 more)

### Community 76 - "Steps"
Cohesion: 0.15
Nodes (12): 1. Gather — never re-ask what is already settled, 2. Sort — each fact goes to exactly one file, 3. Write — by the rules below, Current truth, not history, Independent entries, Log Decisions — the recorder, One fact, one place, Precondition (+4 more)

### Community 79 - "Database Schema & Design"
Cohesion: 0.20
Nodes (9): 1. PostgreSQL Tables, 2. Android Local Phone Database (SQLite), 3. Migrations & Rollback, `calls`, Database Schema & Design, `leads`, Overview, `pending_calls` (+1 more)

### Community 83 - "1. Backend Automated Tests (`backend/tests/`)"
Cohesion: 0.22
Nodes (8): 1. Backend Automated Tests (`backend/tests/`), 2. Mobile Android Spike Checklist, Testing Specifications, `tests/modules/test_auth.py`, `tests/modules/test_calls.py`, `tests/modules/test_dashboard.py`, `tests/modules/test_leads.py`, `tests/modules/test_users.py`

### Community 84 - "Requirements"
Cohesion: 0.20
Nodes (10): Requirement: Activate (re-enable) account, Requirement: Edit account (name, password, country), Requirement: List all accounts, Requirements, Scenario: All accounts returned, Scenario: Manager can edit own account, Scenario: Name updated, Scenario: Non-manager access refused (+2 more)

### Community 100 - "Stacks — Library Catalog"
Cohesion: 0.29
Nodes (6): How this file is used, JS libraries, Python libraries, React Native (native CLI) libraries, Services & Tools, Stacks — Library Catalog

### Community 102 - "Project File Structure"
Cohesion: 0.20
Nodes (9): 1. Backend (`backend/`) — Python / Flask Modular Monolith, 1. Mobile App (`app/`) — Android Sideloaded APK, 2. Manager Web Dashboard (`web/`) — React + TypeScript, 2. Web Dashboard (`web/`) — Manager Web App, 3. Backend (`backend/`) — Python Flask API, 3. Salesperson Mobile App (`app/`) — React Native (Bare CLI) + TypeScript, Architecture Overview, Project File Structure (+1 more)

### Community 106 - "Design System — Apex Sales Call"
Cohesion: 0.40
Nodes (4): Colors, Design System — Apex Sales Call, Rules & Components, Typography

### Community 146 - "Tasks: Sales Call Tracker v1 — Remaining Work"
Cohesion: 0.09
Nodes (22): Task 10: Manager can delete a salesperson account, Task 11: Android app shell runs on a device, Task 12: Salesperson can log in on the app, Task 13: The app asks for call permissions, Task 14: Dial intents are queued locally in SQLite, Task 15: Real dials are captured from the call log (Path 1), Task 16: Stale queued dials are completed by the janitor (Path 2), Task 17: Queued calls sync to the server (+14 more)

### Community 148 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Login brute-force lockout, Requirement: Single active session per user, Requirements, Scenario: Counter reset on success, Scenario: Lockout expires, Scenario: Lockout triggered, Scenario: Re-login replaces old token (+1 more)

### Community 149 - "Requirements"
Cohesion: 0.06
Nodes (34): Requirement: Batch sync to server, Requirement: Call-log matching — Path 1 (real-time), Requirement: Call-log matching — Path 2 (janitor), Requirement: Clear local data recovery, Requirement: Dialer intent row created on tap, Requirement: Phone number normalization, Requirement: Server-side call ingestion, Requirement: Three Android permissions required (+26 more)

### Community 150 - "agent-doc/proposal.md"
Cohesion: 0.18
Nodes (8): Capabilities, Impact, New Capabilities, Proposal: Sales Call Tracker — v1, What Changes, Why, Purpose, Purpose

### Community 151 - "Requirement: Name-and-password login"
Cohesion: 0.33
Nodes (6): Requirement: Name-and-password login, Scenario: Deactivated account, Scenario: Missing fields, Scenario: Name not found, Scenario: Successful login, Scenario: Wrong password

### Community 152 - "User"
Cohesion: 0.10
Nodes (41): Flask, register_commands(), seed_command(), generate_auth_token(), hash_password(), verify_password(), login(), post (+33 more)

### Community 153 - "test_users.py"
Cohesion: 0.21
Nodes (33): create_user_record(), ensure_auxiliary_tables(), Flask, FlaskClient, test_activate_user_non_manager_refused(), test_activate_user_not_found(), test_activate_user_success(), test_create_user_duplicate_name_rejected() (+25 more)

### Community 154 - "AppException"
Cohesion: 0.08
Nodes (55): AppException, Any, require_auth(), require_manager(), validate_password_strength(), parse_utc_datetime(), Response, sync_calls() (+47 more)

### Community 156 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, vite.config.ts, compilerOptions, allowImportingTsExtensions, baseUrl (+16 more)

### Community 157 - "test_leads.py"
Cohesion: 0.30
Nodes (25): create_lead_fixture(), create_user_fixture(), datetime, Flask, FlaskClient, test_next_lead_claimed_on_serve_and_expires(), test_next_lead_done_or_stopped_cannot_be_scheduled(), test_next_lead_due_scheduled_served_before_pool() (+17 more)

### Community 159 - "router.tsx"
Cohesion: 0.15
Nodes (7): DashboardLayout(), NavItem, AccountsPage(), LoginPage(), PersonPage(), TeamPage(), LeadsPage()

### Community 160 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, postcss, tailwindcss, @types/node, @types/react, typescript, vite, @vitejs/plugin-react (+9 more)

### Community 161 - "test_dashboard.py"
Cohesion: 0.29
Nodes (25): now_ist(), create_call_record(), create_user_fixture(), datetime, Flask, FlaskClient, test_person_dashboard_connected_derived_from_duration(), test_person_dashboard_fewer_than_five_numbers() (+17 more)

### Community 162 - "leads/services.py"
Cohesion: 0.16
Nodes (27): Lead, get_next_lead(), get_summary(), get, post, Response, upload_leads(), LeadPoolBucketCounts (+19 more)

### Community 163 - "dependencies"
Cohesion: 0.12
Nodes (17): axios, class-variance-authority, @radix-ui/react-dialog, @radix-ui/react-slot, react, react-router-dom, tailwind-merge, @tanstack/react-query (+9 more)

### Community 164 - "base.py"
Cohesion: 0.20
Nodes (15): BaseConfig, DevConfig, ProdConfig, Flask, register_error_handlers(), create_app(), Flask, Flask (+7 more)

### Community 166 - "cn"
Cohesion: 0.18
Nodes (12): Badge(), BadgeProps, badgeVariants, DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay (+4 more)

### Community 167 - "providers.tsx"
Cohesion: 0.22
Nodes (9): AppProviders(), AuthContext, AuthContextType, AuthProvider(), getInitialUser(), queryClient, UserData, router (+1 more)

### Community 169 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

### Community 170 - "navbar.tsx"
Cohesion: 0.36
Nodes (6): ManagerGuard(), useAuth(), Button, ButtonProps, buttonVariants, Navbar()

### Community 171 - "table.tsx"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

## Knowledge Gaps
- **604 isolated node(s):** `$schema`, `autoMemoryEnabled`, `disableBundledSkills`, `disableWorkflows`, `disableArtifact` (+599 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `test_dashboard.py`, `leads/services.py`, `now_utc`, `test_users.py`, `AppException`, `test_leads.py`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `AppException` connect `AppException` to `User`, `now_utc`, `leads/services.py`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `hash_password()` connect `User` to `test_dashboard.py`, `now_utc`, `test_users.py`, `AppException`, `test_leads.py`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `autoMemoryEnabled`, `disableBundledSkills` to the rest of the system?**
  _604 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05868118572292801 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Requirements` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._