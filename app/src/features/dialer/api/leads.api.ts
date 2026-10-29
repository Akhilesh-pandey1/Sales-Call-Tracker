import { apiClient } from '@/shared/api/api-client';

export type ServedLead = {
  id: number;
  phone_number: string;
  attempt_count: number;
  is_scheduled: boolean;
  notes?: string | null;
};

export type LeadScheduleRequest = {
  lead_id: number;
  scheduled_at: string;
};

type NextLeadRequestBody = {
  continue_calling: boolean;
  schedule?: LeadScheduleRequest;
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

function buildNextLeadRequestBody(
  schedule: LeadScheduleRequest | null,
  continueCalling: boolean,
): NextLeadRequestBody {
  const requestBody: NextLeadRequestBody = { continue_calling: continueCalling };
  if (schedule !== null) {
    requestBody.schedule = schedule;
  }
  return requestBody;
}

async function fetchNextLead(
  schedule: LeadScheduleRequest | null,
  continueCalling: boolean,
): Promise<ServedLead | null> {
  const requestBody = buildNextLeadRequestBody(schedule, continueCalling);
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
