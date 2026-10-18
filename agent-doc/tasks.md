## Task 1: Give the bottom tab bar its icons

**Description:** The Dialer and My Stats tabs currently render no icon (Decision 143). Add a `tabBarIcon` to each tab in `app-navigator.tsx` through the app's existing `Icon` component — phone icon for Dialer, bar-chart icon for My Stats — active in the primary color, inactive in gray, matching the approved app mockups. No new dependency.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] The Dialer tab shows a phone icon and the My Stats tab shows a bar-chart icon, active in primary color and inactive in gray
- [ ] Icons come from the existing `Icon` component with lucide icons — no new package

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 2: Add Settings as the third bottom tab

**Description:** Settings is currently a hidden screen (`tabBarButton: () => null`, Decision 143). Un-hide it as the third tab in `app-navigator.tsx` with the gear icon, so Settings opens straight from the bottom bar like Dialer and My Stats.

**Blocked by:** Task 1

**Status:** Not started

**Acceptance criteria:**
- [ ] The tab bar shows a third Settings tab with the gear icon, and tapping it opens the existing Settings screen
- [ ] The Settings screen still works from the tab — including the clear-local-data action

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 3: Remove the old Settings entry points

**Description:** With Settings living in the bottom bar (Decision 143), the old ways in are gone. Remove the gear button from the top of the My Stats header — the header keeps the avatar and name — and remove the back arrow from the Settings screen header, which keeps its plain "Settings" title because a tab is a top-level screen.

**Blocked by:** Task 2

**Status:** Not started

**Acceptance criteria:**
- [ ] The My Stats header shows only the avatar and name — no gear button
- [ ] The Settings screen shows the title "Settings" with no back arrow

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 4: Start screen content below the status bar

**Description:** App content currently draws up under the camera and time/battery strip (Decision 147). Add top safe-area padding from `react-native-safe-area-context` (already installed) to the four screens — Login, Dialer, My Stats, Settings — so content starts below the status bar on every device. Nothing else about the layouts changes.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] Login, Dialer, My Stats, and Settings all start their content below the status bar using the top safe-area inset
- [x] Screen layouts are otherwise unchanged

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 5: Start calls directly in the Android call screen

**Description:** `Linking.openURL('tel:…')` in `call-launcher.ts` sends the number through whatever dialer app the phone picks (Decision 144). With CALL_PHONE granted, start the call immediately with Android's direct-call intent (ACTION_CALL) fired through `react-native-intent-launcher` (Decision 146) — the pending-call row is still written first, so tracking is unchanged. Without CALL_PHONE, the current handing-over fallback stays exactly as is (Decision 145). A failed direct call surfaces the existing "Could not start the call. Please try again." message. Repo rule: the agent never runs installs — tell the developer to run `npm install react-native-intent-launcher` in `app/`, then run verification.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] With CALL_PHONE granted, tapping Call (keypad or lead card) starts the call at once through ACTION_CALL and the pending-call row is written first
- [ ] Without CALL_PHONE, the Call button still hands the number to the phone's dialer via `tel:` and writes no pending-call row
- [ ] A failed direct call shows "Could not start the call. Please try again."

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)

---

## Task 6: Open the Call Outcome box directly when a call ends

**Description:** After an automated call ends, the app shows a "Call ended. Choose what happened." card and makes the person tap "Enter outcome" first (Decision 148). Rework the flow inside the existing hooks (`use-automated-calling.ts`) and `lead-call-card.tsx` so the Call Outcome dialog opens by itself the moment the call is over — driven by the real call-state end, or the app coming back to the foreground — and root-fix why the current auto-open silently missed. Closing the box without saving keeps the lead card with its Enter outcome button as the fallback.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] When an automated call ends, the Call Outcome dialog is already open on return — no "Enter outcome" middle step required
- [ ] Closing the dialog without saving keeps the lead card with a working Enter outcome button
- [ ] Save & Continue with auto-dial on starts the next lead's call immediately

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit` (from `app/`)
- [x] Lint passes: `npm run lint` (from `app/`)
