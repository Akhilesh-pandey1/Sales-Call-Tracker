# Rust Code Style & Standards

General for every Rust project. The folder tree below shows Tauri — the current main use.

## Architecture — Modular Monolith
- One feature = one module under `modules/`. Everything the feature needs lives inside it.
- Working on a feature means opening one module — for a human or an AI agent. No treasure hunt across the codebase.
- Each module is a small MVC: thin commands, validated schemas, logic in services, DB in models.

## Language & File Structure
- Never exceed 800 lines of code per file.
- Business logic is written as functions. Structs hold data, enums hold states and errors. An `impl` block only holds functions that belong to its type.
- Traits only where they earn their keep: shared behavior across 2+ types, or a library demands one. Never a trait with a single implementation "just in case".
- A function should stay under ~100 lines. Past that, it does more than one thing — split it.
- Tests live in `tests/` and mirror `modules/` — one test file per module, testing only the public API. No inline `#[cfg(test)]` tests.
- The frontend side of a Tauri app follows `react-code-style.md`.

## Folder Structure

src-tauri/
├── src/
│   ├── main.rs                  # Entry point: calls lib::run()
│   ├── lib.rs                   # run(): loads config, registers all
│   │                            # modules and commands, starts Tauri
│   ├── config/
│   │   └── mod.rs               # App configuration loading
│   │
│   ├── core/                    # Shared infrastructure used by 2+ modules
│   │   ├── mod.rs               # Public exports of core
│   │   ├── errors.rs            # AppError enum + From impls
│   │   ├── security.rs          # Password hashing, token helpers
│   │   └── utils.rs             # Truly generic helper functions
│   │
│   ├── modules/                 # Business features
│   │   ├── auth/                # Minimal module — only files it needs
│   │   │   ├── mod.rs           # Public exports of this module
│   │   │   ├── commands.rs
│   │   │   ├── schemas.rs
│   │   │   └── services.rs
│   │   │
│   │   └── calls/               # Full module
│   │       ├── mod.rs           # Public exports of this module
│   │       ├── commands.rs      # Tauri commands only — no logic
│   │       ├── schemas.rs       # Command payloads (serde) + validation
│   │       ├── services.rs      # Business logic
│   │       ├── repository.rs    # Optional — only for complex or reused queries
│   │       └── models.rs        # Database tables only
│   │
│   ├── integrations/            # External systems and APIs
│   │   ├── mod.rs
│   │   ├── email_client.rs
│   │   └── sms_client.rs
│   │
│   └── jobs/                    # Background work
│       └── mod.rs               # Async tasks, if needed
│
├── migrations/                  # Database schema change history
├── tests/                       # Mirrors modules/ — tests only the public API
├── capabilities/                # Tauri permission files
├── tauri.conf.json
├── Cargo.toml
└── .env.example                 # Example environment variables

## Module Rules
- `commands.rs` — Tauri commands only. Call services and return results. No business logic.
- `schemas.rs` — serde structs for command inputs and outputs, plus their validation.
- `services.rs` — business logic. Talks to repository or models, never to commands.
- `repository.rs` — optional. Add it only when a module has complex or reused queries. Simple modules let services talk to models directly.
- `models.rs` — database tables only. No business logic.
- A module carries only the files it needs. Auth has no `models.rs` or `repository.rs` in the reference structure — do not create empty files.
- Other modules import only from a module's `mod.rs` public exports — never from deep inside it.
- Keep items private by default. `pub` only when another module needs it; `pub(crate)` for core-only sharing.
- Dependencies point one way only: commands → services → repository → models. Never a service importing a command. Never circular module references.
- `core/` is only for code used by 2+ modules. If one module uses it, it stays inside the module.
- `integrations/` holds all third-party calls. Business modules never call external APIs directly — they go through an integration.
- Every command must be registered in `generate_handler!` in `lib.rs` — an unregistered command is dead code.
- The frontend never reaches into Rust internals — every bridge goes through a registered command.

## Types & Signatures
- Every function declares full types for its parameters and its return. The signature is the contract — a human or an agent reads it and knows the shapes without reading the body.
- Model "no value" with `Option`, failure with `Result`. Never sentinel values like `-1` or empty strings.
- Derive what serde and debugging need (`#[derive(Serialize, Deserialize, Debug, Clone)]`) instead of hand-writing impls.
- Build big types by composition — structs holding structs. Rust has no inheritance by design.

## Error Handling
- Rust has no exceptions. Every fallible function returns `Result<T, AppError>` — `AppError` lives in `core/errors.rs`, one variant per failure, each with a short user-facing message.
- Commands return `Result<T, AppError>` (serializable), so the frontend gets clean JSON errors.
- Use `?` to propagate errors from anywhere. Handle and log in one place only: the command boundary. Rule: propagate anywhere, handle once, log once.
- `unwrap()` and `expect()` are allowed only in tests. In real code they are a crash waiting to happen.
- Never swallow a `Result` or `Option` — no `let _ =`, no silent match arms. Handle it, propagate it, or log it.
- `panic!` is only for programmer bugs that must stop the app — never for expected failures like bad input or a failed request.
- Never build deep nested `match` pyramids — `?`, `map_err`, and combinators keep the flow flat and readable.

## Rust Hygiene
- Code must pass `cargo fmt` and `cargo clippy` with zero warnings.
- Before building anything from scratch, check for an existing well-maintained crate on crates.io.
- Dependencies live only in `Cargo.toml`. Never add, remove, or update a crate without first asking and getting explicit confirmation from the developer.
