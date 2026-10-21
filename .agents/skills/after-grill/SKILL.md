---
name: after-grill
description: "Technical sweep after grilling ends — file structure, database, API, failure and edge cases, user flow, config, rollback, testing scope, and the tech stack: one known library per piece, chosen one by one from the stacks catalog. Use right after grilling reached shared understanding, or in a fresh session by reading agent-doc/ as the settled truth, before writing any spec."
disable-model-invocation: true
---

# After Grill — the technical sweep

Grilling settles **what** and **why**. It never forces the engineering surface to be settled — which files change, what happens to the database, what happens when things fail. Before-grill makes a rough idea systematic. Grill settles the concept. Something is always left. This skill closes that gap: technical only, scaled to the size of the change, run immediately after a grill skill declared shared understanding.

## Who you are talking to

- The user may not be a senior developer. They may be a learner, building with AI.
- Use very easy, short, and complete English. Explain technical things in a simple way.
- Always propose an answer first, then let the user correct it. Never lecture, never assume they know jargon.

## Small startup scale

- This skill serves a small startup: 2–3 people, working with AI, single server, simple database.
- Build for today, plan for growth. No microservices, no queues, no load balancing, no premature scaling.
- Simple is not incomplete: real failure and edge cases still get covered — with the simplest fix that works.
- Never weight effort, time, or team size by training-data-era experience. A CRM that took 1–2 years now takes a month or less with AI — one person can do the work of a whole team. Old timelines are not evidence.

<HARD GATE>
This skill asks questions and produces a summary — nothing else. Do NOT write any file, do NOT write or modify any spec, do NOT implement anything, and do NOT edit this project's grill skills or any other skill. The sweep's output is the conversation itself.
</HARD GATE>

## Precondition

The input is the settled truth, found in this order:

1. **Grill conversation in this session** — a grill skill declared shared understanding, or the user says grilling is done. The conversation is the input. Do not re-open it.
2. **`agent-doc/`** — when this conversation holds no grill (fresh session, cleared with `/clear`, new day). Read `agent-doc/` completely — `proposal.md`, every `specs/<feature>.md`, `design.md`, `tasks.md`, `decisions.md`. Anything recorded there is decided. Never re-ask it. Run the sweep from it. Do NOT ask the user to re-grill, and do NOT stop.

If neither exists — no grill conversation and no `agent-doc/` — say so and stop; nothing is settled, so there is nothing to sweep.

If the settled topic involves no change to the codebase (pure business or pure discussion), say the sweep found nothing technical to cover and stop — the grilling was already complete.

## Steps

### 1. Gather facts — never ask the user for what you can find

Read before asking anything:

- The full grill conversation — everything already decided is settled. Never ask about it again.
- If `agent-doc/` exists, read it completely — `proposal.md`, every `specs/<feature>.md`, `design.md`, `tasks.md`. Anything recorded there is decided. Never re-ask it. Also skip anything in it that is not important for this change — no extras.
- `.claude/rules/*` — the repo's folder structure rules (MVC mapping, pages/hooks/components/services, file and function limits, naming rules). Every file-placement recommendation must comply with these.
- `stacks.md` — in this skill's folder. The library catalog: known JS and Python libraries, each with what it is for. Dimension 10 proposes from it.
- The actual file tree in the affected area — existing files, existing structure.
- Existing routes, models, and schemas the change touches.
- If `graphify-out/` exists, query the graph for impact — what calls what, which files touch the area being changed. Run `graphify` directly — never with `python` in front, and assume it is already installed.

A question about where a file goes is only legitimate after you have read the structure it must fit into.

### 2. Say if this is greenfield or brownfield

State it out loud before anything else:

- **Greenfield** — new or empty project. The full file structure must be planned from zero, per `.claude/rules/*`.
- **Brownfield** — existing project. Only what gets added or changed matters: which files change, which folders appear, which database schema is new or modified.

### 3. Classify the blast radius

- **Small** — one or two files, no schema change, no new or changed API
- **Medium** — a handful of files across layers, or one API/schema change
- **Large** — many files, multiple APIs, schema migration, or a breaking change

Small → the whole sweep is one compact round. Medium → one round per touched dimension. Large → one round per touched dimension, plus a final round ordering the work.

### 4. Build the coverage checklist

For each dimension below, mark it **TOUCHED** or **NOT-TOUCHED** from the grill conversation, `agent-doc/`, and the codebase facts. Show the user the full checklist — every dimension visible, skipped ones included. A skipped dimension must be seen and agreed, never silently dropped. The user can flip any mark.

If every dimension is NOT-TOUCHED, say the sweep found nothing technical to cover and stop.

### 5. Grill each TOUCHED dimension

Work dimension by dimension. Inside a dimension, go piece by piece — never a whole dimension in one message:

- **API contracts** — one endpoint at a time, always: within a module, first the create endpoint, get the yes, then the delete endpoint, then the next. Never two endpoints in one question. Move to the next module only when the current one is fully settled.
- **Database changes** — one table or collection at a time, and each step is its own question: first the table's schema, then how existing data migrates, then the rollback. Never two tables, and never two steps, in one question.
- **File structure** — one module or feature area at a time: its files first, then the next area.
- **Failure & edge cases** — one case at a time: propose the handling, get the yes, move to the next case.

Use the question format below. Work from facts — propose the exact file list, the exact endpoint contract, or the exact schema delta for the piece in front of you, and let the user approve or correct it. When the last piece of a dimension is settled, say that dimension is done, then move to the next TOUCHED one. Small changes go the same way — they just have fewer questions.

## Question format

Ask every question with the AskUserQuestion feature — the tool that shows clickable options. Never ask a decision question as plain text. Rules:

- One question per call. Never bundle several questions together, never list a whole dimension's questions in one go.
- 2–4 short options. Exactly one option is marked (Recommended) and listed first. "Other" stays available so the user can always type their own answer.
- Before the call, write 1–2 lines in the message: what you understood, and your honest view — is this a good idea, or do you have a concern. The user decides after reading it.
- Bigger details — a full endpoint contract, a table schema — go in the message before the question. Keep option descriptions short.
- Recommendations must be concrete: real paths, real endpoint names, real field names — never "TBD".
- Ask in easy English; explain any technical word the user may not know.

Wait for the user's answer before asking the next question. Number questions Q1, Q2, Q3 and so on across the whole sweep — the number goes in the question title. One question, one message, every time.

## Dimensions

### 1. File structure & changes

The exact list of files this change creates, modifies, or deletes — full paths, no hand-waving like "update the auth files".

- **Greenfield**: plan the whole structure from zero — every folder and file, per `.claude/rules/*`.
- **Brownfield**: where does each new file go, per the repo's structure rules? Does each modified file stay under its line limit after the change, or must it be split first?
- Do new file and function names follow the naming rules?
- Is anything deleted, and is the deletion complete — no dead code left behind?

### 2. API contracts

Every new or changed endpoint:

- Method, path, request shape, response shape, error cases
- Auth — who can call it
- For changed endpoints: backward compatible, or a breaking change?

### 3. Database changes

- **Greenfield**: the full schema for what this feature needs.
- **Brownfield**: new tables/collections/fields, modified fields, indexes — or a whole new schema if needed.
- How existing data migrates to the new shape.
- Can it be rolled back if the release goes wrong?

### 4. Failure & edge cases

Success cases are easy — grilling already covered them. Failures and edge cases get skipped. Find them. Think through the feature like a senior engineer and list every case of both kinds:

- **Failure**: what breaks — payment fails, login fails, third-party service down, network drops, invalid input, no permissions.
- **Edge**: unusual but real — 100 messages arrive together in a chat app, double-click sends payment twice, empty list on first open, text too long, timeout, duplicate names.

For each case: mark it **COVERED** (the grill already settled it) or **NOT-COVERED**. Then, one round:

- For every **NOT-COVERED** case, ask the user: cover this now, or not yet?
- If now: how do we want to handle it? Propose the simplest way that works and let the user confirm or correct.

Nothing silently dropped. A case the user defers is recorded in the change surface as deferred, with one line on what it means later.

### 5. User flow & experience

Walk the feature as the user — open the app or website, reach this feature, use it step by step:

- How many steps does it take today? Can any step be removed?
- Can small things be automated so the user never does them by hand — auto-fill, auto-save, sensible defaults, remembered choices?
- Propose the easiest experience a senior developer would want for their own user. The user confirms or corrects.

### 6. Integration points & breaking changes

- Which existing code consumes what this change modifies?
- Who breaks, and which of those consumers must be updated inside this same change?
- Which changes are safe to ship separately, and which must ship together?

### 7. Config & third-party services

- New env vars, API keys, or external services this change needs?
- Where does config live, and what happens if the service is unreachable? (One line — the failure detail already lives in Dimension 4.)

### 8. Undo path

- If this release goes wrong, how do we roll back the whole change — not just the database?
- One clear sentence is enough at this scale.

### 9. Testing scope

- Which scenarios from this change get tests — including the failure and edge cases agreed in Dimension 4?
- Which existing tests break and need updating?

### 10. Tech stack — one library per piece

The stack is settled by now — grilling decided it, or this sweep does. For every piece this change needs (login, file upload, PDF, dates, emails, payments — anything named in the dimensions above), a library is chosen. Go piece by piece — one question per piece, never the whole stack in one message:

- Read `stacks.md` first — the catalog in this skill's folder. Known JS and Python libraries, each with what it is for.
- The catalog has a match → propose that library for the piece.
- No match → search for a well-made, well-maintained library and propose it, with why it is trusted. After the user agrees, the user adds it to `stacks.md` so the next piece starts from it.
- Building by hand is chosen only when no good library exists — and the reason is said out loud.
- The user confirms or corrects each choice. Never "TBD" — always a real library name.
- After the user agrees to a library, find its current stable version — never take the version from memory. Search the web for the best stable version of that library: the newest release people actually use, not a day-one release with known breakage. If web search is not available, ask the package registry instead — `npm view <package> version` for JS, `pip index versions <package>` for Python.
- An old stable version is a wrong choice, not a safe one — React 18 when React 19 is stable is a bug. If the current stable major needs companions (a React version other picks must match, a build tool the new Tailwind needs), say it in the same question.
- Versions must fit together. No compatibility API exists to ask — so check the pairings that touch each other by web search ("X compatible with React 19", "Y with Tailwind 4"), and treat the package manager as the final checker: npm and pip read each library's declared compatible ranges at install time and refuse a set that clashes. The sweep must not propose a set that fails there.
- The agreed library goes into the change surface with its exact version: `Library x.y.z`. The spec and the install step use exactly that version.

## Terminal state

When every TOUCHED dimension is settled, present the **change surface** — the agreed summary the spec will be built from:

```
CHANGE SURFACE
Type: greenfield / brownfield
Files: <created / modified / deleted — exact paths>
API: <endpoints — method, path, one-line contract each>
Database: <new or changed schema + migration approach>
Failure & edge cases: <each case — settled now or deferred, and how>
User flow: <steps made easier, what got automated — or "no change">
Config: <new env vars, keys, services — or "none">
Integration: <consumers updated in this change, breaking changes if any>
Tests: <scenarios that get tests>
Libraries: <library + exact stable version for each piece, one compatible set — or "none, all custom">
Undo: <how to roll back>
```

Then declare, and stop:

> **AFTER-GRILL COMPLETE** — the technical surface is settled. Every aspect of the grilling is now covered.

No files, no spec, no follow-on skill, no instructions for what to do next. What happens after is the caller's job.

## Rules

- **Technical only.** The concept was settled in grilling — never re-open it. If a technical question exposes a broken concept decision, name it in one sentence and let the user decide; do not silently re-grill it here.
- **One question at a time.** One question per message, piece by piece — one API endpoint, one table, one file area, one edge case. Never dump a whole dimension in one message.
- **Nothing re-asked.** The grill conversation and `agent-doc/` are the settled truth. Read them fully; never ask about a settled thing again.
- **Nothing silently assumed.** Every dimension appears in the checklist with its mark; every TOUCHED dimension ends with an explicit agreement; every deferred failure or edge case is written down.
- **Facts first.** Read the rules, the tree, the code, the graph before asking. The decisions are the user's; the findings are yours.
- **Scale to the change and the team.** A small change gets one short round — do not inflate it. A large one gets every dimension fully worked. Always the simplest solution a 2–3 person team on a single server can run.
- **Easy English always.** Short sentences. Explain technical words. Propose, then let the user correct.
