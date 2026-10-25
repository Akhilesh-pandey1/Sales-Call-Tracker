import type { MatchedPendingCall } from './call-log-matcher';
import { markPendingCallFilled, type PendingCall } from '../db';
import type { CallOutcome } from '../types';
import { recordCallInHistory } from './call-history-recorder';

function toPendingCallMapByCallId(pendingCalls: PendingCall[]): Map<string, PendingCall> {
  const pendingCallsByCallId = new Map<string, PendingCall>();
  for (const pendingCall of pendingCalls) {
    pendingCallsByCallId.set(pendingCall.callId, pendingCall);
  }
  return pendingCallsByCallId;
}

export function toPendingCallOutcome(pendingCall: PendingCall): CallOutcome {
  const pendingCallOutcome: CallOutcome = {
    interested: pendingCall.interested,
    doNotCall: pendingCall.doNotCall,
    notes: pendingCall.notes,
  };
  return pendingCallOutcome;
}

export async function fillPendingCallAndRecordHistory(
  pendingCall: PendingCall,
  dialedAt: string,
  durationSeconds: number,
  outcome: CallOutcome,
): Promise<void> {
  await markPendingCallFilled(pendingCall.callId, dialedAt, durationSeconds);
  await recordCallInHistory(
    pendingCall.phoneNumber,
    pendingCall.direction,
    dialedAt,
    durationSeconds,
    outcome,
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
    const matchedCallOutcome = toPendingCallOutcome(pendingCall);
    await fillPendingCallAndRecordHistory(
      pendingCall,
      match.dialedAt,
      match.durationSeconds,
      matchedCallOutcome,
    );
  }
}
