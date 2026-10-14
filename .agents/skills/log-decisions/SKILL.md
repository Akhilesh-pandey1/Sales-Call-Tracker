---
name: log-decisions
description: Logs the decisions agreed in the conversation into agent-doc/ — decisions.md, database.md, api.md, testing.md, structure.md. Run it after a grill conversation ends.
disable-model-invocation: true
---

# Log Decisions — the recorder

Grilling settles things by talking. The talk disappears when the session ends. This skill turns the agreed parts of that talk into permanent files in `agent-doc/`. Nothing is asked here — the grilling is done. This skill only reads, sorts, and writes.

<HARD GATE>
This skill writes or edits exactly five files, all inside `agent-doc/`: `decisions.md`, `database.md`, `api.md`, `testing.md`, `structure.md`. No code, no spec, no other file, no edits to any skill. A file whose topic was never discussed is not created. Nothing outside `agent-doc/` is touched.
</HARD GATE>

## Precondition

A grilling conversation happened in this session and it reached agreement. That conversation in this session's history is the input. Do not re-open it.

If no grilling happened in this conversation, say so and stop.

## Steps

### 1. Gather — never re-ask what is already settled

Read before writing anything:

- The full grill conversation — everything agreed there is settled truth. Never re-ask it, never re-open it.
- Every existing `agent-doc/` file, completely. `decisions.md` may already exist — `before-grill` writes it. Its entries are already logged: never log the same decision twice, and never rewrite an entry unless the new conversation contradicts it.
- If `agent-doc/` does not exist, it is created when the first file is written.

### 2. Sort — each fact goes to exactly one file

Go through the conversation's agreements. Each one belongs to exactly one file, picked by its topic:

| File | Topic | What goes in |
|---|---|---|
| `decisions.md` | Every agreed decision with no dedicated file | Product decisions, failure and edge-case handling, config choices — anything settled by talking |
| `database.md` | Database schema and design | Tables, fields, indexes, migrations |
| `api.md` | API contracts | Method, path, request shape, response shape, errors, auth |
| `testing.md` | Testing approach | What gets tests and how |
| `structure.md` | File structure | Which files and folders are created, changed, or deleted |

A file that does not exist yet is created, with a simple header, the moment its topic has something agreed. A topic with nothing agreed gets no file.

### 3. Write — by the rules below

Write each agreement into its one file. No interview, no questions — the conversation is the input.

### One fact, one place

- A fact lives in exactly one file — the one its topic picks. Never the same thing in two files.
- Never a pointer. No file says "this is written in X.md" — `decisions.md` never says the API lives in `api.md`, and no file points at another.
- Real names only — real table names, real endpoint paths, real file paths. Never "TBD".

### Current truth, not history

- Every file shows the current truth only. No "Added:", no "Updated:", no "Changed:", no dates, no changelog of any kind.
- A new agreement that contradicts an existing entry rewrites that entry in place. Never two opposing entries — the file always reads as if the newest agreement was the only one.
- New entries are appended at the bottom. `decisions.md` always follows `before-grill`'s decision format and numbering — new file or existing file.

### Independent entries

- Every decision stands alone. One decision never references another decision — no "like Decision 4", no "instead of the earlier approach", no "see above".
- The same across files: `database.md` never refers to `api.md`, `api.md` never refers to `testing.md`, and so on. Each entry is complete on its own.

## Unclear or unsettled things

- Only agreed outcomes are logged. Open questions are not logged.
- If an agreement is unclear, write the clearest reading and flag it in the summary below. Never re-open grilling, never ask grill questions again.

## Terminal state

When every agreement is written, show the summary — the change history lives in this conversation, never in the files:

```
LOGGED
Files created: <list, or "none">
Files updated: <list, or "none">
Decisions added: <count>
Decisions rewritten: <count> — <one line each, what changed and why>
Database: <one line on what was written, or "not discussed">
API: <one line, or "not discussed">
Testing: <one line, or "not discussed">
Structure: <one line, or "not discussed">
```

Then declare, and stop:

> **LOG-DECISIONS COMPLETE** — every agreed outcome from the grilling is written in `agent-doc/`.

## Rules

- **Conversation is the input.** Read the grilling fully; write only what was agreed there. Nothing new is decided in this skill.
- **No re-grilling.** Not one question. This skill never re-opens a settled thing.
- **Five files, no more.** A new file type is added only when the user asks for it.
- **Easy English always.** The files and the summary use short, simple sentences anyone can read.
