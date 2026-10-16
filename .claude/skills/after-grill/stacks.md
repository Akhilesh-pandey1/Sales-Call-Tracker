# Stacks — Library Catalog

One catalog of known libraries — JS, Python, and React Native. Every entry says in one or two lines what exactly the library is used for. When any piece of work needs a library, this file is looked at first, so nothing is picked from memory alone and nothing is built from scratch without need. Simple code, less code, proven code — instead of reinventing the wheel.

## How this file is used

- Choosing a library for any piece: look here first. A match here is the default proposal.
- No match here: search for a well-made, well-maintained library, propose it with the reason, and add it to this file after agreement — so the next search starts here.
- Each library serves its own work only, as needed — never forced onto a piece that does not need it.
- This file never stores version numbers — versions go stale fast. When a library is chosen, its current stable version is found fresh by web search (or the package registry if search is down), and the version is written into the change surface with the library name.
- New entries: one or two lines — the library name and what exactly it is for. Numbered, one by one. A new language or platform gets its own section when its first library arrives.

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

## React Native (native CLI) libraries

These JS libraries from the list above also work in React Native unchanged: Axios, Zod, Zustand, TanStack Query, React Hook Form, react-i18next, Day.js. The web-only ones (shadcn/ui, TanStack Table, Driver.js, FilePond, Leaflet, FullCalendar, Recharts, SheetJS, jsPDF) have no place in mobile.

1. **React Native CLI** (`@react-native-community/cli`) — creates and runs a bare React Native project. The decided base for mobile: full native control, no Expo workflow.
2. **React Navigation** — screens, tabs, drawers, back button, deep links — the React Router of mobile. Bare projects also install `react-native-screens` and `react-native-gesture-handler` alongside it.
3. **NativeWind** — Tailwind for React Native — same class names as web Tailwind, applied to mobile components.
4. **react-native-reanimated** — smooth animations and gesture-driven motion. Runs on the UI thread, so the interface never stutters.
5. **react-native-svg** — renders SVG images in mobile. Required by icons and charts.
6. **lucide-react-native** — the same Lucide icons as the web list, built for mobile (needs react-native-svg).
7. **lottie-react-native** — the same Lottie animations as the web list, mobile version.
8. **react-native-mmkv** — tiny, very fast on-device key-value store: tokens, settings, small flags that must survive restart. Replaces AsyncStorage.
9. **WatermelonDB** — offline-first local database on the phone that syncs to the server later — the app keeps working with no internet.
10. **react-native-image-picker** — pick a photo or video from gallery or camera in one call — the simple path for avatars and uploads.
11. **react-native-vision-camera** — real camera screens: custom viewfinder, photo and video capture, QR/barcode scanning — when image-picker is not enough.
12. **@react-native-community/geolocation** — GPS: read the user's position once or watch it move.
13. **react-native-permissions** — one API for camera, location, microphone, and notification permission popups on both iOS and Android.
14. **@react-native-firebase/messaging** — push notifications: Firebase Cloud Messaging on Android, APNs on iOS.
15. **Notifee** — displaying and styling notifications once they arrive: channels, actions, sounds, ongoing notices.
16. **react-native-biometrics** — fingerprint and face unlock — the quick login step.
17. **react-native-device-info** — device model, OS version, app version — for logs, support screens, and error reports.
18. **react-native-config** — environment variables per build (dev / staging / prod) from `.env` files — same idea as the web `.env.example` rule.
19. **react-native-iap** — in-app purchases and subscriptions in both app stores.
20. **@testing-library/react-native** — component tests for mobile screens — the web testing library, for React Native.
21. **Detox** — end-to-end tests that drive the real app on an emulator or device — the Playwright of mobile.
22. **Fastlane** — automates building and shipping: code signing, screenshots, upload to Play Store and App Store — one command instead of manual steps.

## Services & Tools

Accounts and standalone tools — they work with both stacks. Free tiers cover a small app.

- **Sentry** — error tracking for JS, Python, and React Native. Any production error appears on a website within seconds: exact file, line, stack trace, and what the user did before it — on mobile, with device and app version. You find out before users complain.
- **PostHog** — product analytics: what users click, where they drop off. Open source, free tier.
- **k6** — load testing tool. Write the test in JavaScript, run from the terminal — fakes hundreds of users and reports where the API breaks and at what latency.
- **Resend** — email sending service. Developer API, 3,000 emails/month free, JS + Python SDKs.
- **Brevo** — email sending service. 300 free emails/day, plain SMTP — one setup works for both Flask and Node.

Email rule: sending is free; arriving needs trust. Send as your own domain, with SPF/DKIM records in your DNS — that decides Inbox vs spam. Gmail SMTP is for development testing only.
