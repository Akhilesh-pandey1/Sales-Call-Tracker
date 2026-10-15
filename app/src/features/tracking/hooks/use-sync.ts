import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { syncCalls, type SyncCall } from '../api/calls.api';
import { deletePendingCall, getAllPendingCalls, type PendingCall } from '../db';
import { subscribeToCallFilled } from '../sync-events';
import { runJanitorSweep } from './use-janitor';

let isSyncRunning = false;

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

async function syncPendingCalls(): Promise<void> {
  if (isSyncRunning) {
    return;
  }
  isSyncRunning = true;
  try {
    await sendFilledPendingCalls();
  } catch (syncError: unknown) {
    console.warn('Queued calls stay on the phone until the server is reachable.', syncError);
  } finally {
    isSyncRunning = false;
  }
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
