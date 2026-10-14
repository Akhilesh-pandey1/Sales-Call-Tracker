# Design System — Apex Sales Call

Source of truth for all screens in `agent-doc/screens/`.

## Colors

```css
:root {
  --color-primary: #6366F1;         /* Indigo 500 */
  --color-on-primary: #FFFFFF;      /* White */
  --color-secondary: #818CF8;       /* Indigo 400 */
  --color-on-secondary: #0F172A;    /* Slate 900 */
  --color-accent: #059669;          /* Emerald 600 - Call / Success */
  --color-on-accent: #FFFFFF;       /* White */
  --color-background: #F5F3FF;      /* Indigo 50 / Violet 50 tint */
  --color-foreground: #1E1B4B;      /* Indigo 950 */
  --color-card: #FFFFFF;            /* White */
  --color-card-foreground: #1E1B4B; /* Indigo 950 */
  --color-muted: #EBEFF9;           /* Light blue-slate */
  --color-muted-foreground: #475569;/* Slate 600 */
  --color-border: #E0E7FF;          /* Indigo 100 */
  --color-destructive: #DC2626;     /* Red 600 */
  --color-on-destructive: #FFFFFF;  /* White */
  --color-ring: #6366F1;            /* Focus ring */
}
```

## Typography

- Font family: `Plus Jakarta Sans`, system-ui, sans-serif
- Headings: Bold tracking-tight
- Numbers / Stats: `tabular-nums`
- Base body text: 14px–16px

## Rules & Components

- **Icons**: Inline SVG only, `stroke="currentColor"`, 24px (or 16px/20px for inline badges), `stroke-width="2"`. No emojis.
- **Buttons**: Rounded-xl / Rounded-2xl, transitions 150–200ms ease, visible focus rings.
- **Cards**: Border `var(--color-border)`, bg `var(--color-card)`, shadow-sm.
- **Navigation**:
  - Web: Fixed left sidebar (icon rail on mobile, labeled bar on PC) with Dashboard, Leads, Accounts, and Logout.
  - Android App: 2-tab bottom bar: Dialer and My Stats. Settings accessed via gear icon in My Stats header.
