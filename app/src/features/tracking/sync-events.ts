import { createAppEvent } from './lib/app-event';

const callEndedEvent = createAppEvent<void>();

export const subscribeToCallEnded: (listener: () => void) => () => void =
  callEndedEvent.subscribe;
export const emitCallEnded: () => void = callEndedEvent.emit;
