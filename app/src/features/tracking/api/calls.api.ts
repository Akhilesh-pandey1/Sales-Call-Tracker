import { apiClient } from '@/shared/api/api-client';

export type SyncCall = {
  call_id: string;
  phone_number: string;
  dialed_at: string;
  duration_seconds: number;
};

async function syncCalls(calls: SyncCall[]): Promise<void> {
  await apiClient.post('/calls/sync', { calls });
}

export { syncCalls };
