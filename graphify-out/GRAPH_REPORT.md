# Graph Report - sales-call-tracker  (2026-09-19)

## Corpus Check
- 66 files · ~176,280 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 787 nodes · 903 edges · 65 communities (58 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0d4e5b64`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server.cjs
- deny
- What You Must Do When Invoked
- 4. Screens — exact contents
- allow
- Dimensions
- grill-for-business/SKILL.md
- Visual Companion Guide
- Before Grill — the problem gate
- tickets.mjs
- Test-Driven Development
- Python Code Style & Standards
- graphify reference: extra exports and benchmark
- helper.js
- CLAUDE.md
- Code Style & Standards
- React Code Style & Standards
- Process
- Brainstorming Ideas Into Designs
- grill-with-openspec/SKILL.md
- stop-server.sh
- templates/proposal.md
- node-js-code-style.md
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
- Requirements
- Requirements
- Requirements
- Requirements
- Requirements
- Requirement: The eight-case checklist
- Requirements
- generate_design_system
- Sales Call Tracker — Task List
- DesignSystemGenerator
- ._apply_reasoning
- _select_palette_for_mode
- .generate
- design_system.py
- Sales Call Tracker — Proposal
- Design Screens
- Write Screens
- Manager View (web)
- _resolve_color_mode

## God Nodes (most connected - your core abstractions)
1. `allow` - 24 edges
2. `search()` - 23 edges
3. `deny` - 19 edges
4. `DesignSystemGenerator` - 15 edges
5. `handleRequest()` - 14 edges
6. `_normalize()` - 12 edges
7. `search_stack()` - 12 edges
8. `What You Must Do When Invoked` - 12 edges
9. `Visual Companion Guide` - 12 edges
10. `_search_csv_detailed()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `_generate_intelligent_overrides()` --calls--> `search()`  [EXTRACTED]
  .claude/skills/design-screens/uiux/scripts/design_system.py → .claude/skills/design-screens/uiux/scripts/core.py

## Import Cycles
- None detected.

## Communities (65 total, 7 thin omitted)

### Community 0 - "server.cjs"
Cohesion: 0.06
Nodes (55): bootstrapPage(), brandMarkup(), broadcast(), browserLauncherForPlatform(), chmodOwnerOnly(), clients, companionUrl(), computeAcceptKey() (+47 more)

### Community 1 - "deny"
Cohesion: 0.07
Nodes (27): autoMemoryEnabled, disableArtifact, disableBundledSkills, disableClaudeAiConnectors, disableRemoteControl, disableWorkflows, permissions, deny (+19 more)

### Community 2 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 3 - "4. Screens — exact contents"
Cohesion: 0.08
Nodes (25): 1. The system in one look, 2. Database structure, 3. API — Flask, 4. Screens — exact contents, 5. Setup, 6. File structure — every file we build, Account management — manager only, api/ — Flask, strict MVC (+17 more)

### Community 4 - "allow"
Cohesion: 0.08
Nodes (24): allow, Agent, Bash(git add:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(git status:*) (+16 more)

### Community 5 - "Dimensions"
Cohesion: 0.08
Nodes (23): 1. File structure & changes, 1. Gather facts — never ask the user for what you can find, 2. API contracts, 2. Say if this is greenfield or brownfield, 3. Classify the blast radius, 3. Database changes, 4. Build the coverage checklist, 4. Failure & edge cases (+15 more)

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

### Community 11 - "Python Code Style & Standards"
Cohesion: 0.20
Nodes (9): Code Quality, Error & Exception Handling, File Structure, Imports, Libraries & Dependencies, MVC Folder Structure, Naming Conventions, Python Code Style & Standards (+1 more)

### Community 12 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 13 - "helper.js"
Cohesion: 0.42
Nodes (7): connect(), nextReconnectDelay(), reloadAfterRecovery(), sessionKey(), setStatus(), showTombstone(), websocketUrl()

### Community 14 - "CLAUDE.md"
Cohesion: 0.25
Nodes (7): Env Files, Language, Rules, Search, Tasks, Timelines, Working Directory

### Community 15 - "Code Style & Standards"
Cohesion: 0.25
Nodes (7): Bug Fixes & Refactoring, Code Quality, Code Style & Standards, Function Length & Structure, Naming & Constants, Parameters, Returns & Data Flow, Starting a New Feature

### Community 16 - "React Code Style & Standards"
Cohesion: 0.25
Nodes (7): File & Component Structure, Folder Structure, Naming Conventions, React Code Style & Standards, Responsive Design, State & Logic Separation, Vocabulary

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

### Community 22 - "node-js-code-style.md"
Cohesion: 0.33
Nodes (5): Error & Exception Handling, File Structure, Function Composition & Layout, Libraries & Dependencies, MVC Folder Structure

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

### Community 46 - "Requirements"
Cohesion: 0.06
Nodes (32): Purpose, Requirement: Complete missed rows on app open (Path 2 — the janitor), Requirement: Dialing works offline, Requirement: Fallback without the call permission, Requirement: Fill the row from the real call (Path 1 — real time), Requirement: Number entry by keypad or paste, Requirement: One tap creates exactly one intent row, Requirement: The Call button only dials valid numbers (+24 more)

### Community 47 - "Requirements"
Cohesion: 0.08
Nodes (25): Purpose, Requirement: Guess limit on passwords, Requirement: Login with name and password, Requirement: No logout endpoint, Requirement: No manager mode in the app, Requirement: Password rule, Requirement: The web is manager-only, Requirement: Token sessions (+17 more)

### Community 48 - "Requirements"
Cohesion: 0.08
Nodes (23): Purpose, Requirement: Create a salesperson, Requirement: Deactivate and activate, Requirement: Edit without losing history, Requirement: Permanent delete, Requirement: The full account list, Requirement: The manager protects themself, Requirements (+15 more)

### Community 49 - "Requirements"
Cohesion: 0.09
Nodes (22): Purpose, Requirement: Clear local data, Requirement: Every call belongs to whoever's token sent it, Requirement: One batch of filled rows only, Requirement: Sync runs on exactly two triggers, Requirement: The queue lives only on the phone, Requirement: The server keeps every row exactly once, Requirements (+14 more)

### Community 50 - "Requirements"
Cohesion: 0.10
Nodes (19): Purpose, Requirement: All day math on the server, Requirement: Display contract for minutes, Requirement: One row per active salesperson, zeros included, Requirement: Software sold placeholder, Requirement: Team totals on open, Requirement: Totals count everyone's calls, Requirements (+11 more)

### Community 51 - "Requirement: The eight-case checklist"
Cohesion: 0.11
Nodes (18): Purpose, Requirement: One phone is enough, Requirement: The eight-case checklist, Requirement: The spike comes first and proves the full chain, Requirement: The spike's code ships, Requirements, Scenario: Case 1 — answered call, Scenario: Case 2 — unanswered dial (+10 more)

### Community 52 - "Requirements"
Cohesion: 0.11
Nodes (17): Purpose, Requirement: My Stats fetches fresh on every tab open, Requirement: Same display contract, Requirement: Three periods with numbers, Requirement: Top 5 numbers, Requirement: Who may see whom, Requirements, Scenario: A normal person (+9 more)

### Community 53 - "generate_design_system"
Cohesion: 0.17
Nodes (12): ansi_ljust(), format_ascii_box(), format_markdown(), generate_design_system(), hex_to_ansi(), Convert hex color to ANSI True Color swatch (██) with fallback., Like str.ljust but accounts for zero-width ANSI escape sequences., Create a Unicode section separator: ├─── NAME ───...┤ (+4 more)

### Community 54 - "Sales Call Tracker — Task List"
Cohesion: 0.17
Nodes (11): 10. Deploy and end-to-end pass, 1. Manual setup — human steps before code starts, 2. Tracking spike — prove the chain on the oldest phone, 3. API foundation, 4. Login and auth, 5. Call sync, 6. Dashboard endpoints, 7. Account endpoints (+3 more)

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
Nodes (15): _detect_page_type(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), persist_design_system(), Format design system as MASTER.md with hierarchical override logic., Format a page-specific override file with intelligent AI-generated content., Generate intelligent overrides based on page type using layered search. Uses… (+7 more)

### Community 60 - "Sales Call Tracker — Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Sales Call Tracker — Proposal, What Changes, Why

### Community 61 - "Design Screens"
Cohesion: 0.25
Nodes (7): Checklist before reporting done, Design Screens, Guardrails, Screen file rules, Steps, The design brain, Thinking rules (apply while designing)

### Community 62 - "Write Screens"
Cohesion: 0.25
Nodes (7): Guardrails, Input, Steps, Template, The balance (most important rule), Write Screens, Writing rules

### Community 63 - "Manager View (web)"
Cohesion: 0.17
Nodes (11): Manager View (web), Salesperson View (Android app "Apex Sales Call"), Screen 1: Login, Screen 2: Team Dashboard - home after login, Screen 3: Person View, Screen 4: Accounts, Screen 5: Login, Screen 6: Dialer - home tab (+3 more)

### Community 64 - "_resolve_color_mode"
Cohesion: 0.33
Nodes (6): _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., _resolve_color_mode(), _style_is_dark_primary()

## Knowledge Gaps
- **423 isolated node(s):** `$schema`, `autoMemoryEnabled`, `disableBundledSkills`, `disableWorkflows`, `disableArtifact` (+418 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `search()` connect `core.py` to `.generate`, `design_system.py`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `DesignSystemGenerator` connect `DesignSystemGenerator` to `._apply_reasoning`, `.generate`, `design_system.py`, `generate_design_system`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `allow` connect `allow` to `deny`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `$schema`, `autoMemoryEnabled`, `disableBundledSkills` to the rest of the system?**
  _423 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05868118572292801 - nodes in this community are weakly interconnected._
- **Should `deny` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._