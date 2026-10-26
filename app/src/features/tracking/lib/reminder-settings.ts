import notifee, {
  AuthorizationStatus,
  type NotificationSettings,
} from '@notifee/react-native';
import { Linking, Platform } from 'react-native';
import {
  isBatteryOptimizationEnabled,
  requestIgnoreBatteryOptimization,
} from './battery-module';
import { showAlertAndWaitForClose } from './show-alert-and-wait';

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

async function showNotificationsOffAlert(): Promise<void> {
  await showAlertAndWaitForClose(
    'Reminders are off',
    'Turn on notifications for this app to get call reminders on time.',
    [
      { text: 'Later', style: 'cancel' },
      { text: 'Open settings', onPress: openAppNotificationSettings },
    ],
  );
}

async function requestBatteryExemptionWhenOptimized(): Promise<void> {
  const isBatteryOptimizationOn = await isBatteryOptimizationEnabled();
  if (isBatteryOptimizationOn) {
    await requestIgnoreBatteryOptimization();
  }
}

export async function ensureRemindersAreReady(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  const areNotificationsEnabled = await readAreNotificationsEnabled();
  if (!areNotificationsEnabled) {
    const areEnabledAfterRequest = await readAreNotificationsEnabledAfterRequesting();
    if (!areEnabledAfterRequest) {
      await showNotificationsOffAlert();
      return;
    }
  }
  await requestBatteryExemptionWhenOptimized();
}
