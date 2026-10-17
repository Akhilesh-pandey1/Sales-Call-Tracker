# Graph Report - sales-call-tracker  (2026-10-17)

## Corpus Check
- 273 files · ~339,414 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2433 nodes · 4314 edges · 201 communities (164 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a2cf412`
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
- seed_fake_data.py
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
- devDependencies
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
- agent-doc/proposal.md
- extraction-spec.md
- Write Tickets — Planning and Task Breakdown
- Implement with Pocock
- lead-call-card.tsx
- instructions/proposal.md
- instructions/spec.md
- cn
- Execution Steps
- core.py
- my-stats-screen.tsx
- leads-page.tsx
- Security & Performance Baseline
- Humanizer: remove AI writing patterns
- app/src/shared/api/api-client.ts
- dashboard/schemas.py
- getApiErrorMessage
- generate_design_system
- person-page.tsx
- DesignSystemGenerator
- team-page.tsx
- _select_palette_for_mode
- 4. User Account Management (Manager Only)
- design_system.py
- app/__init__.py
- Design Screens
- Write Screens
- Manager View (web)
- Sales Call Tracker — Backend
- Requirements
- API Specifications
- accounts-table.tsx
- settings-screen.tsx
- deny
- use-call-tracker.ts
- use-sync.ts
- components.json
- use-automated-calling.ts
- dialer-screen.tsx
- THEME — Apex Sales Call (v2 light)
- Steps
- pending-calls-db.ts
- text.tsx
- 1. PostgreSQL Tables
- app/tsconfig.json
- auth/services.py
- use-janitor.ts
- 1. Backend Automated Tests (`backend/tests/`)
- Requirements
- App.tsx
- Requirement: Office-hours gate at call sync
- User
- Design Systems from DESIGN.md
- dependencies
- call-log-matcher.ts
- errors.py
- MainActivity
- MainApplication
- formatCount
- Apex Sales Call (Android)
- ._apply_reasoning
- The Design System Page
- screenshot.py
- clsx
- Stacks — Library Catalog
- gradlew
- Project File Structure
- metro.config.js
- AGENTS.md
- clsx
- @react-navigation/native
- libphonenumber-js
- lucide-react-native
- @radix-ui/react-dialog
- react
- Commands
- @react-native-async-storage/async-storage
- react-native-call-detection-android
- react-native-call-log
- @react-native-clipboard/clipboard
- react-native-permissions
- screens/CLAUDE.md
- react-native-safe-area-context
- react-native-screens
- react-native-sqlite-storage
- react-native-svg
- react-native-worklets
- @rn-primitives/dialog
- @rn-primitives/portal
- @rn-primitives/slot
- tailwind-merge
- tailwindcss-animate
- app/tailwind.config.js
- calls-by-hour-chart.tsx
- @tanstack/react-query
- lead-daily-stats.tsx
- Snap Screens
- web/src/features/auth/hooks/use-auth.ts
- app/src/components/ui/button.tsx
- Chief-of-Staff Ledger
- .generate
- Critical Rules
- tasks.md
- _resolve_color_mode
- Requirement: Name-and-password login
- Requirements
- Proposal: Sales Call Tracker — v1
- Customization & Theming
- test_dashboard.py
- test_users.py
- AppException
- Component Composition
- compilerOptions
- test_leads.py
- Styling & Customization
- Tools
- devDependencies
- shadcn/ui
- dependencies
- test_production.py
- Chat & Messaging
- lead-upload-card.tsx
- router.tsx
- react-native-reanimated
- package.json
- Registry Authoring and Addresses
- team-table.tsx
- Base vs Radix
- Forms & Inputs
- dashboard/types.ts
- showcase-coverage.mjs
- test_foundation.py
- color-pair.tsx
- Icons
- cn
- Requirement: Calls-by-hour chart
- state-matrix.tsx
- 6. Office Hours Settings (Manager Only)
- accounts.api.ts
- class-variance-authority
- Requirement: All dashboard math computed server-side
- Requirement: Dashboard failure and empty states
- Requirement: Salesperson self view
- Requirement: Team KPI cards
- Requirement: Manager-only team dashboard
- Requirement: Most contacted numbers
- Requirement: Per-period response shape
- Requirement: Person calls-by-hour chart
- Requirement: Person performance table
- Requirement: Person view KPI cards
- Requirement: Team response carries no salesperson rows
- Requirement: Top 5 people by talk time
- react-native
- axios
- @radix-ui/react-slot

## God Nodes (most connected - your core abstractions)
1. `User` - 41 edges
2. `AppException` - 38 edges
3. `cn()` - 38 edges
4. `now_utc()` - 35 edges
5. `hash_password()` - 31 edges
6. `create_user_record()` - 31 edges
7. `cn()` - 29 edges
8. `create_user_fixture()` - 28 edges
9. `now_ist()` - 26 edges
10. `create_user_fixture()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `useAuth()` --indirect_call--> `loginUser()`  [INFERRED]
  app/src/features/auth/hooks/use-auth.ts → web/src/features/auth/api/auth.api.ts
- `SubTabButton()` --calls--> `cn()`  [EXTRACTED]
  app/src/features/dialer/screens/dialer-screen.tsx → app/src/lib/utils.ts
- `KeypadView()` --calls--> `cn()`  [EXTRACTED]
  app/src/features/dialer/screens/dialer-screen.tsx → app/src/lib/utils.ts
- `TestConfig` --uses--> `BaseConfig`  [INFERRED]
  backend/tests/conftest.py → backend/app/config/base.py
- `DashboardTimeWindows` --uses--> `AppException`  [INFERRED]
  backend/app/modules/dashboard/services.py → backend/app/core/errors.py

## Import Cycles
- None detected.

## Communities (201 total, 37 thin omitted)

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
Cohesion: 0.05
Nodes (36): Purpose, Requirement: CSV upload into lead pool, Requirement: Lead claim window, Requirement: Lead pool manager summary, Requirement: Lead resolution via call sync, Requirement: Lead scheduling, Requirement: Lead state is authoritative and server-stored, Requirement: Next-lead serving — priority order (+28 more)

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

### Community 9 - "seed_fake_data.py"
Cohesion: 0.07
Nodes (66): normalize_phone_number(), Call, extract_valid_call(), Any, datetime, sync_calls_batch(), Lead, get_next_lead() (+58 more)

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

### Community 24 - "devDependencies"
Cohesion: 0.04
Nodes (46): devDependencies, @babel/core, @babel/preset-env, @babel/runtime, eslint, patch-package, prettier, @react-native/babel-preset (+38 more)

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

### Community 40 - "lead-call-card.tsx"
Cohesion: 0.11
Nodes (27): addDays(), buildAttemptLabel(), createDefaultScheduleSelection(), formatScheduleDateLabel(), formatScheduleTimeLabel(), getOutcomeAccentClass(), getOutcomeChipClass(), getOutcomeDotClass() (+19 more)

### Community 43 - "cn"
Cohesion: 0.14
Nodes (18): Badge(), BadgeProps, badgeVariants, DialogFooter(), DialogHeader(), UserFormTextField(), DashboardCard(), DashboardCardProps (+10 more)

### Community 44 - "Execution Steps"
Cohesion: 0.25
Nodes (7): 1. Read Existing `agent-doc/` Ground Truth, 2. Phase 0: Decompose via Capability Map, 3. Generate Artifacts in Dependency Order, Artifacts Produced in `agent-doc/`, Execution Steps, Output Summary, Write Spec — The Specification Engine

### Community 45 - "core.py"
Cohesion: 0.06
Nodes (60): BM25, _contains_phrase(), detect_domain(), _domain_keywords(), _exact_match_diagnostic(), _exact_row_identity(), _exact_stack_identifier(), _file_signature() (+52 more)

### Community 46 - "my-stats-screen.tsx"
Cohesion: 0.08
Nodes (24): MainTabs, MainTabsParamList, DialerScreen(), fetchMyStats(), PeriodStats, PersonStats, TopNumberStats, MyStatsState (+16 more)

### Community 47 - "leads-page.tsx"
Cohesion: 0.15
Nodes (19): getLeadsSummary(), uploadLeads(), LeadAgentTable(), getUploadToastDescription(), LeadCountryOption, LeadUploadCard(), getCsvFileValidationError(), HandleUploadSuccess (+11 more)

### Community 48 - "Security & Performance Baseline"
Cohesion: 0.50
Nodes (3): Performance, Security, Security & Performance Baseline

### Community 49 - "Humanizer: remove AI writing patterns"
Cohesion: 0.05
Nodes (39): 10. Hyphenated pairs everywhere, 11. Passive voice and missing subjects, 12. Overused AI words, 13. Inflated significance, 14. Vague connection or association, 15. Shallow -ing riders, 16. Sales language, 17. Borrowed authority (+31 more)

### Community 50 - "app/src/shared/api/api-client.ts"
Cohesion: 0.15
Nodes (15): RootNavigator(), LoginResponse, requestLogin(), AuthStatus, getLoginErrorMessage(), useAuth(), LoginScreen(), apiClient (+7 more)

### Community 51 - "dashboard/schemas.py"
Cohesion: 0.24
Nodes (12): HourlyCallBuckets, PeriodStats, PersonDashboardResponse, PersonDashboardSummary, PersonPeriodStats, PersonThirtyDayStats, BaseModel, field_validator (+4 more)

### Community 52 - "getApiErrorMessage"
Cohesion: 0.18
Nodes (14): activateUser(), deactivateUser(), deleteUser(), DeleteDialog(), UserStatusButton(), UserStatusButtonProps, ACCOUNTS_QUERY_KEY, useDeleteUser() (+6 more)

### Community 53 - "generate_design_system"
Cohesion: 0.17
Nodes (12): ansi_ljust(), format_ascii_box(), format_markdown(), generate_design_system(), hex_to_ansi(), Convert hex color to ANSI True Color swatch (██) with fallback., Like str.ljust but accounts for zero-width ANSI escape sequences., Create a Unicode section separator: ├─── NAME ───...┤ (+4 more)

### Community 54 - "person-page.tsx"
Cohesion: 0.12
Nodes (21): TopNumbersTable(), buildPeriodValueLabels(), buildPeriodViews(), DesktopPeriodRow(), DesktopPeriodRowProps, Last30DaysKpiSection(), Last30DaysKpiSectionProps, MobilePeriodBlock() (+13 more)

### Community 55 - "DesignSystemGenerator"
Cohesion: 0.27
Nodes (4): DesignSystemGenerator, Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Select best matching result based on priority keywords.

### Community 56 - "team-page.tsx"
Cohesion: 0.14
Nodes (19): KpiCard(), KpiCardProps, TeamTable(), buildAverageSubLine(), buildShareAverageSubLine(), buildTeamKpiCards(), getPeriodDayCount(), getPeriodHeadingLabels() (+11 more)

### Community 57 - "_select_palette_for_mode"
Cohesion: 0.22
Nodes (10): _contrast_ratio(), _derive_dark_palette(), _palette_is_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable., True when a colors.csv row's Background is a dark surface., WCAG contrast ratio for two hex colors, or None if either is invalid., Keep product brand tokens while deriving accessible dark surfaces., Pick the highest-ranked palette matching the resolved mode. Only the dark case… (+2 more)

### Community 58 - "4. User Account Management (Manager Only)"
Cohesion: 0.29
Nodes (7): 4. User Account Management (Manager Only), `DELETE /api/users/<id>`, `GET /api/users`, `POST /api/users`, `POST /api/users/<id>/activate`, `POST /api/users/<id>/deactivate`, `POST /api/users/<id>/update`

### Community 59 - "design_system.py"
Cohesion: 0.18
Nodes (15): _detect_page_type(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), persist_design_system(), Path, Format design system as MASTER.md with hierarchical override logic., Format a page-specific override file with intelligent AI-generated content. (+7 more)

### Community 60 - "app/__init__.py"
Cohesion: 0.17
Nodes (14): BaseConfig, DevConfig, ProdConfig, create_app(), create_initial_manager(), Flask, Flask, register_static_routes() (+6 more)

### Community 61 - "Design Screens"
Cohesion: 0.25
Nodes (7): Checklist before reporting done, Design Screens, Guardrails, Screen file rules, Steps, The design brain, Thinking rules (apply while designing)

### Community 62 - "Write Screens"
Cohesion: 0.25
Nodes (7): Guardrails, Input, Steps, Template, The balance (most important rule), Write Screens, Writing rules

### Community 63 - "Manager View (web)"
Cohesion: 0.13
Nodes (14): Manager View (web), Salesperson View (Android app "Apex Sales Call"), Screen 1: Login, Screen 2: Dashboard - home after login, Screen 2b: Team, Screen 3: Person View, Screen 4: Leads, Screen 5: Accounts (+6 more)

### Community 64 - "Sales Call Tracker — Backend"
Cohesion: 0.33
Nodes (5): One-time setup, Run tests, Sales Call Tracker — Backend, Start the server (local, Windows), Start the server (production, Render)

### Community 65 - "Requirements"
Cohesion: 0.33
Nodes (5): Purpose, Requirement: Team totals include deactivated people's calls, Requirements, Scenario: Deactivated person's calls still counted, Scenario: IST day boundary respected

### Community 66 - "API Specifications"
Cohesion: 0.15
Nodes (12): 1. Authentication, 2. Call Sync, 3. Dashboards, 5. Leads, API Specifications, `GET /api/dashboard/person/<id>`, `GET /api/dashboard/team`, `GET /api/leads/summary` (+4 more)

### Community 67 - "accounts-table.tsx"
Cohesion: 0.11
Nodes (17): getAccounts(), AccountRowActionsProps, AccountRowProps, AccountsTable(), AccountsTableProps, AccountStatusTagsProps, DeleteAccountButtonProps, DesktopAccountsTableProps (+9 more)

### Community 68 - "settings-screen.tsx"
Cohesion: 0.25
Nodes (6): DialogContent(), buildDeleteMessage(), ClearConfirmDialog(), ClearConfirmDialogProps, ClearDataRowProps, SettingsHeaderProps

### Community 69 - "deny"
Cohesion: 0.11
Nodes (19): deny, Bash(git push:*), CronCreate, CronDelete, CronList, EnterPlanMode, EnterWorktree, ExitPlanMode (+11 more)

### Community 70 - "use-call-tracker.ts"
Cohesion: 0.29
Nodes (11): AuthenticatedApp(), readOldestIntentTimeMs(), readRecentCallLogEntries(), runCallLogMatchAttempt(), scheduleCallLogMatchRetries(), startCallTracking(), stopCallTracking(), useCallTracker() (+3 more)

### Community 71 - "use-sync.ts"
Cohesion: 0.22
Nodes (14): AppNavigator(), SyncCall, syncCalls(), runJanitorSweep(), useJanitor(), deleteSentPendingCalls(), runJanitorThenSync(), sendFilledPendingCalls() (+6 more)

### Community 72 - "components.json"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, rsc, $schema (+7 more)

### Community 73 - "use-automated-calling.ts"
Cohesion: 0.22
Nodes (13): fetchNextLead(), isServedLead(), LeadScheduleRequest, NextLeadResponseBody, ServedLead, AutomatedViewState, buildScheduleRequest(), LeadOutcome (+5 more)

### Community 74 - "dialer-screen.tsx"
Cohesion: 0.13
Nodes (10): Icon(), IconProps, TextClassContext, PermissionBanner(), PermissionBannerProps, UseAutomatedCallingResult, DialerSubTab, KeypadView() (+2 more)

### Community 75 - "THEME — Apex Sales Call (v2 light)"
Cohesion: 0.17
Nodes (11): Color tokens, Components, Density, Fonts, Icons, Layout patterns, Manager web (--P screens), Motion (+3 more)

### Community 76 - "Steps"
Cohesion: 0.15
Nodes (12): 1. Gather — never re-ask what is already settled, 2. Sort — each fact goes to exactly one file, 3. Write — by the rules below, Current truth, not history, Independent entries, Log Decisions — the recorder, One fact, one place, Precondition (+4 more)

### Community 77 - "pending-calls-db.ts"
Cohesion: 0.21
Nodes (19): ClearLocalDataState, useClearLocalData(), addPendingCallAttempt(), clearAllPendingCalls(), countPendingCalls(), deletePendingCall(), getAllPendingCalls(), getUnfilledPendingCalls() (+11 more)

### Community 78 - "text.tsx"
Cohesion: 0.22
Nodes (9): ARIA_LEVEL, ROLE, Text(), TextVariant, TextVariantProps, textVariants, Keypad(), keypadCharacters (+1 more)

### Community 79 - "1. PostgreSQL Tables"
Cohesion: 0.18
Nodes (10): 1. PostgreSQL Tables, 2. Android Local Phone Database (SQLite), 3. Migrations & Rollback, `calls`, Database Schema & Design, `leads`, `office_hours`, Overview (+2 more)

### Community 80 - "app/tsconfig.json"
Cohesion: 0.17
Nodes (11): compilerOptions, paths, types, exclude, extends, include, **/node_modules, **/Pods (+3 more)

### Community 81 - "auth/services.py"
Cohesion: 0.20
Nodes (14): login(), post, Response, LoginRequest, LoginResponse, BaseModel, field_validator, authenticate_user() (+6 more)

### Community 82 - "use-janitor.ts"
Cohesion: 0.29
Nodes (11): completeStalePendingCalls(), getIntentTimeMs(), getOldestIntentTimeMs(), isStaleUnfilledPendingCall(), loadCallLogEntriesSince(), startJanitorSweep(), strikeUnmatchedPendingCalls(), sweepStalePendingCalls() (+3 more)

### Community 83 - "1. Backend Automated Tests (`backend/tests/`)"
Cohesion: 0.20
Nodes (9): 1. Backend Automated Tests (`backend/tests/`), 2. Mobile Android Spike Checklist, Testing Specifications, `tests/modules/test_auth.py`, `tests/modules/test_calls.py`, `tests/modules/test_dashboard.py`, `tests/modules/test_leads.py`, `tests/modules/test_settings.py` (+1 more)

### Community 84 - "Requirements"
Cohesion: 0.07
Nodes (28): Purpose, Requirement: Accounts list header and own-row marker, Requirement: Activate account, Requirement: Create salesperson account, Requirement: Deactivate account, Requirement: Delete account permanently, Requirement: Edit account, Requirement: List all accounts (+20 more)

### Community 85 - "App.tsx"
Cohesion: 0.47
Nodes (3): App(), displayName, name

### Community 86 - "Requirement: Office-hours gate at call sync"
Cohesion: 0.10
Nodes (20): Purpose, Requirement: No retroactive cleanup, Requirement: Office-hours gate at call sync, Requirement: Single office-hours window, Requirement: Window update validation, Requirements, Scenario: Applies to every day of the week, Scenario: Call's start time decides (+12 more)

### Community 87 - "User"
Cohesion: 0.29
Nodes (20): hash_password(), reset_lockout_state(), User, clean_lockout_state(), fixture, Flask, FlaskClient, test_login_counter_reset_on_success() (+12 more)

### Community 88 - "Design Systems from DESIGN.md"
Cohesion: 0.10
Nodes (21): Contents, Coverage check, Dark mode, Design Systems from DESIGN.md, Elevation, Focus, Fonts, Inputs to Confirm (+13 more)

### Community 89 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, axios, nativewind, @react-navigation/bottom-tabs, axios, nativewind, @react-navigation/bottom-tabs

### Community 90 - "call-log-matcher.ts"
Cohesion: 0.24
Nodes (14): readStoredCountry(), useDialer(), UseDialerResult, useStoredCountry(), doesEntryMatchPendingCall(), findMatchingEntryIndex(), isEntryWithinMatchWindow(), isOutgoingCallEntry() (+6 more)

### Community 91 - "errors.py"
Cohesion: 0.18
Nodes (14): Flask, register_error_handlers(), Any, require_auth(), Response, sync_calls(), BaseModel, SyncCallsRequest (+6 more)

### Community 92 - "MainActivity"
Cohesion: 0.33
Nodes (3): MainActivity, ReactActivity, ReactActivityDelegate

### Community 93 - "MainApplication"
Cohesion: 0.33
Nodes (4): MainApplication, Application, ReactApplication, ReactHost

### Community 94 - "formatCount"
Cohesion: 0.14
Nodes (19): buildAverageCardSubLine(), buildPersonKpiCards(), formatActiveDaysOutOfPeriod(), formatAveragePerActiveDay(), formatAveragePerPersonPerDay(), formatYesterdayComparison(), buildPoolStages(), getStageWidthPercent() (+11 more)

### Community 95 - "Apex Sales Call (Android)"
Cohesion: 0.33
Nodes (5): Apex Sales Call (Android), API base URL, Build the APK, Install on a phone, Requirements

### Community 96 - "._apply_reasoning"
Cohesion: 0.24
Nodes (8): Find matching reasoning rule for a category., Apply reasoning rules to search results., apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), Return deterministic mutations and an audit trail; never execute data., Parse the canonical condition -> action-array representation., _validate_action()

### Community 97 - "The Design System Page"
Cohesion: 0.10
Nodes (21): Block anatomy, Checklist, Color roles, Components: Tiers and Block Anatomy, Contents, Do and Don't, Edge Cases, Elevation (+13 more)

### Community 98 - "screenshot.py"
Cohesion: 0.46
Nodes (7): find_marker_width(), find_screen_files(), main(), parse_arguments(), Namespace, Path, screenshot_all_screens()

### Community 100 - "Stacks — Library Catalog"
Cohesion: 0.29
Nodes (6): How this file is used, JS libraries, Python libraries, React Native (native CLI) libraries, Services & Tools, Stacks — Library Catalog

### Community 101 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 102 - "Project File Structure"
Cohesion: 0.22
Nodes (9): 1. Backend (`backend/`) — Python / Flask Modular Monolith, 1. Mobile App (`app/`) — Android Sideloaded APK, 2. Manager Web Dashboard (`web/`) — React + TypeScript, 2. Web Dashboard (`web/`) — Manager Web App, 3. Backend (`backend/`) — Python Flask API, 3. Salesperson Mobile App (`app/`) — React Native (Bare CLI) + TypeScript, Architecture Overview, Project File Structure (+1 more)

### Community 103 - "metro.config.js"
Cohesion: 0.50
Nodes (3): config, { getDefaultConfig, mergeConfig }, { withNativeWind }

### Community 104 - "AGENTS.md"
Cohesion: 0.20
Nodes (9): Env Files, Language, Private Folder, Rules, Search, Source of Truth (No Guessing), Tasks, Timelines (+1 more)

### Community 111 - "Commands"
Cohesion: 0.12
Nodes (17): `add` — Add components, `apply` — Apply a preset to an existing project, `build` — Build a custom registry, Commands, Contents, `diff` — Check for updates, `docs` — Get component documentation URLs, Dry-Run Mode (+9 more)

### Community 117 - "screens/CLAUDE.md"
Cohesion: 0.20
Nodes (9): Env Files, Language, Private Folder, Rules, Search, Source of Truth (No Guessing), Tasks, Timelines (+1 more)

### Community 129 - "calls-by-hour-chart.tsx"
Cohesion: 0.13
Nodes (20): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+12 more)

### Community 138 - "lead-daily-stats.tsx"
Cohesion: 0.36
Nodes (8): buildComparisonSubLine(), buildPercentChangePill(), LeadDailyStats(), LeadDailyStatsProps, PercentChangePillData, LeadsDailyCount, formatPercentChangeLabel(), getDayOverDayPercentChange()

### Community 139 - "Snap Screens"
Cohesion: 0.50
Nodes (3): Guardrails, Snap Screens, Steps

### Community 140 - "web/src/features/auth/hooks/use-auth.ts"
Cohesion: 0.29
Nodes (8): Input, InputProps, loginUser(), useAuthLogin(), UseAuthLoginResult, LoginPage(), LoginApiResponse, LoginCredentials

### Community 142 - "app/src/components/ui/button.tsx"
Cohesion: 0.31
Nodes (7): Button(), ButtonProps, buttonTextVariants, buttonVariants, LoginResult, loginContentContainerStyle, LoginScreenProps

### Community 143 - "Chief-of-Staff Ledger"
Cohesion: 0.33
Nodes (5): Chief-of-Staff Ledger, Dependency note, FINAL PHASE — COMPLETE, Notes, Task Status

### Community 144 - ".generate"
Cohesion: 0.20
Nodes (7): _filter_anti_patterns_for_mode(), Drop "avoid dark mode" advice once dark mode is the resolved answer., Execute searches across multiple domains., Extract results list from search result dict., Generate complete design system recommendation. variance/motion/density are…, Bucket a 1-10 dial value into its tier config. Returns None if value is None., _resolve_dial()

### Community 145 - "Critical Rules"
Cohesion: 0.25
Nodes (8): Chat & Messaging → [chat.md](./rules/chat.md), CLI, Component Structure → [composition.md](./rules/composition.md), Critical Rules, Forms & Inputs → [forms.md](./rules/forms.md), Icons → [icons.md](./rules/icons.md), Styling & Tailwind → [styling.md](./rules/styling.md), Use Components, Not Custom Markup → [composition.md](./rules/composition.md)

### Community 146 - "tasks.md"
Cohesion: 0.22
Nodes (8): Task 1: Office-hours window storage with manager endpoints, Task 2: Call sync keeps only calls inside office hours, Task 3: Team endpoint returns per-period computed blocks, Task 4: Person endpoint returns per-period computed blocks, Task 5: Team page renders server-computed period blocks, Task 6: Person page renders server-computed stats with the calls-by-hour chart, Task 7: Accounts page gains the office-hours editor, Task 8: My Stats renders returned talk minutes

### Community 147 - "_resolve_color_mode"
Cohesion: 0.33
Nodes (6): _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., _resolve_color_mode(), _style_is_dark_primary()

### Community 148 - "Requirement: Name-and-password login"
Cohesion: 0.09
Nodes (22): Purpose, Requirement: Login brute-force lockout, Requirement: Manager-only web gate, Requirement: Name-and-password login, Requirement: Single active session per user, Requirement: Token-gated API access, Requirements, Scenario: Counter reset on success (+14 more)

### Community 149 - "Requirements"
Cohesion: 0.05
Nodes (36): Purpose, Requirement: Batch sync to server, Requirement: Call-log matching — Path 1 (real-time), Requirement: Call-log matching — Path 2 (janitor), Requirement: Clear local data recovery, Requirement: Dialer intent row created on tap, Requirement: Phone number normalization, Requirement: Server-side call ingestion (+28 more)

### Community 150 - "Proposal: Sales Call Tracker — v1"
Cohesion: 0.25
Nodes (8): Build Order, Capability Map (Modular Breakdown), Impact & Systems Affected, In Scope, Out of Scope (Non-Goals), Proposal: Sales Call Tracker — v1, Scope, Why

### Community 151 - "Customization & Theming"
Cohesion: 0.14
Nodes (14): 1. Built-in variants, 2. Tailwind classes via `className`, 3. Add a new variant, 4. Wrapper components, Adding Custom Colors, Border Radius, Changing the Theme, Checking for Updates (+6 more)

### Community 152 - "test_dashboard.py"
Cohesion: 0.11
Nodes (61): get_ist_timezone(), now_ist(), parse_utc_datetime(), datetime, to_ist(), accumulate_team_call_records(), add_user_talk_seconds(), apply_call_to_hourly_bucket() (+53 more)

### Community 153 - "test_users.py"
Cohesion: 0.21
Nodes (33): create_user_record(), ensure_auxiliary_tables(), Flask, FlaskClient, test_activate_user_non_manager_refused(), test_activate_user_not_found(), test_activate_user_success(), test_create_user_duplicate_name_rejected() (+25 more)

### Community 154 - "AppException"
Cohesion: 0.19
Nodes (24): AppException, require_manager(), activate_user(), create_user(), deactivate_user(), delete_user(), get_users(), get (+16 more)

### Community 155 - "Component Composition"
Cohesion: 0.15
Nodes (13): Avatar always needs AvatarFallback, Button has no isPending or isLoading prop, Callouts use Alert, Card structure, Choosing between overlay components, Component Composition, Contents, Dialog, Sheet, and Drawer always need a Title (+5 more)

### Community 156 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, vite.config.ts, compilerOptions, allowImportingTsExtensions, baseUrl (+16 more)

### Community 157 - "test_leads.py"
Cohesion: 0.17
Nodes (48): now_utc(), create_lead_fixture(), create_user_fixture(), Flask, FlaskClient, test_lead_resolution_connected_call_finishes_lead(), test_lead_resolution_ignores_already_done_or_stopped_lead_for_unconnected_calls(), test_lead_resolution_manual_keypad_call_resolves_lead() (+40 more)

### Community 158 - "Styling & Customization"
Cohesion: 0.15
Nodes (13): Built-in variants first, className for layout only, Contents, No manual dark: color overrides, No manual z-index on overlay components, No raw color values for status/state indicators, No space-x-* / space-y-*, Prefer size-* over w-* h-* when equal (+5 more)

### Community 159 - "Tools"
Cohesion: 0.17
Nodes (11): Configuring Registries, Setup, `shadcn:get_add_command_for_items`, `shadcn:get_audit_checklist`, `shadcn:get_item_examples_from_registries`, `shadcn:get_project_registries`, `shadcn:list_items_in_registries`, shadcn MCP Server (+3 more)

### Community 160 - "devDependencies"
Cohesion: 0.11
Nodes (19): @tailwindcss/vite, tw-animate-css, @types/node, @types/react-dom, vite, @vitejs/plugin-react, devDependencies, tailwindcss (+11 more)

### Community 161 - "shadcn/ui"
Cohesion: 0.17
Nodes (12): Component Docs, Examples, and Usage, Component Selection, Current Project Context, Design Systems from DESIGN.md, Detailed References, Key Fields, Key Patterns, Principles (+4 more)

### Community 163 - "dependencies"
Cohesion: 0.12
Nodes (17): lucide-react, react-dom, react-router-dom, recharts, sonner, dependencies, class-variance-authority, lucide-react (+9 more)

### Community 164 - "test_production.py"
Cohesion: 0.41
Nodes (9): Flask, FlaskClient, Path, test_api_route_not_found_returns_json(), test_missing_dist_returns_404(), test_missing_static_asset_returns_404(), test_serve_index_html_on_root(), test_serve_spa_client_route() (+1 more)

### Community 165 - "Chat & Messaging"
Cohesion: 0.18
Nodes (11): Assistant activity uses Trace, Attachments use Attachment, Chat & Messaging, Code and tool output use CodeBlock, Contents, Escape hatch: the scroller hooks, Message rows use Message, Message surfaces use Bubble (+3 more)

### Community 166 - "lead-upload-card.tsx"
Cohesion: 0.16
Nodes (18): Button, ButtonProps, buttonVariants, DialogContent, DialogDescription, DialogOverlay, DialogTitle, AccountFormField (+10 more)

### Community 167 - "router.tsx"
Cohesion: 0.12
Nodes (16): ManagerGuard(), DashboardLayout(), getHighlightedSectionPath(), NavItem, SidebarLink(), SidebarLogoutProps, AppProviders(), AuthContext (+8 more)

### Community 169 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

### Community 170 - "Registry Authoring and Addresses"
Cohesion: 0.22
Nodes (9): Address Schemes, Build and Verify, GitHub Registries, Include, Item Definitions, Mental Model, Registry Authoring and Addresses, Registry Dependencies (+1 more)

### Community 171 - "team-table.tsx"
Cohesion: 0.12
Nodes (27): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow (+19 more)

### Community 172 - "Base vs Radix"
Cohesion: 0.22
Nodes (9): Accordion, Base vs Radix, Button / trigger as non-button element (base only), Composition: asChild (radix) vs render (base), Contents, Select, Select — multiple selection and object values (base only), Slider (+1 more)

### Community 173 - "Forms & Inputs"
Cohesion: 0.25
Nodes (8): Buttons inside inputs use InputGroup + InputGroupAddon, Contents, Field validation and disabled states, FieldSet + FieldLegend for grouping related fields, Forms & Inputs, Forms use FieldGroup + Field, InputGroup requires InputGroupInput/InputGroupTextarea, Option sets (2–7 choices) use ToggleGroup

### Community 174 - "dashboard/types.ts"
Cohesion: 0.19
Nodes (14): getPersonDashboard(), getTeamDashboard(), isValidPersonId(), usePersonStats(), UsePersonStatsResult, useTeamDashboard(), UseTeamDashboardResult, PerformanceSectionProps (+6 more)

### Community 175 - "showcase-coverage.mjs"
Cohesion: 0.29
Nodes (5): components, missing, source, [uiArg, ...roots], uiDir

### Community 176 - "test_foundation.py"
Cohesion: 0.35
Nodes (9): generate_auth_token(), validate_password_strength(), verify_password(), Flask, FlaskClient, test_app_creation(), test_error_handler(), test_security_helpers() (+1 more)

### Community 177 - "color-pair.tsx"
Cohesion: 0.60
Nodes (5): ColorPair(), contrast(), luminance(), toHex(), toRgb()

### Community 178 - "Icons"
Cohesion: 0.40
Nodes (4): Icons, Icons in Button use data-icon attribute, No sizing classes on icons inside components, Pass icons as component objects, not string keys

### Community 179 - "cn"
Cohesion: 0.18
Nodes (15): Card(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), DialogDescription(), DialogFooter() (+7 more)

### Community 180 - "Requirement: Calls-by-hour chart"
Cohesion: 0.40
Nodes (5): Requirement: Calls-by-hour chart, Scenario: Best hour highlighted from the returned value, Scenario: Empty period shows a note, Scenario: Hours span the office-hours window, Scenario: Thirty-day chart renders returned daily averages

### Community 182 - "6. Office Hours Settings (Manager Only)"
Cohesion: 0.67
Nodes (3): 6. Office Hours Settings (Manager Only), `GET /api/settings/office-hours`, `PUT /api/settings/office-hours`

### Community 183 - "accounts.api.ts"
Cohesion: 0.18
Nodes (19): createUser(), CreateUserApiRequest, updateUser(), EditUserModal(), useCreateUser(), UseCreateUserOptions, UseCreateUserResult, getAccountCountry() (+11 more)

### Community 185 - "Requirement: All dashboard math computed server-side"
Cohesion: 0.50
Nodes (4): Requirement: All dashboard math computed server-side, Scenario: Best hour returned, never scanned, Scenario: Minutes returned, never divided on the screen, Scenario: Screens format only

### Community 187 - "Requirement: Dashboard failure and empty states"
Cohesion: 0.50
Nodes (4): Requirement: Dashboard failure and empty states, Scenario: Backend unreachable, Scenario: Login ended, Scenario: No calls yet at all

### Community 188 - "Requirement: Salesperson self view"
Cohesion: 0.50
Nodes (4): Requirement: Salesperson self view, Scenario: Another person's stats refused, Scenario: Server unreachable, Scenario: Tab open fetches fresh

### Community 189 - "Requirement: Team KPI cards"
Cohesion: 0.50
Nodes (4): Requirement: Team KPI cards, Scenario: Not connected rendered as returned, Scenario: Per-person daily average rendered from the response, Scenario: Today delta rendered from vs_yesterday

### Community 190 - "Requirement: Manager-only team dashboard"
Cohesion: 0.67
Nodes (3): Requirement: Manager-only team dashboard, Scenario: Manager access granted, Scenario: Salesperson token rejected

### Community 191 - "Requirement: Most contacted numbers"
Cohesion: 0.67
Nodes (3): Requirement: Most contacted numbers, Scenario: Fewer than five numbers, Scenario: No calls in the last 30 days

### Community 192 - "Requirement: Per-period response shape"
Cohesion: 0.67
Nodes (3): Requirement: Per-period response shape, Scenario: Period object is self-contained, Scenario: Period switch renders one object

### Community 193 - "Requirement: Person calls-by-hour chart"
Cohesion: 0.67
Nodes (3): Requirement: Person calls-by-hour chart, Scenario: Empty period on the person chart, Scenario: Person page renders the shared chart

### Community 194 - "Requirement: Person performance table"
Cohesion: 0.67
Nodes (3): Requirement: Person performance table, Scenario: Connected percent rendered from the response, Scenario: Zero dials in a period

### Community 195 - "Requirement: Person view KPI cards"
Cohesion: 0.67
Nodes (3): Requirement: Person view KPI cards, Scenario: Averages rendered from the response, Scenario: No calls in 30 days

### Community 196 - "Requirement: Team response carries no salesperson rows"
Cohesion: 0.67
Nodes (3): Requirement: Team response carries no salesperson rows, Scenario: Averages still account for every active salesperson, Scenario: No people array in the team response

### Community 197 - "Requirement: Top 5 people by talk time"
Cohesion: 0.67
Nodes (3): Requirement: Top 5 people by talk time, Scenario: Fewer than five contributors, Scenario: More than five contributors

## Knowledge Gaps
- **984 isolated node(s):** `$schema`, `autoMemoryEnabled`, `disableBundledSkills`, `disableWorkflows`, `disableArtifact` (+979 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `app/src/shared/api/api-client.ts` to `web/src/features/auth/hooks/use-auth.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `loginUser()` connect `web/src/features/auth/hooks/use-auth.ts` to `app/src/shared/api/api-client.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `useAuthLogin()` connect `web/src/features/auth/hooks/use-auth.ts` to `getApiErrorMessage`, `router.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `AppException` (e.g. with `DashboardTimeWindows` and `TeamCallAggregates`) actually correct?**
  _`AppException` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `autoMemoryEnabled`, `disableBundledSkills` to the rest of the system?**
  _984 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05868118572292801 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._