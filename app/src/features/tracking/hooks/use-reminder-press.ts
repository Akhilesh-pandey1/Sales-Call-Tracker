import notifee, {
  EventType,
  type Event,
  type Notification,
} from '@notifee/react-native';
import { useEffect } from 'react';
import { emitReminderPress } from '../lib/reminder-press-events';

function readPressedPhoneNumber(
  notification: Notification | null | undefined,
): string | null {
  const notificationData = notification?.data;
  if (notificationData === undefined) {
    return null;
  }
  const pressedPhoneNumber = notificationData.phone_number;
  if (typeof pressedPhoneNumber !== 'string') {
    return null;
  }
  return pressedPhoneNumber;
}

function emitReminderPressFromNotification(
  notification: Notification | null | undefined,
): void {
  const pressedPhoneNumber = readPressedPhoneNumber(notification);
  if (pressedPhoneNumber === null) {
    return;
  }
  emitReminderPress(pressedPhoneNumber);
}

function emitReminderPressFromNotifeeEvent(notifeeEvent: Event): void {
  if (notifeeEvent.type !== EventType.PRESS) {
    return;
  }
  emitReminderPressFromNotification(notifeeEvent.detail.notification);
}

async function emitReminderPressFromInitialNotification(): Promise<void> {
  const initialNotification = await notifee.getInitialNotification();
  if (initialNotification === null) {
    return;
  }
  emitReminderPressFromNotification(initialNotification.notification);
}

export function useReminderPress(): void {
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(emitReminderPressFromNotifeeEvent);
    emitReminderPressFromInitialNotification();
    return unsubscribe;
  }, []);
}
