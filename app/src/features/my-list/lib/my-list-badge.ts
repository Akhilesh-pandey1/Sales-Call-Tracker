import type { MyListNumberStatus } from '@/features/tracking';
import type { MyListBadge } from '../types';

export function deriveMyListBadge(
  status: MyListNumberStatus,
  isInterested: boolean,
  isDoNotCall: boolean,
  calledDurationSeconds: number | null,
): MyListBadge {
  if (status === 'left') {
    return 'Left';
  }
  if (isDoNotCall) {
    return 'Do not call';
  }
  if (isInterested) {
    return 'Interested';
  }
  const connectedDurationFloorSeconds = 0;
  const isRecordedCallNotConnected =
    calledDurationSeconds !== null &&
    calledDurationSeconds <= connectedDurationFloorSeconds;
  if (isRecordedCallNotConnected) {
    const notConnectedBadge: MyListBadge = 'Not connected';
    return notConnectedBadge;
  }
  const connectedBadge: MyListBadge = 'Connected';
  return connectedBadge;
}
