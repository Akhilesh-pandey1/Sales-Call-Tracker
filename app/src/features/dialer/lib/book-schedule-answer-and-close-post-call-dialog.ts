import type { LaunchedCall } from './call-launcher';
import { bookNumberWhenScheduled } from './book-number-when-scheduled';

async function bookScheduleAnswerAndClosePostCallDialog(
  launchedCall: LaunchedCall | null,
  scheduledAt: string | null,
  scheduleWasRefused: boolean,
  noteFromCall: string | null,
  closePostCallDialog: () => void,
): Promise<string | null> {
  const calledPhoneNumber =
    launchedCall === null ? null : launchedCall.phoneNumber;
  await bookNumberWhenScheduled(
    calledPhoneNumber,
    scheduledAt,
    scheduleWasRefused,
    noteFromCall,
  );
  closePostCallDialog();
  return calledPhoneNumber;
}

export { bookScheduleAnswerAndClosePostCallDialog };
