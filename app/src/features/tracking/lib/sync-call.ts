import type { SyncCall } from '../api/calls.api';
import type { PendingCall } from '../db';

function toSyncCallOrNull(
  pendingCall: PendingCall,
  scheduledAt: string | null = null,
): SyncCall | null {
  if (pendingCall.dialedAt === null || pendingCall.durationSeconds === null) {
    const unfilledCall = null;
    return unfilledCall;
  }
  const syncCall: SyncCall = {
    call_id: pendingCall.callId,
    phone_number: pendingCall.phoneNumber,
    dialed_at: pendingCall.dialedAt,
    duration_seconds: pendingCall.durationSeconds,
    direction: pendingCall.direction,
    interested: pendingCall.interested,
    do_not_call: pendingCall.doNotCall,
  };
  if (scheduledAt !== null) {
    syncCall.scheduled_at = scheduledAt;
  }
  const noteText = pendingCall.notes;
  if (noteText !== null && noteText !== '') {
    syncCall.notes = noteText;
  }
  return syncCall;
}

export { toSyncCallOrNull };
