---
name: grill-with-osmani
description: Intent interview — one question at a time, each with the agent's guessed answer attached, until it can predict the user (~95% confidence). Extracts what the user actually wants, not what they think they should want. Ends with a confirmed Statement of Intent, optionally saved to agent-doc/intent.md for write-spec to consume. Use when the ask is vague — who it's for, why, or what success looks like is unknown.
disable-model-invocation: true
---

# Grill with Osmani — the intent interview

What the user asks for and what they actually want are different things. They ask for "a dashboard" because that's what one asks for, not because a dashboard solves their problem. This interview closes that gap before any spec, ticket, or code exists — the cheapest moment to find it.

Adapted from Addy Osmani's `interview-me`.

---

## Step 1 — Hypothesize, with a confidence number

Before asking anything, write your current best read in one sentence plus an honest confidence (0–100%):

```
HYPOTHESIS: You want a way to <actual outcome>, and "<requested thing>" was the convention that came to mind.
CONFIDENCE: ~30% — missing: who it's for, what success looks like
```

The number forces honesty. If you wrote a high number but can't predict the user's reaction to your next three questions, the number is wrong. Below ~70%, always append the reason — what's still unresolved. It tells the user exactly what the interview must surface.

## Step 2 — One question at a time, each with a guess attached

```
Q: <one focused question>
GUESS: <your hypothesis for the answer, with the reasoning that produced it>
```

Wait for the answer before the next question. Never batch — the third question often depends on the first answer, and batches get skim-read.

Why attach a guess: the user reacts faster to a wrong guess than they generate an answer from scratch, and it commits you to a hypothesis you can be visibly wrong about — which keeps you honest and surfaces *your* assumptions. That is the point of the interview.

## Step 3 — Listen for "want vs. should want"

The most dangerous answers pattern-match best-practice talk: "scalable", "clean architecture", "the standard approach", "I should probably…", buzzwords as goals. When you hear one, ask:

> *"If you didn't have to justify this to anyone, what would you actually want?"*

That single question often does more work than the previous five.

## Step 4 — Restate intent in the user's own words

When confidence is high, write back what you now think, tight (5–8 lines), using their language:

```
Here's what I now think you want:

- Outcome:      <one line>
- User:         <one line — who benefits>
- Why now:      <one line — what changed>
- Success:      <one line — how we know it worked>
- Constraint:   <one line — the binding limit>
- Out of scope: <one line — what we are explicitly NOT building>

Yes / no / refine?
```

"Out of scope" is non-negotiable — half of misalignment is silent disagreement about what is *not* being built.

## Step 5 — Confirm: explicit yes, not "whatever you think"

These are **not** yes:

- "Whatever you think is best." → delegation, not decision. Re-ask with two concrete options framed as a choice.
- "Sounds good." / "Sure, let's go." → ambiguous, often a polite exit. Ask: "Anything you'd refine?"
- Silence followed by "okay let's start." → the user gave up, not converged. Ask whether you've missed something.

If they correct you, fold the correction in and restate. Loop until an explicit yes.

---

## The stop rule

You're done when you can answer yes to this:

> *Can I predict the user's reaction to the next three questions I would ask?*

This is a checkable test, not a vibe. Floor: after several rounds with confidence not visibly rising, stop and say so — something foundational is missing. Ask whether to step back instead of grinding on.

## Terminal turn

On the explicit yes:

1. Deliver the confirmed Statement of Intent.
2. Offer to save it to `agent-doc/intent.md` — the file downstream skills (`/write-spec`) read as the settled intent. Save only on confirmation.
3. **STOP the turn immediately.** No tools, no downstream work. Hand control back to the user.

---

## Rules

| Rule | Detail |
|---|---|
| **One question per message** | Batching buries hypotheses and gets surface answers |
| **Every question carries a guess** | A question without a guess is surveying, not interviewing |
| **Never accept buzzwords as goals** | "Modern / scalable / robust" → run the Step 3 probe |
| **Never save before the explicit yes** | The doc implies a yes the user didn't give |
| **Never start downstream work** | Confirmed intent ≠ license to write the spec in the same turn |

## Red flags

- Three or more questions in a single message
- A confidence number below ~70% with no reason attached
- Accepting "scalable" / "best practice" answers without the Step 3 probe
- Producing a spec, plan, or task list before the confirmed restate
- A "yes" that followed "sounds good" or silence
- Three or more rounds without confidence visibly rising — reframe, don't repeat
