---
name: grill
description: Router — ask which grilling style fits, then load and run that skill. Use when the user wants to grill/brainstorm/stress-test an idea, plan, or decision and hasn't picked a style.
disable-model-invocation: true
allowed-tools:
  - Read
  - AskUserQuestion
---

# Grill — style router

Your only job: pick the grilling style, then hand off to it. You ask ONE question, then follow the chosen skill exactly. Do not grill the user yourself.

## Step 1 — Ask which style

Via AskUserQuestion, with the recommendation matched to what the user brought:

> Which grilling style do you want?
>
> 1. Pocock — decision tree** (`.claude/skills/grill-with-pocock/SKILL.md`)
>   Stress-tests a plan, decision, or technical design: maps every decision as a tree, asks the "frontier" questions in rounds with your recommended answer, until nothing is silently assumed. **Use when the topic is an engineering decision, architecture, or "pressure-test my plan".**
>
> 2. Superpower — idea → design** (`.claude/skills/grill-with-superpower/SKILL.md`)
>   Turns a raw software/feature idea into a concrete approved design: clarifying questions one at a time, 2-3 approaches with trade-offs, design presented section by section. **Use when the topic is "I want to build X feature/component" and the output is a design.**
>
> 3. Osmani — intent interview** (`.claude/skills/grill-with-osmani/SKILL.md`)
>   One question at a time, each with the agent's guessed answer attached, until it can predict your reactions (~95% confidence). Extracts what you actually want — not what you think you should want — and ends with a confirmed Statement of Intent, optionally saved to `agent-doc/intent.md`. **Use when you can't yet say who it's for, why you want it, or what success looks like.**

Recommendation heuristic:
- Existing plan/decision to tear apart → **1**
- Feature/software to design before building → **2**
- Vague idea; can't yet say who it's for, why, or what success looks like → **3**

## Step 2 — Load and run the chosen skill

Read the chosen skill's SKILL.md file (path shown above) and follow it **exactly as written, from its first step to its terminal state** — its questions, its rules, its ending. Treat its text as the instructions now in charge, not as reference.

Do not summarize it, do not soften it, do not skip its HARD GATES. When it says it's done (its own ending), the grill session is done — stop.
