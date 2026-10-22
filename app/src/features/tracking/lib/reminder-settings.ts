import notifee, {
  AuthorizationStatus,
  type NotificationSettings,
} from '@notifee/react-native';
import { Alert, Linking, Platform } from 'react-native';

function readIsNotificationAuthorized(
  notificationSettings: NotificationSettings,
): boolean {
  const authorizationStatus = notificationSettings.authorizationStatus;
  const isAuthorized =
    authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === AuthorizationStatus.PROVISIONAL;
  return isAuthorized;
}

export async function readAreNotificationsEnabled(): Promise<boolean> {
  const notificationSettings = await notifee.getNotificationSettings();
  const areEnabled = readIsNotificationAuthorized(notificationSettings);
  return areEnabled;
}

async function readAreNotificationsEnabledAfterRequesting(): Promise<boolean> {
  const settingsAfterRequest = await notifee.requestPermission();
  const isAuthorizedAfterRequest =
    readIsNotificationAuthorized(settingsAfterRequest);
  return isAuthorizedAfterRequest;
}

async function openAppNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}

async function openBatteryOptimizationScreen(): Promise<void> {
  await notifee.openBatteryOptimizationSettings();
}

function showNotificationsOffAlert(): void {
  Alert.alert(
    'Reminders are off',
    'Turn on notifications for this app to get call reminders on time.',
    [
      { text: 'Later', style: 'cancel' },
      { text: 'Open settings', onPress: openAppNotificationSettings },
    ],
  );
}

function showBatteryAlert(): void {
  Alert.alert(
    'Keep reminders coming',
    "Your phone stops this app to save battery. On the next screen, pick 'All apps', tap this app, and choose 'Don't optimize'.",
    [
      { text: 'Later', style: 'cancel' },
      { text: 'Open settings', onPress: openBatteryOptimizationScreen },
    ],
  );
}

export async function ensureRemindersAreReady(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const areNotificationsEnabled = await readAreNotificationsEnabled();
  let areRemindersReady = areNotificationsEnabled;
  if (!areRemindersReady) {
    areRemindersReady = await readAreNotificationsEnabledAfterRequesting();
  }
  if (!areRemindersReady) {
    showNotificationsOffAlert();
    return false;
  }
  const isBatterySavingOn = await notifee.isBatteryOptimizationEnabled();
  if (isBatterySavingOn) {
    showBatteryAlert();
  }
  return true;
}
