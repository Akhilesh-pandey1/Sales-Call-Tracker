import type { MatchedPendingCall } from './call-log-matcher';
import { markPendingCallFilled, type PendingCall } from '../db';
import { recordCallInHistory } from './call-history-recorder';

function toPendingCallMapByCallId(pendingCalls: PendingCall[]): Map<string, PendingCall> {
  const pendingCallsByCallId = new Map<string, PendingCall>();
  for (const pendingCall of pendingCalls) {
    pendingCallsByCallId.set(pendingCall.callId, pendingCall);
  }
  return pendingCallsByCallId;
}

export async function fillPendingCallAndRecordHistory(
  pendingCall: PendingCall,
  dialedAt: string,
  durationSeconds: number,
): Promise<void> {
  await markPendingCallFilled(pendingCall.callId, dialedAt, durationSeconds);
  await recordCallInHistory(
    pendingCall.phoneNumber,
    pendingCall.direction,
    dialedAt,
    durationSeconds,
  );
}

export async function fillMatchedPendingCalls(
  matches: MatchedPendingCall[],
  pendingCalls: PendingCall[],
): Promise<void> {
  const pendingCallsByCallId = toPendingCallMapByCallId(pendingCalls);
  for (const match of matches) {
    const pendingCall = pendingCallsByCallId.get(match.callId);
    if (pendingCall === undefined) {
      await markPendingCallFilled(match.callId, match.dialedAt, match.durationSeconds);
      continue;
    }
    await fillPendingCallAndRecordHistory(pendingCall, match.dialedAt, match.durationSeconds);
  }
}
