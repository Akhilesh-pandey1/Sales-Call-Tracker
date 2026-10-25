import notifee, {
  AlarmType,
  AndroidImportance,
  AndroidNotificationSetting,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import { readStoredCountry } from '@/features/auth';
import { scheduleExpireMs } from '@/config/app-config';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';
import { readAreNotificationsEnabled } from './reminder-settings';
import { emitBookingsChanged } from './booking-change-events';
import {
  deleteScheduledRemindersByLeadIdList,
  readAllScheduledReminders,
  saveScheduledReminder,
  type ScheduledReminder,
} from '../db';

function toReminderNotificationId(leadId: number): string {
  const reminderIdPrefix = 'reminder-';
  return `${reminderIdPrefix}${leadId}`;
}

function readReminderTimeOrNull(scheduledAt: string): number | null {
  const scheduledAtMs = new Date(scheduledAt).getTime();
  if (Number.isNaN(scheduledAtMs)) {
    return null;
  }
  return scheduledAtMs;
}

function toBookedNumberReminderKey(phoneNumber: string): number {
  const hashMultiplier = 31;
  const hashModulus = 2147483647;
  let hash = 0;
  for (const digit of phoneNumber) {
    const digitCode = digit.charCodeAt(0);
    hash = (hash * hashMultiplier + digitCode) % hashModulus;
  }
  const numberReminderKey = -(hash + 1);
  return numberReminderKey;
}

async function createReminderChannel(): Promise<string> {
  const reminderChannelId = 'reminder-channel';
  const reminderChannelName = 'Call reminders';
  const reminderChannel = {
    id: reminderChannelId,
    name: reminderChannelName,
    importance: AndroidImportance.HIGH,
  };
  const channelId = await notifee.createChannel(reminderChannel);
  return channelId;
}

async function showReminderTriggerWhenFuture(
  scheduledReminder: ScheduledReminder,
): Promise<void> {
  const scheduledAtMs = new Date(scheduledReminder.scheduledAt).getTime();
  const currentTimeMs = Date.now();
  const isReminderStillFuture =
    !Number.isNaN(scheduledAtMs) && scheduledAtMs > currentTimeMs;
  if (!isReminderStillFuture) {
    return;
  }
  const channelId = await createReminderChannel();
  const notificationSettings = await notifee.getNotificationSettings();
  const isExactAlarmAllowed =
    notificationSettings.android.alarm === AndroidNotificationSetting.ENABLED;
  const alarmType = isExactAlarmAllowed
    ? AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
    : AlarmType.SET_AND_ALLOW_WHILE_IDLE;
  const reminderNotificationId = toReminderNotificationId(scheduledReminder.leadId);
  const reminderTitle = 'Time to call';
  const pressActionDefaultId = 'default';
  const reminderSmallIconName = 'ic_reminder_icon';
  const reminderLargeIconName = 'ic_launcher';
  const reminderNotification = {
    id: reminderNotificationId,
    title: reminderTitle,
    body: scheduledReminder.phoneNumber,
    data: { phone_number: scheduledReminder.phoneNumber },
    android: {
      channelId,
      smallIcon: reminderSmallIconName,
      largeIcon: reminderLargeIconName,
      pressAction: { id: pressActionDefaultId },
    },
  };
  const reminderTrigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: scheduledAtMs,
    alarmManager: { type: alarmType },
  };
  await notifee.createTriggerNotification(reminderNotification, reminderTrigger);
}

export async function setBookedLeadReminder(
  scheduledReminder: ScheduledReminder,
): Promise<void> {
  await saveScheduledReminder(
    scheduledReminder.leadId,
    scheduledReminder.phoneNumber,
    scheduledReminder.scheduledAt,
  );
  emitBookingsChanged();
  const areNotificationsEnabled = await readAreNotificationsEnabled();
  if (!areNotificationsEnabled) {
    return;
  }
  try {
    await showReminderTriggerWhenFuture(scheduledReminder);
  } catch (reminderError: unknown) {
    console.warn(
      'The booking is saved. The reminder appears at the next app open.',
      reminderError,
    );
  }
}

export async function setBookedNumberReminder(
  phoneNumber: string,
  scheduledAt: string,
): Promise<void> {
  const numberReminderKey = toBookedNumberReminderKey(phoneNumber);
  const bookedNumberReminder: ScheduledReminder = {
    leadId: numberReminderKey,
    phoneNumber,
    scheduledAt,
  };
  await setBookedLeadReminder(bookedNumberReminder);
}

async function removeRemindersByLeadIdList(leadIdList: number[]): Promise<void> {
  await deleteScheduledRemindersByLeadIdList(leadIdList);
  const cancelTriggerList = leadIdList.map(leadId =>
    notifee.cancelTriggerNotification(toReminderNotificationId(leadId)),
  );
  await Promise.all(cancelTriggerList);
  emitBookingsChanged();
}

export async function removeScheduledReminderForNumber(
  handledPhoneNumber: string,
): Promise<void> {
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    return;
  }
  const reminders = await readAllScheduledReminders();
  const handledNormalizedNumber = normalizePhoneNumber(handledPhoneNumber, countryCode);
  const matchedLeadIdList = reminders
    .filter(
      reminder =>
        normalizePhoneNumber(reminder.phoneNumber, countryCode) === handledNormalizedNumber,
    )
    .map(reminder => reminder.leadId);
  if (matchedLeadIdList.length === 0) {
    return;
  }
  await removeRemindersByLeadIdList(matchedLeadIdList);
}

export async function removeHandledScheduledBookings(
  currentTimeMs: number,
): Promise<void> {
  const reminders = await readAllScheduledReminders();
  const expireCutoffMs = currentTimeMs - scheduleExpireMs;
  const handledLeadIdList = reminders
    .filter(reminder => {
      const reminderTimeMs = readReminderTimeOrNull(reminder.scheduledAt);
      return reminderTimeMs !== null && reminderTimeMs < expireCutoffMs;
    })
    .map(reminder => reminder.leadId);
  if (handledLeadIdList.length === 0) {
    return;
  }
  await removeRemindersByLeadIdList(handledLeadIdList);
}

export async function rebuildBookedLeadReminders(): Promise<void> {
  const areNotificationsEnabled = await readAreNotificationsEnabled();
  if (!areNotificationsEnabled) {
    return;
  }
  const reminders = await readAllScheduledReminders();
  const showTriggerList = reminders.map(reminder =>
    showReminderTriggerWhenFuture(reminder),
  );
  await Promise.all(showTriggerList);
}
