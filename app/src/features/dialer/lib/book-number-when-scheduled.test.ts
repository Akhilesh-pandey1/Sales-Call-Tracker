import { setBookedNumberReminder } from '@/features/tracking';
import { bookNumberWhenScheduled } from './book-number-when-scheduled';

jest.mock('@/features/tracking', () => ({
  setBookedNumberReminder: jest.fn(),
}));

const setBookedNumberReminderMock = jest.mocked(setBookedNumberReminder);

beforeEach(() => {
  setBookedNumberReminderMock.mockClear();
});

const calledPhoneNumber = '+919876543210';
const scheduledAt = '2026-11-03T09:00:00.000Z';
const bookingNote = 'Wants the demo Tuesday';

test('a scheduled submit books the number with its call note', async () => {
  await bookNumberWhenScheduled(calledPhoneNumber, scheduledAt, false, bookingNote);
  expect(setBookedNumberReminderMock).toHaveBeenCalledWith(
    calledPhoneNumber,
    scheduledAt,
    bookingNote,
  );
});

test('a scheduled submit with no note books with no note', async () => {
  await bookNumberWhenScheduled(calledPhoneNumber, scheduledAt, false, null);
  expect(setBookedNumberReminderMock).toHaveBeenCalledWith(
    calledPhoneNumber,
    scheduledAt,
    null,
  );
});

test('a refused schedule books nothing', async () => {
  await bookNumberWhenScheduled(calledPhoneNumber, scheduledAt, true, bookingNote);
  expect(setBookedNumberReminderMock).not.toHaveBeenCalled();
});

test('a submit without a schedule books nothing', async () => {
  await bookNumberWhenScheduled(calledPhoneNumber, null, false, bookingNote);
  expect(setBookedNumberReminderMock).not.toHaveBeenCalled();
});
