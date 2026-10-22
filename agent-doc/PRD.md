# PRD — Scheduled Lead Expiry

## Background scheduler for expired bookings

- A background scheduler runs a cleanup job every 1 hour.
- The scheduler is APScheduler (Python).
- The job finds every lead whose scheduled time has passed and whose booking is older than the expiry window (`SCHEDULE_EXPIRE_HOURS`).
- The job clears those bookings: `scheduled_by = None`, `scheduled_at = None`.
- Cleared leads return to the shared lead pool, so any salesperson can get them again.
- The clear-on-request inside `serve_next_lead` is removed — the hourly scheduler is the only place that releases expired bookings.

## Calls by hour — values inside the bars

- Each bar keeps its total value on top of the bar; that stays as it is.
- Inside each bar, the outgoing and incoming counts must sit in the vertical middle of their own colored segment — outgoing count centered in the outgoing part, incoming count centered in the incoming part.
- This matches the calls-by-hour chart on the website.

## Dialer — call from the salesperson's chosen SIM number

- The salesperson picks their SIM by phone number once, in the app's settings — never by slot.
- At every dial, the app reads the active SIMs and their numbers (`READ_PHONE_STATE`, already asked at login).
- The app finds the slot where that number currently lives and places the call on that slot with no SIM picker (`TelecomManager.placeCall` with the SIM's account handle).
- If the stored number is not present in any slot, the app shows an error — "This SIM number is not in the phone" — and does not dial.
- Numbers are matched only after normalizing format (`+91…` vs `0…`).
- If a SIM's number cannot be read from the phone, the app asks the user to pick from the readable numbers once.
- Salespeople can swap SIMs between slots; the next call automatically follows the number.

## Reminder notification — show the app icon

- Today the reminder notification comes without the app icon — it shows a blank or plain shape.
- The reminder notification must show the app icon.
- The status-bar icon must be a dedicated white-on-transparent notification icon, set as the notification's small icon (`notifee` `android.smallIcon`) — Android flattens any colored icon to plain white there, so the normal app icon cannot be used.
- In the notification drawer, the full-color app icon shows as the large icon.
