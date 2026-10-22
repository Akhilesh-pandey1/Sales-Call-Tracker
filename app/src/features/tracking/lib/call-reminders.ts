import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AlarmType,
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  TriggerType,
  type NotificationSettings,
  type TimestampTrigger,
} from '@notifee/react-native';
import { readStoredCountry } from '@/features/auth';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';
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

function readIsNotificationAuthorized(
  notificationSettings: NotificationSettings,
): boolean {
  const authorizationStatus = notificationSettings.authorizationStatus;
  const isAuthorized =
    authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === AuthorizationStatus.PROVISIONAL;
  return isAuthorized;
}

async function readAreNotificationsEnabled(): Promise<boolean> {
  const notificationSettings = await notifee.getNotificationSettings();
  const areEnabled = readIsNotificationAuthorized(notificationSettings);
  return areEnabled;
}

async function readAreNotificationsEnabledAfterAskingOnce(): Promise<boolean> {
  const reminderPermissionAskedKey = 'reminder_permission_asked';
  const askedFlag = await AsyncStorage.getItem(reminderPermissionAskedKey);
  if (askedFlag !== null) {
    const alreadyAskedEnabled = await readAreNotificationsEnabled();
    return alreadyAskedEnabled;
  }
  await AsyncStorage.setItem(reminderPermissionAskedKey, 'asked');
  const settingsAfterRequest = await notifee.requestPermission();
  const isAuthorizedAfterAsk = readIsNotificationAuthorized(settingsAfterRequest);
  return isAuthorizedAfterAsk;
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
  const reminderNotification = {
    id: reminderNotificationId,
    title: reminderTitle,
    body: scheduledReminder.phoneNumber,
    data: { phone_number: scheduledReminder.phoneNumber },
    android: {
      channelId,
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
  const areNotificationsEnabled = await readAreNotificationsEnabledAfterAskingOnce();
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

export async function cancelReminderForCalledNumber(
  calledPhoneNumber: string,
): Promise<void> {
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    return;
  }
  const reminders = await readAllScheduledReminders();
  const calledNormalizedNumber = normalizePhoneNumber(calledPhoneNumber, countryCode);
  const matchedLeadIdList = reminders
    .filter(
      reminder =>
        normalizePhoneNumber(reminder.phoneNumber, countryCode) === calledNormalizedNumber,
    )
    .map(reminder => reminder.leadId);
  if (matchedLeadIdList.length === 0) {
    return;
  }
  await deleteScheduledRemindersByLeadIdList(matchedLeadIdList);
  const cancelTriggerList = matchedLeadIdList.map(leadId =>
    notifee.cancelTriggerNotification(toReminderNotificationId(leadId)),
  );
  await Promise.all(cancelTriggerList);
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
