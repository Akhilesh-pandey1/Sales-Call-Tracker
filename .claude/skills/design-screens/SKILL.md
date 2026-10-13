---
name: design-screens
description: Turn agent-doc/screen.md into real designed HTML screens - one HTML file per screen, Tailwind CDN, inline JavaScript only for same-page interactions, screens never link to each other. Includes a runner (index.html) to flip left/right through screens and preview Mobile / iPad / Desktop. Designs ONE screen first for approval, makes variations on request, then generates all screens in the locked theme. Use when the user asks to design screens, make HTML designs, or build designs from screen.md.
---

# Design Screens

Turn `agent-doc/screen.md` into designed HTML screens in the user's chosen folder:

```
<folder>/               <- folder name comes from the user (ask)
  index.html            <- the runner - open this, flip through screens
  THEME.md              <- the locked design system (source of truth)
  screens/
    01-login.html
    02-dashboard.html
    02-dashboard--empty.html
    02-dashboard--offline.html
  variations/           <- losing variations live here, never in the runner
```

Screens are HTML + Tailwind (CDN) plus small inline JavaScript for same-page interactions only - tabs, toggles, date ranges, dropdowns, modals. A screen never opens, links to, or loads another screen file - the runner is the only way to move between screens.

## The design brain

Theme decisions come from the bundled search tool - never invent colors or fonts, and never ask the user for them:

```bash
python "<this skill's folder>/uiux/scripts/search.py" "<product type> <industry> <keywords>" --design-system --variance 3 --density <3-4 or 7-8> -p "<Product Name>" --format markdown
```

- `--variance 3` always - the house style is simple, minimal, comfortable.
- `--density 7-8` for dashboards and admin tools, `3-4` for everything else.
- If `python` is missing, try `python3`, then `py -3`.
- Save the full markdown output to `<folder>/THEME.md` - it is the source of truth for every screen.
- Zero results - retry once with a narrower query. Still empty - say the theme came from general defaults, not the database.

## Steps

1. **Read the input** - `agent-doc/screen.md`. Missing - stop: "Run /write-screens first - screen.md is the design input."
2. **Ask the user ONE thing** - the output folder name. Suggest `design/`. Nothing else - the user is not a designer; every design decision comes from the brain and the rules below.
3. **Get the theme** - run the search, write `THEME.md`.
4. **Design ONE screen** - the first screen of the primary view. Build `<folder>/index.html` from `templates/runner.html` with the SCREENS list holding just this one screen. Build the screen from `templates/screen.html` + THEME.md. Tell the user: "Open <folder>/index.html - arrows to flip, buttons for Mobile / iPad / Desktop." Then ask: "Good, or variations?"
5. **Variations (only if asked)** - `01-login--v2.html`, `01-login--v3.html`... Same content, different layout interpretation (sidebar vs topbar, cards vs table), same style family. Add each to the runner list. When the user picks one - rename the winner to the canonical name, move the losers to `variations/`, remove them from the runner list.
6. **Generate ALL screens** - flow order from screen.md, one HTML per screen, exactly the same head and theme as the approved screen. Edge cases become separate files: `02-dashboard--empty.html`, `02-dashboard--offline.html`. Repeating pieces (top bar, buttons, cards, tables) copy the exact classes from the approved screen - same structure everywhere, never restyle.
7. **Run the checklist**, update the runner list, report: folder path, screen count, edge-case screens.

## Screen file rules

- Build from `templates/screen.html` - theme colors go in `:root` CSS variables, fonts from THEME.md.
- Use tokens everywhere: `bg-[var(--color-card)]`, `text-[var(--color-muted-foreground)]`, `border-[var(--color-border)]`. No raw hex in classes.
- Icons: inline SVG only, `stroke="currentColor"`, 24px, `stroke-width="2"` (Lucide style). Never emoji, never icon fonts.
- `<script>` tags: the Tailwind CDN line plus one inline script for same-page interactions only. Never navigate to, link to, or load another screen file.
- Responsive with Tailwind breakpoints - correct at 375, 768, 1024, 1440. Mobile app screens (screen.md says "Mobile app") design at 375 only.
- Realistic sample content in the product's own language - never "Lorem ipsum".

## Thinking rules (apply while designing)

- Simple, minimal, comfortable for the eyes. Generous space, clear hierarchy, base text 16px.
- One-click rule: if something can happen in one click, it must not take two.
- Every screen answers: what does the user come here to do? Make that the loudest thing on the screen.
- Empty and error states are designed, not afterthoughts - same layout, the exact friendly text from screen.md.

## Checklist before reporting done

- [ ] Every screen.md screen has its HTML; every edge case has its file
- [ ] Runner list matches the files, flow order matches screen.md
- [ ] Inline `<script>` in screens only for same-page interactions; zero cross-screen links or navigation
- [ ] No emoji icons; cursor-pointer on clickables; hover transitions 150-300ms
- [ ] Contrast 4.5:1; visible focus states
- [ ] Checked in the runner at Mobile, iPad, Desktop

## Guardrails

- Never ask the user design questions. Allowed questions only: folder name, "good or variations", "which one".
- Never let a screen move to another screen - no links, no redirects, no loading another screen's HTML. The runner flips screens.
- Never redesign a locked theme mid-run - THEME.md is final once approved.
- One file per screen; never bundle screens into one HTML.
- If the theme search fails twice, design from general defaults and say so.
