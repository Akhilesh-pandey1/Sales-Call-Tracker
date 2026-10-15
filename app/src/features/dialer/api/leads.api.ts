import { apiClient } from '@/shared/api/api-client';

export type ServedLead = {
  id: number;
  phone_number: string;
  attempt_count: number;
  is_scheduled: boolean;
};

export type LeadScheduleRequest = {
  lead_id: number;
  scheduled_at: string;
};

type NextLeadResponseBody = {
  status: boolean;
  lead: ServedLead | null;
};

function isServedLead(value: unknown): value is ServedLead {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const leadRecord = value as Record<string, unknown>;
  const hasLeadShape =
    typeof leadRecord.id === 'number' &&
    typeof leadRecord.phone_number === 'string' &&
    typeof leadRecord.attempt_count === 'number' &&
    typeof leadRecord.is_scheduled === 'boolean';
  return hasLeadShape;
}

async function fetchNextLead(
  schedule: LeadScheduleRequest | null,
): Promise<ServedLead | null> {
  const requestBody = schedule === null ? {} : { schedule };
  const response = await apiClient.post<NextLeadResponseBody>(
    '/leads/next',
    requestBody,
  );
  const rawLead: unknown = response.data.lead;
  if (rawLead === null) {
    const noLeadAvailable = null;
    return noLeadAvailable;
  }
  if (!isServedLead(rawLead)) {
    throw new Error('Next-lead response has an unexpected shape.');
  }
  const servedLead: ServedLead = rawLead;
  return servedLead;
}

export { fetchNextLead };
