import { readStoredCountry } from '@/features/auth';
import { syncCalls } from '../api/calls.api';
import {
  deletePendingCall,
  getPendingCallById,
  markPendingCallFilled,
  type PendingCall,
} from '../db';
import { readCallLogEntriesSince } from './call-log-reader';
import {
  matchPendingCallsToLogEntries,
  type MatchedPendingCall,
} from './call-log-matcher';
import { toSyncCallOrNull } from './sync-call';

async function findMatchingLogEntry(
  pendingCall: PendingCall,
): Promise<MatchedPendingCall | null> {
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    const noCountryMatch = null;
    return noCountryMatch;
  }
  try {
    const intentTimeMs = new Date(pendingCall.intentAt).getTime();
    const callLogEntries = await readCallLogEntriesSince(intentTimeMs);
    const matches = matchPendingCallsToLogEntries([pendingCall], callLogEntries, countryCode);
    const firstMatch = matches.length === 0 ? null : matches[0];
    return firstMatch;
  } catch (callLogError: unknown) {
    console.warn('Could not read the call log on this phone.', callLogError);
    const noLogMatch = null;
    return noLogMatch;
  }
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
  await deletePendingCall(pendingCall.callId);
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
