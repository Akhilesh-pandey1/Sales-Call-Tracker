# Node.js + TypeScript Code Style & Standards

## Architecture — Modular Monolith
- One feature = one folder under `modules/`. Everything the feature needs lives inside it.
- Working on a feature means opening one folder — for a human or an AI agent. No treasure hunt across the codebase.
- Each module is a small MVC: thin routes, validated schemas, logic in services, DB in models.
- Old projects keep the legacy MVC structure. This structure applies to new projects only.

## Language & File Structure
- All backend code is TypeScript. `.ts` files only — never `.js`.
- Never exceed 800 lines of code per file.
- Business logic is written as functions. Classes are allowed only where a library requires them: database models, exceptions, and client wrappers. TypeScript types and interfaces are always allowed — they vanish at runtime.
- A function has no minimum size. A 4-line guard function that does one thing is correct.
- A function should stay under ~50 lines. Past that, it does more than one thing — split it.

## Folder Structure

backend/
├── src/
│   ├── app/
│   │   ├── create-app.ts         # createApp(): creates Express app,
│   │   │                         # loads config and registers modules
│   │   │
│   │   ├── config/
│   │   │   ├── base.ts           # Common configuration
│   │   │   ├── dev.ts            # Local development settings
│   │   │   └── prod.ts           # Production settings
│   │   │
│   │   ├── core/                 # Shared infrastructure used by 2+ modules
│   │   │   ├── db.ts             # Database client and connection setup
│   │   │   ├── errors.ts         # AppException and the error middleware
│   │   │   ├── security.ts       # Password hashing, JWT helpers
│   │   │   ├── permissions.ts    # Common authorization helpers
│   │   │   ├── pagination.ts     # Reusable pagination logic
│   │   │   ├── logger.ts         # Logging configuration/helpers
│   │   │   └── utils.ts          # Truly generic helper functions
│   │   │
│   │   ├── api/
│   │   │   └── index.ts          # Registers routers and version
│   │   │                         # prefixes, e.g. /api/v1
│   │   │
│   │   ├── modules/              # Business features
│   │   │   ├── auth/             # Minimal module — only files it needs
│   │   │   │   ├── routes.ts
│   │   │   │   ├── schemas.ts
│   │   │   │   ├── services.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── calls/            # Full module
│   │   │       ├── routes.ts     # Endpoints only — no logic
│   │   │       ├── schemas.ts    # Request/response validation (Zod)
│   │   │       ├── services.ts   # Business logic
│   │   │       ├── repository.ts # Optional — only for complex or reused queries
│   │   │       ├── models.ts     # Database tables only
│   │   │       └── index.ts      # Public exports of this module
│   │   │
│   │   ├── integrations/         # External systems and APIs
│   │   │   ├── email-client.ts
│   │   │   └── sms-client.ts
│   │   │
│   │   └── jobs/                 # Background jobs
│   │       └── lead-import.ts    # Large CSV imports, if needed
│   │
│   ├── migrations/               # Database schema change history
│   ├── tests/                    # Mirrors modules/
│   │   └── modules/
│   │       ├── auth.test.ts
│   │       └── calls.test.ts
│   └── server.ts                 # Entry point: loads env, starts createApp()
│
├── package.json
├── tsconfig.json
└── .env.example                  # Example environment variables

## Module Rules
- `routes.ts` — endpoints only. Calls services and returns responses. No business logic.
- `schemas.ts` — request and response validation for that module, written with Zod.
- `services.ts` — business logic. Talks to repository or models, never to routes.
- `repository.ts` — optional. Add it only when a module has complex or reused queries. Simple modules let services talk to models directly.
- `models.ts` — database tables only. No business logic.
- A module carries only the files it needs. Auth has no `models.ts` or `repository.ts` in the reference structure — do not create empty files.
- Cross-module imports: import from another module only through its `index.ts` exports — never from deep inside it.
- Dependencies point one way only: routes → services → repository → models. Never a service importing a route. Never circular imports between modules.
- `core/` is only for code used by 2+ modules. If one module uses it, it stays inside the module.
- `integrations/` holds all third-party calls. Business modules never call external APIs directly — they go through an integration.
- `tests/` mirrors `modules/` — one test file per module.

## Function Composition & Layout
- Name all functions and variables in a way that clearly describes what they hold or do. No abbreviations or vague names.
- Every function declares types for its parameters and its return. The signature is the contract — a human or an agent reads it and knows the shapes without reading the body.
- Never return a value directly from a function call or an inline expression. Always assign the result to a named variable first, then return that variable.
- When a parent function calls a child function, pass only the exact parameters the child needs — never pass a whole object/state just because it's convenient. Likewise, a child function should return only the exact value the parent needs — never return extra data "just in case." Keeps data flow explicit and easy to trace.
- Always define child (helper) functions ABOVE the parent function that calls them in the same file. When reading top to bottom, helpers should appear first, followed by the function that orchestrates them — so the file reads in the same order it executes.

## Error & Exception Handling
- Never write try/catch to report or handle user-facing errors. Throw `AppException` available in `app/core/errors.ts` — with a short message and a status code, from any function in any file.
- Handle them in one place only: one Express error middleware registered last in `createApp()` — it logs the error and returns the JSON error response.
- Import `express-async-errors` once at the entry file, so errors thrown inside async functions reach that middleware.
- try/catch is allowed only for retry, fallback, and partial-failure cases — a transient SMS timeout, one bad CSV row in a background job. It must end in a retry, a throw, or an `AppException` — never swallow an error silently.
- Never handle or log the same error at every level. Rule: throw anywhere, handle once, log once.
- Only generate a raw exception for purely technical errors that are not user-facing.

## Libraries & Dependencies
- Use pnpm as the package manager — one global store on disk, so every project and worktree shares packages instead of copying them. The lock file is `pnpm-lock.yaml`.
- Always check for an existing well-maintained npm package before building anything from scratch. Do not reinvent the wheel.
