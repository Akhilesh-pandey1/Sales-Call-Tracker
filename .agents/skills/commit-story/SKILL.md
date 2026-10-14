---
name: commit-story
description: "Git commit workflow: review status and .gitignore, run graphify update so the graph ships with the commit, then stage and commit with a one-line past-tense story-style message. Use when staging or committing changes, writing a commit message, or the user asks to commit, add, or save their work."
---

# Commit Story

Every commit adds one line to the project's story.

## Git rules

- Run git in the current project root — plain commands like `git status`.
- Never use `git -C <path>`. Never `cd` first. You are already in the right place.

## Steps

1. **Review** — run `git status` first. Anything that does not belong in the repo — build output, dependencies, logs, temp files, `.env` or secrets — goes into `.gitignore` before anything else.
   *Done when:* every changed or untracked file is either part of this change or ignored.

2. **Confirm the status** — look at `git status` again after the `.gitignore` changes. Verify it now shows exactly what this change touched and nothing that should be ignored.
   *Done when:* the status is clean of anything unwanted before the graph is updated.

3. **Update the graph** — run `graphify update .` before staging, so the graph reflects this change and ships inside the commit.
   *Done when:* the command has run and the graph output appears in `git status` as changed files.

4. **Stage** — `git add .` directly. Steps 1–2 already moved everything unwanted into `.gitignore` and verified the status shows exactly this change, so whatever `git status` lists is exactly what should be staged — the code and the graph together. Ignored files are excluded automatically, so there is nothing left to filter by hand.
   *Done when:* everything from the verified status is staged.

5. **Write the message** — one line, starting with a past-tense verb, naming exactly what was done. Read commit after commit, the log should read like the story of the project — each message the next sentence in that story, so anyone walking the history feels a continuous narrative.
   - `Added login validation to the auth service`
   - `Fixed null crash in the report builder`
   - `Removed unused imports from user routes`
   - Nothing else in the message — no "written by", no emails, no attribution, no footer lines. Only the one line saying what was done.
   *Done when:* the line is a complete past-tense sentence covering the whole staged change.

6. **Commit** — `git commit -m "<message>"`.
   *Done when:* the commit succeeded with the updated graph included in it.
