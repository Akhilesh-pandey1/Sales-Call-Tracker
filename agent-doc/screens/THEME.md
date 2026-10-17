# THEME — Apex Sales Call (v2 light)

The locked design system for every screen in this folder.
Source of truth: the existing v2-light screens in this folder — not a fresh theme search. Once approved, never restyle mid-run.

## Fonts

- Plus Jakarta Sans, weights 300–700, loaded from Google Fonts in every screen.
- Fallback: `system-ui, sans-serif`.
- Base text 16px. Page titles `text-lg font-bold tracking-tight`; card headings `text-base font-bold tracking-tight`.

## Color tokens

Same `:root` block in every screen head.

| Token | Manager web (01–05) | Salesperson app (06–09) |
|---|---|---|
| `--color-primary` | `#6366F1` | `#6366F1` |
| `--color-on-primary` | `#000000` | `#FFFFFF` |
| `--color-secondary` | `#818CF8` | `#818CF8` |
| `--color-accent` | `#059669` | `#059669` |
| `--color-on-accent` | `#000000` | `#FFFFFF` |
| `--color-background` | `#F5F3FF` | `#F5F3FF` |
| `--color-foreground` | `#1E1B4B` | `#1E1B4B` |
| `--color-card` | `#FFFFFF` | `#FFFFFF` |
| `--color-card-foreground` | `#1E1B4B` | `#1E1B4B` |
| `--color-muted` | `#EBEFF9` | `#EBEFF9` |
| `--color-muted-foreground` | `#475569` | `#475569` |
| `--color-border` | `#E0E7FF` | `#E0E7FF` |
| `--color-destructive` | `#DC2626` | `#DC2626` |
| `--color-on-destructive` | `#FFFFFF` | `#FFFFFF` |
| `--color-ring` | `#6366F1` | `#6366F1` |

Never use raw hex in classes — always `bg-[var(--color-…)]` / `text-[var(--color-…)]`.

## Shapes

- Cards and panels: `rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm`.
- Buttons, inputs, nav links: `rounded-xl`.
- Chart bars: `rounded-t-md`.

## Layout patterns

### Manager web (--P screens)

- Fixed left sidebar: icon rail `w-16` on mobile, labeled bar `md:w-60`. Product mark top, nav links below a "Menu" label, Log out at the bottom (`mt-auto`).
- Content column: `pl-16 md:pl-60`, inner `max-w-6xl mx-auto`.
- Sticky top bar: page title left, context (date, buttons) right.
- Nav link: active = filled `bg-[var(--color-primary)]`; idle = `text-[var(--color-muted-foreground)]` with `hover:bg-[var(--color-muted)]`.

### Salesperson app (--M screens)

- Single column `max-w-md mx-auto`, sticky header, sticky bottom tab bar.

## Components

- Period switch: pill group `inline-flex rounded-xl border p-1`; active option filled `bg-[var(--color-primary)]`.
- KPI card: label + icon top row, big `tabular-nums` number, small muted sub-line.
- Calls-by-hour chart: flex columns — count label above the bar, hour label below. Peak bar `bg-[var(--color-primary)]` + bold, mid bars `bg-[var(--color-secondary)]`, low bars `bg-[var(--color-muted)]`.
- Data table: uppercase muted header row, `hover:bg-[var(--color-muted)]` rows, tabular numbers right-aligned.
- Mobile table fallback: stacked cards — name + chevron on top, label/value grid below.
- Dialogs: centered card over a dark overlay.
- Focus: `focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]` on every clickable.

## Icons

- Inline SVG only, Lucide style: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, round caps and joins, 24px (`h-6 w-6` or `h-5 w-5`). Never emoji, never icon fonts.

## Motion

- `transition-colors duration-200` (150–300 ms) on hover and focus state changes.

## Density

- Dashboards and admin screens 7–8: comfortable spacing (`gap-3 sm:gap-4` grids, `p-4 sm:p-5` cards), generous line height, base text 16px.
