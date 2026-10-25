import { setBookedNumberReminder } from '@/features/tracking';
import type { LaunchedCall } from './call-launcher';

export async function bookNumberWhenScheduled(
  launchedCall: LaunchedCall | null,
  scheduledAt: string | null,
  scheduleWasRefused: boolean,
): Promise<void> {
  const canBookReminder =
    launchedCall !== null && scheduledAt !== null && !scheduleWasRefused;
  if (!canBookReminder) {
    return;
  }
  await setBookedNumberReminder(launchedCall.phoneNumber, scheduledAt);
}
