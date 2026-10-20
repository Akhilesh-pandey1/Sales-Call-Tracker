import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { syncCalls, type SyncCall } from '../api/calls.api';
import { deletePendingCall, getAllPendingCalls } from '../db';
import { toSyncCallOrNull } from '../lib/sync-call';
import { runJanitorSweep } from './use-janitor';

let runningSync: Promise<void> | null = null;

async function deleteSentPendingCalls(sentCallIds: string[]): Promise<void> {
  for (const sentCallId of sentCallIds) {
    await deletePendingCall(sentCallId);
  }
}

async function sendFilledPendingCalls(): Promise<void> {
  const pendingCalls = await getAllPendingCalls();
  const syncCallList = pendingCalls
    .map(pendingCall => toSyncCallOrNull(pendingCall))
    .filter((syncCall): syncCall is SyncCall => syncCall !== null);
  if (syncCallList.length === 0) {
    return;
  }
  await syncCalls(syncCallList);
  const sentCallIds = syncCallList.map(syncCall => syncCall.call_id);
  await deleteSentPendingCalls(sentCallIds);
}

function warnAboutFailedSync(syncError: unknown): void {
  console.warn('Queued calls stay on the phone until the server is reachable.', syncError);
}

function syncPendingCalls(): Promise<void> {
  if (runningSync !== null) {
    return runningSync;
  }
  const syncPromise = sendFilledPendingCalls().finally(() => {
    runningSync = null;
  });
  runningSync = syncPromise;
  return syncPromise;
}

async function runJanitorThenSync(): Promise<void> {
  await runJanitorSweep();
  await syncPendingCalls();
}

export async function syncPendingCallsSafely(): Promise<void> {
  try {
    await runJanitorThenSync();
  } catch (syncError: unknown) {
    warnAboutFailedSync(syncError);
  }
}

export function useSync(): void {
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (nextAppState !== 'active') {
        return;
      }
      syncPendingCallsSafely();
    };
    syncPendingCallsSafely();
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      appStateSubscription.remove();
    };
  }, []);
}
