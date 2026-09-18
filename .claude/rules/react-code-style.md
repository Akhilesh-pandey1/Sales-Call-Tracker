# React Code Style & Standards

## Vocabulary
- **Function**: A helper defined inside a file. Not a separate file. `BackgroundElements`, `AnimatedInput` inside `Login.jsx` are functions.
- **Component**: A `.jsx` file. One file, one named responsibility. `Login.jsx`, `Navbar.jsx`.
- **Hook**: A `.js` file prefixed with `use`. Business logic, API calls, validation only. `useAuth.js`.
- **Service**: A `.js` file for API calls only. No logic. `authService.js`.
- **Feature**: A domain the user sees as a separate section — has its own data, actions, and screens. `auth`, `dashboard`, `orders`. A button or input is not a feature.
 
## File & Component Structure
- Never exceed 1000 lines of code per file.
- One React component function must be approximately 50 to 150 lines.
- One custom hook function must be approximately 40 to 70 lines.
- Before writing any new code, check if the target function or component needs refactoring first. Refactor within the same file, then implement.

## Folder Structure
- Organize all code files into four directories — `pages`, `hooks`, `components`, and `services`. Nothing lives outside these unless it is a config or entry file.
- `pages` — One file per route or screen. Contains the top-level layout and composition for that view.
- `hooks` — All custom hooks. Contains business logic, API call orchestration, and data validation.
- `components` — Reusable, meaningful UI pieces used across pages — e.g., `Navbar`, `Sidebar`, `DataTable`. Not atomic elements like buttons or inputs.
- `services` — All direct API call functions. One service file per domain or resource (e.g., `userService.js`, `orderService.js`). No logic, just calls.

src/
  features/
    auth/               # flat files, no subfolders — only 1 file per type
      Login.jsx
      useAuth.js
      authService.js
    dashboard/          # subfolders only because 2+ files exist per type
      components/
        StatsCard.jsx
        RecentOrders.jsx
      hooks/
        useDashboard.js
        useCharts.js
      Dashboard.jsx
  components/           # shared across 2+ features — Navbar, Sidebar, DataTable
  pages/                # route entry only, no logic
  hooks/                # shared across 2+ features
  services/             # shared API config only
  utils/                # only when actually needed

- Subfolder inside a feature: **only when 2+ files of the same type exist**.
- Only one domain in the project: skip `features/`, use flat structure.
- Never create empty folders. Never create `store/`, `context/`, `types/` unless actively used.

## State & Logic Separation
- Move all business logic, API calls, and data validation into custom hooks.
- Keep only UI-specific state inside the component — modals, form inputs, show/hide toggles.
- Never mix data-fetching or transformation logic directly inside a component body.

## Responsive Design
- Always write mobile-first. Start with the smallest screen layout and scale up using responsive breakpoints.
- Never write styles that only target desktop. Every component and page must work correctly on mobile, tablet, and desktop.
- Use responsive utility classes or media queries from small to large — never override mobile styles with desktop ones.
- Never hardcode pixel widths or heights for layout containers. Use relative units, flex, or grid to let the layout adapt naturally.

## Naming Conventions
- Prefix all event handler functions with `handle` — e.g., `handleClick`, `handleKeyDown`, `handleFormSubmit`.
- Variable, function, hook, and component names must clearly describe what they hold or do. No abbreviations or vague names.
- Function names should be self-contained and self-descriptive. The name alone should justify its purpose and return value.