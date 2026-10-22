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
): Promise<boolean> {
  const syncCall = toSyncCallOrNull(pendingCall, scheduledAt);
  if (syncCall === null) {
    const scheduleWasRefused = false;
    return scheduleWasRefused;
  }
  let scheduleWasRefused = false;
  try {
    const syncResponse = await syncCalls([syncCall]);
    const refusedCallIds = syncResponse.schedule_refused_call_ids;
    scheduleWasRefused = refusedCallIds.includes(pendingCall.callId);
  } catch (sendError: unknown) {
    console.warn('The call stays saved on the phone until the server is reachable.', sendError);
    return scheduleWasRefused;
  }
  await markPendingCallsSynced([pendingCall.callId]);
  await deleteSyncedCallsBehindSweepLine();
  return scheduleWasRefused;
}

export async function submitTrackedCall(
  callId: string,
  scheduledAt: string | null = null,
): Promise<boolean> {
  const pendingCall = await getPendingCallById(callId);
  if (pendingCall === null) {
    const scheduleWasRefused = false;
    return scheduleWasRefused;
  }
  if (pendingCall.durationSeconds !== null) {
    const scheduleWasRefused = await sendPendingCallToServer(pendingCall, scheduledAt);
    return scheduleWasRefused;
  }
  const matchedEntry = await findMatchingLogEntry(pendingCall);
  if (matchedEntry === null) {
    const scheduleWasRefused = false;
    return scheduleWasRefused;
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
  const scheduleWasRefused = await sendPendingCallToServer(filledPendingCall, scheduledAt);
  return scheduleWasRefused;
}
