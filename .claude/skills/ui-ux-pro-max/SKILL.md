---
name: ui-ux-pro-max
description: Design-intelligence database with a BM25 search engine (from nextlevelbuilder/ui-ux-pro-max-skill) - 88 styles, 192 palettes, typography, charts, UX guidelines, and 22 framework stacks (React, shadcn, HTML+Tailwind, Angular, ...). Use it to generate a full design system (theme) for a product, to look up a single design topic, or to fetch how-to-build guidelines for your code stack while implementing UI.
---

# UI/UX Pro Max - Design Intelligence

Searchable local UI/UX guidance: 79 searchable styles (50 active), 192 product palettes and exact reasoning profiles, 74 font pairings, 119 UX guidelines, 105 curated icons, 17 GSAP presets, 25 chart types, and 22 technology stacks.

## When to Apply

Use this Skill when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality control**: designing new pages, creating/refactoring UI components, choosing color/typography/spacing/layout systems, reviewing UI for UX/accessibility/consistency, implementing navigation/animation/responsive behavior, or improving perceived quality and usability.

Skip it for pure backend logic, API/database design, non-visual performance work, infrastructure/DevOps, or non-visual scripts — unless the task changes how something **looks, feels, moves, or is interacted with**.

## Before searching - analyze the request

Extract from the user request:
- **Product type**: SaaS, e-commerce, portfolio, dashboard, entertainment, tool, productivity, or hybrid
- **Target audience & context**: age group, usage context (commute, leisure, work)
- **Style keywords**: playful, vibrant, minimal, dark mode, content-first, immersive, etc.
- **Stack**: detect from the project — check `package.json` deps (react/next/vue/svelte/nuxt/@angular), `pubspec.yaml` (Flutter), `*.xcodeproj`/`Package.swift` (SwiftUI), `composer.json` (Laravel), or React Native markers (`app.json` + `react-native` dep). If nothing is detectable and stack guidance matters, ask the user. **Never assume a stack** — a hardcoded default silently misroutes every recommendation.

## 1. Full design system - the theme

Colors, fonts, spacing, style, and UX rules for a product, in one output:

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<product type> <industry> <keywords>" --design-system --variance <1-10> --density <1-10> -p "<Product Name>" --format markdown
```

House defaults: `--variance 3` (simple, minimal, comfortable). `--density` - dashboards and admin tools: 7-8. Everything else: 3-4.
Dials only work with `--design-system`; `--stack` is ignored there - run stack queries separately.

### Design Dials (optional)

Three optional 1-10 sliders that tune `--design-system` output without changing your query. Add any combination of them to the same command:

| Dial | Low (1-3) | Mid (4-7) | High (8-10) |
|------|-----------|-----------|-------------|
| `--variance` | Centered / minimal (biases toward Minimalism-style categories) | Balanced / modern | Bold / asymmetric (biases toward Brutalism, Bento Grids) |
| `--motion` | Subtle micro-interactions | Standard scroll/stagger motion | Complex choreography (pin, Flip, SplitText) |
| `--density` | Spacious (24-96px spacing scale) | Standard (16-64px, current default) | Dense/dashboard (8-32px spacing scale) |

- `--motion` attaches a ready-to-use GSAP snippet (with framework notes, Do/Don't, and performance notes) pulled from `--domain gsap`, matched to the resolved tier (Subtle/Standard/Complex).
- `--density` overrides the `--space-*` CSS variable table in the output — use it for dashboards (high) vs. marketing pages (low) without hand-editing tokens.
- Leaving a dial unset keeps that part of the output exactly as it was before (no behavior change).

**Example:**
```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "internal analytics dashboard" --design-system --variance 8 --motion 7 --density 8 -p "Ops Console"
```

### Persist for later sessions (optional)

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --output-dir "<project-root>"
```

This creates:
- `design-system/<project-slug>/MASTER.md` — Global Source of Truth
- `design-system/<project-slug>/pages/` — Folder for page-specific overrides

Add `--page "dashboard"` to also create `design-system/<project-slug>/pages/dashboard.md`. If Master already exists, a new page file is created without changing Master; an existing page file is skipped unless `--force`.

If `MASTER.md` already exists, `--persist` **skips writing and leaves it untouched** unless you also pass `--force` — read it first before regenerating, and never use `--force` without explicit user authorization.

**Retrieval when building a specific page:**
1. Read `design-system/<project-slug>/MASTER.md`
2. Check if `design-system/<project-slug>/pages/<page-name>.md` exists — if so, its rules override Master
3. Otherwise use Master rules exclusively

In this repo, a design-screens run saves the same output to `THEME.md` - that stays the locked source of truth for the screens; MASTER.md is this tool's own persistence.

## 2. One domain - a single design topic

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

| Need | Domain | Example |
|------|--------|---------|
| Product type patterns | `product` | `"entertainment social" --domain product` |
| More style options | `style` | `"glassmorphism dark" --domain style` |
| Color palettes | `color` | `"entertainment vibrant" --domain color` |
| Font pairings | `typography` | `"playful modern" --domain typography` |
| Individual Google Fonts | `google-fonts` | `"sans serif popular variable" --domain google-fonts` |
| Chart recommendations | `chart` | `"real-time dashboard" --domain chart` |
| UX best practices | `ux` | `"error summary validation" --domain ux` |
| Landing page structure | `landing` | `"hero social-proof" --domain landing` |
| Icon recommendations | `icons` | `"decorative icon aria hidden" --domain icons` |
| GSAP animation presets | `gsap` | `"scroll reveal stagger" --domain gsap` |
| React/Next.js performance | `react` | `"rerender memo list" --domain react` |
| App/native interface guidelines | `web` | `"accessibilityLabel touch safe-areas" --domain web` |

Domain is auto-detected from the query if `--domain` is omitted — but auto-detection can misroute overlapping terms (e.g. "font" matches both `typography` and `google-fonts`). If results look off-topic, pass `--domain` explicitly.

## 3. Stack guidelines - how to build in your framework

While implementing UI, query your implementation stack for how-to-build guidelines - component patterns, `cn()`, performance rules. The design itself is already decided (THEME, screens, decisions.md) - this tells you how to build it correctly in your framework.

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack <stack> --max-results 3
```

Which stack to query - the one the implementation uses. A React + shadcn project queries `react` and `shadcn` (for `cn()` and component patterns). Plain HTML mockups: `html-tailwind`.

Full stack list: `react`, `nextjs`, `vue`, `svelte`, `astro`, `swiftui`, `react-native`, `flutter`, `nuxtjs`, `nuxt-ui`, `html-tailwind`, `shadcn`, `jetpack-compose`, `threejs`, `angular`, `laravel`, `javafx`, `wpf`, `winui`, `avalonia`, `uno`, `uwp`

## If a search returns 0 results

Do not fabricate output. Instead:
1. Retry once with a narrower query or an explicit domain/stack.
2. If still empty, fall back to general design defaults and say explicitly to the user that this recommendation came from the built-in defaults, not a database match (e.g. "no palette match for X, using general SaaS defaults").
3. Never present a 0-result search as if it returned data.

## Tips for Better Results

- Keep one dominant intent and 2–5 meaningful terms per query: `"keyboard focus modal"`, not a full audit checklist
- Retry once with a narrower phrase or explicit domain/stack; do not cycle through unrelated keywords
- Use `--design-system` for a new project/page and `--domain` for a focused concern
- Pass the detected stack explicitly for implementation-specific guidance
- Can't decide on style/color? Re-run `--design-system` with different keywords
