---
name: design-screens
description: Turn agent-doc/screen.md into real designed HTML screens - one HTML file per screen, Tailwind CDN, inline JavaScript only for same-page interactions, screens never link to each other. Includes a runner (index.html) to flip left/right through screens and preview Mobile / iPad / Desktop. Follows the user's pace - all screens in one go or one at a time, as the user chooses. Use when the user asks to design screens, make HTML designs, or build designs from screen.md.
---

# Design Screens

Turn `agent-doc/screen.md` into designed HTML screens in the user's chosen folder:

```
<folder>/               <- folder name comes from the user (ask)
  screens/
    index.html          <- the runner - open this, flip through screens
    THEME.md            <- the locked design system (source of truth)
    01-login--M.html
    02-dashboard--P.html
    02-dashboard--empty--P.html
    02-dashboard--offline--P.html
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
- Save the full markdown output to `<folder>/screens/THEME.md` - it is the source of truth for every screen.
- Zero results - retry once with a narrower query. Still empty - say the theme came from general defaults, not the database.

## Steps

1. **Read the input** - `agent-doc/screen.md`. Missing - stop: "Run /write-screens first - screen.md is the design input."
2. **Ask the user ONE thing** - the output folder name. Suggest `design/`. Nothing else - the user is not a designer; every design decision comes from the brain and the rules below.
3. **Get the theme** - run the search, write `THEME.md`.
4. **Ask how to proceed** - "Should I design ALL screens now, or one at a time (say `next` for each new screen)?" If the user already said in chat how to proceed, follow that - don't ask again.
5. **Design the screens** - in flow order from screen.md, one HTML per screen, exactly the same head and theme every time. Build `<folder>/screens/index.html` from `templates/runner.html` and keep its SCREENS list matching the files as they are added. Edge cases become separate files with their screen's marker: `02-dashboard--empty--P.html`, `02-dashboard--offline--P.html`. Repeating pieces (top bar, buttons, cards, tables) copy the exact classes from the screens already built - same structure everywhere, never restyle.
6. **Run the checklist**, then report: folder path, screen count, edge-case screens. Remind the user: open `<folder>/screens/index.html` - arrows to flip, buttons for Mobile / iPad / Desktop.

## Screen file rules

- Name every screen file with its max designed size at the end: `--M` (mobile only, 375), `--T` (up to tablet, 768), `--P` (up to PC, 1440). A mobile-app screen is always `--M`. A screen that also runs on PC is `--P`, even if it works on mobile too. Edge cases keep their screen's marker: `02-dashboard--empty--P.html`.
- Build from `templates/screen.html` - theme colors go in `:root` CSS variables, fonts from THEME.md.
- Use tokens everywhere: `bg-[var(--color-card)]`, `text-[var(--color-muted-foreground)]`, `border-[var(--color-border)]`. No raw hex in classes.
- Do not reinvent the wheel: before hand-writing a big piece, check if a known library already does it — via CDN, web search if needed, no install. Examples: Lucide CDN for icons instead of SVG, Chart.js CDN for charts.
- For a small variation of an existing screen, copy that screen's file and edit only the parts that differ — never rebuild it.
- Write `screens/INDEX.md` — a markdown table, one row per screen: Screen | File | What it is for. One plain line each — e.g. "Keypad — salesperson logs a call from here", "Schedule — book a visit date and time", "Dashboard — today's numbers at a glance".
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

- Never ask the user design questions - every design decision comes from THEME.md and the rules here. The only things to ask: folder name, and how to proceed (all at once or one at a time).
- Never let a screen move to another screen - no links, no redirects, no loading another screen's HTML. The runner flips screens.
- Never redesign a locked theme mid-run - THEME.md is final once approved.
- One file per screen; never bundle screens into one HTML.
- If the theme search fails twice, design from general defaults and say so.
