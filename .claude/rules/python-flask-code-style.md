# Python Code Style & Standards
 
## File Structure
- Never exceed 800 lines of code per file.
- Write all code as functions. Never write class-based code.
- Functions must be between 10 to 50 lines. Never write 1–3 line functions. Write 7–10 line functions only if they are reused in 2 or more places.

## MVC Folder Structure
- Follow the MVC pattern strictly across the entire codebase.
- `database` — Models only. Defines database schema and database interaction.
- `routes` — Views only. Handles incoming requests and outgoing responses. No logic.
- `logics` — Controllers only. Contains all business logic and orchestration between model and view.
- `utils` — Helper functions only — exception handling, logging, and shared utilities.

## Imports
- Always place all import statements at the top of the file. Never import inside functions or conditions.
- If importing more than 4 names from a single module, use `*` instead — e.g., `from utils.helpers import *`.

## Naming Conventions
- Name all functions and variables in a way that clearly describes what they hold or do. No abbreviations or vague names.
- Never use type hints for function parameters or return types.

## Return Values
- Never return a value directly from a function call or an inline expression. Always assign the result to a named variable first, then return that variable.

## Error & Exception Handling
- Never write try/except blocks directly in code. Always use the exception handler decorator defined in the `utils` directory.
- To surface an error to the user, raise `AppException` available in `utils/exception_handler.py`.
- Only generate a raw exception for purely technical errors that are not user-facing.

## Libraries & Dependencies
- Always check for an existing library before building anything from scratch. Suggest the library to the developer — do not reinvent the wheel.
- Never overwrite `requirements.txt` without first asking and getting explicit confirmation from the developer.

## Code Quality
- Write code that is easy to read, understand, and maintain a year later without asking anyone.
- Readability always takes priority over cleverness or brevity