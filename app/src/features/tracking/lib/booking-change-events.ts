import { createAppEvent } from '@/shared/utils/app-event';

const bookingsChangedEvent = createAppEvent<void>();

export const subscribeToBookingsChanged: (listener: () => void) => () => void =
  bookingsChangedEvent.subscribe;
export const emitBookingsChanged: () => void = bookingsChangedEvent.emit;
