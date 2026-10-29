import { setBookedLeadReminder, setBookedNumberReminder } from './call-reminders';
import {
  readIsMyListNumberInterested,
  saveScheduledReminder,
  type ScheduledReminder,
} from '../db';
import { readAreNotificationsEnabled } from './reminder-settings';

jest.mock('@/config/app-config', () => ({
  scheduleExpireMs: 24 * 60 * 60 * 1000,
}));
jest.mock('../db', () => ({
  deleteScheduledRemindersByLeadIdList: jest.fn(),
  readAllScheduledReminders: jest.fn(),
  readIsMyListNumberInterested: jest.fn(),
  saveScheduledReminder: jest.fn(),
}));
jest.mock('./reminder-settings', () => ({
  readAreNotificationsEnabled: jest.fn(),
}));
jest.mock('@/features/auth', () => ({
  readStoredCountry: jest.fn(),
}));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    cancelTriggerNotification: jest.fn(),
    createChannel: jest.fn(),
    createTriggerNotification: jest.fn(),
    getNotificationSettings: jest.fn(),
  },
  AlarmType: {
    SET_AND_ALLOW_WHILE_IDLE: 'set-and-allow-while-idle',
    SET_EXACT_AND_ALLOW_WHILE_IDLE: 'set-exact-and-allow-while-idle',
  },
  AndroidImportance: { HIGH: 4 },
  AndroidNotificationSetting: { ENABLED: 1 },
  TriggerType: { TIMESTAMP: 1 },
}));

const readIsMyListNumberInterestedMock = jest.mocked(readIsMyListNumberInterested);
const saveScheduledReminderMock = jest.mocked(saveScheduledReminder);
const readAreNotificationsEnabledMock = jest.mocked(readAreNotificationsEnabled);

beforeEach(() => {
  readIsMyListNumberInterestedMock.mockReset();
  saveScheduledReminderMock.mockReset();
  readAreNotificationsEnabledMock.mockResolvedValue(false);
});

const bookedLeadId = 42;
const bookedPhoneNumber = '+919876543210';
const bookedAt = '2026-11-03T09:00:00.000Z';

function makeLeadReminder(
  reminderOverrides: Partial<ScheduledReminder>,
): ScheduledReminder {
  return {
    leadId: bookedLeadId,
    phoneNumber: bookedPhoneNumber,
    scheduledAt: bookedAt,
    notes: null,
    interested: false,
    ...reminderOverrides,
  };
}

test('a booking whose call chose Interested saves the tag on', async () => {
  readIsMyListNumberInterestedMock.mockResolvedValue(false);
  await setBookedNumberReminder(bookedPhoneNumber, bookedAt, null, true);
  const savedReminder = saveScheduledReminderMock.mock.calls[0][0];
  expect(savedReminder.phoneNumber).toBe(bookedPhoneNumber);
  expect(savedReminder.interested).toBe(true);
});

test('a booking for a number flagged Interested in My List saves the tag on', async () => {
  readIsMyListNumberInterestedMock.mockResolvedValue(true);
  await setBookedNumberReminder(bookedPhoneNumber, bookedAt, null, false);
  const savedReminder = saveScheduledReminderMock.mock.calls[0][0];
  expect(readIsMyListNumberInterestedMock).toHaveBeenCalledWith(bookedPhoneNumber);
  expect(savedReminder.interested).toBe(true);
});

test('a plain booking saves no tag', async () => {
  readIsMyListNumberInterestedMock.mockResolvedValue(false);
  await setBookedNumberReminder(bookedPhoneNumber, bookedAt, null, false);
  const savedReminder = saveScheduledReminderMock.mock.calls[0][0];
  expect(savedReminder.interested).toBe(false);
});

test('rebooking a tagged number from a plain call sets the tag fresh', async () => {
  readIsMyListNumberInterestedMock.mockResolvedValue(false);
  await setBookedNumberReminder(bookedPhoneNumber, bookedAt, null, true);
  const rebookedAt = '2026-11-05T15:30:00.000Z';
  await setBookedNumberReminder(bookedPhoneNumber, rebookedAt, null, false);
  const firstSavedReminder = saveScheduledReminderMock.mock.calls[0][0];
  const secondSavedReminder = saveScheduledReminderMock.mock.calls[1][0];
  expect(firstSavedReminder.interested).toBe(true);
  expect(secondSavedReminder.scheduledAt).toBe(rebookedAt);
  expect(secondSavedReminder.interested).toBe(false);
});

test('a lead booking carries the interested choice of its call', async () => {
  readIsMyListNumberInterestedMock.mockResolvedValue(false);
  await setBookedLeadReminder(
    makeLeadReminder({ leadId: bookedLeadId, interested: true }),
  );
  const savedReminder = saveScheduledReminderMock.mock.calls[0][0];
  expect(savedReminder.leadId).toBe(bookedLeadId);
  expect(savedReminder.interested).toBe(true);
});

test('a lead booking for a flagged list number picks up the mark', async () => {
  readIsMyListNumberInterestedMock.mockResolvedValue(true);
  await setBookedLeadReminder(makeLeadReminder({ interested: false }));
  const savedReminder = saveScheduledReminderMock.mock.calls[0][0];
  expect(savedReminder.interested).toBe(true);
});
