import { useEffect } from 'react';
import {
  AppState,
  PermissionsAndroid,
  type AppStateStatus,
  type Permission,
} from 'react-native';
import CallLogs, { type CallLog } from 'react-native-call-log';
import {
  addPendingCallAttempt,
  getAllPendingCalls,
  markPendingCallFilled,
  type PendingCall,
} from '@/features/tracking/db';
import {
  CALL_MATCH_WINDOW_MS,
  findMatchingOutgoingCall,
} from '@/features/tracking/lib/call-log-matcher';

const STALE_ROW_AGE_MS = 60 * 60 * 1000;
const MAX_JANITOR_ATTEMPTS = 5;
const GIVE_UP_DURATION_SECONDS = 0;
const READ_CALL_LOG_PERMISSION: Permission =
  PermissionsAndroid.PERMISSIONS.READ_CALL_LOG;

let isJanitorSweepRunning = false;

function getIntentTimeMs(pendingCall: PendingCall): number {
  const intentTimeMs = new Date(pendingCall.intentAt).getTime();
  return intentTimeMs;
}

function isStaleUnfilledPendingCall(
  pendingCall: PendingCall,
  nowMs: number,
): boolean {
  if (pendingCall.durationSeconds !== null) {
    return false;
  }
  const intentTimeMs = getIntentTimeMs(pendingCall);
  if (Number.isNaN(intentTimeMs)) {
    return true;
  }
  return nowMs - intentTimeMs >= STALE_ROW_AGE_MS;
}

function getOldestIntentTimeMs(stalePendingCalls: PendingCall[]): number {
  const validIntentTimes = stalePendingCalls
    .map(pendingCall => getIntentTimeMs(pendingCall))
    .filter(intentTimeMs => !Number.isNaN(intentTimeMs));
  if (validIntentTimes.length === 0) {
    return Date.now();
  }
  const oldestIntentTimeMs = Math.min(...validIntentTimes);
  return oldestIntentTimeMs;
}

async function loadCallLogEntriesWithinWindow(
  oldestIntentAtMs: number,
  nowMs: number,
): Promise<CallLog[] | null> {
  try {
    const callLogEntries = await CallLogs.load(-1, {
      minTimestamp: oldestIntentAtMs - CALL_MATCH_WINDOW_MS,
      maxTimestamp: nowMs,
    });
    return callLogEntries;
  } catch (loadError: unknown) {
    console.warn('Could not read the call log for the janitor.', loadError);
    return null;
  }
}

function toDialedAtIso(entryTimestampMs: string): string {
  const dialedAtIso = new Date(Number(entryTimestampMs)).toISOString();
  return dialedAtIso;
}

function removeMatchedEntry(
  remainingEntries: CallLog[],
  matchedEntry: CallLog,
): void {
  const matchedEntryIndex = remainingEntries.indexOf(matchedEntry);
  if (matchedEntryIndex !== -1) {
    remainingEntries.splice(matchedEntryIndex, 1);
  }
}

async function processStalePendingCall(
  stalePendingCall: PendingCall,
  remainingEntries: CallLog[],
): Promise<void> {
  const matchedEntry = findMatchingOutgoingCall(
    stalePendingCall.phoneNumber,
    getIntentTimeMs(stalePendingCall),
    remainingEntries,
  );

  if (matchedEntry !== null) {
    removeMatchedEntry(remainingEntries, matchedEntry);
    await markPendingCallFilled(
      stalePendingCall.callId,
      toDialedAtIso(matchedEntry.timestamp),
      matchedEntry.duration,
    );
    return;
  }

  const attemptCount = await addPendingCallAttempt(stalePendingCall.callId);
  if (attemptCount >= MAX_JANITOR_ATTEMPTS) {
    await markPendingCallFilled(
      stalePendingCall.callId,
      stalePendingCall.intentAt,
      GIVE_UP_DURATION_SECONDS,
    );
  }
}

async function sweepStalePendingCalls(): Promise<void> {
  const isCallLogReadable = await PermissionsAndroid.check(
    READ_CALL_LOG_PERMISSION,
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

  const oldestIntentAtMs = getOldestIntentTimeMs(stalePendingCalls);
  const callLogEntries = await loadCallLogEntriesWithinWindow(
    oldestIntentAtMs,
    nowMs,
  );
  if (callLogEntries === null) {
    return;
  }

  const remainingEntries = [...callLogEntries];
  for (const stalePendingCall of stalePendingCalls) {
    await processStalePendingCall(stalePendingCall, remainingEntries);
  }
}

export async function runJanitorSweep(): Promise<void> {
  if (isJanitorSweepRunning) {
    return;
  }
  isJanitorSweepRunning = true;
  try {
    await sweepStalePendingCalls();
  } finally {
    isJanitorSweepRunning = false;
  }
}

export function useJanitor(): void {
  useEffect(() => {
    runJanitorSweep();
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (nextAppState === 'active') {
        runJanitorSweep();
      }
    };
    const stateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => stateSubscription.remove();
  }, []);
}
