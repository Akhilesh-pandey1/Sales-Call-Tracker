import { createAppEvent } from './app-event';

const reminderPressEvent = createAppEvent<string>();

export const subscribeToReminderPress: (
  listener: (pressedPhoneNumber: string) => void,
) => () => void = reminderPressEvent.subscribe;
export const emitReminderPress: (pressedPhoneNumber: string) => void =
  reminderPressEvent.emit;
