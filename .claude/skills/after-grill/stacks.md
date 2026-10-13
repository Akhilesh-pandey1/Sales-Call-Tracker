# Stacks — Library Catalog

One catalog of known libraries — JS and Python. Every entry says in one or two lines what exactly the library is used for. When any piece of work needs a library, this file is looked at first, so nothing is picked from memory alone and nothing is built from scratch without need. Simple code, less code, proven code — instead of reinventing the wheel.

## How this file is used

- Choosing a library for any piece: look here first. A match here is the default proposal.
- No match here: search for a well-made, well-maintained library, propose it with the reason, and add it to this file after agreement — so the next search starts here.
- Each library serves its own work only, as needed — never forced onto a piece that does not need it.
- New entries: one or two lines — the library name and what exactly it is for. Numbered, one by one. A new language gets its own section when its first library arrives.

## JS libraries

1. **shadcn/ui** — UI components. Very rich — hundreds of ready components: buttons, dialogs, drawers, tables, form shells. Copied into the project, so fully editable. These pieces are never hand-built. Works together with TanStack.
2. **TanStack Query** — fetches, caches, and syncs server data in React. Handles loading, error, retry, and refetch — no hand-rolled fetch hooks.
3. **Zod** — schema validation for forms and API data. One schema works on both client and server.
4. **Zustand** — small store for shared client state in React. Replaces Context + useReducer for global state.
5. **FilePond** — file upload for the front end. Drag and drop, progress, image preview, multiple files — no hand-built uploader.
6. **Axios** — HTTP client for calling APIs. Interceptors for auth tokens and error handling — the request layer under TanStack Query.
7. **Better Auth** — full auth framework: email/password, login with Google, server-side sessions, roles, rate limiting. Works with SQL and MongoDB.
8. **React Router** — routing for React. Handles role guards (a small wrapper component or loader redirect — "admin only" pages never open for others). The decided router.
9. **react-i18next** — multiple languages. All user-visible text lives in files per language (`en.json`, `hi.json`); `t('key')` shows the right one. Handles plurals, placeholders, lazy-loaded languages.
10. **React Hook Form** — forms, including multi-step forms (a big form split over many pages with Next/Back). One data store for the whole flow, Zod validates per step, back button loses nothing. shadcn/ui forms are built on it.
11. **Driver.js** — first-time walkthroughs: dims the page, highlights each button or area step by step with Next/Back/Done — the onboarding tour when a user arrives for the first time.
12. **Lottie** (lottie-react) — small animations for empty states ("no conversations yet"). Animation JSON files from LottieFiles.com — pick free ones by eye, drop into the project.
13. **unDraw** — free static illustrations for empty states and empty pages. One brand color recolors every SVG. 100% free, no attribution.
14. **lucide-react** — icons for buttons, menus, and everywhere. shadcn/ui's own icon set — one import per icon.
15. **TanStack Table** — tables with search, sort, and pagination — every admin panel's list. shadcn's DataTable is built on it.
16. **sonner** — toast popups ("Saved", "Upload failed"). shadcn/ui ships it built-in.
17. **Day.js** — dates and times. The rule it serves: store everything in UTC, show it in the user's timezone only at display time. Use with its `utc` and `timezone` plugins.
18. **FullCalendar** — real scheduling calendar: month/week/day views, drag and drop events between days, and every click/drop fires your own logic (open dialog, save, check clashes). Free core (MIT).
19. **Playwright** — end-to-end tests: drives a real browser like a real user — clicks, fills forms, checks what appears.
20. **jsPDF** — generate PDFs in the browser (invoices, receipts) — download without a server round-trip.
21. **Leaflet** — free maps with markers and click handlers, OpenStreetMap tiles — no API key, no per-load billing.
22. **pino** — structured logging for Node. Every log line is a JSON object (time, level, who, what) — survives restarts, ready for search.
23. **Recharts** — charts and dashboard graphs (line, bar, pie). The chart library shadcn/ui builds its charts on.
24. **SheetJS** — read and write Excel files (.xlsx) in the browser — the admin clicks Export, the file downloads. Default to xlsx; plain CSV needs no library.

## Python libraries

1. **Pydantic** — validation of data. Schemas for API requests, responses, and config — invalid data is caught before it moves through the app.
2. **Faker** — fakes realistic test data: names, emails, addresses, texts. Fills the database for testing without hand-made sample rows.
3. **Authlib** — login with Google (OAuth) and JWT for Flask. The proven standard for Python backends.
4. **WeasyPrint** — HTML and CSS in, pixel-perfect PDF out — invoices and reports, server-side.
5. **structlog** — structured logging: wraps Python's own logging. Bind `user_id` once per request — every log line after carries it. JSON output, ready for search.
6. **openpyxl** — write Excel reports (.xlsx) server-side — styled headers, multiple sheets, generated on demand.


## Services & Tools

Accounts and standalone tools — they work with both stacks. Free tiers cover a small app.

- **Sentry** — error tracking for JS and Python. Any production error appears on a website within seconds: exact file, line, stack trace, and what the user did before it. You find out before users complain.
- **PostHog** — product analytics: what users click, where they drop off. Open source, free tier.
- **k6** — load testing tool. Write the test in JavaScript, run from the terminal — fakes hundreds of users and reports where the API breaks and at what latency.
- **Resend** — email sending service. Developer API, 3,000 emails/month free, JS + Python SDKs.
- **Brevo** — email sending service. 300 free emails/day, plain SMTP — one setup works for both Flask and Node.

Email rule: sending is free; arriving needs trust. Send as your own domain, with SPF/DKIM records in your DNS — that decides Inbox vs spam. Gmail SMTP is for development testing only.
