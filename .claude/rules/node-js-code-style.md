## File Structure
- Never exceed 800 lines of code per file.
- Write all code as functions. Never write class-based code.
- Functions must be between 20 to 80 lines. Never write 1–3 line functions. Write 7–10 line functions only if they are reused in 2 or more places.

## MVC Folder Structure
- Follow the MVC pattern strictly across the entire codebase.
- `database` — Models only. Defines database schema and database interaction.
- `routes` — Views only. Handles incoming requests and outgoing responses. No logic.
- `logics` — Controllers only. Contains all business logic and orchestration between model and view.
- `utils` — Helper functions only — exception handling, logging, and shared utilities.

## Function Composition & Layout
- Name all functions and variables in a way that clearly describes what they hold or do. No abbreviations or vague names.
- Never use type hints for function parameters or return types.
- Never return a value directly from a function call or an inline expression. Always assign the result to a named variable first, then return that variable.
- When a parent function calls a child function, pass only the exact parameters the child needs — never pass a whole object/state just because it's convenient. Likewise, a child function should return only the exact value the parent needs — never return extra data "just in case." Keeps data flow explicit and easy to trace.
- Always define child (helper) functions ABOVE the parent function that calls them in the same file. When reading top to bottom, helpers should appear first, followed by the function that orchestrates them — so the file reads in the same order it executes.

## Libraries & Dependencies
- Always check for an existing well-maintained npm package before building anything
  from scratch. Suggest the package to the developer — do not reinvent the wheel.
- Never run npm install/uninstall commands directly. Always tell the developer what
  to run and why.
- Never write to `package.json` directly. Always tell the developer what to add and
  let them confirm.

## Error & Exception Handling
- Never write try/except blocks directly in code. Always use the exception handler decorator defined in the `utils` directory.
- To surface an error to the user, raise `AppException` available in `utils/exceptionHandler.py`.
- Only generate a raw exception for purely technical errors that are not user-facing.
