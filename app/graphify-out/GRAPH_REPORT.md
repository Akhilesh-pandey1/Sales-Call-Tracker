# Graph Report - app  (2026-10-20)

## Corpus Check
- 81 files · ~18,180 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 506 nodes · 940 edges · 51 communities (24 shown, 27 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0096ef24`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dialer-screen.tsx
- my-stats-screen.tsx
- use-janitor.ts
- devDependencies
- tracking/index.ts
- use-lead-post-call.ts
- call-log-matcher.ts
- api-client.ts
- components.json
- tsconfig.json
- use-post-call-schedule.ts
- dependencies
- MainActivity
- MainApplication
- metro.config.js
- Apex Sales Call (Android)
- gradlew
- react-native-intent-launcher.d.ts
- native-only-animated-view.tsx
- class-variance-authority
- clsx
- libphonenumber-js
- lucide-react-native
- react-native
- @react-native-async-storage/async-storage
- react-native-call-detection-android
- react-native-call-log
- @react-native-clipboard/clipboard
- @react-native-community/datetimepicker
- react-native-intent-launcher
- react-native-permissions
- react-native-reanimated
- react-native-safe-area-context
- react-native-screens
- react-native-sqlite-storage
- react-native-svg
- react-native-worklets
- @react-navigation/native
- @rn-primitives/dialog
- @rn-primitives/portal
- @rn-primitives/slot
- tailwind-merge
- tailwindcss-animate
- tailwind.config.js

## God Nodes (most connected - your core abstractions)
1. `cn()` - 28 edges
2. `Text()` - 13 edges
3. `Icon()` - 12 edges
4. `Button()` - 11 edges
5. `runQuery()` - 10 edges
6. `getAllPendingCalls()` - 9 edges
7. `markPendingCallFilled()` - 9 edges
8. `matchPendingCallsToLogEntries()` - 9 edges
9. `readStoredCountry()` - 8 edges
10. `useLeadPostCall()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Dialog()` --references--> `react`  [EXTRACTED]
  src/components/ui/dialog.tsx → package.json
- `useDialogContext()` --references--> `react`  [EXTRACTED]
  src/components/ui/dialog.tsx → package.json
- `Icon()` --references--> `react`  [EXTRACTED]
  src/components/ui/icon.tsx → package.json
- `Text()` --references--> `react`  [EXTRACTED]
  src/components/ui/text.tsx → package.json
- `AppNavigator()` --calls--> `useJanitor()`  [EXTRACTED]
  src/app/navigation/app-navigator.tsx → src/features/tracking/hooks/use-janitor.ts

## Import Cycles
- None detected.

## Communities (51 total, 27 thin omitted)

### Community 0 - "dialer-screen.tsx"
Cohesion: 0.05
Nodes (61): react, react, Button(), ButtonProps, buttonTextVariants, buttonVariants, Card(), CardContent() (+53 more)

### Community 1 - "my-stats-screen.tsx"
Cohesion: 0.06
Nodes (39): AveragePerActiveDayStats, CallsByHourStats, fetchMyStats(), Last30DaysStats, PeriodStats, PersonStats, MyStatsState, useMyStats() (+31 more)

### Community 2 - "use-janitor.ts"
Cohesion: 0.11
Nodes (42): ClearLocalDataState, useClearLocalData(), SyncCall, syncCalls(), addOutcomeColumnWhenMissing(), addPendingCallAttempt(), clearAllPendingCalls(), countPendingCalls() (+34 more)

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (46): @babel/core, @babel/preset-env, @babel/runtime, eslint, devDependencies, @babel/core, @babel/preset-env, @babel/runtime (+38 more)

### Community 4 - "tracking/index.ts"
Cohesion: 0.07
Nodes (28): App(), displayName, name, AppNavigator(), DialerTabIcon, MainTabs, MyStatsTabIcon, SettingsTabIcon (+20 more)

### Community 5 - "use-lead-post-call.ts"
Cohesion: 0.12
Nodes (27): getLoginErrorMessage(), buildNextLeadRequestBody(), fetchNextLead(), isServedLead(), LeadScheduleRequest, NextLeadRequestBody, NextLeadResponseBody, ServedLead (+19 more)

### Community 6 - "call-log-matcher.ts"
Cohesion: 0.16
Nodes (19): readStoredCountry(), useDialer(), UseDialerResult, useStoredCountry(), createCallId(), LaunchedCall, launchTrackedCall(), rejectAfterTimeout() (+11 more)

### Community 7 - "api-client.ts"
Cohesion: 0.15
Nodes (19): LoginResponse, requestLogin(), LoginResult, buildLogoutRefusalMessage(), countUnsentCallsAfterSyncAttempt(), LogoutState, useLogout(), syncPendingCallsSafely() (+11 more)

### Community 8 - "components.json"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, rsc, $schema (+7 more)

### Community 9 - "tsconfig.json"
Cohesion: 0.15
Nodes (12): nativewind-env.d.ts, **/node_modules, **/Pods, @react-native/typescript-config, **/*.ts, **/*.tsx, compilerOptions, paths (+4 more)

### Community 10 - "use-post-call-schedule.ts"
Cohesion: 0.30
Nodes (11): PostCallDialog(), createDefaultScheduleDate(), createPickerWindow(), createTomorrowDate(), formatPaddedMinutes(), formatScheduleLabel(), formatTwelveHourClock(), getMeridiemLabel() (+3 more)

### Community 11 - "dependencies"
Cohesion: 0.29
Nodes (7): axios, nativewind, dependencies, axios, nativewind, @react-navigation/bottom-tabs, @react-navigation/bottom-tabs

### Community 12 - "MainActivity"
Cohesion: 0.33
Nodes (3): MainActivity, ReactActivity, ReactActivityDelegate

### Community 13 - "MainApplication"
Cohesion: 0.33
Nodes (4): MainApplication, Application, ReactApplication, ReactHost

### Community 14 - "metro.config.js"
Cohesion: 0.33
Nodes (4): config, { getDefaultConfig, mergeConfig }, path, { withNativeWind }

### Community 15 - "Apex Sales Call (Android)"
Cohesion: 0.33
Nodes (5): Apex Sales Call (Android), API base URL, Build the APK, Install on a phone, Requirements

### Community 16 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

## Knowledge Gaps
- **156 isolated node(s):** `displayName`, `$schema`, `style`, `components`, `utils` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `dialer-screen.tsx`, `devDependencies`, `class-variance-authority`, `clsx`, `libphonenumber-js`, `lucide-react-native`, `react-native`, `@react-native-async-storage/async-storage`, `react-native-call-detection-android`, `react-native-call-log`, `@react-native-clipboard/clipboard`, `@react-native-community/datetimepicker`, `react-native-intent-launcher`, `react-native-permissions`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-sqlite-storage`, `react-native-svg`, `react-native-worklets`, `@react-navigation/native`, `@rn-primitives/dialog`, `@rn-primitives/portal`, `@rn-primitives/slot`, `tailwind-merge`, `tailwindcss-animate`?**
  _High betweenness centrality (0.294) - this node is a cross-community bridge._
- **Why does `react` connect `dialer-screen.tsx` to `dependencies`?**
  _High betweenness centrality (0.268) - this node is a cross-community bridge._
- **Why does `Icon()` connect `dialer-screen.tsx` to `my-stats-screen.tsx`, `tracking/index.ts`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **What connects `displayName`, `$schema`, `style` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dialer-screen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05041797283176593 - nodes in this community are weakly interconnected._
- **Should `my-stats-screen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05731523378582202 - nodes in this community are weakly interconnected._
- **Should `use-janitor.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10588235294117647 - nodes in this community are weakly interconnected._