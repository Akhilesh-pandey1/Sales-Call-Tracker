import { setBookedNumberReminder } from '@/features/tracking';
import { bookScheduleAnswerAndClosePostCallDialog } from './book-schedule-answer-and-close-post-call-dialog';

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
const launchedCall = { callId: 'call-1', phoneNumber: calledPhoneNumber };
const closePostCallDialog = jest.fn();

beforeEach(() => {
  closePostCallDialog.mockClear();
});

test('a scheduled call again books the number, closes the popup, and returns the number to redial', async () => {
  const redialPhoneNumber = await bookScheduleAnswerAndClosePostCallDialog(
    launchedCall,
    scheduledAt,
    false,
    bookingNote,
    closePostCallDialog,
  );
  expect(setBookedNumberReminderMock).toHaveBeenCalledWith(
    calledPhoneNumber,
    scheduledAt,
    bookingNote,
  );
  expect(closePostCallDialog).toHaveBeenCalledTimes(1);
  expect(redialPhoneNumber).toBe(calledPhoneNumber);
});

test('a refused schedule still closes the popup and returns the number, booking nothing', async () => {
  const redialPhoneNumber = await bookScheduleAnswerAndClosePostCallDialog(
    launchedCall,
    scheduledAt,
    true,
    bookingNote,
    closePostCallDialog,
  );
  expect(setBookedNumberReminderMock).not.toHaveBeenCalled();
  expect(closePostCallDialog).toHaveBeenCalledTimes(1);
  expect(redialPhoneNumber).toBe(calledPhoneNumber);
});

test('an untracked call closes the popup and offers no number to redial', async () => {
  const redialPhoneNumber = await bookScheduleAnswerAndClosePostCallDialog(
    null,
    scheduledAt,
    false,
    bookingNote,
    closePostCallDialog,
  );
  expect(setBookedNumberReminderMock).not.toHaveBeenCalled();
  expect(closePostCallDialog).toHaveBeenCalledTimes(1);
  expect(redialPhoneNumber).toBeNull();
});
