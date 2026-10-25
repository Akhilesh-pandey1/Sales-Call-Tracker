import { insertCallHistoryRow } from '../db';
import type { CallDirection, CallOutcome } from '../types';
import { readIsDoNotTrackNumber } from './do-not-track-check';
import { removeScheduledReminderForNumber } from './call-reminders';
import { markCalledMyListRowForNumber } from './my-list-called-marker';

export async function recordCallInHistory(
  phoneNumber: string,
  direction: CallDirection,
  callAt: string,
  durationSeconds: number,
  outcome: CallOutcome,
): Promise<void> {
  const historySaveWarnMessage = 'Could not save the call to history.';
  try {
    const isDoNotTrackNumber = await readIsDoNotTrackNumber(phoneNumber);
    if (isDoNotTrackNumber) {
      return;
    }
    await insertCallHistoryRow(phoneNumber, direction, callAt, durationSeconds);
  } catch (historyError: unknown) {
    console.warn(historySaveWarnMessage, historyError);
    return;
  }
  const outgoingCallDirection = 'outgoing';
  const isOutgoingCall = direction === outgoingCallDirection;
  if (!isOutgoingCall) {
    return;
  }
  const handledBookingRemovalWarnMessage = 'Could not remove the handled booking.';
  try {
    await removeScheduledReminderForNumber(phoneNumber);
  } catch (removalError: unknown) {
    console.warn(handledBookingRemovalWarnMessage, removalError);
  }
  await markCalledMyListRowForNumber(phoneNumber, outcome, callAt);
}
