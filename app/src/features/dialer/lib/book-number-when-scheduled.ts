import { setBookedNumberReminder } from '@/features/tracking';

export async function bookNumberWhenScheduled(
  phoneNumber: string | null,
  scheduledAt: string | null,
  scheduleWasRefused: boolean,
  notes: string | null,
  choseInterestedOnCall: boolean,
): Promise<void> {
  const canBookReminder =
    phoneNumber !== null && scheduledAt !== null && !scheduleWasRefused;
  if (!canBookReminder) {
    return;
  }
  await setBookedNumberReminder(phoneNumber, scheduledAt, notes, choseInterestedOnCall);
}
