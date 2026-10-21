import { readStoredCountry } from '@/features/auth';
import { syncCalls } from '../api/calls.api';
import {
  getPendingCallById,
  markPendingCallFilled,
  markPendingCallsSynced,
  type PendingCall,
} from '../db';
import { safeReadCallLogEntries } from './call-log-reader';

import {
  matchPendingCallsToLogEntries,
  type MatchedPendingCall,
} from './call-log-matcher';
import { deleteSyncedCallsBehindSweepLine } from './synced-call-cleanup';
import { toSyncCallOrNull } from './sync-call';

async function findMatchingLogEntry(
  pendingCall: PendingCall,
): Promise<MatchedPendingCall | null> {
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    const noCountryMatch = null;
    return noCountryMatch;
  }
  const intentTimeMs = new Date(pendingCall.intentAt).getTime();
  const readUntilTimeMs = Date.now();
  const submitWarnMessage = 'Could not read the call log on this phone.';
  const callLogEntries = await safeReadCallLogEntries(
    intentTimeMs,
    readUntilTimeMs,
    submitWarnMessage,
  );
  if (callLogEntries === null) {
    const noLogEntries = null;
    return noLogEntries;
  }
  const matches = matchPendingCallsToLogEntries([pendingCall], callLogEntries, countryCode);
  const firstMatch = matches.length === 0 ? null : matches[0];
  return firstMatch;
}

async function sendPendingCallToServer(
  pendingCall: PendingCall,
  scheduledAt: string | null = null,
): Promise<void> {
  const syncCall = toSyncCallOrNull(pendingCall, scheduledAt);
  if (syncCall === null) {
    return;
  }
  try {
    await syncCalls([syncCall]);
  } catch (sendError: unknown) {
    console.warn('The call stays saved on the phone until the server is reachable.', sendError);
    return;
  }
  await markPendingCallsSynced([pendingCall.callId]);
  await deleteSyncedCallsBehindSweepLine();
}

export async function submitTrackedCall(
  callId: string,
  scheduledAt: string | null = null,
): Promise<void> {
  const pendingCall = await getPendingCallById(callId);
  if (pendingCall === null) {
    return;
  }
  if (pendingCall.durationSeconds !== null) {
    await sendPendingCallToServer(pendingCall, scheduledAt);
    return;
  }
  const matchedEntry = await findMatchingLogEntry(pendingCall);
  if (matchedEntry === null) {
    return;
  }
  await markPendingCallFilled(
    pendingCall.callId,
    matchedEntry.dialedAt,
    matchedEntry.durationSeconds,
  );
  const filledPendingCall: PendingCall = {
    ...pendingCall,
    dialedAt: matchedEntry.dialedAt,
    durationSeconds: matchedEntry.durationSeconds,
  };
  await sendPendingCallToServer(filledPendingCall, scheduledAt);
}
