import { useEffect } from 'react';
import {
  AppState,
  PermissionsAndroid,
  type AppStateStatus,
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
const MIN_MS_BETWEEN_SWEEPS = 5_000;

let isJanitorSweepRunning = false;
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
  return nowMs - intentTimeMs >= STALE_ROW_AGE_MS;
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

function toDialedAtIso(entryTimestampMs: string): string | null {
  const dialedAtMs = Number(entryTimestampMs);
  if (!Number.isFinite(dialedAtMs)) {
    return null;
  }
  const dialedAtIso = new Date(dialedAtMs).toISOString();
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
    getIntentTimeMs(stalePendingCall.intentAt),
    remainingEntries,
  );

  if (matchedEntry !== null) {
    const dialedAtIso = toDialedAtIso(matchedEntry.timestamp);
    if (dialedAtIso !== null) {
      removeMatchedEntry(remainingEntries, matchedEntry);
      await markPendingCallFilled(
        stalePendingCall.callId,
        dialedAtIso,
        matchedEntry.duration,
      );
      return;
    }
  }

  const attemptCount = await addPendingCallAttempt(stalePendingCall.callId);
  if (attemptCount >= MAX_JANITOR_ATTEMPTS) {
    const giveUpDurationSeconds = 0;
    await markPendingCallFilled(
      stalePendingCall.callId,
      stalePendingCall.intentAt,
      giveUpDurationSeconds,
    );
  }
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
    try {
      await processStalePendingCall(stalePendingCall, remainingEntries);
    } catch (processingError: unknown) {
      console.warn('Could not complete a stale queued call.', processingError);
    }
  }
}

export async function runJanitorSweep(): Promise<void> {
  const nowMs = Date.now();
  const isTooSoonAfterLastSweep =
    nowMs - lastSweepStartedAtMs < MIN_MS_BETWEEN_SWEEPS;
  if (isJanitorSweepRunning || isTooSoonAfterLastSweep) {
    return;
  }
  lastSweepStartedAtMs = nowMs;
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
