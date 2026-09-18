# Code Style & Standards

## Code Quality

- Follow SOLID Principles in all code design decisions.
- Write code that any developer can read and understand a year later without asking anyone.
- Always prefer simple solutions over clever ones. Keep the codebase clean and organized.
- Follow DRY — Do Not Repeat Yourself.
- Delete all dead code, unused variables, and unused imports.
- Never write comments in code.
- Import statements always go at twhe top of the file, never inside functions or conditions.

## Parameters, Returns & Data Flow

- Only take and pass what is actually needed — never pass entire objects when only one field is required.
- Function parameters: accept only the data required to do the work, nothing extra.
- Return values: return only what the caller needs, not the entire object or response.
- Database queries: select only the fields you actually use, never SELECT *.
- Child functions should receive only the parameters they need, not parent data.
- If data is unused after receiving it, remove it from the parameter list.

## Naming & Constants

- Variable and function names must be readable and describe exactly what they hold or do. No abbreviations or vague names.
- Never use magic numbers or raw hardcoded values inline. Always assign them to a named constant that clearly describes what the value represents.

## Function Length & Structure

- Use Guard Clauses — throw or return early for invalid states at the top of the function. Never nest logic inside `if` conditions to handle errors.
- Avoid small or single line meaningless functions that just wrap or call another function.
- User-facing success and error messages must be written from the end user's point of view — short, clear, and non-technical.

## Bug Fixes & Refactoring

- When fixing a bug, always exhaust all options within the existing implementation first.
- Never introduce a new pattern or library just to fix one issue without exhausting existing options.
- If a better approach is adopted, remove the old implementation completely — no duplicate logic ever.

## Starting a New Feature

- Before writing any code, explain the plan briefly in plain terms as if describing it to a non-technical person.
- Always suggest the simplest and most efficient solution considering we are a small team running both SaaS and Services projects.
- Always check for existing libraries before building from scratch — don't reinvent the wheel.