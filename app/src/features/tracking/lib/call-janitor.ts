import { PermissionsAndroid } from 'react-native';
import {
  maxJanitorAttempts,
  minMsBetweenJanitorSweeps,
  stalePendingCallAgeMs,
} from '@/config/app-config';
import { readStoredCountry } from '@/features/auth';
import {
  addPendingCallAttempt,
  getAllPendingCalls,
  type PendingCall,
} from '@/features/tracking/db';
import { matchPendingCallsToLogEntries, type CallLogEntry } from './call-log-matcher';
import { safeReadCallLogEntries } from './call-log-reader';
import {
  fillMatchedPendingCalls,
  fillPendingCallAndRecordHistory,
  toPendingCallOutcome,
} from './pending-call-filler';

let janitorSweepPromise: Promise<void> | null = null;
let lastSweepStartedAtMs = 0;

function getIntentTimeMs(intentAt: string): number {
  const intentTimeMs = new Date(intentAt).getTime();
  return intentTimeMs;
}

function isStaleUnfilledPendingCall(
  pendingCall: PendingCall,
  nowMs: number,
): boolean {
  if (pendingCall.durationSeconds !== null) {
    return false;
  }
  const intentTimeMs = getIntentTimeMs(pendingCall.intentAt);
  if (Number.isNaN(intentTimeMs)) {
    return true;
  }
  return nowMs - intentTimeMs >= stalePendingCallAgeMs;
}

function getOldestIntentTimeMs(stalePendingCalls: PendingCall[]): number {
  const validIntentTimes = stalePendingCalls
    .map(pendingCall => getIntentTimeMs(pendingCall.intentAt))
    .filter(intentTimeMs => !Number.isNaN(intentTimeMs));
  if (validIntentTimes.length === 0) {
    return Date.now();
  }
  const oldestIntentTimeMs = Math.min(...validIntentTimes);
  return oldestIntentTimeMs;
}

async function strikeUnmatchedPendingCalls(
  stalePendingCalls: PendingCall[],
  matchedCallIds: Set<string>,
): Promise<void> {
  for (const stalePendingCall of stalePendingCalls) {
    if (matchedCallIds.has(stalePendingCall.callId)) {
      continue;
    }
    const attemptCount = await addPendingCallAttempt(stalePendingCall.callId);
    if (attemptCount >= maxJanitorAttempts) {
      const giveUpDurationSeconds = 0;
      const staleCallOutcome = toPendingCallOutcome(stalePendingCall);
      await fillPendingCallAndRecordHistory(
        stalePendingCall,
        stalePendingCall.intentAt,
        giveUpDurationSeconds,
        staleCallOutcome,
      );
    }
  }
}

async function completeStalePendingCalls(
  stalePendingCalls: PendingCall[],
  callLogEntries: CallLogEntry[],
  countryCode: string,
): Promise<void> {
  const matches = matchPendingCallsToLogEntries(
    stalePendingCalls,
    callLogEntries,
    countryCode,
  );
  const matchedCallIds = new Set(
    matches.map(match => match.callId),
  );
  await fillMatchedPendingCalls(matches, stalePendingCalls);
  await strikeUnmatchedPendingCalls(stalePendingCalls, matchedCallIds);
}

async function sweepStalePendingCalls(): Promise<void> {
  const isCallLogReadable = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
  );
  if (!isCallLogReadable) {
    return;
  }

  const nowMs = Date.now();
  const pendingCalls = await getAllPendingCalls();
  const stalePendingCalls = pendingCalls.filter(pendingCall =>
    isStaleUnfilledPendingCall(pendingCall, nowMs),
  );
  if (stalePendingCalls.length === 0) {
    return;
  }

  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    return;
  }

  const oldestIntentAtMs = getOldestIntentTimeMs(stalePendingCalls);
  const janitorWarnMessage = 'Could not read the call log for the janitor.';
  const callLogEntries = await safeReadCallLogEntries(
    oldestIntentAtMs,
    nowMs,
    janitorWarnMessage,
  );
  if (callLogEntries === null) {
    return;
  }

  try {
    await completeStalePendingCalls(
      stalePendingCalls,
      callLogEntries,
      countryCode,
    );
  } catch (sweepError: unknown) {
    console.warn('Could not complete the stale queued calls.', sweepError);
  }
}

async function startJanitorSweep(): Promise<void> {
  lastSweepStartedAtMs = Date.now();
  try {
    await sweepStalePendingCalls();
  } finally {
    janitorSweepPromise = null;
  }
}

export async function runJanitorSweep(): Promise<void> {
  if (janitorSweepPromise !== null) {
    await janitorSweepPromise;
    return;
  }
  const nowMs = Date.now();
  const isTooSoonAfterLastSweep =
    nowMs - lastSweepStartedAtMs < minMsBetweenJanitorSweeps;
  if (isTooSoonAfterLastSweep) {
    return;
  }
  const activeSweepPromise = startJanitorSweep();
  janitorSweepPromise = activeSweepPromise;
  await activeSweepPromise;
}
