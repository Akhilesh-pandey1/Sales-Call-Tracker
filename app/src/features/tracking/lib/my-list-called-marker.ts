import { markMyListNumberCalled } from '../db';
import type { CallOutcome } from '../types';
import { emitMyListChanged } from './my-list-change-events';

export async function markCalledMyListRowForNumber(
  phoneNumber: string,
  outcome: CallOutcome,
  calledAt: string,
): Promise<void> {
  const myListMarkWarnMessage = 'Could not mark the called My List number.';
  try {
    const isListNumberMarked = await markMyListNumberCalled(
      phoneNumber,
      outcome,
      calledAt,
    );
    if (isListNumberMarked) {
      emitMyListChanged();
    }
  } catch (markingError: unknown) {
    console.warn(myListMarkWarnMessage, markingError);
  }
}
