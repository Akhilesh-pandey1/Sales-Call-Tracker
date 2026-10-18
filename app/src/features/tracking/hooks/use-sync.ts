import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { syncCalls, updateCallOutcome, type SyncCall } from '../api/calls.api';
import {
  deletePendingCall,
  getAllPendingCalls,
  updatePendingCallOutcome,
  type PendingCall,
} from '../db';
import type { CallOutcome } from '../types';
import { subscribeToCallFilled } from '../sync-events';
import { runJanitorSweep } from './use-janitor';

let runningSync: Promise<void> | null = null;

function toSyncCallOrNull(pendingCall: PendingCall): SyncCall | null {
  if (pendingCall.dialedAt === null || pendingCall.durationSeconds === null) {
    return null;
  }
  const syncCall: SyncCall = {
    call_id: pendingCall.callId,
    phone_number: pendingCall.phoneNumber,
    dialed_at: pendingCall.dialedAt,
    duration_seconds: pendingCall.durationSeconds,
  };
  if (pendingCall.outcome !== null) {
    syncCall.outcome = pendingCall.outcome;
  }
  return syncCall;
}

async function deleteSentPendingCalls(sentCallIds: string[]): Promise<void> {
  for (const sentCallId of sentCallIds) {
    await deletePendingCall(sentCallId);
  }
}

async function sendFilledPendingCalls(): Promise<void> {
  const pendingCalls = await getAllPendingCalls();
  const syncCallList = pendingCalls
    .map(toSyncCallOrNull)
    .filter((syncCall): syncCall is SyncCall => syncCall !== null);
  if (syncCallList.length === 0) {
    return;
  }
  await syncCalls(syncCallList);
  const sentCallIds = syncCallList.map(syncCall => syncCall.call_id);
  await deleteSentPendingCalls(sentCallIds);
}

async function sendFilledPendingCallsSafely(): Promise<void> {
  try {
    await sendFilledPendingCalls();
  } catch (syncError: unknown) {
    console.warn('Queued calls stay on the phone until the server is reachable.', syncError);
  }
}

function syncPendingCalls(): Promise<void> {
  if (runningSync !== null) {
    return runningSync;
  }
  const syncPromise = sendFilledPendingCallsSafely().then(() => {
    runningSync = null;
  });
  runningSync = syncPromise;
  return syncPromise;
}

export async function recordCallOutcome(
  callId: string,
  outcome: CallOutcome,
): Promise<void> {
  const didStoreOnPendingRow = await updatePendingCallOutcome(callId, outcome);
  if (!didStoreOnPendingRow) {
    await updateCallOutcome(callId, outcome);
    return;
  }
  const runningPromise = runningSync;
  if (runningPromise !== null) {
    await runningPromise;
  }
  const didSurviveRunningSync = await updatePendingCallOutcome(callId, outcome);
  if (!didSurviveRunningSync) {
    await updateCallOutcome(callId, outcome);
    return;
  }
  syncPendingCalls();
}

async function runJanitorThenSync(): Promise<void> {
  await runJanitorSweep();
  await syncPendingCalls();
}

export function useSync(): void {
  useEffect(() => {
    const handleCallFilled = (): void => {
      syncPendingCalls();
    };
    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (nextAppState !== 'active') {
        return;
      }
      runJanitorThenSync();
    };
    runJanitorThenSync();
    const unsubscribeFromCallFilled = subscribeToCallFilled(handleCallFilled);
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      unsubscribeFromCallFilled();
      appStateSubscription.remove();
    };
  }, []);
}
