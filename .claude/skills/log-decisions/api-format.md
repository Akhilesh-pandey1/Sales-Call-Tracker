# API Format — the one saving shape for `agent-doc/api.md`

This file holds the only format for saving API contracts. `SKILL.md` reads it every time it writes anything API-related into `agent-doc/api.md`. This file is only read — the skill never edits it.

## File header — written once, at the top of `api.md`

```
# API contracts

Every API's answer carries an HTTP status code — a number that travels back with every network call, like a delivery slip. `200` means delivered — the API worked. Any other number means it failed, and the answer then carries one thing only: a `message` field with the reason in plain words.
```

## Endpoint shape — one section per endpoint

One `## <METHOD> <path>` section per endpoint. The parts in `<...>` are filled with real values:

## <METHOD> /api/v1/<name>

One or two plain lines: what it saves or reads, which screen uses it, and whether it needs login.

**Input**

```json
{ "field": "example value" }
```

- `field` — type, required or optional. What it is. Example: `value`

**What happens**

1. The checks come first, then the save or read — each step one plain sentence, including what happens when a check fails ("Nothing saves", "the old value keeps working").
2. For saves, the last step is always the done-message.

**Output — code 200**

```json
{ "message": "..." }
```

**Error format — any code other than 200**

```json
{ "message": "the reason in plain words" }
```

**Error cases**

- `400` — wrong input: each case, and what happens.
- `500` — Oops! Something went off track.

If any other error comes, it is handled in the code — not listed here.

## Rules for every endpoint

- **No echo-back.** A save never returns the request data back — the frontend already has what it sent. A save returns the short done-message plus only data the frontend cannot know on its own: generated ids, timestamps, server-computed values, counts. A read returns the data itself — the data is the proof of success, no extra flag or message.
- A read with no input writes `None.` instead of the Input block — no field bullets either.
- Field bullets under Output only when it carries real data — ids, counts, computed values. A lone done-message needs none.
- Real method and real path only — never a made-up name, never "TBD".
- Auth is one line in the intro — "Needs login (JWT)" or "No login needed".

## Worked example

## POST /api/v1/profile

Saves the profile screen: display name and email. Only the provided fields save. Needs login (JWT).

**Input**

```json
{
  "display_name": "Aarti",
  "email": "aarti@example.com"
}
```

- `display_name` — string, optional. The name shown on the profile screen. Example: `Aarti`
- `email` — string, optional. The sign-in email. Example: `aarti@example.com`

**What happens**

1. Each provided value is checked — the name is not empty, the email looks like an email.
2. Only the provided keys are saved into the `profile` table.
3. A short done-message goes back with code `200`. No saved values come back — the UI already knows what it sent.

**Output — code 200**

```json
{
  "message": "Profile saved successfully. You're all set!"
}
```

**Error format — any code other than 200**

```json
{
  "message": "the reason in plain words"
}
```

**Error cases**

- `400` — wrong input: the name is empty, or the email does not look like an email. Nothing saves.
- `401` — token missing or expired. Message: "Please log in again"
- `500` — Oops! Something went off track.
