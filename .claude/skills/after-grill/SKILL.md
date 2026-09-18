---
name: after-grill
description: "Post-grill technical sweep. After any grilling skill (grill-with-pocock, grill-with-superpower, grill-with-openspec, grill-for-business) reached shared understanding, settle the engineering surface it never covered: greenfield or brownfield file structure, database schema changes, API contracts, failure and edge cases, user flow and experience, config, rollback, and testing scope. Talks in easy English — the user may be a learner, not a senior developer. Use right after a grill session ends, before writing any spec."
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

A grilling session just ended in this conversation — a grill skill declared shared understanding, or the user says grilling is done. The grill conversation in this session's history is the input. Do not re-open it.

If no grilling happened in this conversation, say so and stop.

If the grilled topic involves no change to the codebase (pure business or pure discussion), say the sweep found nothing technical to cover and stop — the grilling was already complete.

## Steps

### 1. Gather facts — never ask the user for what you can find

Read before asking anything:

- The full grill conversation — everything already decided is settled. Never ask about it again.
- If `agent-doc/` exists, read it completely — `proposal.md`, every `specs/<feature>.md`, `design.md`, `tasks.md`. Anything recorded there is decided. Never re-ask it. Also skip anything in it that is not important for this change — no extras.
- `.claude/rules/*` — the repo's folder structure rules (MVC mapping, pages/hooks/components/services, file and function limits, naming rules). Every file-placement recommendation must comply with these.
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

One round per dimension (or one compact round for small changes). Use the question format below. Work from facts: propose the exact file list, the exact endpoint table, the exact schema delta — and let the user approve or correct each.

## Question format

Same as the pocock grilling — numbered questions with your recommended answer, one round at a time. Ask in easy English; explain any technical word the user may not know:

```
❓ **Q1** - **<question title>**: <question body>

➡️ <your recommended answer>
```

Recommendations must be concrete: real paths, real endpoint names, real field names — never "TBD".

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
Undo: <how to roll back>
```

Then declare, and stop:

> **AFTER-GRILL COMPLETE** — the technical surface is settled. Every aspect of the grilling is now covered.

No files, no spec, no follow-on skill, no instructions for what to do next. What happens after is the caller's job.

## Rules

- **Technical only.** The concept was settled in grilling — never re-open it. If a technical question exposes a broken concept decision, name it in one sentence and let the user decide; do not silently re-grill it here.
- **Nothing re-asked.** The grill conversation and `agent-doc/` are the settled truth. Read them fully; never ask about a settled thing again.
- **Nothing silently assumed.** Every dimension appears in the checklist with its mark; every TOUCHED dimension ends with an explicit agreement; every deferred failure or edge case is written down.
- **Facts first.** Read the rules, the tree, the code, the graph before asking. The decisions are the user's; the findings are yours.
- **Scale to the change and the team.** A small change gets one short round — do not inflate it. A large one gets every dimension fully worked. Always the simplest solution a 2–3 person team on a single server can run.
- **Easy English always.** Short sentences. Explain technical words. Propose, then let the user correct.
