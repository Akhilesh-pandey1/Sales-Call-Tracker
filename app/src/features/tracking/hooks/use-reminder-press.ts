import notifee, {
  EventType,
  type Event,
  type Notification,
} from '@notifee/react-native';
import { useEffect } from 'react';
import { removeScheduledReminderForNumber } from '../lib/call-reminders';
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

async function removePressedNumberBooking(
  pressedPhoneNumber: string,
): Promise<void> {
  const bookingRemovalWarnMessage = 'Could not remove the tapped booking.';
  try {
    await removeScheduledReminderForNumber(pressedPhoneNumber);
  } catch (removalError: unknown) {
    console.warn(bookingRemovalWarnMessage, removalError);
  }
}

function handlePressedReminderNotification(
  notification: Notification | null | undefined,
): void {
  const pressedPhoneNumber = readPressedPhoneNumber(notification);
  if (pressedPhoneNumber === null) {
    return;
  }
  emitReminderPress(pressedPhoneNumber);
  removePressedNumberBooking(pressedPhoneNumber);
}

function handlePressedReminderNotifeeEvent(notifeeEvent: Event): void {
  if (notifeeEvent.type !== EventType.PRESS) {
    return;
  }
  handlePressedReminderNotification(notifeeEvent.detail.notification);
}

async function handleInitialReminderNotification(): Promise<void> {
  const initialNotification = await notifee.getInitialNotification();
  if (initialNotification === null) {
    return;
  }
  handlePressedReminderNotification(initialNotification.notification);
}

export function useReminderPress(): void {
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(handlePressedReminderNotifeeEvent);
    handleInitialReminderNotification();
    return unsubscribe;
  }, []);
}
