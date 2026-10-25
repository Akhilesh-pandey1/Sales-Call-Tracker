## Task 1: App — a tapped number fills the Dialer keypad

**Description:** One Android intent filter on the main activity answers `tel:` dial links, so a number tapped in Contacts, WhatsApp, a browser, or SMS opens our app with the number already typed in the Dialer keypad, Call button ready. The app never becomes the default phone app.

**Blocked by:** None

**Status:** Not started

**Acceptance criteria:**
- [ ] The main activity's manifest gains one intent filter answering `tel:` dial intents — no call-screen or incoming-call service is registered, so the phone's own call screens stay Android's (`specs/tapped-number-capture.md` — Catch tapped numbers through Android's chooser; `structure.md` — the Android manifest).
- [ ] The app reads the incoming link, cleans the number to plus and digits, and fills the Dialer keypad with Call ready — backing out leaves the number in the keypad with nothing dialed, and an empty or unreadable link opens the dialer normally with nothing filled (`specs/tapped-number-capture.md` — Caught number fills the keypad; `structure.md` — `dialer-screen.tsx`).
- [ ] A call started from a caught number follows the normal keypad flow — on the chosen SIM, recorded like every call, with the normal post-call popup; a Do-not-track number still calls and is never recorded; with no SIM picked the call leaves on the phone default (`specs/tapped-number-capture.md` — Caught calls follow the keypad call rules).

**Verification:**
- [ ] Lint passes: `npm run lint` in `app/`
- [ ] Types pass: `npx tsc --noEmit` in `app/`

## Task 2: App — caught numbers are ignored during the lead call flow

**Description:** While the automated lead call flow is on screen, a caught number changes nothing — the live flow keeps its number and its state; the Copy button stays the way to dial elsewhere.

**Blocked by:** 1

**Status:** Not started

**Acceptance criteria:**
- [ ] A tapped number arriving while the automated lead call flow is on screen is ignored — the lead flow keeps its number and its state, and no keypad fill happens (`specs/tapped-number-capture.md` — Live lead flow stays undisturbed).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 3: App — the login pass asks once to catch tapped numbers

**Description:** The login permission pass gains one step in the same step-by-step style: it checks quietly which app handles tapped numbers, skips silently when ours already does, and otherwise shows one short instruction line and fires Android's chooser once — the probe number is never dialed. Left unpicked, the step returns at the next login.

**Blocked by:** 1

**Status:** Not started

**Acceptance criteria:**
- [ ] The step checks quietly which app handles tapped numbers and shows nothing at all when ours already does — no dialog, no banner (`specs/tapped-number-capture.md` — One-time setup at the login pass).
- [ ] When ours does not, the step shows one short instruction line and fires Android's chooser once; the probe number is never dialed (`specs/tapped-number-capture.md` — One-time setup at the login pass).
- [ ] Leaving the step without picking brings it back at the next login pass, until picked (`specs/tapped-number-capture.md` — One-time setup at the login pass).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`

## Task 4: App — Don't-show-again hides the login step forever

**Description:** The tapped-number login step gains a "Don't show again" button, found only on that step; tapping it saves the refusal on the phone permanently, and the step never appears again even when the app is never picked.

**Blocked by:** 3

**Status:** Not started

**Acceptance criteria:**
- [ ] The "Don't show again" button appears only on the tapped-number login step; tapping it saves the refusal on the phone (`specs/tapped-number-capture.md` — Don't-show-again is permanent and lives only on that screen).
- [ ] After the refusal, the step never appears at any later login, even though the app is never picked (`specs/tapped-number-capture.md` — Don't-show-again is permanent and lives only on that screen).
- [ ] No other screen ever shows a tapped-number prompt or a "Don't show again" for it (`specs/tapped-number-capture.md` — Don't-show-again is permanent and lives only on that screen).

**Verification:**
- [ ] Lint and types pass: `npm run lint` and `npx tsc --noEmit` in `app/`
