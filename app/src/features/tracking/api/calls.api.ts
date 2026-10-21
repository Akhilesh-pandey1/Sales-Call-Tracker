import { apiClient } from '@/shared/api/api-client';
import type { CallDirection } from '../types';

export type SyncCall = {
  call_id: string;
  phone_number: string;
  dialed_at: string;
  duration_seconds: number;
  direction: CallDirection;
  scheduled_at?: string;
};

export type SyncCallsResponse = {
  status: boolean;
  schedule_refused_call_ids: string[];
};

async function syncCalls(calls: SyncCall[]): Promise<SyncCallsResponse> {
  const syncResponse = await apiClient.post<SyncCallsResponse>('/calls/sync', { calls });
  const syncResponseBody = syncResponse.data;
  return syncResponseBody;
}

export { syncCalls };
