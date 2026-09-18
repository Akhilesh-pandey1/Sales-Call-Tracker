# Graph Report - sales-call-tracker  (2026-09-18)

## Corpus Check
- 46 files · ~44,588 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 433 nodes · 441 edges · 45 communities (38 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `allow` - 24 edges
2. `deny` - 19 edges
3. `handleRequest()` - 14 edges
4. `What You Must Do When Invoked` - 12 edges
5. `Visual Companion Guide` - 12 edges
6. `/graphify` - 11 edges
7. `Dimensions` - 10 edges
8. `Before Grill — the problem gate` - 10 edges
9. `Python Code Style & Standards` - 9 edges
10. `After Grill — the technical sweep` - 9 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (45 total, 7 thin omitted)

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

## Knowledge Gaps
- **288 isolated node(s):** `$schema`, `autoMemoryEnabled`, `disableBundledSkills`, `disableWorkflows`, `disableArtifact` (+283 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `allow` connect `allow` to `deny`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `permissions` connect `deny` to `allow`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `$schema`, `autoMemoryEnabled`, `disableBundledSkills` to the rest of the system?**
  _288 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05868118572292801 - nodes in this community are weakly interconnected._
- **Should `deny` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `4. Screens — exact contents` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._