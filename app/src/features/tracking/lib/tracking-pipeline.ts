import { syncCalls, type SyncCall } from '../api/calls.api';
import { getUnsyncedPendingCalls, markPendingCallsSynced } from '../db';
import { runJanitorSweep } from './call-janitor';
import { runCallLogSweep } from './call-log-sweep';
import {
  rebuildBookedLeadReminders,
  removeHandledScheduledBookings,
} from './call-reminders';
import { deleteSyncedCallsBehindSweepLine } from './synced-call-cleanup';
import { toSyncCallOrNull } from './sync-call';

let runningPipeline: Promise<void> | null = null;

async function sendUnsyncedPendingCalls(): Promise<void> {
  const unsyncedPendingCalls = await getUnsyncedPendingCalls();
  const syncCallList = unsyncedPendingCalls
    .map(pendingCall => toSyncCallOrNull(pendingCall))
    .filter((syncCall): syncCall is SyncCall => syncCall !== null);
  if (syncCallList.length > 0) {
    await syncCalls(syncCallList);
    const sentCallIds = syncCallList.map(syncCall => syncCall.call_id);
    await markPendingCallsSynced(sentCallIds);
  }
  await deleteSyncedCallsBehindSweepLine();
}

async function runAppOpenTrackingPipeline(): Promise<void> {
  await runJanitorSweep();
  await runCallLogSweep();
  await removeHandledScheduledBookings(Date.now());
  await sendUnsyncedPendingCalls();
  await rebuildBookedLeadReminders();
}

function runTrackingPipelineOnce(): Promise<void> {
  if (runningPipeline !== null) {
    return runningPipeline;
  }
  const pipelinePromise = runAppOpenTrackingPipeline().finally(() => {
    runningPipeline = null;
  });
  runningPipeline = pipelinePromise;
  return pipelinePromise;
}

function warnAboutFailedPipeline(pipelineError: unknown): void {
  console.warn('Tracking retries on the next app open.', pipelineError);
}

export async function syncPendingCallsSafely(): Promise<void> {
  try {
    await runTrackingPipelineOnce();
  } catch (pipelineError: unknown) {
    warnAboutFailedPipeline(pipelineError);
  }
}
