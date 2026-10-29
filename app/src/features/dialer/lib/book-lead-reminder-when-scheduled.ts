import {
  setBookedLeadReminder,
  type ScheduledReminder,
} from '@/features/tracking';

async function bookLeadReminderWhenScheduled(
  leadId: number,
  leadPhoneNumber: string,
  scheduledAt: string | null,
  scheduleWasRefused: boolean,
  noteFromCall: string | null,
  choseInterestedOnCall: boolean,
): Promise<void> {
  const scheduledAtToBook = scheduleWasRefused ? null : scheduledAt;
  if (scheduledAtToBook === null) {
    return;
  }
  const bookedLeadReminder: ScheduledReminder = {
    leadId: leadId,
    phoneNumber: leadPhoneNumber,
    scheduledAt: scheduledAtToBook,
    notes: noteFromCall,
    interested: choseInterestedOnCall,
  };
  await setBookedLeadReminder(bookedLeadReminder);
}

export { bookLeadReminderWhenScheduled };
