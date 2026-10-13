## Rules

For all code style rules, look inside `.claude/rules/`. The files there are:

- `code-style.md` — general rules, for every project
- `node-js-code-style.md` — Node.js projects
- `python-flask-code-style.md` — Python / Flask projects
- `react-code-style.md` — React projects

Always follow `code-style.md`. Then also follow the one file that matches your project's language.

## Language

- Use very easy, short, and complete English.
- Explain technical things in a simple way, so anyone can understand.

## Tasks

Tasks come from `agent-doc/tasks.md`

- If the user gives a task (like `5`), do all its subtasks in order — `5.1 → 5.2 → 5.3`. That is one task, not extra work.
- If a subtask needs the human (like a manual UI pass), skip it, do the rest, leave it unchecked, and tell the user what to test by hand.
- Do not start or do any extra task.
- Do more only when the user clearly says so.
- After you finish a task, check it off in `tasks.md` — turn `- [ ]` into `- [x]`.

## Search

Use graphify for any codebase question — how code works, what calls what, or where something lives.

- Run the `graphify` command directly, like `graphify query "..."`.
- First assume graphify is already installed.
- `graphify-out/` always lives in the project root. Never put it anywhere else.

## Timelines

- Do not judge time, effort, or complexity by training data.
- Old timelines are wrong now: a CRM that took 1–2 years can be built in a month or less with AI.
- One person with AI can do the work of a whole team.
- Never use old-era timelines as a base for any opinion, plan, or estimate.

## Working Directory

- Always work from the project root. The root has the main things — git, `.gitignore`, config files.
- You are already in the project root. Do not run `cd` to reach it — run your main command directly.
- Going inside subfolders (below the root) is fine when needed.
- Never go above the root. Never step outside the project folder.

## Env Files

- Never touch or read `.env` files.
- To add something new to the env, add it to `.env.example` instead.

## Private Folder

- Never read, open, search, or list files inside `not_to_be_pushed/`.
- The only exception: the user explicitly gives you a specific file from that folder. Then you may read only that file.
- Never use anything from that folder on your own — not for context, not for answers, not for tasks.
