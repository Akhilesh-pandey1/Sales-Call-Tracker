import { apiClient } from '@/shared/api/api-client';
import type { CallOutcome } from '../types';

export type SyncCall = {
  call_id: string;
  phone_number: string;
  dialed_at: string;
  duration_seconds: number;
  outcome?: CallOutcome;
};

async function syncCalls(calls: SyncCall[]): Promise<void> {
  await apiClient.post('/calls/sync', { calls });
}

export { syncCalls };
