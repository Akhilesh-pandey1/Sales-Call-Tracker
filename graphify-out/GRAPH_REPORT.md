# Graph Report - sales-call-tracker  (2026-10-20)

## Corpus Check
- 290 files · ~344,833 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2413 nodes · 4710 edges · 176 communities (138 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b061e688`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server.cjs
- settings.json
- What You Must Do When Invoked
- Requirements
- allow
- Dimensions
- grill-for-business/SKILL.md
- Visual Companion Guide
- Before Grill — the problem gate
- app-navigator.tsx
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
- Sales Call Tracker - Decision Log
- extraction-spec.md
- Write Tasks — Planning and Task Breakdown
- Implement with Pocock
- test_foundation.py
- instructions/proposal.md
- instructions/spec.md
- AppException
- Execution Steps
- core.py
- my-stats-screen.tsx
- lead-pool-stats.tsx
- Security & Performance Baseline
- Humanizer: remove AI writing patterns
- app/src/shared/api/api-client.ts
- test_dashboard.py
- test_leads.py
- settings/routes.py
- calls-by-hour-chart.tsx
- DesignSystemGenerator
- person-page.tsx
- 6. Office Hours Settings (Manager Only)
- 4. User Account Management (Manager Only)
- settings-page.tsx
- app/__init__.py
- Design Screens
- Write Screens
- Manager View (web)
- Sales Call Tracker — Backend
- Requirements
- API Specifications
- test_production.py
- react
- deny
- use-janitor.ts
- tracking/index.ts
- components.json
- use-lead-post-call.ts
- dialer-screen.tsx
- THEME — Apex Sales Call (v2 light)
- Steps
- test_calls.py
- dashboard/services.py
- 1. PostgreSQL Tables
- app/tsconfig.json
- auth/services.py
- accounts-table.tsx
- 1. Backend Automated Tests (`backend/tests/`)
- Requirements
- call-submit.ts
- Requirement: Office-hours gate at call sync
- errors.py
- getApiErrorMessage
- use-call-tracker.ts
- react-native-intent-launcher
- MainActivity
- MainApplication
- Apex Sales Call (Android)
- design_system.py
- screenshot.py
- react-native-intent-launcher.d.ts
- Stacks — Library Catalog
- gradlew
- Project File Structure
- metro.config.js
- use-dialer.ts
- seed_fake_data.py
- persist_design_system
- search
- react-native-svg
- @react-native-async-storage/async-storage
- nativewind
- dependencies
- @react-native-clipboard/clipboard
- react-native-permissions
- react-native-safe-area-context
- @react-navigation/bottom-tabs
- clsx
- react-native-worklets
- @rn-primitives/slot
- tailwind-merge
- tailwindcss-animate
- app/tailwind.config.js
- react-native-reanimated
- @tanstack/react-query
- class-variance-authority
- Snap Screens
- dashboard.api.ts
- tasks.md
- clsx
- Requirement: Name-and-password login
- Requirements
- Proposal: Sales Call Tracker — v1
- class-variance-authority
- test_users.py
- User
- compilerOptions
- react-native
- react-native-call-detection-android
- react-native-call-log
- devDependencies
- team-people-table.tsx
- test_settings.py
- dependencies
- react-native-sqlite-storage
- @react-navigation/native
- cn
- router.tsx
- @rn-primitives/dialog
- package.json
- @rn-primitives/portal
- generate_design_system
- lucide-react-native
- native-only-animated-view.tsx
- _suggest_identities
- @radix-ui/react-dialog
- Requirement: Calls-by-hour chart
- accounts.api.ts
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
- @radix-ui/react-slot

## God Nodes (most connected - your core abstractions)
1. `AppException` - 46 edges
2. `User` - 45 edges
3. `cn()` - 40 edges
4. `hash_password()` - 35 edges
5. `now_ist()` - 31 edges
6. `create_user_record()` - 31 edges
7. `formatCount()` - 29 edges
8. `cn()` - 28 edges
9. `create_user_fixture()` - 28 edges
10. `now_utc()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `useAuth()` --indirect_call--> `loginUser()`  [INFERRED]
  app/src/features/auth/hooks/use-auth.ts → web/src/features/auth/api/auth.api.ts
- `TestConfig` --uses--> `BaseConfig`  [INFERRED]
  backend/tests/conftest.py → backend/app/config/base.py
- `DashboardTimeWindows` --uses--> `AppException`  [INFERRED]
  backend/app/modules/dashboard/services.py → backend/app/core/errors.py
- `PeopleCallMetrics` --uses--> `AppException`  [INFERRED]
  backend/app/modules/dashboard/services.py → backend/app/core/errors.py
- `PeriodHourlyInputs` --uses--> `AppException`  [INFERRED]
  backend/app/modules/dashboard/services.py → backend/app/core/errors.py

## Import Cycles
- None detected.

## Communities (176 total, 38 thin omitted)

### Community 0 - "server.cjs"
Cohesion: 0.06
Nodes (55): bootstrapPage(), brandMarkup(), broadcast(), browserLauncherForPlatform(), chmodOwnerOnly(), clients, companionUrl(), computeAcceptKey() (+47 more)

### Community 1 - "settings.json"
Cohesion: 0.18
Nodes (10): autoMemoryEnabled, disableArtifact, disableBundledSkills, disableClaudeAiConnectors, disableRemoteControl, disableWorkflows, hooks, PreToolUse (+2 more)

### Community 2 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 3 - "Requirements"
Cohesion: 0.06
Nodes (35): Purpose, Requirement: CSV upload into lead pool, Requirement: Lead claim window, Requirement: Lead pool manager summary, Requirement: Lead resolution via call sync, Requirement: Lead scheduling, Requirement: Lead state is authoritative and server-stored, Requirement: Next-lead serving — priority order (+27 more)

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

### Community 9 - "app-navigator.tsx"
Cohesion: 0.18
Nodes (10): AppNavigator(), DialerTabIcon, MainTabs, MyStatsTabIcon, SettingsTabIcon, TabBarIconComponent, TabIconProps, MainTabsParamList (+2 more)

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

### Community 35 - "Sales Call Tracker - Decision Log"
Cohesion: 0.20
Nodes (7): Round 2, Round 3, Round 4, Round 5, Round 6, Round 7, Sales Call Tracker - Decision Log

### Community 37 - "Write Tasks — Planning and Task Breakdown"
Cohesion: 0.10
Nodes (19): Common Rationalizations (Banned Shortcuts), Never Overwrite an Incomplete Plan, No Manual or Deployment Work in Tasks, Output File & Protection Rules, Output Summary, Overview, Parallelization Opportunities (Parallel vs Sequential Guidance), Pre-Handoff Verification (+11 more)

### Community 39 - "Implement with Pocock"
Cohesion: 0.40
Nodes (4): 1. Single Source of Truth (No Guessing / No Assumptions), 2. Implementation Loop, 3. Review & Commit, Implement with Pocock

### Community 40 - "test_foundation.py"
Cohesion: 0.23
Nodes (13): generate_auth_token(), validate_password_strength(), verify_password(), update_user_account(), Flask, FlaskClient, Path, test_app_creation() (+5 more)

### Community 43 - "AppException"
Cohesion: 0.21
Nodes (22): AppException, require_manager(), activate_user(), create_user(), deactivate_user(), delete_user(), get_users(), get (+14 more)

### Community 44 - "Execution Steps"
Cohesion: 0.25
Nodes (7): 1. Read Existing `agent-doc/` Ground Truth, 2. Phase 0: Decompose via Capability Map, 3. Generate Artifacts in Dependency Order, Artifacts Produced in `agent-doc/`, Execution Steps, Output Summary, Write Spec — The Specification Engine

### Community 45 - "core.py"
Cohesion: 0.10
Nodes (31): BM25, _contains_phrase(), detect_domain(), _domain_keywords(), _file_signature(), _get_bm25(), _load_csv(), _load_csv_snapshot() (+23 more)

### Community 46 - "my-stats-screen.tsx"
Cohesion: 0.06
Nodes (37): AveragePerActiveDayStats, CallsByHourStats, fetchMyStats(), Last30DaysStats, PeriodStats, PersonStats, MyStatsState, useMyStats() (+29 more)

### Community 47 - "lead-pool-stats.tsx"
Cohesion: 0.07
Nodes (38): getLeadsSummary(), uploadLeads(), buildComparisonSubLine(), buildPercentChangePill(), LeadDailyStats(), LeadDailyStatsProps, PercentChangePillData, buildPoolStages() (+30 more)

### Community 48 - "Security & Performance Baseline"
Cohesion: 0.50
Nodes (3): Performance, Security, Security & Performance Baseline

### Community 49 - "Humanizer: remove AI writing patterns"
Cohesion: 0.05
Nodes (39): 10. Hyphenated pairs everywhere, 11. Passive voice and missing subjects, 12. Overused AI words, 13. Inflated significance, 14. Vague connection or association, 15. Shallow -ing riders, 16. Sales language, 17. Borrowed authority (+31 more)

### Community 50 - "app/src/shared/api/api-client.ts"
Cohesion: 0.12
Nodes (17): App(), displayName, name, RootNavigator(), LoginResponse, requestLogin(), AuthStatus, LoginResult (+9 more)

### Community 51 - "test_dashboard.py"
Cohesion: 0.14
Nodes (60): now_ist(), create_call_record(), create_call_records_bulk(), create_user_fixture(), create_utc_call_time(), fetch_team_dashboard(), fetch_team_people(), create_call_record() (+52 more)

### Community 52 - "test_leads.py"
Cohesion: 0.27
Nodes (31): now_utc(), create_lead_fixture(), create_user_fixture(), datetime, Flask, FlaskClient, test_next_lead_claimed_on_serve_and_expires(), test_next_lead_continue_calling_false_serves_no_lead() (+23 more)

### Community 53 - "settings/routes.py"
Cohesion: 0.19
Nodes (16): OfficeHours, get_office_hours(), get, Response, refuse_non_manager(), update_office_hours(), OfficeHoursResponse, BaseModel (+8 more)

### Community 54 - "calls-by-hour-chart.tsx"
Cohesion: 0.11
Nodes (23): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+15 more)

### Community 55 - "DesignSystemGenerator"
Cohesion: 0.12
Nodes (12): DesignSystemGenerator, _filter_anti_patterns_for_mode(), Drop "avoid dark mode" advice once dark mode is the resolved answer., Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Execute searches across multiple domains., Find matching reasoning rule for a category., Select best matching result based on priority keywords. (+4 more)

### Community 56 - "person-page.tsx"
Cohesion: 0.06
Nodes (64): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow (+56 more)

### Community 57 - "6. Office Hours Settings (Manager Only)"
Cohesion: 0.67
Nodes (3): 6. Office Hours Settings (Manager Only), `GET /api/settings/office-hours`, `PUT /api/settings/office-hours`

### Community 58 - "4. User Account Management (Manager Only)"
Cohesion: 0.29
Nodes (7): 4. User Account Management (Manager Only), `DELETE /api/users/<id>`, `GET /api/users`, `POST /api/users`, `POST /api/users/<id>/activate`, `POST /api/users/<id>/deactivate`, `POST /api/users/<id>/update`

### Community 59 - "settings-page.tsx"
Cohesion: 0.25
Nodes (7): DashboardPage(), OfficeHoursEditor(), SettingsPage(), PageHeader(), PageHeaderProps, TodaysDateAction(), getTodaysDateLabel()

### Community 60 - "app/__init__.py"
Cohesion: 0.21
Nodes (15): BaseConfig, DevConfig, ProdConfig, create_app(), create_initial_manager(), ensure_calls_outcome_column(), Flask, Flask (+7 more)

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
Cohesion: 0.14
Nodes (13): 1. Authentication, 2. Call Sync, 3. Dashboards, 5. Leads, API Specifications, `GET /api/dashboard/person/<id>`, `GET /api/dashboard/team`, `GET /api/dashboard/team/people` (+5 more)

### Community 67 - "test_production.py"
Cohesion: 0.47
Nodes (9): Flask, FlaskClient, Path, test_api_route_not_found_returns_json(), test_missing_dist_returns_404(), test_missing_static_asset_returns_404(), test_serve_index_html_on_root(), test_serve_spa_client_route() (+1 more)

### Community 69 - "deny"
Cohesion: 0.11
Nodes (19): deny, Bash(git push:*), CronCreate, CronDelete, CronList, EnterPlanMode, EnterWorktree, ExitPlanMode (+11 more)

### Community 70 - "use-janitor.ts"
Cohesion: 0.18
Nodes (20): markPendingCallFilled(), completeStalePendingCalls(), getIntentTimeMs(), getOldestIntentTimeMs(), isStaleUnfilledPendingCall(), loadCallLogEntriesSince(), startJanitorSweep(), strikeUnmatchedPendingCalls() (+12 more)

### Community 71 - "tracking/index.ts"
Cohesion: 0.22
Nodes (18): ClearLocalDataState, useClearLocalData(), addOutcomeColumnWhenMissing(), addPendingCallAttempt(), clearAllPendingCalls(), countPendingCalls(), deletePendingCall(), getAllPendingCalls() (+10 more)

### Community 72 - "components.json"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, rsc, $schema (+7 more)

### Community 73 - "use-lead-post-call.ts"
Cohesion: 0.11
Nodes (29): getLoginErrorMessage(), buildNextLeadRequestBody(), fetchNextLead(), isServedLead(), LeadScheduleRequest, NextLeadRequestBody, NextLeadResponseBody, ServedLead (+21 more)

### Community 74 - "dialer-screen.tsx"
Cohesion: 0.05
Nodes (63): Button(), ButtonProps, buttonTextVariants, buttonVariants, Card(), CardContent(), CardDescription(), CardFooter() (+55 more)

### Community 75 - "THEME — Apex Sales Call (v2 light)"
Cohesion: 0.17
Nodes (11): Color tokens, Components, Density, Fonts, Icons, Layout patterns, Manager web (--P screens), Motion (+3 more)

### Community 76 - "Steps"
Cohesion: 0.11
Nodes (17): 1. Gather — never re-ask what is already settled, 2. Sort — each fact goes to exactly one file, 3. Write — by the rules below, `api.md` — one endpoint per section, Current truth, not history, `database.md` — field table, File formats — every file follows this exact shape, Independent entries (+9 more)

### Community 77 - "test_calls.py"
Cohesion: 0.30
Nodes (26): build_ist_dialed_at(), create_lead_fixture(), create_user_fixture(), Flask, FlaskClient, test_lead_resolution_connected_call_finishes_lead(), test_lead_resolution_ignores_already_done_or_stopped_lead_for_unconnected_calls(), test_lead_resolution_manual_keypad_call_resolves_lead() (+18 more)

### Community 78 - "dashboard/services.py"
Cohesion: 0.09
Nodes (66): parse_utc_datetime(), get_person_dashboard(), get_team_dashboard(), get_team_people(), Any, get, Response, require_dashboard_manager() (+58 more)

### Community 79 - "1. PostgreSQL Tables"
Cohesion: 0.18
Nodes (10): 1. PostgreSQL Tables, 2. Android Local Phone Database (SQLite), 3. Migrations & Rollback, `calls`, Database Schema & Design, `leads`, `office_hours`, Overview (+2 more)

### Community 80 - "app/tsconfig.json"
Cohesion: 0.15
Nodes (12): compilerOptions, paths, types, exclude, extends, include, nativewind-env.d.ts, **/node_modules (+4 more)

### Community 81 - "auth/services.py"
Cohesion: 0.20
Nodes (14): login(), post, Response, LoginRequest, LoginResponse, BaseModel, field_validator, authenticate_user() (+6 more)

### Community 82 - "accounts-table.tsx"
Cohesion: 0.14
Nodes (14): AccountCard(), AccountPersonPageOpenState, AccountRowActionsProps, AccountRowProps, AccountsTable(), AccountsTableProps, DeleteAccountButtonProps, DesktopAccountRow() (+6 more)

### Community 83 - "1. Backend Automated Tests (`backend/tests/`)"
Cohesion: 0.18
Nodes (10): 1. Backend Automated Tests (`backend/tests/`), 2. Mobile Android Spike Checklist, 3. App Calling & Navigation — Manual On-Device Pass, Testing Specifications, `tests/modules/test_auth.py`, `tests/modules/test_calls.py`, `tests/modules/test_dashboard.py`, `tests/modules/test_leads.py` (+2 more)

### Community 84 - "Requirements"
Cohesion: 0.07
Nodes (28): Purpose, Requirement: Accounts list header and own-row marker, Requirement: Activate account, Requirement: Create salesperson account, Requirement: Deactivate account, Requirement: Delete account permanently, Requirement: Edit account, Requirement: List all accounts (+20 more)

### Community 85 - "call-submit.ts"
Cohesion: 0.25
Nodes (14): SyncCall, syncCalls(), runJanitorSweep(), deleteSentPendingCalls(), runJanitorThenSync(), sendFilledPendingCalls(), sendFilledPendingCallsSafely(), syncPendingCalls() (+6 more)

### Community 86 - "Requirement: Office-hours gate at call sync"
Cohesion: 0.10
Nodes (20): Purpose, Requirement: No retroactive cleanup, Requirement: Office-hours gate at call sync, Requirement: Single office-hours window, Requirement: Window update validation, Requirements, Scenario: Applies to every day of the week, Scenario: Call's start time decides (+12 more)

### Community 87 - "errors.py"
Cohesion: 0.22
Nodes (10): Flask, register_error_handlers(), Any, require_auth(), Response, sync_calls(), BaseModel, SyncCallsRequest (+2 more)

### Community 88 - "getApiErrorMessage"
Cohesion: 0.14
Nodes (19): activateUser(), deactivateUser(), UserStatusButton(), UserStatusButtonProps, UserStatusChange, useUserStatus(), UseUserStatusResult, getOfficeHours() (+11 more)

### Community 89 - "use-call-tracker.ts"
Cohesion: 0.22
Nodes (9): AuthenticatedApp(), startCallTracking(), stopCallTracking(), useCallTracker(), findMissingPermissions(), usePermissions(), callEndedEvent, SyncEvent (+1 more)

### Community 92 - "MainActivity"
Cohesion: 0.33
Nodes (3): MainActivity, ReactActivity, ReactActivityDelegate

### Community 93 - "MainApplication"
Cohesion: 0.33
Nodes (4): MainApplication, Application, ReactApplication, ReactHost

### Community 95 - "Apex Sales Call (Android)"
Cohesion: 0.33
Nodes (5): Apex Sales Call (Android), API base URL, Build the APK, Install on a phone, Requirements

### Community 96 - "design_system.py"
Cohesion: 0.09
Nodes (31): ansi_ljust(), _contrast_ratio(), _derive_dark_palette(), format_ascii_box(), hex_to_ansi(), _palette_is_dark(), _query_wants_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable. (+23 more)

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
Cohesion: 0.33
Nodes (4): config, { getDefaultConfig, mergeConfig }, path, { withNativeWind }

### Community 104 - "use-dialer.ts"
Cohesion: 0.32
Nodes (9): readStoredCountry(), useDialer(), UseDialerResult, useStoredCountry(), createCallId(), launchTrackedCall(), rejectAfterTimeout(), isValidPhoneNumber() (+1 more)

### Community 105 - "seed_fake_data.py"
Cohesion: 0.06
Nodes (73): get_ist_timezone(), normalize_phone_number(), datetime, to_ist(), Call, extract_valid_call(), get_ist_start_minute_of_day(), has_invalid_call_duration() (+65 more)

### Community 108 - "persist_design_system"
Cohesion: 0.14
Nodes (15): _detect_page_type(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), persist_design_system(), Path, Format design system as MASTER.md with hierarchical override logic., Format a page-specific override file with intelligent AI-generated content. (+7 more)

### Community 109 - "search"
Cohesion: 0.14
Nodes (21): _exact_match_diagnostic(), _exact_stack_identifier(), _legacy_successor_guidance(), _normalize(), _project_row(), Apply longest-first synonym substitution at token boundaries., Resolve an explicit style identity without opening generic variant ranking., Resolve a deprecated in-domain alias, or expose a cross-domain redirect. (+13 more)

### Community 114 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, axios, libphonenumber-js, react-native-screens, axios, libphonenumber-js, react-native-screens

### Community 139 - "Snap Screens"
Cohesion: 0.50
Nodes (3): Guardrails, Snap Screens, Steps

### Community 142 - "dashboard.api.ts"
Cohesion: 0.23
Nodes (12): getPersonDashboard(), getTeamDashboard(), isValidPersonId(), usePersonStats(), UsePersonStatsResult, useTeamDashboard(), UseTeamDashboardResult, getPersonPageBackTarget() (+4 more)

### Community 146 - "tasks.md"
Cohesion: 0.20
Nodes (9): Task 1: The server creates a lead for a dialed number that has none, Task 2: The sync request carries the popup's schedule answer, Task 3: The post-call popup opens only when the call has truly ended, Task 4: The popup's schedule input becomes a native picker, Task 5: The keypad popup's schedule answer rides the sync request, Task 6: The post-call popup locks until Submit, Task 7: Settings gains a Log out row, Task 8: The My Stats calls-by-hour chart opens on Today (+1 more)

### Community 148 - "Requirement: Name-and-password login"
Cohesion: 0.09
Nodes (22): Purpose, Requirement: Login brute-force lockout, Requirement: Manager-only web gate, Requirement: Name-and-password login, Requirement: Single active session per user, Requirement: Token-gated API access, Requirements, Scenario: Counter reset on success (+14 more)

### Community 149 - "Requirements"
Cohesion: 0.05
Nodes (36): Purpose, Requirement: Batch sync to server, Requirement: Call-log matching — Path 1 (real-time), Requirement: Call-log matching — Path 2 (janitor), Requirement: Clear local data recovery, Requirement: Dialer intent row created on tap, Requirement: Phone number normalization, Requirement: Server-side call ingestion (+28 more)

### Community 150 - "Proposal: Sales Call Tracker — v1"
Cohesion: 0.25
Nodes (8): Build Order, Capability Map (Modular Breakdown), Impact & Systems Affected, In Scope, Out of Scope (Non-Goals), Proposal: Sales Call Tracker — v1, Scope, Why

### Community 153 - "test_users.py"
Cohesion: 0.21
Nodes (33): create_user_record(), ensure_auxiliary_tables(), Flask, FlaskClient, test_activate_user_non_manager_refused(), test_activate_user_not_found(), test_activate_user_success(), test_create_user_duplicate_name_rejected() (+25 more)

### Community 154 - "User"
Cohesion: 0.26
Nodes (20): hash_password(), reset_lockout_state(), User, clean_lockout_state(), fixture, Flask, FlaskClient, test_login_counter_reset_on_success() (+12 more)

### Community 156 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, vite.config.ts, compilerOptions, allowImportingTsExtensions, baseUrl (+16 more)

### Community 160 - "devDependencies"
Cohesion: 0.11
Nodes (19): @tailwindcss/vite, tw-animate-css, @types/node, @types/react-dom, vite, @vitejs/plugin-react, devDependencies, tailwindcss (+11 more)

### Community 161 - "team-people-table.tsx"
Cohesion: 0.13
Nodes (19): getTeamPeople(), TeamEmptyState(), DesktopPersonRow(), DesktopPersonRowProps, formatPeriodNumbers(), PeopleListProps, PersonCard(), PersonCardProps (+11 more)

### Community 162 - "test_settings.py"
Cohesion: 0.53
Nodes (9): create_user_fixture(), Flask, FlaskClient, test_get_office_hours_fresh_database_returns_default_window(), test_office_hours_unauthenticated_rejected(), test_put_office_hours_end_not_after_start_refused(), test_put_office_hours_malformed_body_refused(), test_put_office_hours_saves_window_for_next_read() (+1 more)

### Community 163 - "dependencies"
Cohesion: 0.12
Nodes (17): lucide-react, react-dom, react-router-dom, recharts, sonner, dependencies, axios, lucide-react (+9 more)

### Community 166 - "cn"
Cohesion: 0.11
Nodes (30): Badge(), BadgeProps, badgeVariants, Button, ButtonProps, buttonVariants, DialogContent, DialogDescription (+22 more)

### Community 167 - "router.tsx"
Cohesion: 0.09
Nodes (22): ManagerGuard(), DashboardLayout(), getHighlightedSectionPath(), NavItem, SidebarLink(), SidebarLogoutProps, AppProviders(), AuthContext (+14 more)

### Community 169 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

### Community 171 - "generate_design_system"
Cohesion: 0.29
Nodes (6): format_markdown(), generate_design_system(), Format design system as markdown., Main entry point for design system generation. Args: query: Search query (e.g.,…, format_output(), Format results for Claude consumption (token-optimized)

### Community 177 - "_suggest_identities"
Cohesion: 0.33
Nodes (6): _exact_row_identity(), Suggest complete public identities so a retry can bypass score thresholds., Return non-empty public identities from ordinary and alias fields., Return one row whose stable public identity exactly matches the query., _row_identities(), _suggest_identities()

### Community 180 - "Requirement: Calls-by-hour chart"
Cohesion: 0.40
Nodes (5): Requirement: Calls-by-hour chart, Scenario: Best hour highlighted from the returned value, Scenario: Empty period shows a note, Scenario: Hours span the office-hours window, Scenario: Thirty-day chart renders returned daily averages

### Community 183 - "accounts.api.ts"
Cohesion: 0.12
Nodes (29): createUser(), CreateUserApiRequest, deleteUser(), getAccounts(), updateUser(), DeleteDialog(), EditUserModal(), ACCOUNTS_QUERY_KEY (+21 more)

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
- **848 isolated node(s):** `$schema`, `autoMemoryEnabled`, `disableBundledSkills`, `disableWorkflows`, `disableArtifact` (+843 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `app/src/shared/api/api-client.ts` to `router.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `loginUser()` connect `router.tsx` to `app/src/shared/api/api-client.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useAuthLogin()` connect `router.tsx` to `getApiErrorMessage`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `AppException` (e.g. with `DashboardTimeWindows` and `PeopleCallMetrics`) actually correct?**
  _`AppException` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `autoMemoryEnabled`, `disableBundledSkills` to the rest of the system?**
  _848 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05868118572292801 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._