import type { MyListNumberStatus } from '@/features/tracking';
import type { MyListBadge } from '../types';

export function deriveMyListBadge(
  status: MyListNumberStatus,
  isInterested: boolean,
  isDoNotCall: boolean,
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
  return 'Connected';
}
