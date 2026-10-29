import { setBookedLeadReminder } from '@/features/tracking';
import { bookLeadReminderWhenScheduled } from './book-lead-reminder-when-scheduled';

jest.mock('@/features/tracking', () => ({
  setBookedLeadReminder: jest.fn(),
}));

const setBookedLeadReminderMock = jest.mocked(setBookedLeadReminder);

beforeEach(() => {
  setBookedLeadReminderMock.mockClear();
});

const leadId = 42;
const leadPhoneNumber = '+919876543210';
const scheduledAt = '2026-11-03T09:00:00.000Z';
const bookingNote = 'Wants the follow-up Tuesday';

test('a scheduled save books the reminder for that lead with its time and note', async () => {
  await bookLeadReminderWhenScheduled(
    leadId,
    leadPhoneNumber,
    scheduledAt,
    false,
    bookingNote,
  );
  expect(setBookedLeadReminderMock).toHaveBeenCalledWith({
    leadId,
    phoneNumber: leadPhoneNumber,
    scheduledAt,
    notes: bookingNote,
  });
});

test('a refused schedule books nothing', async () => {
  await bookLeadReminderWhenScheduled(
    leadId,
    leadPhoneNumber,
    scheduledAt,
    true,
    bookingNote,
  );
  expect(setBookedLeadReminderMock).not.toHaveBeenCalled();
});

test('a save without a schedule books nothing', async () => {
  await bookLeadReminderWhenScheduled(
    leadId,
    leadPhoneNumber,
    null,
    false,
    bookingNote,
  );
  expect(setBookedLeadReminderMock).not.toHaveBeenCalled();
});
