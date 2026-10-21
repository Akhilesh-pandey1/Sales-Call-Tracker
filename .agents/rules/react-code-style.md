# React + TypeScript Code Style & Standards

## Language
- All React code is TypeScript. Components go in `.tsx` files. Hooks, API calls, schemas, and types go in `.ts` files. Never write `.jsx` or `.js`.

## Vocabulary
- **Function**: A helper defined inside a file. Not a separate file. `BackgroundElements`, `AnimatedInput` inside `login-page.tsx` are functions.
- **Component**: A `.tsx` file. One file, one named responsibility. `login-page.tsx`, `navbar.tsx`.
- **Hook**: A `.ts` file prefixed with `use`. Business logic, API call orchestration, validation only. `use-calls.ts`.
- **API file**: A `.ts` file with direct API calls only. No logic. One per feature. `calls.api.ts`.
- **Schema**: A `.ts` file with Zod schemas for forms and API payloads. `call.schema.ts`.
- **Feature**: A domain the user sees as a separate section — has its own data, actions, and screens. `auth`, `calls`, `dashboard`. A button or input is not a feature.

## File & Component Structure
- Never exceed 1000 lines of code per file.
- The main exported component should stay under ~150 lines. Past that, extract — a sub-component in the same file, a hook, or a shared component.
- A hook has no minimum size. A hook should stay under ~70 lines. Past that, it manages more than one concern — split it.
- Small private helper components may live in the same file as the main component, as long as the file stays small.
- Before writing any new code, check if the target function or component needs refactoring first. Refactor within the same file, then implement.

## Folder Structure

src/
├── app/                          # Application setup
│   ├── router.tsx                # All routes
│   ├── providers.tsx             # React Query, Auth, Theme
│   ├── query-client.ts           # TanStack Query configuration
│   ├── layouts/
│   │   ├── admin-layout.tsx
│   │   └── dashboard-layout.tsx
│   └── guards/
│       └── protected-route.tsx
│
├── features/                     # Business features
│   └── calls/
│       ├── api/
│       │   └── calls.api.ts
│       ├── hooks/
│       │   ├── use-calls.ts
│       │   ├── use-create-call.ts
│       │   └── use-call-filters.ts
│       ├── components/
│       │   ├── calls-table.tsx
│       │   ├── call-status-badge.tsx
│       │   └── call-filters.tsx
│       ├── pages/
│       │   ├── calls-page.tsx
│       │   └── call-details-page.tsx
│       ├── schemas/
│       │   └── call.schema.ts
│       ├── types.ts
│       └── index.ts
│
├── components/
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── table.tsx
│
├── shared/                       # Reusable application code
│   ├── components/
│   │   ├── data-table.tsx
│   │   ├── page-header.tsx
│   │   └── confirm-dialog.tsx
│   ├── hooks/
│   ├── api/
│   │   └── api-client.ts
│   ├── utils/
│   └── constants/
│
├── assets/                       # Images, fonts, static assets
├── config/                       # Environment/configuration
├── types/                        # Truly global types
├── testing/                      # Shared testing helpers
└── main.tsx                      # React entry point

## Folder Rules
- All file names use kebab-case: `calls-table.tsx`, `use-create-call.ts`, `call.schema.ts`.
- `app/` holds only wiring — router, providers, layouts, guards. No business logic.
- A feature `api/` file holds only direct API calls. No business logic.
- A feature `schemas/` folder holds Zod schemas for its forms and API payloads.
- Feature `types.ts` holds the types of that feature only. `types/` at the root holds truly global types only.
- `shared/` is only for code used by 2+ features. If one feature uses it, it stays inside the feature.
- Every feature exposes its public surface through `index.ts`. Other features import from the feature root, never from deep inside it.
- `components/ui/` is only for shadcn/ui components. Shared hand-written components go in `shared/components/`.
- Never create empty folders. Never create `store/` or `context/` unless actively used.
- Only one feature in the project: still keep the `features/<name>/` folder, so the structure never changes.

## State & Logic Separation
- Move all business logic, API calls, and data validation into custom hooks and schemas.
- Server state goes through TanStack Query hooks. Never copy fetched server data into local state.
- Keep only UI-specific state inside the component — modals, form inputs, show/hide toggles.
- Never mix data-fetching or transformation logic directly inside a component body.

## Responsive Design
- Always write mobile-first. Start with the smallest screen layout and scale up using responsive breakpoints.
- Never write styles that only target desktop. Every component and page must work correctly on mobile, tablet, and desktop.
- Use responsive utility classes or media queries from small to large — never override mobile styles with desktop ones.
- Never hardcode pixel widths or heights for layout containers. Use relative units, flex, or grid to let the layout adapt naturally.

## Naming Conventions
- File names are kebab-case. The export inside uses its own case: `calls-table.tsx` exports `CallsTable`, `use-calls.ts` exports `useCalls`.
- Prefix all event handler functions with `handle` — e.g., `handleClick`, `handleKeyDown`, `handleFormSubmit`.
- Variable, function, hook, and component names must clearly describe what they hold or do. No abbreviations or vague names.
- Function names should be self-contained and self-descriptive. The name alone should justify its purpose and return value.
