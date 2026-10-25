import { createAppEvent } from '@/shared/utils/app-event';

const tappedNumberEvent = createAppEvent<string>();

export const subscribeToTappedNumber: (
  listener: (tappedPhoneNumber: string) => void,
) => () => void = tappedNumberEvent.subscribe;
export const emitTappedNumber: (tappedPhoneNumber: string) => void =
  tappedNumberEvent.emit;
