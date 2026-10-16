import type { MatchedPendingCall } from './call-log-matcher';
import { markPendingCallFilled } from '../db';
import { emitCallFilled } from '../sync-events';

export async function fillMatchedPendingCalls(
  matches: MatchedPendingCall[],
  shouldEmitCallFilled: boolean,
): Promise<void> {
  for (const match of matches) {
    await markPendingCallFilled(match.callId, match.dialedAt, match.durationSeconds);
    if (shouldEmitCallFilled) {
      emitCallFilled();
    }
  }
}
