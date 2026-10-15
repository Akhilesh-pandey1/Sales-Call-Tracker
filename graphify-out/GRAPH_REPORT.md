# Graph Report - sales-call-tracker  (2026-10-16)

## Corpus Check
- 241 files · ~232,045 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2003 nodes · 3576 edges · 162 communities (127 shown, 35 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c02245e1`
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
- search
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
- decisions.md
- extraction-spec.md
- Write Tickets — Planning and Task Breakdown
- Implement with Pocock
- lead-call-card.tsx
- instructions/proposal.md
- instructions/spec.md
- leads/services.py
- Execution Steps
- core.py
- my-stats-screen.tsx
- use-lead-upload.ts
- Security & Performance Baseline
- Humanizer: remove AI writing patterns
- app/src/shared/api/api-client.ts
- AppException
- text.tsx
- generate_design_system
- app/src/components/ui/button.tsx
- DesignSystemGenerator
- settings-screen.tsx
- design_system.py
- navbar.tsx
- persist_design_system
- pending-calls-db.ts
- Design Screens
- Write Screens
- Manager View (web)
- Sales Call Tracker — Backend
- Requirements
- 4. User Account Management (Manager Only)
- accounts-table.tsx
- cn
- deny
- app-navigator.tsx
- use-call-tracker.ts
- components.json
- use-automated-calling.ts
- dialer-screen.tsx
- calls/services.py
- Steps
- use-janitor.ts
- dashboard/services.py
- Database Schema & Design
- app/tsconfig.json
- _suggest_identities
- Requirement: Batch sync to server
- 1. Backend Automated Tests (`backend/tests/`)
- Requirements
- call-log-matcher.ts
- use-user-status.ts
- Chief-of-Staff Ledger
- use-delete-user.ts
- dependencies
- Requirement: Call-log matching — Path 1 (real-time)
- MainActivity
- MainApplication
- Requirement: Call-log matching — Path 2 (janitor)
- Apex Sales Call (Android)
- Requirement: Phone number normalization
- Requirement: Team dashboard — per-person active salesperson list
- Requirement: Three Android permissions required
- Requirement: Delete account permanently
- Stacks — Library Catalog
- gradlew
- Project File Structure
- metro.config.js
- class-variance-authority
- clsx
- @react-navigation/native
- libphonenumber-js
- lucide-react-native
- react
- react-native
- @react-native-async-storage/async-storage
- react-native-call-detection-android
- react-native-call-log
- @react-native-clipboard/clipboard
- react-native-permissions
- react-native-reanimated
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
- @radix-ui/react-slot
- @types/react
- Tasks: Sales Call Tracker v1 — Remaining Work
- Requirement: Name-and-password login
- Requirements
- agent-doc/proposal.md
- User
- test_users.py
- users/routes.py
- compilerOptions
- test_leads.py
- web/src/features/auth/hooks/use-auth.ts
- devDependencies
- leads/routes.py
- dependencies
- app/__init__.py
- cn
- accounts-page.tsx
- package.json
- person-page.tsx
- clsx
- react-dom
- accounts.api.ts

## God Nodes (most connected - your core abstractions)
1. `AppException` - 37 edges
2. `now_utc()` - 34 edges
3. `User` - 33 edges
4. `create_user_record()` - 31 edges
5. `cn()` - 29 edges
6. `hash_password()` - 29 edges
7. `cn()` - 26 edges
8. `allow` - 24 edges
9. `search()` - 23 edges
10. `create_user_fixture()` - 23 edges

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

## Communities (162 total, 35 thin omitted)

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

### Community 9 - "search"
Cohesion: 0.14
Nodes (21): _exact_match_diagnostic(), _exact_stack_identifier(), _legacy_successor_guidance(), _normalize(), _project_row(), Apply longest-first synonym substitution at token boundaries., Resolve an explicit style identity without opening generic variant ranking., Resolve a deprecated in-domain alias, or expose a cross-domain redirect. (+13 more)

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

### Community 43 - "leads/services.py"
Cohesion: 0.26
Nodes (13): Lead, find_candidate_lead(), get_leads_summary(), get_pool_bucket_counts(), get_salespeople_lead_activity(), get_today_ist_utc_range(), import_leads_csv(), Any (+5 more)

### Community 44 - "Execution Steps"
Cohesion: 0.25
Nodes (7): 1. Read Existing `agent-doc/` Ground Truth, 2. Phase 0: Decompose via Capability Map, 3. Generate Artifacts in Dependency Order, Artifacts Produced in `agent-doc/`, Execution Steps, Output Summary, Write Spec — The Specification Engine

### Community 45 - "core.py"
Cohesion: 0.10
Nodes (31): BM25, _contains_phrase(), detect_domain(), _domain_keywords(), _file_signature(), _get_bm25(), _load_csv(), _load_csv_snapshot() (+23 more)

### Community 46 - "my-stats-screen.tsx"
Cohesion: 0.10
Nodes (19): fetchMyStats(), PeriodStats, PersonStats, TopNumberStats, MyStatsState, useMyStats(), formatConnectedPercent(), formatCount() (+11 more)

### Community 47 - "use-lead-upload.ts"
Cohesion: 0.13
Nodes (22): getLeadsSummary(), uploadLeads(), LeadAgentTable(), LeadPoolStats(), LeadPoolStatsProps, PoolBucket, LeadCountryOption, LeadUploadCard() (+14 more)

### Community 48 - "Security & Performance Baseline"
Cohesion: 0.50
Nodes (3): Performance, Security, Security & Performance Baseline

### Community 49 - "Humanizer: remove AI writing patterns"
Cohesion: 0.05
Nodes (39): 10. Hyphenated pairs everywhere, 11. Passive voice and missing subjects, 12. Overused AI words, 13. Inflated significance, 14. Vague connection or association, 15. Shallow -ing riders, 16. Sales language, 17. Borrowed authority (+31 more)

### Community 50 - "app/src/shared/api/api-client.ts"
Cohesion: 0.12
Nodes (18): App(), displayName, name, RootNavigator(), LoginResponse, requestLogin(), AuthStatus, getLoginErrorMessage() (+10 more)

### Community 51 - "AppException"
Cohesion: 0.19
Nodes (15): AppException, Any, require_auth(), get_person_dashboard(), get_team_dashboard(), get, Response, PeriodStats (+7 more)

### Community 52 - "text.tsx"
Cohesion: 0.22
Nodes (9): ARIA_LEVEL, ROLE, Text(), TextVariant, TextVariantProps, textVariants, Keypad(), keypadCharacters (+1 more)

### Community 53 - "generate_design_system"
Cohesion: 0.29
Nodes (6): format_markdown(), generate_design_system(), Format design system as markdown., Main entry point for design system generation. Args: query: Search query (e.g.,…, format_output(), Format results for Claude consumption (token-optimized)

### Community 54 - "app/src/components/ui/button.tsx"
Cohesion: 0.31
Nodes (7): Button(), ButtonProps, buttonTextVariants, buttonVariants, LoginResult, loginContentContainerStyle, LoginScreenProps

### Community 55 - "DesignSystemGenerator"
Cohesion: 0.12
Nodes (12): DesignSystemGenerator, _filter_anti_patterns_for_mode(), Drop "avoid dark mode" advice once dark mode is the resolved answer., Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Execute searches across multiple domains., Find matching reasoning rule for a category., Select best matching result based on priority keywords. (+4 more)

### Community 56 - "settings-screen.tsx"
Cohesion: 0.25
Nodes (6): DialogContent(), buildDeleteMessage(), ClearConfirmDialog(), ClearConfirmDialogProps, ClearDataRowProps, SettingsHeaderProps

### Community 57 - "design_system.py"
Cohesion: 0.09
Nodes (31): ansi_ljust(), _contrast_ratio(), _derive_dark_palette(), format_ascii_box(), hex_to_ansi(), _palette_is_dark(), _query_wants_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable. (+23 more)

### Community 58 - "navbar.tsx"
Cohesion: 0.31
Nodes (6): DashboardLayout(), NavItem, Badge(), BadgeProps, badgeVariants, Navbar()

### Community 59 - "persist_design_system"
Cohesion: 0.14
Nodes (15): _detect_page_type(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), persist_design_system(), Path, Format design system as MASTER.md with hierarchical override logic., Format a page-specific override file with intelligent AI-generated content. (+7 more)

### Community 60 - "pending-calls-db.ts"
Cohesion: 0.21
Nodes (18): ClearLocalDataState, useClearLocalData(), addPendingCallAttempt(), clearAllPendingCalls(), countPendingCalls(), deletePendingCall(), getAllPendingCalls(), getUnfilledPendingCalls() (+10 more)

### Community 61 - "Design Screens"
Cohesion: 0.25
Nodes (7): Checklist before reporting done, Design Screens, Guardrails, Screen file rules, Steps, The design brain, Thinking rules (apply while designing)

### Community 62 - "Write Screens"
Cohesion: 0.25
Nodes (7): Guardrails, Input, Steps, Template, The balance (most important rule), Write Screens, Writing rules

### Community 63 - "Manager View (web)"
Cohesion: 0.15
Nodes (12): Manager View (web), Salesperson View (Android app "Apex Sales Call"), Screen 1: Login, Screen 2: Team Dashboard - home after login, Screen 3: Person View, Screen 4: Leads, Screen 5: Accounts, Screen 6: Login (+4 more)

### Community 64 - "Sales Call Tracker — Backend"
Cohesion: 0.33
Nodes (5): One-time setup, Run tests, Sales Call Tracker — Backend, Start the server (local, Windows), Start the server (production, Render)

### Community 65 - "Requirements"
Cohesion: 0.10
Nodes (20): Purpose, Requirement: Manager-only team dashboard access, Requirement: Per-person stats (today / yesterday / last 30 days), Requirement: Server-side time calculations, Requirement: Team dashboard — today and yesterday totals, Requirement: Top 5 numbers by talk time, Requirements, Scenario: API returns seconds (+12 more)

### Community 66 - "4. User Account Management (Manager Only)"
Cohesion: 0.10
Nodes (19): 1. Authentication, 2. Call Sync, 3. Dashboards, 4. User Account Management (Manager Only), 5. Leads, API Specifications, `DELETE /api/users/<id>`, `GET /api/dashboard/person/<id>` (+11 more)

### Community 67 - "accounts-table.tsx"
Cohesion: 0.14
Nodes (12): AccountCard(), AccountRowActionsProps, AccountRowProps, AccountsTableProps, AccountStatusTagsProps, DeleteAccountButtonProps, DesktopAccountRow(), DesktopAccountsTableProps (+4 more)

### Community 68 - "cn"
Cohesion: 0.18
Nodes (15): Card(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), DialogDescription(), DialogFooter() (+7 more)

### Community 69 - "deny"
Cohesion: 0.11
Nodes (19): deny, Bash(git push:*), CronCreate, CronDelete, CronList, EnterPlanMode, EnterWorktree, ExitPlanMode (+11 more)

### Community 70 - "app-navigator.tsx"
Cohesion: 0.33
Nodes (5): MainTabs, MainTabsParamList, DialerScreen(), MyStatsScreen(), SettingsScreen()

### Community 71 - "use-call-tracker.ts"
Cohesion: 0.22
Nodes (15): AuthenticatedApp(), fillMatchedPendingCalls(), readOldestIntentTimeMs(), readRecentCallLogEntries(), runCallLogMatchAttempt(), scheduleCallLogMatchRetries(), startCallTracking(), stopCallTracking() (+7 more)

### Community 72 - "components.json"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, rsc, $schema (+7 more)

### Community 73 - "use-automated-calling.ts"
Cohesion: 0.21
Nodes (14): fetchNextLead(), isServedLead(), LeadScheduleRequest, NextLeadResponseBody, ServedLead, AutomatedViewState, buildScheduleRequest(), LeadOutcome (+6 more)

### Community 74 - "dialer-screen.tsx"
Cohesion: 0.13
Nodes (10): Icon(), IconProps, TextClassContext, PermissionBanner(), PermissionBannerProps, UseAutomatedCallingResult, DialerSubTab, KeypadView() (+2 more)

### Community 75 - "calls/services.py"
Cohesion: 0.23
Nodes (11): Call, Response, sync_calls(), BaseModel, SyncCallsRequest, SyncCallsResponse, extract_valid_call(), Any (+3 more)

### Community 76 - "Steps"
Cohesion: 0.15
Nodes (12): 1. Gather — never re-ask what is already settled, 2. Sort — each fact goes to exactly one file, 3. Write — by the rules below, Current truth, not history, Independent entries, Log Decisions — the recorder, One fact, one place, Precondition (+4 more)

### Community 77 - "use-janitor.ts"
Cohesion: 0.17
Nodes (21): AppNavigator(), SyncCall, syncCalls(), markPendingCallFilled(), completeStalePendingCalls(), fillMatchedPendingCalls(), getIntentTimeMs(), getOldestIntentTimeMs() (+13 more)

### Community 78 - "dashboard/services.py"
Cohesion: 0.37
Nodes (12): parse_utc_datetime(), apply_call_to_metrics(), build_top_numbers_list(), calculate_connected_percentage(), calculate_dashboard_time_windows(), create_empty_period_metrics(), DashboardTimeWindows, get_person_dashboard_data() (+4 more)

### Community 79 - "Database Schema & Design"
Cohesion: 0.20
Nodes (9): 1. PostgreSQL Tables, 2. Android Local Phone Database (SQLite), 3. Migrations & Rollback, `calls`, Database Schema & Design, `leads`, Overview, `pending_calls` (+1 more)

### Community 80 - "app/tsconfig.json"
Cohesion: 0.17
Nodes (11): compilerOptions, paths, types, exclude, extends, include, **/node_modules, **/Pods (+3 more)

### Community 81 - "_suggest_identities"
Cohesion: 0.33
Nodes (6): _exact_row_identity(), Suggest complete public identities so a retry can bypass score thresholds., Return non-empty public identities from ordinary and alias fields., Return one row whose stable public identity exactly matches the query., _row_identities(), _suggest_identities()

### Community 82 - "Requirement: Batch sync to server"
Cohesion: 0.40
Nodes (5): Requirement: Batch sync to server, Scenario: Failed sync retains rows, Scenario: Server deduplicates retried rows, Scenario: Successful sync clears sent rows, Scenario: Sync sends only filled rows

### Community 83 - "1. Backend Automated Tests (`backend/tests/`)"
Cohesion: 0.22
Nodes (8): 1. Backend Automated Tests (`backend/tests/`), 2. Mobile Android Spike Checklist, Testing Specifications, `tests/modules/test_auth.py`, `tests/modules/test_calls.py`, `tests/modules/test_dashboard.py`, `tests/modules/test_leads.py`, `tests/modules/test_users.py`

### Community 84 - "Requirements"
Cohesion: 0.11
Nodes (19): Requirement: Activate (re-enable) account, Requirement: Create salesperson account, Requirement: Deactivate account, Requirement: Edit account (name, password, country), Requirement: List all accounts, Requirements, Scenario: All accounts returned, Scenario: Deactivated account cannot log in (+11 more)

### Community 85 - "call-log-matcher.ts"
Cohesion: 0.22
Nodes (15): readStoredCountry(), useDialer(), UseDialerResult, useStoredCountry(), doesEntryMatchPendingCall(), findMatchingEntryIndex(), isEntryWithinMatchWindow(), isOutgoingCallEntry() (+7 more)

### Community 86 - "use-user-status.ts"
Cohesion: 0.24
Nodes (10): activateUser(), deactivateUser(), UserStatusButton(), UserStatusButtonProps, ACCOUNTS_QUERY_KEY, getStatusChangeErrorMessage(), UserStatusApiErrorBody, UserStatusChange (+2 more)

### Community 87 - "Chief-of-Staff Ledger"
Cohesion: 0.22
Nodes (8): ALL 21 TASKS MERGED — FIX PASS IN FLIGHT, Chief-of-Staff Ledger, Dependency map, FINAL PHASE — waiting on Task 17 (sync) only, FINAL REVIEW RESULTS (verdict: DO NOT SHIP as-is — 20 findings), Merge log, Parked concerns, Task Status

### Community 88 - "use-delete-user.ts"
Cohesion: 0.43
Nodes (5): deleteUser(), useDeleteUser(), UseDeleteUserResult, ApiErrorBody, getApiErrorMessage()

### Community 89 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, axios, nativewind, @react-navigation/bottom-tabs, axios, nativewind, @react-navigation/bottom-tabs

### Community 90 - "Requirement: Call-log matching — Path 1 (real-time)"
Cohesion: 0.40
Nodes (5): Requirement: Call-log matching — Path 1 (real-time), Scenario: Incoming call from the same number ignored, Scenario: Normal answered call, Scenario: Two quick calls to the same number, Scenario: Unanswered dial

### Community 92 - "MainActivity"
Cohesion: 0.33
Nodes (3): MainActivity, ReactActivity, ReactActivityDelegate

### Community 93 - "MainApplication"
Cohesion: 0.33
Nodes (4): MainApplication, Application, ReactApplication, ReactHost

### Community 94 - "Requirement: Call-log matching — Path 2 (janitor)"
Cohesion: 0.50
Nodes (4): Requirement: Call-log matching — Path 2 (janitor), Scenario: App killed mid-call — row completed at first open, Scenario: Row give-up after 5 janitor strikes, Scenario: Young rows untouched by janitor

### Community 95 - "Apex Sales Call (Android)"
Cohesion: 0.33
Nodes (5): Apex Sales Call (Android), API base URL, Build the APK, Install on a phone, Requirements

### Community 96 - "Requirement: Phone number normalization"
Cohesion: 0.50
Nodes (4): Requirement: Phone number normalization, Scenario: International number passes through, Scenario: Local-format number normalized, Scenario: Unparseable number stored raw

### Community 97 - "Requirement: Team dashboard — per-person active salesperson list"
Cohesion: 0.40
Nodes (5): Requirement: Team dashboard — per-person active salesperson list, Scenario: Deactivated salesperson excluded from people list, Scenario: Sorted by today's dials, Scenario: Team total can exceed sum of person rows, Scenario: Zero-call salesperson always listed

### Community 98 - "Requirement: Three Android permissions required"
Cohesion: 0.50
Nodes (4): Requirement: Three Android permissions required, Scenario: All permissions granted, Scenario: Any permission denied, Scenario: CALL_PHONE denied — Call button fallback

### Community 99 - "Requirement: Delete account permanently"
Cohesion: 0.50
Nodes (4): Requirement: Delete account permanently, Scenario: Delete releases lead claims, Scenario: Delete removes user and all calls, Scenario: Self-deletion refused

### Community 100 - "Stacks — Library Catalog"
Cohesion: 0.29
Nodes (6): How this file is used, JS libraries, Python libraries, React Native (native CLI) libraries, Services & Tools, Stacks — Library Catalog

### Community 101 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 102 - "Project File Structure"
Cohesion: 0.20
Nodes (9): 1. Backend (`backend/`) — Python / Flask Modular Monolith, 1. Mobile App (`app/`) — Android Sideloaded APK, 2. Manager Web Dashboard (`web/`) — React + TypeScript, 2. Web Dashboard (`web/`) — Manager Web App, 3. Backend (`backend/`) — Python Flask API, 3. Salesperson Mobile App (`app/`) — React Native (Bare CLI) + TypeScript, Architecture Overview, Project File Structure (+1 more)

### Community 103 - "metro.config.js"
Cohesion: 0.50
Nodes (3): config, { getDefaultConfig, mergeConfig }, { withNativeWind }

### Community 146 - "Tasks: Sales Call Tracker v1 — Remaining Work"
Cohesion: 0.09
Nodes (22): Task 10: Manager can delete a salesperson account, Task 11: Android app shell runs on a device, Task 12: Salesperson can log in on the app, Task 13: The app asks for call permissions, Task 14: Dial intents are queued locally in SQLite, Task 15: Real dials are captured from the call log (Path 1), Task 16: Stale queued dials are completed by the janitor (Path 2), Task 17: Queued calls sync to the server (+14 more)

### Community 148 - "Requirement: Name-and-password login"
Cohesion: 0.10
Nodes (19): Purpose, Requirement: Login brute-force lockout, Requirement: Name-and-password login, Requirement: Single active session per user, Requirement: Token-gated API access, Requirements, Scenario: Counter reset on success, Scenario: Deactivated account (+11 more)

### Community 149 - "Requirements"
Cohesion: 0.17
Nodes (12): Requirement: Clear local data recovery, Requirement: Dialer intent row created on tap, Requirement: Server-side call ingestion, Requirements, Scenario: Call button double-tap, Scenario: Call button tapped once, Scenario: Clear cancelled, Scenario: Clear confirmed (+4 more)

### Community 150 - "agent-doc/proposal.md"
Cohesion: 0.18
Nodes (8): Capabilities, Impact, New Capabilities, Proposal: Sales Call Tracker — v1, What Changes, Why, Purpose, Purpose

### Community 152 - "User"
Cohesion: 0.07
Nodes (73): generate_auth_token(), hash_password(), verify_password(), get_ist_timezone(), normalize_phone_number(), now_ist(), datetime, to_ist() (+65 more)

### Community 153 - "test_users.py"
Cohesion: 0.21
Nodes (33): create_user_record(), ensure_auxiliary_tables(), Flask, FlaskClient, test_activate_user_non_manager_refused(), test_activate_user_not_found(), test_activate_user_success(), test_create_user_duplicate_name_rejected() (+25 more)

### Community 154 - "users/routes.py"
Cohesion: 0.21
Nodes (23): require_manager(), validate_password_strength(), activate_user(), create_user(), deactivate_user(), delete_user(), get_users(), get (+15 more)

### Community 156 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, vite.config.ts, compilerOptions, allowImportingTsExtensions, baseUrl (+16 more)

### Community 157 - "test_leads.py"
Cohesion: 0.17
Nodes (45): now_utc(), create_lead_fixture(), create_user_fixture(), Flask, FlaskClient, test_lead_resolution_connected_call_finishes_lead(), test_lead_resolution_ignores_already_done_or_stopped_lead_for_unconnected_calls(), test_lead_resolution_manual_keypad_call_resolves_lead() (+37 more)

### Community 159 - "web/src/features/auth/hooks/use-auth.ts"
Cohesion: 0.40
Nodes (6): loginUser(), useAuthLogin(), UseAuthLoginResult, LoginApiResponse, LoginCredentials, apiClient

### Community 160 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, postcss, @types/node, @types/react-dom, vite, @vitejs/plugin-react, devDependencies, autoprefixer (+9 more)

### Community 162 - "leads/routes.py"
Cohesion: 0.26
Nodes (15): get_next_lead(), get_summary(), get, post, Response, upload_leads(), LeadPoolBucketCounts, LeadsSummaryResponse (+7 more)

### Community 163 - "dependencies"
Cohesion: 0.12
Nodes (17): lucide-react, @radix-ui/react-dialog, react-router-dom, @tanstack/react-query, dependencies, axios, class-variance-authority, lucide-react (+9 more)

### Community 164 - "app/__init__.py"
Cohesion: 0.14
Nodes (25): BaseConfig, DevConfig, ProdConfig, Flask, register_error_handlers(), create_app(), create_initial_manager(), Flask (+17 more)

### Community 166 - "cn"
Cohesion: 0.11
Nodes (26): Button, ButtonProps, buttonVariants, DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay (+18 more)

### Community 167 - "accounts-page.tsx"
Cohesion: 0.10
Nodes (21): ManagerGuard(), AppProviders(), AuthContext, AuthContextType, AuthProvider(), getInitialUser(), queryClient, useAuth() (+13 more)

### Community 169 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

### Community 171 - "person-page.tsx"
Cohesion: 0.06
Nodes (61): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow (+53 more)

### Community 183 - "accounts.api.ts"
Cohesion: 0.14
Nodes (24): createUser(), CreateUserApiRequest, updateUser(), EditUserModal(), CreateUserApiErrorBody, getCreateUserErrorMessage(), useCreateUser(), UseCreateUserOptions (+16 more)

## Knowledge Gaps
- **748 isolated node(s):** `$schema`, `autoMemoryEnabled`, `disableBundledSkills`, `disableWorkflows`, `disableArtifact` (+743 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `app/src/shared/api/api-client.ts` to `web/src/features/auth/hooks/use-auth.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `loginUser()` connect `web/src/features/auth/hooks/use-auth.ts` to `app/src/shared/api/api-client.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useAuthLogin()` connect `web/src/features/auth/hooks/use-auth.ts` to `accounts.api.ts`, `cn`, `accounts-page.tsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `$schema`, `autoMemoryEnabled`, `disableBundledSkills` to the rest of the system?**
  _748 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05868118572292801 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Requirements` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._