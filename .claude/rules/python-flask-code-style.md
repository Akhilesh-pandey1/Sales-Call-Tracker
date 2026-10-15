# Python / Flask Code Style & Standards

## Architecture — Modular Monolith
- One feature = one folder under `modules/`. Everything the feature needs lives inside it.
- Working on a feature means opening one folder — for a human or an AI agent. No treasure hunt across the codebase.
- Each module is a small MVC: thin routes, validated schemas, logic in services, DB in models.
- Old projects keep the legacy MVC structure. This structure applies to new projects only.

## File Structure
- Never exceed 800 lines of code per file.
- Business logic is written as functions. Classes are allowed only where a library requires them: database models, mixins, exceptions, schemas, and client wrappers.
- A function should stay under ~50 lines. Past that, it does more than one thing — split it.

## Folder Structure

backend/
├── app/
│   ├── __init__.py              # create_app(): creates Flask app,
│   │                            # loads config and registers modules
│   │
│   ├── extensions.py            # Shared extension instances:
│   │                            # SQLAlchemy, Migrate, JWT, Cache, Limiter
│   │
│   ├── config/
│   │   ├── base.py              # Common configuration
│   │   ├── dev.py               # Local development settings
│   │   └── prod.py              # Production settings
│   │
│   ├── core/                    # Shared infrastructure used by 2+ modules
│   │   ├── errors.py            # AppException and error handlers
│   │   ├── security.py          # Password hashing, JWT helpers
│   │   ├── permissions.py       # Common authorization helpers
│   │   ├── pagination.py        # Reusable pagination logic
│   │   ├── base_model.py        # Shared ID and timestamp mixins
│   │   ├── logging.py           # Logging configuration/helpers
│   │   └── utils.py             # Truly generic helper functions
│   │
│   ├── api/
│   │   └── __init__.py          # Registers API Blueprints and version
│   │                            # prefixes, e.g. /api/v1
│   │
│   ├── modules/                 # Business features
│   │   ├── auth/                # Minimal module — only files it needs
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   ├── services.py
│   │   │   └── __init__.py
│   │   │
│   │   └── calls/               # Full module
│   │       ├── routes.py        # Endpoints only — no logic
│   │       ├── schemas.py       # Request/response validation
│   │       ├── services.py      # Business logic
│   │       ├── repository.py    # Optional — only for complex or reused queries
│   │       ├── models.py        # Database tables only
│   │       └── __init__.py      # Public exports of this module
│   │
│   ├── integrations/            # External systems and APIs
│   │   ├── email_client.py
│   │   ├── sms_client.py
│   │   └── whatsapp_crm.py
│   │
│   └── tasks/                   # Background jobs
│       └── lead_import.py       # Large CSV imports, if needed
│
├── migrations/                  # Database schema change history
├── tests/                       # Mirrors modules/
│   ├── conftest.py
│   └── modules/
│       ├── test_auth.py
│       └── test_calls.py
├── wsgi.py                      # Production WSGI entry point
└── pyproject.toml               # Dependencies and tool settings

## Module Rules
- `routes.py` — endpoints only. Calls services and returns responses. No business logic.
- `schemas.py` — request and response validation for that module.
- `services.py` — business logic. Talks to repository or models, never to routes.
- `repository.py` — optional. Add it only when a module has complex or reused queries. Simple modules let services talk to models directly.
- `models.py` — database tables only. No business logic.
- A module carries only the files it needs. Auth has no `models.py` or `repository.py` in the reference structure — do not create empty files.
- Cross-module imports: import from another module only through its `__init__.py` exports — never from deep inside it.
- Dependencies point one way only: routes → services → repository → models. Never a service importing a route. Never circular imports between modules.
- `core/` is only for code used by 2+ modules. If one module uses it, it stays inside the module.
- `integrations/` holds all third-party calls. Business modules never call external APIs directly — they go through an integration.
- `tests/` mirrors `modules/` — one test file per module.

## Imports
- Always place all import statements at the top of the file. Never import inside functions or conditions.
- Always import names explicitly. Never use `import *` — it hides where a name comes from and breaks tracing.

## Naming Conventions
- Name all functions and variables in a way that clearly describes what they hold or do. No abbreviations or vague names.

## Type Hints & Validation
- Every function declares type hints for its parameters and its return type.
- The signature is the contract — a human or an agent reads it and knows the shapes without reading the body.
- Type the signature, not the body. Do not add type hints to local variables inside a function — Python infers them. Typing every variable is over-engineering.
- `schemas.py` files define request and response validation with Pydantic models.

## Return Values
- Never return a value directly from a function call or an inline expression. Always assign the result to a named variable first, then return that variable.

## Error & Exception Handling
- Never write try/except to report or handle user-facing errors. Raise `AppException` available in `app/core/errors.py` — with a short message and a status code, from any function in any file.
- Handle them in one place only: register `@app.errorhandler(AppException)` once inside `create_app()` — it logs the error and returns the JSON error response. Register `@app.errorhandler(Exception)` the same way for unexpected errors (the 500 fallback).
- try/except is allowed only for retry, fallback, and partial-failure cases — a transient SMS timeout, one bad CSV row in a background import. It must end in a retry, a raise, or an `AppException` — never swallow an error silently.
- Never handle or log the same error at every level. Rule: raise anywhere, handle once, log once.
- Only generate a raw exception for purely technical errors that are not user-facing.

## Libraries & Dependencies
- Always check for an existing library before building anything from scratch. Suggest the library to the developer — do not reinvent the wheel.
- Never overwrite `requirements.txt` or `pyproject.toml` without first asking and getting explicit confirmation from the developer.

## Code Quality
- Write code that is easy to read, understand, and maintain a year later without asking anyone.
- Readability always takes priority over cleverness or brevity
