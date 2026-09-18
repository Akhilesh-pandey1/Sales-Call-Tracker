---
name: write-screens
description: Write every screen of the product into one file, agent-doc/screen.md - grouped by view (Manager, Salesperson, User, Admin), in user-flow order, with edge cases and graph explanations. Short but complete, written for the design team. Use when the user asks to write screens, pages, or what each screen shows.
---

# Write Screens

Write all screens of the product into ONE file: `agent-doc/screen.md`.

The design team reads this file and does all the visual work. This skill writes only the content - what is on each screen, never how it looks.

## The balance (most important rule)

Every screen must be **short but complete**:

- **Short** - about 5 to 20 points per screen. The designer should finish a screen in one look, not drown in text.
- **Complete** - the designer must never have to guess. A missing detail becomes a wrong design.

Short comes from tight points, never from dropping needed info. When in doubt about a detail, write it in the fewest possible words - do not delete it.

Before finishing, check every screen once: "Can a designer build the right screen from only this? Is anything extra?"

## Input

Take the product from wherever it exists, in this order:

1. The conversation so far - what was already decided is settled.
2. `agent-doc/proposal.md` and `agent-doc/specs/` - if they exist, read them from disk.
3. Nothing exists - ask the user ONE question: "What is the product, and who uses it (which views)?" After the answer, decide everything yourself. No more questions.

## Steps

1. **Find the views** - every type of user of the product (Manager View, Salesperson View, User View, Admin View, ...).
2. **Walk each view like the user** - screen by screen, in the order the user reaches them. Every screen the user can land on appears exactly once, in the view where the user first opens it.
3. **Check the output file** - if `agent-doc/screen.md` already exists, ask:
   > "screen.md already exists. Rewrite it fully, or update only the screens that changed?"
   Rewrite - replace the whole file. Update - read the file first, change only the affected screens, keep the rest untouched.
4. **Write** `agent-doc/screen.md` following the template below.
5. **Report** - list the views and the screen count, and say the file is ready for the design team.

## Template

```markdown
# Screens - <Product Name>
Platform: <Mobile app / Web app - responsive on mobile, tablet, PC>

## <Who> View

### Screen <n>: <Screen name>
- <thing on the screen> - <what it is or does, in a few words>
- <field / button / list / big number / text>

**Edge cases:**
- <case>: <exact short text the screen shows>

**Graph - what it means:** <1 to 4 plain lines: what the chart shows, what the user should learn from it>

→ Next: Screen <n+1> <name>
```

- `**Edge cases:**` - on every screen that shows data. Not on screens that need nothing (like a pure form success page).
- `**Graph - what it means:**` - only when the screen has a chart or graph.

Filled example of one screen:

```markdown
## Manager View

### Screen 2: Dashboard
- Top bar - product name, notifications, profile menu
- Today's total sales - one big number
- Sales this month - sales per day for the last 30 days (chart)
- Table: each salesperson - name, deals closed, revenue
- Add Lead button - opens the new-lead form

**Edge cases:**
- No sales yet: show "No sales recorded yet."
- Backend does not load: show "Could not load data." with a Retry button

**Graph - what it means:** Sales per day for the last 30 days. The manager uses it to spot good and bad days and see if this month is better than the last one.

→ Next: Screen 3 Salesperson Report
```

## Writing rules

1. One point = one thing the user sees. Name it, then 2 to 6 words on what it does.
2. Plain words only. If a non-technical person cannot picture it, rewrite it.
3. Buttons: name + action. Example: "Add Lead button - opens the new-lead form".
4. `→ Next` on every screen, so the whole flow reads top to bottom. Screens are numbered continuously across views. The last screen of the product ends with `→ Flow ends`.
5. **Edge cases** - for every screen that shows data, think through at least: no data yet, backend does not load, action fails. Write only the ones that can really happen, each with the exact short text the screen shows.
6. **Graph - what it means** - for every chart, 1 to 4 plain lines. Not a fixed length - as much as the data needs, no more. Say what it shows and what the user should understand from it.
7. A screen that is the same for two views (both see the same dashboard): write it once in the first view. In the other view, write one line: "Same as Screen <n> <name>".
8. **Platform line** - first line of the file. Mobile app - screens are mobile only. Web app - one line per screen about a device only when that device needs something different (example: "Mobile: bottom tab bar instead of sidebar"). If all devices show the same thing, write nothing extra - responsive is the default.

## Guardrails

- Never decide design. No colors, fonts, sizes, positions, icons, animations, images, chart types. "There is a chart of sales per day" is content. "Bar chart, blue" is design.
- Never write technical things. No API names, database tables, code, or state management - the designer does not need them.
- No paragraphs. Points only. The graph explanation is the only multi-line text allowed.
- After the one input question, do not ask the user anything mid-way. Decide, write, and let them correct the file.
- Do not create one file per screen. Everything lives in the single `agent-doc/screen.md`.
