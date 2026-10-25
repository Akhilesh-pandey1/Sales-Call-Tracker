import { createAppEvent } from '@/shared/utils/app-event';

const myListChangedEvent = createAppEvent<void>();

export const subscribeToMyListChanged: (listener: () => void) => () => void =
  myListChangedEvent.subscribe;
export const emitMyListChanged: () => void = myListChangedEvent.emit;
