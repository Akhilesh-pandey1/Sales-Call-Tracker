import type { MatchedPendingCall } from './call-log-matcher';
import { markPendingCallFilled } from '../db';

export async function fillMatchedPendingCalls(
  matches: MatchedPendingCall[],
): Promise<void> {
  for (const match of matches) {
    await markPendingCallFilled(match.callId, match.dialedAt, match.durationSeconds);
  }
}
